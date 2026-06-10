<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const links = [
  { n: '01', label: 'About', href: '#about' },
  { n: '02', label: 'Experience', href: '#experience' },
  { n: '03', label: 'Projects', href: '#projects' },
  { n: '04', label: 'Skills', href: '#skills' },
  { n: '05', label: 'Contact', href: '#contact' },
]

const scrolled = ref(false)
const open = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': scrolled }" :data-open="String(open)">
    <div class="container nav__inner">
      <a href="#top" class="nav__brand" aria-label="Gursimar Gill — home">
        <b>GG</b><span class="caret"></span>
      </a>

      <nav class="nav__links" @click="open = false">
        <a v-for="l in links" :key="l.href" class="nav__link" :href="l.href">
          <i>{{ l.n }}</i>{{ l.label }}
        </a>
        <a class="nav__resume" href="/Resume.pdf" target="_blank" rel="noopener">Resume ↗</a>
      </nav>

      <button
        class="nav__toggle"
        aria-label="Toggle menu"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>
