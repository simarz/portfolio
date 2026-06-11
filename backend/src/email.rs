//! Email notifications for contact submissions, via the Resend API.
//!
//! Email is optional: when `RESEND_API_KEY` is unset, [`notify`] is a no-op and
//! messages are only saved to disk. This keeps local dev working without any
//! credentials. The blocking HTTP call runs on a blocking thread so it never
//! stalls the async runtime.
//!
//! Config (env vars):
//!   RESEND_API_KEY — Resend API key; enables email when present
//!   CONTACT_TO     — recipient (default: gursimargill1@gmail.com)
//!   CONTACT_FROM   — sender    (default: Resend's onboarding test sender)

use serde_json::json;

#[derive(Clone)]
pub struct EmailConfig {
    /// When `None`, email sending is disabled.
    pub api_key: Option<String>,
    pub to: String,
    pub from: String,
}

impl EmailConfig {
    pub fn from_env() -> Self {
        Self {
            api_key: std::env::var("RESEND_API_KEY").ok().filter(|k| !k.is_empty()),
            to: std::env::var("CONTACT_TO").unwrap_or_else(|_| "gursimargill1@gmail.com".into()),
            from: std::env::var("CONTACT_FROM")
                .unwrap_or_else(|_| "Portfolio Contact <onboarding@resend.dev>".into()),
        }
    }

    pub fn enabled(&self) -> bool {
        self.api_key.is_some()
    }
}

/// Emails a contact submission to the configured recipient, with the visitor's
/// address as `reply_to` so replies go straight to them. No-op (returns `Ok`)
/// when email is disabled.
pub async fn notify(
    cfg: &EmailConfig,
    name: &str,
    email: &str,
    message: &str,
) -> Result<(), String> {
    let Some(key) = cfg.api_key.clone() else {
        return Ok(());
    };

    let from = cfg.from.clone();
    let to = cfg.to.clone();
    let reply_to = email.to_string();
    let subject = format!("Portfolio contact from {name}");
    let body = format!(
        "New message from your portfolio contact form:\n\n\
         Name:  {name}\n\
         Email: {email}\n\n\
         {message}\n"
    );

    tokio::task::spawn_blocking(move || {
        let payload = json!({
            "from": from,
            "to": [to],
            "reply_to": reply_to,
            "subject": subject,
            "text": body,
        });
        match ureq::post("https://api.resend.com/emails")
            .set("Authorization", &format!("Bearer {key}"))
            .send_json(payload)
        {
            Ok(_) => Ok(()),
            Err(ureq::Error::Status(code, resp)) => Err(format!(
                "Resend returned {code}: {}",
                resp.into_string().unwrap_or_default()
            )),
            Err(e) => Err(e.to_string()),
        }
    })
    .await
    .map_err(|e| format!("email task panicked: {e}"))?
}
