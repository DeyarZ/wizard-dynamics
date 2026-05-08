# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`wizarddynamics.com` — a single-page scroll-driven landing site. Vanilla HTML/CSS/JS, no framework, no build step, no package manager. Deployed statically on Vercel from `main`.

## Local development

```
python3 -m http.server 8765
```

Open http://localhost:8765. The site **must** be served over HTTP (not `file://`) — the canvas frame loader fetches `frames/frame_NNNN.jpg` over the network and CORS/file-protocol restrictions break it otherwise.

## Deployment

Auto-deploys on push to `main` via Vercel. `vercel.json` explicitly nulls out `framework`, `buildCommand`, `installCommand`, and `outputDirectory` to force a pure static deploy — Vercel will otherwise misdetect this as a Next.js project.

## Architecture

The site is a single 100vh hero followed by a tall `#scroll-container` that drives every animation via one shared ScrollTrigger progress value (0 → 1 over the container's height). Understanding this is essential — almost everything is wired off `self.progress` from a `trigger: scrollContainer` ScrollTrigger.

### Frame-bound canvas ([js/app.js](js/app.js))

- `FRAME_COUNT = 226` — must match the file count in `frames/`. If you add/remove frames, update this constant.
- Two-phase preloader: first `EAGER_COUNT` (12) frames load in parallel before first paint, then the rest load with `CONCURRENCY = 6` workers behind the loader.
- `FRAME_SPEED = 2.0` accelerates the canvas animation so it finishes by ~50% scroll, leaving the second half for content sections over a held final frame.
- The canvas uses padded-cover rendering: it samples corner pixels of the current frame to set `bgColor` and fills the canvas with that color before drawing, so any padding around the image blends with the frame's edges. `bgColor` is re-sampled every ~20 frames.

### Section choreography pattern

Each `.scroll-section` declares its lifecycle via data attributes on the element:

- `data-enter` / `data-leave` — integer percentages (0–100) of total scroll progress where the section is visible.
- `data-animation` — one of: `fade-up`, `slide-left`, `slide-right`, `scale-up`, `rotate-in`, `stagger-up`, `clip-reveal`. Defined in the `switch` in `setupSectionAnimation`.
- `data-persist="true"` — section stays visible after `leave` (used for the final CTA).

`setupSectionAnimation` absolute-positions each section at the **midpoint** of its enter/leave range (`top = mid * 100%`), then drives opacity from a single ScrollTrigger that watches the global progress. The section's children (`.section-label`, `.section-heading`, `.section-body`, `.section-note`, `.stats-label`, `.stat`, `.cta-button`, `.app-list li`) are animated by a paused GSAP timeline that plays once when `progress` enters the range.

If you add a new section, give it `data-enter` / `data-leave` / `data-animation` and ensure its inner elements match the selector list above so they get picked up by the timeline.

### Other scroll-driven layers

- Hero text fade — opacity ramps off with `1 - p * 15` so it disappears within the first ~6% of scroll.
- Dark overlay (`#dark-overlay`) — fades in for the stats section's range only (currently `0.64 → 0.76`).
- Marquee — `data-scroll-speed`, `data-enter`, `data-leave` on `.marquee-wrap`. `xPercent` is driven by ScrollTrigger scrub; opacity fades at the range edges.
- Stat counters — animate from 0 to `data-value` (with `data-decimals`) the first time the parent section's range is entered, and reset if the user scrolls back above it.

### Smooth scroll

Lenis drives smooth scrolling and is bridged to ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)` and `gsap.ticker.add((time) => lenis.raf(time * 1000))`. Don't use native `scroll` listeners or `window.scrollTo` directly — use Lenis APIs.

### Dependencies

All third-party libs (Lenis, GSAP, ScrollTrigger) are loaded from `cdn.jsdelivr.net` in [index.html](index.html). There is no `package.json` and no local `node_modules`.
