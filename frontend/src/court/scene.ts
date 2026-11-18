// The 3D inbound play. Framework-free: owns a canvas + four label buttons inside `host`.
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'

export type Page = 'about' | 'experience' | 'projects' | 'contact'
export type State = 'loading' | 'intro' | 'ready' | 'play' | 'pass' | 'open'
export interface Court { slap(): void; reset(): void; dispose(): void }
interface Opts {
  onState(s: State): void
  onProgress(p: number): void
  onOpen(p: Page): void
  onFail(): void
}

// The only legal transitions; setState asserts against this.
const NEXT: Record<State, State[]> = {
  loading: ['intro'], intro: ['ready'], ready: ['play'], play: ['pass'], pass: ['open'], open: ['intro'],
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const UP = V(0, 1, 0)
const HOOP = V(12.425, 0, 0)
const LOOK = V(5.5, 1.1, 0)
// Court is 28 x 15 m centred on the origin; the visitor inbounds from the +z sideline.
// box = where a teammate lines up before the slap, cut = where they break to after it.
const RECEIVERS: { page: Page; box: THREE.Vector3; cut: THREE.Vector3 }[] = [
  { page: 'about', box: V(6.2, 0, 1.6), cut: V(2.6, 0, 3.4) },
  { page: 'experience', box: V(8.6, 0, 1.6), cut: V(3.6, 0, -2.5) },
  { page: 'projects', box: V(6.2, 0, -1.2), cut: V(8.2, 0, 2.6) },
  { page: 'contact', box: V(8.6, 0, -1.2), cut: V(8.2, 0, -3.5) },
]

type Clip = 'idle' | 'run' | 'catch'
interface Actor {
  root: THREE.Object3D
  mixer: THREE.AnimationMixer
  acts: Record<Clip, THREE.AnimationAction>
  cur: THREE.AnimationAction
  target: THREE.Vector3
  speed: number
  skin: THREE.MeshStandardMaterial
}

function courtTexture() {
  const S = 72 // px per metre
  const c = document.createElement('canvas')
  c.width = 28 * S
  c.height = 15 * S
  const g = c.getContext('2d')!
  g.fillStyle = '#b07a45'
  g.fillRect(0, 0, c.width, c.height)
  for (let y = 0; y < c.height; y += 9) { // planks: random darker strips
    g.fillStyle = `rgba(60,30,10,${0.03 + Math.random() * 0.12})`
    g.fillRect(0, y, c.width, 9)
  }
  g.font = `700 ${1.5 * S}px 'JetBrains Mono', monospace`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = 'rgba(12,14,18,.55)'
  g.fillText('GG', 14 * S, 7.6 * S)

  g.scale(S, S) // metres from here on
  g.lineWidth = 0.06
  g.strokeStyle = '#f4f1ea'
  g.fillStyle = 'rgba(16,84,62,.8)'
  const a = Math.asin(6.6 / 6.75) // where the 3pt arc meets the corner straights
  for (const side of [1, -1]) {
    g.save()
    g.translate(14, 7.5)
    g.scale(side, 1)
    g.fillRect(-14, -2.45, 5.8, 4.9)
    g.strokeRect(-14, -2.45, 5.8, 4.9)
    g.beginPath()
    g.arc(-8.2, 0, 1.8, -Math.PI / 2, Math.PI / 2)
    g.stroke()
    g.beginPath()
    g.moveTo(-14, -6.6)
    g.arc(-12.425, 0, 6.75, -a, a)
    g.lineTo(-14, 6.6)
    g.stroke()
    g.restore()
  }
  g.strokeRect(0.03, 0.03, 27.94, 14.94)
  g.beginPath()
  g.moveTo(14, 0)
  g.lineTo(14, 15)
  g.moveTo(15.8, 7.5)
  g.arc(14, 7.5, 1.8, 0, Math.PI * 2)
  g.stroke()

  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function slapSound() {
  const ac = new AudioContext()
  const n = ac.sampleRate * 0.08
  const buf = ac.createBuffer(1, n, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3
  const src = ac.createBufferSource()
  src.buffer = buf
  src.connect(ac.destination)
  src.onended = () => ac.close()
  src.start()
}

export function createCourt(host: HTMLElement, opts: Opts): Court {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true })
  } catch {
    opts.onFail() // no WebGL: the app falls back to plain page tabs
    return { slap() {}, reset() {}, dispose() {} }
  }
  const small = innerWidth < 768
  // shortcut: phones get the same model at lower pixel ratio and no shadows; ship a
  // lower-poly player.glb for small screens if real devices still drop frames.
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = !small
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  const canvas = renderer.domElement
  host.prepend(canvas)

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const MOTION = reduced ? 0 : 1 // reduced motion: camera cuts, players teleport
  const SPEED = reduced ? 1e3 : 4.5

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0c0e12)
  scene.fog = new THREE.Fog(0x0c0e12, 20, 48)
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  const pov = V(5, 1.7, 8.8) // the inbounder's eyes; resize() moves it back on narrow screens
  const camPos = V(-6, 9, 22)
  const camLook = V(6, 0, 0)

  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x2a1c10, 0.7))
  const key = new THREE.SpotLight(0xfff1dc, 3.2, 0, 0.8, 0.7, 0)
  key.position.set(5, 20, 7)
  key.target.position.set(6, 0, 0)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.bias = -0.0004
  scene.add(key, key.target)

  const tex = courtTexture()
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy() // lines stay crisp at the POV's grazing angle
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 15), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.9 }))
  apron.rotation.x = -Math.PI / 2
  apron.position.y = -0.01
  scene.add(floor, apron)

  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1f27 })
  for (const side of [1, -1]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 1.8), new THREE.MeshStandardMaterial({ color: 0xe8edf2, transparent: true, opacity: 0.55 }))
    board.position.set(side * 12.8, 3.4, 0)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 8, 24), new THREE.MeshStandardMaterial({ color: 0xff5a1f }))
    rim.rotation.x = Math.PI / 2
    rim.position.set(side * 12.425, 3.05, 0)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.6), dark)
    pole.position.set(side * 14.9, 1.8, 0)
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.14, 0.14), dark)
    arm.position.set(side * 13.85, 3.4, 0)
    scene.add(board, rim, pole, arm)
  }

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 16), new THREE.MeshStandardMaterial({ color: 0xd9641e, roughness: 0.75 }))
  ball.castShadow = true
  const seamGeo = new THREE.TorusGeometry(0.1205, 0.003, 6, 40)
  for (const rot of [[0, 0], [Math.PI / 2, 0], [0, Math.PI / 2]]) {
    const seam = new THREE.Mesh(seamGeo, dark)
    seam.rotation.set(rot[0], rot[1], 0)
    ball.add(seam)
  }
  scene.add(ball)

  let state: State = 'loading'
  function setState(s: State) {
    console.assert(NEXT[state].includes(s), `court: illegal transition ${state} -> ${s}`)
    state = s
    host.dataset.state = s
    opts.onState(s)
  }

  type Tween = { t: number; dur: number; fn(t: number): void; done?(): void }
  let tweens: Tween[] = []
  const tween = (dur: number, fn: Tween['fn'], done?: Tween['done']) =>
    tweens.push({ t: 0, dur: Math.max(dur * MOTION, 1e-3), fn, done })
  const ease = (t: number) => t * t * (3 - 2 * t)

  const receivers: Actor[] = []
  const defenders: Actor[] = []
  const hits: THREE.Object3D[] = [] // invisible click targets, one per receiver
  let ref: Actor | undefined
  let holder: Actor | 'hand' | null = null // who the ball is glued to; null while a tween flies it
  let hot = -1
  let dead = false

  const labels = RECEIVERS.map((r, i) => {
    const b = document.createElement('button')
    b.className = 'plabel'
    b.innerHTML = `<i>#0${i + 1}</i>${r.page}`
    b.setAttribute('aria-label', `Pass to number ${i + 1}: open ${r.page}`)
    b.onclick = () => pass(i)
    b.onpointerenter = b.onfocus = () => setHot(i)
    b.onpointerleave = b.onblur = () => setHot(-1)
    host.append(b)
    return b
  })

  function setHot(i: number) {
    hot = state === 'play' ? i : -1
    receivers.forEach((a, j) => a.skin.emissive.setHex(j === hot ? 0x1c5c47 : 0))
    labels.forEach((b, j) => b.classList.toggle('is-hot', j === hot))
    canvas.style.cursor = hot >= 0 ? 'pointer' : ''
  }

  function play(a: Actor, name: Clip) {
    const next = a.acts[name]
    if (next === a.cur) return
    a.cur.fadeOut(0.2)
    a.cur = next.reset().fadeIn(0.2).play()
  }

  const tmp = V(0, 0, 0)
  const quat = new THREE.Quaternion()
  function step(a: Actor, dt: number) {
    const d = tmp.subVectors(a.target, a.root.position).setY(0)
    const dist = d.length()
    const moving = dist > 0.08
    if (moving) {
      a.root.position.addScaledVector(d.normalize(), Math.min(dist, a.speed * dt))
      play(a, 'run')
    } else {
      d.subVectors(pov, a.root.position) // standing: face the inbounder
      if (a.cur === a.acts.run) play(a, 'idle')
    }
    a.root.quaternion.slerp(quat.setFromAxisAngle(UP, Math.atan2(d.x, d.z)), 1 - Math.exp(-10 * dt))
    a.mixer.update(dt)
  }

  // Where a player holds the ball: chest height, a little toward the inbounder.
  const chest = (a: Actor, out: THREE.Vector3) =>
    out.subVectors(pov, a.root.position).setY(0).normalize().multiplyScalar(0.3).add(a.root.position).setY(1.2)
  const hand = (out: THREE.Vector3) => camera.localToWorld(out.set(0, -0.32, -0.8))

  function slap() {
    if (state !== 'ready') return
    slapSound()
    tween(0.25, (t) => {
      const s = Math.sin(Math.PI * t)
      ball.scale.set(1 + 0.15 * s, 1 - 0.3 * s, 1 + 0.15 * s)
    })
    receivers.forEach((a, i) => a.target.copy(RECEIVERS[i].cut))
    setState('play')
  }

  function pass(i: number) {
    if (state !== 'play' || i < 0) return
    setHot(-1)
    setState('pass')
    const a = receivers[i]
    const from = ball.position.clone()
    const to = V(0, 0, 0)
    holder = null
    tween(0.55, (t) => {
      ball.position.lerpVectors(from, chest(a, to), t).y += Math.sin(Math.PI * t) * 1.1
      ball.rotation.x -= 0.35
    }, () => {
      a.target.copy(a.root.position) // stop where the catch happens
      play(a, 'catch')
      holder = a
      // Push in along the visitor's line of sight, then slide the camera right so the player
      // lands in the middle of whatever the panel (820px, see .panel) leaves uncovered.
      const DIST = 2.8
      const w = canvas.clientWidth
      const covered = w - 820 < 240 ? 0 : 820 / w
      const shift = DIST * covered * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect
      const toCam = V(0, 0, 0).subVectors(pov, a.root.position).setY(0).normalize()
      const side = V(0, 0, 0).crossVectors(UP, toCam).multiplyScalar(shift)
      const pos = a.root.position.clone().addScaledVector(toCam, DIST).add(side).setY(1.6)
      const look = a.root.position.clone().add(side).setY(1.25)
      const p0 = camPos.clone()
      const l0 = camLook.clone()
      tween(1, (t) => {
        camPos.lerpVectors(p0, pos, ease(t))
        camLook.lerpVectors(l0, look, ease(t))
      }, () => {
        setState('open')
        opts.onOpen(RECEIVERS[i].page)
      })
    })
  }

  // Bring the camera and ball back to the inbounder; ends in `ready`.
  function toSideline(dur: number, then?: () => void) {
    const p0 = camPos.clone()
    const l0 = camLook.clone()
    const to = V(0, 0, 0)
    tween(dur, (t) => {
      camPos.lerpVectors(p0, pov, ease(t))
      camLook.lerpVectors(l0, LOOK, ease(t))
    }, () => {
      const from = ball.position.clone() // whoever holds it (ref or receiver) hands it back
      holder = null
      tween(0.5, (t) => ball.position.lerpVectors(from, hand(to), ease(t)), () => {
        holder = 'hand'
        then?.()
        setState('ready')
      })
    })
  }

  function reset() {
    if (state !== 'open') return
    setState('intro')
    receivers.forEach((a, i) => a.target.copy(RECEIVERS[i].box))
    toSideline(0.9)
  }

  new GLTFLoader().load(
    '/models/player.glb',
    (gltf) => {
      if (dead) return
      const find = (n: string) => gltf.animations.find((c) => c.name.toLowerCase().includes(n))
      const idle = find('idle')
      const run = find('run')
      if (!idle || !run) return opts.onFail()
      const caught = find('catch') ?? find('agree') // 'agree' is the stand-in model's closest clip

      const makeActor = (color: number, at: THREE.Vector3, target: THREE.Vector3, speed = SPEED): Actor => {
        const root = cloneSkinned(gltf.scene)
        let skin!: THREE.MeshStandardMaterial
        root.traverse((o) => {
          const m = o as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
          if (!m.isMesh) return
          m.castShadow = true
          m.material = m.material.clone()
          // shortcut: the jersey is "every material not named *joint*" (true for the stand-in
          // model); name the jersey material explicitly once the real player model lands.
          if (!/joint/i.test(m.material.name)) (skin = m.material).color.set(color)
        })
        root.position.copy(at)
        scene.add(root)
        const mixer = new THREE.AnimationMixer(root)
        const acts = { idle: mixer.clipAction(idle), run: mixer.clipAction(run), catch: mixer.clipAction(idle) }
        if (caught) {
          acts.catch = mixer.clipAction(caught).setLoop(THREE.LoopOnce, 1)
          acts.catch.clampWhenFinished = true
        }
        return { root, mixer, acts, cur: acts.idle.play(), target: target.clone(), speed, skin }
      }

      RECEIVERS.forEach((r, i) => {
        const a = makeActor(0x34d399, V(-4 + i * 2, 0, -5 + (i % 2) * 3), r.box)
        const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2), new THREE.MeshBasicMaterial({ visible: false }))
        hit.position.y = 1
        a.root.add(hit)
        hits.push(hit)
        receivers.push(a)
        if (i < 3) defenders.push(makeActor(0xd9534f, V(-2 + i * 2, 0, 5 - i * 3), r.box, SPEED * 0.9))
      })
      ref = makeActor(0x2b303a, V(8, 0, 4), V(5, 0, 6.4), SPEED * 0.6)
      holder = ref

      setState('intro')
      const r = ref
      toSideline(4, () => r.target.set(0.6, 0, 8))
    },
    (e) => opts.onProgress(e.total ? e.loaded / e.total : 0),
    () => opts.onFail(),
  )

  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  function pick(e: MouseEvent) {
    ptr.set((e.clientX / canvas.clientWidth) * 2 - 1, -(e.clientY / canvas.clientHeight) * 2 + 1)
    ray.setFromCamera(ptr, camera)
    const hit = ray.intersectObjects(hits, false)[0]
    return hit ? hits.indexOf(hit.object) : -1
  }

  function resize() {
    const w = host.clientWidth
    const h = host.clientHeight
    const aspect = w / h
    renderer.setSize(w, h)
    camera.aspect = aspect
    // Narrow screens: widen the lens and step back so all four receivers stay in frame.
    camera.fov = aspect < 1.3 ? 70 : 55
    if (aspect < 1.3) pov.set(5.3, 2.6, 8.8 + (1.3 - aspect) * 9)
    else pov.set(5, 1.7, 8.8)
    camera.updateProjectionMatrix()
  }

  const ac = new AbortController()
  const on = { signal: ac.signal }
  addEventListener('resize', resize, on)
  canvas.addEventListener('pointermove', (e) => state === 'play' && setHot(pick(e)), on)
  canvas.addEventListener('click', (e) => (state === 'ready' ? slap() : pass(pick(e))), on)
  addEventListener('keydown', (e) => {
    // Space/Enter slaps, unless focus is on a real control (the hint button handles itself).
    if ((e.key === ' ' || e.key === 'Enter') && e.target === document.body) slap()
  }, on)
  resize()

  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1)
    if (state === 'open' && small) return // panel covers the whole screen: save the battery

    const running = tweens
    tweens = []
    for (const tw of running) {
      tw.t = Math.min(1, tw.t + dt / tw.dur)
      tw.fn(tw.t)
      if (tw.t < 1) tweens.push(tw)
      else tw.done?.()
    }

    defenders.forEach((d, i) => {
      const man = receivers[i].root.position
      d.target.subVectors(HOOP, man).normalize().multiplyScalar(1.1).add(man)
      step(d, dt)
    })
    receivers.forEach((a) => step(a, dt))
    if (ref) step(ref, dt)

    if (state === 'ready' || state === 'play') { // locked to the sideline (also tracks resize)
      camPos.copy(pov)
      camLook.copy(LOOK)
    }
    camera.position.copy(camPos)
    camera.lookAt(camLook)
    camera.updateMatrixWorld()

    if (holder === 'hand') hand(ball.position)
    else if (holder) chest(holder, ball.position)

    if (state === 'play') {
      receivers.forEach((a, i) => {
        tmp.copy(a.root.position).setY(2.05).project(camera)
        const x = ((tmp.x + 1) / 2) * canvas.clientWidth
        // Phones: the two deep receivers (odd indices) sit close to the near ones on screen,
        // so lift their labels a row to keep all four readable and tappable.
        const y = ((1 - tmp.y) / 2) * canvas.clientHeight - (small && i % 2 ? 38 : 0)
        labels[i].style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
      })
    }
    renderer.render(scene, camera)
  })

  return {
    slap,
    reset,
    dispose() {
      dead = true
      ac.abort()
      renderer.setAnimationLoop(null)
      renderer.dispose()
      canvas.remove()
      labels.forEach((b) => b.remove())
    },
  }
}
