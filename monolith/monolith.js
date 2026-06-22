/* ===== MONOLITH — advanced 3D coverflow (GSAP · Observer · Inertia) ===== */
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
gsap.registerPlugin(Observer, InertiaPlugin);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine   = window.matchMedia('(pointer: fine)').matches;

const stage    = document.getElementById('stage');
const deck     = document.getElementById('deck');
const cards    = [...document.querySelectorAll('.card')];
const faces    = cards.map((c) => c.querySelector('.card__img'));
const ticksW   = document.getElementById('ticks');
const captionEl= document.getElementById('caption');
const glow     = document.querySelector('.deck__glow');
const cNo      = document.getElementById('cNo');
const cTitle   = document.getElementById('cTitle');
const cPlace   = document.getElementById('cPlace');
const cBlurb   = document.getElementById('cBlurb');
const hint     = document.getElementById('hint');
const prevBtn  = document.getElementById('prev');
const nextBtn  = document.getElementById('next');
const cta      = document.getElementById('cta');
const ringEl   = document.querySelector('.nav__ring circle');
const N        = cards.length;

document.getElementById('count').textContent = String(N).padStart(2, '0');

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const wrap = (d) => { d %= N; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d; };

/* ---------- responsive constants ---------- */
let SPACING = 260, DEPTH = 180, ROT = 46, DRAG_UNIT = 340, RANGE = 3;
function layout(){
  const w = cards[0].getBoundingClientRect().width || 300;
  SPACING   = w * 0.88;
  DEPTH     = w * 0.64;
  ROT       = window.innerWidth < 821 ? 38 : 46;
  DRAG_UNIT = w * 1.05;
  RANGE     = window.innerWidth < 521 ? 2 : 3;
}

/* ---------- state ---------- */
const S   = { pos: 0 };           // float carousel position (tweened)
const IS  = { t: reduce ? 1 : 0 };// intro progress 0→1
let heroIdx  = -1;
let hovered  = -1;
let dragging = false;
let live     = false;             // gate caption animations until after entrance
let ptx = 0, pty = 0, px = 0, py = 0;   // pointer target + smoothed (-1..1)

/* ---------- render: paint every card from S.pos each frame ---------- */
function render(p, time){
  for (let i = 0; i < N; i++){
    const d  = wrap(i - p);
    const ad = Math.abs(d);
    const card = cards[i];

    if (ad > RANGE + 0.5){ gsap.set(card, { opacity: 0 }); card.style.pointerEvents = 'none'; continue; }

    const sign = d < 0 ? -1 : 1;
    const near = Math.min(ad, 1);
    const far  = Math.max(ad - 1, 0);

    let X  = sign * (SPACING * near + SPACING * 0.62 * far);
    let Y  = 0;
    let Z  = -(near * DEPTH + far * DEPTH * 0.6);
    let RY = gsap.utils.clamp(-1.15, 1.15, d) * ROT;
    let RX = 0;
    let SC = 1 - near * 0.16 - far * 0.05;
    let OP = ad <= 1 ? 1 : clamp01(1 - far * 0.34);

    /* staggered entrance, rippling out from centre */
    const order = ad;
    const local = clamp01((IS.t - order * 0.05) / 0.5);
    SC *= 0.45 + 0.55 * local;
    OP *= local;
    Y  += (1 - local) * 80;
    RX += (1 - local) * -16;

    const isHero = ad < 0.5;
    if (isHero){
      if (fine){ RY += px * 7; RX += -py * 6; X += px * 16; Y += py * 10; }     // pointer tilt
      Y += Math.sin(time * 1.1) * 4 * IS.t;                                     // idle breathing
    } else if (i === hovered){
      SC += 0.05; Z += DEPTH * 0.2; Y -= 10;                                    // hover lift
    }

    card.style.zIndex = String(Math.round(100 - ad * 10));
    card.style.pointerEvents = isHero ? 'none' : 'auto';
    card.classList.toggle('is-hero', isHero);

    gsap.set(card, { xPercent: -50, yPercent: -50, x: X, y: Y, z: Z, rotationY: RY, rotationX: RX, scale: SC, opacity: OP });

    /* inner-image parallax on the hero only */
    if (faces[i]) gsap.set(faces[i], {
      x: isHero && fine ? px * -16 : 0,
      y: isHero && fine ? py * -12 : 0,
      scale: isHero ? 1.06 : 1.0,
    });
  }

  gsap.set(glow, { xPercent: -50, yPercent: -50, x: px * 42, y: py * 26 });
  syncActive(Math.round(p));
}

/* ---------- paint: smooth pointer, then render (called by ticker + on demand) ---------- */
function paint(){
  const time = gsap.ticker.time || 0;
  px += (ptx - px) * 0.09;
  py += (pty - py) * 0.09;
  render(S.pos, time);
}

/* ---------- caption ---------- */
function buildTitle(text){
  cTitle.textContent = '';
  text.split(' ').forEach((w, i, arr) => {
    const mask = document.createElement('span'); mask.className = 'wm';
    const word = document.createElement('span'); word.className = 'ww';
    word.textContent = w; mask.appendChild(word); cTitle.appendChild(mask);
    if (i < arr.length - 1) cTitle.appendChild(document.createTextNode(' '));
  });
}
function animateCaption(){
  gsap.fromTo(cNo, { yPercent: -75, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
  gsap.fromTo(cTitle.querySelectorAll('.ww'), { yPercent: 118 }, { yPercent: 0, duration: 0.62, ease: 'power3.out', stagger: 0.06 });
  gsap.fromTo(cPlace, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.06 });
  gsap.fromTo(cBlurb, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.12 });
}
function syncActive(rounded){
  const idx = ((rounded % N) + N) % N;
  if (idx === heroIdx) return;
  heroIdx = idx;
  const c = cards[idx];
  stage.style.setProperty('--accent', c.dataset.accent || '#ff5b3a');
  cNo.textContent    = String(idx + 1).padStart(2, '0');
  cPlace.textContent = c.dataset.place;
  cBlurb.textContent = c.dataset.blurb;
  buildTitle(c.dataset.title);
  [...ticksW.children].forEach((t, k) => {
    const on = k === idx;
    t.classList.toggle('is-on', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (live && !reduce) animateCaption();
}

/* ---------- movement ---------- */
let posTween = null;
function killPos(){ posTween && posTween.kill(); posTween = null; }
function snapTo(target){ killPos(); posTween = gsap.to(S, { pos: target, duration: 0.75, ease: 'power3.out' }); }
function advance(dir){ snapTo(Math.round(S.pos) + dir); }
function go(dir){ killAuto(); advance(dir); arm(); }
function goTo(idx){ killAuto(); snapTo(Math.round(S.pos) + wrap(idx - S.pos)); arm(); }

/* ---------- ticks ---------- */
cards.forEach((card, i) => {
  const t = document.createElement('button');
  t.className = 'tick' + (i === 0 ? ' is-on' : '');
  t.type = 'button'; t.setAttribute('role', 'tab');
  t.setAttribute('aria-label', `Show ${card.dataset.title}`);
  t.addEventListener('click', () => goTo(i));
  ticksW.appendChild(t);
});

/* ---------- card interaction ---------- */
cards.forEach((card, i) => {
  card.addEventListener('click', () => goTo(i));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goTo(i); }
  });
  if (fine){
    card.addEventListener('pointerenter', () => { if (!card.classList.contains('is-hero')) hovered = i; });
    card.addEventListener('pointerleave', () => { if (hovered === i) hovered = -1; });
  }
});

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));

deck.tabIndex = 0;
deck.setAttribute('aria-label', 'Coverflow — use left and right arrow keys');
deck.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight'){ e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft'){  e.preventDefault(); go(-1); }
});

/* ---------- autoplay + progress ring ---------- */
const HOLD = 4.8;
const RING_C = 2 * Math.PI * 22;
if (ringEl){ ringEl.style.strokeDasharray = RING_C; ringEl.style.strokeDashoffset = RING_C; }
const ringS = { p: 0 };
function setRing(){ if (ringEl) ringEl.style.strokeDashoffset = RING_C * (1 - ringS.p); }
let autoTween = null, paused = false;
function killAuto(){ autoTween && autoTween.kill(); autoTween = null; ringS.p = 0; setRing(); }
function arm(){
  if (reduce || paused) return;
  killAuto();
  autoTween = gsap.to(ringS, { p: 1, duration: HOLD, ease: 'none', onUpdate: setRing,
    onComplete: () => { advance(1); arm(); } });
}
if (fine){
  deck.addEventListener('mouseenter', () => { paused = true; killAuto(); });
  deck.addEventListener('mouseleave', () => { paused = false; arm(); });
}
document.addEventListener('visibilitychange', () => { if (document.hidden) killAuto(); else arm(); });

/* ---------- pointer parallax ---------- */
if (fine && !reduce){
  deck.addEventListener('pointermove', (e) => {
    const r = deck.getBoundingClientRect();
    ptx = (e.clientX - r.left) / r.width * 2 - 1;
    pty = (e.clientY - r.top) / r.height * 2 - 1;
  });
  deck.addEventListener('pointerleave', () => { ptx = 0; pty = 0; });
}

/* ---------- magnetic buttons ---------- */
function magnetic(el, strength = 0.4){
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  });
  el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
}
if (fine && !reduce) [prevBtn, nextBtn, cta].forEach((el) => el && magnetic(el));

/* ---------- drag + wheel via Observer (with inertia) ---------- */
let wheelLock = false;
function initObserver(){
  Observer.create({
    target: deck, type: 'wheel,touch,pointer',
    dragMinimum: 3, tolerance: 8, lockAxis: true,
    onPress:   () => { killPos(); killAuto(); dragging = true; deck.classList.add('is-grabbing'); hint.classList.add('is-gone'); },
    onDrag:    (self) => { S.pos -= self.deltaX / DRAG_UNIT; },
    onRelease: (self) => {
      dragging = false; deck.classList.remove('is-grabbing');
      killPos();
      posTween = gsap.to(S, {
        inertia: { pos: { velocity: -self.velocityX / DRAG_UNIT, end: (x) => Math.round(x) } },
        onComplete: arm,
      });
    },
    onWheel: (self) => {
      if (wheelLock) return;
      wheelLock = true; setTimeout(() => (wheelLock = false), 140);
      hint.classList.add('is-gone');
      go(self.deltaY > 0 || self.deltaX > 0 ? 1 : -1);
    },
  });
}

/* ---------- resize ---------- */
let rTimer = null;
window.addEventListener('resize', () => { clearTimeout(rTimer); rTimer = setTimeout(layout, 120); });

/* ---------- reduced-motion fork: flat scroll-snap row ---------- */
function staticMode(){
  document.documentElement.classList.add('is-static');
  stage.classList.add('ready');
  captionEl.classList.add('ready');
  buildTitle(cards[0].dataset.title); cTitle.style.visibility = 'visible';
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) syncActive(cards.indexOf(e.target)); });
  }, { root: deck, threshold: 0.6 });
  cards.forEach((c) => io.observe(c));
  cards.forEach((card) => card.addEventListener('click', () =>
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })));
}

/* ---------- boot ---------- */
let started = false;
function startup(){
  if (started) return; started = true;
  stage.classList.add('ready');
  captionEl.classList.add('ready');
  live = true;
  buildTitle(cards[0].dataset.title);
  animateCaption();                                              // reveal the first caption
  gsap.to(IS, { t: 1, duration: 1.25, ease: 'power3.out' });     // entrance cascade
  arm();
}

if (reduce){
  staticMode();
} else {
  layout();
  paint();                          // synchronous first paint — never depends on rAF
  gsap.ticker.add(paint);           // continuous parallax + breathing while the tab is visible
  initObserver();
  setTimeout(startup, 40);          // let CSS register initial state, then animate in
  /* safety net: if rAF is throttled (e.g. tab opened in background), force the
     final visible state so the gallery is never left blank */
  setTimeout(() => {
    startup();
    if (IS.t < 1) IS.t = 1;
    gsap.set([cNo, cPlace, cBlurb], { clearProps: 'opacity,transform' });
    gsap.set(cTitle.querySelectorAll('.ww'), { yPercent: 0 });
    paint();
  }, 2200);
  window.addEventListener('load', layout);
}
