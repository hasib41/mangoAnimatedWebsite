# MANGOO — Gemini Image Prompts

Generate each image in Gemini, then drop the file at the exact path listed.
The site needs ZERO code changes when you replace the stand-ins — just overwrite the file.

---

## 1. HERO MANGO
**File:** `public/photos/mango/hero.png`
**remove.bg first:** YES — run the Gemini output through remove.bg, export PNG with transparency, then save it at the path above.

> Commercial product photograph of a single perfect ripe Alphonso mango, whole and uncut. Skin is a rich saffron-gold gradient blushing into deep red-orange at the shoulder, with fine natural speckling and a soft waxy sheen. Camera angle: straight-on eye level, the mango standing upright on its base, tilted 10 degrees for a dynamic silhouette. Lens: 100mm macro at f/8, everything tack sharp. Lighting: large softbox key light from upper left, a crisp white rim light from behind-right tracing the mango's edge, one small soft shadow directly beneath the fruit. Background: plain solid pure white (#FFFFFF), completely empty, no gradient, no surface texture. Texture detail: extreme — visible skin pores, lenticel speckles, micro water droplets on the skin. Style: premium fruit advertising, like a Harrods or Whole Foods campaign hero shot. Aspect ratio 1:1. The mango fills about 75% of the frame height, centered.

---

## 2. CUT MANGO (hedgehog style)
**File:** `public/photos/mango/cut.png`
**remove.bg first:** YES — transparency needed, the photo floats over a colored section.

> Commercial food photograph of a ripe Kesar mango cut hedgehog style: one half scored into a grid of plump juicy golden-orange cubes, flesh pushed inside-out so the cubes fan upward, skin side down. The flesh is glistening, saturated apricot-orange, visibly wet with juice. Camera angle: three-quarter view from 30 degrees above, showing both the cube tops and their sides. Lens: 85mm at f/11 for full sharpness. Lighting: big overhead softbox slightly behind the subject so every cube top catches a specular juice highlight, white bounce card in front to open shadows, soft contact shadow under the fruit. Background: plain solid pure white (#FFFFFF), nothing else in frame. Texture detail: extreme — fibrous flesh strands, juice beads, glossy wet surfaces. Style: high-end juice brand advertisement, Innocent Drinks / Tropicana campaign quality. Aspect ratio 1:1. The cut mango fills about 80% of the frame width.

---

## 3. ORCHARD (footer background)
**File:** `public/photos/mango/orchard.jpg`
**remove.bg first:** NO — used as a full-bleed background, keep it as a JPG.

> Atmospheric landscape photograph of a mango orchard at golden hour, rows of mature mango trees heavy with ripening Alphonso mangoes hanging from long stems, sun low on the horizon flaring softly through the leaves. Warm amber and honey light, long soft shadows on the grass between rows, slight haze in the distance. Camera angle: low, looking down an orchard row toward the sun. Lens: 35mm at f/4, foreground mangoes sharp, distance gently soft. Lighting: pure natural backlight from the setting sun, golden rim light on every mango and leaf edge. No people, no buildings, no text, no watermark, no birds. Texture detail: high — leaf veins, fruit skin speckle on the nearest mangoes. Style: premium farm-to-table brand campaign, National Geographic quality. Vertical aspect ratio 9:16. Trees and fruit fill the entire frame edge to edge.

---

---

## 4. ALPHONSO (varieties section)
**File:** `public/photos/mango/varieties/alphonso.png`
**remove.bg first:** YES — PNG with transparency.

> Commercial product photograph of a single ripe Alphonso mango standing upright, skin a deep saffron-gold with a crimson blush on the shoulder and fine speckling. Camera: eye level, 100mm macro, f/8, tack sharp. Lighting: large softbox from upper left, white rim light from behind-right, one soft shadow under the fruit. Background: plain solid pure white (#FFFFFF). Extreme skin texture detail. Premium fruit advertising style. Aspect ratio 1:1, mango fills 75% of frame height.

---

## 5. HIMSAGAR (varieties section)
**File:** `public/photos/mango/varieties/himsagar.png`
**remove.bg first:** YES — PNG with transparency.

> Commercial product photograph of a single ripe Himsagar mango standing upright, skin a uniform warm golden-yellow with a hint of pale green near the stem, smooth and waxy. Camera: eye level, 100mm macro, f/8. Lighting: large softbox key from upper left, crisp rim light from behind-right, soft contact shadow. Background: plain solid pure white (#FFFFFF). Extreme texture detail, premium fruit advertising style. Aspect ratio 1:1, mango fills 75% of frame height.

---

## 6. LANGRA (varieties section)
**File:** `public/photos/mango/varieties/langra.png`
**remove.bg first:** YES — PNG with transparency.

> Commercial product photograph of a single ripe Langra mango standing upright, skin pale sage-green with subtle yellow undertones and light speckling, matte waxy finish. Camera: eye level, 100mm macro, f/8. Lighting: large softbox from upper left, white rim light tracing the right edge, soft shadow beneath. Background: plain solid pure white (#FFFFFF). Extreme texture detail, premium fruit advertising style. Aspect ratio 1:1, mango fills 75% of frame height.

---

## 7. STORY — PICKED
**File:** `public/photos/mango/story-pick.jpg`
**remove.bg first:** NO — scenic JPG.

> Photojournalistic close-up of a farmer's weathered hand gently twisting a ripe golden mango off its long stem on the tree, dawn light streaming low through orchard leaves behind, soft bokeh. Camera: 50mm at f/2.8, hand and fruit sharp, background melting. Warm golden-hour backlight with rim light on the mango. No faces, no text, no watermark. High texture detail on skin and leaves. Premium farm-to-table campaign style. Aspect ratio 3:2 landscape.

---

## 8. STORY — PACKED
**File:** `public/photos/mango/story-pack.jpg`
**remove.bg first:** NO — scenic JPG.

> Top-down food photograph of ripe golden mangoes nested in fresh straw inside a rustic wooden crate, one mango wrapped in thin paper, warm morning side-light raking across the scene casting soft long shadows. Camera: overhead flat-lay, 35mm, f/5.6, all sharp. Natural window light from the left with a white bounce. No hands, no text, no watermark. Rich texture: straw fibers, wood grain, fruit speckle. Artisanal premium packaging campaign style. Aspect ratio 3:2 landscape.

---

## 9. STORY — DELIVERED
**File:** `public/photos/mango/story-ship.jpg`
**remove.bg first:** NO — scenic JPG.

> Editorial product photograph of an open kraft cardboard delivery box on a clean doorstep, six perfect golden mangoes inside on a bed of straw with two green mango leaves placed on top, soft daylight from the upper right, gentle shadow of the box on warm stone. Camera: three-quarter angle from 40 degrees, 50mm, f/4. No people, no logos, no text, no watermark. Crisp detail on fruit and cardboard texture. Premium direct-to-consumer unboxing campaign style. Aspect ratio 3:2 landscape.

---

## Drop checklist
| # | Gemini output | remove.bg? | Final path |
|---|---------------|-----------|------------|
| 1 | Hero mango    | YES → PNG | `public/photos/mango/hero.png` ✅ done |
| 2 | Cut mango     | YES → PNG | `public/photos/mango/cut.png` ✅ done |
| 3 | Orchard       | No → JPG  | `public/photos/mango/orchard.jpg` ✅ done |
| 4 | Alphonso      | YES → PNG | `public/photos/mango/varieties/alphonso.png` ✅ done |
| 5 | Himsagar      | YES → PNG | `public/photos/mango/varieties/himsagar.png` ✅ done |
| 6 | Langra        | YES → PNG | `public/photos/mango/varieties/langra.png` ✅ done |
| 7 | Picking hand  | No → JPG  | `public/photos/mango/story-pick.jpg` ✅ done |
| 8 | Straw crate   | No → JPG  | `public/photos/mango/story-pack.jpg` ✅ done |
| 9 | Delivery box  | No → JPG  | `public/photos/mango/story-ship.jpg` ✅ done |
