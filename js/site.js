/* Wizard Dynamics: landing interactions. Vanilla, no dependencies.
   The page is fully readable without JavaScript; this file only adds behaviour. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG: fill these in, nothing else needs to change.
     ------------------------------------------------------------------ */
  var CONFIG = {
    // VSL, option A (recommended): self-hosted .mp4 (or a Bunny/other EU CDN mp4 URL).
    // Plays muted with captions on load, "Click for sound" restarts it with sound.
    vslSrc: "",
    vslCaptions: "",   // optional WebVTT file, e.g. "video/vsl-en.vtt"
    vslPoster: "",     // optional poster image for the <video>
    // VSL, option B: YouTube/Vimeo embed URL (click to play). Needs a datenschutz update.
    vslEmbed: "",
    // Leads (estimates, Revenue Audit requests) go to /api/lead, which emails them via Resend
    // (api/lead.js, key in the Vercel env). leadEmail is only the mailto fallback if that request fails.
    // Cal.com / Calendly booking link. When set, the calendar opens inline after "Book my free project call"
    // and after the audit form (name + email + notes prefilled), so the call really gets booked. Covered in datenschutz.html.
    // Shared with the consulting site (cal.com account wizard-dynamics-consulting). Keep BOOKING in api/lead.js the same.
    bookingUrl: "https://cal.com/wizard-dynamics-consulting/30min",
    leadEmail: "hello@wizarddynamics.com",
    // Founder calls per week (after the free cost estimate, or for the Revenue Audit): offer bar, offer, booking.
    // spotsLeft: null -> "Only 5 free founder calls a week" (true only while a 6th lead in the same week really waits; if you call more, raise spotsTotal first).
    // spotsLeft: 3    -> "3 of 5 free founder calls left". Only set it if you update it as calls get booked:
    // a returning visitor who sees "3 left" on Monday and on Sunday knows the scarcity is fake.
    // The countdown always runs to Sunday 23:59 (visitor's time), when the week's spots reset.
    spotsLeft: null,
    spotsTotal: 5,
    // New builds we still start before the deadline: a rule the founders set and hold (Deyar, 4 Nov 2026).
    // Lower buildsLeft the day a build is signed. At 0 or after buildsDeadline every build-slots line disappears
    // and the bar falls back to the weekly calls. Offer bar, mobile sticky bar, founders letter, FAQ, closing CTA.
    buildsLeft: 2,
    buildsBefore: "January",
    buildsDeadline: "2027-01-01"
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Placeholder highlighter: open the page with ?ph */
  if (/[?&]ph\b/.test(location.search)) document.documentElement.classList.add("show-ph");

  var y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Weekly founder calls + countdown to Sunday 23:59 */
  var total = CONFIG.spotsTotal, left = CONFIG.spotsLeft;
  var hasLeft = typeof left === "number";
  var spotsCopy = {
    timerLong: hasLeft ? left + " of " + total + " free founder calls left, closes in " : "This week's " + total + " free founder calls close in ",
    timerShort: hasLeft ? left + " of " + total + " calls left: " : "Free calls close in ",
    long: hasLeft ? left + " of " + total + " founder calls left this week." : "Only " + total + " founder calls a week."
  };
  $$("[data-spots]").forEach(function (el) {
    var html = spotsCopy[el.getAttribute("data-spots")];
    if (html) el.innerHTML = html;
  });

  /* Build slots left before the deadline. Off (0 left or deadline passed): the bar and the sticky bar fall back, the rest disappears */
  var builds = CONFIG.buildsLeft, before = CONFIG.buildsBefore;
  var buildsOn = builds > 0 && new Date() < new Date(CONFIG.buildsDeadline);
  var one = builds === 1;
  var buildsCopy = buildsOn ? {
    bar: "Only " + builds + ' build<span class="hide-sm"> slot</span>' + (one ? "" : "s") + " left before " + before,
    long: "Only " + builds + " build " + (one ? "slot" : "slots") + " left before " + before + ".",
    short: "<b>Only " + builds + " build" + (one ? "" : "s") + " left</b><br>before " + before,
    inline: ", and only " + builds + " more " + (one ? "starts" : "start") + " before " + before
  } : {
    bar: hasLeft ? left + " of " + total + " free founder calls left" : "Only " + total + " free founder calls a week",
    short: "<b>Free,</b> about 2&nbsp;minutes"
  };
  $$("[data-builds]").forEach(function (el) {
    var kind = el.getAttribute("data-builds");
    if (kind === "block") { if (!buildsOn) el.style.display = "none"; return; }
    if (buildsCopy[kind]) el.innerHTML = buildsCopy[kind];
    else el.style.display = "none";
  });

  var timers = $$("[data-countdown]");
  function weekEnd(now) {
    var end = new Date(now);
    end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
    end.setHours(23, 59, 59, 999);
    return end;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var now = new Date();
    var s = Math.max(0, Math.floor((weekEnd(now) - now) / 1000));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    var text = (d ? d + "d " : "") + pad(h) + "h " + pad(m) + "m " + pad(sec) + "s";
    timers.forEach(function (el) { el.textContent = text; });
  }
  if (timers.length) { tick(); window.setInterval(tick, 1000); }

  /* The nav and the mobile sticky CTA stay out of the way until the hero CTA has scrolled off screen */
  var nav = $("#nav");
  var mobileCta = $("#mobile-cta");
  var heroCta = $(".hero-action .btn");
  var book = $("#book");
  function onScroll() {
    if (!heroCta) return;
    var pastHeroCta = heroCta.getBoundingClientRect().bottom < 0;
    if (nav) nav.classList.toggle("show", pastHeroCta);
    if (mobileCta && book) {
      var b = book.getBoundingClientRect();
      var atBook = b.top < window.innerHeight && b.bottom > 0;
      mobileCta.classList.toggle("show", pastHeroCta && !atBook);
    }
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Mobile menu */
  var burger = $("#nav-burger");
  var menu = $("#mobile-menu");
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$("#mobile-menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* FAQ: one open at a time */
  var faqs = $$(".faq-list details");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ------------------------------------------------------------------
     VSL
     ------------------------------------------------------------------ */
  var frame = $("#vsl-frame");
  var poster = $("#vsl-play");
  var modal = $("#video-modal");
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("#modal-close").focus();
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  if (modal) {
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal-cta").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); setMenu(false); }
  });

  function buildVideo(withSound) {
    var v = document.createElement("video");
    v.src = CONFIG.vslSrc;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.preload = "metadata";
    if (CONFIG.vslPoster) v.poster = CONFIG.vslPoster;
    if (CONFIG.vslCaptions) {
      var t = document.createElement("track");
      t.kind = "captions"; t.srclang = "en"; t.label = "English"; t.src = CONFIG.vslCaptions; t.default = true;
      v.appendChild(t);
    }
    v.muted = !withSound;
    v.controls = !!withSound;
    return v;
  }

  function mountSmartAutoplay() {
    var v = buildVideo(false);
    v.autoplay = true;
    v.loop = true;
    var sound = document.createElement("button");
    sound.type = "button";
    sound.className = "vsl-sound";
    sound.innerHTML = '<svg width="22" height="22" aria-hidden="true"><use href="#i-muted"/></svg>Click for sound';
    sound.addEventListener("click", function () {
      v.loop = false;
      v.muted = false;
      v.currentTime = 0;
      v.controls = true;
      v.play();
      sound.remove();
    });
    frame.innerHTML = "";
    frame.appendChild(v);
    frame.appendChild(sound);
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: user can still click for sound */ });
  }

  if (frame && poster) {
    // The play button only exists once there is a video to play; until then the poster is a static revenue chart.
    if (CONFIG.vslSrc || CONFIG.vslEmbed) poster.hidden = false;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (CONFIG.vslSrc && !reducedMotion && !saveData) {
      mountSmartAutoplay();
    } else {
      poster.addEventListener("click", function () {
        if (CONFIG.vslSrc) {
          var v = buildVideo(true);
          frame.innerHTML = "";
          frame.appendChild(v);
          v.play();
        } else if (CONFIG.vslEmbed) {
          var f = document.createElement("iframe");
          f.src = CONFIG.vslEmbed + (CONFIG.vslEmbed.indexOf("?") > -1 ? "&" : "?") + "autoplay=1&rel=0";
          f.allow = "autoplay; fullscreen; picture-in-picture";
          f.allowFullscreen = true;
          f.title = "Wizard Dynamics intro video";
          frame.innerHTML = "";
          frame.appendChild(f);
        } else {
          openModal();
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     The estimate page (js/estimate.js) reads these
     ------------------------------------------------------------------ */
  /* Cal.com inline booking. embed.js loads only on the visitor's click (datenschutz: Terminbuchung), sizes the
     calendar to its content (no scroll inside a scroll on phones) and hides the event header (the Cal.com
     account is named after the consulting site). onBooked runs after a booking, for the funnel. */
  function openBooking(el, name, email, notes, onBooked) {
    var link = CONFIG.bookingUrl.replace(/^https?:\/\/(app\.)?cal\.com\//, "").replace(/[?#].*$/, "");
    if (!window.Cal) {
      (function (C, A, L) {
        var p = function (a, ar) { a.q.push(ar); }, d = C.document;
        C.Cal = C.Cal || function () {
          var cal = C.Cal, ar = arguments;
          if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
          if (ar[0] === L) {
            var api = function () { p(api, arguments); }, ns = ar[1];
            api.q = api.q || [];
            if (typeof ns === "string") { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ["initNamespace", ns]); } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");
      window.Cal("init", { origin: "https://cal.com" });
      window.Cal("ui", { hideEventTypeDetails: true, layout: "month_view", theme: "light", cssVarsPerTheme: { light: { "cal-brand": "#1e54f0" } } });
    }
    if (onBooked) {
      if (openBooking.booked) window.Cal("off", { action: "bookingSuccessfulV2", callback: openBooking.booked });
      openBooking.booked = function () { onBooked(); };
      window.Cal("on", { action: "bookingSuccessfulV2", callback: openBooking.booked });
    }
    el.innerHTML = "";
    window.Cal("inline", { elementOrSelector: el, calLink: link, config: { name: name, email: email, notes: notes, layout: "month_view", theme: "light" } });
  }
  window.WD = { config: CONFIG, openBooking: openBooking };

  /* Links to /estimate carry which button it was (from=hero) plus this visit's utm tags and outside referrer,
     so every lead email says where the lead came from. Nothing is stored on the device. */
  var carry = [];
  location.search.replace(/^\?/, "").split("&").forEach(function (kv) {
    if (/^(utm_(source|medium|campaign|content|term)|gclid|fbclid)=./.test(kv)) carry.push(kv);
  });
  if (document.referrer && document.referrer.indexOf(location.host) === -1) carry.push("ref=" + encodeURIComponent(document.referrer.slice(0, 200)));
  $$('a[href^="/estimate"]').forEach(function (a) {
    var q = carry.slice(), from = a.getAttribute("data-cta");
    if (from) q.unshift("from=" + encodeURIComponent(from));
    if (q.length) a.setAttribute("href", a.getAttribute("href") + "?" + q.join("&"));
  });
})();
