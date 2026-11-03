# wizarddynamics.com

App studio landing page for Wizard Dynamics. Vanilla HTML/CSS/JS, static on Vercel.

```
python3 -m http.server 8765   # → http://localhost:8765  (add ?ph to see placeholders)
```

## Go-live checklist (open `/?ph` — every pink box is one of these)

| Placeholder (`data-ph`) | Where | What's needed |
|---|---|---|
| `vsl-video` | Hero | Record the 3–5 min VSL, paste the embed URL into `CONFIG.vslUrl` in `js/site.js` |
| `client-logos` | Under hero | 5–8 real client / press logos (SVG, white) |
| `testimonial`, `video-testimonial` | Section 05 | Real founder quotes with name, role, company, photo + one hard number |
| `client-case` | Section 04 | At least one client case study (logo, challenge, 2–3 numbers) |
| `review-platform` | Section 05 | Clutch / Google rating + number of projects — or delete the items |
| `metric` | Everlens card | Real usage number (e.g. photos shared) — or delete the chip |
| `verify` | Hero, stats, case cards | Real numbers from ASC/RevenueCat (Nov 2026) — re-check against `Studios/os/snapshot.md` and decide what's public |
| `price` | Pricing, FAQ | Confirm the "from €25k / €45k / €4.5k per month" anchors |
| `offer`, `slots` | Banner, booking | Confirm the offer (deadline, slot count, audit value) — keep it true |
| `guarantee` | Hero micro-row, pricing | Confirm you'll honour the launch-date guarantee |
| `founder-photo` | Booking card, floating pill | Real headshot (replace the "DZ" initials) |
| `faq-answer` | FAQ (equity) | Confirm whether rev-share deals are on the table |
| `legal` | `/datenschutz` | Full privacy policy (Vercel hosting, Web3Forms, video/booking embeds) |

Also set `CONFIG.web3formsKey` (leads by email) and optionally `CONFIG.bookingUrl` (Cal.com) in `js/site.js`.
