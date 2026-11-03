/* Wizard Dynamics: the free app cost estimate, the lead magnet in #book.
   Six questions, then name + email, then the result: price range, build time, where the money goes,
   how to launch for less and the payback point. Live apps go to the Revenue Audit form (#audit) instead.

   PRICES is a proposal and human-owned. Change the numbers there; nothing else needs to change.
   Money is in EUR thousands before VAT; low/high are for that part on iPhone with a clean design. */
(function () {
  "use strict";
  var root = document.getElementById("est");
  if (!root) return;
  var audit = document.getElementById("audit");
  var WD = window.WD || {};
  var CONFIG = WD.config || { leadEmail: "hello@wizarddynamics.com", web3formsKey: "", bookingUrl: "" };
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    { key: "stage", q: "Where is your app today?", options: [
      ["idea", "Just an idea"],
      ["designs", "Designs or a prototype"],
      ["live", "Live in the App Store", "You get the free Revenue Audit instead"]] },
    { key: "platform", q: "Where should it run?", options: [
      ["ios", "iPhone"],
      ["mobile", "iPhone and Android"],
      ["all", "iPhone, Android and web"]] },
    { key: "features", q: "What does version one need?", hint: "Pick all that apply.", many: true, options: [
      ["accounts", "Accounts and login", "Profiles, sync across devices"],
      ["payments", "Subscriptions or in-app purchases", "Paywall, free trial, plans"],
      ["ai", "AI features", "Photo recognition, chat, text or image generation"],
      ["social", "Users post, share or chat", "Feeds, messages, communities"],
      ["maps", "Maps or location", "Places, routes, what's nearby"],
      ["admin", "Admin dashboard", "Manage content and users on the web"],
      ["integrations", "Connections to other services", "Health data, bookings, payments, outside APIs"]] },
    { key: "design", q: "How should it look?", options: [
      ["clean", "Clean and proven", "Familiar iOS and Android patterns, fastest to build"],
      ["custom", "Fully custom", "Your own visual style and custom animations"]] },
    { key: "budget", q: "What budget do you have in mind?", options: [
      ["15", "Under €15k"],
      ["30", "€15k to €30k"],
      ["60", "€30k to €60k"],
      ["999", "€60k or more"],
      ["0", "Not sure yet"]] },
    { key: "start", q: "When do you want to start?", options: [
      ["now", "Within a month"],
      ["soon", "In 1 to 3 months"],
      ["later", "Just exploring"]] }
  ];
  var NAMES = {
    accounts: "Accounts and login", payments: "Subscriptions and purchases", ai: "AI features",
    social: "Posts, sharing and chat", maps: "Maps and location", admin: "Admin dashboard",
    integrations: "Connections to other services"
  };
  var CHECK = '<svg width="12" height="12" aria-hidden="true"><use href="#i-check"/></svg>';

  var ans = { features: [] }, step = 0, lead = null, interacted = false, busy = false;

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
      return { cut: c, title: typeof c.title === "function" ? c.title(a) : c.title, saves: base - calc(b).mid };
    }).filter(function (x) { return x.saves >= 1; });
    list.sort(function (x, y) { return y.saves - x.saves; });
    list = list.slice(0, 3);
    var all = clone(a);
    list.forEach(function (x) { x.cut.apply(all); });
    return { list: list, after: calc(all) };
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
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rangeText() { var r = calc(ans); return kr(r.low) + " to " + kr(r.high); }
  function summary() {
    var r = calc(ans);
    return "Name: " + lead.name + "\nEmail: " + lead.email +
      "\n\nStage: " + labelOf("stage", ans.stage) +
      "\nPlatforms: " + labelOf("platform", ans.platform) +
      "\nFeatures: " + (ans.features.map(function (f) { return NAMES[f]; }).join(", ") || "None") +
      "\nDesign: " + labelOf("design", ans.design) +
      "\nBudget: " + labelOf("budget", ans.budget) +
      "\nStart: " + labelOf("start", ans.start) +
      "\n\nEstimate: " + kr(r.low) + " to " + kr(r.high) + " (best guess " + kr(r.mid) + "), " + r.wLow + " to " + r.wHigh + " weeks";
  }
  function payback(m, price) {
    var subs = m * 1000 / (price * PRICES.netShare);
    var subsR = Math.max(50, subs < 1000 ? Math.round(subs / 50) * 50 : Math.round(subs / 100) * 100);
    var dl = Math.round(subs / PRICES.paidShare / 1000) * 1000;
    return "At <b>€" + price + " a year</b>, it takes about <b>" + num(subsR) + " paying subscribers</b> to earn the build back in year one. " +
      "With a typical " + Math.round(PRICES.paidShare * 100) + "% of downloads paying, that's about <b>" + num(dl) + " downloads</b>.";
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
    var card = root.closest(".form-card") || root;
    var top = card.getBoundingClientRect().top;
    if (top < 0) card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }
  function renderStep() {
    var s = STEPS[step];
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
    focusTop(root.querySelector(".est-q"));
  }
  function renderGate() {
    root.innerHTML = head(true, "Last step", 100) +
      '<form class="form est-gate" novalidate>' +
      '<div><p class="est-q" tabindex="-1">Your estimate is ready.</p><p class="est-hint">Where can we reach you about it?</p></div>' +
      '<div class="form-row"><div class="field"><label for="e-name">Name</label><input id="e-name" type="text" autocomplete="name" required value="' + esc(lead ? lead.name : "") + '" /></div>' +
      '<div class="field"><label for="e-email">Email</label><input id="e-email" type="email" autocomplete="email" required value="' + esc(lead ? lead.email : "") + '" /></div></div>' +
      '<input type="checkbox" id="e-bot" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true" />' +
      '<button class="btn btn-lg btn-block" type="submit">Show my estimate</button>' +
      '<p class="form-foot">No newsletter. We only email you about your app.</p>' +
      '<p class="form-status" role="status" aria-live="polite"></p></form>';
    focusTop(root.querySelector(".est-q"));
  }
  function renderResult() {
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
      (note ? '<p class="est-note">' + note + "</p>" : "") +
      '<h4 class="est-h">Where the money goes</h4><dl class="est-lines">' +
      moneyLines(ans).map(function (l) { return "<div><dt>" + l[0] + "</dt><dd>" + kl(l[1]) + "</dd></div>"; }).join("") + "</dl>" +
      '<h4 class="est-h">How to launch for less</h4>';
    if (cuts.list.length) {
      html += '<ul class="est-cuts">' + cuts.list.map(function (x) {
        return "<li><b>" + x.title + "</b> " + x.cut.text + '<span class="est-save">Saves about ' + kl(x.saves) + "</span></li>";
      }).join("") + "</ul>" +
        '<p class="est-cuts-total">' + (cuts.list.length > 1 ? "All together: " : "With that: ") + kr(cuts.after.low) + " to " + kr(cuts.after.high) + ".</p>";
    } else {
      html += '<p class="est-text">Your version one is already lean. Keep it that way until paying users ask for more.</p>';
    }
    html += '<h4 class="est-h">When does it pay for itself?</h4>' +
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
    focusTop(root.querySelector(".est-label"));
  }

  /* ---------- lead delivery ---------- */
  function send(subject, message) {
    if (!CONFIG.web3formsKey || !window.fetch) return Promise.resolve(false);
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: CONFIG.web3formsKey, subject: subject, from_name: "wizarddynamics.com",
        name: lead.name, email: lead.email, message: message
      })
    }).then(function (r) { return r.json(); })
      .then(function (j) { return !!(j && j.success); })
      .catch(function () { return false; });
  }
  function requestCall() {
    var btn = document.getElementById("est-call"), done = root.querySelector(".est-done");
    var mail = '<a href="mailto:' + CONFIG.leadEmail + '">' + CONFIG.leadEmail + "</a>";
    if (CONFIG.bookingUrl && WD.bookingSrc) {
      var cal = document.getElementById("est-calendar"), f = document.createElement("iframe");
      f.src = WD.bookingSrc(lead.name, lead.email, "Cost estimate " + rangeText() + ". " + summary().split("\n\n")[1].replace(/\n/g, ". "));
      f.title = "Pick a time for your project call";
      f.loading = "eager";
      cal.innerHTML = "";
      cal.appendChild(f);
      cal.hidden = false;
      btn.hidden = true;
      return;
    }
    if (CONFIG.web3formsKey) {
      btn.disabled = true;
      done.textContent = "Sending…";
      send("Call request: " + lead.name + " (estimate " + rangeText() + ")", summary()).then(function (ok) {
        btn.disabled = false;
        if (ok) { btn.hidden = true; done.textContent = "Done. We'll email you within 24 hours with times for the call."; }
        else done.innerHTML = "That didn't go through. Email us at " + mail + " instead.";
      });
      return;
    }
    window.location.href = "mailto:" + CONFIG.leadEmail +
      "?subject=" + encodeURIComponent("Project call: " + lead.name + " (estimate " + rangeText() + ")") +
      "&body=" + encodeURIComponent("I'd like a 30-minute call about my app.\n\n" + summary());
    done.innerHTML = "Your email app should have opened with your estimate filled in. Press send and we'll reply within 24 hours. If nothing opened, write to " + mail + ".";
  }

  /* ---------- flow ---------- */
  function next() {
    busy = false;
    step += 1;
    if (step >= STEPS.length) renderGate(); else renderStep();
  }
  function restart() {
    ans = { features: [] };
    step = 0;
    renderStep();
  }
  function showAudit(focus) {
    if (!audit) return;
    root.hidden = true;
    audit.hidden = false;
    if (focus) { var h = audit.querySelector(".est-q"); if (h) h.focus({ preventScroll: true }); }
  }
  function showEst() {
    if (audit) audit.hidden = true;
    root.hidden = false;
    if (ans.stage === "live") { ans.stage = undefined; step = 0; renderStep(); }
  }

  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : null;
    if (!t || !root.contains(t)) return;
    interacted = true;
    if (t.classList.contains("est-back")) {
      if (step >= STEPS.length) step = STEPS.length - 1; else step = Math.max(0, step - 1);
      renderStep();
    } else if (t.hasAttribute("data-v")) {
      if (busy) return;
      var s = STEPS[step], v = t.getAttribute("data-v");
      ans[s.key] = v;
      if (s.key === "stage" && v === "live") { showAudit(true); return; }
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
    var r = calc(ans);
    // The visitor sees the result right away; the lead goes out in the background.
    send("New cost estimate: " + name + " (" + kr(r.low) + " to " + kr(r.high) + ", start: " + labelOf("start", ans.start) + ")", summary());
    renderResult();
  });

  var auditBack = document.getElementById("audit-back");
  if (auditBack) auditBack.addEventListener("click", function () {
    interacted = true;
    ans.stage = undefined;
    step = 0;
    showEst();
    renderStep();
  });
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#book"]'), function (a) {
    a.addEventListener("click", function () {
      if (a.getAttribute("data-stage") === "Live app") showAudit(false); else showEst();
    });
  });

  renderStep();
})();
