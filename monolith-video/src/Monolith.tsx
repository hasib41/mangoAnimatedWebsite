import React from 'react'
import {
  AbsoluteFill, Sequence, Audio, Img, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
} from 'remotion'
import { loadFont as loadDisplay } from '@remotion/google-fonts/Syne'
import { loadFont as loadBody } from '@remotion/google-fonts/Manrope'

const { fontFamily: DISPLAY } = loadDisplay('normal', { weights: ['600', '700', '800'], subsets: ['latin'] })
const { fontFamily: BODY } = loadBody('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] })

export const FPS = 30
export const DURATION = 420            // 14s
const SHOW_LEN = 360                   // 12s showcase
const END_LEN = 60                     // 2s ending
const CYCLE = SHOW_LEN / 6             // one scene per 2s → all six shown

/* ---------- palette (dark synthwave, highlighted) ---------- */
const BG = '#0b0716'
const BG2 = '#070410'
const TXT = '#f3eefb'
const TMUTED = '#a99cc9'
const CARDBG = '#130c26'
const PANEL = '#13111c'
const END_ACCENT = '#ff2e88'

const SCENES = [
  { img: 'peaks.jpg',   no: '01', title: 'Lunar Crest',   place: 'Neon crescent · frozen peaks', accent: '#4ad9ff' },
  { img: 'sun.jpg',     no: '02', title: 'Solar Drift',   place: 'Magenta sun · still water',     accent: '#ff2e88' },
  { img: 'beach.jpg',   no: '03', title: 'Paradise Dusk', place: 'Palms · mirrored lagoon',       accent: '#ff8a5c' },
  { img: 'pagoda.jpg',  no: '04', title: 'Silent Temple', place: 'Pagoda · ocean of stars',       accent: '#8aa6ff' },
  { img: 'crimson.jpg', no: '05', title: 'Blood Moon',    place: 'Crimson moon · sleeping hills', accent: '#ff5252' },
  { img: 'dunes.jpg',   no: '06', title: 'Desert Moon',   place: 'Pale moon · cold dunes',        accent: '#9fb8ff' },
]
const N = SCENES.length

/* ---------- helpers ---------- */
const fade = (f: number, len: number, inN = 12, outN = 12) =>
  Math.min(
    interpolate(f, [0, inN], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(f, [len - outN, len], [1, 0], { extrapolateLeft: 'clamp' }),
  )
const clamp = (lo: number, hi: number, v: number) => (v < lo ? lo : v > hi ? hi : v)
const wrap = (d: number) => { d %= N; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d }
const posAt = (f: number) => Math.floor(f / CYCLE) + interpolate(f % CYCLE, [CYCLE * 0.6, CYCLE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })

/* =====================================================================
   CODE PANELS — tiny syntax highlighter
   ===================================================================== */
const C = {
  comment: '#6b6b86', string: '#9ad36b', number: '#e9a86b',
  keyword: '#7cc4ff', attr: '#c79bff', def: '#d4d0e4', tag: '#7cc4ff',
}
const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'for', 'if', 'else', 'new',
  'gsap', 'Observer', 'class', 'section', 'article', 'div', 'img', 'span',
  'import', 'from', 'transform', 'position', 'perspective', 'absolute',
  'preserve-3d', 'rotationY', 'scale', 'true', 'false',
])
const TOKEN = /(\/\/.*$|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d[\d.]*(?:px|deg|vw|vh|s)?\b|#[0-9a-fA-F]{3,8})|([A-Za-z_$][\w$-]*)/g

const hi = (line: string, key: string): React.ReactNode[] => {
  const out: React.ReactNode[] = []
  let last = 0, m: RegExpExecArray | null, k = 0
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index))
    let color = C.def
    if (m[1]) color = C.comment
    else if (m[2]) color = C.string
    else if (m[3]) color = C.number
    else if (m[4]) color = KEYWORDS.has(m[4]) ? C.keyword : C.def
    out.push(<span key={`${key}-${k++}`} style={{ color }}>{m[0]}</span>)
    last = m.index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

const CSS_CODE = `.deck{
  perspective: 1800px;
}
.card{
  position: absolute;
  left: 50%;
  top: 44%;
  transform-style:
    preserve-3d;
}
.card.is-hero
  .card__face{
  box-shadow:
    0 48px 96px;
}`

const JS_CODE = `function render(p){
  for (i=0; i<N; i++){
    const d  = i - p;
    const ad = abs(d);
    const x  = SPACING
      * near * sign;
    const z  = -DEPTH
      * near;
    gsap.set(card, {
      x, z,
      rotationY: ry,
      scale,
    });
  }
}`

const CodePanel: React.FC<{ label: string; color: string; code: string; delay: number }> = ({ label, color, code, delay }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: f - delay, fps, config: { damping: 16 } })
  const y = interpolate(s, [0, 1], [60, 0])
  const o = interpolate(s, [0, 1], [0, 1])
  const lines = code.split('\n')
  const LINE_H = 34
  const PAD = 18
  const boxH = 6 + PAD * 2 + lines.length * LINE_H
  return (
    <div style={{ flex: 1, minWidth: 0, transform: `translateY(${y}px)`, opacity: o }}>
      <div style={{ display: 'inline-block', fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: 2,
        color, marginBottom: 12 }}>{label}</div>
      <div style={{ height: boxH, borderRadius: 18, overflow: 'hidden', background: PANEL,
        border: `1px solid ${color}55`, boxShadow: `0 30px 60px -26px rgba(0,0,0,.7), 0 0 50px -16px ${color}40`, position: 'relative' }}>
        <div style={{ height: 6, background: color, opacity: 0.95 }} />
        <div style={{ padding: `${PAD}px 18px` }}>
          <div style={{ fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontSize: 21, lineHeight: `${LINE_H}px`, whiteSpace: 'pre', color: C.def }}>
            {lines.map((ln, i) => (
              <div key={i} style={{ display: 'flex' }}>
                <span style={{ width: 34, color: '#4a4a63', userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
                <span>{hi(ln, String(i))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   PREVIEW CARD — native coverflow recreation
   ===================================================================== */
const Coverflow: React.FC<{ heroAccent: string }> = ({ heroAccent }) => {
  const f = useCurrentFrame()
  const pos = posAt(f)

  const SPACING = 346, DEPTH = 226, ROT = 44
  const CW = 432, CH = 686
  const TOP = '46%'

  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 1700 }}>
      <div style={{ position: 'absolute', left: '50%', top: TOP, width: 660, height: 660,
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: `radial-gradient(closest-side, ${heroAccent}66, transparent 70%)`, filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
        {SCENES.map((m, i) => {
          const d = wrap(i - pos)
          const ad = Math.abs(d)
          if (ad > 2.6) return null
          const sign = d < 0 ? -1 : 1
          const near = Math.min(ad, 1)
          const far = Math.max(ad - 1, 0)
          const x = sign * (SPACING * near + SPACING * 0.6 * far)
          const z = -(near * DEPTH + far * DEPTH * 0.6)
          const rotY = clamp(-1.15, 1.15, d) * ROT
          const sc = 1 - near * 0.16 - far * 0.05
          const op = ad <= 1 ? 1 : clamp(0, 1, 1 - far * 0.4)
          const isHero = ad < 0.5
          return (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: TOP, width: CW, height: CH,
              transform: `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${sc})`,
              opacity: op, zIndex: Math.round(100 - ad * 10), transformStyle: 'preserve-3d',
            }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden',
                boxShadow: isHero
                  ? `0 40px 80px -24px ${heroAccent}cc, 0 24px 50px -26px rgba(0,0,0,.7)`
                  : `0 24px 50px -28px rgba(0,0,0,.7)` }}>
                <Img src={staticFile(m.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.3), transparent 24%, transparent 70%, rgba(0,0,0,.25))' }} />
                {isHero && <div style={{ position: 'absolute', inset: 0, borderRadius: 16, boxShadow: `inset 0 0 0 1.5px ${heroAccent}aa` }} />}
                <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: DISPLAY, fontWeight: 700,
                  fontSize: 16, color: 'rgba(255,255,255,.94)', textShadow: '0 2px 10px rgba(0,0,0,.6)' }}>{m.no}</div>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', height: '100%',
                borderRadius: 16, transform: 'scaleY(-1)', overflow: 'hidden',
                opacity: isHero ? 0.24 : 0.14,
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,.7), transparent 52%)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,.7), transparent 52%)' }}>
                <Img src={staticFile(m.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =====================================================================
   BACKGROUND (dark + highlighted)
   ===================================================================== */
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
const STARS = `radial-gradient(1.4px 1.4px at 18% 22%, rgba(255,255,255,.6), transparent),
  radial-gradient(1.2px 1.2px at 72% 16%, rgba(255,255,255,.5), transparent),
  radial-gradient(1.5px 1.5px at 58% 64%, rgba(255,255,255,.45), transparent),
  radial-gradient(1.1px 1.1px at 33% 82%, rgba(255,255,255,.4), transparent),
  radial-gradient(1.3px 1.3px at 86% 56%, rgba(255,255,255,.4), transparent),
  radial-gradient(1.1px 1.1px at 8% 50%, rgba(255,255,255,.35), transparent),
  radial-gradient(1.2px 1.2px at 92% 84%, rgba(255,255,255,.35), transparent)`

const SceneBG: React.FC<{ accent: string }> = ({ accent }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{
      background: `radial-gradient(120% 80% at 18% 8%, #1e1140 0%, transparent 50%),
        radial-gradient(120% 90% at 50% 122%, ${accent}3a 0%, transparent 55%),
        linear-gradient(180deg, ${BG} 0%, ${BG2} 100%)`,
    }} />
    <AbsoluteFill style={{ background: STARS, opacity: 0.5 }} />
    {/* accent highlight bloom */}
    <AbsoluteFill style={{ background: `radial-gradient(70% 44% at 50% 30%, ${accent}26, transparent 62%)` }} />
    {/* vignette */}
    <AbsoluteFill style={{ background: 'radial-gradient(120% 92% at 50% 44%, transparent 52%, rgba(0,0,0,.62) 100%)' }} />
    {/* grain */}
    <AbsoluteFill style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', opacity: 0.06, mixBlendMode: 'overlay' }} />
  </AbsoluteFill>
)

/* =====================================================================
   SHOWCASE
   ===================================================================== */
const Showcase: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame()
  const o = fade(f, len, 12, 12)
  const heroIdx = ((Math.round(posAt(f)) % N) + N) % N
  const accent = SCENES[heroIdx].accent

  const headO = interpolate(f, [0, 16], [0, 1], { extrapolateRight: 'clamp' })
  const headY = interpolate(f, [0, 18], [-24, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <SceneBG accent={accent} />

      {/* hook line */}
      <div style={{ position: 'absolute', top: 186, left: 0, right: 0, textAlign: 'center', opacity: headO, transform: `translateY(${headY}px)` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 37, letterSpacing: -0.5, color: TXT,
          whiteSpace: 'nowrap', textShadow: `0 0 36px ${accent}55, 0 2px 18px rgba(0,0,0,.55)` }}>
          Can you believe{' '}
          <span style={{ color: accent, background: `${accent}26`, padding: '2px 10px', borderRadius: 10,
            boxShadow: `0 0 30px ${accent}66` }}>Claude</span>
          {' '}built this?
        </div>
      </div>

      {/* preview card (highlighted on the dark bg) */}
      <div style={{ position: 'absolute', top: 288, left: 44, right: 44, height: 812, borderRadius: 30,
        background: `linear-gradient(180deg, ${CARDBG}, #0d0820)`, overflow: 'hidden',
        boxShadow: `0 60px 120px -40px rgba(0,0,0,.85), 0 0 90px -30px ${accent}66, 0 0 0 1px rgba(255,255,255,.06)` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8, zIndex: 20 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e0584f' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e6b03a' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#46b66e' }} />
          <span style={{ marginLeft: 'auto', fontFamily: BODY, fontWeight: 600, fontSize: 14, letterSpacing: 2, color: TMUTED }}>coverflow gallery</span>
        </div>
        <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0 }}>
          <Coverflow heroAccent={accent} />
        </div>
      </div>

      {/* code panels */}
      <div style={{ position: 'absolute', top: 1150, left: 56, right: 56, display: 'flex', gap: 30 }}>
        <CodePanel label="CSS" color="#4aa3ff" code={CSS_CODE} delay={8} />
        <CodePanel label="JS"  color="#ffb454" code={JS_CODE} delay={16} />
      </div>
    </AbsoluteFill>
  )
}

/* =====================================================================
   ENDING (2s) — "write code in comment"
   ===================================================================== */
const EndScene: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const o = interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
  const iconS = spring({ frame: f - 2, fps, config: { damping: 12 } })
  const iconSc = interpolate(iconS, [0, 1], [0.5, 1])
  const kO = interpolate(f, [6, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const kY = interpolate(f, [6, 16], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const headS = spring({ frame: f - 10, fps, config: { damping: 13 } })
  const headY = interpolate(headS, [0, 1], [36, 0])
  const headO = interpolate(f, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subO = interpolate(f, [18, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subY = interpolate(f, [18, 30], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <SceneBG accent={END_ACCENT} />
      <div style={{ width: 144, height: 144, borderRadius: 38, transform: `scale(${iconSc})`,
        background: `linear-gradient(135deg, ${END_ACCENT}, #8b5cff)`, display: 'grid', placeItems: 'center',
        boxShadow: `0 26px 70px -20px ${END_ACCENT}aa`, marginBottom: 40 }}>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
          <path d="M4 5h16v11H9l-5 4V5z" fill="#fff" />
        </svg>
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', color: TMUTED, opacity: kO, transform: `translateY(${kY}px)`, marginBottom: 6 }}>Want the full build?</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 92, lineHeight: 1.04, textAlign: 'center', color: TXT, opacity: headO, transform: `translateY(${headY}px)`, textShadow: `0 0 50px ${END_ACCENT}55` }}>
        Write <span style={{ color: END_ACCENT }}>“code”</span>
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 40, color: TMUTED, opacity: subO, transform: `translateY(${subY}px)`, marginTop: 14 }}>in the comments</div>
      <div style={{ display: 'flex', gap: 30, marginTop: 40, opacity: subO }}>
        {[0, 1, 2].map((i) => {
          const b = Math.sin((f - i * 6) * 0.22) * 8
          return (
            <svg key={i} width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ transform: `translateY(${b}px)` }}>
              <path d="M5 9l7 7 7-7" stroke={END_ACCENT} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/* =====================================================================
   COMPOSE
   ===================================================================== */
export const Monolith: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Mr Bombastic, starting at 0:19, gently faded in/out */}
      <Audio
        src={staticFile('bombastic.mp3')}
        trimBefore={19 * FPS}
        volume={(f) => interpolate(f, [0, 10, DURATION - 18, DURATION], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
      <Sequence durationInFrames={SHOW_LEN}><Showcase len={SHOW_LEN} /></Sequence>
      <Sequence from={SHOW_LEN} durationInFrames={END_LEN}><EndScene len={END_LEN} /></Sequence>
    </AbsoluteFill>
  )
}
