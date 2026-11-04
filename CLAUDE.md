# CLAUDE.md

Guidance for Claude Code in this repo.

## Project

`wizarddynamics.com` — the Wizard Dynamics **app studio / app agency** landing page (rebuilt from scratch 2026-11-03; the old scroll-frame venture-studio site is gone). Single page, vanilla HTML/CSS/JS, no framework, no build step, no package manager. Static deploy on Vercel from `main`.

Positioning: "We build apps people pay for" — operators, not just devs. Proof = our own app portfolio (18 live apps, real App Store / RevenueCat numbers). Conversion goal = one action: **get the free app estimate** on its own page `/estimate`: quiz, contact details with phone and call consent, then a founder calls fast (live apps: the free Revenue Audit form at `/estimate/audit`). The hero H1 is the offer ("What will your app really cost?"); "We build apps people pay for" is the proof band's headline. Every CTA on the landing page links there.

## Local development

```
python3 -m http.server 8765      # static pages only
vercel dev --listen 3100         # + /api/lead and the /estimate/<step> rewrites (pulls the dev env from Vercel)
```

Open http://localhost:8765. Append `?ph` to highlight every placeholder that still needs real content. With plain `http.server`, the estimate works but POSTs to /api/lead fail (no function) and a reload on `/estimate/<step>` 404s; use `vercel dev` to test leads (it sends real mails, label test leads "TEST").

## Files

```
index.html          The landing page (all sections + content live here)
css/site.css        Design system + all section styles (tokens at :root)
estimate.html       /estimate: the free cost estimate on its own focused page (+ the Revenue Audit form for live apps). Absolute asset paths (also served at /estimate/<step>)
js/site.js          Interactions + CONFIG block (VSL source, booking url, founder calls) + adds from=<button>/utm/ref to every /estimate link
js/estimate.js      The estimate: 6 questions → contact details + call consent → thank-you (call promise, "Pick a time"). No price on the page. One URL per step (funnel in analytics, back button works); sends leads to /api/lead. PRICES table at the top. The math half is also require()d by api/lead.js
api/lead.js         Vercel function: validates + computes the estimate, emails the lead to LEAD_TO via Resend (phone in the subject, tap-to-call button, reply-to = visitor), emails the visitor a note now and the full estimate 3 hours later (ESTIMATE_DELAY_MIN, Resend scheduled send) from hello@wizarddynamics.com
impressum.html      Legal (German) — keep
datenschutz.html    Legal (German): Vercel hosting + Web Analytics, Resend, Cal.com booking, IONOS mail. Update it when you add an embed, a booking tool or any tracker
fonts/              Self-hosted Schibsted Grotesk (+ italic) and Literata, OFL (no Google Fonts → GDPR)
favicon.svg, favicon.ico, icon-192.png, apple-touch-icon.png, og-image.png   Rendered from the logo geometry
img/apps/           Icons + App Store screenshots of our own apps (+ apps.json with store URLs/ratings)
vercel.json         Static deploy config, redirects (/go/grass!, /contact → /estimate) and the /estimate/:view rewrite
tools/update-charts.py   Refreshes the Grass monthly-revenue chart (hero card) from RevenueCat
```

## Hard rules

- **Never remove the `/go/grass` redirect in `vercel.json`** — it's the destination URL of live ChatGPT Ads (apex-domain requirement). Removing it breaks paid traffic.
- **No fake trust on the live site.** Client logos, client case studies and review scores stay placeholders (`data-ph`) until real ones exist. The testimonials are invented draft quotes the founder asked for as layout placeholders: they live in `js/draft-reviews.js`, which the inline `<head>` script loads only on localhost, Vercel branch previews (`-git-<branch>-`, never main) or with `?drafts`, so the names are never in the production HTML; on wizarddynamics.com the `#reviews` section (`.draft-only`) stays hidden. Real quotes go straight into `#reviews .quotes`; then remove `draft-only` and delete `js/draft-reviews.js`. Every number must survive a buyer checking it (App Store rating = real weighted average, revenue = RevenueCat/ASC).
- Numbers marked `data-ph="verify"` are real (ASC/RevenueCat, Nov 2026) but must be re-checked against `Studios/os/snapshot.md` before go-live and kept current.
- The offer (free app estimate / Revenue Audit, 5 founder calls a week via `CONFIG.spotsLeft`/`spotsTotal`, weekly reset), the `PRICES` table in `js/estimate.js`, the guarantee and the FAQ rev-share answer are proposals — human-owned. Keep `spotsLeft` true; change prices only in `PRICES` (and the FAQ "What does an app cost?" range if the extremes move).
- No third-party requests without a reason (fonts are self-hosted on purpose). If you add an embed (YouTube, Cal.com), update `datenschutz.html`.
- **Anti-slop is part of the positioning.** The founder rejected the first draft for looking Claude-made. Don't reintroduce: Inter/Geist/Instrument Serif or other default fonts, italic/coloured accent words in headlines, mono or all-caps eyebrow labels, numbered section labels, dark hero with glow, pill badges, pulsing dots, count-ups, marquees, scroll-reveal on every element, identical rounded cards with shadows, "Not X. Y." copy, em-dash-heavy copy, arrows appended to buttons. Design rules in `README.md`.

## Page structure (top → bottom)

Offer bar (dark: free app cost estimate / Revenue Audit, 5 founder calls a week, live countdown to Sunday 23:59) → nav → hero: one centred column (headline = the offer, sub, CTA, "Free · 2 minutes · no commitment", trust row: App Store rating, 200+ apps built, $480k ARR), then a full-bleed band with the Grass monthly-revenue chart card ("Just one of our 200+ apps") in the middle of real in-app screens in phone frames, then the app shelf ("200+ apps built, 130+ launched") (on mobile: headline, sub, CTA, trust, chart card, swipe row of phones, shelf) → proof band (dark, four numbers) → three growth engines (Grass = ASO + paid, Everlens = organic TikTok, Noor = web checkout; each with a facts list) → testimonials (`.draft-only`) → services (sticky heading + rows) → process (4 steps) → offer (what's in the free App Cost Estimate and Revenue Audit, calls + CTA) + two promises + fit/not a fit → founders letter (Literata) → FAQ (sticky heading) → closing CTA `#book` (dark: "What will your app really cost?", button to /estimate, "Already live?" link to /estimate/audit, what you get, founder) → footer (dark). The estimate itself is a separate focused page, `/estimate` (white, logo + "Free, about 2 minutes", one question per screen, founder line, legal links). No price list and no current revenue figures on the page: prices appear only in the founder call, in the estimate email and as the FAQ range. Mobile only: sticky CTA bar ("Free, about 2 minutes" + "Get my estimate") after the hero CTA scrolls away, hidden at `#book`.

Brand = the logo: near-black `#09080d`, white, blue `#1e54f0` (only for actions and the logo's D). Sections are white or `.section-soft` (cool grey); `.night` bands for proof, booking and footer. Logo = inline SVG symbol `#wd` (never an image). Section header: `.section-head` (or `.section-head.split` with a `.lead` on the right) + `.h2`. No scroll animations. Empty proof slots carry `.ph-only` (hidden live, visible with `?ph`).

## Config (js/site.js → CONFIG)

- `vslSrc` (+ `vslCaptions`, `vslPoster`) — self-hosted `.mp4`: autoplays muted with captions, "Click for sound" restarts with sound. Preferred.
- `vslEmbed` — YouTube/Vimeo embed URL, click-to-play (needs a datenschutz update; rejected cookies = no plays).
- Both empty → the poster opens a "being recorded" modal that pushes to the form.
- Leads: no key in the page. `api/lead.js` sends every finished estimate and every Revenue Audit request via Resend to `LEAD_TO` (Vercel env, now hello@wizarddynamics.com + deyarzakir@gmail.com). Estimate lead: subject = "Call" + name + phone + range + budget + launch, so it can be dialled from the lock screen; body = tap-to-call button, what stopped them, answers, message, calculated range + lines (the talk track), consent timestamp, source (from=<button>, utm, referrer). Phone + ticked consent are required, in the page and on the server (consent = § 7 UWG, keep the lead mail as the record). Vercel env `RESEND_API_KEY` = the site's own sending key (also `RESEND_API_KEY_WD` in `~/.claude/.env.secrets`). Sender `leads@wizarddynamics.com` (fallback `leads@bynoor.app`). The visitor's copy / confirmation goes out from hello@wizarddynamics.com. wizarddynamics.com is verified in Resend since 3 Nov 2026 (4 records at IONOS: `resend._domainkey`, `send` MX + TXT, `rsend`; see README). Don't delete them; if the domain ever drops out of verification the visitor mails fail and are skipped. The thank-you screen only appears after the lead is sent; if the POST fails, the contact form and the audit form offer a pre-filled `mailto:`.
- Tracking: Vercel Web Analytics (cookieless, Hobby = page views only, no custom events). Each estimate step is its own path, so the Pages list is the funnel: `/estimate` → `/estimate/stage` → `blocker` → `features` → `timeline` → `budget` → `contact` → `thanks` → `pick-time` → `booked` (Cal.com booking made); live apps `audit` → `audit-sent` → `audit-booked`. Not loaded on localhost. No Meta pixel (would need a cookie banner). Enabled on `wizard-dynamics` 3 Nov 2026 via the internal API (no public endpoint): `POST https://api.vercel.com/v1/web/insights/toggle?projectId=…&teamId=…` with `{"value":true}`, check with `GET …/v1/web/insights/enabled` (CLI token works); takes effect on the next deploy.
- `bookingUrl` — Cal.com link: opens inline via Cal's embed.js (`WD.openBooking` in site.js: auto height, event header hidden, brand blue, name + email + notes prefilled, `bookingSuccessfulV2` → the booked funnel step) after "Pick a time" on the thank-you screen and after the audit form; loaded only on that click. Empty → hidden. Set to `https://cal.com/wizard-dynamics-consulting/30min`, the consulting site's "Discovery Call" (30 min, Cal Video; same Cal.com account). `BOOKING` in api/lead.js must match (the visitor mails link to it).
- `spotsTotal` (5) / `spotsLeft` (null) — weekly founder calls. `null` shows "Only 5 founder calls a week" (true while the cap holds); a number shows "3 of 5 founder calls left" and must be kept current. The countdown always runs to Sunday 23:59 (visitor's time).
- The estimate (`js/estimate.js`): `PRICES` (EUR k, before VAT) = base + features, × platform, × design, × stage. The quiz doesn't ask platform or design, so `priced()` assumes iPhone + Android + clean (the founder confirms on the call); Bookings = integrations price, Chat = social price, marketplace adds admin. Payback (consumer/unsure only, in the mail) = best guess ÷ (yearly price × 0.714 net after Apple 15% + VAT), downloads at 2% paying. Proposal from typical market ranges (about €8k to €100k+), set 3 Nov 2026.

## Deployment

Push to `main` = live on wizarddynamics.com. Other branches get Vercel preview URLs — use a branch for anything with unfilled placeholders.

Two Vercel projects build this repo: **`wizard-dynamics`** (prj_EWKJFUObOKDOWEwjWdzrOOgK5S10) owns wizarddynamics.com + www and is production; `wizard-dynamics-site` (prj_27gy…, what the local `.vercel/` links to and `vercel dev` uses) only makes duplicate previews. Env vars (`RESEND_API_KEY`, `LEAD_TO`) must be set on `wizard-dynamics`, and Web Analytics enabled there. After a deploy, verify on www.wizarddynamics.com, not on the -site preview.
