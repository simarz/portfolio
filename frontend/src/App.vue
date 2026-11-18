<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Page } from './court/scene'
import TheNav from './components/TheNav.vue'
import CourtScene from './components/CourtScene.vue'
import AboutSection from './components/AboutSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ContactSection from './components/ContactSection.vue'
import TheFooter from './components/TheFooter.vue'

const pages = {
  about: AboutSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  contact: ContactSection,
}

const page = ref<Page | null>(null)
const failed = ref(false) // no WebGL / model failed: the panel becomes a plain tabbed site
const court = ref<InstanceType<typeof CourtScene>>()
const back = ref<HTMLButtonElement>()

function fail() {
  failed.value = true
  page.value = 'about'
}
function close() {
  if (failed.value) return
  page.value = null
  court.value?.reset()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && page.value) close()
}
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <TheNav />
  <CourtScene ref="court" @open="page = $event" @fail="fail" />
  <Transition name="panel" @after-enter="back?.focus()">
    <aside v-if="page" class="panel" :class="{ 'panel--full': failed }" role="dialog" :aria-label="page">
      <div class="panel__bar">
        <button v-if="!failed" ref="back" type="button" class="panel__back" @click="close">
          ← Back to the court <kbd>esc</kbd>
        </button>
        <template v-else>
          <span class="panel__note">3D court unavailable on this device.</span>
          <button
            v-for="(_, p) in pages"
            :key="p"
            type="button"
            class="panel__back"
            :aria-current="p === page ? 'page' : undefined"
            @click="page = p"
          >
            {{ p }}
          </button>
        </template>
      </div>
      <component :is="pages[page]" />
      <TheFooter />
    </aside>
  </Transition>
</template>
