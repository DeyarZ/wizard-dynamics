/* Measurement without cookies and without storing anything on the device.
   Sums per ad go to our own database (api/event.js, read with tools/funnel.py). What a lead did on the page goes with the lead (api/lead.js).
   Meta only hears from our server, and only about visitors who came from a Meta ad (fbclid in the address).
   Loaded before site.js on the landing page and /estimate, not on the legal pages. Silent on localhost. */
(function () {
  "use strict";

  var qs = new URLSearchParams(location.search);
  var fbclid = qs.get("fbclid") || "";
  var fbc = fbclid ? "fb.1." + Date.now() + "." + fbclid : "";
  var ad = (qs.get("utm_content") || qs.get("utm_source") || "direct").slice(0, 80);
  var onEstimate = /^\/estimate/.test(location.pathname);
  var off = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || navigator.webdriver ||
    /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse/i.test(navigator.userAgent);

  var num = function (k) { return Math.max(0, parseInt(qs.get(k), 10) || 0); };
  /* Carried over from the landing page through the link to /estimate (see tail below) */
  var videoSec = num("vs"), videoTotal = num("vt"), pageBase = num("ps"), pageSec = 0;

  var PAGE = [[10, "t_10s"], [30, "t_30s"], [60, "t_1m"], [120, "t_2m"], [180, "t_3m"], [300, "t_5m"], [600, "t_10m"]];
  var VIDEO = [[10, "v_10s"], [30, "v_30s"], [60, "v_1m"], [120, "v_2m"], [180, "v_3m"], [240, "v_4m"], [300, "v_5m"]];
  var TO_META = { quiz_start: 1, booked: 1 };   // the two api/event.js reports to Meta (Lead goes through api/lead.js)

  var sent = {}, queue = [], secs = {}, timer = 0;

  function flush() {
    window.clearTimeout(timer);
    timer = 0;
    var hasSecs = false, k;
    for (k in secs) { hasSecs = true; break; }
    if (off || (!queue.length && !hasSecs)) return;
    var body = { ad: ad, ev: queue, s: secs };
    if (fbc && queue.some(function (n) { return TO_META[n]; })) {
      body.fbc = fbc;
      body.url = location.origin + location.pathname;
    }
    queue = [];
    secs = {};
    var json = JSON.stringify(body);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon("/api/event", json)) return;
      fetch("/api/event", { method: "POST", body: json, keepalive: true }).catch(function () { /* a lost count is not worth an error */ });
    } catch (e) { /* same */ }
  }
  function ev(name) {
    name = String(name).replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "_").toLowerCase().slice(0, 40);
    if (!name || sent[name]) return;   // once per page load, so these are people, not repeats
    sent[name] = 1;
    queue.push(name);
    if (TO_META[name]) flush();   // right away, so Meta gets the page it really happened on
    else if (!timer) timer = window.setTimeout(flush, 5000);
  }
  function passed(list, sec) {
    list.forEach(function (m) { if (sec >= m[0]) ev(m[1]); });
  }

  /* Where the visitor is looking: the question on /estimate, otherwise the section in the middle of the screen */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  function where() {
    if (onEstimate) return "est_" + (location.pathname.split("/")[2] || "start").replace(/[^a-z0-9]+/gi, "_");
    if (document.querySelector("dialog[open]")) return "popup";
    var vf = document.getElementById("vf");
    if (vf && vf.classList.contains("open")) return "video";
    var mid = window.innerHeight / 2;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.height && r.top <= mid && r.bottom > mid) return sections[i].id;
    }
    return "";
  }
  var ticker = window.setInterval(function () {
    if (document.hidden) return;
    pageSec += 1;
    if (pageSec > 1800) { window.clearInterval(ticker); return; }   // a forgotten tab is not attention
    if (!onEstimate) passed(PAGE, pageSec);
    var w = where();
    if (!w) return;
    secs[w] = (secs[w] || 0) + 1;
    ev("sec_" + w);
  }, 1000);

  document.addEventListener("visibilitychange", function () { if (document.hidden) flush(); });
  window.addEventListener("pagehide", flush);

  window.WDT = {
    fbc: fbc,
    ev: ev,
    /* Seconds really watched, from the video floater */
    video: function (sec, total) {
      videoSec = Math.round(sec);
      if (total) videoTotal = Math.round(total);
      passed(VIDEO, sec);
    },
    /* What the lead did, for the lead mail */
    snapshot: function () { return { pageSec: pageBase + pageSec, videoSec: videoSec, videoTotal: videoTotal }; },
    url: function () { return location.origin + location.pathname; },
    /* For the link to /estimate at the moment of the click: the only way this crosses pages, nothing is stored */
    tail: function () { return "vs=" + videoSec + "&vt=" + videoTotal + "&ps=" + (pageBase + pageSec); }
  };

  ev(onEstimate ? "est_view" : "home_view");
})();
