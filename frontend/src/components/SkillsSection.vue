<script setup lang="ts">
const groups = [
  { label: 'Languages', items: ['Rust', 'Python', 'TypeScript', 'JavaScript', 'C++', 'Java'] },
  { label: 'Frameworks', items: ['Vue.js', 'React.js', 'Axum', 'FastAPI', 'Node.js', 'discord.py'] },
  {
    label: 'Tools & Tech',
    items: ['Git / GitHub', 'REST APIs', 'OpenAPI/Swagger', 'LLM Integration', 'SCSS', 'Microsoft Azure'],
  },
]
</script>

<template>
  <section class="section" id="skills">
    <div class="container">
      <div class="shead reveal">
        <span class="shead__index">04</span>
        <h2 class="shead__title">Tools I work with</h2>
        <span class="shead__rule"></span>
      </div>

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
