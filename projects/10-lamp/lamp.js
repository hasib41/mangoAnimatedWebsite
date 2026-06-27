/* Cute Lamp — the hanging white rope is a real pull-chain switch.
   Grab it, drag it DOWN against the cord; at the detent it CLICKS (light pops,
   knob pops), and on release it snaps back up with a springy recoil. A tap or
   keyboard press does the same toggle with a quick scripted yank.

   The live page never toggles on its own. Self-play exists only behind
   window.start(), which the Shorts recorder calls after its pre-roll. */

const lamp   = document.querySelector('.lamp');
const pull   = document.querySelector('.pull');
const knob   = document.querySelector('.rope-knob');
const body   = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const MAX    = 46;   // furthest the rope travels (svg user units)
const DETENT = 24;   // pull past this and the switch clicks

/* screen px → svg user units, so the rope tracks the pointer 1:1 at any size */
let scale = 1;
const measure = () => {
  const h = lamp.getBoundingClientRect().height;
  scale = h ? 384 / h : 1;
};
measure();
addEventListener('resize', measure);

const setPressed = on => pull.setAttribute('aria-pressed', String(on));

/* ── click sounds ──────────────────────────────────────────────────────────
   One switch clip in public/sounds/ plays on every toggle (same sound for on
   and off). Web Audio gives tight, overlappable, zero-latency playback. It's
   started on the first user gesture per browser autoplay rules, and silently
   no-ops if the file is missing — so the page works with or without it.
   Point both keys at different files if you ever want distinct on/off clicks. */
const SFX = { on: '/sounds/onOffSwitch.mp3', off: '/sounds/onOffSwitch.mp3' };
let actx = null;
const sfx = {};

function initAudio() {
  if (actx) return;
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return; }
  for (const [name, url] of Object.entries(SFX)) {
    fetch(url)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then(buf => actx.decodeAudioData(buf))
      .then(b => { sfx[name] = b; })
      .catch(() => {});           // file absent → just stay silent
  }
}

function playSfx(name) {
  const buf = sfx[name] || sfx.on;   // fall back to the on-click if off is missing
  if (!actx || !buf) return;
  if (actx.state === 'suspended') actx.resume();
  const src = actx.createBufferSource();
  const gain = actx.createGain();
  gain.gain.value = 0.55;
  src.buffer = buf;
  src.connect(gain).connect(actx.destination);
  src.start();
}

function toggle() {
  const on = lamp.classList.toggle('is-on');
  setPressed(on);
  playSfx(on ? 'on' : 'off');
}

function clickPop() {                       // knob pulse at the click moment
  knob.classList.remove('pop');
  void knob.getBoundingClientRect();
  knob.classList.add('pop');
}
knob.addEventListener('animationend', () => knob.classList.remove('pop'));

/* quick scripted yank for tap / keyboard (no drag) */
function quickPull() {
  if (reduce) { toggle(); return; }
  pull.classList.remove('snap');
  pull.style.transform = '';
  pull.classList.remove('pulling');
  void pull.getBoundingClientRect();
  pull.classList.add('pulling');
  setTimeout(() => { toggle(); clickPop(); }, 90);   // clicks at the bottom of the yank
}
pull.addEventListener('animationend', e => {
  if (e.animationName === 'pull') pull.classList.remove('pulling');
});

/* ── drag the rope ─────────────────────────────────────────────────────── */
let dragging = false, startY = 0, clicked = false, travel = 0;

pull.addEventListener('pointerdown', e => {
  e.preventDefault();
  initAudio();                          // unlock audio on the first gesture
  pull.focus({ preventScroll: true });
  measure();
  dragging = true; clicked = false; travel = 0;
  startY = e.clientY;
  pull.classList.remove('snap', 'pulling');
  pull.classList.add('dragging');
  try { pull.setPointerCapture(e.pointerId); } catch (_) {}
});

addEventListener('pointermove', e => {
  if (!dragging) return;
  const dy = e.clientY - startY;
  travel = Math.max(travel, Math.abs(dy));
  const n = Math.max(0, Math.min(dy * scale, MAX));   // only downward, clamped
  pull.style.transform = `translateY(${n}px)`;
  if (!clicked && n >= DETENT) { clicked = true; toggle(); clickPop(); }
});

function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  pull.classList.remove('dragging');
  try { pull.releasePointerCapture(e.pointerId); } catch (_) {}

  // barely moved → treat as a tap and toggle with a scripted yank
  if (!clicked && travel < 6) { pull.style.transform = ''; quickPull(); return; }

  // otherwise spring back up to rest (whether or not it clicked)
  pull.classList.add('snap');
  pull.style.transform = 'translateY(0px)';
  setTimeout(() => { pull.classList.remove('snap'); pull.style.transform = ''; }, 520);
}
addEventListener('pointerup', endDrag);
addEventListener('pointercancel', endDrag);

pull.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); initAudio(); quickPull(); }
});

/* ── editor reveal + recorder-only self-play ───────────────────────────── */
function typeCode() {
  body.classList.remove('lit');
  void body.offsetWidth;
  body.classList.add('lit');
}

/* ── recorder cursor ───────────────────────────────────────────────────────
   For recordings, a visible pointer moves to the bead and physically DRAGS the
   cord — it dispatches real pointer events, so the same drag/detent/snap code a
   user triggers is what fires here (perfectly in sync). Only window.start()
   (the recorder hook) uses it; the live page never does. */
const TIPX = 5, TIPY = 4;
function makeCursor() {
  const c = document.createElement('div');
  c.className = 'rec-cursor';
  c.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 2.4 L5 19.6 L9.5 15.2 L12.5 21.7 L15.1 20.5 L12.1 14.2 L18 14 Z" fill="#fff" stroke="#15151b" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  document.body.appendChild(c);
  return c;
}
function moveCursor(c, x, y, ms) {
  c.style.transition = ms ? `transform ${ms}ms cubic-bezier(.34,0,.2,1)` : 'none';
  c.style.transform = `translate(${x - TIPX}px, ${y - TIPY}px)`;
}
function beadCenter() {
  const r = knob.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function pe(type, target, x, y) {
  target.dispatchEvent(new PointerEvent(type, {
    clientX: x, clientY: y, pointerId: 1, isPrimary: true,
    button: 0, buttons: type === 'pointerup' ? 0 : 1,
    bubbles: true, cancelable: true, pointerType: 'mouse',
  }));
}
function cursorPull(c) {                         // full grab → drag down → release
  const p = beadCenter();
  pe('pointerdown', pull, p.x, p.y);
  const offs = [12, 26, 38, 46];                 // crosses the 24px detent → toggles
  let i = 0;
  const iv = setInterval(() => {
    const dy = offs[i++];
    pe('pointermove', window, p.x, p.y + dy);
    moveCursor(c, p.x, p.y + dy, 0);
    if (i >= offs.length) {
      clearInterval(iv);
      setTimeout(() => {
        pe('pointerup', window, p.x, p.y + 46);
        const q = beadCenter();
        moveCursor(c, q.x, q.y, 280);            // hand lifts as the cord snaps back
      }, 110);
    }
  }, 42);
}
window.start = () => {
  typeCode();
  const c = makeCursor();
  let p = beadCenter();
  moveCursor(c, p.x + 58, p.y + 80, 0);                                          // off to the side
  setTimeout(() => { const q = beadCenter(); moveCursor(c, q.x, q.y, 620); }, 80);   // approach
  setTimeout(() => cursorPull(c), 800);                                          // pull ON
  setTimeout(() => { const q = beadCenter(); moveCursor(c, q.x + 24, q.y + 12, 520); }, 1350);
  setTimeout(() => { const q = beadCenter(); moveCursor(c, q.x, q.y, 520); }, 3000);  // approach again
  setTimeout(() => cursorPull(c), 3400);                                         // pull OFF
  setTimeout(() => { const q = beadCenter(); moveCursor(c, q.x + 52, q.y + 74, 640); }, 3950);
};

if (reduce) {
  body.classList.add('lit');
  lamp.classList.add('is-on');
  setPressed(true);
} else if (!new URLSearchParams(location.search).has('record')) {
  setTimeout(typeCode, 450);     // live page auto-reveals; ?record holds for start()
}

/* Debug: ?on holds the lamp lit for a clean screenshot. */
if (new URLSearchParams(location.search).has('on')) {
  lamp.classList.add('is-on');
  setPressed(true);
  body.classList.add('lit');
}
