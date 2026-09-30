<script setup lang="ts">
import ResumeMenu from './ResumeMenu.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__credit">
        Built by <b>Gursimar Gill</b> · Rust (Axum) + Vue · {{ year }}
      </p>
      <div class="footer__links">
        <a href="https://linkedin.com/in/gursimargill" target="_blank" rel="noopener">LinkedIn ↗</a>
        <a href="mailto:gursimargill1@gmail.com">Email ↗</a>
        <ResumeMenu trigger-class="footer__resume" placement="up" />
      </div>
    </div>
  </footer>
</template>
