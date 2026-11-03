# CLAUDE.md

Guidance for Claude Code in this repo.

## Project

`wizarddynamics.com` — the Wizard Dynamics **app studio / app agency** landing page (rebuilt from scratch 2026-11-03; the old scroll-frame venture-studio site is gone). Single page, vanilla HTML/CSS/JS, no framework, no build step, no package manager. Static deploy on Vercel from `main`.

Positioning: "We build apps people pay for" — operators, not just devs. Proof = our own app portfolio (18 live apps, real App Store / RevenueCat numbers). Conversion goal = one action: **book a free strategy call** (`#book`).

## Local development

```
python3 -m http.server 8765
```

Open http://localhost:8765. Append `?ph` to highlight every placeholder that still needs real content.

## Files

```
index.html          The landing page (all sections + content live here)
css/site.css        Design system + all section styles (tokens at :root)
js/site.js          Interactions + CONFIG block (VSL source, Web3Forms key, booking url)
impressum.html      Legal (German) — keep
datenschutz.html    Legal (German) — PLACEHOLDER text, must be completed before go-live
fonts/              Self-hosted Schibsted Grotesk (+ italic) and Literata, OFL (no Google Fonts → GDPR)
favicon.svg, favicon.ico, icon-192.png, apple-touch-icon.png, og-image.png   Rendered from the logo geometry
img/apps/           Icons + App Store screenshots of our own apps (+ apps.json with store URLs/ratings)
vercel.json         Static deploy config + redirects (see below)
tools/update-charts.py   Refreshes the Grass monthly-revenue chart (hero card) from RevenueCat
```

## Hard rules

- **Never remove the `/go/grass` redirect in `vercel.json`** — it's the destination URL of live ChatGPT Ads (apex-domain requirement). Removing it breaks paid traffic.
- **No fake trust on the live site.** Client logos, client case studies and review scores stay placeholders (`data-ph`) until real ones exist. The testimonials section holds invented draft quotes the founder asked for as layout placeholders: it carries `.draft-only`, which an inline script + CSS hide on wizarddynamics.com. Replace each quote with a real one, then remove its `data-ph` and the section's `draft-only`. Every number must survive a buyer checking it (App Store rating = real weighted average, revenue = RevenueCat).
- Numbers marked `data-ph="verify"` are real (ASC/RevenueCat, Nov 2026) but must be re-checked against `Studios/os/snapshot.md` before go-live and kept current.
- The offer (free MVP Blueprint / App Audit, `CONFIG.spotsLeft`/`spotsTotal`, weekly reset), the guarantee and the FAQ rev-share answer are proposals — human-owned. Keep `spotsLeft` true.
- No third-party requests without a reason (fonts are self-hosted on purpose). If you add an embed (YouTube, Cal.com), update `datenschutz.html`.
- **Anti-slop is part of the positioning.** The founder rejected the first draft for looking Claude-made. Don't reintroduce: Inter/Geist/Instrument Serif or other default fonts, italic/coloured accent words in headlines, mono or all-caps eyebrow labels, numbered section labels, dark hero with glow, pill badges, pulsing dots, count-ups, marquees, scroll-reveal on every element, identical rounded cards with shadows, "Not X. Y." copy, em-dash-heavy copy, arrows appended to buttons. Design rules in `README.md`.

## Page structure (top → bottom)

Offer bar (dark: free MVP Blueprint / App Audit, weekly spots, live countdown to Sunday 23:59) → nav → hero: one centred column (headline, one-line sub, CTA, trust row: App Store rating + ARR), then a full-bleed band with the Grass monthly-revenue chart card in the middle of real in-app screens in phone frames, then the app shelf ("200+ apps built and scaled") (on mobile: headline, sub, CTA, trust, chart card, swipe row of phones, shelf) → proof band (dark, four numbers) → three growth engines (Grass = ASO + paid, Everlens = organic TikTok, Noor = web checkout; each with a facts list) → testimonials (`.draft-only`) → services (sticky heading + rows) → process (4 steps) → offer (what's in the free MVP Blueprint and App Audit, spots + CTA) + two promises + fit/not a fit → founders letter (Literata) → FAQ (sticky heading) → booking (dark, form) → footer (dark). No prices and no current revenue figures on the page: the goal is the call. Mobile only: sticky CTA bar with the spots count after the hero CTA scrolls away, hidden at `#book`.

Brand = the logo: near-black `#09080d`, white, blue `#1e54f0` (only for actions and the logo's D). Sections are white or `.section-soft` (cool grey); `.night` bands for proof, booking and footer. Logo = inline SVG symbol `#wd` (never an image). Section header: `.section-head` (or `.section-head.split` with a `.lead` on the right) + `.h2`. No scroll animations. Empty proof slots carry `.ph-only` (hidden live, visible with `?ph`).

## Config (js/site.js → CONFIG)

- `vslSrc` (+ `vslCaptions`, `vslPoster`) — self-hosted `.mp4`: autoplays muted with captions, "Click for sound" restarts with sound. Preferred.
- `vslEmbed` — YouTube/Vimeo embed URL, click-to-play (needs a datenschutz update; rejected cookies = no plays).
- Both empty → the poster opens a "being recorded" modal that pushes to the form.
- `web3formsKey` — leads emailed via Web3Forms. Empty → form opens a pre-filled `mailto:` to hello@wizarddynamics.com.
- `bookingUrl` — Cal.com/Calendly link shown after submit. Empty → hidden.
- `spotsLeft` / `spotsTotal` — free blueprint spots this week, shown in the offer bar, offer, booking and mobile bar. The countdown always runs to Sunday 23:59 (visitor's time).

## Deployment

Push to `main` = live on wizarddynamics.com. Other branches get Vercel preview URLs — use a branch for anything with unfilled placeholders.
