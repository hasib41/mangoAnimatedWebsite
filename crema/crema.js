/* ===== CRÈMA — roast selector, kinetic type, scroll reveals (vanilla) ===== */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE   = 'cubic-bezier(.22,1,.36,1)';
const root   = document.documentElement;

/* =========================================================
   1 · ROAST SELECTOR — the signature interaction
   ========================================================= */
const ROASTS = [
  { key: 'light',    label: 'Light',    accent: '#e7b76d', body: 'Bright & floral',  notes: 'jasmine · stone fruit · honey' },
  { key: 'medium',   label: 'Medium',   accent: '#d9a86c', body: 'Balanced & sweet', notes: 'caramel · toasted almond · cherry' },
  { key: 'dark',     label: 'Dark',     accent: '#c98a4e', body: 'Bold & smoky',     notes: 'dark chocolate · molasses · clove' },
  { key: 'espresso', label: 'Espresso', accent: '#bb7740', body: 'Dense & syrupy',   notes: 'cocoa · brown sugar · char' },
];

const segs    = [...document.querySelectorAll('.roast__seg')];
const bgs      = [...document.querySelectorAll('.roastbg')];
const bodyEl  = document.getElementById('roastBody');
const notesEl = document.getElementById('roastNotes');
const beansEl = document.getElementById('roastBeans');
let roast = 1;

/* preload every roast's beans so the swap never flashes */
ROASTS.forEach((r) => { const im = new Image(); im.src = `/photos/crema/beans/${r.key}.png`; });

function setRoast(i){
  if (i === roast) return;
  roast = i;
  const r = ROASTS[i];
  root.style.setProperty('--accent', r.accent);

  segs.forEach((s, k) => {
    const on = k === i;
    s.classList.toggle('is-on', on);
    if (on) s.setAttribute('aria-pressed', 'true'); else s.removeAttribute('aria-pressed');
  });
  bgs.forEach((b, k) => b.classList.toggle('is-on', k === i));

  if (beansEl){
    const swapBeans = () => { beansEl.src = `/photos/crema/beans/${r.key}.png`; beansEl.alt = `${r.label} roast coffee beans`; };
    if (reduce) swapBeans();
    else beansEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-in', fill: 'forwards' })
      .onfinish = () => { swapBeans(); beansEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: EASE, fill: 'both' }); };
  }

  if (reduce){ bodyEl.textContent = r.body; notesEl.textContent = r.notes; return; }

  /* kinetic note swap: fade out → replace → fade up */
  const wrap = bodyEl.parentElement;
  wrap.animate(
    [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }],
    { duration: 200, easing: 'ease-in', fill: 'forwards' }
  ).onfinish = () => {
    bodyEl.textContent = r.body;
    notesEl.textContent = r.notes;
    wrap.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 440, easing: EASE, fill: 'both' });
  };
}

segs.forEach((s) => s.addEventListener('click', () => setRoast(+s.dataset.i)));

const segGroup = document.querySelector('.roast__segs');
if (segGroup){
  segGroup.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown'){ e.preventDefault(); const n = (roast + 1) % segs.length; setRoast(n); segs[n].focus(); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp'){   e.preventDefault(); const n = (roast - 1 + segs.length) % segs.length; setRoast(n); segs[n].focus(); }
  });
}

/* =========================================================
   2 · HERO TITLE — lines rise out of their masks
   ========================================================= */
const brew = document.querySelector('.brew');
function revealHero(){
  if (!brew) return;
  brew.classList.add('ready');
  const lines = [...document.querySelectorAll('.brew__title .ln i')];
  if (reduce){ lines.forEach((l) => (l.style.opacity = 1)); return; }
  lines.forEach((l, k) => l.animate(
    [{ transform: 'translateY(115%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration: 900, delay: 160 + k * 150, easing: 'cubic-bezier(.16,.84,.3,1)', fill: 'both' }));
}

/* =========================================================
   3 · REVEAL ON SCROLL — menu rows + ritual steps (once)
   ========================================================= */
if (!reduce){
  const reveals = [...document.querySelectorAll('.menu__item, .step, .feature__cap')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = [...el.parentElement.children];
      const idx = sibs.indexOf(el);
      el.animate(
        [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }],
        { duration: 720, delay: idx * 80, easing: EASE, fill: 'both' });
      io.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((el) => io.observe(el));
}

/* go */
requestAnimationFrame(revealHero);
