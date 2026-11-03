# CLAUDE.md

Guidance for Claude Code in this repo.

## Project

`wizarddynamics.com` — the Wizard Dynamics **app studio / app agency** landing page (rebuilt from scratch 2026-11-03; the old scroll-frame venture-studio site is gone). Single page, vanilla HTML/CSS/JS, no framework, no build step, no package manager. Static deploy on Vercel from `main`.

Positioning: "We build apps people pay for" — operators, not just devs. Proof = our own app portfolio (18 live apps, real App Store / RevenueCat numbers). Conversion goal = one action: **get the free app cost estimate** (`#book`), the lead magnet that captures name + email and leads into a founder call (live apps: the free Revenue Audit form).

## Local development

```
python3 -m http.server 8765
```

Open http://localhost:8765. Append `?ph` to highlight every placeholder that still needs real content.

## Files

```
index.html          The landing page (all sections + content live here)
css/site.css        Design system + all section styles (tokens at :root)
js/site.js          Interactions + CONFIG block (VSL source, Web3Forms key, booking url) + Revenue Audit form
js/estimate.js      The free app cost estimate: 6 questions → email → price range, build time, cost lines, cuts, payback. PRICES table at the top
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
- **No fake trust on the live site.** Client logos, client case studies and review scores stay placeholders (`data-ph`) until real ones exist. The testimonials are invented draft quotes the founder asked for as layout placeholders: they live in `js/draft-reviews.js`, which the inline `<head>` script loads only on localhost, Vercel branch previews (`-git-<branch>-`, never main) or with `?drafts`, so the names are never in the production HTML; on wizarddynamics.com the `#reviews` section (`.draft-only`) stays hidden. Real quotes go straight into `#reviews .quotes`; then remove `draft-only` and delete `js/draft-reviews.js`. Every number must survive a buyer checking it (App Store rating = real weighted average, revenue = RevenueCat/ASC).
- Numbers marked `data-ph="verify"` are real (ASC/RevenueCat, Nov 2026) but must be re-checked against `Studios/os/snapshot.md` before go-live and kept current.
- The offer (free app cost estimate / Revenue Audit, 5 founder calls a week via `CONFIG.spotsLeft`/`spotsTotal`, weekly reset), the `PRICES` table in `js/estimate.js`, the guarantee and the FAQ rev-share answer are proposals — human-owned. Keep `spotsLeft` true; change prices only in `PRICES` (and the FAQ "What does an app cost?" range if the extremes move).
- No third-party requests without a reason (fonts are self-hosted on purpose). If you add an embed (YouTube, Cal.com), update `datenschutz.html`.
- **Anti-slop is part of the positioning.** The founder rejected the first draft for looking Claude-made. Don't reintroduce: Inter/Geist/Instrument Serif or other default fonts, italic/coloured accent words in headlines, mono or all-caps eyebrow labels, numbered section labels, dark hero with glow, pill badges, pulsing dots, count-ups, marquees, scroll-reveal on every element, identical rounded cards with shadows, "Not X. Y." copy, em-dash-heavy copy, arrows appended to buttons. Design rules in `README.md`.

## Page structure (top → bottom)

Offer bar (dark: free app cost estimate / Revenue Audit, 5 founder calls a week, live countdown to Sunday 23:59) → nav → hero: one centred column (headline, one-line sub, CTA, trust row: App Store rating, 200+ apps built, $480k ARR), then a full-bleed band with the Grass monthly-revenue chart card ("Just one of our 200+ apps") in the middle of real in-app screens in phone frames, then the app shelf ("200+ apps built, 130+ launched") (on mobile: headline, sub, CTA, trust, chart card, swipe row of phones, shelf) → proof band (dark, four numbers) → three growth engines (Grass = ASO + paid, Everlens = organic TikTok, Noor = web checkout; each with a facts list) → testimonials (`.draft-only`) → services (sticky heading + rows) → process (4 steps) → offer (what's in the free App Cost Estimate and Revenue Audit, calls + CTA) + two promises + fit/not a fit → founders letter (Literata) → FAQ (sticky heading) → booking (dark: "What will your app cost?", the estimate card; "Live in the App Store" or any `data-stage="Live app"` link swaps it for the Revenue Audit form) → footer (dark). No price list and no current revenue figures on the page: prices appear only as the visitor's own estimate (behind the email) and as the FAQ range. Mobile only: sticky CTA bar ("Free, about 2 minutes" + "Get my estimate") after the hero CTA scrolls away, hidden at `#book`.

Brand = the logo: near-black `#09080d`, white, blue `#1e54f0` (only for actions and the logo's D). Sections are white or `.section-soft` (cool grey); `.night` bands for proof, booking and footer. Logo = inline SVG symbol `#wd` (never an image). Section header: `.section-head` (or `.section-head.split` with a `.lead` on the right) + `.h2`. No scroll animations. Empty proof slots carry `.ph-only` (hidden live, visible with `?ph`).

## Config (js/site.js → CONFIG)

- `vslSrc` (+ `vslCaptions`, `vslPoster`) — self-hosted `.mp4`: autoplays muted with captions, "Click for sound" restarts with sound. Preferred.
- `vslEmbed` — YouTube/Vimeo embed URL, click-to-play (needs a datenschutz update; rejected cookies = no plays).
- Both empty → the poster opens a "being recorded" modal that pushes to the form.
- `web3formsKey` — leads emailed via Web3Forms: every finished estimate (name, email, answers, range), every "Book my free project call" click and every Revenue Audit request. Empty → estimate leads are NOT captured (the visitor still sees the result), the call button and the audit form open a pre-filled `mailto:` to hello@wizarddynamics.com.
- `bookingUrl` — Cal.com/Calendly link: opens inline after "Book my free project call" in the estimate result and after the audit form. Empty → hidden.
- `spotsTotal` (5) / `spotsLeft` (null) — weekly founder calls. `null` shows "Only 5 founder calls a week" (true while the cap holds); a number shows "3 of 5 founder calls left" and must be kept current. The countdown always runs to Sunday 23:59 (visitor's time).
- The estimate (`js/estimate.js`): `PRICES` (EUR k, before VAT) = base + features, × platform, × design, × stage; payback = best guess ÷ (yearly price × 0.714 net after Apple 15% + VAT), downloads at 2% paying. Proposal from typical market ranges (about €8k to €100k+), set 3 Nov 2026.

## Deployment

Push to `main` = live on wizarddynamics.com. Other branches get Vercel preview URLs — use a branch for anything with unfilled placeholders.
