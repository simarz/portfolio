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
            <p class="xp__period">Sep 2026 — Dec 2026</p>
            <p class="xp__loc">Atlanta, GA (remote)</p>
            <p class="xp__company">Waresport <span class="badge">Internship</span></p>
          </div>
          <div class="xp__body">
            <h3 class="xp__role">AI Product Engineer Intern <span>· Waresport</span></h3>
            <ul class="xp__points">
              <li>Build AI-powered automations for club onboarding and operations workflows, designing and testing multi-step LLM prompt chains against real club scenarios to reduce manual processing work.</li>
              <li>Redesign the organization website-builder in the admin panel, restructuring the publishing flow around plain-language controls for non-technical users, primarily athletic directors.</li>
              <li>Prototype AI features for founder review, scoping use cases directly with the founder and building working demos to evaluate feasibility before committing to a roadmap.</li>
              <li>Document prompt patterns and automation workflows in an internal playbook so recurring processes can be run without engineering support.</li>
            </ul>
          </div>
        </article>

        <article class="xp reveal">
          <div class="xp__aside">
            <p class="xp__period">Mar 2026 — May 2026</p>
            <p class="xp__loc">New York, NY</p>
            <p class="xp__company">RFCUNY <span class="badge">Internship</span></p>
          </div>
          <div class="xp__body">
            <h3 class="xp__role">Software Engineer Intern <span>· RFCUNY</span></h3>
            <ul class="xp__points">
              <li>Built a modernized full-stack rebuild of Blackfacts.com as 1 of a 3-person team, owning both React.js front-end and Python back-end development</li>
              <li>Built 15 reusable React.js UI components styled with SCSS, standardizing the interface across 3 pages.</li>
              <li>Developed Python back-end services for article ingestion, transcription, translation, and classification across a database of 1M+ articles.</li>
              <li>Designed and tested REST/JSON API endpoints and webhooks reliably serving article data to the front-end.</li>
              <li>Wrote unit and integration tests and contributed to CI/CD workflows via GitHub.</li>
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
              <li>Delivered 70% of guest pick-up orders in under three minutes during high-volume shifts, meeting the store's service target.</li>
              <li>Trained 15 new team members on register operation and order fulfillment, getting them shift-ready in 1 day.</li>
              <li>Processed 75+ daily transactions on cash register and POS systems with zero till discrepancies.</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
