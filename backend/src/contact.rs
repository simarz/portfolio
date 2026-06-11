//! Contact form endpoint.
//!
//! Validates an incoming message and appends it to `messages.jsonl` in the
//! configured data directory (one JSON object per line). This keeps the server
//! dependency-free while giving you a durable record of submissions. To email
//! yourself instead, swap `persist` for an SMTP/API call (see README).

use std::io::Write;

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct ContactForm {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub message: String,
}

#[derive(Debug, Serialize)]
struct StoredMessage<'a> {
    received_at: String,
    name: &'a str,
    email: &'a str,
    message: &'a str,
}

#[derive(Serialize)]
struct ApiError {
    error: String,
}

#[derive(Serialize)]
struct ApiOk {
    ok: bool,
}

/// POST /api/contact
pub async fn submit(
    State(state): State<AppState>,
    Json(form): Json<ContactForm>,
) -> Response {
    if let Err(msg) = validate(&form) {
        return (StatusCode::BAD_REQUEST, Json(ApiError { error: msg })).into_response();
    }

    let record = StoredMessage {
        received_at: chrono::Utc::now().to_rfc3339(),
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
    };

    match persist(&state, &record) {
        Ok(()) => {
            tracing::info!("contact message from {} <{}>", record.name, record.email);
            // Email is best-effort: the message is already saved to disk, so a
            // delivery failure shouldn't fail the request or lose the message.
            if let Err(e) =
                crate::email::notify(&state.email, record.name, record.email, record.message).await
            {
                tracing::error!("contact email failed (message was still saved): {e}");
            }
            (StatusCode::OK, Json(ApiOk { ok: true })).into_response()
        }
        Err(e) => {
            tracing::error!("failed to persist contact message: {e}");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiError {
                    error: "Could not save your message. Please try again later.".into(),
                }),
            )
                .into_response()
        }
    }
}

fn validate(form: &ContactForm) -> Result<(), String> {
    let name = form.name.trim();
    let email = form.email.trim();
    let message = form.message.trim();

    if name.is_empty() || email.is_empty() || message.is_empty() {
        return Err("Name, email, and message are all required.".into());
    }
    if name.len() > 120 {
        return Err("Name is too long.".into());
    }
    if email.len() > 200 || !looks_like_email(email) {
        return Err("Please enter a valid email address.".into());
    }
    if message.len() > 4000 {
        return Err("Message is too long (max 4000 characters).".into());
    }
    Ok(())
}

/// Deliberately lightweight check — full RFC 5322 validation isn't worth it for
/// a contact form. Requires a single `@` with non-empty parts and a dot in the
/// domain.
fn looks_like_email(email: &str) -> bool {
    let mut parts = email.split('@');
    match (parts.next(), parts.next(), parts.next()) {
        (Some(local), Some(domain), None) => {
            !local.is_empty() && domain.contains('.') && !domain.starts_with('.')
                && !domain.ends_with('.')
        }
        _ => false,
    }
}

fn persist(state: &AppState, record: &StoredMessage<'_>) -> std::io::Result<()> {
    std::fs::create_dir_all(&state.data_dir)?;
    let path = state.data_dir.join("messages.jsonl");
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)?;
    let line = serde_json::to_string(record)?;
    writeln!(file, "{line}")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn form(name: &str, email: &str, message: &str) -> ContactForm {
        ContactForm {
            name: name.into(),
            email: email.into(),
            message: message.into(),
        }
    }

    #[test]
    fn accepts_a_valid_message() {
        assert!(validate(&form("Ada", "ada@example.com", "Hello there!")).is_ok());
    }

    #[test]
    fn rejects_blank_fields() {
        assert!(validate(&form("", "ada@example.com", "hi")).is_err());
        assert!(validate(&form("Ada", "  ", "hi")).is_err());
        assert!(validate(&form("Ada", "ada@example.com", "")).is_err());
    }

    #[test]
    fn validates_email_shape() {
        assert!(looks_like_email("ada@example.com"));
        assert!(looks_like_email("a.b+c@sub.example.co.uk"));
        assert!(!looks_like_email("ada"));
        assert!(!looks_like_email("ada@localhost"));
        assert!(!looks_like_email("ada@@example.com"));
        assert!(!looks_like_email("@example.com"));
    }
}
