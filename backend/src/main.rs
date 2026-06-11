//! Portfolio backend.
//!
//! A single Axum server that:
//!   * serves the built Vue SPA from `STATIC_DIR` (default `./static`), with
//!     SPA fallback to `index.html` so client-side paths work, and
//!   * exposes a small JSON API under `/api` — currently a contact endpoint
//!     that validates and persists incoming messages.
//!
//! Configuration (all optional, via environment variables):
//!   PORT       — port to bind            (default: 8080)
//!   STATIC_DIR — built frontend location (default: static)
//!   DATA_DIR   — where messages are saved (default: data)

mod contact;
mod email;

use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;

use axum::Router;
use axum::body::Body;
use axum::extract::{Request, State};
use axum::http::{StatusCode, header};
use axum::response::{Html, IntoResponse, Response};
use axum::routing::{get, post};
use tower::ServiceExt; // for ServeDir::oneshot
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[derive(Clone)]
pub struct AppState {
    /// Directory where contact messages are appended (as JSON lines).
    pub data_dir: PathBuf,
    /// Directory holding the built frontend.
    pub static_dir: PathBuf,
    /// The SPA shell (index.html), held in memory for the fallback route.
    pub index_html: Arc<str>,
    /// Email-notification settings for contact submissions.
    pub email: email::EmailConfig,
}

#[tokio::main]
async fn main() {
    // Default to `info` logging unless RUST_LOG overrides it.
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let static_dir = PathBuf::from(std::env::var("STATIC_DIR").unwrap_or_else(|_| "static".into()));
    let data_dir = PathBuf::from(std::env::var("DATA_DIR").unwrap_or_else(|_| "data".into()));

    if let Err(e) = std::fs::create_dir_all(&data_dir) {
        tracing::warn!("could not create data dir {}: {e}", data_dir.display());
    }

    // Read index.html once at startup so the SPA fallback can return it for any
    // client-side route (deep links, refreshes) with a 200.
    let index_path = static_dir.join("index.html");
    let index_html: Arc<str> = std::fs::read_to_string(&index_path)
        .unwrap_or_else(|e| {
            tracing::warn!(
                "could not read {}: {e} — run `npm run build` in /frontend first",
                index_path.display()
            );
            "<h1>Frontend not built</h1><p>Run <code>npm run build</code> in /frontend.</p>".into()
        })
        .into();

    let email_cfg = email::EmailConfig::from_env();
    if email_cfg.enabled() {
        tracing::info!("contact email enabled → {}", email_cfg.to);
    } else {
        tracing::info!("contact email disabled (set RESEND_API_KEY to enable); messages saved to file only");
    }

    let state = AppState {
        data_dir,
        static_dir,
        index_html,
        email: email_cfg,
    };

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/contact", post(contact::submit))
        // Everything else: try to serve a real static file, otherwise hand back
        // the SPA shell so Vue Router-style client paths and refreshes work.
        .fallback(spa_fallback)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| panic!("failed to bind {addr}: {e}"));

    tracing::info!("portfolio server listening on http://{addr}");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server error");
}

async fn health() -> &'static str {
    "ok"
}

/// Serves a real file from the static dir if one matches the request path;
/// otherwise returns the SPA shell (index.html) with a 200 so client-side
/// routing and page refreshes work.
async fn spa_fallback(State(state): State<AppState>, req: Request) -> Response {
    // ServeDir is cheap to construct (it just holds the root path).
    let serve = ServeDir::new(&state.static_dir);
    match serve.oneshot(req).await {
        Ok(res) if res.status() != StatusCode::NOT_FOUND => res.map(Body::new).into_response(),
        _ => (
            [(header::CACHE_CONTROL, "no-cache")],
            Html(state.index_html.to_string()),
        )
            .into_response(),
    }
}

/// Resolves when the process receives Ctrl-C, allowing in-flight requests to
/// finish before the server stops.
async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
    tracing::info!("shutdown signal received");
}
