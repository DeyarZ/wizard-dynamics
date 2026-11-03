/* Wizard Dynamics: the free app cost estimate, the lead magnet on /estimate.
   Six questions, then name + email, then the result: price range, build time, where the money goes,
   how to launch for less and the payback point. Live apps go to the Revenue Audit form (#audit) instead.
   Every view has its own URL (/estimate/platform, /estimate/result, ...) so Vercel Web Analytics shows the funnel
   step by step, and the browser's back button goes back one question.

   The first half (prices and math) also runs on the server: api/lead.js recomputes the estimate from the answers
   for the lead email and the visitor's copy, so nothing the browser sends ends up in an email unchecked.

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
    { key: "stage", slug: "", q: "Where is your app today?", options: [
      ["idea", "Just an idea"],
      ["designs", "Designs or a prototype"],
      ["live", "Live in the App Store", "You get the free Revenue Audit instead"]] },
    { key: "platform", slug: "platform", q: "Where should it run?", options: [
      ["ios", "iPhone"],
      ["mobile", "iPhone and Android"],
      ["all", "iPhone, Android and web"]] },
    { key: "features", slug: "features", q: "What does version one need?", hint: "Pick all that apply.", many: true, options: [
      ["accounts", "Accounts and login", "Profiles, sync across devices"],
      ["payments", "Subscriptions or in-app purchases", "Paywall, free trial, plans"],
      ["ai", "AI features", "Photo recognition, chat, text or image generation"],
      ["social", "Users post, share or chat", "Feeds, messages, communities"],
      ["maps", "Maps or location", "Places, routes, what's nearby"],
      ["admin", "Admin dashboard", "Manage content and users on the web"],
      ["integrations", "Connections to other services", "Health data, bookings, payments, outside APIs"]] },
    { key: "design", slug: "design", q: "How should it look?", options: [
      ["clean", "Clean and proven", "Familiar iOS and Android patterns, fastest to build"],
      ["custom", "Fully custom", "Your own visual style and custom animations"]] },
    { key: "budget", slug: "budget", q: "What budget do you have in mind?", options: [
      ["15", "Under €15k"],
      ["30", "€15k to €30k"],
      ["60", "€30k to €60k"],
      ["999", "€60k or more"],
      ["0", "Not sure yet"]] },
    { key: "start", slug: "timeline", q: "When do you want to start?", options: [
      ["now", "Within a month"],
      ["soon", "In 1 to 3 months"],
      ["later", "Just exploring"]] }
  ];
  var NAMES = {
    accounts: "Accounts and login", payments: "Subscriptions and purchases", ai: "AI features",
    social: "Posts, sharing and chat", maps: "Maps and location", admin: "Admin dashboard",
    integrations: "Connections to other services"
  };

  /* ---------- math ---------- */
  function mid(x) { return (x.low + x.high) / 2; }
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
    if (s < 1) out.push(["Your existing designs", -sub * p * d * (1 - s)]);
    return out;
  }
  function has(f) { return function (a) { return a.features.indexOf(f) > -1; }; }
  function drop(f) { return function (a) { a.features = a.features.filter(function (x) { return x !== f; }); }; }
  var CUTS = [
    { when: function (a) { return a.platform !== "ios"; }, apply: function (a) { a.platform = "ios"; },
      title: function (a) { return a.platform === "all" ? "Launch on iPhone first, add Android and web later." : "Launch on iPhone first, add Android later."; },
      text: "iPhone users spend the most on apps, so it's the cheapest place to prove people pay." },
    { when: has("social"), apply: drop("social"), title: "Leave out posts and chat.",
      text: "Prove people pay for the core first. Communities are expensive to build and to moderate." },
    { when: has("admin"), apply: drop("admin"), title: "Skip the admin dashboard for launch.",
      text: "Manage content straight in the database until there's enough of it to need a dashboard." },
    { when: function (a) { return a.design === "custom"; }, apply: function (a) { a.design = "clean"; },
      title: "Start with the clean design.", text: "Add the custom look once people pay for the app." },
    { when: has("integrations"), apply: drop("integrations"), title: "Connect other services in version two.",
      text: "Launch with the core, then add the connections your users ask for." },
    { when: has("maps"), apply: drop("maps"), title: "Leave maps for version two.",
      text: "Unless location is the point of the app, it can wait." }
  ];
  function clone(a) { return { stage: a.stage, platform: a.platform, design: a.design, features: a.features.slice() }; }
  function bestCuts(a) {
    var base = calc(a).mid;
    var list = CUTS.filter(function (c) { return c.when(a); }).map(function (c) {
      var b = clone(a); c.apply(b);
      return { cut: c, title: typeof c.title === "function" ? c.title(a) : c.title, text: c.text, saves: base - calc(b).mid };
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
      ["Stage", labelOf("stage", a.stage)],
      ["Platforms", labelOf("platform", a.platform)],
      ["Features", a.features.map(function (f) { return NAMES[f]; }).join(", ") || "None"],
      ["Design", labelOf("design", a.design)],
      ["Budget", labelOf("budget", a.budget)],
      ["Start", labelOf("start", a.start)]
    ];
  }

  var core = {
    PRICES: PRICES, STEPS: STEPS, NAMES: NAMES, calc: calc, moneyLines: moneyLines, bestCuts: bestCuts,
    paybackNums: paybackNums, kr: kr, kl: kl, num: num, labelOf: labelOf, cleanAnswers: cleanAnswers, answerLines: answerLines
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
  function rangeText() { var r = calc(ans); return kr(r.low) + " to " + kr(r.high); }
  function summary() {
    var r = calc(ans);
    return "Name: " + lead.name + "\nEmail: " + lead.email + "\n\n" +
      answerLines(ans).map(function (l) { return l[0] + ": " + l[1]; }).join("\n") +
      "\n\nEstimate: " + kr(r.low) + " to " + kr(r.high) + " (best guess " + kr(r.mid) + "), " + r.wLow + " to " + r.wHigh + " weeks";
  }
  function payback(m, price) {
    var p = paybackNums(m, price);
    return "At <b>€" + price + " a year</b>, it takes about <b>" + num(p.subs) + " paying subscribers</b> to earn the build back in year one. " +
      "With a typical " + p.paidPct + "% of downloads paying, that's about <b>" + num(p.downloads) + " downloads</b>.";
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
  function renderGate(fromHistory) {
    root.innerHTML = head(true, "Last step", 100) +
      '<form class="form est-gate" novalidate>' +
      '<div><p class="est-q" tabindex="-1">Your estimate is ready.</p><p class="est-hint">Where can we reach you about it?</p></div>' +
      '<div class="form-row"><div class="field"><label for="e-name">Name</label><input id="e-name" type="text" autocomplete="name" maxlength="80" required value="' + esc(lead ? lead.name : "") + '" /></div>' +
      '<div class="field"><label for="e-email">Email</label><input id="e-email" type="email" autocomplete="email" maxlength="160" required value="' + esc(lead ? lead.email : "") + '" /></div></div>' +
      '<input type="checkbox" id="e-bot" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true" />' +
      '<button class="btn btn-lg btn-block" type="submit">Show my estimate</button>' +
      '<p class="form-foot">No newsletter. We only email you about your app.</p>' +
      '<p class="form-status" role="status" aria-live="polite"></p></form>';
    if (!fromHistory) go("email");
    focusTop(root.querySelector(".est-q"));
  }
  function renderResult(fromHistory) {
    var r = calc(ans), cuts = bestCuts(ans), b = +ans.budget, note = "";
    if (b && b < 100) {
      if (r.high <= b) note = "That fits the budget you had in mind.";
      else if (r.low <= b) note = "Your budget of up to €" + b + "k covers the lower end of this range.";
      else note = "That's more than the €" + b + "k you had in mind." + (cuts.list.length ? " The cuts below bring it closer." : "");
    }
    var exploring = ans.start === "later";
    var spots = WD.spotsLong || "Only 5 founder calls a week.";
    var price = PRICES.defaultPrice;
    var html = '<div class="est-result">' +
      '<p class="est-label" tabindex="-1">Your estimate</p>' +
      '<p class="est-price">' + kr(r.low) + " to " + kr(r.high) + "</p>" +
      '<p class="est-sub">About ' + r.wLow + " to " + r.wHigh + " weeks from kickoff to the App Store. Our best single guess: " + kr(r.mid) + ".</p>" +
      '<p class="est-copy" role="status" aria-live="polite"></p>' +
      (note ? '<p class="est-note">' + note + "</p>" : "") +
      '<h2 class="est-h">Where the money goes</h2><dl class="est-lines">' +
      moneyLines(ans).map(function (l) { return "<div><dt>" + l[0] + "</dt><dd>" + kl(l[1]) + "</dd></div>"; }).join("") + "</dl>" +
      '<h2 class="est-h">How to launch for less</h2>';
    if (cuts.list.length) {
      html += '<ul class="est-cuts">' + cuts.list.map(function (x) {
        return "<li><b>" + x.title + "</b> " + x.text + '<span class="est-save">Saves about ' + kl(x.saves) + "</span></li>";
      }).join("") + "</ul>" +
        '<p class="est-cuts-total">' + (cuts.list.length > 1 ? "All together: " : "With that: ") + kr(cuts.after.low) + " to " + kr(cuts.after.high) + ".</p>";
    } else {
      html += '<p class="est-text">Your version one is already lean. Keep it that way until paying users ask for more.</p>';
    }
    html += '<h2 class="est-h">When does it pay for itself?</h2>' +
      '<p class="est-text">Your price per year:</p>' +
      '<div class="segmented est-prices">' + PRICES.yearPrices.map(function (p) {
        return '<label><input type="radio" name="est-price" value="' + p + '"' + (p === price ? " checked" : "") + " /><span>€" + p + "</span></label>";
      }).join("") + "</div>" +
      '<p class="est-payback" id="est-payback">' + payback(r.mid, price) + "</p>" +
      '<p class="est-reveal">Building the app is the predictable part. Getting those downloads is where most apps stall, and it\'s the part we\'ve done with our own: Grass Identifier went from $458 to $20.2k a month in 10&nbsp;months.</p>' +
      '<div class="est-cta">' +
      (exploring ? '<p class="est-text">No rush. When you\'re ready to build:</p>' : "") +
      '<button class="btn btn-lg btn-block' + (exploring ? " btn-outline" : "") + '" type="button" id="est-call">Book my free project call</button>' +
      '<p class="est-cta-note">30 minutes with a founder. We check your scope and cut what version one doesn\'t need. If you want us to build it, you get a fixed price. <b>' + spots + "</b></p>" +
      '<div class="calendar" id="est-calendar" hidden></div>' +
      '<p class="est-done" role="status" aria-live="polite"></p></div>' +
      '<p class="est-restart"><button class="est-link est-restart-btn" type="button">Start over</button></p></div>';
    root.innerHTML = html;
    if (!fromHistory) go("result");
    focusTop(root.querySelector(".est-label"));
  }

  /* ---------- lead delivery: POST /api/lead (api/lead.js emails it via Resend) ---------- */
  function post(payload) {
    if (!window.fetch) return Promise.resolve({ ok: false });
    payload.source = SOURCE;
    return fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && !!j.ok, copy: !!j.copy }; });
      })
      .catch(function () { return { ok: false }; });
  }
  function mailto(subject, body) {
    return "mailto:" + CONFIG.leadEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function sendEstimate() {
    var key = JSON.stringify([ans, lead]);
    if (key === sentKey) return;   // back and forward again: no second email
    sentKey = key;
    var copy = root.querySelector(".est-copy");
    post({ type: "estimate", name: lead.name, email: lead.email, answers: ans }).then(function (res) {
      if (!res.ok) sentKey = "";
      if (res.copy && copy && copy.isConnected) copy.textContent = "A copy is on its way to " + lead.email + ".";
    });
  }
  function requestCall() {
    var btn = document.getElementById("est-call"), done = root.querySelector(".est-done");
    var mail = '<a href="mailto:' + CONFIG.leadEmail + '">' + CONFIG.leadEmail + "</a>";
    btn.disabled = true;
    done.textContent = "Sending…";
    post({ type: "call", name: lead.name, email: lead.email, answers: ans }).then(function (res) {
      btn.disabled = false;
      if (CONFIG.bookingUrl && WD.openBooking) {
        var cal = document.getElementById("est-calendar");
        cal.hidden = false;
        WD.openBooking(cal, lead.name, lead.email, "Cost estimate " + rangeText() + ". " + summary().split("\n\n")[1].replace(/\n/g, ". "),
          function () { go("call-booked"); });
        btn.hidden = true;
        done.textContent = "";
      } else if (res.ok) {
        btn.hidden = true;
        done.textContent = "Done. We'll email you within 24 hours with times for the call.";
      } else {
        done.innerHTML = 'That didn\'t go through. <a href="' + mailto("Project call: " + lead.name + " (estimate " + rangeText() + ")", "I'd like a 30-minute call about my app.\n\n" + summary()) + '">Email us your estimate</a> or write to ' + mail + ".";
        return;
      }
      go("call-requested");
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
    if (step >= STEPS.length) { reached = STEPS.length; renderGate(); } else renderStep();
  }
  function restart() {
    ans = { features: [] };
    step = 0;
    reached = 0;
    renderStep();
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
    if (view === "email" && complete()) { step = STEPS.length; renderGate(true); return; }
    if ((view === "result" || view === "call-requested" || view === "call-booked") && lead && complete()) { renderResult(true); return; }
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
    } else if (t.id === "est-call") {
      requestCall();
    } else if (t.classList.contains("est-restart-btn")) {
      restart();
    }
  });
  root.addEventListener("change", function (e) {
    var t = e.target;
    if (t.type === "checkbox" && t.id !== "e-bot") {
      ans.features = Array.prototype.map.call(root.querySelectorAll(".est-check input:checked"), function (i) { return i.value; });
      t.closest("label").classList.toggle("is-on", t.checked);
      var n = root.querySelector(".est-next");
      if (n) n.textContent = ans.features.length ? "Next" : "None of these, next";
    } else if (t.name === "est-price") {
      document.getElementById("est-payback").innerHTML = payback(calc(ans).mid, +t.value);
    }
  });
  root.addEventListener("submit", function (e) {
    e.preventDefault();
    interacted = true;
    var name = document.getElementById("e-name").value.trim();
    var email = document.getElementById("e-email").value.trim();
    var st = root.querySelector(".form-status");
    if (document.getElementById("e-bot").checked) return;
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk) {
      st.className = "form-status err";
      st.textContent = !name ? "Add your name so we know who we're talking to." : "Add an email address we can reach you at.";
      document.getElementById(!name ? "e-name" : "e-email").focus();
      return;
    }
    lead = { name: name, email: email };
    // The visitor sees the result right away; the lead (and the visitor's copy) go out in the background.
    renderResult();
    sendEstimate();
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
