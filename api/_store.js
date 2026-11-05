/* The measurement counters: our own Upstash Redis (store wizard-dynamics-redis, free plan, Frankfurt, connected to the
   wizard-dynamics project, which brings the KV_REST_API_* env). Not shared with Noor's database on purpose.

   Keys: wd:d:<day>:<ad> = hash event -> count, s_<place> -> seconds. wd:ads:<day> = set of ads seen that day.
   wd:rl:<hash> = requests per IP per hour. Day = Munich time. */
"use strict";

const TTL = 180 * 86400;

function day(d) { return (d || new Date()).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }); }

/* Results in order, or null if the store is missing or down */
async function pipeline(cmds) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !cmds.length) return null;
  const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) {
    console.error("store", r.status, (await r.text().catch(() => "")).slice(0, 200));
    return null;
  }
  const rows = await r.json();
  return rows.map((x) => (x ? x.result : null));
}

module.exports = { TTL, day, pipeline };
