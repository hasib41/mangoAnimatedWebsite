import { defineConfig } from 'vite'
import { readdirSync, existsSync } from 'node:fs'

// Multi-page app. Each project is a self-contained folder with its own
// index.html + co-located .css/.js (e.g. moonart/index.html + moonart/moonart.js).
// "/" is the hub landing page (./index.html).
//
// New projects are auto-discovered: any top-level folder containing an index.html
// becomes a build entry — just drop in `myproject/index.html` and it ships.
const SKIP = new Set(['node_modules', 'dist', 'public', 'docs', 'assets', 'nero-video', '.git', '.claude'])

const input = { home: 'index.html' }
for (const name of readdirSync('.', { withFileTypes: true })) {
  if (name.isDirectory() && !name.name.startsWith('_') && !name.name.startsWith('.') && !SKIP.has(name.name) && existsSync(`${name.name}/index.html`)) {
    input[name.name] = `${name.name}/index.html`
  }
}

export default defineConfig({
  build: { rollupOptions: { input } },
})
