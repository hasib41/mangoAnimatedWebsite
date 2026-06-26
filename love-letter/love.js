/* ============================================================
   LOVE LETTER — interactions
   Vanilla JS, no dependencies.
   ============================================================ */

const $ = (id) => document.getElementById(id);

const aimStage      = $('aimStage');
const target        = $('target');
const targetEnv     = target.querySelector('.envelope');
const arrow         = $('arrow');
const bow           = $('bow');
const nockEl        = $('nock');
const hint          = $('hint');
const hintText      = $('hintText');
const win           = $('window');
const content       = $('content');
const title         = $('title');
const catCanvas     = $('cat');
const buttons       = $('buttons');
const yesBtn        = $('yesBtn');
const noBtn         = $('noBtn');
const finalText     = $('final');
const closeBtn      = $('closeBtn');
const confettiBox   = $('confetti');
const rainBox       = $('rain');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PIXEL CAT SPRITES
   One char = one pixel. '.' = transparent.
   ============================================================ */
const PAL = {
  k: '#221d1c', // body (near-black)
  w: '#fdfdfd', // eye white
  p: '#15110f', // pupil
  r: '#e23b4e', // heart / bow
  d: '#b22a3b', // dark red
  n: '#ff8fa3', // nose
  c: '#ffb3c1', // blush
};

// idle cat — big round sparkly eyes, rosy cheeks, holding a heart
const CAT_IDLE = [
  '..k..........k..',
  '.kkk........kkk.',
  'kkkk........kkkk',
  'kkkkkkkkkkkkkkkk',
  'kwwwwkkkkkkwwwwk',
  'kwppwkkkkkkwppwk',
  'kwppwkkkkkkwppwk',
  'kcckkkknnkkkkcck',
  '.kkkkkkkkkkkkkk.',
  'kkkkkkrrkrrkkkkk',
  'kkkkkrrrrrrrkkkk',
  'kkkkkrrrrrrrkkkk',
  '.kkkkkrrrrrkkkk.',
  '..kkkkkrrrkkkk..',
  '....kk..r.kk....',
  '................',
];

// happy cat — closed smiling eyes + big blush, hugging the heart
const CAT_HAPPY = [
  '..k..........k..',
  '.kkk........kkk.',
  'kkkk........kkkk',
  'kkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkk',
  'kwkkwkkkkkkwkkwk',
  'kkwwkkkkkkkkwwkk',
  'kcckkkknnkkkkcck',
  '.kkkkkkkkkkkkkk.',
  'kkkkkkrrkrrkkkkk',
  'kkkkkrrrrrrrkkkk',
  'kkkkkrrrrrrrkkkk',
  '.kkkkkrrrrrkkkk.',
  '..kkkkkrrrkkkk..',
  '....kk..r.kk....',
  '................',
];

// idle cat mid-blink — eyes become thin closed lines
const CAT_BLINK = [
  '..k..........k..',
  '.kkk........kkk.',
  'kkkk........kkkk',
  'kkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkk',
  'kwwwwkkkkkkwwwwk',
  'kkkkkkkkkkkkkkkk',
  'kcckkkknnkkkkcck',
  '.kkkkkkkkkkkkkk.',
  'kkkkkkrrkrrkkkkk',
  'kkkkkrrrrrrrkkkk',
  'kkkkkrrrrrrrkkkk',
  '.kkkkkrrrrrkkkk.',
  '..kkkkkrrrkkkk..',
  '....kk..r.kk....',
  '................',
];

function drawSprite(canvas, rows){
  const h = rows.length, w = rows[0].length;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y++){
    const row = rows[y];
    for (let x = 0; x < w; x++){
      const col = PAL[row[x]];
      if (col){ ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); }
    }
  }
}

/* ============================================================
   HEART CONFETTI
   ============================================================ */
const CONFETTI_COLORS = ['#e8546a', '#f08aa0', '#d83a52', '#f6b3c2', '#c83048'];

// three depth layers → near hearts are bigger/faster, far ones small/blurred/slow
const PARALLAX = [];   // { el, factor }
function spawnConfetti(scale = 1){
  const LAYERS = [
    { n: 22, factor: 7,  min: 5,  max: 9,  blur: 1.6, op: .5 },  // far
    { n: 24, factor: 16, min: 7,  max: 13, blur: 0,   op: .9 },  // mid
    { n: 18, factor: 30, min: 10, max: 18, blur: 0,   op: 1  },  // near
  ];
  for (const L of LAYERS){
    const layer = document.createElement('div');
    layer.className = 'confetti__layer';
    if (L.blur) layer.style.filter = `blur(${L.blur}px)`;
    layer.style.opacity = L.op;
    const count = Math.round(L.n * scale);
    for (let i = 0; i < count; i++){
      const h = document.createElement('span');
      h.className = 'heart';
      const size = L.min + Math.random() * (L.max - L.min);
      h.style.width = h.style.height = size + 'px';
      h.style.left = Math.random() * 100 + 'vw';
      h.style.top  = Math.random() * 100 + 'vh';
      h.style.background = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
      h.style.animationDuration = (3 + Math.random() * 5).toFixed(2) + 's';
      h.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
      layer.appendChild(h);
    }
    confettiBox.appendChild(layer);
    PARALLAX.push({ el: layer, factor: L.factor });
  }
}

/* ---- pointer parallax (depth) ---- */
let pX = 0, pY = 0, parallaxRAF = 0;
function applyParallax(){
  parallaxRAF = 0;
  for (const { el, factor } of PARALLAX){
    el.style.transform = `translate(${-pX * factor}px, ${-pY * factor}px)`;
  }
  // the letter drifts gently the other way for depth
  target.style.transform = `translateX(-50%) translate(${pX * 12}px, ${pY * 9}px)`;
}
function onParallax(e){
  pX = (e.clientX / window.innerWidth  - .5) * 2;
  pY = (e.clientY / window.innerHeight - .5) * 2;
  if (!parallaxRAF) parallaxRAF = requestAnimationFrame(applyParallax);
}

/* ============================================================
   OPEN / CLOSE the letter
   ============================================================ */
function openLetter(){
  aimStage.classList.add('is-gone');
  win.classList.add('is-open');
  win.setAttribute('aria-hidden', 'false');
  // focus the question for screen-reader / keyboard users
  setTimeout(() => yesBtn.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
}

function closeLetter(){
  win.classList.remove('is-open');
  win.setAttribute('aria-hidden', 'true');
  aimStage.classList.remove('is-gone');
  reset();
  resetAim();
  setTimeout(() => aimStage.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
}

closeBtn.addEventListener('click', closeLetter);

/* ============================================================
   CUPID AIM GAME — shoot the arrow at the letter to open it
   ============================================================ */
const DEFAULT_HINT = 'Hold to draw the bow — release to shoot ♡';
const MISS_HINTS = ['So close — try again ♡', 'Aim for the heart ♡', 'Cupid never misses twice ♡'];
const ARROW_LEN  = 56;            // tail → arrowhead tip, px (matches the .arrow CSS)

// ---- archery feel (a real shot, not a robotic snap) ----
const MIN_DRAW   = 6;             // px the nock pulls back the instant you press
const MAX_DRAW   = 34;            // px at full draw
const DRAW_TIME  = 380;           // ms of holding to reach full draw (power builds)
const FLEX       = 0.12;          // how much the bow limbs bend at full draw (subtle, not rubbery)
const BASE_SPEED = 8.5;           // launch px/frame at minimum draw
const MAX_SPEED  = 17;            // launch px/frame at full draw (more draw = more power)
const GRAVITY    = 0.03;          // gentle sag → a natural arc, not a laser line
const RECOIL_MS  = 220;           // bow snaps back & overshoots on release
const HIT_MARGIN = 22;            // base hit-box padding (grows after misses)

// rest pose: aim from the bow straight at the letter (an angled, upward shot)
function restAngle(m){ return clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx)); }

let angle = -Math.PI / 2;   // re-aimed at the letter on layout
let aiming = false;         // string is held back
let flying = false;         // arrow is in the air
let missCount = 0;
let drawn = 0;              // current draw-back distance, px
let rafId = 0;              // flight loop
let drawRAF = 0;           // draw-back loop
let drawStartT = 0;        // when the current hold began

// all geometry in aim-stage-local pixels
function metrics(){
  const s = aimStage.getBoundingClientRect();
  const n = nockEl.getBoundingClientRect();
  const e = targetEnv.getBoundingClientRect();
  return {
    w: s.width, h: s.height, left: s.left, top: s.top,
    nx: n.left + n.width  / 2 - s.left,
    ny: n.top  + n.height / 2 - s.top,
    tx: e.left + e.width  / 2 - s.left,
    ty: e.top  + e.height / 2 - s.top,
    thw: e.width / 2, thh: e.height / 2,
  };
}

// keep the shot pointing roughly upward (−170°…−10°)
function clampAngle(a){
  let d = a * 180 / Math.PI;
  if (d >= 0) d = d <= 90 ? -10 : -170;
  else { if (d > -10) d = -10; if (d < -170) d = -170; }
  return d * Math.PI / 180;
}

// bow flex is its own write so the flight loop can recoil it independently of the arrow
function renderBow(deg, flex){
  bow.style.transform = `rotate(${deg}deg) scaleX(${flex})`;
}

function renderAim(m){
  const deg = angle * 180 / Math.PI;
  renderBow(deg, 1 + (drawn / MAX_DRAW) * FLEX);   // limbs bend with the draw
  // the nocked arrow pulls back along the aim line as the string is drawn
  const tx = m.nx - Math.cos(angle) * drawn;
  const ty = m.ny - Math.sin(angle) * drawn;
  arrow.style.transform = `translate(${tx}px, ${ty}px) rotate(${deg}deg)`;
  arrow.classList.add('is-on');
}

function updateAim(clientX, clientY){
  if (flying) return;
  const m = metrics();
  angle = clampAngle(Math.atan2(clientY - m.top - m.ny, clientX - m.left - m.nx));
  if (!aiming) drawn = 0;        // hovering = arrow rests on the string
  renderAim(m);                  // while held, the draw loop owns `drawn`; we just re-aim
}

// ---- progressive draw: hold to pull the string back, tension builds toward full draw ----
function startDraw(){
  if (reduceMotion){ drawn = MAX_DRAW; renderAim(metrics()); return; }  // no charging animation
  drawStartT = performance.now();
  if (!drawRAF) drawRAF = requestAnimationFrame(drawStep);
}
function drawStep(now){
  drawRAF = 0;
  if (!aiming || flying) return;
  const t = Math.min(1, (now - drawStartT) / DRAW_TIME);
  const eased = 1 - Math.pow(1 - t, 2.2);              // quick at first, resists near full draw
  drawn = MIN_DRAW + (MAX_DRAW - MIN_DRAW) * eased;
  if (t > 0.8) drawn += Math.sin(now / 38) * 0.7;      // held-at-full tension quiver
  renderAim(metrics());
  drawRAF = requestAnimationFrame(drawStep);
}

// let go → power scales with how far it was drawn
function release(){
  if (!aiming || flying) return;
  aiming = false;
  cancelAnimationFrame(drawRAF); drawRAF = 0;
  fire();
}

function fire(power){
  if (flying) return;
  // power 0..1 from how far the string was drawn (defaults to current draw, for the record API)
  if (power == null) power = clamp01((drawn - MIN_DRAW) / (MAX_DRAW - MIN_DRAW));
  flying = true;
  aiming = false;

  const m = metrics();
  const launchDraw = drawn;                 // arrow starts fully drawn, then snaps forward
  const startFlex  = 1 + (launchDraw / MAX_DRAW) * FLEX;
  drawn = 0;

  // reduced motion / no animation: resolve instantly
  if (reduceMotion){
    renderBow(angle * 180 / Math.PI, 1);
    onHit(m);
    return;
  }

  const speed = BASE_SPEED + power * (MAX_SPEED - BASE_SPEED);
  let vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
  let tx = m.nx - Math.cos(angle) * launchDraw;   // released from the drawn-back nock
  let ty = m.ny - Math.sin(angle) * launchDraw;
  const margin = HIT_MARGIN + missCount * 12;
  const t0 = performance.now();
  let frame = 0;

  function step(now){
    // the bow snaps back to rest and overshoots (limbs un-flex with a little recoil)
    const bt = Math.min(1, (now - t0) / RECOIL_MS);
    const flex = 1 + (startFlex - 1) * Math.cos(bt * Math.PI * 1.5) * (1 - bt);
    renderBow(angle * 180 / Math.PI, Math.max(0.9, flex));

    // flight: gravity bends the path, the arrowhead pitches to follow it
    vy += GRAVITY;
    tx += vx; ty += vy;
    const dir = Math.atan2(vy, vx);
    const cos = Math.cos(dir), sin = Math.sin(dir);
    arrow.style.transform = `translate(${tx}px, ${ty}px) rotate(${dir * 180 / Math.PI}deg)`;
    const tipx = tx + cos * ARROW_LEN;
    const tipy = ty + sin * ARROW_LEN;

    if ((frame++ & 1) === 0){                       // soft trail behind the arrow
      spawnTrail(tx + cos * ARROW_LEN * 0.5, ty + sin * ARROW_LEN * 0.5);
    }
    if (Math.abs(tipx - m.tx) <= m.thw + margin &&
        Math.abs(tipy - m.ty) <= m.thh + margin){
      onHit(m, dir); return;
    }
    if (tipx < -80 || tipx > m.w + 80 || tipy < -80 || tipy > m.h + 80){
      onMiss(); return;
    }
    rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

function spawnTrail(x, y){
  const t = document.createElement('span');
  t.className = 'heart trail';
  t.style.left = (x - 5.5) + 'px';
  t.style.top  = (y - 5.5) + 'px';
  t.style.background = '#f4a9b8';
  t.addEventListener('animationend', () => t.remove());
  aimStage.appendChild(t);
}

function onHit(m, dir){
  cancelAnimationFrame(rafId);
  flying = false; drawn = 0;
  // stick the arrow so its tip rests in the envelope, angled the way it arrived
  const a = (dir == null) ? angle : dir;
  const deg = a * 180 / Math.PI;
  const tailx = m.tx - Math.cos(a) * ARROW_LEN;
  const taily = m.ty - Math.sin(a) * ARROW_LEN;
  arrow.style.transform = `translate(${tailx}px, ${taily}px) rotate(${deg}deg)`;
  target.classList.add('is-hit');
  target.classList.remove('is-pulse');
  if (!reduceMotion) spawnBurst(aimStage, m.tx, m.ty, 18);
  setTimeout(openLetter, reduceMotion ? 0 : 470);
}

function onMiss(){
  cancelAnimationFrame(rafId);
  flying = false; drawn = 0;
  arrow.classList.remove('is-on');
  hintText.textContent = MISS_HINTS[Math.min(missCount, MISS_HINTS.length - 1)];
  missCount++;
  if (missCount >= 2) target.classList.add('is-pulse');  // generous + visible target
  setTimeout(() => {
    if (flying) return;
    const m = metrics();
    angle = restAngle(m);
    renderAim(m);
  }, 320);
}

function resetAim(){
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(drawRAF); drawRAF = 0;
  flying = false; aiming = false; missCount = 0; drawn = 0;
  target.classList.remove('is-hit', 'is-pulse');
  hintText.textContent = DEFAULT_HINT;
  const m = metrics();
  angle = restAngle(m);
  renderAim(m);
}

// ---- input: pointer — press to nock & draw, hold to build power, release to loose ----
aimStage.addEventListener('pointermove', (e) => { if (!flying) updateAim(e.clientX, e.clientY); });
aimStage.addEventListener('pointerdown', (e) => {
  if (flying) return;
  const m = metrics();
  angle = clampAngle(Math.atan2(e.clientY - m.top - m.ny, e.clientX - m.left - m.nx));
  aiming = true;
  startDraw();
});
window.addEventListener('pointerup', release);

// ---- input: keyboard (auto-aim at the target, draws then looses, always lands) ----
aimStage.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  e.preventDefault();
  if (flying || aiming) return;
  const m = metrics();
  angle = clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx));
  aiming = true;
  startDraw();
  setTimeout(release, reduceMotion ? 0 : DRAW_TIME + 60);   // hold to full draw, then loose
});

window.addEventListener('resize', () => { if (!flying) renderAim(metrics()); });

/* ============================================================
   THE DODGING "NO" BUTTON
   ============================================================ */
let yesScale = 1;
let catState = 'idle';   // 'idle' | 'happy' — gates the blink

function dodge(e){
  if (e){ e.preventDefault(); }

  const area = content.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();
  const pad = 10;

  // switch to absolute on first dodge, keeping current visual spot
  if (getComputedStyle(noBtn).position !== 'absolute'){
    const startX = b.left - area.left;
    const startY = b.top  - area.top;
    noBtn.style.position = 'absolute';
    noBtn.style.left = startX + 'px';
    noBtn.style.top  = startY + 'px';
  }

  // YES box (it's growing) in content-local coords — NO must never cover it
  const y = yesBtn.getBoundingClientRect();
  const m = 16;
  const yesL = y.left - area.left - m, yesR = y.right  - area.left + m;
  const yesT = y.top  - area.top  - m, yesB = y.bottom - area.top  + m;

  // roam the cat + button zone, but stay clear of the question text up top
  const minY = area.height * 0.32;
  const maxX = Math.max(pad, area.width  - b.width  - pad);
  const maxY = Math.max(minY + pad, area.height - b.height - pad);

  // pick a spot that doesn't overlap YES (retry a handful of times)
  let nx = pad, ny = minY;
  for (let i = 0; i < 24; i++){
    nx = pad  + Math.random() * (maxX - pad);
    ny = minY + Math.random() * (maxY - minY);
    const hitsYes = nx < yesR && nx + b.width > yesL && ny < yesB && ny + b.height > yesT;
    if (!hitsYes) break;
  }
  noBtn.style.left = nx + 'px';
  noBtn.style.top  = ny + 'px';

  // the more it dodges, the more tempting YES becomes
  yesScale = Math.min(1.8, yesScale + 0.07);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.classList.add('is-tempting');
}

noBtn.addEventListener('pointerenter', dodge);   // desktop hover
noBtn.addEventListener('pointerdown', dodge);    // touch — flee before the tap lands
noBtn.addEventListener('click', dodge);          // belt and braces
noBtn.addEventListener('focus', dodge);          // keyboard tab

/* ============================================================
   WIN — "YES" clicked
   ============================================================ */
function sayYes(){
  catState = 'happy';
  title.textContent = 'Yayyy! I love you ♡';
  drawSprite(catCanvas, CAT_HAPPY);
  catCanvas.setAttribute('aria-label', 'A happy cat with a bow');

  buttons.hidden = true;
  finalText.hidden = false;
  // next frame so the transition runs
  requestAnimationFrame(() => finalText.classList.add('is-show'));

  // floating heart above the cat
  const fh = document.createElement('span');
  fh.className = 'heart cat-heart';
  fh.style.left = '50%';
  fh.style.top = '60px';
  fh.style.transform = 'translateX(-50%)';
  content.appendChild(fh);

  content.classList.add('is-won');
  win.classList.add('is-celebrate');
  if (!reduceMotion){ heartBurst(); celebrate(); }
}

yesBtn.addEventListener('click', sayYes);

/* ============================================================
   HEART BURST
   ============================================================ */
function spawnBurst(parent, cx, cy, n = 18){
  for (let i = 0; i < n; i++){
    const h = document.createElement('span');
    h.className = 'heart burst';
    const size = 10 + Math.random() * 14;
    h.style.width = h.style.height = size + 'px';
    h.style.left = (cx - size / 2) + 'px';
    h.style.top  = (cy - size / 2) + 'px';
    h.style.background = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
    const ang = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 110;
    h.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
    h.style.setProperty('--by', (Math.sin(ang) * dist - 40) + 'px');
    h.style.animationDelay = (Math.random() * 0.15).toFixed(2) + 's';
    h.addEventListener('animationend', () => h.remove());
    parent.appendChild(h);
  }
}

function heartBurst(n = 22){
  spawnBurst(content,
    catCanvas.offsetLeft + catCanvas.offsetWidth / 2,
    catCanvas.offsetTop  + catCanvas.offsetHeight / 2, n);
}

/* ============================================================
   CELEBRATION — a real "tada": heart-confetti cannons fire up
   from the two bottom corners and arc back down under gravity,
   with a light fall from the top, for ~3 seconds. Many colours,
   big hearts, all driven by one rAF physics loop.
   ============================================================ */
const LOVE_COLORS = [
  '#e8546a', '#ff5d8f', '#d83a52', '#f08aa0', '#ff8fab',
  '#c83048', '#ff7eb3', '#c79bff', '#ff9e6b', '#ffd56b', '#f6b3c2',
];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

const GRAVITY_C = 0.20;   // gentle gravity → hearts float high and fall slowly
const DRAG_C    = 0.993;  // a touch of air resistance so they settle

const confetti = [];      // live particles
let confettiRAF = 0;
let confettiTimer = 0;
let confScale = 1;        // viewport scale so phones get proportional (not giant) hearts

function addConfetti(x, y, vx, vy, size){
  const el = document.createElement('span');
  el.className = 'heart confetti-heart';
  el.style.width = el.style.height = size.toFixed(0) + 'px';
  el.style.background = pick(LOVE_COLORS);
  rainBox.appendChild(el);
  confetti.push({ el, x, y, vx, vy, rot: rand(0, 360), vrot: rand(-7, 7), age: 0, life: rand(2.6, 3.6) });
}

// a popper: fire `n` hearts from (x,y) toward `ang` (rad) with spread
function popper(x, y, ang, n){
  for (let i = 0; i < n; i++){
    const a  = ang + rand(-0.42, 0.42);
    const sp = rand(14, 21) * confScale;           // gentle launch → a tall, slow arc
    addConfetti(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(48, 96) * confScale);  // big hearts, wide size variety
  }
}

function confettiBurst(){
  const W = innerWidth, H = innerHeight;
  const n = confScale < 0.7 ? 4 : 5;               // fewer particles on small/phone screens
  popper(-14,    H + 14, -Math.PI * 0.34, n);      // left   → up & inward (steep, climbs high)
  popper(W + 14, H + 14, -Math.PI * 0.66, n);      // right  → up & inward
  popper(W / 2,  H + 14, -Math.PI * 0.50, n);      // bottom → a tall fountain straight up
}

function confettiTick(){
  confettiRAF = 0;
  const H = innerHeight;
  for (let i = confetti.length - 1; i >= 0; i--){
    const p = confetti[i];
    p.vy += GRAVITY_C * confScale;
    p.vx *= DRAG_C; p.vy *= DRAG_C;
    p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.age += 1 / 60;
    const o = p.age < 0.1 ? p.age / 0.1 : Math.max(0, 1 - (p.age - 0.1) / p.life);
    p.el.style.opacity = o.toFixed(2);
    p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot | 0}deg)`;
    if (o <= 0 || p.y > H + 120){ p.el.remove(); confetti.splice(i, 1); }
  }
  if (confetti.length) confettiRAF = requestAnimationFrame(confettiTick);
}

// fire repeatedly for ~3s, then let the last hearts fall
function celebrate(){
  clearInterval(confettiTimer);
  // scale the whole effect to the viewport so phones get proportional hearts, not giant ones
  confScale = Math.max(0.5, Math.min(1.15, Math.min(innerWidth, innerHeight) / 900));
  confettiBurst();
  let t = 0;
  confettiTimer = setInterval(() => {
    t += 360;
    confettiBurst();
    if (t >= 2700){ clearInterval(confettiTimer); confettiTimer = 0; }
  }, 360);
  if (!confettiRAF) confettiRAF = requestAnimationFrame(confettiTick);
}

function stopCelebrate(){
  clearInterval(confettiTimer); confettiTimer = 0;
  cancelAnimationFrame(confettiRAF); confettiRAF = 0;
  confetti.length = 0;
}

// the idle cat blinks now and then
function blink(){
  if (catState !== 'idle') return;
  drawSprite(catCanvas, CAT_BLINK);
  setTimeout(() => { if (catState === 'idle') drawSprite(catCanvas, CAT_IDLE); }, 140);
}

/* ============================================================
   RESET (replay)
   ============================================================ */
function reset(){
  catState = 'idle';
  title.textContent = 'Happy 1 month, my love ♡ Still love me?';
  drawSprite(catCanvas, CAT_IDLE);
  catCanvas.setAttribute('aria-label', 'A little cat holding a heart');
  buttons.hidden = false;
  finalText.hidden = true;
  finalText.classList.remove('is-show');
  content.classList.remove('is-won');
  win.classList.remove('is-celebrate');
  content.querySelectorAll('.cat-heart, .burst').forEach((el) => el.remove());
  stopCelebrate();             // halt the confetti loop + spawner
  rainBox.replaceChildren();   // clear any celebration hearts still on screen
  yesScale = 1;
  yesBtn.style.transform = '';
  yesBtn.classList.remove('is-tempting');
  noBtn.style.position = '';
  noBtn.style.left = '';
  noBtn.style.top = '';
}

/* ============================================================
   INIT
   ============================================================ */
drawSprite(catCanvas, CAT_IDLE);
spawnConfetti(reduceMotion ? 0.5 : 1);

if (!reduceMotion){
  window.addEventListener('pointermove', onParallax, { passive: true });
  setInterval(blink, 3600);
}

// place the bow / arrow once layout (and fonts) settle, aimed at the letter
function layoutAim(){ if (flying) return; const m = metrics(); angle = restAngle(m); renderAim(m); }
requestAnimationFrame(layoutAim);
window.addEventListener('load', layoutAim);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAim);

/* ============================================================
   RECORDING HOOK — only active with ?record (used by record.html)
   Lets a wrapper page drive the demo deterministically.
   ============================================================ */
if (new URLSearchParams(location.search).has('record')){
  window.loveAPI = {
    // aim the bow at the letter (so the draw-back pulls straight down)
    aimUp(){ const m = metrics(); angle = clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx)); renderAim(m); },
    // pull the string back by `px` (visual draw-back + bow flex)
    setDraw(px){ drawn = Math.max(0, px); renderAim(metrics()); },
    // let go → arrow launches
    release(){ fire(); },
    // one-shot auto fire (fallback) — full draw, then loose
    shoot(){ if (flying) return; this.aimUp(); drawn = MAX_DRAW; renderAim(metrics()); fire(); },
    open: openLetter,
    yes:  sayYes,
    dodge,
    reset,
    els: { noBtn, yesBtn, content, aimStage, win, nock: nockEl },
  };
}
