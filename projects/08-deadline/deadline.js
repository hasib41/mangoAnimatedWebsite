/* ============================================================
   INTERACTIVE DEADLINE
   A coding-meme made real: a red "deadline reaper" rides the
   leading edge of a filling countdown bar toward a developer
   hunched over a keyboard. A genuine timer drives the whole
   thing — and as it runs, the matching line of the code panel
   lights up. Hit "Ship it" before day 0 to escape; otherwise
   the reaper catches you.

   Best-practice notes:
   - ONE GSAP timeline owns the run; idle loops own only their
     own sub-elements (no two tweens write the same transform).
   - Only transform/opacity ever animate.
   - Full prefers-reduced-motion fork: a composed still frame,
     no flashing, no motion.
   - Self-play is gated behind start() so the recording rig can
     hold on frame one through its pre-roll.
   ============================================================ */

import gsap from 'gsap';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isRecord     = new URLSearchParams(location.search).has('record');

/* ---------- elements ---------- */
const $ = (s) => document.querySelector(s);
const scene    = $('#scene');
const fill     = $('#fill');
const ticksBox = $('#ticks');
const reaper   = $('#reaper');     // outer: position + loom (run)
const reaperImg= $('#reaperImg');  // inner: idle bob
const dev      = $('#dev');        // outer: parallax + climax
const devImg   = $('#devImg');     // inner: idle typing jitter
const danger   = $('#danger');
const counter  = $('#counter');
const dayNum   = $('#dayNum');
const dayWord  = $('#dayWord');
const verdict  = $('#verdict');
const verdictText = $('#verdictText');
const codeEl   = $('#code');
const daysRange= $('#daysRange');
const daysOut  = $('#daysOut');
const shipBtn  = $('#ship');
const restartBtn = $('#restart');

const PER_DAY = 0.92;            // seconds of real time per "day"
const lines = [];               // code <span class="ln"> elements, 1-indexed via lines[n]

/* ============================================================
   1 · CODE PANEL — render the source, keep handles to each line
   The `s` field is pre-tokenised HTML so it syntax-highlights.
   ============================================================ */
const k=(t)=>`<span class="tk-key">${t}</span>`;
const f=(t)=>`<span class="tk-fn">${t}</span>`;
const s=(t)=>`<span class="tk-str">${t}</span>`;
const n=(t)=>`<span class="tk-num">${t}</span>`;
const v=(t)=>`<span class="tk-var">${t}</span>`;
const p=(t)=>`<span class="tk-pun">${t}</span>`;
const c=(t)=>`<span class="tk-com">${t}</span>`;

const SRC = [
  c('// a real timer — running right now'),
  `${k('function')} ${f('deadline')}${p('(')}${v('totalDays')}${p(',')} ${v('msPerDay')}${p(') {')}`,
  `  ${k('let')} ${v('day')} ${p('=')} ${v('totalDays')}${p(';')}`,
  `  ${f('render')}${p('(')}${v('day')}${p(');')}`,
  ``,
  `  ${k('const')} ${v('loop')} ${p('=')} ${f('setInterval')}${p('(() => {')}`,
  `    ${v('day')} ${p('-=')} ${n('1')}${p(';')}`,
  `    ${f('render')}${p('(')}${v('day')}${p(');')}            ${c('// bar fills, reaper steps')}`,
  ``,
  `    ${k('if')} ${p('(')}${v('shipped')}${p(')')} ${k('return')} ${f('done')}${p('(')}${s('"SHIPPED"')}${p(');')}`,
  `    ${k('if')} ${p('(')}${v('day')} ${p('===')} ${n('0')}${p(') {')}`,
  `      ${f('clearInterval')}${p('(')}${v('loop')}${p(');')}`,
  `      ${f('done')}${p('(')}${s('"CAUGHT"')}${p(');')}       ${c('// the reaper reaches you')}`,
  `    ${p('}')}`,
  `  ${p('}, ')}${v('msPerDay')}${p(');')}`,
  `${p('}')}`,
];

SRC.forEach((html, i) => {
  const el = document.createElement('span');
  el.className = 'ln';
  el.dataset.n = i + 1;
  el.innerHTML = html || ' ';
  codeEl.appendChild(el);
  lines[i + 1] = el;
});

let liveTimer = null;
/** Light a set of line numbers; auto-clears after `hold` ms. */
function light(nums, hold = 460) {
  for (const el of lines) el && el.classList.remove('is-live');
  for (const nLine of nums) lines[nLine]?.classList.add('is-live');
  clearTimeout(liveTimer);
  if (hold) liveTimer = setTimeout(() => {
    for (const nn of nums) lines[nn]?.classList.remove('is-live');
  }, hold);
}

/* ============================================================
   2 · SCENE GEOMETRY
   ============================================================ */
let travelPx = 0;               // how far the reaper crosses
function measure() {
  // reaper starts at left:0 and should end just behind the dev
  const w = scene.clientWidth;
  travelPx = w * 0.60;
}
measure();

function buildTicks(days) {
  ticksBox.innerHTML = '';
  for (let i = 1; i < days; i++) {
    const t = document.createElement('i');
    t.style.left = (i / days * 100) + '%';
    ticksBox.appendChild(t);
  }
}

/* apply a 0→1 progress to the bar + reaper position/scale.
   The reaper grows as it closes the gap, so it looms over the dev. */
function applyProgress(prog) {
  gsap.set(fill,   { scaleX: prog });
  gsap.set(reaper, { x: travelPx * prog, scale: 0.7 + prog * 0.55 });
}

/* ============================================================
   3 · IDLE LOOPS  (own only their own sub-elements)
   ============================================================ */
let idles = [];
function startIdles() {
  stopIdles();
  idles.push(
    // reaper lurches forward as it stalks — a menacing sway + bob (inner img only)
    gsap.fromTo(reaperImg, { rotation: -3.5, y: '0%' }, { rotation: 3.5, y: '-6%', duration: 0.52, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: 'bottom center' }),
    // developer vibrates with frantic typing (inner img only)
    gsap.to(devImg,    { y: '1.3%', rotation: 0.5, duration: 0.09, yoyo: true, repeat: -1, ease: 'none', transformOrigin: 'bottom right' }),
  );
}
function stopIdles() { idles.forEach((t) => t.kill()); idles = []; gsap.set([reaperImg, devImg], { clearProps: 'transform' }); }

/* ============================================================
   4 · THE RUN
   ============================================================ */
let run = null;                 // the active GSAP timeline
let state = 'idle';             // idle | running | done
let shipped = false;
let currentDays = +daysRange.value;
let lastDayShown = -1;
let autoLoop = !isRecord;       // ambient re-play in live mode
let userActed = false;          // pauses auto-loop after interaction

function setCounter(daysLeft) {
  dayNum.textContent = daysLeft;
  dayWord.textContent = daysLeft === 1 ? 'day' : 'days';
}

function reset() {
  if (run) run.kill();
  stopIdles();
  gsap.killTweensOf([verdict, verdict.firstElementChild, dev, reaper]);
  state = 'idle';
  shipped = false;
  lastDayShown = -1;
  verdict.className = 'verdict';
  gsap.set(verdict, { autoAlpha: 0 });
  gsap.set(dev, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
  gsap.set(reaper, { autoAlpha: 1 });
  gsap.set(danger, { opacity: 0 });
  applyProgress(0);
  setCounter(currentDays);
  buildTicks(currentDays);
  shipBtn.disabled = false;
  shipBtn.textContent = 'Ship it 🚀';
}

function play() {
  reset();
  startIdles();
  state = 'running';
  const proxy = { prog: 0 };

  // setup lines cascade in
  light([3], 180);
  gsap.delayedCall(0.18, () => light([4], 180));
  gsap.delayedCall(0.36, () => light([6], 240));

  run = gsap.timeline({
    delay: 0.55,
    onComplete: () => finish('CAUGHT'),
  });

  // scene settle
  run.from(scene, { autoAlpha: 0.4, duration: 0.4, ease: 'power2.out' }, 0);

  // the countdown itself
  run.to(proxy, {
    prog: 1,
    duration: currentDays * PER_DAY,
    ease: 'none',
    onUpdate() {
      const prog = proxy.prog;
      applyProgress(prog);

      // dread builds in the back third of the run
      gsap.set(danger, { opacity: Math.max(0, (prog - 0.5) * 1.5) });

      const daysLeft = Math.max(0, Math.ceil((1 - prog) * currentDays));
      if (daysLeft !== lastDayShown) {
        lastDayShown = daysLeft;
        setCounter(daysLeft);
        // a tick of countTime(): decrement + render
        if (daysLeft < currentDays) {
          light([7, 8], 300);
          gsap.fromTo(dayNum, { scale: 1.5, color: '#ff3b2f' },
                              { scale: 1, color: '#ff9a86', duration: 0.34, ease: 'back.out(2)' });
          // reaper takes a heavier step as it nears
          gsap.fromTo(reaperImg, { y: '-8%' }, { y: '0%', duration: 0.22, ease: 'power2.out', transformOrigin: 'bottom center' });
        }
      }
    },
  }, 0);
}

/* climax — caught or shipped */
function finish(kind) {
  if (state === 'done') return;
  state = 'done';
  if (run) run.kill();
  const prog = currentProg();
  stopIdles();                 // freeze typing + hover for the climax

  if (kind === 'SHIPPED') {
    light([10], 700);
    verdict.classList.add('is-shipped');
    verdictText.textContent = 'Shipped';
    const left = Math.max(0, Math.ceil((1 - prog) * currentDays));
    counter.innerHTML = `Shipped with <b>${left}</b> ${left === 1 ? 'day' : 'days'} to spare 🚀`;
    // dev launches, reaper deflates
    gsap.to(dev,    { y: -28, rotation: 4, duration: 0.5, ease: 'back.out(2)' });
    gsap.to(dev,    { y: 0, duration: 0.5, delay: 0.5, ease: 'bounce.out' });
    gsap.to(reaper, { autoAlpha: 0, scale: '-=0.2', y: 14, duration: 0.45, ease: 'power2.in' });
    stamp('#5be38b');
  } else {
    light([11, 12, 13], 1400);
    verdict.classList.add('is-caught');
    verdictText.textContent = 'Caught';
    setCounter(0);
    gsap.set(fill, { scaleX: 1 });
    gsap.set(dev, { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set(reaper, { x: travelPx, scale: 1.25 });
    gsap.set([reaperImg], { transformOrigin: 'bottom center' });
    gsap.set(dev, { transformOrigin: 'bottom right' });

    // THE BEAT-DOWN: the reaper rears back and strikes the dev several times.
    const ro = 'bottom center', strikes = 3;
    const tl = gsap.timeline();
    tl.to(reaper,    { x: travelPx - 12, duration: 0.18, ease: 'power2.out' })
      .to(reaperImg, { rotation: -12, y: '-9%', duration: 0.18, ease: 'power2.out', transformOrigin: ro }, '<');

    for (let i = 0; i < strikes; i++) {
      tl.addLabel('hit' + i)
        // chop down + lunge in
        .to(reaperImg, { rotation: 18, y: '0%', duration: 0.11, ease: 'power4.in', transformOrigin: ro })
        .to(reaper,    { x: travelPx + 20, duration: 0.10, ease: 'power4.in' }, '<')
        // impact: red flash + camera shake + the dev gets knocked
        .add(() => gsap.fromTo(danger, { opacity: 0.35 }, { opacity: 0.95, duration: 0.05, yoyo: true, repeat: 1, overwrite: true }))
        .to(scene,     { x: 6, duration: 0.04, yoyo: true, repeat: 3, ease: 'none' }, '<')
        .to(dev,       { x: 14, rotation: 9, duration: 0.08, ease: 'power2.out', transformOrigin: 'bottom right' }, '<')
        .to(dev,       { x: 0, rotation: 0, duration: 0.18, ease: 'elastic.out(1,0.5)' })
        // rear back for the next blow
        .to(reaperImg, { rotation: -10, y: '-8%', duration: 0.16, ease: 'power2.out', transformOrigin: ro }, 'hit' + i + '+=0.12')
        .to(reaper,    { x: travelPx - 8, duration: 0.16, ease: 'power2.out' }, '<');
    }

    // the dev is beaten — slumps over the keyboard and dims; reaper looms
    tl.to(scene,     { x: 0, duration: 0.08 })
      .to(dev,       { y: 20, rotation: 18, opacity: 0.45, duration: 0.5, ease: 'power3.in', transformOrigin: 'bottom right' })
      .to(reaperImg, { rotation: 6, y: '0%', duration: 0.35, ease: 'power2.out', transformOrigin: ro }, '<')
      .add(() => stamp('#ff4d4d'), '-=0.15');
  }

  shipBtn.disabled = true;
  shipBtn.textContent = kind === 'SHIPPED' ? 'Shipped ✓' : 'Too late';

  // ambient re-loop only if the player did nothing (got caught passively).
  // hold long enough for the full beat-down to land first.
  if (autoLoop && !userActed && kind === 'CAUGHT') {
    gsap.delayedCall(4.2, () => { if (state === 'done') play(); });
  } else if (isRecord) {
    gsap.delayedCall(kind === 'CAUGHT' ? 3.2 : 1.6, () => { window.deadlineDone = true; });
  }
}

function stamp(color) {
  const el = verdict.firstElementChild;
  gsap.set(el, { color });
  gsap.fromTo(verdict, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 });
  gsap.fromTo(el,
    { scale: 1.8, rotation: -16 },
    { scale: 1, rotation: -7, duration: 0.5, ease: 'back.out(2.4)' });
}

function currentProg() {
  // recover progress from the reaper's current x
  return travelPx ? gsap.getProperty(reaper, 'x') / travelPx : 0;
}

/* ============================================================
   5 · CONTROLS
   ============================================================ */
function onShip() {
  userActed = true;
  if (state !== 'running') return;
  shipped = true;
  finish('SHIPPED');
}
shipBtn.addEventListener('click', onShip);

restartBtn.addEventListener('click', () => { userActed = true; play(); });

daysRange.addEventListener('input', () => {
  currentDays = +daysRange.value;
  daysOut.textContent = currentDays + 'd';
  userActed = true;
});
daysRange.addEventListener('change', () => { reduceMotion ? staticFrame() : play(); });
daysOut.textContent = currentDays + 'd';

/* keyboard: space / enter = ship (but not while a control has focus,
   so we don't hijack the slider or double-fire a focused button) */
window.addEventListener('keydown', (e) => {
  const onControl = e.target.closest && e.target.closest('button, input');
  if (onControl) return;
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); onShip(); }
});

/* pointer parallax — nudge the dev + floor, never the reaper (run-driven) */
if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  const qx = gsap.quickTo(dev, 'x', { duration: 0.5, ease: 'power3' });
  const qf = gsap.quickTo('.scene__floor', 'x', { duration: 0.6, ease: 'power3' });
  scene.addEventListener('pointermove', (e) => {
    if (state === 'done') return;            // don't fight the climax shake
    const r = scene.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    qx(dx * 10);
    qf(dx * -16);
  });
  scene.addEventListener('pointerleave', () => { if (state !== 'done') { qx(0); qf(0); } });
}

let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => { measure(); applyProgress(currentProg()); }, 150);
});

/* ============================================================
   6 · REDUCED MOTION — a composed still, no motion at all
   ============================================================ */
function staticFrame() {
  const prog = 0.84;
  measure();
  buildTicks(currentDays);
  gsap.set(reaper, { x: travelPx * prog, scale: 1.18 });
  gsap.set(fill, { scaleX: prog });
  gsap.set(danger, { opacity: 0.4 });
  setCounter(Math.ceil((1 - prog) * currentDays));
  light([7, 8], 0);
  shipBtn.disabled = true;
}

/* ============================================================
   7 · BOOT  (start() gated for the recording rig)
   ============================================================ */
function start() {
  if (reduceMotion) { staticFrame(); window.deadlineDone = true; return; }
  play();
}

reset();
if (reduceMotion) staticFrame();

window.deadlineAPI = { start, play: () => { userActed = true; play(); } };

if (!isRecord && !reduceMotion) {
  // live: kick off shortly after load
  if (document.readyState === 'complete') gsap.delayedCall(0.4, start);
  else window.addEventListener('load', () => gsap.delayedCall(0.4, start));
}
