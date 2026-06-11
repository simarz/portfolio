<script setup lang="ts">
import { reactive, ref } from 'vue'

type State = 'idle' | 'sending'

// `company` is a honeypot — hidden from real users; bots that fill it are
// silently dropped by the server.
const form = reactive({ name: '', email: '', message: '', company: '' })
const errors = reactive<{ name: string; email: string; message: string }>({
  name: '',
  email: '',
  message: '',
})
const state = ref<State>('idle')
const note = reactive<{ msg: string; kind: '' | 'ok' | 'err' }>({ msg: '', kind: '' })

function looksLikeEmail(email: string): boolean {
  const parts = email.split('@')
  if (parts.length !== 2) return false
  const [local, domain] = parts
  return (
    local.length > 0 &&
    domain.includes('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.')
  )
}

// Mirrors the backend validation rules so users get instant feedback.
function validate(): boolean {
  let ok = true

  if (!form.name) (errors.name = 'Name is required.'), (ok = false)
  else if (form.name.length > 120) (errors.name = 'Name is too long.'), (ok = false)
  else errors.name = ''

  if (!form.email) (errors.email = 'Email is required.'), (ok = false)
  else if (!looksLikeEmail(form.email)) (errors.email = 'Enter a valid email address.'), (ok = false)
  else errors.email = ''

  if (!form.message) (errors.message = 'Message is required.'), (ok = false)
  else if (form.message.length > 4000) (errors.message = 'Message is too long (max 4000).'), (ok = false)
  else errors.message = ''

  return ok
}

function clearError(field: keyof typeof errors) {
  errors[field] = ''
}

async function submit() {
  if (state.value === 'sending') return
  note.msg = ''
  note.kind = ''

  // Trim before validating/sending.
  form.name = form.name.trim()
  form.email = form.email.trim()
  form.message = form.message.trim()

  if (!validate()) {
    note.msg = 'Please fix the fields above.'
    note.kind = 'err'
    return
  }

  state.value = 'sending'
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `Request failed (${res.status})`)
    }
    form.name = ''
    form.email = ''
    form.message = ''
    note.msg = '✓ Thanks — your message was sent. I’ll get back to you soon.'
    note.kind = 'ok'
  } catch (err) {
    note.msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
    note.kind = 'err'
  } finally {
    state.value = 'idle'
  }
}
</script>

<template>
  <section class="section" id="contact">
    <div class="container">
      <div class="shead reveal">
        <span class="shead__index">05</span>
        <h2 class="shead__title">Get in touch</h2>
        <span class="shead__rule"></span>
      </div>

      <div class="contact__grid">
        <div class="contact__intro reveal">
          <p class="contact__lead">
            I'm always open to interesting projects, internships, and conversations. Drop me a
            message or reach me directly at
            <a href="mailto:gursimargill1@gmail.com">gursimargill1@gmail.com</a>.
          </p>
          <div class="contact__direct">
            <a href="mailto:gursimargill1@gmail.com"><span class="ck">email</span>gursimargill1@gmail.com</a>
            <a href="https://linkedin.com/in/gursimargill" target="_blank" rel="noopener"><span class="ck">linkedin</span>/in/gursimargill ↗</a>
            <span><span class="ck">location</span>New York, NY</span>
          </div>
        </div>

        <form class="form reveal" :data-state="state" novalidate @submit.prevent="submit">
          <!-- Honeypot: hidden from humans, off-screen and skipped by tab/SR. -->
          <div class="hp" aria-hidden="true">
            <label>Company
              <input
                v-model="form.company"
                type="text"
                name="company"
                tabindex="-1"
                autocomplete="off"
              />
            </label>
          </div>

          <div class="form__row">
            <div class="field" :class="{ 'field--err': errors.name }">
              <label for="f-name">Name <span class="req">*</span></label>
              <input
                id="f-name"
                v-model="form.name"
                type="text"
                maxlength="120"
                autocomplete="name"
                placeholder="Jane Doe"
                @input="clearError('name')"
              />
              <span class="field__err">{{ errors.name }}</span>
            </div>
            <div class="field" :class="{ 'field--err': errors.email }">
              <label for="f-email">Email <span class="req">*</span></label>
              <input
                id="f-email"
                v-model="form.email"
                type="email"
                maxlength="200"
                autocomplete="email"
                placeholder="jane@company.com"
                @input="clearError('email')"
              />
              <span class="field__err">{{ errors.email }}</span>
            </div>
          </div>

          <div class="field" :class="{ 'field--err': errors.message }">
            <label for="f-message">Message <span class="req">*</span></label>
            <textarea
              id="f-message"
              v-model="form.message"
              maxlength="4000"
              placeholder="Tell me what you're working on…"
              @input="clearError('message')"
            ></textarea>
            <span class="field__err">{{ errors.message }}</span>
          </div>

          <div class="form__foot">
            <button class="form__btn" type="submit" :disabled="state === 'sending'">
              <span class="spin"></span>
              <span class="form__btn-label">{{ state === 'sending' ? 'Sending…' : 'Send message' }}</span>
              <span class="arr">→</span>
            </button>
            <p class="form__note" :class="note.kind" role="status" aria-live="polite">{{ note.msg }}</p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Honeypot — visually removed but still present in the DOM for bots to fill. */
.hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
