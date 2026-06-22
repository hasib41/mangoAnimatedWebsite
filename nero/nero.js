import gsap from 'gsap'

const qs = (s) => document.querySelector(s)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wide = window.matchMedia('(min-width: 901px)')

/* each flavour owns a side (product + text alternate left/right) and an accent
   colour (highlights the price, CTA, stars, active thumb). accentInk = readable
   text colour on top of that accent. */
const V = [
  { name: 'Origin<br>72%', price: '$11', num: '4.8', stars: '★★★★★', desc: '72% single estate. Bright, clean, classic — the everyday house bar.', bg: '#d9c3a0', side: 'left', accent: '#E8A317', accentInk: '#241810' },
  { name: 'Noir<br>85%', price: '$12', num: '4.7', stars: '★★★★★', desc: '85% cacao. Darker, deeper, almost bitter — for the purists.', bg: '#c7beb1', side: 'right', accent: '#C0341D', accentInk: '#f3e9d8' },
  { name: 'Sea<br>Salt', price: '$12', num: '4.9', stars: '★★★★★', desc: 'Flaked sea salt over dark cocoa. Where sweet meets savoury.', bg: '#ccd4d1', side: 'left', accent: '#2E8B8B', accentInk: '#f3e9d8' },
  { name: 'Orange', price: '$12', num: '4.6', stars: '★★★★☆', desc: 'Candied peel folded into dark cocoa. Bittersweet citrus.', bg: '#e7c794', side: 'right', accent: '#E8731C', accentInk: '#241810' },
]

const stageEl = qs('.show__stage'); const textEl = qs('.show__text')
const shots = gsap.utils.toArray('.show__shot')
const thumbs = gsap.utils.toArray('.thumb')
const nameEl = qs('.show__name'); const priceEl = qs('.show__price'); const tagEl = qs('.show__tag')
const numEl = qs('.show__num'); const starsEl = qs('.show__stars'); const descEl = qs('.show__desc'); const buyEl = qs('.show__buy')
let cur = 0; let busy = false

/* horizontal gap between the product column and the text column (layout-based,
   so it ignores any transforms already applied) */
function layoutDelta () {
  if (!stageEl || !textEl) return 0
  return (textEl.offsetLeft + textEl.offsetWidth / 2) - (stageEl.offsetLeft + stageEl.offsetWidth / 2)
}

/* push this flavour's accent colour into CSS vars (the elements transition it) */
function setAccent (v) {
  const r = document.documentElement.style
  r.setProperty('--accent', v.accent)
  r.setProperty('--accent-ink', v.accentInk)
}

/* slide the strip's accent indicator under the active flavour */
function moveInd (i, animate) {
  const ind = qs('.rail__ind'); const t = thumbs[i]
  if (!ind || !t || !wide.matches) return
  const x = t.offsetLeft
  gsap.set(ind, { width: t.offsetWidth })
  if (animate) gsap.to(ind, { x, duration: 0.45, ease: 'expo.out' })
  else gsap.set(ind, { x })
}

/* park the product + text on the side this flavour wants (desktop only) */
function placeSide (side, animate) {
  if (!wide.matches) { gsap.set([stageEl, textEl], { x: 0 }); return }
  const d = layoutDelta()
  const sx = side === 'right' ? d : 0
  const tx = side === 'right' ? -d : 0
  if (animate) {
    gsap.to(stageEl, { x: sx, duration: 0.95, ease: 'expo.inOut' })
    gsap.to(textEl, { x: tx, duration: 0.95, ease: 'expo.inOut' })
  } else {
    gsap.set(stageEl, { x: sx }); gsap.set(textEl, { x: tx })
  }
}

/* One vertical band of anchor points hugging the chocolate's OWN side (x is small =
   chocolate-side margin). The band mirrors to the right when the bar is on the right,
   so beans always flank the chocolate and never the text. No centre slots → no ring.
   Sizes are small and uneven; indices are scattered so a one-step rotation per
   flavour sends each bean a visible distance. */
const BAND = [
  /* full vertical side-band flanking the chocolate; lowest beans capped at
     y ~78 so they stay clear of the bottom-left flavour strip */
  { x: 4,  y: 10, s: 1.05, r: -12 },
  { x: 1,  y: 60, s: 0.55, r: 14 },
  { x: 10, y: 22, s: 0.5,  r: 18 },
  { x: 4,  y: 74, s: 0.85, r: -16 },
  { x: 2,  y: 33, s: 0.7,  r: -8 },
  { x: 9,  y: 78, s: 0.62, r: 10 },
  { x: 16, y: 40, s: 0.45, r: 20 },
  { x: 2,  y: 18, s: 0.42, r: -20 },
  { x: 6,  y: 48, s: 0.95, r: -6 },
  { x: 18, y: 68, s: 0.4,  r: 22 },
  { x: 12, y: 65, s: 0.6,  r: -14 },
  { x: 14, y: 54, s: 0.5,  r: 8 },
]
let beans = []

function placeBeans (flavour, animate) {
  if (!beans.length) return
  const vw = window.innerWidth, vh = window.innerHeight
  const right = V[flavour].side === 'right'
  beans.forEach((b) => {
    const base = BAND[(b._i + flavour) % BAND.length]
    const sx = right ? 100 - base.x : base.x
    const sr = right ? -base.r : base.r
    const tx = vw * sx / 100 - b.offsetWidth / 2
    const ty = vh * base.y / 100 - b.offsetHeight / 2
    const img = b.querySelector('.bean__img')
    const d = (b._i % 6) * 0.04
    if (animate) {
      gsap.to(b, { x: tx, y: ty, scale: base.s, duration: 1.15, ease: 'expo.inOut', delay: d })
      if (img) gsap.to(img, { rotation: sr, duration: 1.15, ease: 'expo.inOut', delay: d })
    } else {
      gsap.set(b, { x: tx, y: ty, scale: base.s })
      if (img) gsap.set(img, { rotation: sr })
    }
  })
}

/* directional flavour switch — the bar physically travels left/right like a
   carousel and the whole column crosses to its side; dir = +1 → from the right */
function switchTo (i, dir) {
  if (busy || i === cur || !V[i]) return
  busy = true
  const v = V[i]
  if (dir === undefined) dir = i > cur ? 1 : -1
  const prev = cur
  const outGoing = shots[prev]
  const incoming = shots[i]
  cur = i

  /* thumbs + sliding indicator */
  thumbs[prev].classList.remove('is-active'); thumbs[i].classList.add('is-active')
  moveInd(i, true)

  /* background wash + accent shift */
  gsap.to('.show__bg', { backgroundColor: v.bg, duration: 0.8, ease: 'power2.inOut' })
  setAccent(v)

  /* columns cross to this flavour's side */
  placeSide(v.side, true)

  /* product — directional travel with a touch of 3D card-turn */
  incoming.classList.add('is-active')
  gsap.set(incoming, { xPercent: 64 * dir, rotationY: -24 * dir, scale: 0.82, opacity: 0, transformOrigin: '50% 55%' })
  gsap.timeline()
    .to(outGoing, {
      xPercent: -48 * dir, rotationY: 20 * dir, scale: 0.8, opacity: 0,
      duration: 0.5, ease: 'power3.in',
      onComplete: () => { outGoing.classList.remove('is-active'); gsap.set(outGoing, { clearProps: 'transform' }) }
    })
    .to(incoming, {
      xPercent: 0, rotationY: 0, scale: 1, opacity: 1,
      duration: 0.9, ease: 'expo.out',
      onComplete: () => gsap.set(incoming, { clearProps: 'transform' })
    }, 0.16)

  /* name + price slide along the travel axis */
  gsap.timeline()
    .to([priceEl, nameEl, tagEl], { xPercent: -16 * dir, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.05 })
    .add(() => { nameEl.innerHTML = v.name; priceEl.textContent = v.price })
    .fromTo([priceEl, nameEl, tagEl], { xPercent: 22 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.07 })

  /* about card travels in too */
  gsap.to('.show__about', { opacity: 0, x: -18 * dir, duration: 0.26, ease: 'power2.in', onComplete: () => {
    numEl.textContent = v.num; starsEl.textContent = v.stars; descEl.textContent = v.desc; buyEl.textContent = `Add to cart — ${v.price}`
    gsap.fromTo('.show__about', { opacity: 0, x: 24 * dir }, { opacity: 1, x: 0, duration: 0.55, ease: 'expo.out' })
  } })

  /* beans fly to fresh positions + rotations for this flavour */
  placeBeans(i, true)

  gsap.delayedCall(0.95, () => { busy = false })
}

function bindThumbs () {
  thumbs.forEach((t, i) => t.addEventListener('click', () => switchTo(i)))
  /* explicit left / right arrow controls */
  const prevBtn = qs('.nav-arrow--prev'); const nextBtn = qs('.nav-arrow--next')
  if (prevBtn) prevBtn.addEventListener('click', () => switchTo((cur - 1 + V.length) % V.length, -1))
  if (nextBtn) nextBtn.addEventListener('click', () => switchTo((cur + 1) % V.length, 1))
  /* arrow-key flavour switching */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') switchTo((cur + 1) % V.length, 1)
    if (e.key === 'ArrowLeft') switchTo((cur - 1 + V.length) % V.length, -1)
  })
}

function reveal () {
  placeSide(V[cur].side, false)
  setAccent(V[cur])
  moveInd(cur, false)
  gsap.set(shots[0], { opacity: 1 })
  gsap.from('.show__ghost', { opacity: 0, scale: 1.1, duration: 1.2, ease: 'expo.out' })
  gsap.from('.show__stage', { opacity: 0, scale: 0.9, duration: 1.1, ease: 'expo.out' })
  gsap.from('.bean', { opacity: 0, duration: 0.9, stagger: 0.04, ease: 'power2.out', delay: 0.25 })
  gsap.from(['.show__price', '.show__name', '.show__tag'], { y: 32, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', delay: 0.2 })
  gsap.from('.show__about', { y: 32, opacity: 0, duration: 0.8, ease: 'expo.out', delay: 0.45 })
  gsap.from('.thumb', { y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(1.3)', delay: 0.5 })
  gsap.from('.rail__ind', { scaleX: 0, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.75, transformOrigin: '0 50%' })
  gsap.from('.top', { y: -30, opacity: 0, duration: 0.7, ease: 'expo.out' })
}

function boot () {
  const fill = qs('.loader__fill'); const loader = qs('.loader'); const img = shots[0]
  if (reduceMotion) { loader.style.display = 'none'; gsap.set(shots[0], { opacity: 1 }); placeSide(V[cur].side, false); setAccent(V[cur]); moveInd(cur, false); return }
  gsap.set(fill, { scaleX: 0 })
  Promise.all([document.fonts.ready, img.decode().catch(() => {})]).then(() => {
    gsap.timeline()
      .to(fill, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' })
      .add(() => { loader.classList.add('loader--hide'); reveal() }, '+=0.1')
      .add(() => gsap.set(loader, { display: 'none' }), '+=0.7')
  })
}

/* ---------- custom cursor ---------- */
function cursor () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const cur2 = qs('.cursor'); if (!cur2) return
  let armed = false, cx = 0, cy = 0, tx = 0, ty = 0
  window.addEventListener('mousemove', (e) => {
    if (!armed) { armed = true; cx = tx = e.clientX; cy = ty = e.clientY; document.documentElement.classList.add('has-cursor') }
    tx = e.clientX; ty = e.clientY
  })
  ;(function raf () { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur2.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(raf) })()
  document.addEventListener('mouseover', (e) => { if (e.target.closest('a, button, [data-magnetic]')) cur2.classList.add('is-hover') })
  document.addEventListener('mouseout', (e) => { if (e.target.closest('a, button, [data-magnetic]')) cur2.classList.remove('is-hover') })
}

/* ---------- sound ---------- */
function sound () {
  const btn = qs('.snd'); if (!btn) return
  let ctx, gain, on = false
  const start = () => {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.connect(gain)
    for (const f of [66, 66.6, 132]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(lp); o.start() }
  }
  btn.addEventListener('click', () => {
    if (!ctx) start()
    if (ctx.state === 'suspended') ctx.resume()
    on = !on
    btn.classList.toggle('is-on', on)
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.linearRampToValueAtTime(on ? 0.05 : 0, ctx.currentTime + 0.6)
  })
}

/* ---------- floating cacao beans: idle bob + cursor parallax ---------- */
function beansInteractive () {
  beans = gsap.utils.toArray('.bean')
  beans.forEach((b, k) => {
    b._i = k
    const img = b.querySelector('.bean__img')
    if (!img) return
    gsap.set(img, { transformOrigin: '50% 50%' })
    if (reduceMotion) return
    /* gentle idle bob (yPercent only — rotation is owned by placeBeans) */
    const amp = gsap.utils.random(3, 7)
    gsap.fromTo(img,
      { yPercent: -amp },
      { yPercent: amp, duration: gsap.utils.random(2.8, 4.4), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: gsap.utils.random(0, 1.8) })
  })
  placeBeans(cur, false)   // initial layout for the first flavour
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  /* parallax lives on the inner wrapper so it never fights placeBeans' x/y */
  const movers = beans.map((b) => {
    const par = b.querySelector('.bean__par')
    return {
      xTo: gsap.quickTo(par, 'x', { duration: 0.9, ease: 'power3.out' }),
      yTo: gsap.quickTo(par, 'y', { duration: 0.9, ease: 'power3.out' }),
      depth: parseFloat(b.dataset.depth) || 0.5,
    }
  })
  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5
    const ny = e.clientY / window.innerHeight - 0.5
    movers.forEach((m) => { m.xTo(-nx * 90 * m.depth); m.yTo(-ny * 70 * m.depth) })
  })
}

/* ---------- magnetic ---------- */
function magnetic () {
  if (!window.matchMedia('(hover: hover)').matches) return
  for (const btn of document.querySelectorAll('[data-magnetic]')) {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })
    btn.addEventListener('mousemove', (e) => { const r = btn.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4) })
    btn.addEventListener('mouseleave', () => { xTo(0); yTo(0) })
  }
}

/* keep the columns + beans parked correctly when the viewport changes */
let rT
window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { placeSide(V[cur].side, false); placeBeans(cur, false); moveInd(cur, false) }, 150) })

bindThumbs(); cursor(); sound(); magnetic(); beansInteractive(); boot()
