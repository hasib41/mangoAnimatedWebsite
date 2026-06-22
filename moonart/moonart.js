/* ===== EXPLORE MOON ART — cosmic hero + accordion gallery (vanilla, lean) ===== */

const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine    = window.matchMedia('(pointer: fine)').matches;
const desktop = window.matchMedia('(min-width: 821px)').matches;
const EASE    = 'cubic-bezier(.22,1,.36,1)';

/* tiny debounce (hoisted) */
function debounce(fn, ms){ let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

/* =========================================================
   1 · COSMIC HERO — depth parallax, starfields, kinetic type
   ========================================================= */
const cosmos = document.querySelector('.cosmos');

/* -- starfields: a single box-shadow field per layer (cheap; only the wrapper
      transforms for parallax, so the field is never repainted) -- */
function starfield(el, count, color, spread){
  const w = window.innerWidth, h = window.innerHeight, s = [];
  for (let i = 0; i < count; i++){
    const x = Math.round((Math.random() * 1.3 - 0.15) * w);
    const y = Math.round((Math.random() * 1.3 - 0.15) * h);
    const r = Math.random() < 0.18 ? spread : 0;
    s.push(`${x}px ${y}px 0 ${r}px ${color}`);
  }
  el.style.boxShadow = s.join(',');
}
const starsFar  = document.getElementById('starsFar');
const starsNear = document.getElementById('starsNear');
function paintStars(){
  if (starsFar)  starfield(starsFar, 90, 'rgba(255,255,255,.72)', 0.4);
  if (starsNear) starfield(starsNear, 46, 'rgba(214,230,255,.95)', 0.9);
}
paintStars();
window.addEventListener('resize', debounce(paintStars, 250));

/* -- pointer parallax: lerp toward target, write translate3d per depth layer -- */
const pxLayers = cosmos ? [...cosmos.querySelectorAll('[data-depth]')] : [];
let tX = 0, tY = 0, cX = 0, cY = 0, pxRAF = null;
function pxTick(){
  cX += (tX - cX) * 0.07;
  cY += (tY - cY) * 0.07;
  for (const l of pxLayers){
    const d = parseFloat(l.dataset.depth) || 0;
    l.style.transform = `translate3d(${(cX * d).toFixed(2)}px, ${(cY * d).toFixed(2)}px, 0)`;
  }
  pxRAF = (Math.abs(tX - cX) > 0.002 || Math.abs(tY - cY) > 0.002) ? requestAnimationFrame(pxTick) : null;
}
function pxKick(){ if (!pxRAF) pxRAF = requestAnimationFrame(pxTick); }
function onPointer(e){
  const r = cosmos.getBoundingClientRect();
  tX = ((e.clientX - r.left) / r.width  - 0.5) * 2;
  tY = ((e.clientY - r.top)  / r.height - 0.5) * 2;
  pxKick();
}
if (cosmos && fine && !reduce){
  cosmos.addEventListener('pointermove', onPointer, { passive: true });
  cosmos.addEventListener('pointerleave', () => { tX = 0; tY = 0; pxKick(); });
}

/* -- kinetic title: each line rises out of its mask with a 3D tilt -- */
function revealHero(){
  if (!cosmos) return;
  cosmos.classList.add('ready');
  const lines = [...cosmos.querySelectorAll('.cosmos__title .ln i')];
  if (reduce){ lines.forEach((l) => (l.style.opacity = 1)); return; }
  lines.forEach((l, k) => l.animate(
    [{ transform: 'translateY(120%) rotateX(-80deg)', opacity: 0 },
     { transform: 'translateY(0) rotateX(0)',          opacity: 1 }],
    { duration: 900, delay: 180 + k * 140, easing: 'cubic-bezier(.16,.84,.3,1)', fill: 'both' }));
}

/* =========================================================
   2 · GALLERY — expanding accordion
   ========================================================= */
const stage    = document.getElementById('stage');
const cards    = [...document.querySelectorAll('.card')];
const dotsWrap = document.getElementById('dots');
const sNo      = document.getElementById('sNo');
const sTitle   = document.getElementById('sTitle');
const sBlurb   = document.getElementById('sBlurb');

let active = 0, timer = null;
let galleryInView = false, gallerySeen = false;
const HOLD = 4200;

/* progress dots */
const dots = cards.map((card, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' is-on' : '');
  dot.type = 'button';
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Show ${card.dataset.title}`);
  dot.addEventListener('click', () => { stop(); activate(i, true); play(); });
  dotsWrap.appendChild(dot);
  return dot;
});

function splitWords(el){
  const text = el.textContent; el.textContent = ''; const out = [];
  text.split(' ').forEach((w, i, arr) => {
    const mask = document.createElement('span'); mask.className = 'wm';
    const word = document.createElement('span'); word.className = 'ww';
    word.textContent = w; mask.appendChild(word); el.appendChild(mask);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    out.push(word);
  });
  return out;
}

function animateScene(){
  if (reduce) return;
  sNo.parentElement.animate(
    [{ opacity: 0, transform: 'translateY(8px) scale(.9)' }, { opacity: 1, transform: 'none' }],
    { duration: 420, easing: EASE, fill: 'both' });
  splitWords(sTitle).forEach((w, k) => w.animate(
    [{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }],
    { duration: 620, delay: 80 + k * 90, easing: EASE, fill: 'both' }));
  sBlurb.animate(
    [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
    { duration: 520, delay: 240, easing: EASE, fill: 'both' });
}

function activate(i, animate){
  active = (i + cards.length) % cards.length;
  cards.forEach((c, k) => c.classList.toggle('is-active', k === active));
  dots.forEach((d, k) => {
    const on = k === active;
    d.classList.toggle('is-on', on);
    d.setAttribute('aria-selected', on ? 'true' : 'false');
  });

  const c = cards[active];
  document.documentElement.style.setProperty('--accent', c.dataset.accent || '#4ad9ff');
  sNo.textContent    = String(active + 1).padStart(2, '0');
  sTitle.textContent = c.dataset.title;
  sBlurb.textContent = c.dataset.blurb;

  if (animate) animateScene();
}

function next(){ activate(active + 1, true); }
function play(){ if (reduce || !desktop || !galleryInView) return; stop(); timer = setInterval(next, HOLD); }
function stop(){ if (timer){ clearInterval(timer); timer = null; } }

/* per-card interaction */
cards.forEach((card, i) => {
  if (fine){
    card.addEventListener('mouseenter', () => { stop(); activate(i, true); });
    card.addEventListener('mouseleave', play);
  }
  card.addEventListener('click', () => { stop(); activate(i, true); play(); });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); stop(); activate(i, true); play(); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); stop(); activate(active + 1, true); cards[active].focus(); play(); }
    if (e.key === 'ArrowLeft'){  e.preventDefault(); stop(); activate(active - 1, true); cards[active].focus(); play(); }
  });
});

document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else play(); });

/* reveal + autoplay only while the gallery is on screen */
if (stage){
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      galleryInView = en.isIntersecting;
      if (en.isIntersecting){
        stage.classList.add('ready');
        if (!gallerySeen){ gallerySeen = true; if (!reduce) animateScene(); }
        play();
      } else stop();
    });
  }, { threshold: 0.3 });
  io.observe(stage);
}

/* go */
activate(0, false);
requestAnimationFrame(revealHero);
