# Portfolio Website

A personal portfolio for **Gursimar Gill** — a Vue 3 single-page frontend served by a
Rust ([Axum](https://github.com/tokio-rs/axum)) backend that also exposes a small JSON API
(a working contact form). The whole thing ships as **one Rust binary** plus a folder of
static assets.

```
Portfolio Website/
├── frontend/        # Vue 3 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/   # Hero, About, Experience, Projects, Skills, Contact, Nav, Footer
│   │   ├── data/         # portfolio.ts — edit this to change site content
│   │   └── styles/       # global theme (dark / minimal)
│   └── vite.config.ts    # builds into ../backend/static, proxies /api in dev
└── backend/         # Rust + Axum server
    ├── src/main.rs       # router, static serving, SPA fallback
    ├── src/contact.rs    # POST /api/contact — validate + persist
    ├── static/           # built frontend lands here (git-ignored)
    └── data/             # contact messages saved as messages.jsonl (git-ignored)
```

## Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.75+ (`rustup`). On Windows without Visual Studio, use the GNU toolchain:
  ```powershell
  rustup default stable-x86_64-pc-windows-gnu
  ```

## Editing your content

All site copy lives in [`frontend/src/data/portfolio.ts`](frontend/src/data/portfolio.ts) —
profile, about, experience, projects, and skills. Edit that one file; the components render
from it.

To make the **Resume** link work, drop your PDF at `frontend/public/Resume.pdf`
(it's served at `/Resume.pdf`).

## Development (two terminals)

Run the API and the Vite dev server side by side. Vite proxies `/api/*` to the backend,
so the contact form works with hot-reload.

```powershell
# Terminal 1 — backend (http://127.0.0.1:8080)
cd backend
cargo run

# Terminal 2 — frontend with hot reload (http://localhost:5173)
cd frontend
npm install   # first time only
npm run dev
```

Open **http://localhost:5173**.

## Production build & run (single server)

```powershell
# 1. Build the frontend → outputs into backend/static/
cd frontend
npm run build

# 2. Build & run the optimized server
cd ../backend
cargo run --release
```

Then open **http://localhost:8080** — the Rust server serves the SPA and the API together.

For a distributable binary: `cargo build --release` produces
`backend/target/release/portfolio-backend(.exe)`. Ship it alongside the `static/` folder.

## Configuration

The server reads these environment variables (all optional):

| Variable     | Default  | Purpose                              |
| ------------ | -------- | ------------------------------------ |
| `PORT`       | `8080`   | Port to bind                         |
| `STATIC_DIR` | `static` | Location of the built frontend       |
| `DATA_DIR`   | `data`   | Where contact messages are saved     |
| `RUST_LOG`   | `info`   | Log level (e.g. `debug`)             |

## The contact API

`POST /api/contact` with JSON `{ "name", "email", "message" }`. The server validates the
input and appends each message to `data/messages.jsonl` (one JSON object per line).
`GET /api/health` returns `ok`.

**Want the messages emailed to you instead?** Swap the `persist` call in
[`backend/src/contact.rs`](backend/src/contact.rs) for an SMTP send (e.g. the
[`lettre`](https://crates.io/crates/lettre) crate) or a transactional-email API call
(Resend, SendGrid). Keep credentials in environment variables.

## Tests

```powershell
cd backend
cargo test          # validation + email-shape unit tests
```

## Deploying

The app is a single binary + `static/` folder, so most hosts work:

- **Fly.io / Railway** — containerize with a small multi-stage Dockerfile (Node build stage
  for the frontend, Rust build stage for the server).
- **Shuttle** — Rust-native hosting.
- **A VPS** — copy the release binary and `static/`, run behind nginx/Caddy.

Set `PORT` to whatever the platform provides.
