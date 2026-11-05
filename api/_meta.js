/* Meta Conversions API: our server tells Meta what became of a click on a Meta ad. No pixel, no Meta script in the
   browser, no cookie (founder's call, 5 Nov 2026). Only visitors with a click id (fbclid in the address, fbc here) get
   reported, so anyone who came through a link we sent ourselves stays out and doesn't blur what Meta learns.

   Events: InitiateCheckout (first quiz answer, api/event.js), Lead (api/lead.js), Schedule (Cal booking, api/event.js).
   Standard names only: at Noor, Meta dropped new custom event names until someone verified them by hand.

   Env: META_CAPI_TOKEN (without it nothing is sent). META_TEST_EVENT_CODE (optional, events count as test traffic:
   always on previews, on production only while verifying a change).
   Never throws: a lead must go through whatever happens here. */
"use strict";
const crypto = require("crypto");

const GRAPH = "https://graph.facebook.com/v21.0";
const DATASET = "1197846912166594";   // "Pixel 2", business Wizard Dynamics, ad account 410161126922620
const RE_FBC = /^fb\.1\.\d{10,16}\.[A-Za-z0-9_-]{1,255}$/;
const SITE = /^https:\/\/(www\.)?wizarddynamics\.com\//;

function sha(s) { return crypto.createHash("sha256").update(String(s)).digest("hex"); }
function norm(s) { return String(s || "").trim().toLowerCase(); }

/* Meta wants digits with the country code. A national number only gets one if we know the country. */
function normPhone(phone, country) {
  const raw = String(phone || "").trim(), d = raw.replace(/\D/g, "");
  if (!d) return "";
  if (raw.charAt(0) === "+") return d;
  if (d.slice(0, 2) === "00") return d.slice(2);
  if (d.charAt(0) === "0") return country === "DE" ? "49" + d.slice(1) : "";
  return d;
}

function validFbc(fbc) { return RE_FBC.test(String(fbc || "")); }

function buildEvent(req, name, o) {
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  const user = { fbc: o.fbc };
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ua = String(req.headers["user-agent"] || "").slice(0, 400);
  if (ip) user.client_ip_address = ip;
  if (ua) user.client_user_agent = ua;
  if (/^[A-Z]{2}$/.test(country)) user.country = [sha(country.toLowerCase())];
  if (o.email) user.em = [sha(norm(o.email))];
  const ph = normPhone(o.phone, country);
  if (ph) user.ph = [sha(ph)];
  if (o.first) user.fn = [sha(norm(o.first))];
  if (o.last) user.ln = [sha(norm(o.last))];
  return {
    event_name: name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: name.toLowerCase() + "_" + sha(o.dedupe || o.fbc).slice(0, 24),   // same person, same step: Meta keeps one for 48 h
    action_source: "website",
    event_source_url: SITE.test(o.url || "") ? o.url : "https://www.wizarddynamics.com/estimate",
    user_data: user,
    custom_data: o.custom || {}
  };
}

/* o: { fbc, url, dedupe, email, phone, first, last, custom }. Resolves to true if Meta took it. */
async function send(req, name, o) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !validFbc(o.fbc)) return false;
  const test = process.env.META_TEST_EVENT_CODE;
  const body = { data: [buildEvent(req, name, o)], access_token: token };
  if (test) body.test_event_code = test;
  const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 2500);
  try {
    const r = await fetch(GRAPH + "/" + DATASET + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ac.signal
    });
    const j = await r.json().catch(() => ({}));
    console.log("meta", name, test ? "test" : "live", r.status, "received", j.events_received || 0, (j.error && j.error.message) || "");
    return r.ok;
  } catch (e) {
    console.error("meta", name, e && e.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { send, validFbc, buildEvent, normPhone };
