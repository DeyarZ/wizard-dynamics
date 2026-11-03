# wizarddynamics.com

App studio landing page for Wizard Dynamics. Vanilla HTML/CSS/JS, static on Vercel.

```
python3 -m http.server 8765   # → http://localhost:8765  (add ?ph to see placeholders)
```

## Go-live checklist (open `/?ph`, every pink box is one of these)

| Placeholder (`data-ph`) | Where | What's needed |
|---|---|---|
| `vsl-video` | Hero | Record the VSL (6–9 min, founder on camera, real RevenueCat/ASC screens by minute 2). Export mp4 + captions (.vtt), host it yourself or on an EU CDN, set `CONFIG.vslSrc` / `vslCaptions` in `js/site.js`. Then it autoplays muted with captions and a "Click for sound" button. |
| `founder-photo` | Founders section, booking card | One real natural-light photo of Deyar + Manuel (4:5) and a headshot of Deyar (square) |
| `testimonial` | "What founders say" | Real quotes: name, role, company, photo, one hard number. Never invent them |
| `client-logos` | Under the testimonials | 4–6 real client logos, or delete the row |
| `client-case` | End of "Our apps" | First client case: logo, problem, 2–3 numbers, founder line |
| `dashboard-screenshot` | Proof section | Cropped, real RevenueCat or App Store Connect screenshot |
| `verify` | Hero, proof ledger, case numbers | Numbers are real (1 Nov 2026), re-check against `Studios/os/snapshot.md` and decide what may be public |
| `price` | Pricing, FAQ | Confirm the "from €25k / €45k / €4.5k per month" anchors |
| `offer`, `slots` | Top bar, booking | Confirm the offer (deadline, slot count, revenue audit). Must stay true: fake scarcity is an UWG risk |
| `guarantee` | Pricing | Confirm you'll honour the launch-date guarantee |
| `faq-answer` | FAQ (equity) | Confirm whether rev-share deals are on the table |
| `legal` | `/datenschutz` | Full privacy policy (Vercel hosting, Web3Forms, video host, booking tool) |

Also set `CONFIG.web3formsKey` (leads by email; without it the form only opens a pre-filled email) and optionally `CONFIG.bookingUrl` (Cal.com) in `js/site.js`.

## Design rules (why it looks the way it does)

Researched against 61 app-agency homepages and ~40 VSL/booked-call pages (Nov 2026):

- Light page, white (not cream). Schibsted Grotesk for everything, Literata only for the founders' voice (letter, quotes). No Inter/Geist/Instrument Serif, no mono labels, no italic accent words in headlines.
- Blue `#1f3bff` only for actions. Gold `#f2b33d` is the brand: logo, guarantee rule, booking block.
- Hero: copy left, VSL right; on mobile the video comes right after the headline. Video, CTA and the two trust lines fit a 13" laptop and a 390px phone without scrolling.
- Trust next to the CTA must be verifiable (App Store ratings, paying subscribers). No avatar stacks, no unsourced stars.
- No scroll-reveal animations, no count-ups, no marquees, no glows, no pills/badges. Rules and whitespace instead of cards.
