# wizarddynamics.com

App studio landing page for Wizard Dynamics. Vanilla HTML/CSS/JS, static on Vercel.

```
python3 -m http.server 8765   # → http://localhost:8765  (add ?ph to see placeholders)
```

## Go-live checklist (open `/?ph`, every pink box is one of these; hidden slots appear too)

| Placeholder (`data-ph`) | Where | What's needed |
|---|---|---|
| `vsl-video` | Hero | Record the VSL (6–9 min, founder on camera, real RevenueCat/ASC screens by minute 2). Export mp4 + captions (.vtt), host it yourself or on an EU CDN, set `CONFIG.vslSrc` / `vslCaptions` in `js/site.js`. Then it autoplays muted with captions and a "Click for sound" button. |
| `founder-photo` | Founders section, booking card | One real natural-light photo of Deyar + Manuel (16:9, hidden until it exists) and a square headshot of Deyar (replaces the logo in the form card) |
| `testimonial` | "What founders say" (`#reviews`) | The three quotes are **invented layout drafts** (founder's request) in `js/draft-reviews.js`, loaded only on localhost, Vercel branch previews (not main) or with `?drafts`; on wizarddynamics.com and production deployment URLs the section stays hidden and the names are not in the HTML. Replace with real quotes (full name, app, photo, one number) directly in `index.html`, remove `draft-only`, delete `js/draft-reviews.js` |
| `client-logos` | Under the testimonials (hidden) | 4–6 real client logos, or delete the row |
| `dashboard-screenshot` | Proof band (hidden) | Cropped, real RevenueCat or App Store Connect screenshot |
| `verify` | Hero trust row, hero chart card, proof band, case numbers | €500k+ ARR, 200+ apps, #1 keyword rank and $20k/month Meta are founder claims: keep the evidence. Rating 4.5 / 1,000+ = weighted average over 22 storefronts (3 Nov 2026). Grass €15k = May–Aug 2026 average (RevenueCat), Everlens €3.4k = best month (Sep 2026, one-time purchases, not MRR) |
| `offer` | Offer bar, offer section, FAQ, booking | Confirm the free MVP Blueprint / App Audit contents, the weekly cap (`CONFIG.spotsLeft` / `spotsTotal` in `js/site.js`, keep it true) and the reason given for the cap |
| `guarantee` | Offer section | Confirm you'll honour the launch-date guarantee (ideally with a number) |
| `faq-answer` | FAQ (equity) | Confirm whether rev-share deals are on the table |
| `legal` | `/datenschutz` | Full privacy policy (Vercel hosting, Web3Forms, video host, booking tool) |

The hero chart card shows Grass Identifier's real monthly revenue from RevenueCat (launch to August 2026). Refresh it with `python3 tools/update-charts.py` (key comes from `~/.claude/.env.secrets`), then check the card title and the Grass case number still match.

Also set `CONFIG.web3formsKey` (leads by email; without it the form only opens a pre-filled email) and optionally `CONFIG.bookingUrl` (Cal.com) in `js/site.js`.

## Design rules (why it looks the way it does)

Researched against 61 app-agency homepages and ~40 VSL/booked-call pages (Nov 2026), redesigned 3 Nov 2026 because v1 "looked cheap":

- Brand = the logo: near-black `#09080d`, white, electric blue `#1e54f0` (the D). Blue is only for actions and the D. No gold, no other accent colours.
- Logo is an inline SVG symbol (`#wd` in `index.html`), redrawn from the master PNG: W follows `currentColor`, D is always blue. Favicons/OG image are rendered from the same geometry (`favicon.svg`, `og-image.png`).
- Light page (white + cool grey `#f4f4f6`), with three near-black bands for rhythm: proof numbers, booking, footer. Schibsted Grotesk for everything, Literata only for the founders' letter.
- The wow comes from real assets, not effects: the hero's second tier is the intro video framed by real in-app screens of our apps in CSS phone frames (`.phone`), the VSL poster shows our real app icons as a home screen with a "Your app" slot, and the cases are big panels in each app's colour.
- Show product, not ads: in-app captures live in `img/apps/ui/` (sources: `APPS/noor_storys/screenshots/raw`, `Studios/video/projects/everlens-c014-app-demo/src/ui`, `APPS/01_Phone_Apps/wp-screenshots/raw`, `APPS/widget-noor`, `Studios/screenshots/apps/grass-identifier/creative-assets-2026-10/src/ui`). App Store marketing shots (`img/apps/*-shot*.jpg`) are only used for Rock Scanner, which has no clean capture yet.
- App Store links use Apple's official black badge (`img/appstore-badge.svg`, self-hosted).
- Never show screenshots with self-awarded laurels ("#1 app", "16K reviews", "Wizard Dynamics Award"): Ledgr shots, Prayer Lock shot 1, BridePlan shot 2, the lower part of Rock shot 1. The Rock case crops shot 1 above its badges on purpose.
- Empty proof slots (testimonials, client logos, client case, dashboard screenshot, founder photo) are `.ph-only`: hidden on the live page, visible with `?ph`. An empty box reads as "no proof"; a missing section doesn't.
- Our own App Store reviews are not usable as proof (some are from us and friends). Proof = our numbers and our apps.
- Trust next to the CTA must survive a buyer checking it in ten seconds: the App Store rating is the real weighted average (4.5, not a cherry-picked app), revenue comes from RevenueCat. No avatar stacks.
- No prices and no current revenue figures on the page (founder decision, 3 Nov 2026): the page sells the free blueprint call, prices come on the call.
- No scroll-reveal animations, no count-ups, no marquees, no glows, no pills/badges. Hover only.
