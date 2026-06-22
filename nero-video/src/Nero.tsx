import React from 'react'
import {
  AbsoluteFill, Sequence, Img, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
} from 'remotion'
import { loadFont as loadDisplay } from '@remotion/google-fonts/ArchivoBlack'
import { loadFont as loadBody } from '@remotion/google-fonts/Inter'

const { fontFamily: DISPLAY } = loadDisplay()
const { fontFamily: BODY } = loadBody()

export const FPS = 30
export const DURATION = 660

const BG = '#0B0A0A'
const NEON = '#FF2440'
const CREAM = '#F1ECE4'
const GLOW = '0 0 14px rgba(255,36,64,0.65), 0 0 50px rgba(255,36,64,0.4)'
const GLOW_SM = '0 0 8px rgba(255,36,64,0.6), 0 0 22px rgba(255,36,64,0.35)'

/* ---------- helpers ---------- */
const fade = (f: number, len: number, inN = 12, outN = 12) =>
  Math.min(
    interpolate(f, [0, inN], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(f, [len - outN, len], [1, 0], { extrapolateLeft: 'clamp' }),
  )

/* ---------- full-bleed b-roll scene ---------- */
const Broll: React.FC<{ src: string; kicker: string; head: string; line: string; len: number; tint?: string }> = ({
  src, kicker, head, line, len, tint = 'rgba(255,36,64,0.18)',
}) => {
  const f = useCurrentFrame()
  const scale = interpolate(f, [0, len], [1.14, 1.3])
  const o = fade(f, len)
  const capY = interpolate(f, [8, 30], [50, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const capO = interpolate(f, [8, 26], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: `radial-gradient(120% 80% at 50% 30%, transparent 35%, rgba(11,10,10,0.6) 100%),
          linear-gradient(180deg, rgba(11,10,10,0.35) 0%, rgba(11,10,10,0.05) 38%, rgba(11,10,10,0.92) 100%),
          radial-gradient(120% 60% at 50% 120%, ${tint}, transparent 60%)`,
      }} />
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 240, opacity: capO, transform: `translateY(${capY}px)` }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, letterSpacing: 8, textTransform: 'uppercase', color: NEON, textShadow: GLOW_SM }}>{kicker}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 0.95, color: CREAM, margin: '10px 0 16px', textShadow: '0 4px 40px rgba(0,0,0,0.7)' }}>{head}</div>
        <div style={{ fontFamily: BODY, fontSize: 40, color: CREAM, opacity: 0.9, maxWidth: 720 }}>{line}</div>
      </div>
    </AbsoluteFill>
  )
}

/* ---------- the neon studio (grid floor + plinth) ---------- */
const Studio: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame()
  const gridShift = (f * 1.4) % 64
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* receding neon grid floor */}
      <div style={{
        position: 'absolute', left: '50%', bottom: 0, width: '260%', height: '50%',
        transform: 'translateX(-50%) perspective(520px) rotateX(72deg)', transformOrigin: '50% 100%',
        backgroundImage: `linear-gradient(rgba(255,36,64,0.30) 2px, transparent 2px), linear-gradient(90deg, rgba(255,36,64,0.30) 2px, transparent 2px)`,
        backgroundSize: '64px 64px', backgroundPositionY: `${gridShift}px`,
        WebkitMaskImage: 'linear-gradient(to top, #000 5%, transparent 72%)',
        maskImage: 'linear-gradient(to top, #000 5%, transparent 72%)',
      }} />
      {/* ambient center glow */}
      <AbsoluteFill style={{ background: 'radial-gradient(60% 50% at 50% 46%, rgba(255,36,64,0.14), transparent 60%)' }} />
      {children}
    </AbsoluteFill>
  )
}

const Plinth: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: 'absolute', left: '50%', bottom: 470, transform: 'translateX(-50%)', opacity: o }}>
    <div style={{ width: 640, height: 6, background: NEON, borderRadius: 999, boxShadow: '0 0 26px 7px rgba(255,36,64,0.8), 0 0 90px 22px rgba(255,36,64,0.45)' }} />
    <div style={{ position: 'absolute', left: '50%', top: -120, width: 760, height: 220, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center bottom, rgba(255,36,64,0.4), transparent 70%)' }} />
  </div>
)

/* ---------- THE BAR scene: drop → turntable → snap ---------- */
const BarScene: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const o = fade(f, len, 10, 12)

  const drop = spring({ frame: f, fps, config: { damping: 16, mass: 0.9 } })
  const barY = interpolate(drop, [0, 1], [-320, 0])
  const barScale = interpolate(drop, [0, 1], [0.82, 1])
  const turn = interpolate(f, [10, 95], [-14, 14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const SNAP = 96
  const shakeAmp = interpolate(f, [SNAP, SNAP + 4, SNAP + 18], [0, 22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const shakeX = Math.sin(f * 3.3) * shakeAmp
  const shakeY = Math.cos(f * 4.1) * shakeAmp * 0.6
  const flash = interpolate(f, [SNAP, SNAP + 4, SNAP + 16], [0, 0.95, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wholeO = interpolate(f, [SNAP, SNAP + 5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const snapIn = spring({ frame: f - (SNAP + 2), fps, config: { damping: 12 } })
  const snapO = interpolate(f, [SNAP + 2, SNAP + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const snapScale = interpolate(snapIn, [0, 1], [1.25, 1])

  const brandO = interpolate(f, [6, 26], [0, 1], { extrapolateRight: 'clamp' })
  const cap1 = Math.min(interpolate(f, [16, 32], [0, 1], { extrapolateRight: 'clamp' }), interpolate(f, [80, 92], [1, 0], { extrapolateLeft: 'clamp' }))
  const cap2 = interpolate(f, [SNAP + 4, SNAP + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Studio>
        {/* giant neon-outline wordmark */}
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            fontFamily: DISPLAY, fontSize: 360, color: 'transparent',
            WebkitTextStroke: '3px rgba(255,36,64,0.38)', textShadow: '0 0 60px rgba(255,36,64,0.2)',
            opacity: brandO,
          }}>NÉRO</div>
        </AbsoluteFill>

        <Plinth o={brandO} />

        {/* the product, sitting on the plinth */}
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ perspective: 1400, transform: `translate(${shakeX}px, ${shakeY - 60}px)` }}>
            <div style={{ position: 'relative', width: 560, height: 980 }}>
              <Img src={staticFile('hero.png')} style={{
                position: 'absolute', inset: 0, margin: 'auto', maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto',
                transform: `translateY(${barY}px) scale(${barScale}) rotateY(${turn}deg)`,
                opacity: wholeO, filter: 'drop-shadow(0 24px 50px rgba(0,0,0,0.7))',
              }} />
              <Img src={staticFile('snap.png')} style={{
                position: 'absolute', inset: 0, margin: 'auto', maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto',
                transform: `scale(${snapScale})`, opacity: snapO, filter: 'drop-shadow(0 24px 50px rgba(0,0,0,0.7))',
              }} />
            </div>
          </div>
        </AbsoluteFill>

        {/* snap flash */}
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #fff 0%, ${NEON} 45%, #B11D3E 100%)`, opacity: flash }} />

        {/* captions */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 250, textAlign: 'center', opacity: cap1, fontFamily: BODY, fontWeight: 700, fontSize: 44, letterSpacing: 4, textTransform: 'uppercase', color: CREAM }}>A 72% single-origin bar</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 230, textAlign: 'center', opacity: cap2, fontFamily: DISPLAY, fontSize: 130, color: CREAM, textShadow: GLOW }}>Snaps like glass</div>
      </Studio>
    </AbsoluteFill>
  )
}

/* ---------- THE RANGE: four cards fly in ---------- */
const RangeScene: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const o = fade(f, len, 10, 12)
  const cards = [
    { img: 'varieties/dark72.png', name: 'Origin 72%' },
    { img: 'varieties/dark85.png', name: 'Noir 85%' },
    { img: 'varieties/seasalt.png', name: 'Sea Salt' },
    { img: 'varieties/orange.png', name: 'Orange' },
  ]
  const titleY = interpolate(f, [4, 24], [40, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const titleO = interpolate(f, [4, 22], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: o, alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(60% 50% at 50% 55%, rgba(255,36,64,0.12), transparent 70%)' }} />
      <div style={{ textAlign: 'center', opacity: titleO, transform: `translateY(${titleY}px)`, marginBottom: 50 }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, letterSpacing: 10, textTransform: 'uppercase', color: NEON, textShadow: GLOW_SM }}>The range</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.95, color: CREAM, textShadow: GLOW, marginTop: 12 }}>Four ways<br />to go dark</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, width: 760 }}>
        {cards.map((c, i) => {
          const s = spring({ frame: f - 18 - i * 7, fps, config: { damping: 14 } })
          const y = interpolate(s, [0, 1], [140, 0])
          const sc = interpolate(s, [0, 1], [0.6, 1])
          const op = interpolate(s, [0, 1], [0, 1])
          return (
            <div key={i} style={{ transform: `translateY(${y}px) scale(${sc})`, opacity: op }}>
              <div style={{ borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(255,36,64,0.5)', boxShadow: '0 0 30px rgba(255,36,64,0.25)', background: '#15100F' }}>
                <Img src={staticFile(c.img)} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
              </div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, letterSpacing: 3, textTransform: 'uppercase', color: CREAM, textAlign: 'center', marginTop: 14 }}>{c.name}</div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/* ---------- TITLE ---------- */
const Title: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: f, fps, config: { damping: 13 } })
  const scale = interpolate(s, [0, 1], [0.72, 1])
  const inO = interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  const flick = f < 16 ? (Math.sin(f * 2.6) > -0.2 ? 1 : 0.5) : 1
  const exitScale = interpolate(f, [len - 14, len], [1, 1.3], { extrapolateLeft: 'clamp' })
  const exitO = interpolate(f, [len - 12, len], [1, 0], { extrapolateLeft: 'clamp' })
  const lineW = interpolate(s, [0, 1], [0, 300])
  const tagO = interpolate(f, [14, 30], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(50% 40% at 50% 50%, rgba(255,36,64,0.14), transparent 70%)' }} />
      <div style={{ fontFamily: DISPLAY, fontSize: 220, color: NEON, textShadow: GLOW, transform: `scale(${scale * exitScale})`, opacity: inO * flick * exitO }}>NÉRO</div>
      <div style={{ width: lineW, height: 3, background: NEON, boxShadow: GLOW_SM, margin: '20px 0', opacity: exitO }} />
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, letterSpacing: 8, textTransform: 'uppercase', color: CREAM, opacity: tagO * exitO }}>Single-origin dark chocolate</div>
    </AbsoluteFill>
  )
}

/* ---------- GO DARK end card ---------- */
const EndScene: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const o = interpolate(f, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const bgScale = interpolate(f, [0, len], [1.04, 1.14])
  const letters = 'GO DARK'.split('')
  const priceS = spring({ frame: f - 36, fps, config: { damping: 12 } })
  const priceY = interpolate(priceS, [0, 1], [40, 0])
  const priceO = interpolate(f, [36, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ctaO = interpolate(f, [52, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, opacity: 0.5 }}>
        <Img src={staticFile('atmosphere.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(80% 60% at 50% 50%, rgba(255,36,64,0.20), transparent 55%), linear-gradient(180deg, rgba(11,10,10,0.72), rgba(11,10,10,0.88))` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: 230, color: CREAM, textShadow: GLOW, lineHeight: 0.9 }}>
          {letters.map((ch, i) => {
            const ls = spring({ frame: f - 6 - i * 4, fps, config: { damping: 12 } })
            const ly = interpolate(ls, [0, 1], [120, 0])
            const lo = interpolate(ls, [0, 1], [0, 1])
            return <span key={i} style={{ transform: `translateY(${ly}px)`, opacity: lo, width: ch === ' ' ? 60 : 'auto' }}>{ch === ' ' ? ' ' : ch}</span>
          })}
        </div>
        <div style={{ opacity: priceO, fontFamily: DISPLAY, fontSize: 64, color: NEON, border: `3px solid ${NEON}`, borderRadius: 18, padding: '8px 28px', boxShadow: GLOW_SM, transform: `translateY(${priceY}px) rotate(-3deg)` }}>$11 <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: CREAM }}>/ 80g bar</span></div>
        <div style={{ opacity: ctaO, fontFamily: BODY, fontWeight: 700, fontSize: 36, letterSpacing: 6, textTransform: 'uppercase', color: '#fff', background: NEON, borderRadius: 999, padding: '18px 52px', boxShadow: GLOW_SM }}>Order néro</div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/* ---------- compose the film ---------- */
export const Nero: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence durationInFrames={60}><Title len={60} /></Sequence>
      <Sequence from={60} durationInFrames={120}><Broll src="story-pod.jpg" kicker="01 — The bean" head="It starts raw" line="Single-estate cacao pods, split by hand." len={120} /></Sequence>
      <Sequence from={180} durationInFrames={120}><Broll src="atmosphere.jpg" kicker="02 — Conched" head="It goes liquid" line="Stone-ground for forty-eight hours, until it flows." len={120} /></Sequence>
      <Sequence from={300} durationInFrames={160}><BarScene len={160} /></Sequence>
      <Sequence from={460} durationInFrames={100}><RangeScene len={100} /></Sequence>
      <Sequence from={560} durationInFrames={100}><EndScene len={100} /></Sequence>
    </AbsoluteFill>
  )
}
