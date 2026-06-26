# INTERACTIVE DEADLINE — Gemini Image Prompts

Two character sprites for the stage: a **deadline reaper** that advances from the
left, and a **developer at a desk** on the right. Generate each in Gemini, run it
through the alpha pipeline (below), and save it at the exact path listed. The site
needs ZERO code changes when you replace the stand-ins — just overwrite the file.

**Shared art-direction (put this in your head for both):**
flat, modern vector-style illustration with *subtle* dimensional shading and a thin
rim light — a clean, premium "coding-poster" look, NOT a detailed painterly render
and NOT a photo. Bold readable silhouette. The character must read instantly at small
size on a near-black stage. **Plain flat solid background** (so it cuts out cleanly),
**no cast shadow on the ground** (the site adds its own), no scenery, no text, no
watermark, no logo. Whole figure, not cropped, centred.

---

## 1. THE DEADLINE REAPER
**File:** `public/photos/deadline/reaper.png`
**remove.bg first:** YES — PNG with transparency.

> Flat modern vector-style illustration of a menacing grim-reaper "deadline" creature, shown in full from head to hem, in side profile **facing right** as if striding forward. A tall hooded cloak in a rich crimson-to-bright-red gradient (deep oxblood #8a0d18 in the folds, vivid scarlet #ff2d2d on the lit edges), with flowing tattered robe hems. The hood opening is a pure black void with two small cold glowing pale-amber eyes. One bony arm is raised holding a long scythe — slim dark-red pole and a sharp curved blade — angled up and back over the shoulder, poised to swing. Slightly hunched, aggressive, looming posture. Style: bold flat silhouette with one subtle inner highlight and a thin crisp rim light tracing the right edge; minimal clean shapes, high contrast, premium poster illustration. Lighting feels like it comes from the right. **Plain flat solid light-grey background (#d8d8dc), completely empty, no gradient, no ground shadow.** No text, no watermark. Vertical aspect ratio 3:4. The reaper fills about 90% of the frame height, centred.

---

## 2. THE DEVELOPER AT THE DESK
**File:** `public/photos/deadline/dev.png`
**remove.bg first:** YES — PNG with transparency.

> Flat modern vector-style illustration of a developer hunched over a desk, frantically typing, shown in full in side profile **facing right** with their back toward the left of the frame. A simple sleek desk with a single computer monitor on the right whose screen emits a soft cyan-white glow that lights the figure's face and hands. The person is rendered in cool off-white and light pewter-grey tones (#eef1f8 highlights, #aab0c2 shadow) with a thin cyan rim light from the screen; shoulders rounded forward, elbows up, fingers on a low-profile keyboard, a small focused/stressed posture. Sitting on a minimal stool or chair. Style: bold flat silhouette-forward illustration with subtle dimensional shading and a clean rim light, premium poster look, high contrast, instantly readable. **Plain flat solid dark-charcoal background (#1a1c22), completely empty, no gradient, no ground shadow.** No text, no watermark, no other furniture. Aspect ratio 4:3 landscape. The developer-and-desk group fills about 88% of the frame width, centred, with the glowing monitor on the right side.

---

## Alpha pipeline (run after Gemini, before saving to the paths above)

Drop the raw Gemini exports in `~/Downloads`, then (per the repo recipe):

```bash
python3 -m venv /tmp/rembg && /tmp/rembg/bin/pip install "rembg[cli]" pillow
# cut the background
/tmp/rembg/bin/rembg i -m u2net ~/Downloads/reaper_raw.png reaper_cut.png
# (then) contract the alpha edge ~2px + 1px blur to kill the halo, trim to the
# bounding box, and downscale the longest side to ~1100px. Write the PNG to:
#   public/photos/deadline/reaper.png
#   public/photos/deadline/dev.png
```

I can run this whole pipeline for you — just hand me the two raw files (or drop them
in `~/Downloads`) and tell me which is which.

## Wiring (what I do once the images exist)

Swap the two inline `<svg>` figures in `index.html` for `<img>` slots pointing at the
paths above, re-tune their position/scale on the rail, and re-base the motion
(advance + loom + idle bob for the reaper; typing jitter + bob for the dev) onto the
sprites. The rail, countdown, danger-vignette and climax stay as code.

## Tips for a clean cut

- Keep the background a **flat solid colour that differs from the character** (light-grey
  behind the red reaper, dark-charcoal behind the light dev) — that's what makes rembg
  cut a crisp edge.
- If a first pass looks "blobby", add to the prompt: *"clean sharp vector edges, distinct
  separated limbs, no muddy shapes."*
- If the reaper isn't scary enough: *"more angular and skeletal, sharper hood point,
  longer scythe blade."*
