/* ============================================================
   Wizard Dynamics // islands-site
   Scroll-driven canvas + choreographed section animations
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 226;
const FRAME_PATH = (i) => `frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
const FRAME_SPEED = 2.0;   // product animation finishes by ~50% scroll
const IMAGE_SCALE = 1.0;   // full cover — no padded border
const EAGER_COUNT = 12;    // frames to load before first paint

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWrap = document.querySelector(".canvas-wrap");
const heroSection = document.querySelector(".hero-standalone");
const scrollContainer = document.getElementById("scroll-container");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");
const loaderCount = document.getElementById("loader-count");
const darkOverlay = document.getElementById("dark-overlay");

const frames = new Array(FRAME_COUNT);
let framesReady = 0;
let currentFrame = -1;
let bgColor = "#0a0907";

/* ----------------------------------------------------------
   1. Lenis smooth scroll
   ---------------------------------------------------------- */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ----------------------------------------------------------
   2. Canvas sizing (devicePixelRatio-aware)
   ---------------------------------------------------------- */
function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeCanvas();
window.addEventListener("resize", () => {
  sizeCanvas();
  if (currentFrame >= 0) drawFrame(currentFrame);
  ScrollTrigger.refresh();
});

/* ----------------------------------------------------------
   3. Frame loading — two-phase
   ---------------------------------------------------------- */
function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      frames[i] = img;
      framesReady++;
      const pct = Math.floor((framesReady / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + "%";
      loaderPercent.textContent = pct + "%";
      loaderCount.textContent = framesReady;
      resolve();
    };
    img.onerror = () => { framesReady++; resolve(); };
    img.src = FRAME_PATH(i);
  });
}

async function preload() {
  // Phase 1: load first EAGER_COUNT frames in parallel
  const eagerIds = Array.from({ length: EAGER_COUNT }, (_, i) => i);
  await Promise.all(eagerIds.map(loadFrame));
  sampleBgColor(frames[0]);
  drawFrame(0);

  // Phase 2: load remaining frames (bounded parallelism)
  const remaining = [];
  for (let i = EAGER_COUNT; i < FRAME_COUNT; i++) remaining.push(i);

  const CONCURRENCY = 6;
  const queue = remaining.slice();
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const id = queue.shift();
      await loadFrame(id);
    }
  });
  await Promise.all(workers);

  // Hide loader
  setTimeout(() => {
    loader.classList.add("hidden");
    ScrollTrigger.refresh();
  }, 300);
}

/* ----------------------------------------------------------
   4. Background color sampling (fills padded border)
   ---------------------------------------------------------- */
function sampleBgColor(img) {
  if (!img) return;
  const off = document.createElement("canvas");
  off.width = 16; off.height = 16;
  const octx = off.getContext("2d", { willReadFrequently: true });
  try {
    octx.drawImage(img, 0, 0, 16, 16);
    const data = octx.getImageData(0, 0, 16, 16).data;
    // sample the 4 corner pixels only (edge samples)
    const pickIdx = [0, (15) * 4, (16 * 15) * 4, (16 * 15 + 15) * 4];
    let r = 0, g = 0, b = 0;
    pickIdx.forEach((i) => { r += data[i]; g += data[i + 1]; b += data[i + 2]; });
    r = Math.floor(r / 4); g = Math.floor(g / 4); b = Math.floor(b / 4);
    bgColor = `rgb(${r},${g},${b})`;
  } catch (_) {
    bgColor = "#0a0907";
  }
}

/* ----------------------------------------------------------
   5. Canvas renderer — padded cover
   ---------------------------------------------------------- */
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;
  const cw = canvas.width / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ----------------------------------------------------------
   6. Frame-to-scroll binding
   ---------------------------------------------------------- */
let bgSampleCounter = 0;
ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
    const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
    if (index !== currentFrame) {
      currentFrame = index;
      // re-sample bg every ~20 frames for smoother edges across scene changes
      if (++bgSampleCounter % 20 === 0 && frames[index]) sampleBgColor(frames[index]);
      requestAnimationFrame(() => drawFrame(currentFrame));
    }
  },
});

/* ----------------------------------------------------------
   7. Hero text fade on scroll (canvas stays full-cover throughout)
   ---------------------------------------------------------- */
ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    heroSection.style.opacity = Math.max(0, 1 - p * 15);
    heroSection.style.pointerEvents = p > 0.05 ? "none" : "auto";
  },
});

/* ----------------------------------------------------------
   8. Dark overlay (fades in for stats section)
   ---------------------------------------------------------- */
function initDarkOverlay() {
  const fade = 0.04;
  const ranges = [
    { enter: 0.64, leave: 0.76, peak: 0.92 },
  ];
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let opacity = 0;
      for (const r of ranges) {
        if (p >= r.enter - fade && p <= r.enter) {
          opacity = Math.max(opacity, ((p - (r.enter - fade)) / fade) * r.peak);
        } else if (p > r.enter && p < r.leave) {
          opacity = Math.max(opacity, r.peak);
        } else if (p >= r.leave && p <= r.leave + fade) {
          opacity = Math.max(opacity, r.peak * (1 - (p - r.leave) / fade));
        }
      }
      darkOverlay.style.opacity = opacity;
    },
  });
}

/* ----------------------------------------------------------
   9. Section choreography
   ---------------------------------------------------------- */
function setupSectionAnimation(section) {
  const type = section.dataset.animation;
  const persist = section.dataset.persist === "true";
  const enter = parseFloat(section.dataset.enter) / 100;
  const leave = parseFloat(section.dataset.leave) / 100;

  // Absolute-position the section at the midpoint of its enter/leave range
  const mid = (enter + leave) / 2;
  section.style.top = `${mid * 100}%`;

  const children = section.querySelectorAll(
    ".section-label, .section-heading, .section-body, .section-note, .stats-label, .stat, .cta-button, .app-list li"
  );

  const tl = gsap.timeline({ paused: true });

  switch (type) {
    case "fade-up":
      tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" });
      break;
    case "slide-left":
      tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" });
      break;
    case "slide-right":
      tl.from(children, { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" });
      break;
    case "scale-up":
      tl.from(children, { scale: 0.88, opacity: 0, stagger: 0.1, duration: 1.0, ease: "power2.out", transformOrigin: "left center" });
      break;
    case "rotate-in":
      tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" });
      break;
    case "stagger-up":
      tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" });
      break;
    case "clip-reveal":
      gsap.set(children, { clipPath: "inset(100% 0 0 0)", opacity: 0 });
      tl.to(children, { clipPath: "inset(0% 0 0 0)", opacity: 1, stagger: 0.14, duration: 1.1, ease: "power4.inOut" });
      break;
  }

  let played = false;
  const fadePad = 0.02;
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      if (p >= enter && p <= leave) {
        if (!played) { tl.play(); played = true; }
        // Fade out near the leave edge
        if (!persist) {
          const tailStart = leave - fadePad;
          if (p > tailStart) {
            section.style.opacity = 1 - (p - tailStart) / fadePad;
          } else {
            section.style.opacity = 1;
          }
        } else {
          section.style.opacity = 1;
        }
      } else if (p > leave) {
        if (persist) {
          section.style.opacity = 1;
        } else {
          section.style.opacity = 0;
        }
      } else {
        // Before enter: hidden + timeline reset
        if (played && !persist) {
          tl.progress(0).pause();
          played = false;
        }
        section.style.opacity = 0;
      }
    },
  });
}

document.querySelectorAll(".scroll-section").forEach(setupSectionAnimation);

/* ----------------------------------------------------------
   10. Counter animations
   ---------------------------------------------------------- */
document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseFloat(el.dataset.value);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const obj = { val: 0 };
  const section = el.closest(".scroll-section");
  const enter = parseFloat(section.dataset.enter) / 100;
  let fired = false;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      if (self.progress >= enter && !fired) {
        fired = true;
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = obj.val.toFixed(decimals);
          },
        });
      } else if (self.progress < enter - 0.02 && fired) {
        fired = false;
        obj.val = 0;
        el.textContent = (0).toFixed(decimals);
      }
    },
  });
});

/* ----------------------------------------------------------
   11. Horizontal text marquee
   ---------------------------------------------------------- */
document.querySelectorAll(".marquee-wrap").forEach((wrap) => {
  const speed = parseFloat(wrap.dataset.scrollSpeed) || -30;
  const enter = parseFloat(wrap.dataset.enter) || 0.1;
  const leave = parseFloat(wrap.dataset.leave) || 0.9;
  const text = wrap.querySelector(".marquee-text");

  gsap.to(text, {
    xPercent: speed,
    ease: "none",
    scrollTrigger: {
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  // Fade marquee in/out based on scroll range
  const fade = 0.04;
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let opacity = 0;
      if (p >= enter - fade && p < enter) {
        opacity = (p - (enter - fade)) / fade;
      } else if (p >= enter && p <= leave) {
        opacity = 1;
      } else if (p > leave && p < leave + fade) {
        opacity = 1 - (p - leave) / fade;
      }
      wrap.style.opacity = opacity;
    },
  });
});

/* ----------------------------------------------------------
   12. Kick it off
   ---------------------------------------------------------- */
initDarkOverlay();
preload();
