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
    leadEmail: "hello@wizarddynamics.com",
    // Free blueprint calls per week (offer bar, offer, booking section, mobile bar).
    // spotsLeft: null -> "Only 5 spots a week" (always true while you cap at 5).
    // spotsLeft: 3    -> "3 of 5 spots left this week". Only set it if you update it as calls get booked:
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

  /* Weekly blueprint spots + countdown to Sunday 23:59 */
  var total = CONFIG.spotsTotal, left = CONFIG.spotsLeft;
  var hasLeft = typeof left === "number";
  var spotsCopy = {
    bar: hasLeft
      ? "<b>" + left + "</b> of " + total + ' spots left<span class="hide-sm"> this week</span>'
      : "Only <b>" + total + "</b> spots a week",
    long: hasLeft ? left + " of " + total + " spots left this week." : "Only " + total + " blueprint calls a week.",
    mobile: hasLeft ? "<b>" + left + "</b> of " + total + " spots left" : "<b>" + total + "</b> spots a week"
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

  /* The form asks a build budget for ideas and the current revenue for live apps (the retainer buyer) */
  var STAGE_FORMS = {
    build: { label: "Budget for the app", button: "Get my free blueprint", msg: "What are you building?",
             options: ["Under \u20ac25k", "\u20ac25k to \u20ac60k", "\u20ac60k or more", "Monthly growth retainer", "Not sure yet"] },
    live: { label: "Monthly revenue today", button: "Get my free audit", msg: "Link to your app",
            options: ["Pre-revenue", "Under $1k", "$1k to $10k", "Over $10k"] }
  };
  var currentStageForm = "build";
  function syncStage() {
    var checked = $('#lead-form input[name="stage"]:checked');
    var key = checked && checked.value === "Live app" ? "live" : "build";
    if (key === currentStageForm) return;
    currentStageForm = key;
    var cfg = STAGE_FORMS[key];
    var sel = $("#f-budget"), label = $("#f-budget-label"), btn = $("#form-submit");
    if (label) label.textContent = cfg.label;
    var msgLabel = $("#f-msg-label");
    if (msgLabel) msgLabel.textContent = cfg.msg;
    if (sel) {
      sel.innerHTML = '<option value="" selected disabled>Choose a range</option>' +
        cfg.options.map(function (o) { return "<option>" + o + "</option>"; }).join("");
    }
    if (btn && !CONFIG.bookingUrl) btn.textContent = cfg.button;
  }
  $$('#lead-form input[name="stage"]').forEach(function (r) { r.addEventListener("change", syncStage); });

  /* Links like "Already live? Get a free App Audit" preselect the stage in the form */
  $$("a[data-stage]").forEach(function (a) {
    a.addEventListener("click", function () {
      var radio = $('#lead-form input[name="stage"][value="' + a.getAttribute("data-stage") + '"]');
      if (radio) { radio.checked = true; syncStage(); }
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
     Lead form
     ------------------------------------------------------------------ */
  var form = $("#lead-form");
  var status = $("#form-status");
  var success = $("#form-success");
  var submitBtn = $("#form-submit");
  if (CONFIG.bookingUrl && submitBtn) {
    submitBtn.textContent = "Pick my call time";
    var lead = $("#book-lead");
    if (lead) lead.textContent = "Answer four quick questions, then pick a time for your 30-minute blueprint call.";
    var foot = $(".form-foot");
    if (foot) foot.textContent = "Next screen: pick a 30-minute slot. No newsletter, no sales sequence.";
  }

  function showCalendar(data) {
    var cal = $("#calendar");
    var notes = "Stage: " + (data.stage || "-") + ". " + STAGE_FORMS[currentStageForm].label + ": " + (data.budget || "-") + ". " + (data.message || "");
    var url = CONFIG.bookingUrl +
      (CONFIG.bookingUrl.indexOf("?") > -1 ? "&" : "?") +
      "name=" + encodeURIComponent(data.name) +
      "&email=" + encodeURIComponent(data.email) +
      "&notes=" + encodeURIComponent(notes) +
      "&embed=true";
    var f = document.createElement("iframe");
    f.src = url;
    f.title = "Pick a time for your blueprint call";
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
      $("#success-title").textContent = "One more step: send the email";
      $("#success-copy").innerHTML = "Your email app should have opened with everything filled in. Press send and we'll reply within 24 hours. If nothing opened, write to <a href=\"mailto:" + CONFIG.leadEmail + "\">" + CONFIG.leadEmail + "</a> with your name and what you're building.";
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
      if (!data.name || !emailOk || !data.budget) {
        status.className = "form-status err";
        status.textContent = !data.name ? "Add your name so we know who we're talking to."
          : !emailOk ? "Add an email address we can reply to."
          : "Pick a range, so we can prepare the right plan.";
        (!data.name ? $("#f-name") : !emailOk ? $("#f-email") : $("#f-budget")).focus();
        return;
      }

      var summary =
        "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Stage: " + (data.stage || "-") + "\n" +
        STAGE_FORMS[currentStageForm].label + ": " + (data.budget || "-") + "\n\n" +
        (data.message || "");

      if (!CONFIG.web3formsKey) {
        // With a booking link the calendar itself captures the lead; otherwise fall back to email.
        if (!CONFIG.bookingUrl) {
          window.location.href = "mailto:" + CONFIG.leadEmail +
            "?subject=" + encodeURIComponent("Free blueprint request: " + data.name) +
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
          subject: "New free blueprint request: " + data.name + " (" + (data.stage || "") + ", " + (data.budget || "") + ")",
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
