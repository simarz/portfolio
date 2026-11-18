<script setup lang="ts">
import ResumeMenu from './ResumeMenu.vue'
</script>

<template>
  <header class="nav">
    <div class="container nav__inner">
      <!-- A plain reload: replays the inbound from the top. -->
      <a href="/" class="nav__brand" aria-label="Gursimar Gill — replay intro">
        <b>GG</b><span class="caret"></span>
      </a>
      <ResumeMenu trigger-class="nav__resume" />
    </div>
  </header>
</template>
