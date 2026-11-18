<script setup lang="ts">
const groups = [
  { label: 'Languages', items: ['Rust', 'C++', 'Python', 'Java', 'TypeScript', 'JavaScript', 'HTML', 'CSS'] },
  { label: 'Frameworks', items: ['React.js', 'Vue.js', 'Node.js', 'FastAPI', 'Axum', 'SCSS'] },
  {
    label: 'Tools & Tech',
    items: ['Claude AI', 'Git / GitHub', 'Microsoft Azure', 'AWS', 'Cloudflare', 'REST APIs', 'OpenAPI/Swagger'],
  },
]
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
            I'm Gursimar, a Computer Science student at Stony Brook University. 
          </p>
          <p class="about__p">
            Right now I'm an AI Product Engineer Intern< at Waresport, building
            LLM-powered automations for club onboarding and operations, plus internal tools and
            client-facing tools for the team and the clubs we work with.
          </p>
          <p class="about__p">
            Outside of class I ship side projects: a serverless Gmail follow-up agent on Azure and
            a Discord bot that ran in 200+ communities. 
          </p>
          <p class="about__p">
            I also love basketball, I try to play minimum once a week. My curiosity for solving problems stems from my love for video games.
          </p>
          <div class="quick_links">
          
          
        </div>
          <div class="about__actions">
            <a class="btn" href="https://linkedin.com/in/gursimargill" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a class="btn" href="https://github.com/simarz" target="_blank" rel="noopener">GitHub ↗</a>
            
          </div>
        </div>
        
        <aside class="spec" aria-hidden="true">
          <div class="spec__bar">
            <span class="spec__lights"><i></i><i></i><i></i></span>
            gursimar@portfolio: ~ $ whoami
          </div>
          <div class="spec__body">
            <div class="spec__row"><span class="spec__k">name</span><span class="spec__v">Gursimar Gill</span></div>
            <div class="spec__row"><span class="spec__k">school</span><span class="spec__v">Stony Brook University</span></div>
            <div class="spec__row"><span class="spec__k">focus</span><span class="spec__v">Full-stack · <span class="accent">AI/Machine Learning</span></span></div>
            <div class="spec__sep"></div>
            <div class="spec__row"><span class="spec__k">grad</span><span class="spec__v">Dec 2028 · GPA <span class="accent">3.84</span></span></div>
            <div class="spec__sep"></div>
            <div class="spec__row"><span class="spec__k">status</span><span class="spec__v spec__status"><span class="spec__dot"></span>Open to internships</span></div>
          </div>
        </aside>
      </div>

      <h3 class="about__sub reveal">Tools I work with</h3>
      <div class="skills__grid reveal">
        <div v-for="g in groups" :key="g.label" class="skillcol">
          <p class="skillcol__label">
            {{ g.label }} <i>// {{ String(g.items.length).padStart(2, '0') }}</i>
          </p>
          <div class="skillcol__items">
            <span v-for="item in g.items" :key="item" class="tag">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
