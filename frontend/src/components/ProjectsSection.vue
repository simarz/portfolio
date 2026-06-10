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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-6-6-6" /><path d="M12 19h8" /></svg>
            </div>
            <div class="card__links">
              <a class="card__link" href="#" title="Repository coming soon" aria-label="GitHub repository (coming soon)" @click.prevent>GitHub ↗</a>
              <span class="card__idx">PROJ_01</span>
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
              <a class="card__link" href="#" title="Repository coming soon" aria-label="GitHub repository (coming soon)" @click.prevent>GitHub ↗</a>
              <span class="card__idx">PROJ_02</span>
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
