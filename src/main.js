import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const mm = gsap.matchMedia()
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* split the quote into word spans once, for the word-cascade reveal */
const quoteEl = document.querySelector('.quote__line')
quoteEl.innerHTML = quoteEl.textContent.trim().split(/\s+/)
  .map((w) => `<span class="word">${w}</span>`).join(' ')

/* split variety names into letter spans for masked rises */
for (const nameEl of document.querySelectorAll('.vpanel__name')) {
  nameEl.innerHTML = nameEl.textContent.trim().split('')
    .map((c) => `<span class="ch">${c}</span>`).join('')
}

/* ============================================================
   Reduced motion: no loader, no pins, everything simple fades
   ============================================================ */
if (reduceMotion) {
  gsap.set('.loader', { display: 'none' })
  gsap.set(['.cinema__whole', '.cinema__burst', '.cinema__blob', '.cinema__ghost', '.cinema__intro', '.hero__fade', '.story__ghosts', '.story__rail'], { display: 'none' })
  gsap.set('.hero__mango-wrap', { yPercent: 0 })
  /* stack the orbit + offer statically */
  gsap.set('.cinema__ring', { position: 'static', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' })
  gsap.set('.rbadge', { position: 'static', width: 'auto', margin: 0 })
  gsap.set('.cinema__offer', { position: 'static', transform: 'none', width: 'auto', opacity: 1 })
  gsap.set(['.char__inner', '.fchar__inner'], { opacity: 0 })
  gsap.set(['.hero__title', '.footer__title'], { visibility: 'visible' })
  gsap.to('.char__inner', { opacity: 1, duration: 0.6, ease: 'power1.out' })
  gsap.to('.hero__mango-wrap', { opacity: 1, duration: 0.6, delay: 0.1 })
  gsap.to(['.hero__shadow', '.hero__badge'], { opacity: 1, duration: 0.6, delay: 0.15 })
  gsap.to('.hero__foot > *', { opacity: 1, duration: 0.6, delay: 0.2 })
  const fadeTargets = document.querySelectorAll(
    '.reveal, .cinema__cut, .rbadge, .offer-list li, .cinema__price, .fchar__inner, .quote__line, .vpanel, .story__step')
  for (const el of fadeTargets) {
    gsap.to(el, {
      opacity: 1,
      duration: 0.6,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  }
} else {
  main()
}

/* ============================================================ */
function main () {
  /* Lenis smooth scroll — single rAF loop shared with GSAP */
  const lenis = new Lenis({ duration: 1.0, wheelMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  for (const a of document.querySelectorAll('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      lenis.scrollTo(a.getAttribute('href'), { offset: 0 })
    })
  }

  window.addEventListener('load', () => ScrollTrigger.refresh())

  intro(lenis)
  marquee(lenis)
  quote()
  footer()
  magnetic()

  /* deep links: re-resolve the hash after pins have reshaped the page */
  if (location.hash) {
    const target = document.querySelector(location.hash)
    if (target) {
      window.addEventListener('load', () => {
        ScrollTrigger.refresh()
        lenis.scrollTo(target, { immediate: true })
      })
    }
  }

  /* pinned scenes; gsap.matchMedia auto-reverts each context's animations */
  mm.add('(min-width: 821px)', () => {
    document.documentElement.classList.add('pin-h')
    cinema(true)
    const cleanups = [storyPinned(), varietiesHorizontal()]
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      document.documentElement.classList.remove('pin-h')
      cleanups.forEach((fn) => fn())
    }
  })
  mm.add('(max-width: 820px)', () => {
    cinema(false)
    const triggers = [...storyStacked(), ...varietiesStacked()]
    return () => triggers.forEach((t) => t.kill())
  })
}

/* ============================================================
   Intro: curtain → kinetic hero
   ============================================================ */
function intro (lenis) {
  const chars = document.querySelectorAll('.char__inner')
  const mangoWrap = document.querySelector('.hero__mango-wrap')
  const mangoImg = document.querySelector('.hero__mango')
  const shadow = document.querySelector('.hero__shadow')
  const badge = document.querySelector('.hero__badge')
  const tagline = document.querySelector('.hero__tagline-inner')
  const cta = document.querySelector('.hero__foot .btn')

  gsap.set(chars, { yPercent: 110, rotation: 7, transformOrigin: '0% 100%', willChange: 'transform' })
  gsap.set('.hero__title', { visibility: 'visible' })
  gsap.set(mangoWrap, { yPercent: 160, opacity: 0, rotation: -10 })   /* waits below the fold */
  gsap.set(tagline, { yPercent: 120 })
  gsap.set('.hero__tagline', { opacity: 1 })   /* mask does the hiding now */

  lenis.stop()

  Promise.all([document.fonts.ready, mangoImg.decode().catch(() => {})]).then(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to('.loader__word', { y: '0%', duration: 0.7 })
      .to('.loader__word', { yPercent: -110, duration: 0.5, ease: 'expo.in', delay: 0.35 })
      .to('.loader', {
        yPercent: -100,
        duration: 0.9,
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.set('.loader', { display: 'none' })
          lenis.start()
        },
      }, '-=0.15')
      .to(chars, { yPercent: 0, rotation: 0, duration: 1.15, stagger: 0.065, clearProps: 'willChange' }, '-=0.45')
      .fromTo(badge,
        { opacity: 0, scale: 0.4, rotation: -40 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.8)' },
        '-=0.55')
      .to(tagline, { yPercent: 0, duration: 0.9 }, '-=0.55')
      .fromTo(cta, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
  })

  /* cursor parallax — title far plane, badge near plane */
  if (window.matchMedia('(hover: hover)').matches) {
    const stage = document.querySelector('.hero')
    const titleX = gsap.quickTo('.hero__title', 'x', { duration: 0.8, ease: 'power3.out' })
    const titleY = gsap.quickTo('.hero__title', 'y', { duration: 0.8, ease: 'power3.out' })
    const badgeX = gsap.quickTo(badge, 'x', { duration: 0.5, ease: 'power3.out' })
    const badgeY = gsap.quickTo(badge, 'y', { duration: 0.5, ease: 'power3.out' })
    stage.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      titleX(nx * -10); titleY(ny * -6)
      badgeX(nx * 34); badgeY(ny * 22)
    })
    stage.addEventListener('mouseleave', () => {
      titleX(0); titleY(0); badgeX(0); badgeY(0)
    })
  }

  /* THE SIGNATURE MOVE — pin the hero; the mango rises from below,
     up through the letters, while the orchard washes out to cream.
     The next section (cinema) opens on the same centered mango. */
  const spread = [-26, -16, -6, 6, 16, 26]
  const rise = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      refreshPriority: 6,
    },
    defaults: { ease: 'none' },
  })
  rise
    .to(mangoWrap, { opacity: 1, duration: 0.12 }, 0)
    .to(mangoWrap, { yPercent: 0, rotation: 0, duration: 1, ease: 'power1.out' }, 0)
    .to('.hero__bg img', { scale: 1.14, duration: 1 }, 0)                 /* slow camera push-in */
    .to('.hero__fade', { opacity: 1, duration: 0.5 }, 0.4)                /* photo washes to deep green */
    .to('.hero__foot', { yPercent: 60, opacity: 0, duration: 0.3 }, 0)
    .to('.hero__hint', { opacity: 0, duration: 0.15 }, 0)
    .to(badge, { opacity: 0, duration: 0.3 }, 0.4)
  chars.forEach((c, i) => rise.to(c.parentElement, { xPercent: spread[i], duration: 0.8 }, 0.2))
  rise.to('.hero__title', { opacity: 0, duration: 0.35 }, 0.6)            /* letters dissolve into the wash */
}

/* ============================================================
   Marquee — speed + skew react to scroll velocity
   ============================================================ */
function marquee (lenis) {
  const track = document.querySelector('.marquee__track')
  const tween = gsap.to(track, { xPercent: -50, duration: 18, ease: 'none', repeat: -1 })
  const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power2.out' })
  lenis.on('scroll', ({ velocity }) => {
    gsap.to(tween, {
      timeScale: gsap.utils.clamp(0.4, 4, 1 + Math.abs(velocity) * 0.12),
      duration: 0.3,
      overwrite: true,
    })
    skewTo(gsap.utils.clamp(-8, 8, velocity * 0.6))
  })
}

/* ============================================================
   Story — pinned 3-step scene with Ken Burns drift (desktop)
   ============================================================ */
function storyPinned () {
  const steps = gsap.utils.toArray('.story__step')
  const visuals = gsap.utils.toArray('.story__visual')
  const imgs = visuals.map((v) => v.querySelector('img'))
  const ghosts = gsap.utils.toArray('.story__ghosts span')
  const rail = gsap.utils.toArray('.story__rail span')
  const partsOf = (step) => step.querySelectorAll('.story__num, .story__head, .story__text')

  steps.slice(1).forEach((s) => gsap.set(partsOf(s), { opacity: 0, y: 50 }))
  gsap.set(visuals.slice(1), { opacity: 0, scale: 1.08 })
  gsap.set(visuals[0], { opacity: 1 })
  gsap.set(ghosts.slice(1), { opacity: 0, y: 60 })
  gsap.set(rail.slice(1), { opacity: 0.25, scaleY: 0.6 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.story',
      start: 'top top',
      end: '+=200%',
      pin: '.story__pin',
      scrub: 1,
      anticipatePin: 1,
      refreshPriority: 4,
    },
  })
  tl.fromTo(imgs[0], { scale: 1.06 }, { scale: 1.16, duration: 1.1, ease: 'none' }, 0)

  for (let i = 1; i < steps.length; i++) {
    const at = `seg${i}`
    /* outgoing copy cascades up and out */
    tl.to(partsOf(steps[i - 1]), { opacity: 0, y: -50, duration: 0.35, stagger: 0.04, ease: 'power2.in' }, at)
      /* photos crossfade — incoming settles from a slight zoom */
      .to(visuals[i - 1], { opacity: 0, duration: 0.5, ease: 'none' }, `${at}+=0.1`)
      .to(visuals[i], { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' }, `${at}+=0.15`)
      /* ghost number + rail hand over */
      .to(ghosts[i - 1], { opacity: 0, y: -60, duration: 0.4, ease: 'power2.in' }, at)
      .to(ghosts[i], { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, `${at}+=0.25`)
      .to(rail[i - 1], { opacity: 0.25, scaleY: 0.6, duration: 0.3 }, at)
      .to(rail[i], { opacity: 1, scaleY: 1, duration: 0.3 }, `${at}+=0.2`)
      /* incoming copy cascades in: number → heading → line */
      .to(partsOf(steps[i]), { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' }, `${at}+=0.35`)
      /* fresh Ken Burns on the new photo */
      .fromTo(imgs[i], { scale: 1.06 }, { scale: 1.16, duration: 1.1, ease: 'none' }, `${at}+=0.7`)
      .to({}, { duration: 0.6 })                  // hold each step on screen
  }
  return () => tl.scrollTrigger.kill()
}

/* story on mobile: simple stacked reveals */
function storyStacked () {
  const triggers = []
  for (const el of document.querySelectorAll('.story__step')) {
    triggers.push(ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      animation: gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }),
    }))
  }
  return triggers
}

/* ============================================================
   Varieties — pinned horizontal train with per-panel scenes
   ============================================================ */
function varietiesHorizontal () {
  const track = document.querySelector('.varieties__track')
  const tween = gsap.to(track, {
    xPercent: -100 * (2 / 3),               // 3 panels → travel 2 panel-widths
    ease: 'none',
    scrollTrigger: {
      trigger: '.varieties',
      start: 'top top',
      end: () => '+=' + (track.scrollWidth - window.innerWidth),
      pin: '.varieties__pin',
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 3,
    },
  })

  const extra = []
  const trainScrub = () => ({
    trigger: '.varieties',
    start: 'top top',
    end: () => '+=' + (track.scrollWidth - window.innerWidth),
    scrub: 1,
    refreshPriority: 3,
  })

  /* each panel plays a scene as it drives into view
     (panel 1 is already on screen at pin start, so it uses a vertical trigger) */
  gsap.utils.toArray('.vpanel').forEach((panel, i) => {
    const trig = i === 0
      ? { trigger: '.varieties', start: 'top 60%', once: true }
      : { trigger: panel, containerAnimation: tween, start: 'left 65%', once: true }
    const sceneTl = gsap.timeline({ scrollTrigger: trig })
    sceneTl
      .fromTo(panel.querySelector('.vpanel__circle'),
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
      .fromTo(panel.querySelector('.vpanel__num'),
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, 0.05)
      .fromTo(panel.querySelectorAll('.vpanel__name .ch'),
        { yPercent: 115 },
        { yPercent: 0, duration: 0.7, stagger: 0.04, ease: 'expo.out' }, 0.1)
      .fromTo(panel.querySelector('.vpanel__photo'),
        { opacity: 0, scale: 0.82, rotation: -8, y: 60 },
        { opacity: 1, scale: 1, rotation: 0, y: 0, duration: 0.9, ease: 'back.out(1.4)' }, 0.2)
      .fromTo(panel.querySelector('.vpanel__note'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.45)
    extra.push(sceneTl)
  })

  /* depth layers across the train: ghost names race, photos drift, numbers slide */
  for (const ghost of gsap.utils.toArray('.vpanel__ghost')) {
    extra.push(gsap.fromTo(ghost, { xPercent: 18 }, { xPercent: -18, ease: 'none', scrollTrigger: trainScrub() }))
  }
  for (const photo of gsap.utils.toArray('.vpanel__photo')) {
    extra.push(gsap.fromTo(photo, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: trainScrub() }))
  }
  for (const num of gsap.utils.toArray('.vpanel__num')) {
    extra.push(gsap.fromTo(num, { xPercent: 60 }, { xPercent: -60, ease: 'none', scrollTrigger: trainScrub() }))
  }
  return () => {
    tween.scrollTrigger.kill()
    extra.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill())
  }
}

/* varieties on mobile: stacked panel reveals */
function varietiesStacked () {
  const triggers = []
  for (const panel of document.querySelectorAll('.vpanel')) {
    const items = panel.querySelectorAll('.vpanel__num, .vpanel__name, .vpanel__photo, .vpanel__note')
    triggers.push(ScrollTrigger.create({
      trigger: panel,
      start: 'top 75%',
      once: true,
      animation: gsap.fromTo(items,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }),
    }))
  }
  return triggers
}

/* ============================================================
   Cinema — persistent mango, the world changes around it
   beat 1: meet it → beat 2: badges orbit in → the CUT →
   beat 3: fruit drifts onto the green circle, offer slides in
   ============================================================ */
function cinema (desktop) {
  const whole = document.querySelector('.cinema__whole')
  const cut = document.querySelector('.cinema__cut')
  const burst = document.querySelector('.cinema__burst')
  const blob = document.querySelector('.cinema__blob')
  const fruit = document.querySelector('.cinema__fruit')
  const badges = gsap.utils.toArray('.rbadge')
  const offerItems = gsap.utils.toArray(
    '.cinema__offer .offer-list li, .cinema__offer .cinema__price, .cinema__offer .btn')

  gsap.set(cut, { opacity: 0, scale: 0.5, rotation: -18 })
  gsap.set(burst, { scale: 0, opacity: 0 })
  /* badges wait near the fruit, ready to eject outward to their slots */
  const fromOff = [
    { x: 130, y: 90 }, { x: -130, y: 90 },
    { x: 150, y: -10 }, { x: -150, y: -10 },
    { x: 0, y: -130 },
  ]
  const tilt = [-2.5, 2.5, -1.5, 1.5, -1]
  badges.forEach((b, i) => gsap.set(b, {
    opacity: 0, scale: 0.5, x: fromOff[i].x, y: fromOff[i].y, rotation: tilt[i],
  }))
  gsap.set(offerItems, { opacity: 0, x: desktop ? -36 : 0, y: desktop ? 0 : 30 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.cinema',
      start: 'top top',
      end: '+=260%',
      pin: '.cinema__pin',
      scrub: 1,
      anticipatePin: 1,
      refreshPriority: 5,
    },
    defaults: { ease: 'none' },
  })

  /* the badges arrive almost immediately — the hero rise already
     introduced the fruit, so no duplicate "meet the mango" screen */
  tl.fromTo(whole, { scale: 0.96, rotation: -3, yPercent: 2 }, { scale: 1.04, rotation: 3, yPercent: -2, duration: 1.6 }, 0)
    .fromTo('.cinema__ghost', { scale: 1, xPercent: 2 }, { scale: 1.07, xPercent: -2, duration: 3.6 }, 0)
    .to('.cinema__intro', { opacity: 0, y: -30, duration: 0.25, ease: 'power2.in' }, 0.35)
  badges.forEach((b, i) => {
    tl.to(b, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.5, ease: 'back.out(1.5)' }, 0.45 + i * 0.09)
    /* counter-rotate each badge so text stays level while the ring orbits */
    tl.to(b, { rotation: tilt[i] - 24, duration: 0.75, ease: 'none' }, 0.95)
  })
  /* the whole ring orbits the fruit while it holds on screen */
  gsap.set('.cinema__ring', { transformOrigin: '50% 50%' })
  tl.to('.cinema__ring', { rotation: 24, duration: 0.75, ease: 'none' }, 0.95)
  tl.to({}, { duration: 0.4 })
    .to(badges, { opacity: 0, y: -30, duration: 0.3, stagger: 0.04, ease: 'power2.in' }, 1.55)

  /* the CUT — whole spins out, juice flash, the frame jolts, hedgehog pops in */
  tl.to(fruit, { y: -14, duration: 0.08, ease: 'power2.out' }, 2.05)
    .to(fruit, { y: 0, duration: 0.22, ease: 'power2.in' }, 2.13)
    .to(whole, { scale: 1.3, rotation: 16, opacity: 0, duration: 0.4, ease: 'power2.in' }, 1.75)
    .to(burst, { scale: 1.5, opacity: 0.7, duration: 0.25, ease: 'power1.out' }, 2.05)
    .to(burst, { scale: 2.3, opacity: 0, duration: 0.4 }, 2.3)
    .to(cut, { opacity: 1, scale: 1.12, rotation: 5, duration: 0.45, ease: 'power2.out' }, 2.1)
    .to(cut, { scale: 1, rotation: 0, duration: 0.3 }, 2.55)
    .to({}, { duration: 0.25 })                      // let the cut land

  /* cursor parallax — ghost word far plane, fruit near plane
     (inner images only, so it never fights the scroll timeline) */
  if (desktop && window.matchMedia('(hover: hover)').matches) {
    const sec = document.querySelector('.cinema')
    const ghostX = gsap.quickTo('.cinema__ghost', 'x', { duration: 0.9, ease: 'power3.out' })
    const wholeX = gsap.quickTo(whole, 'x', { duration: 0.6, ease: 'power3.out' })
    const wholeY = gsap.quickTo(whole, 'y', { duration: 0.6, ease: 'power3.out' })
    const cutX = gsap.quickTo(cut, 'x', { duration: 0.6, ease: 'power3.out' })
    const cutY = gsap.quickTo(cut, 'y', { duration: 0.6, ease: 'power3.out' })
    sec.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      ghostX(nx * -20)
      wholeX(nx * 12); wholeY(ny * 8)
      cutX(nx * 12); cutY(ny * 8)
    })
    sec.addEventListener('mouseleave', () => {
      ghostX(0); wholeX(0); wholeY(0); cutX(0); cutY(0)
    })
  }

  /* the offer scene: fruit drifts aside onto the circle */
  const drift = desktop ? { x: '20vw', scale: 0.92 } : { y: '-15vh', scale: 0.78 }
  tl.to(fruit, { ...drift, duration: 0.6, ease: 'power2.inOut' }, 2.9)
    .to(blob, desktop
      ? { opacity: 1, x: '20vw', duration: 0.55, ease: 'power2.inOut' }
      : { opacity: 1, y: '-15vh', duration: 0.55, ease: 'power2.inOut' }, 2.9)
    .to('.cinema__offer', { opacity: 1, duration: 0.2 }, 3.05)
    .to(offerItems, { opacity: 1, x: 0, y: 0, duration: 0.45, stagger: 0.09, ease: 'power2.out' }, 3.1)
    .to({}, { duration: 0.5 })                       // hold the offer on screen
}

/* ============================================================
   Quote — word cascade
   ============================================================ */
function quote () {
  gsap.fromTo('.quote__line .word',
    { opacity: 0, y: 40, rotation: 4 },
    {
      opacity: 1, y: 0, rotation: 0,
      duration: 0.8,
      stagger: 0.06,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.quote', start: 'top 80%', once: true, refreshPriority: 2 },
    })
}

/* ============================================================
   Footer — orchard parallax-zoom + per-letter reveal
   ============================================================ */
function footer () {
  gsap.fromTo('.footer__bg-wrap',
    { yPercent: -7, scale: 1.15 },
    {
      yPercent: 7, scale: 1.02, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom top', scrub: true, refreshPriority: 1 },
    })

  gsap.set('.fchar__inner', { yPercent: 110 })
  gsap.set('.footer__title', { visibility: 'visible' })
  gsap.to('.fchar__inner', {
    yPercent: 0,
    duration: 1.0,
    ease: 'expo.out',
    stagger: 0.05,
    scrollTrigger: { trigger: '.footer__title', start: 'top 85%', once: true, refreshPriority: 1 },
  })
}

/* ============================================================
   Magnetic buttons (pointer devices only)
   ============================================================ */
function magnetic () {
  if (!window.matchMedia('(hover: hover)').matches) return
  for (const btn of document.querySelectorAll('[data-magnetic]')) {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect()
      xTo((e.clientX - r.left - r.width / 2) * 0.25)
      yTo((e.clientY - r.top - r.height / 2) * 0.35)
    })
    btn.addEventListener('mouseleave', () => { xTo(0); yTo(0) })
  }
}
