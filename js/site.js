/* Wizard Dynamics — landing interactions. Vanilla, no dependencies. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG — fill these in, nothing else needs to change.
     ------------------------------------------------------------------ */
  var CONFIG = {
    // VSL: a YouTube/Vimeo embed URL (https://www.youtube.com/embed/ID) or a direct .mp4 path.
    // Empty → the play button opens a "coming soon" card that pushes to the booking form.
    vslUrl: "",
    // Lead delivery: Web3Forms access key (free, emails each lead to hello@wizarddynamics.com).
    // Empty → the form falls back to opening a pre-filled email.
    web3formsKey: "",
    // Booking link shown after the form is submitted (Cal.com / Calendly). Empty → hidden.
    bookingUrl: "",
    leadEmail: "hello@wizarddynamics.com"
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function safeGet(store, key) { try { return window[store].getItem(key); } catch (e) { return null; } }
  function safeSet(store, key, val) { try { window[store].setItem(key, val); } catch (e) {} }

  /* Placeholder highlighter: open the page with ?ph */
  if (/[?&]ph\b/.test(location.search)) document.documentElement.classList.add("show-ph");

  /* Year */
  var y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Offer banner — dismiss for this session */
  var banner = $("#offer-banner");
  if (banner) {
    if (safeGet("sessionStorage", "wd-offer-dismissed") === "1") banner.classList.add("hidden");
    var close = $("#offer-close");
    if (close) close.addEventListener("click", function () {
      banner.classList.add("hidden");
      safeSet("sessionStorage", "wd-offer-dismissed", "1");
    });
  }

  /* Nav: glass on scroll */
  var nav = $("#nav");
  var floatCta = $("#float-cta");
  var mobileCta = $("#mobile-cta");
  var hero = $(".hero");
  var book = $("#book");

  function onScroll() {
    var sy = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("scrolled", sy > 8);
    if (hero && book) {
      var pastHero = hero.getBoundingClientRect().bottom < 80;
      var bookRect = book.getBoundingClientRect();
      var atBook = bookRect.top < window.innerHeight * 0.75 && bookRect.bottom > 0;
      var show = pastHero && !atBook;
      if (floatCta) floatCta.classList.toggle("show", show);
      if (mobileCta) mobileCta.classList.toggle("show", show);
    }
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
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

  /* Reveal on scroll */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Count-up stats */
  function formatNum(v, el) {
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var s = v.toFixed(dec);
    if (el.getAttribute("data-format") === "comma") s = Number(s).toLocaleString("en-US");
    return s;
  }
  var counters = $$("[data-count]");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Final values stay in the HTML (crawlers, link previews, no-JS); the count-up
  // starts the moment a number first enters the viewport.
  if ("IntersectionObserver" in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        cio.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var start = null;
        var dur = 1400;
        function step(t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = formatNum(target * eased, el);
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = formatNum(0, el);
        requestAnimationFrame(step);
      });
    }, { threshold: 0 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* FAQ: one open at a time */
  var faqs = $$(".faq-list details");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* Video modal (VSL + video testimonials) */
  var modal = $("#video-modal");
  var box = $("#modal-box");
  var empty = $("#modal-empty");
  var lastFocus = null;

  function embedFor(url) {
    if (!url) return null;
    if (/\.mp4(\?|$)/i.test(url)) {
      var v = document.createElement("video");
      v.src = url; v.controls = true; v.autoplay = true; v.playsInline = true;
      return v;
    }
    var f = document.createElement("iframe");
    f.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "autoplay=1&rel=0";
    f.allow = "autoplay; fullscreen; picture-in-picture";
    f.allowFullscreen = true;
    f.title = "Video";
    return f;
  }
  function openModal(url) {
    if (!modal) return;
    lastFocus = document.activeElement;
    var media = embedFor(url);
    if (media) { empty.style.display = "none"; media.className = "modal-media"; box.appendChild(media); }
    else { empty.style.display = ""; }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    $("#modal-close").focus();
  }
  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    var m = $(".modal-media", box);
    if (m) m.remove();
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  var vsl = $("#vsl");
  if (vsl) vsl.addEventListener("click", function () { openModal(CONFIG.vslUrl); });
  $$("[data-video]").forEach(function (b) {
    b.addEventListener("click", function () { openModal(b.getAttribute("data-video")); });
  });
  if (modal) {
    $("#modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    $("#modal-cta").addEventListener("click", closeModal);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); setMenu(false); }
  });

  /* Lead form */
  var form = $("#lead-form");
  var status = $("#form-status");
  var success = $("#form-success");

  function showSuccess(viaMail) {
    form.style.display = "none";
    success.classList.add("show");
    if (viaMail) {
      $("#success-copy").textContent = "Your email app should have opened with everything pre-filled — just hit send. We reply within 24 hours.";
    }
    var b = $("#success-book");
    if (CONFIG.bookingUrl && b) { b.href = CONFIG.bookingUrl; b.style.display = "inline-flex"; }
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
        status.textContent = !data.name ? "Please add your name." : "Please add a valid email address.";
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
        var subject = "Strategy call request — " + data.name;
        window.location.href = "mailto:" + CONFIG.leadEmail +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(summary);
        showSuccess(true);
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
          subject: "New strategy call request — " + data.name + " (" + (data.stage || "") + ", " + (data.budget || "") + ")",
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
          if (j && j.success) { status.textContent = ""; showSuccess(false); }
          else {
            status.className = "form-status err";
            status.textContent = "Something went wrong — email us at " + CONFIG.leadEmail;
          }
        })
        .catch(function () {
          btn.disabled = false;
          status.className = "form-status err";
          status.textContent = "Network error — email us at " + CONFIG.leadEmail;
        });
    });
  }
})();
