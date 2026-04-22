# wizarddynamics.com

Scroll-driven one-page landing site for Wizard Dynamics. Vanilla HTML/CSS/JS, deployed statically on Vercel.

## Structure

```
index.html          Markup
css/style.css       Styles (dark brutalist, golden-amber accent)
js/app.js           Lenis smooth scroll, canvas frame renderer, GSAP choreography
frames/             226 JPEG frames, scroll-bound via canvas
```

## Local dev

```
python3 -m http.server 8765
```

Open http://localhost:8765. Must be served over HTTP (not `file://`) so the frames load.

## Deployment

Auto-deploys from `main` via Vercel. No build step — served as static files.
