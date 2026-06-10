<script setup lang="ts">
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
        <a href="/Resume.pdf" target="_blank" rel="noopener">Resume ↗</a>
      </div>
    </div>
  </footer>
</template>
