# Love Letter 💌

A tiny, cute, interactive **pixel-art love letter** that runs in your browser.

Aim Cupid's bow, release to fire the arrow at the floating envelope, and a retro
"LOVE" window pops open. Answer the question — and the screen fills with falling
hearts. 🎯❤️

[![Live demo](https://img.shields.io/badge/Live_demo-Open-ff5c8a?style=for-the-badge)](https://hasib41.github.io/love-letter/)
&nbsp;
![Built with HTML · CSS · JS](https://img.shields.io/badge/Built_with-HTML_·_CSS_·_JS-555?style=for-the-badge)
&nbsp;
![No dependencies](https://img.shields.io/badge/dependencies-none-2ea44f?style=for-the-badge)

### ▶︎ **[Open the live demo →](https://hasib41.github.io/love-letter/)**

<sub>by <a href="https://www.youtube.com/@CodeChill_a"><b>Code &amp; Chill</b></a> 💙</sub>

![Preview of the love letter page](preview.jpg)

---

## About

A small, heartfelt web toy built with **plain HTML, CSS, and JavaScript** — no
frameworks, no build step, no dependencies. The whole thing is ~120&nbsp;KB and
works offline.

## Features

- 🏹 **Interactive bow & arrow** — aim with the mouse/finger, release (or press
  **Space**) to shoot Cupid's arrow.
- 💌 **Animated reveal** — the envelope bursts open into a retro pixel "LOVE"
  window with a little cat.
- 😉 **A playful "NO" button** that dodges your cursor.
- 🎉 **Heart confetti & rain** celebration.
- ♿ **Respects `prefers-reduced-motion`** — shows a calm, static version when
  your system has reduced motion enabled.
- 📱 **Responsive** — works on desktop and touch.

## How to play

1. **Aim** — move your mouse (or finger) to aim the bow.
2. **Shoot** — press & hold, then **release** — or hit the **Space** bar.
3. The envelope opens into the **LOVE** window.
4. Press **YES** (the **NO** button is shy 😉).
5. Enjoy the hearts. Press **✕** to close and shoot again.

## Run it locally

The page loads its JavaScript as a module, so browsers won't run it from a
`file://` path — you need to serve the folder. Pick any one (run it **inside
this folder**):

```bash
# Python (already on most Macs & Linux)
python3 -m http.server 8000
#   → open http://localhost:8000

# …or Node.js
npx serve
#   → open the printed http://localhost:3000

# …or VS Code: install the "Live Server" extension,
#   right-click index.html → "Open with Live Server"
```

Stop a running server with **Ctrl + C**.

## Tech

Plain **HTML5**, **CSS3** (animations, gradients), and **vanilla JavaScript** —
zero libraries, zero build tooling. Fonts (`Press Start 2P`, `Pixelify Sans`)
load from Google Fonts when online and fall back gracefully offline. The cat is
drawn on a `<canvas>`.

## Project structure

```
love-letter/
├── index.html      # the page
├── love.css        # styling & animation
├── love.js         # interactions (vanilla JS)
├── favicon.png     # browser-tab icon
├── preview.jpg     # screenshot used in this README
└── textures/
    └── grain.png   # subtle film-grain background
```

## Deploy

It's just static files, so it hosts anywhere with no config:

- **GitHub Pages** — Settings → Pages → *Deploy from a branch* → `main` / `root`.
  Live at `https://<username>.github.io/love-letter/`.
- Or drag the folder onto **Netlify Drop**, **Vercel**, or **Cloudflare Pages**.

## License

[MIT](LICENSE) — do what you like with the code. ♡

---

<a href="https://www.youtube.com/@CodeChill_a">
  <img src="logo.png" alt="Code &amp; Chill" width="56" align="left" hspace="10" />
</a>

**Made with love by [Code &amp; Chill](https://www.youtube.com/@CodeChill_a).**
If you build something with it, a ⭐ and a subscribe make my day. 💙

<br clear="left" />
