<script setup lang="ts">
// Pointer glow: track the cursor's horizontal position as a percentage so the
// radial highlight on each card follows the mouse (matches the design).
function onMove(e: PointerEvent) {
  const card = e.currentTarget as HTMLElement
  const r = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
}
</script>

<template>
  <section class="section" id="projects">
    <div class="container">
      <div class="shead reveal">
        <span class="shead__index">03</span>
        <h2 class="shead__title">Things I've built</h2>
        <span class="shead__rule"></span>
      </div>

      <div class="projects__grid">

        <article class="card reveal" @pointermove="onMove">
          <div class="card__top">
            <div class="card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M3 12h18" /><path d="M5.64 5.64A12.7 12.7 0 0 1 12 12a12.7 12.7 0 0 1-6.36 6.36" /><path d="M18.36 5.64A12.7 12.7 0 0 0 12 12a12.7 12.7 0 0 0 6.36 6.36" /></svg>
            </div>
            <div class="card__links">
              <a class="card__link" href="https://github.com/simarz/HoopPulse" target="_blank" rel="noopener">GitHub ↗</a>
              <span class="card__idx">PROJ_04</span>
            </div>
          </div>
          <h3 class="card__title">HoopPulse</h3>
          <p class="card__tagline">A full-stack NBA analytics dashboard with live scores, player &amp; team stats, and data-backed betting prop picks.</p>
          <ul class="card__points">
            <li>Built a full-stack NBA analytics dashboard, a <b>React 19 + TypeScript</b> front end (Vite, TanStack Query, React Router) on a <b>Python (FastAPI)</b> back end. Serves live scoreboards, league-wide player/team stats, and betting prop recommendations.</li>
            <li>Engineered a <b>prop recommendation engine</b> that scores each player line by how often the player cleared it across their last 5 games, fanning out the per-player game-log lookups concurrently with <b>asyncio</b> and a bounded semaphore to stay within NBA API limits.</li>
            <li>Aggregates two live third-party feeds <b>stats.nba.com</b> (via <b>nba_api</b>) and <b>The Odds API</b> offloading their blocking calls to worker threads so they never stall the async event loop.</li>
            <li>Cut repeat latency with a <b>thread-safe, disk-backed cache</b> (atomic writes, per-resource TTLs) and <b>background cache-warming on startup</b>, so the first visitor after a restart still hits warm data.</li>
          </ul>
          <div class="card__stack">
            <span class="chip">Python</span><span class="chip">FastAPI</span><span class="chip">React 19</span><span class="chip">TypeScript</span><span class="chip">Vite</span><span class="chip">TanStack Query</span><span class="chip">NBA API</span>
          </div>
        </article>

        <article class="card reveal" @pointermove="onMove">
          <div class="card__top">
            <div class="card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M6.5 6.5h.01M9 6.5h.01" /></svg>
            </div>
            <div class="card__links">
              <a class="card__link" href="https://github.com/simarz/portfolio" target="_blank" rel="noopener">GitHub ↗</a>
              <span class="card__idx">PROJ_03</span>
            </div>
          </div>
          <h3 class="card__title">This Website</h3>
          <p class="card__tagline">A full-stack portfolio served as a single Rust binary, the site you're reading now.</p>
          <ul class="card__points">
            <li>Built a <b>Vue 3 + TypeScript</b> single-page front end and a <b>Rust (Axum)</b> back end that serves both the SPA and a JSON API from <b>one binary</b>.</li>
            <li>Implemented a working <b>contact form</b> with shared client/server validation that persists submissions on the server.</li>
            <li>Self-hosted on an <b>AWS EC2</b> free-tier instance behind <b>Caddy</b> with automatic HTTPS, fronted by Cloudflare DNS.</li>
            <li>Deploys as a single systemd service with a one-command build-and-restart update script.</li>
          </ul>
          <div class="card__stack">
            <span class="chip">Rust</span><span class="chip">Axum</span><span class="chip">Vue 3</span><span class="chip">TypeScript</span><span class="chip">Vite</span><span class="chip">AWS EC2</span><span class="chip">Caddy</span>
          </div>
        </article>
         <article class="card reveal" @pointermove="onMove">
          <div class="card__top">
            <div class="card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-6-6-6" /><path d="M12 19h8" /></svg>
            </div>
            <div class="card__links">
              <a class="card__link" href="https://github.com/simarz/founder-outreach-agent" target="_blank" rel="noopener">GitHub ↗</a>
              <span class="card__idx">PROJ_02</span>
            </div>
          </div>
          <h3 class="card__title">Founder Follow-up Agent</h3>
          <p class="card__tagline">A zero-touch daily agent that tracks outreach and follow-ups from your inbox.</p>
          <ul class="card__points">
            <li>Automated a manual outreach-tracking workflow into a <b>zero-touch daily process</b>, eliminating all manual logging of sent emails and follow-ups.</li>
            <li>Scans Gmail threads via the Gmail API, extracts contact and timestamp metadata, and persists state programmatically.</li>
            <li>Runs unattended in the cloud at <b>~$0 infra cost</b> (Azure free grant) via a timer-triggered serverless function with state in Blob Storage.</li>
            <li>Reply detection keys off the most recent sent message, auto-resetting the 7-day reminder window to avoid false flags.</li>
          </ul>
          <div class="card__stack">
            <span class="chip">Python</span><span class="chip">Azure Functions</span><span class="chip">Gmail API</span><span class="chip">OAuth 2.0</span><span class="chip">Blob Storage</span>
          </div>
        </article>
        <article class="card reveal" @pointermove="onMove">
          <div class="card__top">
            <div class="card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0M14 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /><path d="M7.5 16.5c4.5 1.5 7.5 0 9-.5" /><path d="M16 18a14 14 0 0 0 2.4-9 7 7 0 0 0-3.4-1.7l-.7 1.4a12 12 0 0 0-4.6 0L9 7.3A7 7 0 0 0 5.6 9 14 14 0 0 0 8 18l.9-1.3" /></svg>
            </div>
            <div class="card__links">
              <a class="card__link" href="#" title="GitHub not available" aria-label="GitHub not available" @click.prevent>GitHub not available</a>
              <span class="card__idx">PROJ_01</span>
            </div>
          </div>
          <h3 class="card__title">Discord Bot</h3>
          <p class="card__tagline">A moderation, entertainment, and polling bot running in 200+ communities.</p>
          <ul class="card__points">
            <li>Built a Python Discord bot used in <b>200+ communities</b> for moderation, entertainment, and polling — <b>verified by Discord</b>.</li>
          </ul>
          <div class="card__stack">
            <span class="chip">Python</span><span class="chip">discord.py</span><span class="chip">Git</span>
          </div>
        </article>

        
      </div>
    </div>
  </section>
</template>
