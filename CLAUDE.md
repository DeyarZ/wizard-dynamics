# CLAUDE.md

Guidance for Claude Code in this repo.

## Project

`wizarddynamics.com` — the Wizard Dynamics **app studio / app agency** landing page (rebuilt from scratch 2026-11-03; the old scroll-frame venture-studio site is gone). Single page, vanilla HTML/CSS/JS, no framework, no build step, no package manager. Static deploy on Vercel from `main`.

Positioning: "We build apps that actually make money" — operators, not just devs. Proof = our own app portfolio (18 live apps, real App Store / RevenueCat numbers). Conversion goal = one action: **book a free strategy call** (`#book`).

## Local development

```
python3 -m http.server 8765
```

Open http://localhost:8765. Append `?ph` to highlight every placeholder that still needs real content.

## Files

```
index.html          The landing page (all sections + content live here)
css/site.css        Design system + all section styles (tokens at :root)
js/site.js          Interactions + CONFIG block (VSL url, Web3Forms key, booking url)
impressum.html      Legal (German) — keep
datenschutz.html    Legal (German) — PLACEHOLDER text, must be completed before go-live
fonts/              Self-hosted Geist, Geist Mono, Instrument Serif (no Google Fonts → GDPR)
img/wd-mark.svg     Logo mark as <symbol id="m">, uses currentColor
img/apps/           Icons + App Store screenshots of our own apps (+ apps.json with store URLs/ratings)
vercel.json         Static deploy config + redirects (see below)
```

## Hard rules

- **Never remove the `/go/grass` redirect in `vercel.json`** — it's the destination URL of live ChatGPT Ads (apex-domain requirement). Removing it breaks paid traffic.
- **No fake trust.** Testimonials, client logos, client case studies and review scores stay as clearly-marked placeholders (`data-ph`) until real ones exist. Never invent names, quotes or client results.
- Numbers marked `data-ph="verify"` are real (ASC/RevenueCat, Nov 2026) but must be re-checked against `Studios/os/snapshot.md` before go-live and kept current.
- Prices (`data-ph="price"`) and the offer/guarantee/slots are proposals — human-owned, confirm before go-live.
- No third-party requests without a reason (fonts are self-hosted on purpose). If you add an embed (YouTube, Cal.com), update `datenschutz.html`.

## Page structure (top → bottom)

Offer banner → nav → hero (headline, CTA + trust-next-to-CTA, VSL) → logo marquee → 01 proof stats → 02 comparison → 03 services → 04 work (own apps) + screenshot strip → 05 testimonials → 06 process → 07 pricing + guarantee → 08 FAQ → 09 booking form → footer. Floating founder pill (desktop) and sticky CTA bar (mobile) appear after the hero and hide at `#book`.

Sections alternate `.on-ink` (dark) and `.on-paper` (light). Section header pattern: `.section-head.split` → `.label` (mono, numbered) + `.h2` with a `.serif.gold-text` accent line + `.lead`. Reveal-on-scroll: add `.reveal` (optional `style="--d:.05s"` delay).

## Config (js/site.js → CONFIG)

- `vslUrl` — YouTube/Vimeo embed URL or `.mp4`. Empty → "coming soon" modal that pushes to the form.
- `web3formsKey` — leads emailed via Web3Forms. Empty → form opens a pre-filled `mailto:` to hello@wizarddynamics.com.
- `bookingUrl` — Cal.com/Calendly link shown after submit. Empty → hidden.

## Deployment

Push to `main` = live on wizarddynamics.com. Other branches get Vercel preview URLs — use a branch for anything with unfilled placeholders.
