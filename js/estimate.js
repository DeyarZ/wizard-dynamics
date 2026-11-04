/* Wizard Dynamics: the free app estimate, the lead magnet on /estimate.
   Six questions, then the contact details (with call consent), then a thank-you screen: a founder calls with the
   estimate, the visitor can pick a time instead. The price is not shown on the page: it goes into the lead email as the
   founder's talk track and out to the visitor by email a few hours later (api/lead.js). Live apps go to the Revenue
   Audit form (#audit) instead. Every view has its own URL (/estimate/stage, /estimate/thanks, ...) so Vercel Web
   Analytics shows the funnel step by step, and the browser's back button goes back one question.

   The first half (prices and math) also runs on the server: api/lead.js computes the estimate from the answers,
   so nothing the browser sends ends up in an email unchecked.

   PRICES is a proposal and human-owned. Change the numbers there; nothing else needs to change.
   Money is in EUR thousands before VAT; low/high are for that part on iPhone with a clean design. */
(function () {
  "use strict";

  var PRICES = {
    base: { low: 8, high: 12, weeks: 5 },          // iPhone app, clean design, about eight screens
    features: {
      accounts:     { low: 2, high: 4,  weeks: 1 },
      payments:     { low: 2, high: 3,  weeks: 0.5 },
      ai:           { low: 4, high: 10, weeks: 1.5 },
      social:       { low: 6, high: 12, weeks: 2.5 },
      maps:         { low: 2, high: 5,  weeks: 1 },
      admin:        { low: 4, high: 8,  weeks: 1.5 },
      integrations: { low: 2, high: 6,  weeks: 1 }
    },
    platform: { ios: { x: 1, w: 1 }, mobile: { x: 1.4, w: 1.15 }, all: { x: 1.65, w: 1.3 } },
    design: { clean: { x: 1, w: 1 }, custom: { x: 1.15, w: 1.15 } },
    stage: { idea: 1, designs: 0.92 },  // existing designs or a prototype save part of the design work
    netShare: 0.714,                    // what's left of a subscription price after Apple's 15% and 19% VAT
    paidShare: 0.02,                    // typical share of downloads that become paying subscribers
    yearPrices: [29.99, 49.99, 79.99],
    defaultPrice: 49.99
  };

  var STEPS = [
    { key: "kind", slug: "", q: "What kind of app do you want to build?", options: [
      ["consumer", "An app for consumers", "People download it and pay for it"],
      ["business", "An app for my business", "For your customers or your team"],
      ["marketplace", "A marketplace", "Two sides, like sellers and buyers"],
      ["unsure", "Not sure yet"]] },
    { key: "stage", slug: "stage", q: "Where are you now?", options: [
      ["idea", "Just an idea"],
      ["designs", "I have designs"],
      ["prototype", "I have a prototype"],
      ["stalled", "Started, but it stalled"],
      ["live", "Already live in the stores", "You get the free Revenue Audit instead"]] },
    { key: "blocker", slug: "blocker", q: "What has stopped you so far?", options: [
      ["trust", "I don't know who to trust"],
      ["prices", "The prices I've seen"],
      ["prototype", "My prototype isn't ready"],
      ["explain", "It's hard to explain what I need"],
      ["time", "No time so far"]] },
    { key: "features", slug: "features", q: "What must your first version have?", hint: "Pick all that apply.", many: true, options: [
      ["accounts", "Login and accounts"],
      ["payments", "Payments or subscriptions"],
      ["integrations", "Bookings"],
      ["social", "Chat or messages"],
      ["ai", "AI features"],
      ["unsure", "Not sure yet"]] },
    { key: "launch", slug: "timeline", q: "When do you want to launch?", options: [
      ["soon", "In under 3 months"],
      ["mid", "In 3 to 6 months"],
      ["later", "Later"],
      ["exploring", "Just exploring"]] },
    { key: "budget", slug: "budget", q: "What budget do you have in mind?", options: [
      ["5", "Under €5k"],
      ["15", "€5k to €15k"],
      ["30", "€15k to €30k"],
      ["60", "€30k to €60k"],
      ["999", "€60k or more"]] }
  ];
  var NAMES = {
    accounts: "Login and accounts", payments: "Payments or subscriptions", ai: "AI features",
    social: "Chat or messages", integrations: "Bookings", admin: "Admin dashboard", unsure: "Not sure yet"
  };

  /* ---------- math ---------- */
  function mid(x) { return (x.low + x.high) / 2; }
  /* The quiz no longer asks for platform or design: price iPhone + Android with the clean design, the founder confirms
     both on the call. "Bookings" uses the integrations price, "Chat" the social price, and a marketplace can't run
     without an admin side. */
  function priced(a) {
    var features = a.features.filter(function (f) { return PRICES.features[f]; });
    if (a.kind === "marketplace") features.push("admin");
    return { stage: a.stage === "designs" || a.stage === "prototype" ? "designs" : "idea", platform: "mobile", design: "clean", features: features };
  }
  function calc(a) {
    var p = PRICES.platform[a.platform || "ios"], d = PRICES.design[a.design || "clean"], s = PRICES.stage[a.stage] || 1;
    var low = PRICES.base.low, high = PRICES.base.high, weeks = PRICES.base.weeks;
    a.features.forEach(function (f) { var x = PRICES.features[f]; low += x.low; high += x.high; weeks += x.weeks; });
    var m = p.x * d.x * s, w = weeks * p.w * d.w;
    var wLow = Math.max(4, Math.round(w));
    return { low: low * m, high: high * m, mid: (low + high) / 2 * m, wLow: wLow, wHigh: Math.max(wLow + 1, Math.round(w * 1.3)) };
  }
  function moneyLines(a) {
    var p = PRICES.platform[a.platform].x, d = PRICES.design[a.design].x, s = PRICES.stage[a.stage] || 1;
    var sub = mid(PRICES.base), out = [["Core app on iPhone", sub]];
    a.features.forEach(function (f) { var v = mid(PRICES.features[f]); sub += v; out.push([NAMES[f], v]); });
    if (p > 1) out.push([a.platform === "all" ? "Android and web versions" : "Android version", sub * (p - 1)]);
    if (d > 1) out.push(["Custom design and animation", sub * p * (d - 1)]);
    if (s < 1) out.push(["Your existing designs or prototype", -sub * p * d * (1 - s)]);
    return out;
  }
  function has(f) { return function (a) { return a.features.indexOf(f) > -1; }; }
  function drop(f) { return function (a) { a.features = a.features.filter(function (x) { return x !== f; }); }; }
  var CUTS = [
    { when: function (a) { return a.platform !== "ios"; }, apply: function (a) { a.platform = "ios"; },
      title: "Launch on iPhone first, add Android later.",
      text: "iPhone users spend the most on apps, so it's the cheapest place to prove people pay." },
    { when: has("social"), apply: drop("social"), title: "Leave out chat.",
      text: "Prove people pay for the core first. Chat is expensive to build and to moderate." },
    { when: has("admin"), apply: drop("admin"), title: "Skip the admin dashboard for launch.",
      text: "Manage content straight in the database until there's enough of it to need a dashboard." },
    { when: has("integrations"), apply: drop("integrations"), title: "Leave bookings for version two.",
      text: "Launch with the core, then add what your users ask for." }
  ];
  function clone(a) { return { stage: a.stage, platform: a.platform, design: a.design, features: a.features.slice() }; }
  function bestCuts(a) {
    var base = calc(a).mid;
    var list = CUTS.filter(function (c) { return c.when(a); }).map(function (c) {
      var b = clone(a); c.apply(b);
      return { cut: c, title: c.title, text: c.text, saves: base - calc(b).mid };
    }).filter(function (x) { return x.saves >= 1; });
    list.sort(function (x, y) { return y.saves - x.saves; });
    list = list.slice(0, 3);
    var all = clone(a);
    list.forEach(function (x) { x.cut.apply(all); });
    return { list: list, after: calc(all) };
  }
  function paybackNums(m, price) {
    var subs = m * 1000 / (price * PRICES.netShare);
    return {
      subs: Math.max(50, subs < 1000 ? Math.round(subs / 50) * 50 : Math.round(subs / 100) * 100),
      downloads: Math.round(subs / PRICES.paidShare / 1000) * 1000,
      paidPct: Math.round(PRICES.paidShare * 100)
    };
  }

  /* ---------- formatting ---------- */
  function kr(v) { return "€" + Math.round(v) + "k"; }
  function kl(v) {
    var r = Math.round(Math.abs(v) * 2) / 2;
    return (v < 0 ? "−" : "") + "€" + (r % 1 ? r.toFixed(1) : r) + "k";
  }
  function num(n) { return n.toLocaleString("en-US"); }
  function labelOf(key, v) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].key !== key) continue;
      for (var j = 0; j < STEPS[i].options.length; j++) if (STEPS[i].options[j][0] === v) return STEPS[i].options[j][1];
    }
    return "-";
  }
  /* Answers as they may arrive from anywhere: returns clean answers, or null if anything is off. */
  function cleanAnswers(x) {
    if (!x || typeof x !== "object") return null;
    var out = { features: [] };
    for (var i = 0; i < STEPS.length; i++) {
      var s = STEPS[i];
      if (s.many) {
        if (!Array.isArray(x.features)) return null;
        for (var j = 0; j < s.options.length; j++) if (x.features.indexOf(s.options[j][0]) > -1) out.features.push(s.options[j][0]);
      } else {
        if (labelOf(s.key, x[s.key]) === "-" || (s.key === "stage" && x.stage === "live")) return null;
        out[s.key] = x[s.key];
      }
    }
    return out;
  }
  function answerLines(a) {
    return [
      ["App", labelOf("kind", a.kind)],
      ["Stage", labelOf("stage", a.stage)],
      ["Features", a.features.map(function (f) { return NAMES[f]; }).join(", ") || "None picked"],
      ["Launch", labelOf("launch", a.launch)],
      ["Budget", labelOf("budget", a.budget)]
    ];
  }
  function isPhone(v) {
    var d = String(v).replace(/\D/g, "");
    return /^\+?[\d\s()\/.-]+$/.test(String(v)) && d.length >= 7 && d.length <= 15;
  }

  var core = {
    PRICES: PRICES, STEPS: STEPS, NAMES: NAMES, priced: priced, calc: calc, moneyLines: moneyLines, bestCuts: bestCuts,
    paybackNums: paybackNums, kr: kr, kl: kl, num: num, labelOf: labelOf, cleanAnswers: cleanAnswers, answerLines: answerLines, isPhone: isPhone
  };
  if (typeof module === "object" && module.exports) { module.exports = core; return; }

  /* ================================================================
     Browser: the step-by-step estimate
     ================================================================ */
  var root = document.getElementById("est");
  if (!root) return;
  var audit = document.getElementById("audit");
  var WD = window.WD || {};
  var CONFIG = WD.config || { leadEmail: "hello@wizarddynamics.com", bookingUrl: "" };
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = "/estimate";
  var routed = root.hasAttribute("data-routed") && !!(window.history && history.pushState);
  var CHECK = '<svg width="12" height="12" aria-hidden="true"><use href="#i-check"/></svg>';

  var ans = { features: [] }, step = 0, reached = 0, lead = null, sentKey = "", interacted = false, busy = false;

  /* Where the visitor came from: utm tags, the landing-page button (from=...), the outside referrer. Goes with each lead. */
  var SOURCE = (function () {
    var o = {}, q = location.search.replace(/^\?/, "").split("&");
    q.forEach(function (kv) {
      var i = kv.indexOf("="), k = decodeURIComponent(i > -1 ? kv.slice(0, i) : kv), v = i > -1 ? kv.slice(i + 1) : "";
      if (/^(utm_(source|medium|campaign|content|term)|from|ref|gclid|fbclid)$/.test(k) && v) {
        try { o[k] = decodeURIComponent(v.replace(/\+/g, " ")).slice(0, 120); } catch (e) { /* malformed: skip */ }
      }
    });
    var r = document.referrer;
    if (r && r.indexOf(location.host) === -1 && !o.ref) o.ref = r.slice(0, 200);
    return o;
  })();

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function summary() {
    return "Name: " + lead.first + " " + lead.last + "\nEmail: " + lead.email + "\nPhone: " + lead.phone + "\n\n" +
      answerLines(ans).map(function (l) { return l[0] + ": " + l[1]; }).join("\n") +
      (lead.message ? "\n\n" + lead.message : "");
  }

  /* ---------- URLs per view (funnel steps in analytics, back button) ---------- */
  function go(view, replace) {
    if (!routed) return;
    var url = BASE + (view ? "/" + view : "");
    if (location.pathname === url) return;
    try { history[replace ? "replaceState" : "pushState"]({ est: view }, "", url); } catch (e) { /* file:// or sandboxed */ }
  }

  /* ---------- views ---------- */
  function head(showBack, count, pct) {
    return '<div class="est-top"><button class="est-link est-back' + (showBack ? "" : " is-hidden") + '" type="button"' +
      (showBack ? "" : ' tabindex="-1" aria-hidden="true"') + ">Back</button>" +
      '<span class="est-count">' + count + "</span></div>" +
      '<div class="est-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>';
  }
  function focusTop(el) {
    if (!interacted || !el) return;
    el.focus({ preventScroll: true });
    var card = root.closest(".form-card, .fx-card") || root;
    if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }
  function renderStep(fromHistory) {
    var s = STEPS[step];
    reached = Math.max(reached, step);
    var html = head(step > 0, "Question " + (step + 1) + " of " + STEPS.length, Math.round((step + 1) / (STEPS.length + 1) * 100));
    html += '<fieldset class="est-step"><legend class="est-q" tabindex="-1">' + s.q + "</legend>";
    if (s.hint) html += '<p class="est-hint">' + s.hint + "</p>";
    html += '<div class="est-opts">';
    s.options.forEach(function (o) {
      var on = s.many ? ans.features.indexOf(o[0]) > -1 : ans[s.key] === o[0];
      var inner = '<span class="est-mark">' + CHECK + '</span><span class="est-opt-t">' + o[1] + "</span>" +
        (o[2] ? '<span class="est-opt-d">' + o[2] + "</span>" : "");
      html += s.many
        ? '<label class="est-opt est-check' + (on ? " is-on" : "") + '"><input type="checkbox" value="' + o[0] + '"' + (on ? " checked" : "") + " />" + inner + "</label>"
        : '<button class="est-opt' + (on ? " is-on" : "") + '" type="button" data-v="' + o[0] + '" aria-pressed="' + on + '">' + inner + "</button>";
    });
    html += "</div>";
    if (s.many) html += '<button class="btn btn-lg btn-block est-next" type="button">' + (ans.features.length ? "Next" : "None of these, next") + "</button>";
    html += "</fieldset>";
    root.innerHTML = html;
    if (!fromHistory) go(s.slug);
    focusTop(root.querySelector(".est-q"));
  }
  function field(id, label, type, auto, max, value) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" autocomplete="' + auto +
      '" maxlength="' + max + '" required value="' + esc(value || "") + '" /></div>';
  }
  function renderContact(fromHistory) {
    var l = lead || {};
    root.innerHTML = head(true, "Last step", 100) +
      '<form class="form est-gate" novalidate>' +
      '<div><p class="est-q" tabindex="-1">Where can we reach you?</p><p class="est-hint">A founder calls you with your estimate: price, timeline and what your first version really needs. You also get it by email.</p></div>' +
      '<div class="form-row">' + field("e-first", "First name", "text", "given-name", 40, l.first) + field("e-last", "Last name", "text", "family-name", 40, l.last) + "</div>" +
      '<div class="form-row">' + field("e-email", "Email", "email", "email", 160, l.email) + field("e-phone", "Phone", "tel", "tel", 30, l.phone) + "</div>" +
      '<div class="field"><label for="e-msg">Anything we should know? <span class="est-optional">Optional</span></label><textarea id="e-msg" rows="3" maxlength="1000">' + esc(l.message || "") + "</textarea></div>" +
      '<label class="est-consent"><input type="checkbox" id="e-consent" required' + (l.consent ? " checked" : "") + " /><span>Yes, you may call me on this number about my app estimate.</span></label>" +
      '<input type="checkbox" id="e-bot" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true" />' +
      '<button class="btn btn-lg btn-block" type="submit">Get my free estimate</button>' +
      '<p class="form-foot">No newsletter. We only contact you about your app.</p>' +
      '<p class="form-status" role="status" aria-live="polite"></p></form>';
    if (!fromHistory) go("contact");
    focusTop(root.querySelector(".est-q"));
  }
  function renderThanks(fromHistory) {
    root.innerHTML = '<div class="est-thanks">' +
      '<p class="est-q" tabindex="-1">Thanks, ' + esc(lead.first) + ". We're preparing your estimate.</p>" +
      '<p class="est-text">We\'ll call you shortly on <b>' + esc(lead.phone) + "</b>, or first thing in the morning if it's night here in Munich. You'll also get the estimate by email within a few hours.</p>" +
      (CONFIG.bookingUrl && WD.openBooking ? '<div class="est-cta"><p class="est-text"><b>Busy?</b> Pick a time that suits you: 30 minutes with a founder, free.</p>' +
      '<button class="btn btn-lg btn-block" type="button" id="est-pick">Pick a time</button>' +
      '<div class="calendar" id="est-calendar" hidden></div></div>' : "") + "</div>";
    if (!fromHistory) go("thanks");
    focusTop(root.querySelector(".est-q"));
  }
  function pickTime() {
    var cal = document.getElementById("est-calendar");
    document.getElementById("est-pick").hidden = true;
    cal.hidden = false;
    WD.openBooking(cal, lead.first + " " + lead.last, lead.email, "Phone: " + lead.phone + ". " + summary().split("\n\n").slice(1).join(". ").replace(/\n/g, ". "),
      function () { go("booked"); });
    go("pick-time");
  }

  /* ---------- lead delivery: POST /api/lead (api/lead.js emails it via Resend) ---------- */
  function post(payload) {
    if (!window.fetch) return Promise.resolve({ ok: false });
    payload.source = SOURCE;
    return fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && !!j.ok }; });
      })
      .catch(function () { return { ok: false }; });
  }
  function mailto(subject, body) {
    return "mailto:" + CONFIG.leadEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function sendEstimate(st, btn) {
    var key = JSON.stringify([ans, lead]);
    if (key === sentKey) { renderThanks(); return; }   // back and forward again: no second email
    btn.disabled = true;
    st.className = "form-status";
    st.textContent = "Sending…";
    post({ type: "estimate", first: lead.first, last: lead.last, email: lead.email, phone: lead.phone, consent: lead.consent, message: lead.message, answers: ans }).then(function (res) {
      btn.disabled = false;
      if (res.ok) { sentKey = key; renderThanks(); return; }
      st.className = "form-status err";
      st.innerHTML = 'That didn\'t go through. <a href="' + mailto("App estimate: " + lead.first + " " + lead.last, "Please call me about my app estimate.\n\n" + summary()) + '">Send it by email instead.</a>';
    });
  }

  /* ---------- the Revenue Audit form (live apps) ---------- */
  var form = document.getElementById("lead-form");
  function auditSubmit(e) {
    e.preventDefault();
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    if (data.botcheck) return;
    var status = document.getElementById("form-status");
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "");
    if (!data.name || !emailOk || !data.budget || !data.message) {
      status.className = "form-status err";
      status.textContent = !data.name ? "Add your name so we know who we're talking to."
        : !emailOk ? "Add an email address we can reply to."
        : !data.budget ? "Pick a range, so we can prepare the audit."
        : "Add the link to your app, so we can look at it before the call.";
      document.getElementById(!data.name ? "f-name" : !emailOk ? "f-email" : !data.budget ? "f-budget" : "f-msg").focus();
      return;
    }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.className = "form-status";
    status.textContent = "Sending…";
    post({ type: "audit", name: data.name, email: data.email, revenue: data.budget, app: data.message }).then(function (res) {
      btn.disabled = false;
      if (!res.ok) {
        status.className = "form-status err";
        status.innerHTML = 'That didn\'t go through. <a href="' + mailto("Free Revenue Audit request: " + data.name,
          "Name: " + data.name + "\nEmail: " + data.email + "\nMonthly revenue: " + data.budget + "\nApp: " + data.message) +
          '">Send it by email instead.</a>';
        return;
      }
      status.textContent = "";
      form.style.display = "none";
      var success = document.getElementById("form-success");
      success.classList.add("show");
      if (CONFIG.bookingUrl && WD.openBooking) {
        var cal = document.getElementById("calendar");
        cal.hidden = false;
        WD.openBooking(cal, data.name, data.email, "Revenue Audit. Monthly revenue: " + data.budget + ". App: " + data.message,
          function () { go("audit-booked"); });
        document.getElementById("success-title").textContent = "Pick a time";
        document.getElementById("success-copy").textContent = "Your details are filled in. Choose a slot that works for you.";
      }
      success.focus();
      go("audit-sent");
    });
  }
  if (form) {
    form.addEventListener("submit", auditSubmit);
    if (CONFIG.bookingUrl) {
      var submitBtn = document.getElementById("form-submit"), foot = form.querySelector(".form-foot");
      if (submitBtn) submitBtn.textContent = "Pick my call time";
      if (foot) foot.textContent = "Next screen: pick a 30-minute slot. No newsletter, no sales sequence.";
    }
  }

  /* ---------- flow ---------- */
  function complete() {
    return STEPS.every(function (s) { return s.many ? reached > STEPS.indexOf(s) : ans[s.key] !== undefined; });
  }
  function next() {
    busy = false;
    step += 1;
    if (step >= STEPS.length) { reached = STEPS.length; renderContact(); } else renderStep();
  }
  function showAudit(focus, fromHistory) {
    if (!audit) return;
    root.hidden = true;
    audit.hidden = false;
    if (!fromHistory) go("audit");
    if (focus) { var h = audit.querySelector(".est-q"); if (h) h.focus({ preventScroll: true }); }
  }
  function showEst() {
    if (audit) audit.hidden = true;
    root.hidden = false;
  }
  /* Render whatever the URL asks for, as far as the answers so far allow it */
  function route(fromHistory) {
    var view = location.pathname.replace(/\.html$/, "").replace(/^\/estimate\/?/, "").replace(/\/$/, "");
    if (view === "audit" || view === "audit-sent" || view === "audit-booked") { showAudit(false, true); return; }
    showEst();
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].slug === view && i <= reached) { step = i; renderStep(true); return; }
    }
    if (view === "contact" && complete()) { step = STEPS.length; renderContact(true); return; }
    if ((view === "thanks" || view === "pick-time" || view === "booked") && lead && sentKey) { renderThanks(true); return; }
    step = 0;
    renderStep(true);
    if (fromHistory || view) go("", true);
  }

  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : null;
    if (!t || !root.contains(t)) return;
    interacted = true;
    if (t.classList.contains("est-back")) {
      if (routed) { history.back(); return; }
      step = step >= STEPS.length ? STEPS.length - 1 : Math.max(0, step - 1);
      renderStep();
    } else if (t.hasAttribute("data-v")) {
      if (busy) return;
      var s = STEPS[step], v = t.getAttribute("data-v");
      ans[s.key] = v;
      if (s.key === "stage" && v === "live") { ans.stage = undefined; showAudit(true); return; }
      Array.prototype.forEach.call(root.querySelectorAll(".est-opt"), function (o) {
        var on = o === t;
        o.classList.toggle("is-on", on);
        o.setAttribute("aria-pressed", on);
      });
      busy = true;
      window.setTimeout(next, reducedMotion ? 0 : 180);
    } else if (t.classList.contains("est-next")) {
      next();
    } else if (t.id === "est-pick") {
      pickTime();
    }
  });
  root.addEventListener("change", function (e) {
    var t = e.target, box = t.closest ? t.closest(".est-check") : null;
    if (!box) return;
    ans.features = Array.prototype.map.call(root.querySelectorAll(".est-check input:checked"), function (i) { return i.value; });
    box.classList.toggle("is-on", t.checked);
    var n = root.querySelector(".est-next");
    if (n) n.textContent = ans.features.length ? "Next" : "None of these, next";
  });
  root.addEventListener("submit", function (e) {
    e.preventDefault();
    interacted = true;
    if (document.getElementById("e-bot").checked) return;
    var val = function (id) { return document.getElementById(id).value.trim(); };
    var l = { first: val("e-first"), last: val("e-last"), email: val("e-email"), phone: val("e-phone"), message: val("e-msg"), consent: document.getElementById("e-consent").checked };
    var st = root.querySelector(".form-status");
    var bad = !l.first ? ["e-first", "Add your first name so we know who we're talking to."]
      : !l.last ? ["e-last", "Add your last name so we know who we're talking to."]
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email) ? ["e-email", "Add an email address we can reach you at."]
      : !isPhone(l.phone) ? ["e-phone", "Add a phone number with the country code, like +49 151 2345678."]
      : !l.consent ? ["e-consent", "Tick the box so we may call you. Prefer email? Write to " + CONFIG.leadEmail + "."]
      : null;
    if (bad) {
      st.className = "form-status err";
      st.textContent = bad[1];
      document.getElementById(bad[0]).focus();
      return;
    }
    lead = l;
    sendEstimate(st, root.querySelector("button[type=submit]"));
  });

  var auditBack = document.getElementById("audit-back");
  if (auditBack) auditBack.addEventListener("click", function () {
    interacted = true;
    showEst();
    step = 0;
    renderStep();
  });
  window.addEventListener("popstate", function () { route(true); });

  route(false);
})();
