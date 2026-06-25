# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A premium **one-page, scroll-driven "ad-film" product website**  — Vite + vanilla JS, no framework, no backend. The whole site is a single continuous animation: one hero object (a mango) that persists, travels, and transforms as you scroll, with pinned scroll-scrubbed scenes that play like a video timeline. Quality bar is awwwards-level.

This repo is also used as a template to spin up **similar one-page animation sites** and to export them as vertical **YouTube Shorts** (see the two workflow sections at the bottom).

## Commands

```bash
npm install
npm run dev        # Vite dev server — hot-reloads every save; share the URL and watch live
npm run build      # production build → dist/
npm run preview    # serve the built dist/
```

There is **no test suite and no linter** configured — don't invent commands for them. Verification is visual: run `npm run dev` and look at the page.

## Source layout

This is a **multi-project** Vite app. The hub lives at the root; every site is a **self-contained, numbered folder under `projects/`** with its own `index.html` and **co-located** CSS/JS, served at `/projects/<nn-name>/`:

- `index.html` (root) — the **hub landing page** at `/`, linking to every project. Static, self-contained.
- `projects/01-mango/` — the MANGOO site (`index.html` + `main.js` + `style.css`), served at `/projects/01-mango/`. The original build; richest animation logic.
- `projects/02-nero/`, `03-moonart/`, `04-monolith/`, `05-crema/`, `06-love/`, `07-birthday/` — the other projects, same pattern (`<nn-name>/index.html` + co-located `.css`/`.js`), served at `/projects/<nn-name>/`. Serial numbers follow hub-card order.
- Each project's HTML references its assets **relatively** (`./moonart.css`, `./moonart.js`) — NOT `/src/...` (there is no shared `src/`). Cross-cutting assets are still **absolute** from the web root (`/photos/...`, `/textures/...`), unaffected by the folder location.
- `projects/_template/` — copy-me scaffold for a new project (`index.html` + `app.css` + `app.js`). Folders starting with `_` are ignored by the build.
- `public/` — served at the web root. Per-project images at `public/photos/<name>/...` referenced as `/photos/<name>/...`. Also `public/textures/grain.png` and `public/favicon*.png`. **No videos here** — videos aren't referenced by any site, so they live in `assets/` (below), out of the deploy.
- `assets/` — raw, non-deployed inputs (not served by Vite). `assets/audio/` source music. `assets/video/<project>/` holds **all of a project's videos in one place** — the finished short, its silent master, the thumbnail, and any raw source/reference clip (e.g. `assets/video/birthday/` = `birthday_short.mp4` + `birthday_short_silent.mp4` + `birthday_thumb.jpg` + `birthday_reference.mp4`; `assets/video/mango/` = `mango_short.mp4` + `mango_source.MOV`). crema has no video yet, so no folder.
- `docs/` — build prompts & pipelines: `WEBSITE_PROMPT.md` (master build spec + hard animation rules — read when building a new ad-film site), `GEMINI_PROMPTS.md` (image prompts + rembg/alpha/downscale pipeline), and per-project `*_GEMINI_PROMPTS.md`.
- `nero-video/`, `monolith-video/` — separate Remotion projects (own toolchains); not part of the Vite build, kept at the repo root.

`vite.config.js` **auto-discovers** projects: any folder under `projects/` with an `index.html` (not starting with `_`/`.`) becomes a build entry, output to `dist/projects/<name>/`. So **adding a project = drop in `projects/NN-name/index.html`** (copy `projects/_template`), put images in `public/photos/<name>/`, and it ships at `/projects/NN-name/` — no config edit. Add a card to the root `index.html` hub to link it.

## Animation architecture (`projects/01-mango/main.js`)

The single most important file. Structure to know before touching it:

- **One shared rAF loop.** Lenis smooth scroll is driven by GSAP's ticker — `gsap.ticker.add((t) => lenis.raf(t*1000))`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`. Never add a second `requestAnimationFrame` loop for scroll. Anchor clicks route through `lenis.scrollTo`.
- **Reduced-motion fork at the top.** If `prefers-reduced-motion`, the loader/pins are skipped and everything becomes simple fades; otherwise `main()` runs. Keep both paths working when you add a scene.
- **`gsap.matchMedia()` splits desktop vs mobile.** `(min-width: 821px)` gets the pinned + horizontal-scroll versions (`cinema(true)`, `storyPinned()`, `varietiesHorizontal()`) and adds an `html.pin-h` class that gates layout-altering CSS. `(max-width: 820px)` gets stacked variants (`cinema(false)`, `storyStacked()`, `varietiesStacked()`). Each context returns a cleanup that kills its ScrollTriggers — matchMedia auto-reverts on resize. Any new scene needs both a desktop and a mobile form.
- **One function per section:** `intro`, `cinema`, `marquee`, `storyPinned/storyStacked`, `varietiesHorizontal/varietiesStacked`, `quote`, `footer`, `magnetic`.
- **The signature move (`intro`):** the hero is pinned for ~100% scroll; the mango rises from below up *through* the wordmark letters (z-index interleaved — `char--front` / `char--back`) while the orchard photo washes to green and the letters spread and dissolve. The pin releases directly onto `cinema`, which opens on the same centered mango — one continuous shot.
- **`refreshPriority` is set in page order, top = highest:** hero 6, cinema 5, story 4, varieties 3, quote 2, footer 1. With multiple pinned sections this is mandatory, and `ScrollTrigger.refresh()` is called on `window load`. Get this wrong and pins compute against stale layout → overlapping/blank sections.
- **Runtime text splitting:** the quote line is split into `.word` spans and each `.vpanel__name` into `.ch` letter spans at startup, so they can be staggered/masked. Markup stays plain; JS injects the spans.
- **Cursor parallax always targets *inner* elements** (the `img` inside the container the scrub timeline moves) via `gsap.quickTo`, so the pointer tween and the scroll timeline never write the same property.

## Hard rules (each is a bug already paid for — follow exactly)

These come from `WEBSITE_PROMPT.md` and are load-bearing:

- **Animate only `transform` and `opacity`.** Never `top/left/width/height/box-shadow`; no blur filters on large surfaces. `will-change` only while animating, then `clearProps`.
- **GSAP owns all transforms.** Never put an element's hidden/offset state in a CSS `transform` if GSAP will animate it with `x/yPercent` — GSAP stacks its transform on top and the element sticks off-screen. Hide via parent `visibility`/`opacity` only. Same trap with CSS `translateX(-50%)` centering — center animated absolute elements with `left:0;right:0;width:fit-content` or auto margins instead.
- **Scale each pin's scroll length to its beat count** (~80–100% viewport per beat). Rushed beats read as glitches; stretched beats read as dead screens.
- **Re-resolve `location.hash` after pins reshape the page** (`refresh()` then `lenis.scrollTo(..., {immediate:true})` on load).
- **Reveal-once triggers** use `start:'top 85%'`, `once:true` — nothing re-jumps on scroll-up.
- **Photographic assets only** — no SVG/CSS-drawn product art, no emoji, no placeholder images. Backgrounds are never pure white `#FFF`; text color is the cream token.

## Styling (`projects/01-mango/style.css`)

Design tokens live in `:root` at the top: palette (`--c-yellow/orange/green/cream/ink`), two font families (`--font-display` Anton for giant type, `--font-body` Instrument Sans), a fluid `clamp()` type scale (`--fs-xs` … `--fs-huge`), spacing scale, and `--ease-out`. Use these tokens rather than hardcoding values. CSS sections mirror the HTML sections in order. The `.grain` overlay and loader curtain are CSS + JS-gated (`html.js`, `html.lenis`).

## Building a NEW site from this template

Follow `WEBSITE_PROMPT.md` end to end — it drives topic choice, the per-topic structure (how many story beats / variants / transform stages — counts are NOT fixed), the Gemini image prompts, and the choreography with concrete values. The image pipeline (drop files in `~/Downloads` → rembg `u2net` in a `/tmp` venv → contract alpha 2px + 1px blur → trim to bbox → downscale product PNGs ~1100px, scenic JPGs q85 ≤1600px → write real `width/height` on every `<img>`) is in `WEBSITE_PROMPT.md` Step 1 and `GEMINI_PROMPTS.md`.

## Video / YouTube Shorts export

The site is also turned into vertical Shorts. **All of a project's videos live together in `assets/video/<project>/`** (not in `public/` — they aren't web assets, and this keeps the deploy lean): the finished short, a **silent master** (so audio can be re-muxed/swapped without re-rendering), a thumbnail, and any raw source/reference clip. Copyrighted source music lives in `assets/audio/`. Example: `assets/video/birthday/` = `birthday_short.mp4` + `birthday_short_silent.mp4` + `birthday_thumb.jpg` + `birthday_reference.mp4`.

**Environment constraints (verified on this machine — don't fight them):**
- The Homebrew `ffmpeg` here is built **without** `libfreetype`/libass, so the `drawtext` and `subtitles` filters **do not exist**. Text cannot be burned in by ffmpeg directly.
- There is **no system ImageMagick and no system Pillow**.

**Working recipe for burned-in text:** create a throwaway venv and render text to transparent PNGs, then composite with ffmpeg's `overlay`:
1. `python3 -m venv /tmp/piltext && /tmp/piltext/bin/pip install Pillow`
2. Render 1080×1920 RGBA PNGs with PIL (`ImageFont.truetype`, `anchor="mm"`, `stroke_width` for legibility). Bold fonts available: `/System/Library/Fonts/Supplemental/Arial Black.ttf` and `Arial Bold.ttf`. **Emoji do not render** — keep overlays text-only.
3. ffmpeg vertical-Short composite pattern: blurred cover-fill background (`scale=...:force_original_aspect_ratio=increase,crop=1080:1920,boxblur`) + the source video scaled to 1080 wide and centered via `overlay` + the text PNGs overlaid (timed with `enable='gte(t,N)'`, faded with the `fade` filter on a looped image input). White end-card pages are a separate opaque PNG concatenated via the `concat` filter (give the card a silent `anullsrc` audio track so `concat` has matching streams).
4. Encode `libx264 -pix_fmt yuv420p -crf 19 -c:a aac -movflags +faststart`. Verify by extracting frames (`ffmpeg -ss <t> -i out.mp4 -frames:v 1 frame.png`) and viewing them.

**Music copyright:** uploaded audio may trigger YouTube Content ID claims — prefer royalty-free tracks for Shorts and flag this to the user before publishing.
