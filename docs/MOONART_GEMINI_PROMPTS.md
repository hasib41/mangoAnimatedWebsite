# EXPLORE MOON ART — Gemini Image Prompts

Reference: `~/Downloads/demo5.mp4` (Coding Sameer "Explore Moon Art" expanding-card gallery).
Build target: a single full-screen **expanding image-accordion gallery** — a row of rounded vertical cards, one expands wide showing a headline overlay, the rest collapse to strips, auto-cycling.

**6 cards.** Each is a stylized retrowave/synthwave landscape (digital-art wallpaper, NOT a photo — matches the reference).
**Aspect ratio:** vertical **3:4**, focal moon/sun centered so the image reads both as a narrow strip and when expanded wide.
**Background removal:** NONE — these are full-bleed card backgrounds. Save as JPG.
**Save each Gemini output in `~/Downloads` with the exact filename below** so I can auto-route it.

Every prompt forbids: people, faces, text, watermarks, logos.

---

## 1. Neon crescent over snowy peaks  →  `~/Downloads/peaks.jpg`  →  `public/photos/moonart/peaks.jpg`

> Cinematic retrowave digital-art wallpaper of a glowing neon crescent moon — a thin luminous ring of electric cyan and magenta light — hanging low over a range of sharp snow-capped mountain peaks at night. Deep indigo-to-violet gradient sky scattered with crisp stars and a faint nebula haze; the moon's glow rims the snow on the peaks in cool blue. Composition: wide and symmetrical, the crescent moon dead-center above the central peak, horizon in the lower third — balanced so it reads whether cropped to a narrow strip or expanded wide. Color palette: midnight indigo, electric cyan, hot magenta accents, cool snow-blue highlights. Mood: serene, vast, otherworldly. Ultra-detailed with atmospheric depth, subtle film grain, soft bloom on the neon. Style: premium synthwave/retrowave wallpaper art, Behance-featured dreamscape. Vertical aspect ratio 3:4, scene fills the entire frame edge to edge. No people, no faces, no text, no watermark, no logos.

---

## 2. Giant magenta sun over still water  →  `~/Downloads/sun.jpg`  →  `public/photos/moonart/sun.jpg`

> Cinematic retrowave digital-art wallpaper of an enormous glowing magenta-pink sun — a soft radiant disc crossed by faint horizontal scan-line bands — sinking to a mirror-calm sea at dusk, casting a long vertical glowing reflection straight down the center of the water. Gradient sky from deep purple at the top to fiery pink and orange at the horizon, a few high wispy clouds catching the glow, sparse stars above. Composition: the sun dead-center on the horizon line (lower-middle), perfectly symmetrical reflection below. Color palette: deep violet, hot magenta, fiery coral, dark teal water. Mood: dreamy, nostalgic, hypnotic. Ultra-detailed, soft atmospheric haze, gentle bloom and grain. Style: premium synthwave sunset wallpaper art. Vertical aspect ratio 3:4, scene fills the entire frame. No people, no faces, no text, no watermark, no logos.

---

## 3. Tropical palm sunset lagoon  →  `~/Downloads/beach.jpg`  →  `public/photos/moonart/beach.jpg`

> Cinematic dreamy digital-art wallpaper of a tropical lagoon at sunset framed by silhouetted palm trees on either side, a single lone deer silhouette standing at the water's edge, a mirror-still lagoon reflecting the sky, and a faint pale moon high above. Gradient sky from soft violet at the top to warm orange and peach at the horizon with pastel clouds. Composition: centered and open, the water and its reflection filling the lower half, palms framing left and right. Color palette: warm coral, peach, soft violet, teal water, dark silhouettes. Mood: tranquil, warm, cinematic. Ultra-detailed, soft golden atmospheric glow, subtle grain. Style: premium retrowave tropical wallpaper art. Vertical aspect ratio 3:4, scene fills the entire frame. No people, no faces, no text, no watermark, no logos.

---

## 4. Pagoda under a starry night  →  `~/Downloads/pagoda.jpg`  →  `public/photos/moonart/pagoda.jpg`

> Cinematic atmospheric digital-art wallpaper of the silhouette of a tiered Japanese pagoda temple standing on a misty hillside under a vast starry deep-blue night sky, layered distant mountains fading into fog behind it, a faint glowing moon low in the sky, and tiny drifting points of soft light like fireflies. Composition: the pagoda just left of center on the lower hill, the immense star-filled sky filling the upper two-thirds, mist pooling in the valleys. Color palette: deep indigo, midnight teal, soft moon-silver, faint warm temple glow. Mood: quiet, mystical, reverent. Ultra-detailed starfield with atmospheric depth, soft haze, gentle grain. Style: premium synthwave/ukiyo-e-inspired night wallpaper art. Vertical aspect ratio 3:4, scene fills the entire frame. No people, no faces, no text, no watermark, no logos.

---

## 5. Crimson blood-moon over dark hills  →  `~/Downloads/crimson.jpg`  →  `public/photos/moonart/crimson.jpg`

> Cinematic retrowave digital-art wallpaper of an enormous deep-crimson blood moon hanging low over rows of dark silhouetted rolling hills, the sky a dramatic gradient of blood-red and burnt orange fading to near-black at the top, sparse cold stars. Faint red glow rims the hill ridges. Composition: the giant red moon dead-center on the horizon, hills layering toward the foreground in deepening silhouette. Color palette: deep crimson, burnt orange, charcoal black, ember-red highlights. Mood: ominous, beautiful, cinematic. Ultra-detailed, smoky atmospheric haze, soft bloom on the moon, subtle grain. Style: premium dark synthwave wallpaper art. Vertical aspect ratio 3:4, scene fills the entire frame. No people, no faces, no text, no watermark, no logos.

---

## 6. Pale moon over blue dunes  →  `~/Downloads/dunes.jpg`  →  `public/photos/moonart/dunes.jpg`

> Cinematic digital-art wallpaper of rolling desert sand dunes at night beneath a giant pale luminous full moon, cool blue-and-violet moonlight raking across the dune ridges and casting long soft shadows in the valleys, a vast star-filled sky, and a tiny distant caravan silhouette far on the horizon for scale. Composition: the large pale moon centered in the upper sky, sinuous dune ridges sweeping through the lower two-thirds. Color palette: cool moon-silver, deep blue, soft mauve, shadowed indigo. Mood: vast, cold, serene. Ultra-detailed dune texture, atmospheric depth, soft bloom on the moon, subtle grain. Style: premium synthwave desert-night wallpaper art. Vertical aspect ratio 3:4, scene fills the entire frame. No people, no faces, no text, no watermark, no logos.

---

## Drop checklist

| # | Scene | Save in ~/Downloads as | Final path | Remove bg? |
|---|-------|------------------------|-----------|-----------|
| 1 | Neon crescent / snowy peaks | `peaks.jpg`   | `public/photos/moonart/peaks.jpg`   | No |
| 2 | Magenta sun / water         | `sun.jpg`     | `public/photos/moonart/sun.jpg`     | No |
| 3 | Tropical palm sunset        | `beach.jpg`   | `public/photos/moonart/beach.jpg`   | No |
| 4 | Pagoda starry night         | `pagoda.jpg`  | `public/photos/moonart/pagoda.jpg`  | No |
| 5 | Crimson blood-moon          | `crimson.jpg` | `public/photos/moonart/crimson.jpg` | No |
| 6 | Pale moon / blue dunes      | `dunes.jpg`   | `public/photos/moonart/dunes.jpg`   | No |

## Processing pipeline (when files land in ~/Downloads)
- Detect by the filenames above. No background removal (scenic backgrounds).
- Re-encode each as quality-85 JPG, resize so the long edge ≤ 1600px (3:4 → ~1200×1600).
- Move to `public/photos/moonart/`, set real width/height on every `<img>` in the gallery.
