/* DRAFT testimonials: invented layout placeholders the founder asked for.
   Loaded only on preview hosts (see the inline script in index.html's <head>), never on wizarddynamics.com,
   so the invented names are not in the production HTML.
   When a real quote exists: put it straight into #reviews .quotes in index.html (full name, app, photo,
   one number), remove "draft-only" from the section and delete this file. */
(function () {
  "use strict";
  var star = '<svg><use href="#i-star"/></svg>';
  var stars = '<span class="stars" aria-label="5 out of 5 stars">' + star + star + star + star + star + "</span>";
  var quotes = [
    ["We had 30,000 downloads and almost no revenue. They rebuilt our onboarding and paywall, and trial starts tripled within a month.", "LH", "Lena Hoffmann", "Founder of a habit tracker, Berlin"],
    ["They cut half of our feature list on the first call, and they were right. We launched in nine weeks and had paying subscribers in the first week.", "MB", "Marco Bianchi", "Co-founder of a language app, Milan"],
    ["Other agencies hand you code and disappear. These guys handed us a business: keywords, paywall, ads and the numbers behind all of it.", "DW", "Daniel Weber", "Founder of a fitness app, Zurich"]
  ];
  function render() {
    var box = document.querySelector("#reviews .quotes");
    if (!box || box.children.length) return;
    box.innerHTML = quotes.map(function (q) {
      return '<figure class="quote" data-ph="testimonial">' + stars +
        "<blockquote>“" + q[0] + "”</blockquote>" +
        '<figcaption><span class="avatar" aria-hidden="true">' + q[1] + "</span><span><b>" + q[2] + "</b>" + q[3] + "</span></figcaption></figure>";
    }).join("");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
