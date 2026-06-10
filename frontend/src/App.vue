<script setup lang="ts">
import { onMounted } from 'vue'
import TheNav from './components/TheNav.vue'
import AboutSection from './components/AboutSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ContactSection from './components/ContactSection.vue'
import TheFooter from './components/TheFooter.vue'

// Scroll-reveal: fade/slide elements in as they enter the viewport. Child
// components have already mounted by the time App's onMounted runs, so every
// `.reveal` element is present in the DOM here.
onMounted(() => {
  const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!('IntersectionObserver' in window) || reduced) {
    reveals.forEach((el) => el.classList.add('in'))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )

  // Reveal anything already in the viewport synchronously so above-the-fold
  // content is never left hidden waiting on the observer's first callback.
  const vh = window.innerHeight || document.documentElement.clientHeight
  reveals.forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in')
    else io.observe(el)
  })
})
</script>

<template>
  <TheNav />
  <main id="top">
    <AboutSection />
    <ExperienceSection />
    <ProjectsSection />
    <SkillsSection />
    <ContactSection />
  </main>
  <TheFooter />
</template>
