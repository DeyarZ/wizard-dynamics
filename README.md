# wizarddynamics.com

App studio landing page for Wizard Dynamics. Vanilla HTML/CSS/JS, static on Vercel.

```
python3 -m http.server 8765   # → http://localhost:8765  (add ?ph to see placeholders)
```

## Go-live checklist (open `/?ph`, every pink box is one of these; hidden slots appear too)

| Placeholder (`data-ph`) | Where | What's needed |
|---|---|---|
| `founder-photo` | Founders section, booking card | One real natural-light photo of Deyar + Manuel (16:9, hidden until it exists) and a square headshot of Deyar (replaces the logo in the form card) |
| `testimonial` | "What founders say" (`#reviews`) | The three quotes are **invented layout drafts** (founder's request) in `js/draft-reviews.js`, loaded only on localhost, Vercel branch previews (not main) or with `?drafts`; on wizarddynamics.com and production deployment URLs the section stays hidden and the names are not in the HTML. Replace with real quotes (full name, app, photo, one number) directly in `index.html`, remove `draft-only`, delete `js/draft-reviews.js` |
| `client-logos` | Under the testimonials (hidden) | 4–6 real client logos, or delete the row |
| `dashboard-screenshot` | Proof band (hidden) | Cropped, real RevenueCat or App Store Connect screenshot |
| `verify` | Hero trust row, hero chart card, proof band, case numbers | Count every channel: App Store + Google Play + web (Stripe), not one store. $480k ARR = founder figure ($40k best month). Data check 3 Nov 2026: best month Aug 2026 = $38.1k before refunds (App Store $36.7k over all 65 apps from Apple sales reports at ECB rates, Google Play $0.7k, web $0.7k), $35.6k net of refunds; 12 x $38.1k = $457k, so "$450k+" is the fully backed version. Oct 2026 = $28.3k. 200+ apps built = team total incl. the co-founder's own apps (130+ launched, 170+ built in-house). Rating 4.5 / 1,000+ = weighted average over 22 storefronts (3 Nov 2026), checkable by anyone, so never round it up. Grass $20.2k = May 2026 in RevenueCat, $15k+ every month May to Aug. Everlens $4k = fourth month, App Store + Google Play, one-time purchases. Meta $65k+ = lifetime spend in Ads Manager |
| `offer` | Offer bar, offer section, FAQ, booking | Confirm the free App Cost Estimate / Revenue Audit contents, the weekly cap of 5 founder calls (`CONFIG.spotsLeft` / `spotsTotal` in `js/site.js`, keep it true) and the reason given for the cap |
| `pricing` | Estimate card, FAQ "What does an app cost?" | The `PRICES` table in `js/estimate.js` is a proposal from typical market ranges (€8k simple iPhone app to €100k+). Set your real ranges there; keep the FAQ range in line |
| `guarantee` | Offer section | Confirm you'll honour the launch-date guarantee (ideally with a number) |
| `faq-answer` | FAQ (equity) | Confirm whether rev-share deals are on the table |
| `legal` | `/datenschutz` | Written 3 Nov 2026 (Vercel hosting + Web Analytics, Resend, Cal.com booking, IONOS). Update it when the VSL host or another tool goes in |

The hero chart card shows Grass Identifier's real monthly revenue from RevenueCat (launch to August 2026). Refresh it with `python3 tools/update-charts.py` (key comes from `~/.claude/.env.secrets`), then check the card title and the Grass case number still match.

Leads run through `api/lead.js` + Resend (see CLAUDE.md → Config). `CONFIG.bookingUrl` (Cal.com) in `js/site.js` makes "Pick a time" on the thank-you screen open a calendar; it's set to the consulting site's 30-minute Discovery Call.

**Sending domain:** wizarddynamics.com is verified in Resend (3 Nov 2026) through these four records at IONOS (DNS). They power the visitor's email copy and the lead mails from leads@wizarddynamics.com; the IONOS mailbox records (MX/SPF/DKIM on `@`) are separate and untouched.

| Type | Host | Value |
|---|---|---|
| TXT | `resend._domainkey` | the DKIM key shown in Resend → Domains → wizarddynamics.com (starts with `p=MIGfMA0GCSqGSIb3DQEB`) |
| MX | `send` (priority 10) | `feedback-smtp.eu-west-1.amazonses.com` |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| CNAME | `rsend` | `send.forge.rmta.net` |

## Design rules (why it looks the way it does)

Researched against 61 app-agency homepages and ~40 VSL/booked-call pages (Nov 2026), redesigned 3 Nov 2026 because v1 "looked cheap":

- Brand = the logo: near-black `#09080d`, white, electric blue `#1e54f0` (the D). Blue is only for actions and the D. No other accent colours, except light gold `#f5e3a6` for the offer bar and only there (founder's call, 4 Nov 2026; the saturated gold `#f2b33d` of v1 stays out).
- Logo is an inline SVG symbol (`#wd` in `index.html`), redrawn from the master PNG: W follows `currentColor`, D is always blue. Favicons/OG image are rendered from the same geometry (`favicon.svg`, `og-image.png`).
- Light page (white + cool grey `#f4f4f6`), with three near-black bands for rhythm: proof numbers, booking, footer. Schibsted Grotesk for everything, Literata only for the founders' letter.
- The wow comes from real assets, not effects: the hero's second tier is the intro video framed by real in-app screens of our apps in CSS phone frames (`.phone`), the VSL poster shows our real app icons as a home screen with a "Your app" slot, and the cases are big panels in each app's colour.
- Show product, not ads: in-app captures live in `img/apps/ui/` (sources: `APPS/noor_storys/screenshots/raw`, `Studios/video/projects/everlens-c014-app-demo/src/ui`, `APPS/01_Phone_Apps/wp-screenshots/raw`, `APPS/widget-noor`, `Studios/screenshots/apps/grass-identifier/creative-assets-2026-10/src/ui`). App Store marketing shots (`img/apps/*-shot*.jpg`) are only used for Rock Scanner, which has no clean capture yet.
- App Store links use Apple's official black badge (`img/appstore-badge.svg`, self-hosted).
- Never show screenshots with self-awarded laurels ("#1 app", "16K reviews", "Wizard Dynamics Award"): Ledgr shots, Prayer Lock shot 1, BridePlan shot 2, the lower part of Rock shot 1. The Rock case crops shot 1 above its badges on purpose.
- Empty proof slots (testimonials, client logos, client case, dashboard screenshot, founder photo) are `.ph-only`: hidden on the live page, visible with `?ph`. An empty box reads as "no proof"; a missing section doesn't.
- Our own App Store reviews are not usable as proof (some are from us and friends). Proof = our numbers and our apps.
- Trust next to the CTA must survive a buyer checking it in ten seconds: the App Store rating is the real weighted average (4.5, not a cherry-picked app), revenue counts every store we sell in (RevenueCat, Play Console, Stripe). No avatar stacks.
- No price list and no current revenue figures on the page (founder decision, 3 Nov 2026). The lead magnet is the free app estimate (Hormozi: sell the outcome, not the vehicle), and the cost question is the line right under the hero headline ("We build apps that make money"). Flow since Nov 2026: quiz → contact details with phone and call consent → thank-you → a founder calls fast. A build of €20k+ closes on a call, so the price is no longer shown on the page: the founder gets the calculated range in the lead mail as the talk track, and the visitor gets the full estimate by email 3 hours later, so the promise holds even if we miss them. The payback point ("how many paying users to earn it back") stays in that mail for consumer apps. Prices appear only there, on the call and as the FAQ range.
- No scroll-reveal animations, no count-ups, no marquees, no glows, no pills/badges. Hover only.
