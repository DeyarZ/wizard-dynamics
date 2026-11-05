/* GET /api/stats?days=7 with "Authorization: Bearer <WD_STATS_KEY>": the counters from api/event.js added up, per ad and
   in total. Read it with tools/funnel.py. Key = WD_STATS_KEY in the Vercel env and in ~/.claude/.env.secrets. */
"use strict";
const crypto = require("crypto");
const store = require("./_store.js");

function allowed(given) {
  const key = process.env.WD_STATS_KEY;
  if (!key || !given) return false;
  const a = crypto.createHash("sha256").update(key).digest(), b = crypto.createHash("sha256").update(String(given)).digest();
  return crypto.timingSafeEqual(a, b);
}
function add(into, field, n) { into[field] = (into[field] || 0) + n; }

module.exports = async function (req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!allowed((req.headers.authorization || "").replace(/^Bearer\s+/i, ""))) return res.status(401).json({ ok: false });

  const n = Math.min(Math.max(parseInt(req.query && req.query.days, 10) || 7, 1), 180);
  const days = [];
  for (let i = 0; i < n; i++) days.push(store.day(new Date(Date.now() - i * 86400000)));

  const members = await store.pipeline(days.map((d) => ["SMEMBERS", "wd:ads:" + d]));
  if (!members) return res.status(502).json({ ok: false, error: "store" });
  const pairs = [];
  days.forEach((d, i) => (members[i] || []).forEach((ad) => pairs.push([d, ad])));
  const rows = pairs.length ? await store.pipeline(pairs.map((p) => ["HGETALL", "wd:d:" + p[0] + ":" + p[1]])) : [];
  if (!rows) return res.status(502).json({ ok: false, error: "store" });

  const total = {}, ads = {}, byDay = {};
  pairs.forEach((p, i) => {
    const flat = rows[i] || [];
    for (let j = 0; j + 1 < flat.length; j += 2) {
      const field = flat[j], v = Number(flat[j + 1]) || 0;
      add(total, field, v);
      add(ads[p[1]] = ads[p[1]] || {}, field, v);
      add(byDay[p[0]] = byDay[p[0]] || {}, field, v);
    }
  });
  return res.status(200).json({ ok: true, from: days[days.length - 1], to: days[0], total, ads, byDay });
};
