/* Wizard Dynamics: landing interactions. Vanilla, no dependencies.
   The page is fully readable without JavaScript; this file only adds behaviour. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG: fill these in, nothing else needs to change.
     ------------------------------------------------------------------ */
  var CONFIG = {
    // The video floater, bottom right over the page: self-hosted .mp4, filmed 9:16, captions burned in.
    // Small: vslPreview on a muted loop (8 s, 3:4, about 180 KB, so a visitor who never clicks doesn't load the big file).
    // Click: vslSrc with sound, the button under it opens the short contact form. Empty vslSrc: no floater.
    // New cut = new file name: /video/ is cached for a week.
    vslSrc: "/video/wd-vsl-v2.mp4",
    vslPreview: "/video/wd-vsl-preview.mp4",
    vslPoster: "/video/wd-vsl-poster.jpg",
    vslCaptions: "",   // optional WebVTT file, only for a video without burned-in captions
    // Short contact form: opens after this many seconds without any input while the hero is on screen, once per tab session. 0 = off.
    popupIdleSeconds: 15,
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
    spotsTotal: 5
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
    bar: hasLeft
      ? "<b>" + left + " of " + total + " free founder calls left</b>"
      : "<b>Only " + total + " free founder calls a week</b>",
    sticky: hasLeft ? left + " of " + total + " free calls left" : "Only " + total + ' free calls<span class="sticky-more"> a week</span>',
    long: hasLeft ? left + " of " + total + " founder calls left this week." : "Only " + total + " founder calls a week."
  };
  $$("[data-spots]").forEach(function (el) {
    var html = spotsCopy[el.getAttribute("data-spots")];
    if (html) el.innerHTML = html;
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
  var vf = $("#vf");
  function onScroll() {
    if (!heroCta) return;
    var pastHeroCta = heroCta.getBoundingClientRect().bottom < 0;
    if (nav) nav.classList.toggle("show", pastHeroCta);
    if (!book) return;
    var b = book.getBoundingClientRect();
    var atBook = b.top < window.innerHeight && b.bottom > 0;
    if (mobileCta) mobileCta.classList.toggle("show", pastHeroCta && !atBook);
    if (vf) {
      vf.classList.toggle("lift", pastHeroCta && !atBook);        // sits above the mobile sticky bar
      vf.classList.toggle("away", b.top < window.innerHeight);    // the closing CTA and the footer's legal links stay clear
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
    if (vf) vf.classList.toggle("menu-open", open);
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

  /* ------------------------------------------------------------------
     Short contact form + video floater (landing page only)
     ------------------------------------------------------------------ */
  /* Vercel Analytics on Hobby counts page views only, so these steps are virtual pages in the Pages list */
  function track(path) { if (typeof window.va === "function") window.va("pageview", { route: path, path: path }); }

  /* Per tab, gone when the tab closes (datenschutz: Kurzformular und Video) */
  var memo = {};
  function sessionFlag(key, set) {
    try {
      if (set) sessionStorage.setItem(key, "1");
      return !!sessionStorage.getItem(key);
    } catch (e) {
      if (set) memo[key] = true;
      return !!memo[key];
    }
  }

  var pop = $("#call-pop");
  var popFrom = "idle";
  function openCall(from) {
    if (!pop || pop.open) return;
    if (!pop.showModal) { location.href = "/estimate"; return; }
    popFrom = from;
    sessionFlag("wd-pop", true);
    pop.showModal();
    document.body.style.overflow = "hidden";
    $("#pop-title").focus();   // not the first field: on phones that would throw the keyboard at someone who was just reading
    track("/popup/" + from);
  }

  if (pop) {
    var backdropDown = false;
    $("#pop-close").addEventListener("click", function () { pop.close(); });
    pop.addEventListener("pointerdown", function (e) { backdropDown = e.target === pop; });
    pop.addEventListener("click", function (e) { if (e.target === pop && backdropDown) pop.close(); });
    pop.addEventListener("close", function () { document.body.style.overflow = ""; });

    var callForm = $("#call-form");
    var callStatus = $("#call-status");
    var callSubmit = $("#call-submit");
    callForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($("#c-bot").checked) return;
      var name = $("#c-name").value.trim(), phone = $("#c-phone").value.trim(), email = $("#c-email").value.trim();
      var digits = phone.replace(/\D/g, "");
      var bad = !name ? ["#c-name", "Add your name so we know who we're talking to."]
        : !/^\+?[\d\s()\/.-]+$/.test(phone) || digits.length < 7 || digits.length > 15 ? ["#c-phone", "Add a phone number with the country code, like +49 151 2345678."]
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? ["#c-email", "Add an email address we can reach you at."]
        : !$("#c-consent").checked ? ["#c-consent", "Tick the box so we may call you. Prefer email? Write to " + CONFIG.leadEmail + "."]
        : null;
      if (bad) {
        callStatus.className = "form-status err";
        callStatus.textContent = bad[1];
        $(bad[0]).focus();
        return;
      }
      callSubmit.disabled = true;
      callStatus.className = "form-status";
      callStatus.textContent = "Sending…";
      var source = { from: "popup-" + popFrom };
      carry.forEach(function (kv) {
        var i = kv.indexOf("=");
        try { source[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (err) { /* a broken tag is not worth a lost lead */ }
      });
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "call", name: name, phone: phone, email: email, consent: true, source: source })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && !!j.ok; });
      }).catch(function () { return false; }).then(function (ok) {
        callSubmit.disabled = false;
        if (!ok) {
          callStatus.className = "form-status err";
          callStatus.innerHTML = 'That didn\'t go through. <a id="call-mail">Send it by email instead.</a>';
          $("#call-mail").href = "mailto:" + CONFIG.leadEmail + "?subject=" + encodeURIComponent("Please call me: " + name) +
            "&body=" + encodeURIComponent("Please call me about my app.\n\nName: " + name + "\nPhone: " + phone + "\nEmail: " + email);
          return;
        }
        callForm.hidden = true;
        $("#call-first").textContent = name.split(/\s+/)[0];
        $("#call-phone").textContent = phone;
        var done = $("#call-done");
        done.hidden = false;
        done.focus();
        track("/popup/" + popFrom + "/sent");
        if (!CONFIG.bookingUrl) return;
        $("#call-busy").hidden = false;
        $("#call-pick").addEventListener("click", function () {
          var cal = $("#call-cal");
          $("#call-pick").hidden = true;
          cal.hidden = false;
          pop.classList.add("wide");
          openBooking(cal, name, email, "Phone: " + phone, function () { track("/popup/booked"); });
          track("/popup/pick-time");
        });
      });
    });
  }

  /* The video floater */
  var vfVideo = $("#vf-video");
  var vfOpen = false;
  var vfStarted = false;

  function vfCollapse() {
    vfVideo.pause();
    vfVideo.controls = false;
    vf.classList.remove("open");
    vfOpen = false;
    $("#vf-play").focus();
    onScroll();
  }

  if (vf && CONFIG.vslSrc && !sessionFlag("wd-video")) {
    vfVideo.poster = CONFIG.vslPoster || "";
    vfVideo.src = CONFIG.vslPreview || CONFIG.vslSrc;
    if (CONFIG.vslCaptions) {
      var track_ = document.createElement("track");
      track_.kind = "captions"; track_.srclang = "en"; track_.label = "English"; track_.src = CONFIG.vslCaptions; track_.default = true;
      vfVideo.appendChild(track_);
    }

    /* Small: the preview on a muted loop, unless the visitor asked for less motion or less data */
    var previewOk = !reducedMotion && !(navigator.connection && navigator.connection.saveData);
    vfVideo.addEventListener("timeupdate", function () {
      if (!vfStarted && vfVideo.currentTime > 8) vfVideo.currentTime = 0;
    });
    vfVideo.loop = true;
    window.setTimeout(function () {
      vf.hidden = false;
      onScroll();
      if (!previewOk) return;
      var p = vfVideo.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster and the play button still work */ });
    }, 1200);

    /* Click: from the top with sound the first time, afterwards on from where it stopped */
    $("#vf-play").addEventListener("click", function () {
      vfVideo.muted = false;
      vfVideo.controls = true;
      vfVideo.loop = false;
      if (!vfStarted) {
        vfStarted = true;
        if (CONFIG.vslPreview) vfVideo.src = CONFIG.vslSrc;
        else vfVideo.currentTime = 0;
        track("/video/play");
      }
      vf.classList.add("open");
      vfOpen = true;
      $("#vf-close").focus();
      var p = vfVideo.play();
      if (p && p.catch) p.catch(function () { /* the native controls stay */ });
    });

    /* X: big back to small, small gone for this tab session */
    $("#vf-close").addEventListener("click", function () {
      if (vfOpen) { vfCollapse(); return; }
      vfVideo.pause();
      vf.hidden = true;
      sessionFlag("wd-video", true);
    });
    $("#vf-cta").addEventListener("click", function () {
      if (vfOpen) vfVideo.pause();
      openCall("video");
    });
    vfVideo.addEventListener("ended", function () { if (vfOpen) openCall("video-end"); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    setMenu(false);
    if (vfOpen && !(pop && pop.open)) vfCollapse();
  });

  /* The pop-up: seconds without any input while the hero is on screen */
  var hero = $(".hero");
  var idleMs = (CONFIG.popupIdleSeconds || 0) * 1000;
  if (pop && hero && idleMs && !sessionFlag("wd-pop")) {
    var idleTimer = 0;
    var armIdle = function () {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(function () {
        var busy = pop.open || vfOpen || document.hidden || (menu && menu.classList.contains("open"));
        var inHero = hero.getBoundingClientRect().bottom > window.innerHeight / 2;
        if (!busy && inHero && !sessionFlag("wd-pop")) openCall("idle");   // otherwise the next input starts the clock again
      }, idleMs);
    };
    ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, armIdle, { passive: true });
    });
    document.addEventListener("visibilitychange", armIdle);
    armIdle();
  }
})();
