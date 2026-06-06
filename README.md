# Wisp

**A generative-art studio. Paint with flow fields; export the drift.**

Wisp advects thousands of particles through an invisible vector field built from
3D simplex noise. Each particle turns to face the local current and steps forward,
leaving a luminous trail that fades into the dark. Tune the turbulence, fold the
strands through symmetry, recolour by palette, and capture the result as a
high-resolution PNG. Every artwork is reproducible from a single seed string.

No build step. No dependencies. **Written in a single language — JavaScript.**
There are no `.css` files and no hand-authored HTML body: every element and every
style rule is constructed and injected from JS. `index.html` is a three-line shell
whose only job is to load the module (a browser needs *some* document to bootstrap).

---

## Run it

ES modules must be served over HTTP (opening `index.html` from `file://` is blocked
by the browser). Use any static server:

```bash
# Python (already on most machines)
python3 -m http.server 8000
# then open http://localhost:8000

# …or Node
npx serve .
```

There is nothing to install or compile.

## Features

- **Flow-field engine** — particles advected through seeded 3D simplex noise, with
  fading luminous trails rendered additively (`globalCompositeOperation = "lighter"`).
- **Reproducible** — a seed string drives both the noise field and particle
  placement, so the same seed always paints the same picture.
- **Cursor interaction** — drag across the canvas to add a local swirl to the field.
- **Symmetry** — none, mirror-X, mirror-Y, quad, or a six-axis kaleidoscope.
- **Six palettes** and **six presets** to start from.
- **High-resolution export** — re-renders the recipe off-screen at 1×/2×/4× for a
  crisp print, fully deterministic.
- **Dark / light theme**, keyboard shortcuts, reduced-motion support, and
  visibility-gated rendering so off-screen canvases don't burn CPU.

## Keyboard

| Key     | Action        |
| ------- | ------------- |
| `Space` | Play / pause  |
| `R`     | New seed      |
| `E`     | Export PNG    |
| `C`     | Clear canvas  |

## Project layout

```
wisp/
├── index.html            3-line bootstrap shell (loads the module)
├── js/
│   ├── h.js              Hyperscript helpers — build HTML/SVG nodes in JS
│   ├── styles.js         Entire stylesheet + <head> setup, injected from JS
│   ├── view.js           Builds the whole page DOM (topbar→hero→studio→…)
│   ├── prng.js           Seeded PRNG (mulberry32) + seed hashing
│   ├── noise.js          From-scratch 3D simplex noise
│   ├── palettes.js       Colour palettes + interpolation
│   ├── presets.js        Named parameter bundles
│   ├── field.js          The flow-field engine (core)
│   ├── stats.js          FPS meter
│   ├── controls.js       DOM ⇄ engine wiring
│   └── main.js           Bootstrap: inject styles, build view, run the loop
└── assets/
    └── favicon.svg
```

> **One language, by design.** A web page is ultimately rendered from HTML + CSS by
> the browser, so those *formats* are unavoidable — but here they are never authored
> as separate files. `styles.js` carries the stylesheet and injects it into a
> `<style>` tag; `view.js` constructs every element with the `h()` / `s()` helpers in
> `h.js`. The result is a project whose entire source — logic, structure, and
> styling — is JavaScript.

## Architecture

The engine layers cleanly: `prng` → `noise` → `field`, with `palettes`/`presets`
as data and `controls`/`main` as the UI shell. `field.js` knows nothing about the
DOM beyond its own canvas; `controls.js` translates user input into config patches;
`main.js` owns the animation loop and the two canvases (an ambient hero field and
the interactive studio field).

## License

MIT
