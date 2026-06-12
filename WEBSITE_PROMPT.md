# Master Prompt — Premium One-Page "Ad-Film" Product Website (final, detailed)

Copy everything below the line into a new Claude Code session.

---

You are building me a premium one-page static product-showcase website. Quality bar: awwwards Site of the Day. No backend, no shop logic — pure showcase. The site must feel like a scroll-driven advertising film: ONE hero object that persists, travels, and transforms as the page scrolls; scenes that play forward and backward with the scroll like a video timeline; photographic richness everywhere (no flat empty screens).

Work STEP BY STEP in this exact order. Finish and verify each step before starting the next. PAUSE and wait for my answer ONLY where marked ⏸ — everywhere else decide yourself and state the decision in one line.

════════════════ STEP 0 — TOPIC ⏸ ════════════════
Suggest 6 product/brand ideas suited to this format. The one requirement: a hero object that can visually TRANSFORM (fruit that cuts open, coffee bean → roast → cup, chocolate bar → snap → melt, perfume bottle → mist, honey jar → drip, sneaker → exploded layers). For EACH idea give:
- Brand name (short, punchy, ownable — like "MANGOO")
- One-line concept and target feeling
- 4-color palette with hex codes: 1 deep canvas color, 1 bright accent, 1 hot accent, 1 off-white for text — never pure white #FFF
- Font pairing from Google Fonts: one condensed/display face for giant type (Anton, Archivo Black, Bebas Neue class) + one clean body face (Instrument Sans, Inter class)
- The signature transform moment, described in one sentence of motion ("the bar snaps in half and the two halves part to reveal the molten core")
- The natural story structure FOR THIS TOPIC: how many story scenes (3–6), how many product variants (2–5), how many transform stages (1–3). These counts drive the whole site — do NOT force every topic into the same numbers.
Wait for my pick (or accept a topic I name, then propose its structure).

════════════════ STEP 1 — GEMINI IMAGE PROMPTS ⏸ ════════════════
Give me a numbered list of detailed image-generation prompts I will paste into Gemini. Every prompt must contain ALL of: subject with exact variety/material/color wording; camera angle; lens + aperture (e.g. 100mm macro f/8); full lighting setup (key softbox position, rim light, bounce, shadow behavior); background spec; texture detail level ("extreme — visible pores, juice beads"); a commercial style reference ("premium fruit advertising, Harrods campaign"); aspect ratio; how much of the frame the subject fills.
Background rules: product shots = plain solid pure white #FFFFFF (I cut them out afterward); scenic shots = real environments, golden-hour light preferred; no people's faces, no text, no watermarks anywhere.
Images needed (counts come from Step 0's structure):
- 1 hero object (the star — upright, 10° tilt for a dynamic silhouette)
- transform-stage shots: one per stage (the "after" states)
- variant shots: one per variant, same lighting recipe so they sit together as a family
- story scenes: one per story beat (e.g. origin → harvest → craft → pack → deliver), 3:2 landscape
- 1 vertical 9:16 atmosphere shot for the footer background
For EACH image state the exact destination path (public/photos/<brand>/...) and whether it needs background removal.
HARD RULES: photographic images only — never SVG illustrations, CSS-drawn graphics, emoji, or icon-style product art anywhere (tiny SVG UI elements like arrows/social icons are fine). No stand-in or placeholder images — the site ships with MY images only.
Processing pipeline when I drop files into ~/Downloads: detect them by name; remove white backgrounds with rembg (u2net model; install in a /tmp venv if missing); contract the alpha 2px + 1px blur to kill white fringing; trim to content bbox; downscale product PNGs to ~1100px; re-encode scenic shots as quality-85 JPG ≤1600px; set every <img> width/height attribute to the real final dimensions.
⏸ Wait here until I say my images are in ~/Downloads, then process them and continue.

════════════════ STEP 2 — PROJECT SETUP ════════════════
Vite + vanilla JS in the current folder (no framework). npm i gsap lenis; vite as devDependency; scripts dev/build/preview. Google Fonts loaded with preconnect + display=swap; preload the hero image. Design tokens as CSS custom properties: the 4 palette colors; fluid type scale built on clamp() with at least xs/sm/base/lg/xl/big/huge (huge ≈ 16vw for the brand word); spacing scale; one shared cubic-bezier ease token. Generate a 128×128 tiling grain PNG with PIL (random gray, alpha ≈ 18) as a fixed full-screen overlay at low opacity, pointer-events none. Favicon cut from the hero image. Start the dev server and give me the URL immediately — I watch live and Vite hot-reloads everything you save.

════════════════ STEP 3 — STATIC LAYOUT FIRST (no animation yet) ════════════════
Build the entire page fully styled before a single tween. Color journey across sections — photo → deep canvas color → bright accent → near-black → photo — never two adjacent sections the same, never a flat white/cream screen. Sections:
1. HERO — full-bleed atmosphere photo with a dark gradient scrim; brand name as giant display type filling ~90% of viewport width, each letter an individual span inside an overflow-hidden mask (flex justify-space-between); minimal topbar (wordmark + ghost-outline Order button); tagline + primary CTA; tiny "scroll" hint with an animated line; a small rotating circular SVG text badge ("SUN-RIPENED • HAND-PICKED •" style) floating near where the product will rise.
2. CINEMA (the heart) — pinned full-viewport stage on the deep canvas color: a giant ghost wordmark behind everything (display font, ~20vw, text color at 8–10% opacity); the hero object centered at ~31vw width; an intro caption line; benefit badges (5 max) absolutely positioned in a ring around the object — dark translucent cards, 1px accent border, display-font headline in the bright accent + small uppercase sub-line, headlines never wrap; the transform-stage image(s) stacked on the same spot as the hero object; a soft radial color blob; a juice/impact radial burst element; an offer panel (hidden until its beat): 3 benefit rows with thick accent left-bars, a rotated price sticker (bright accent background, ink text, like a tag slapped on), and the CTA.
3. MARQUEE — repeating uppercase strip in the bright accent, rotated −2°, 4 identical chunks for a seamless loop.
4. STORY — pinned split scene on near-black: photo panel (rounded, overflow hidden) beside numbered steps (orange number, big accent heading, one-line body) — one step per story beat from Step 0.
5. VARIETIES — horizontal train: one full-screen panel per variant, alternating brand colors, each with No. tag, huge display name, the variant photo, one tasting/character line.
6. QUOTE — one big uppercase display line on the hot accent block.
7. FOOTER — the vertical atmosphere photo full-bleed with scrim; a huge 2-word CTA ("TASTE IT" class) split into per-letter masks; cream button; meta row (© + one-liner).
Semantic HTML, alt text on meaningful images, width/height on every img, loading="lazy" below the fold, responsive to mobile (desktop is the showcase priority).

════════════════ STEP 4 — ANIMATIONS (the obsession step) ════════════════
Lenis smooth scroll: duration 1.0, wheelMultiplier 1.2 — snappy, never floaty. Wire lenis → ScrollTrigger.update on one shared gsap.ticker rAF loop, lagSmoothing(0). Anchor clicks route through lenis.scrollTo.
CHOREOGRAPHY (concrete values — tune ±20% by eye):
- LOADER: brand word rises out of a mask (0.7s expo.out), holds 0.35s, exits up (0.5s expo.in), curtain wipes up 0.9s expo.inOut; lenis.stop() behind the curtain, start() as it clears. Begin only after document.fonts.ready + hero image decode.
- HERO INTRO (overlapping the curtain): letters rise out of their masks with rotation 7°→0, 1.15s expo.out, stagger 0.065; circular badge pops in with back.out(1.8) from scale 0.4 rotation −40°; tagline slides out of its own mask; CTA fade-rises 0.8s.
- SIGNATURE MOVE: pin the hero for ~100% scroll, scrub 1: the product rises from yPercent 160 below the fold to dead center (power1.out across the pin) passing BETWEEN the letters (z-index interleave: half the letters in front, half behind); the photo camera-pushes scale 1.0→1.14; at 40% a solid wash of the canvas color fades over the photo (opacity 0→1 by 90%); letters drift apart (outer ±26 xPercent) and dissolve at ~60%; tagline/CTA/hint/badge exit early. The pin releases onto the CINEMA section which opens on the same centered object — one continuous shot, no duplicate screen.
- CINEMA: pin ~80–100% of scroll per beat, scrub 1. Beat A: object breathes (scale 0.96→1.04, rotation −3°→3°, yPercent ±2) while the ghost word slow-pans (xPercent 2→−2, scale 1→1.07) and the intro caption sits, then exits up. Beat B: badges EJECT outward from the object to their ring slots — each from its own inward offset (±130/±150 px toward center), scale 0.5→1, back.out(1.5), 0.5s, stagger 0.09, landing with individual sticker tilts (−2.5°…2.5°); once landed they keep drifting ±10px alternately with the scroll so the ring feels suspended; then they clear upward (0.3s, stagger 0.04, power2.in). Beat C — THE TRANSFORM: the object scales 1.3 + rotation 16° and vanishes power2.in 0.4s; the frame jolts (container y −14px for 0.08s, back 0.22s); the radial burst flashes scale 0→1.5 at opacity 0.7 then dissipates to 2.3; the next-stage object pops in scale 0.5→1.12 rotation −18°→5° power2.out then settles to 1.0 — repeat this beat per transform stage if the topic has several. Final beat: the object drifts aside (x +20vw, scale 0.92) onto the blob (which fades in and travels with it) while the offer rows stagger in from the left (x −36→0, 0.45s, stagger 0.09), price sticker and CTA last.
- MARQUEE: infinite seamless xPercent −50 loop, 18s; on lenis scroll events, timeScale eases toward clamp(0.4, 4, 1 + |velocity|×0.12) and the track skews ±8° with velocity via quickTo — it leans into your scroll.
- STORY: pinned, scrub 1, ~65% scroll per step: steps crossfade (out: y −60 opacity 0 power2.in / in: y 60→0 power2.out, 0.25 offset between) while photos crossfade with a continuous Ken Burns zoom (scale 1.05→1.16 per active photo).
- VARIETIES: horizontal scrub of the train (xPercent based on panel count, end = track.scrollWidth − innerWidth, invalidateOnRefresh); panel 1's content reveals via a vertical trigger, panels 2+ via containerAnimation triggers at 'left 65%' (rise y 70→0, stagger 0.07, expo.out); photos counter-drift xPercent −8→8 across the whole train for depth.
- QUOTE: split into word spans; cascade in y 40→0 rotation 4°→0, 0.8s expo.out, stagger 0.06, once at top 80%.
- FOOTER: photo parallax-zoom (yPercent −7→7 + scale 1.15→1.02, scrub); CTA letters rise per-letter from masks (1.0s expo.out, stagger 0.05, once).
- MICRO: all buttons magnetic (quickTo x/y toward cursor ×0.25/0.35, power3.out, pointer devices only) + scale 1.06 hover. Cursor parallax on hero (title far plane −10px, badge near plane +34px) and on cinema (ghost −20px, object images ±12px) — 2–3 depth planes, quickTo, hover devices only.
- Reveals that fire once: trigger 'top 85%', once:true — nothing ever re-jumps on scroll-up.
HARD TECHNICAL RULES (each one is a bug I've already paid for — follow exactly):
- Animate ONLY transform and opacity. Never top/left/width/height/box-shadow; no blur filters on large surfaces. Durations 0.6–1.2s for reveals. will-change only while animating, cleared after (clearProps).
- NEVER put a hidden state in a CSS transform when GSAP will animate that element with x/yPercent — GSAP stacks its percent transform ON TOP of the CSS one and the element sticks off-screen. Hide via parent visibility or opacity only; GSAP owns ALL transforms. Same trap with CSS translateX(-50%) centering — center absolutely-positioned animated elements with auto margins or left:0;right:0;width:fit-content instead.
- Multiple pinned sections: every ScrollTrigger gets an explicit refreshPriority in page order (topmost highest), and call ScrollTrigger.refresh() on window load — otherwise pins compute against stale layout and you get overlapping sections and blank color screens.
- Cursor parallax targets INNER elements (the img inside the container the scrub timeline moves) so quickTo and the timeline never write the same property.
- gsap.matchMedia(): desktop ≥821px gets pins + horizontal train (gate the layout-altering CSS on a JS-added html.pin-h class); mobile gets stacked sections with simple staggered reveals and pin lengths reduced or dropped.
- Re-resolve location.hash after pins reshape the page (refresh, then lenis.scrollTo immediate on load).
- Scale every pin's end distance to its beat count (~80–100% viewport scroll per beat) — rushed beats read as glitches, stretched beats read as dead screens.



════════════════ STEP 6 — DELIVER ════════════════
Give me: the exact command to run the site locally; the table of every image path with its remove-background flag and current status; a 5-line summary of what was built.

WORKING STYLE
- Never ask questions outside the two ⏸ marks — decide, state the decision in one line, keep moving.
- Push small changes fast; I watch the dev server live.
- When I send a screenshot with a complaint, fix exactly what I pointed at — don't redesign around it.
- When I say "revert", restore the previous version of that element exactly.
- No copyrighted material. Follow best practices.
