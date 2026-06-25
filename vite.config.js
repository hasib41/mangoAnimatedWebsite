import { defineConfig } from 'vite'
import { readdirSync, existsSync } from 'node:fs'

// Multi-page app. The hub lives at "/" (./index.html). Every site is a
// self-contained, numbered folder under projects/ (e.g.
// projects/01-mango/index.html + co-located .css/.js), served at
// /projects/<nn-name>/.
//
// Projects are auto-discovered: drop in projects/NN-name/index.html and it
// ships. Folders starting with "_" (e.g. projects/_template) are ignored.
const input = { home: 'index.html' }
const PROJECTS = 'projects'
if (existsSync(PROJECTS)) {
  for (const entry of readdirSync(PROJECTS, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.') && existsSync(`${PROJECTS}/${entry.name}/index.html`)) {
      input[entry.name] = `${PROJECTS}/${entry.name}/index.html`
    }
  }
}

export default defineConfig({
  build: { rollupOptions: { input } },
})
