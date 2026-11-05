/* POST /api/event {ad, ev: [names], s: {place: seconds}, fbc?, url?} -> 204, sent by js/track.js with sendBeacon.
   Adds up what visitors do, per day and per ad (api/_store.js): only sums, no ids, no profiles.
   The first quiz answer and a Cal booking also go to Meta if the visitor came from a Meta ad (api/_meta.js).
   Always answers 204: measurement must never touch the page. The work runs before the answer, Vercel freezes the function after it. */
"use strict";
const crypto = require("crypto");
const meta = require("./_meta.js");
const store = require("./_store.js");

const ORIGINS = /^(https:\/\/((www\.)?wizarddynamics\.com|wizard-dynamics[a-z0-9-]*\.vercel\.app)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse/i;
const NAME = /^[a-z0-9_]{1,40}$/;
const PER_HOUR = 300;   // requests per IP: a long visit is about 40, this leaves room for an office behind one IP
const TO_META = { quiz_start: "InitiateCheckout", booked: "Schedule" };

function parse(req) {
  let b = req.body;
  if (typeof b === "string") b = JSON.parse(b);
  return b && typeof b === "object" ? b : null;
}

async function handle(req) {
  if (!ORIGINS.test(req.headers.origin || "")) return;
  if (BOT.test(req.headers["user-agent"] || "")) return;
  const b = parse(req);
  if (!b) return;

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const rl = "wd:rl:" + crypto.createHash("sha256").update(ip + ":" + Math.floor(Date.now() / 3600000)).digest("hex").slice(0, 16);
  const count = await store.pipeline([["INCR", rl], ["EXPIRE", rl, 3600]]);
  if (count && Number(count[0]) > PER_HOUR) return;

  const ad = String(b.ad || "direct").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, 80) || "direct";
  const events = (Array.isArray(b.ev) ? b.ev : []).filter((n) => typeof n === "string" && NAME.test(n)).slice(0, 40);
  const seconds = Object.keys(b.s && typeof b.s === "object" ? b.s : {}).filter((k) => NAME.test(k)).slice(0, 30);

  const today = store.day(), key = "wd:d:" + today + ":" + ad, ads = "wd:ads:" + today;
  const cmds = events.map((n) => ["HINCRBY", key, n, 1]);
  seconds.forEach((k) => {
    const n = Math.round(Number(b.s[k]));
    if (n > 0 && n <= 1800) cmds.push(["HINCRBY", key, "s_" + k, n]);
  });
  if (cmds.length) {
    cmds.push(["EXPIRE", key, store.TTL], ["SADD", ads, ad], ["EXPIRE", ads, store.TTL]);
    await store.pipeline(cmds);
  }

  const toMeta = events.filter((n) => TO_META[n]);
  if (toMeta.length && meta.validFbc(b.fbc)) {
    await Promise.all(toMeta.map((n) => meta.send(req, TO_META[n], { fbc: b.fbc, url: b.url })));
  }
}

module.exports = async function (req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  try {
    await handle(req);
  } catch (e) {
    console.error("event", e && e.message);
  }
  return res.status(204).end();
};
