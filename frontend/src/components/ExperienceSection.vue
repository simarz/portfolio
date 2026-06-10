<script setup lang="ts">
// Static experience content.
</script>

<template>
  <section class="section" id="experience">
    <div class="container">
      <div class="shead reveal">
        <span class="shead__index">02</span>
        <h2 class="shead__title">Where I've worked</h2>
        <span class="shead__rule"></span>
      </div>

      <div class="timeline">
        <article class="xp reveal">
          <div class="xp__aside">
            <p class="xp__period">Mar 2026 — May 2026</p>
            <p class="xp__loc">New York, NY</p>
            <p class="xp__company">RFCUNY <span class="badge">Internship</span></p>
          </div>
          <div class="xp__body">
            <h3 class="xp__role">Software Engineer Intern <span>· RFCUNY</span></h3>
            <ul class="xp__points">
              <li>Delivered a modernized full-stack rebuild of <b>Blackfacts.com/news</b> as one of a 3-person team, owning both React.js front-end and Python back-end work.</li>
              <li>Built <b>15 reusable React.js UI components</b> styled with SCSS, standardizing the interface across 3 pages.</li>
              <li>Developed Python back-end services for article ingestion, transcription, translation, and classification across a database of <b>1M+ articles</b>.</li>
              <li>Designed and tested <b>REST/JSON API endpoints and webhooks</b> reliably serving article data to the front-end.</li>
              <li>Wrote unit and integration tests and contributed to <b>CI/CD workflows</b> via GitHub.</li>
            </ul>
          </div>
        </article>

        <article class="xp reveal">
          <div class="xp__aside">
            <p class="xp__period">May 2023 — Present</p>
            <p class="xp__loc">Hicksville, NY</p>
            <p class="xp__company">Target Corp. <span class="badge">Part-time</span></p>
          </div>
          <div class="xp__body">
            <h3 class="xp__role">Front-of-Store Guest Advocate <span>· Target</span></h3>
            <ul class="xp__points">
              <li>Delivered <b>70% of guest pick-up orders in under three minutes</b> during high-volume shifts, meeting the store's service target.</li>
              <li>Trained <b>15 new team members</b> on register operation and order fulfillment, getting them shift-ready in 1 day.</li>
              <li>Processed <b>75+ daily transactions</b> on cash register and POS systems with zero till discrepancies.</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
