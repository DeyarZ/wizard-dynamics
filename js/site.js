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
    // Lead delivery: Web3Forms access key (free, emails each lead to leadEmail).
    // Empty → the form falls back to opening a pre-filled email.
    web3formsKey: "",
    // Cal.com / Calendly booking link. When set, the calendar opens inline right after the
    // qualifying questions (name + email prefilled), so "Book a call" really books. Needs a datenschutz update.
    bookingUrl: "",
    leadEmail: "hello@wizarddynamics.com"
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safeGet(key) { try { return window.sessionStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { window.sessionStorage.setItem(key, val); } catch (e) {} }
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Placeholder highlighter: open the page with ?ph */
  if (/[?&]ph\b/.test(location.search)) document.documentElement.classList.add("show-ph");

  var y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Offer bar: dismiss for this session */
  var banner = $("#offer-banner");
  if (banner) {
    if (safeGet("wd-offer-dismissed") === "1") banner.classList.add("hidden");
    var close = $("#offer-close");
    if (close) close.addEventListener("click", function () {
      banner.classList.add("hidden");
      safeSet("wd-offer-dismissed", "1");
    });
  }

  /* Nav rule on scroll + mobile sticky CTA */
  var nav = $("#nav");
  var mobileCta = $("#mobile-cta");
  var heroCta = $(".hero-action .btn");
  var book = $("#book");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", (window.scrollY || window.pageYOffset) > 4);
    if (mobileCta && heroCta && book) {
      var pastHeroCta = heroCta.getBoundingClientRect().bottom < 0;
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
     Lead form
     ------------------------------------------------------------------ */
  var form = $("#lead-form");
  var status = $("#form-status");
  var success = $("#form-success");
  var submitBtn = $("#form-submit");
  if (CONFIG.bookingUrl && submitBtn) submitBtn.textContent = "Next: pick a time";

  function showCalendar(data) {
    var cal = $("#calendar");
    var notes = "Stage: " + (data.stage || "-") + ". Budget: " + (data.budget || "-") + ". " + (data.message || "");
    var url = CONFIG.bookingUrl +
      (CONFIG.bookingUrl.indexOf("?") > -1 ? "&" : "?") +
      "name=" + encodeURIComponent(data.name) +
      "&email=" + encodeURIComponent(data.email) +
      "&notes=" + encodeURIComponent(notes) +
      "&embed=true";
    var f = document.createElement("iframe");
    f.src = url;
    f.title = "Pick a time for your strategy call";
    f.loading = "eager";
    cal.innerHTML = "";
    cal.appendChild(f);
    cal.hidden = false;
    $("#success-title").textContent = "Pick a time";
    $("#success-copy").textContent = "Your details are filled in. Choose a slot that works for you.";
  }

  function showSuccess(data, viaMail) {
    form.style.display = "none";
    success.classList.add("show");
    if (CONFIG.bookingUrl) showCalendar(data);
    else if (viaMail) {
      $("#success-copy").textContent = "Your email app opened with everything filled in. Send it and we'll reply within 24 hours.";
    }
    success.focus();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data.botcheck) return;

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "");
      if (!data.name || !emailOk) {
        status.className = "form-status err";
        status.textContent = !data.name ? "Add your name so we know who we're talking to." : "Add an email address we can reply to.";
        (!data.name ? $("#f-name") : $("#f-email")).focus();
        return;
      }

      var summary =
        "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Stage: " + (data.stage || "-") + "\n" +
        "Budget: " + (data.budget || "-") + "\n\n" +
        (data.message || "");

      if (!CONFIG.web3formsKey) {
        // With a booking link the calendar itself captures the lead; otherwise fall back to email.
        if (!CONFIG.bookingUrl) {
          window.location.href = "mailto:" + CONFIG.leadEmail +
            "?subject=" + encodeURIComponent("Strategy call request: " + data.name) +
            "&body=" + encodeURIComponent(summary);
        }
        showSuccess(data, !CONFIG.bookingUrl);
        return;
      }

      var btn = $("button[type=submit]", form);
      btn.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending…";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: CONFIG.web3formsKey,
          subject: "New strategy call request: " + data.name + " (" + (data.stage || "") + ", " + (data.budget || "") + ")",
          from_name: "wizarddynamics.com",
          name: data.name,
          email: data.email,
          stage: data.stage,
          budget: data.budget,
          message: data.message || ""
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          btn.disabled = false;
          if (j && j.success) { status.textContent = ""; showSuccess(data, false); }
          else {
            status.className = "form-status err";
            status.textContent = "The request didn't go through. Email us at " + CONFIG.leadEmail + " instead.";
          }
        })
        .catch(function () {
          btn.disabled = false;
          status.className = "form-status err";
          status.textContent = "No connection. Email us at " + CONFIG.leadEmail + " instead.";
        });
    });
  }
})();
