<script setup lang="ts">
// Static about content.
</script>

<template>
  <section class="section section--first" id="about">
    <div class="container">
      <div class="shead reveal">
        <span class="shead__index">01</span>
        <h2 class="shead__title">A bit about me</h2>
        <span class="shead__rule"></span>
      </div>

      <div class="about__grid">
        <div class="about__text reveal">
          <p class="about__p">
            I'm a Computer Science student at <b>Stony Brook University</b>
            <span class="hl">(GPA 3.84, graduating December 2028)</span> who likes turning
            messy, manual workflows into clean, reliable software.
          </p>
          <p class="about__p">
            Most recently I helped rebuild <b>Blackfacts.com/news</b> as part of a 3-person team
            at <b>RFCUNY</b> — owning React components on the front end and Python services on the
            back end for an article database of <b>over a million records</b>.
          </p>
          <p class="about__p">
            Outside of class I ship side projects: a serverless Gmail follow-up agent on Azure and
            a Discord bot running in 200+ communities. I'm currently working through the
            <b>Deep Learning Specialization</b>.
          </p>

          <div class="about__actions">
            <a class="btn btn--primary" href="#projects">View my work <span class="arr">→</span></a>
            <a class="btn" href="#contact">Get in touch</a>
          </div>
        </div>

        <aside class="edu reveal">
          <p class="edu__tag">Education</p>
          <h3 class="edu__school">Stony Brook University</h3>
          <p class="edu__degree">B.S. in Computer Science</p>
          <div class="edu__meta">
            <span>Expected Dec 2028</span>
            <span>GPA <b>3.84 / 4.0</b></span>
          </div>
          <div class="edu__courses">
            <span class="tag">Calculus I &amp; II</span>
            <span class="tag">Software &amp; Analysis I</span>
            <span class="tag">Discrete Structures</span>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
