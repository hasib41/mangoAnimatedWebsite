# CRÈMA — Gemini Image Prompts

Detailed, production-grade prompts for the CRÈMA espresso-roastery site (`/crema/`).
Generate each in Gemini (Imagen), drop the file at the **exact path** listed, then run the
processing pipeline at the bottom. The site is type-forward today — once these land I can
wire each into its section (noted under **Where it goes**) with zero guesswork.

## House look (keep every image on-brand)
- **Palette:** espresso `#1f120a` · roast `#6f3d23` · caramel `#b06a35` · crema `#d9a86c` · gold `#e9bd83` · cream `#f4ece0`.
- **Two lighting modes:**
  - **Cutouts (PNG)** → clean high-key, **plain solid pure white `#FFFFFF`** background, no surface, no scene — so `rembg` cuts cleanly.
  - **Scenic (JPG)** → moody **low-key**, warm key light from upper-left, shadows falling to near-black espresso brown, full-bleed.
- **Always negative-prompt:** *no text, no logo, no watermark, no signage, no UI, no faces* (hands only where noted).
- **Camera language:** name the lens, aperture, angle, and the lighting direction in every prompt — it's what separates a campaign still from a stock photo.
- Generate 3–4 variants per image at the **highest resolution** offered and pick the cleanest crema/texture.

---

## 1. HERO — espresso cup
**File:** `public/photos/crema/hero-cup.png` · **rembg:** YES → transparent PNG
**Where it goes:** floats to the right of the "Roasted for / the ritual" headline in the hero.

> Commercial product photograph of a single small ceramic espresso cup in a warm stone-cream matte glaze, filled to the rim with a freshly pulled double espresso crowned by a thick hazelnut-golden crema showing fine tiger-mottling, two delicate wisps of steam rising from the surface. The cup rests on its matching saucer, seen from a slightly low three-quarter angle about 15 degrees above the rim so both the crema surface and the cup silhouette read clearly. Lens: 100mm macro at f/8, tack sharp front to back. Lighting: large softbox key from the upper left, a warm crisp rim light from behind-right tracing the cup's right edge and catching the steam, a white bounce card opening the front, one soft contact shadow directly beneath the saucer. Background: plain solid pure white (#FFFFFF), completely empty — no table, no props, no gradient. Texture: extreme — ceramic glaze speckle, individual crema bubbles, fine condensation. Color: warm espresso browns and golden crema against clean white. Style: high-end specialty-coffee campaign, Onyx Coffee Lab / Blue Bottle quality. Aspect ratio 4:5 portrait, cup filling ~80% of frame height, centered. No text, no logo, no watermark, no hands, no spoon.

---

## 2. POUR — latte-art hero moment
**File:** `public/photos/crema/pour.jpg` · **rembg:** NO → scenic JPG
**Where it goes:** an optional full-width feature band between the hero and the menu.

> Atmospheric action photograph of steamed milk pouring from a polished stainless-steel pitcher into a flat white, a crisp white rosetta latte-art leaf blooming across the golden-brown crema. Intimate framing from a 30-degree high angle. Moody low-key lighting: a single warm softbox from the upper left rakes across the cup and the falling milk ribbon while the right side falls to near-black. Lens: 85mm at f/2.8 — the crema surface and the milk stream razor sharp, the surroundings melting into warm darkness. Background: deep espresso-brown bokeh hinting at a dark wooden café counter, unlit. Color grade: warm, golden crema highlights, rich brown midtones, inky shadows (#1f120a). Texture: visible microfoam, crema mottling, the metallic gleam on the pitcher. Style: cinematic specialty-coffee editorial, tactile and premium. Aspect ratio 3:2 landscape. No text, no watermark, no faces.

---

## 3–6. ROAST BEANS — four levels (the selector tie-in)
**Files:** `public/photos/crema/beans/light.png` · `…/medium.png` · `…/dark.png` · `…/espresso.png`
**rembg:** YES → transparent PNGs
**Where it goes:** swaps in beside the **roast selector** — pick Light/Medium/Dark/Espresso and the beans change with the room.

> **Keep the camera, lighting, framing and background IDENTICAL across all four** so they cross-fade cleanly — only the bean color/finish changes.

**Shared base (edit the bracketed roast line per image):**

> Commercial product photograph of a small loose pile of about 28 whole coffee beans grouped into one compact rounded cluster, [ROAST]. Natural irregular bean shapes, the center crease clearly visible. Camera: 45-degree three-quarter top view, 100mm macro at f/11 so the front and back beans are all sharp. Lighting: large softbox from the upper left, white bounce in front, one soft contact shadow beneath the pile. Background: plain solid pure white (#FFFFFF), nothing else in frame. Texture: extreme — bean surface, the center crease, a few tiny chaff flecks. Style: premium specialty-coffee catalog hero, clean and crisp. Aspect ratio 1:1, the pile filling ~70% of frame width, centered. No text, no logo, no watermark, no scoop, no bag, no spilled grounds.

- **3 · light.png** — `[ROAST] = at a LIGHT (cinnamon) roast: pale tan to light cinnamon-brown, completely matte and bone-dry with no surface oil`
- **4 · medium.png** — `[ROAST] = at a MEDIUM roast: even milk-chocolate brown, matte with only the faintest satin sheen, dry surface`
- **5 · dark.png** — `[ROAST] = at a DARK roast: deep chocolate brown with the first sheen of surface oils catching soft highlights, lightly glossy`
- **6 · espresso.png** — `[ROAST] = at an ESPRESSO (Italian) roast: near-black dark brown, visibly oily and glossy with bright specular highlights on every bean, the darkest of the set`

---

## 7–9. RITUAL — three steps (Weigh · Pull · Pour)
**Files:** `public/photos/crema/ritual-weigh.jpg` · `…/ritual-pull.jpg` · `…/ritual-pour.jpg`
**rembg:** NO → scenic JPGs
**Where it goes:** one image per card in the "Three steps, every time" section. Keep them a matched moody set.

**7 · Weigh**
> Moody close-up photograph of an espresso prep: a bottomless portafilter resting on a small digital scale, a fresh dose of finely ground coffee mounded in the basket, a few stray grounds scattered on the dark counter. Warm low-key light from the upper left, deep espresso-brown shadows. Lens: 50mm at f/2.8 — the grounds and the scale sharp, the background soft. Background: dark walnut café counter dissolving into shadow. Warm golden grade, inky shadows. Texture: individual coffee grounds, brushed steel, matte scale body. Style: premium specialty-coffee editorial. Aspect ratio 4:5 portrait. No text or numbers on the scale display, no watermark, no faces.

**8 · Pull**
> Moody close-up of an espresso extraction in progress: twin tiger-striped ropes of rich espresso streaming from a polished chrome portafilter spout into a clear glass, golden crema building on top, warm backlight catching the falling espresso and a thread of steam. Lens: 100mm macro at f/4. Background: dark espresso-brown, the chrome group head softly out of focus above. Warm golden highlights against near-black shadow. Texture: the viscous espresso strands, crema bubbles, water beads on chrome. Style: cinematic specialty-coffee campaign. Aspect ratio 4:5 portrait. No text, no watermark, no faces.

**9 · Pour**
> Moody close-up of steamed milk being folded into espresso, a tulip latte-art pattern forming across a golden-brown crema surface, a stainless pitcher caught mid-pour. Warm soft light from the upper left, dark surroundings. Lens: 85mm at f/2.8. Background: dark wooden counter, deep brown bokeh. Warm grade, glossy microfoam highlights. Texture: silky microfoam against crema contrast. Style: premium coffee editorial. Aspect ratio 4:5 portrait. No text, no watermark, no faces.

---

## 10. ATMOSPHERE — roastery backdrop
**File:** `public/photos/crema/atmosphere.jpg` · **rembg:** NO → scenic JPG
**Where it goes:** optional full-bleed background behind the footer / "Find us" block.

> Atmospheric interior photograph of an artisan coffee roastery at golden hour: a vintage cast-iron drum roaster sitting in warm shadow, burlap sacks of green coffee stacked beside it, fine dust and a little steam catching a low shaft of warm window light, deep browns and an amber glow throughout. Camera: 35mm at f/4 — the roaster sharp, the depth falling gently soft. Natural warm backlight, long soft shadows, moody and cinematic. Color grade: espresso browns, caramel and golden light, inky shadows (#1f120a, #6f3d23, #d9a86c). Rich texture: cast iron, burlap weave, floating dust motes. Style: premium roastery brand-film still. Aspect ratio 16:9 landscape, filling the frame edge to edge. No people, no text, no signage, no watermark.

---

## Processing pipeline (after you drop files in `~/Downloads`)
I run this for you — it's the same pipeline as the other projects:
1. **Cutouts (PNGs):** `rembg` with the **u2net** model (installed in a throwaway `/tmp` venv) → **contract the alpha 2px + 1px blur** to kill white fringing → **trim to the content bounding box**.
2. **Downscale:** product PNGs to **~1100px** on the long edge; scenic shots re-encoded as **quality-85 JPG, ≤1600px**.
3. **Wire-in:** copy to the paths above and set the **real final `width`/`height`** on every `<img>` (plus `loading="lazy"` below the fold, descriptive `alt`).

## Drop checklist
| #  | Image            | rembg?    | Final path                                     | Target (approx)     |
|----|------------------|-----------|------------------------------------------------|---------------------|
| 1  | Hero espresso cup| YES → PNG | `public/photos/crema/hero-cup.png`             | 4:5, ~900×1125      |
| 2  | Latte-art pour   | No → JPG  | `public/photos/crema/pour.jpg`                 | 3:2, ≤1600px q85    |
| 3  | Beans — light    | YES → PNG | `public/photos/crema/beans/light.png`          | 1:1, ~900×900       |
| 4  | Beans — medium   | YES → PNG | `public/photos/crema/beans/medium.png`         | 1:1, ~900×900       |
| 5  | Beans — dark     | YES → PNG | `public/photos/crema/beans/dark.png`           | 1:1, ~900×900       |
| 6  | Beans — espresso | YES → PNG | `public/photos/crema/beans/espresso.png`       | 1:1, ~900×900       |
| 7  | Ritual — weigh   | No → JPG  | `public/photos/crema/ritual-weigh.jpg`         | 4:5, ≤1400px q85    |
| 8  | Ritual — pull    | No → JPG  | `public/photos/crema/ritual-pull.jpg`          | 4:5, ≤1400px q85    |
| 9  | Ritual — pour    | No → JPG  | `public/photos/crema/ritual-pour.jpg`          | 4:5, ≤1400px q85    |
| 10 | Atmosphere       | No → JPG  | `public/photos/crema/atmosphere.jpg`           | 16:9, ≤1600px q85   |

**Minimum set for impact:** #1 (hero cup) + #3–6 (the four roast beans) — those alone light up the hero and the signature roast selector. The rest deepen the menu/ritual/footer.
