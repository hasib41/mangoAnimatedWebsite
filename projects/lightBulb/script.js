const {
  gsap: {
    registerPlugin,
    set,
    to,
    timeline,
    utils: { random } },

  MorphSVGPlugin,
  Draggable } =
window;
registerPlugin(MorphSVGPlugin);

// Used to calculate distance of "tug"
let startX;
let startY;

const CORD_DURATION = 0.1;
const ROOT = document.documentElement;
const INPUT = document.querySelector('#light-mode');
const CORDS = document.querySelectorAll('.toggle-scene__cord');
const HIT = document.querySelector('.toggle-scene__hit-spot');
const DUMMY = document.querySelector('.toggle-scene__dummy-cord');
const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');

// bulb-failure parts
const COIL = document.querySelector('.bulb__coil');
const BREAK_L = document.querySelector('.bulb__coil-break--l');
const BREAK_R = document.querySelector('.bulb__coil-break--r');
const BREAKS = [BREAK_L, BREAK_R];
const HOTSPOT = document.querySelector('.bulb__hotspot');
const ARC_GLASS = document.querySelector('.bulb__arc');
const SOOT = document.querySelector('.bulb__soot');
const FLASH_RING = document.querySelector('.bulb__flash');
const FLASH = document.querySelector('.arc-flash');

const PROXY = document.createElement('div');
const endY = DUMMY_CORD.getAttribute('y2');
const endX = DUMMY_CORD.getAttribute('x2');

// set init position
const RESET = () => {
  set(PROXY, {
    x: endX,
    y: endY });

};

const AUDIO = {
  CLICK: new Audio('https://assets.codepen.io/605876/click.mp3') };

const STATE = {
  ON: false,
  SURGES: 0 };

set('.bulb', { z: 10 });
set(ROOT, { '--heat': 0, '--dim': 0 });
// pivot the broken filament halves about their fixed (outer) ends so the inner tips droop
set(BREAK_L, { transformOrigin: '0% 50%' });
set(BREAK_R, { transformOrigin: '100% 50%' });
set(HOTSPOT, { transformOrigin: '50% 50%' });

RESET();

/* ----------------------------------------------------------------
   WebAudio — synthesised, dependency-free.
   mains hum (heat-up)  ->  arc crackle + glass tink (the blow-out)
----------------------------------------------------------------- */
let actx;
const ac = () => actx = actx || new (window.AudioContext || window.webkitAudioContext)();
let noiseBuf;
const noise = c => {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.4), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
};

// rising 50/60Hz-style hum while the filament over-drives
const hum = (dur = 0.6) => {
  try {
    const c = ac();const t = c.currentTime;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + dur * 0.65);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(c.destination);
    [100, 120, 240].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = i < 2 ? 'sine' : 'sawtooth';
      o.frequency.value = f;
      const og = c.createGain();
      og.gain.value = i < 2 ? 1 : 0.14;
      o.connect(og).connect(g);
      o.start(t);o.stop(t + dur + 0.05);
    });
  } catch (e) {}
};

// the electrical arc as the filament severs — noise crackle + a fast down-sweep
const arc = () => {
  try {
    const c = ac();const t = c.currentTime;
    const src = c.createBufferSource();src.buffer = noise(c);
    const bp = c.createBiquadFilter();bp.type = 'bandpass';bp.frequency.value = 1900;bp.Q.value = 0.7;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(bp).connect(ng).connect(c.destination);
    src.start(t);src.stop(t + 0.2);

    const o = c.createOscillator();o.type = 'sawtooth';
    o.frequency.setValueAtTime(1300, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    const og = c.createGain();
    og.gain.setValueAtTime(0.26, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(og).connect(c.destination);
    o.start(t);o.stop(t + 0.16);
  } catch (e) {}
};

// the glass "tink" right after the pop
const tink = () => {
  try {
    const c = ac();const t = c.currentTime + 0.015;
    const o = c.createOscillator();o.type = 'sine';
    o.frequency.setValueAtTime(3200, t);
    o.frequency.exponentialRampToValueAtTime(2500, t + 0.13);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(c.destination);
    o.start(t);o.stop(t + 0.2);
  } catch (e) {}
};

/* ----------------------------------------------------------------
   Cord tug — morphs the cord and flips the light ON.
----------------------------------------------------------------- */
const CORD_TL = () => {
  const TL = timeline({
    paused: false,
    onStart: () => {
      STATE.ON = !STATE.ON;
      INPUT.checked = !STATE.ON;
      set(ROOT, { '--on': STATE.ON ? 1 : 0 });
      set([DUMMY], { display: 'none' });
      set(CORDS[0], { display: 'block' });
      AUDIO.CLICK.play();
    },
    onComplete: () => {
      set([DUMMY], { display: 'block' });
      set(CORDS[0], { display: 'none' });
      RESET();
    } });


  for (let i = 1; i < CORDS.length; i++) {
    TL.add(
    to(CORDS[0], {
      morphSVG: CORDS[i],
      duration: CORD_DURATION,
      repeat: 1,
      yoyo: true }));


  }
  return TL;
};

// a fresh, intact bulb every time you pull
const freshBulb = () => {
  set(COIL, { display: 'block', opacity: 1 });
  set(BREAKS, { display: 'none', opacity: 1, rotation: 0, stroke: '#dfe9ff' });
  set(HOTSPOT, { opacity: 0, scale: 0 });
  set(ARC_GLASS, { opacity: 0 });
  set(FLASH_RING, { display: 'none', opacity: 0, scale: 0.8 });
  set(SOOT, { opacity: 0 });
  set(FLASH, { opacity: 0 });
  set(ROOT, { '--dim': 0 });
};

/* ----------------------------------------------------------------
   THE TWIST — you win for a heartbeat, then the filament over-drives:
   it climbs the colour-temperature, browns-out and flickers as it
   struggles, a hotspot blooms, then a blue-white arc-flash severs it.
   The broken ends droop, glow orange and cool to black while soot
   blackens the inside of the glass. Each attempt fails faster.
----------------------------------------------------------------- */
const SURGE_TL = () => {
  const n = STATE.SURGES;
  const speed = Math.max(0.45, 1 - n * 0.1);
  const hold = Math.max(0.06, 0.5 - n * 0.06);

  set(FLASH_RING, { display: 'block', opacity: 0, transformOrigin: '50% 50%', scale: 0.8 });

  const TL = timeline({
    onComplete: () => {
      STATE.SURGES += 1;
      set(FLASH_RING, { display: 'none' });
    } });


  // 0) you won... briefly.
  TL.to({}, { duration: hold });

  // 1) over-drive — the filament climbs the colour temperature, the room
  //    starts to brown-out as the bulb hogs the current, hum rises.
  TL.call(() => hum(0.5 * speed)).
  to(ROOT, { '--heat': 0.85, duration: 0.45 * speed, ease: 'power2.in' }).
  to(ROOT, { '--dim': 0.38, duration: 0.45 * speed, ease: 'power2.in' }, '<');

  // 2) brown-out — the bulb draws too much and flickers irregularly
  //    (room dims via --dim only, so no hue sweep — just an amber strobe).
  const flick = timeline();
  let ft = 0;
  for (let i = 0; i < 5; i++) {
    flick.set(ROOT, { '--dim': random(0.5, 0.8) }, ft);
    flick.set(ROOT, { '--heat': random(0.5, 0.78) }, ft);
    ft += random(0.02, 0.06);
    flick.set(ROOT, { '--dim': random(0.2, 0.4) }, ft);
    flick.set(ROOT, { '--heat': random(0.85, 1) }, ft);
    ft += random(0.03, 0.09);
  }
  flick.set(ROOT, { '--dim': 0.45 }, ft).set(ROOT, { '--heat': 1 }, ft);
  TL.add(flick);

  // 3) hotspot — the thinnest coil point runs away white-hot while the
  //    room sinks dark around it.
  TL.call(() => hum(0.16)).
  to(ROOT, { '--dim': 0.62, duration: 0.13 }, '<').
  set(HOTSPOT, { opacity: 1 }).
  to(HOTSPOT, { scale: 1.3, duration: 0.13, ease: 'power2.out' }).
  to(HOTSPOT, { scale: 1.9, duration: 0.06, ease: 'power2.in' });

  // 4) ARC-FLASH — it severs. Blue-white over-exposure; the coil snaps
  //    under cover of the flash, the light dies on the same frame.
  TL.call(() => {
    arc();tink();
    set(COIL, { display: 'none' });
    set(BREAKS, { display: 'block' });
    STATE.ON = false;
    INPUT.checked = !STATE.ON;
    set(ROOT, { '--on': 0, '--heat': 0, '--dim': 0 });
  }).
  set(HOTSPOT, { scale: 2.5 }, '<').
  set(ARC_GLASS, { opacity: 0.95 }, '<').
  fromTo(FLASH, { opacity: 0.85 }, { opacity: 0, duration: 0.3, ease: 'expo.out' }, '<').
  to(ARC_GLASS, { opacity: 0, duration: 0.22, ease: 'expo.out' }, '<').
  to(FLASH_RING, { scale: 1.7, opacity: 0.9, duration: 0.12, ease: 'power2.out' }, '<').
  to(FLASH_RING, { opacity: 0, duration: 0.22 }, '>-0.02').
  to(HOTSPOT, { opacity: 0, duration: 0.12 }, '<');

  // 5) death — the severed ends droop, flare orange, then cool to black
  //    while tungsten soot blackens the glass.
  TL.to(BREAK_L, { rotation: -9, duration: 0.55, ease: 'power2.out' }, '>-0.04').
  to(BREAK_R, { rotation: 9, duration: 0.55, ease: 'power2.out' }, '<').
  to(BREAKS, { stroke: '#ff7e22', duration: 0.1 }, '<').
  to(BREAKS, { stroke: '#4a0a00', duration: 0.75, ease: 'power1.out' }, '>').
  to(BREAKS, { opacity: 0.3, duration: 0.75 }, '<').
  fromTo(SOOT, { opacity: 0 }, { opacity: 0.65, duration: 0.5, ease: 'power1.out' }, '<');

  return TL;
};

const IMPOSSIBLE_TL = () =>
timeline({
  onStart: () => {
    set(HIT, { display: 'none' });
    freshBulb();
  },
  onComplete: () => set(HIT, { display: 'block' }) }).

add(CORD_TL()).
add(SURGE_TL());

Draggable.create(PROXY, {
  trigger: HIT,
  type: 'x,y',
  onPress: e => {
    startX = e.x;
    startY = e.y;
    RESET();
  },
  onDrag: function () {
    set(DUMMY_CORD, {
      attr: {
        x2: this.x,
        y2: this.y } });


  },
  onRelease: function (e) {
    const DISTX = Math.abs(e.x - startX);
    const DISTY = Math.abs(e.y - startY);
    const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
    to(DUMMY_CORD, {
      attr: { x2: endX, y2: endY },
      duration: CORD_DURATION,
      onComplete: () => {
        if (TRAVELLED > 50) {
          IMPOSSIBLE_TL();
        } else {
          RESET();
        }
      } });

  } });

/* ----------------------------------------------------------------
   Recording-rig hook — lets record.html pull the cord on cue.
   Harmless when the page is used normally (nothing calls it).
----------------------------------------------------------------- */
window.lightbulbAPI = {
  els: { hit: HIT, cord: DUMMY_CORD },
  unit: 60, // hit-circle radius in SVG units, for screen<->svg scale
  // stretch the cord straight down by `px` SVG units
  tug(px) {
    set(DUMMY_CORD, { attr: { x2: endX, y2: parseInt(endY, 10) + px } });
  },
  // let go: spring back, then the bulb does its impossible thing
  release() {
    to(DUMMY_CORD, {
      attr: { x2: endX, y2: endY },
      duration: CORD_DURATION,
      onComplete: () => IMPOSSIBLE_TL() });

  } };
