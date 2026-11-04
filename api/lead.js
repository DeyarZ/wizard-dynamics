/* POST /api/lead: leads from /estimate (quiz + contact details) and the Revenue Audit form.

   Every lead is emailed to LEAD_TO (default hello@wizarddynamics.com) via Resend, with reply-to = the visitor,
   so answering the lead is one click. An estimate lead has the phone number in the subject and a tap-to-call button:
   the founder calls first, with the calculated range as the talk track. The visitor gets a short note right away
   and the full estimate ESTIMATE_DELAY_MIN later (Resend scheduled send), so the promise holds even if we miss them.
   Visitor mails need wizarddynamics.com verified in Resend (DNS records at IONOS, see README).

   The estimate is computed here from the answers (js/estimate.js runs on both sides), so the only free text that
   reaches an email is the name, the contact details, the message and the app link, all trimmed and escaped.

   Env: RESEND_API_KEY (required, Vercel project env), LEAD_TO (optional, comma-separated). */
"use strict";
const core = require("../js/estimate.js");

const VISITOR_FROM = "Deyar Zakir <hello@wizarddynamics.com>";
const BOOKING = "https://cal.com/wizard-dynamics-consulting/30min";   // same as CONFIG.bookingUrl in js/site.js
const ESTIMATE_DELAY_MIN = 180;   // the founder call comes first; after this the estimate mail goes out on its own
const LEAD_FROM = [
  "wizarddynamics.com <leads@wizarddynamics.com>",
  "wizarddynamics.com <leads@bynoor.app>"   // verified fallback until wizarddynamics.com is verified in Resend
];
const ORIGINS = /^(https:\/\/((www\.)?wizarddynamics\.com|wizard-dynamics[a-z0-9-]*\.vercel\.app)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;
const REVENUE = ["Pre-revenue", "Under $1k", "$1k to $10k", "Over $10k"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, n); }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

async function resend(msg) {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) console.error("resend", r.status, msg.from, j && j.message);
    return r.ok ? j.id : null;
  } catch (e) {
    console.error("resend", e && e.message);
    return null;
  }
}
async function toUs(msg) {
  const to = (process.env.LEAD_TO || "hello@wizarddynamics.com").split(",").map((s) => s.trim()).filter(Boolean);
  for (const from of LEAD_FROM) {
    const id = await resend({ ...msg, from, to });
    if (id) return id;
  }
  return null;
}
function toVisitor(email, msg) {
  return resend({ ...msg, from: VISITOR_FROM, to: [email], reply_to: "hello@wizarddynamics.com" });
}

function sourceText(src) {
  if (!src || typeof src !== "object") return "direct";
  const keys = ["from", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "gclid", "fbclid"];
  return keys.filter((k) => src[k]).map((k) => k + "=" + clip(src[k], 200)).join(", ") || "direct";
}

/* ---------- the estimate, as text (for us) and as the visitor's copy ---------- */
function estimateFacts(a) {
  const p = core.priced(a), r = core.calc(p);
  return {
    r,
    range: core.kr(r.low) + " to " + core.kr(r.high),
    weeks: "About " + r.wLow + " to " + r.wHigh + " weeks from kickoff to the App Store. Our best single guess: " + core.kr(r.mid) + ". This assumes iPhone and Android with a clean, proven design.",
    lines: core.moneyLines(p).map((l) => [l[0], core.kl(l[1])]),
    cuts: core.bestCuts(p),
    pb: core.paybackNums(r.mid, core.PRICES.defaultPrice)
  };
}
function munichTime(d) { return d.toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }); }
function estimateLead(name, email, phone, message, a, source, sendAt) {
  const f = estimateFacts(a);
  const text = "Call: " + phone + "\nName: " + name + "\nEmail: " + email + "\n\n" +
    "Stopped so far by: " + core.labelOf("blocker", a.blocker) + "\n" +
    core.answerLines(a).map((l) => l[0] + ": " + l[1]).join("\n") +
    (message ? "\nMessage: " + message : "") +
    "\n\nCalculated estimate: " + f.range + " (best guess " + core.kr(f.r.mid) + "), " + f.r.wLow + " to " + f.r.wHigh + " weeks. Assumes iPhone + Android, clean design.\n" +
    f.lines.map((l) => "- " + l[0] + ": " + l[1]).join("\n") +
    "\n\nCall first: this estimate mail goes to them on its own at " + munichTime(sendAt) + " (Munich).\n" +
    "Call consent: ticked on /estimate, " + new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC\nSource: " + source;
  const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#0a0a0f">' +
    '<p style="margin:0 0 18px"><a href="tel:' + esc(phone.replace(/[^\d+]/g, "")) + '" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#1e54f0;color:#ffffff;font-size:17px;font-weight:600;text-decoration:none">Call ' + esc(phone) + "</a></p>" +
    esc(text).replace(/\n/g, "<br>") + "</div>";
  return {
    subject: "Call " + name + " " + phone + ": " + f.range + ", budget " + core.labelOf("budget", a.budget) + ", launch " + core.labelOf("launch", a.launch).toLowerCase(),
    text, html
  };
}
function visitorEstimate(name, a) {
  const f = estimateFacts(a);
  const first = esc(name.split(/\s+/)[0]);
  const price = core.PRICES.defaultPrice;
  const showPayback = a.kind === "consumer" || a.kind === "unsure";   // paying subscribers only fit an app people pay for
  const payback = "At €" + price + " a year, it takes about " + core.num(f.pb.subs) + " paying subscribers to earn the build back in year one. " +
    "With a typical " + f.pb.paidPct + "% of downloads paying, that's about " + core.num(f.pb.downloads) + " downloads.";
  const reveal = "Building the app is the predictable part. Getting those downloads is where most apps stall, and it's the part we've done with our own: Grass Identifier went from $458 to $20.2k a month in 10 months.";
  const call = "Want to go through it with a founder? Pick a time for a free 30-minute call, or reply to this email with two times that work for you. We check your scope and cut what version one doesn't need. If you want us to build it, you get a fixed price.";
  const cutsTotal = f.cuts.list.length ? (f.cuts.list.length > 1 ? "All together: " : "With that: ") + core.kr(f.cuts.after.low) + " to " + core.kr(f.cuts.after.high) + "." : "";

  const text = "Hi " + name.split(/\s+/)[0] + ",\n\nhere's the estimate for your app, based on your answers on wizarddynamics.com. If we've already talked, this is the written version.\n\n" +
    "YOUR ESTIMATE: " + f.range + "\n" + f.weeks + "\n\n" +
    "Your answers\n" + core.answerLines(a).map((l) => "- " + l[0] + ": " + l[1]).join("\n") + "\n\n" +
    "Where the money goes\n" + f.lines.map((l) => "- " + l[0] + ": " + l[1]).join("\n") + "\n\n" +
    "How to launch for less\n" + (f.cuts.list.length
      ? f.cuts.list.map((x) => "- " + x.title + " " + x.text + " Saves about " + core.kl(x.saves) + ".").join("\n") + "\n" + cutsTotal
      : "Your version one is already lean. Keep it that way until paying users ask for more.") + "\n\n" +
    (showPayback ? "When does it pay for itself?\n" + payback + "\n\n" + reveal + "\n\n" : "") + call + "\nPick a time: " + BOOKING + "\n\n" +
    "Deyar Zakir\nCo-founder, Wizard Dynamics\nhttps://www.wizarddynamics.com";

  const P = 'style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#0a0a0f"';
  const H = 'style="margin:28px 0 8px;padding-top:18px;border-top:1px solid #e4e4ea;font-size:17px;line-height:1.3;color:#0a0a0f"';
  const row = (l, v) => '<tr><td style="padding:5px 16px 5px 0;font-size:15px;color:#464651">' + esc(l) + '</td><td style="padding:5px 0;font-size:15px;font-weight:600;color:#0a0a0f;text-align:right;white-space:nowrap">' + esc(v) + "</td></tr>";
  const html = '<div style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#0a0a0f">' +
    '<div style="max-width:560px;margin:0 auto">' +
    "<p " + P + ">Hi " + first + ",</p><p " + P + ">here's the estimate for your app, based on your answers on wizarddynamics.com. If we've already talked, this is the written version.</p>" +
    '<p style="margin:24px 0 2px;font-size:14px;font-weight:600;color:#6b6b77">Your estimate</p>' +
    '<p style="margin:0;font-size:34px;line-height:1.1;font-weight:700;letter-spacing:-0.5px;color:#0a0a0f">' + esc(f.range) + "</p>" +
    '<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#464651">' + esc(f.weeks) + "</p>" +
    "<h3 " + H + ">Your answers</h3><table role=\"presentation\" style=\"border-collapse:collapse;width:100%\">" + core.answerLines(a).map((l) => row(l[0], l[1])).join("") + "</table>" +
    "<h3 " + H + ">Where the money goes</h3><table role=\"presentation\" style=\"border-collapse:collapse;width:100%\">" + f.lines.map((l) => row(l[0], l[1])).join("") + "</table>" +
    "<h3 " + H + ">How to launch for less</h3>" +
    (f.cuts.list.length
      ? f.cuts.list.map((x) => '<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#464651"><b style="color:#0a0a0f">' + esc(x.title) + "</b> " + esc(x.text) + '<br><b style="color:#0a0a0f">Saves about ' + esc(core.kl(x.saves)) + "</b></p>").join("") +
        '<p style="margin:0;font-size:15px;font-weight:600;color:#0a0a0f">' + esc(cutsTotal) + "</p>"
      : '<p style="margin:0;font-size:15px;line-height:1.5;color:#464651">Your version one is already lean. Keep it that way until paying users ask for more.</p>') +
    (showPayback ? "<h3 " + H + ">When does it pay for itself?</h3><p " + P + ">" + esc(payback) + "</p><p " + P + ">" + esc(reveal) + "</p>" : "") +
    '<p style="margin:28px 0 14px;padding-top:18px;border-top:1px solid #e4e4ea;font-size:16px;line-height:1.55;color:#0a0a0f">' + esc(call) + "</p>" +
    '<p style="margin:0 0 14px"><a href="' + BOOKING + '" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#1e54f0;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none">Pick a time for the call</a></p>' +
    '<p style="margin:24px 0 0;font-size:15px;line-height:1.5;color:#0a0a0f">Deyar Zakir<br><span style="color:#6b6b77">Co-founder, Wizard Dynamics</span><br><a href="https://www.wizarddynamics.com" style="color:#1e54f0">wizarddynamics.com</a></p>' +
    "</div></div>";
  return { subject: "Your app estimate: " + f.range, text, html };
}
function visitorNote(name, subject, body) {
  const text = "Hi " + name.split(/\s+/)[0] + ",\n\n" + body + "\n\nDeyar Zakir\nCo-founder, Wizard Dynamics\nhttps://www.wizarddynamics.com";
  const html = '<div style="padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#0a0a0f;font-size:16px;line-height:1.55"><div style="max-width:560px;margin:0 auto">' +
    esc(text).replace(/\n/g, "<br>") + "</div></div>";
  return { subject, text, html };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false }); }
  if (!ORIGINS.test(req.headers.origin || "")) return res.status(403).json({ ok: false });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ ok: false, error: "not configured" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== "object") return res.status(400).json({ ok: false });
  if (b.botcheck) return res.status(200).json({ ok: true });

  const email = clip(b.email, 160), source = sourceText(b.source);
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, error: "email" });

  let lead, sends;
  if (b.type === "estimate") {
    const first = clip(b.first, 40), last = clip(b.last, 40), phone = clip(b.phone, 30), message = clip(b.message, 1000);
    if (!first || !last) return res.status(400).json({ ok: false, error: "name" });
    if (!core.isPhone(phone)) return res.status(400).json({ ok: false, error: "phone" });
    if (b.consent !== true) return res.status(400).json({ ok: false, error: "consent" });
    const a = core.cleanAnswers(b.answers);
    if (!a) return res.status(400).json({ ok: false, error: "answers" });
    const name = first + " " + last, sendAt = new Date(Date.now() + ESTIMATE_DELAY_MIN * 60000);
    lead = estimateLead(name, email, phone, message, a, source, sendAt);
    sends = [
      visitorNote(name, "We're preparing your app estimate",
        "thanks for your answers. We're preparing your estimate and will call you shortly on " + phone + ", or first thing in the morning if it's night here in Munich. You'll also get the estimate by email within a few hours.\n\nBusy? Pick a time: " + BOOKING + "\nOr just reply to this email."),
      { ...visitorEstimate(name, a), scheduled_at: sendAt.toISOString() }
    ];
  } else if (b.type === "audit") {
    const name = clip(b.name, 80), revenue = REVENUE.indexOf(b.revenue) > -1 ? b.revenue : "-", app = clip(b.app, 300);
    if (!name) return res.status(400).json({ ok: false, error: "name" });
    if (!app) return res.status(400).json({ ok: false, error: "app" });
    lead = {
      subject: "New Revenue Audit request: " + name + " (" + revenue + " a month)",
      text: "Name: " + name + "\nEmail: " + email + "\nStage: Live app (Revenue Audit)\nMonthly revenue: " + revenue + "\nApp: " + app + "\nSource: " + source
    };
    sends = [visitorNote(name, "Your Revenue Audit request",
      "thanks, your request for the free Revenue Audit is in. We'll look at your app (" + app + ") before the call. If you picked a slot, the calendar invite is on its way. If not, pick a time here: " + BOOKING + " or reply with two times that work for you.")];
  } else {
    return res.status(400).json({ ok: false, error: "type" });
  }

  const [leadId] = await Promise.all([toUs({ ...lead, reply_to: email }), ...sends.map((m) => toVisitor(email, m))]);
  if (!leadId) return res.status(502).json({ ok: false });
  return res.status(200).json({ ok: true });
};
