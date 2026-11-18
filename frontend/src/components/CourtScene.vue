<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Court, Page, State } from '../court/scene'

const emit = defineEmits<{ open: [page: Page]; fail: [] }>()

const host = ref<HTMLElement>()
const state = ref<State>('loading')
const progress = ref(0)
let court: Court | undefined
let gone = false

onMounted(async () => {
  // Lazy: three.js is the heavy chunk, so the shell and loading hint paint first.
  const { createCourt } = await import('../court/scene')
  if (gone) return
  court = createCourt(host.value!, {
    onState: (s) => (state.value = s),
    onProgress: (p) => (progress.value = p),
    onOpen: (p) => emit('open', p),
    onFail: () => emit('fail'),
  })
})
onUnmounted(() => {
  gone = true
  court?.dispose()
})

defineExpose({ reset: () => court?.reset() })
</script>

<template>
  <div ref="host" class="court">
    <div class="court__hint" aria-live="polite">
      <span v-if="state === 'loading'">Loading the gym… {{ Math.round(progress * 100) }}%</span>
      <span v-else-if="state === 'intro'">Dead ball. You're inbounding…</span>
      <button v-else-if="state === 'ready'" type="button" @click="court?.slap()">
        Slap the ball to call the play <kbd>click / space</kbd>
      </button>
      <span v-else-if="state === 'play'">Pick a teammate. Every pass opens a page.</span>
    </div>
  </div>
</template>
