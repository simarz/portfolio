<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

withDefaults(defineProps<{ triggerClass?: string; placement?: 'down' | 'up' }>(), {
  triggerClass: '',
  placement: 'down',
})

const resumes = [
  { label: 'Website', detail: 'Agent · Website · Bot', file: 'Resume (Agent, Website, Bot, Availability).pdf' },
  { label: 'NBA', detail: 'Agent · NBA · Bot', file: 'Resume (Agent, NBA, Bot, Availability).pdf' },
]

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="rmenu" :class="`rmenu--${placement}`" :data-open="String(open)">
    <button
      type="button"
      :class="triggerClass"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      Resume <span class="rmenu__chev">▾</span>
    </button>
    <div v-show="open" class="rmenu__list" role="menu">
      <a
        v-for="r in resumes"
        :key="r.file"
        class="rmenu__item"
        role="menuitem"
        :href="encodeURI('/' + r.file)"
        target="_blank"
        rel="noopener"
        @click="open = false"
      >
        <span class="rmenu__label">{{ r.label }} ↗</span>
        <span class="rmenu__detail">{{ r.detail }}</span>
      </a>
    </div>
  </div>
</template>
