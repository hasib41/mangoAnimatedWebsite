# Love Letter 💌

A tiny, cute, interactive pixel-art love letter you can open in a web browser.

Aim **Cupid's bow**, release to fire the arrow at the floating envelope, and the
letter pops open in a retro "LOVE" window. Answer the question, and the screen
fills with falling hearts. 🎯❤️

It's a single web page — **no accounts, no installs, no internet account
needed.** Just open it.

---

## How to run it

The page uses a JavaScript module, so browsers won't let you open `index.html`
directly from your file manager (double-clicking the file won't work). You need
to serve the folder with any small local web server. Pick whichever is easiest
for you — each is a single command run **from inside this folder**.

### Option 1 — Python (already on most Macs & Linux)

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

### Option 2 — Node.js (if you have it installed)

```bash
npx serve
```

It prints a link like `http://localhost:3000` — open that.

### Option 3 — VS Code

Install the **"Live Server"** extension, then right-click `index.html` →
**"Open with Live Server"**.

To stop a server (Options 1 & 2), press **Ctrl + C** in the terminal.

---

## How to use it

1. **Aim:** move your mouse (or finger on touch) to aim the bow.
2. **Shoot:** press and hold, then **release** — or press the **Space** bar — to
   loose Cupid's arrow at the envelope.
3. The envelope bursts open into the **LOVE** window with a little pixel cat.
4. Press **YES** (the **NO** button is shy and runs away 😉).
5. Enjoy the hearts. Press the **✕** to close and shoot again.

> ♿ If your system has **"reduce motion"** turned on, the page skips the
> animations and shows everything calmly instead.

---

## What's in this folder

```
love-letter/
├── index.html        ← the page (start here)
├── love.css          ← all the styling & animation
├── love.js           ← the interactions (plain JavaScript, no libraries)
├── favicon.png       ← the little browser-tab icon
├── textures/
│   └── grain.png     ← subtle film-grain background texture
└── README.md         ← this file
```

That's the whole project. It's built with plain HTML, CSS, and JavaScript —
**no frameworks, no build step, no dependencies to download.** The two fonts
(`Press Start 2P` and `Pixelify Sans`) load from Google Fonts when you're
online; offline, the page still works with a normal fallback font.

---

## Putting it on the web (optional)

Because it's just static files, you can drag this whole folder onto any static
host and it's live — e.g. **Netlify Drop** (netlify.com/drop), **Vercel**,
**GitHub Pages**, or **Cloudflare Pages**. No configuration needed.

---

Made with love. ♡
