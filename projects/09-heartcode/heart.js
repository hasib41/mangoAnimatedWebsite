/* ─────────────────────────────────────────────────────────────────────────
   Love, in 3D
   A volumetric heart of text from the implicit heart curve
   f(x,y) = (x² + y² − 1)³ − x²·y³ ≤ 0, extruded across Z-layers.
   Only the parent transforms animate (CSS); tokens are static in preserve-3d.
   ───────────────────────────────────────────────────────────────────────── */

const WORD = "i love you ";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const heart = (x, y) => {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y;          // ≤ 0  ⇒  inside
};

/* Build one flat heart of text: horizontal lines whose width follows the
   heart silhouette; the top cleavage / bottom point fall out of the scan. */
function buildLayer(W, H) {
  const layer = document.createElement("div");
  layer.className = "hc-layer";
  layer.style.setProperty("--w", W + "px");
  layer.style.setProperty("--h", H + "px");

  const ROWS = 26;
  const yTop = 1.28, yBot = -1.06, xSpan = 1.2;
  const rowH = H / ROWS;

  for (let r = 0; r < ROWS; r++) {
    const y = yTop - (yTop - yBot) * (r / (ROWS - 1));

    const intervals = [];
    let inside = false, start = 0;
    for (let x = -xSpan; x <= xSpan; x += 0.008) {
      const isIn = heart(x, y) < 0;
      if (isIn && !inside) start = x;
      if (!isIn && inside) intervals.push([start, x]);
      inside = isIn;
    }
    if (inside) intervals.push([start, xSpan]);

    const top = (r / (ROWS - 1)) * H;
    for (const [a, b] of intervals) {
      const wpx = ((b - a) / (2 * xSpan)) * W;
      if (wpx < 7) continue;
      const cx = (((a + b) / 2) / (2 * xSpan)) * W;

      const row = document.createElement("div");
      row.className = "hc-row";
      row.style.top = top.toFixed(1) + "px";
      row.style.width = wpx.toFixed(1) + "px";
      row.style.height = rowH.toFixed(1) + "px";
      row.style.fontSize = (rowH * 0.96).toFixed(1) + "px";
      row.style.transform = `translateX(calc(-50% + ${cx.toFixed(1)}px))`;
      row.style.setProperty("--sh", (r * 0.12).toFixed(2) + "s");
      row.textContent = WORD.repeat(14);
      layer.appendChild(row);
    }
  }
  return layer;
}

function buildHeart(world) {
  const stage = document.querySelector(".stage");
  const size = Math.min(stage.clientWidth * 0.92, stage.clientHeight * 0.82);
  const W = size, H = size * 1.04;

  const LAYERS = reduce ? 3 : 7;
  const gap = 9;

  world.textContent = "";
  for (let i = 0; i < LAYERS; i++) {
    const depth = LAYERS === 1 ? 0 : i / (LAYERS - 1);
    const z = (i - (LAYERS - 1) / 2) * gap;
    const layer = buildLayer(W, H);
    layer.style.transform = `translateZ(${z.toFixed(1)}px)`;
    layer.style.setProperty("--depth", depth.toFixed(3));
    world.appendChild(layer);
  }
}

/* ambient drifting particles */
function buildParticles(host) {
  const n = reduce ? 8 : 16;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.left = (6 + ((i * 53) % 88)) + "%";
    p.style.bottom = ((i * 37) % 60) + "%";
    p.style.setProperty("--d", (10 + (i % 6) * 1.7).toFixed(1) + "s");
    p.style.setProperty("--delay", (-(i * 0.9)).toFixed(1) + "s");
    p.style.setProperty("--dx", (((i % 5) - 2) * 10) + "px");
    host.appendChild(p);
  }
}

/* cursor / device parallax → tilt the heart (writes only .tilt's transform) */
function bindParallax(tilt, scene) {
  if (reduce) return;
  let raf = 0, tx = 0, ty = 0;
  const apply = () => {
    raf = 0;
    tilt.style.setProperty("--rx", tx.toFixed(2) + "deg");
    tilt.style.setProperty("--ry", ty.toFixed(2) + "deg");
  };
  scene.addEventListener("pointermove", (e) => {
    const r = scene.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 18;
    ty = -((e.clientY - r.top) / r.height - 0.5) * 14;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  scene.addEventListener("pointerleave", () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(apply);
  });
}

/* ── boot ──────────────────────────────────────────────────────────────── */
const world = document.getElementById("world");
const scene = document.querySelector(".scene");
const tilt = document.querySelector(".tilt");

buildHeart(world);
buildParticles(document.querySelector(".particles"));
bindParallax(tilt, scene);

// trigger the editor's line-by-line reveal after first paint
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("lit")));

// rebuild the heart to fit on resize (debounced)
let rz;
addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => buildHeart(world), 180);
});
