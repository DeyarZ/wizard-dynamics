/* Wizard Dynamics — hero: the Moon (globe.gl) + a sleek high-tech craft that
   performs a clean landing near Tranquility Base.
   Moon textures: NASA LROC (public domain), stored locally in img/.
   three is pinned via esm.sh so the rocket shares globe.gl's instance. */
import * as THREE from "https://esm.sh/three@0.180.0";
import Globe from "https://esm.sh/globe.gl@2.34.5?deps=three@0.180.0";

const el = document.getElementById("globe");

if (el) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // landing site — right next to Apollo 11. Möchtegern-gelandet.
  const SITE = { lat: 4.2, lng: 22.3 };
  const ZONES = [
    { lat: 28, lng: 14, name: "LZ-01 /// APPS" },
    { lat: 12, lng: 56, name: "LZ-02 /// CONSULTING" },
    { lat: -16, lng: 42, name: "LZ-03 /// CONSTRUCTION" },
    { lat: -24, lng: 2, name: "LZ-04 /// COMMUNITY" }
  ];
  const LANDED_LABEL = { lat: SITE.lat - 6, lng: SITE.lng + 10, name: "WIZARD DYNAMICS /// LANDED", main: true };

  const wrap = el.parentElement;
  let size = Math.floor(wrap.getBoundingClientRect().width);

  const world = new Globe(el, { animateIn: false, rendererConfig: { antialias: true, alpha: true } })
    .width(size)
    .height(size)
    .backgroundColor("rgba(0,0,0,0)")
    .globeImageUrl("img/moon-surface.jpg")
    .bumpImageUrl("img/moon-bump.jpg")
    .showAtmosphere(true)
    .atmosphereColor("#d4a24a")
    .atmosphereAltitude(0.06)
    .labelsData(ZONES)
    .labelText("name")
    .labelSize((d) => (d.main ? 4.4 : 3.0))
    .labelDotRadius((d) => (d.main ? 1.1 : 0.75))
    .labelColor((d) => (d.main ? "rgba(255, 196, 92, 1)" : "rgba(255, 182, 70, 0.98)"))
    .labelAltitude(0.012)
    .labelResolution(3)
    .ringColor(() => (t) => `rgba(232, 184, 98, ${(0.6 * (1 - t)).toFixed(3)})`)
    .ringMaxRadius(5)
    .ringPropagationSpeed(2.2)
    .ringRepeatPeriod(900);

  // camera sits south of the site so the craft lands high on the disc, but
  // zoomed out far enough that the landed rocket (incl. nose spike) stays
  // inside the square canvas — front-center and out at the limb while rotating
  world.pointOfView({ lat: -30, lng: 20, altitude: 2.5 });

  // tone the moon down & warm it up so the gold labels pop
  world.globeMaterial().color.set(0xa89f92);

  const controls = world.controls();
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.35;
  controls.enableZoom = false;
  controls.enablePan = false;

  // warm key light so the hull picks up the gold CI
  const warm = new THREE.DirectionalLight(0xe8b862, 0.55);
  warm.position.set(120, 60, 180);
  world.scene().add(warm);

  // fill light riding with the camera so the rocket hull stays lit
  const fill = new THREE.DirectionalLight(0xfff2d8, 1.3);
  world.scene().add(fill);

  /* ---------- Craft (high-tech: graphite hull, glowing gold lettering,
     seamless ogive nose, light strips, blade fins, legs, engine glow) ---------- */

  // hull texture doubles as emissive map: dark panels stay dark, the gold
  // lettering and trim glow. Painted three times around the circumference.
  function makeHullTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 2048;
    const x = c.getContext("2d");
    x.fillStyle = "#191a20";
    x.fillRect(0, 0, c.width, c.height);
    // panel grid
    x.strokeStyle = "rgba(255,255,255,0.055)";
    x.lineWidth = 2;
    for (let i = 0; i <= 9; i++) {
      x.beginPath();
      x.moveTo((i * c.width) / 9, 0);
      x.lineTo((i * c.width) / 9, c.height);
      x.stroke();
    }
    for (let j = 0; j <= 18; j++) {
      x.beginPath();
      x.moveTo(0, (j * c.height) / 18);
      x.lineTo(c.width, (j * c.height) / 18);
      x.stroke();
    }
    // glowing gold lettering down the hull
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "700 138px 'JetBrains Mono', 'Archivo', Arial, sans-serif";
    x.fillStyle = "#f4c876";
    x.shadowColor = "rgba(232, 184, 98, 0.9)";
    x.shadowBlur = 26;
    [170, 512, 854].forEach((cx) => {
      x.save();
      x.translate(cx, c.height / 2);
      x.rotate(Math.PI / 2);
      x.fillText("WIZARD DYNAMICS", 0, 0);
      x.restore();
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  function buildRocket() {
    const g = new THREE.Group();

    const graphite = new THREE.MeshStandardMaterial({ color: 0x1c1d23, metalness: 0.9, roughness: 0.35 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x101014, metalness: 0.8, roughness: 0.4 });

    const tex = makeHullTexture();
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, map: tex,
      emissiveMap: tex, emissive: new THREE.Color(0xd9a355), emissiveIntensity: 0.85,
      metalness: 0.85, roughness: 0.42
    });

    // engine skirt
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.08, 0.7, 32), dark);
    skirt.position.y = 0.35;
    g.add(skirt);

    // main hull with lettering
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.98, 6.2, 32), hullMat);
    body.position.y = 3.8;
    g.add(body);

    // glowing trim ring hides the body/nose joint
    const mkGlowMat = (color, opacity) => new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.955, 0.045, 10, 40), mkGlowMat(0xe8b862, 0.9));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 6.92;
    g.add(ring);

    // seamless ogive nose (lathe profile → sharp tip, no cut-off)
    const prof = [
      [0.95, 0], [0.93, 0.5], [0.87, 1.1], [0.76, 1.7],
      [0.6, 2.3], [0.42, 2.8], [0.22, 3.2], [0.0, 3.5]
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const nose = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), graphite);
    nose.position.y = 6.9;
    g.add(nose);

    // antenna spike + pulsing nav light at the tip
    const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.65, 8), dark);
    spike.position.y = 10.6;
    g.add(spike);
    const nav = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), mkGlowMat(0xffe2ae, 0.95));
    nav.position.y = 10.98;
    g.add(nav);

    // two glowing raceway strips up the hull (offset from the lettering)
    [1, -1].forEach((s) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 5.6, 0.045), mkGlowMat(0xdca45c, 0.55));
      const a = s * (Math.PI / 3);
      strip.position.set(Math.sin(a) * 0.965, 3.8, Math.cos(a) * 0.965);
      strip.rotation.y = a;
      g.add(strip);
    });

    // three swept blade fins
    const finGeo = new THREE.BoxGeometry(0.05, 2.6, 1.05);
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 + Math.PI / 6;
      const fin = new THREE.Mesh(finGeo, graphite);
      fin.position.set(Math.sin(a) * 1.28, 1.15, Math.cos(a) * 1.28);
      fin.rotation.y = a;
      fin.rotation.z = Math.sin(a) * 0.34;
      fin.rotation.x = -Math.cos(a) * 0.34;
      g.add(fin);
    }

    // four landing legs with pads
    const legGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.7, 8);
    const padGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.09, 12);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new THREE.Mesh(legGeo, dark);
      leg.position.set(Math.sin(a) * 1.25, 0.62, Math.cos(a) * 1.25);
      leg.rotation.z = Math.sin(a) * 0.62;
      leg.rotation.x = -Math.cos(a) * 0.62;
      g.add(leg);
      const pad = new THREE.Mesh(padGeo, dark);
      pad.position.set(Math.sin(a) * 1.78, 0.02, Math.cos(a) * 1.78);
      g.add(pad);
    }

    // engine bells + glow ring underneath
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.5, 14, 1, true), dark);
      bell.position.set(Math.sin(a) * 0.42, -0.05, Math.cos(a) * 0.42);
      g.add(bell);
    }
    const engineRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 10, 32), mkGlowMat(0xff9a3d, 0));
    engineRing.rotation.x = Math.PI / 2;
    engineRing.position.y = -0.12;
    g.add(engineRing);

    /* fire — layered cones + particle plume */
    const outer = new THREE.Mesh(new THREE.ConeGeometry(1.05, 5.8, 18), mkGlowMat(0xff7a2d, 0.4));
    outer.rotation.x = Math.PI;
    outer.position.y = -3.2;
    g.add(outer);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.66, 4.4, 18), mkGlowMat(0xffb75e, 0.75));
    flame.rotation.x = Math.PI;
    flame.position.y = -2.5;
    g.add(flame);
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.7, 14), mkGlowMat(0xfff6e0, 0.95));
    core.rotation.x = Math.PI;
    core.position.y = -1.6;
    g.add(core);

    // exhaust particles
    const P = 90;
    const pPos = new Float32Array(P * 3);
    const pVel = [];
    for (let i = 0; i < P; i++) {
      pPos.set([0, -0.4, 0], i * 3);
      pVel.push({ vx: 0, vy: 0, vz: 0, age: Math.random(), life: 0.001 });
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const sc = document.createElement("canvas");
    sc.width = sc.height = 64;
    const sx = sc.getContext("2d");
    const grad = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,240,214,1)");
    grad.addColorStop(0.35, "rgba(255,183,94,0.8)");
    grad.addColorStop(1, "rgba(255,122,45,0)");
    sx.fillStyle = grad;
    sx.fillRect(0, 0, 64, 64);
    const pMat = new THREE.PointsMaterial({
      size: 5.5, map: new THREE.CanvasTexture(sc), transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, color: 0xffc98a
    });
    const plume = new THREE.Points(pGeo, pMat);
    plume.frustumCulled = false;
    g.add(plume);

    const light = new THREE.PointLight(0xffa54d, 0, 120);
    light.position.y = -1.6;
    g.add(light);

    g.userData = { outer, flame, core, light, engineRing, nav, plume, pPos, pVel, pGeo };
    g.scale.setScalar(5.5);
    return g;
  }

  const rocket = buildRocket();
  rocket.visible = false; // hidden until the fly-by intro hands over
  world.scene().add(rocket);

  /* ---------- Intro show: the craft crosses the whole page, huge and close,
     then flies down and lands — flight AND descent both render in the same
     fullscreen overlay, so the rocket is never clipped by the globe canvas
     and the whole show plays as one continuous move. Only at touchdown does
     the globe rocket take over, in the exact same pose. ---------- */
  function runIntro() {
    const ic = document.createElement("canvas");
    Object.assign(ic.style, {
      position: "fixed", inset: "0", width: "100vw", height: "100vh",
      zIndex: "90", pointerEvents: "none"
    });
    document.body.appendChild(ic);
    const renderer = new THREE.WebGLRenderer({ canvas: ic, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
    scene.add(new THREE.AmbientLight(0xfff2d8, 0.5));
    const key = new THREE.DirectionalLight(0xfff2d8, 2.2);
    key.position.set(2, 3, 4);
    scene.add(key);

    const craft = buildRocket();
    craft.scale.setScalar(1);
    scene.add(craft);

    // unproject an NDC point to a world position at a given distance
    const ndcAt = (nx, ny, dist) =>
      new THREE.Vector3(nx, ny, 0.5).unproject(cam).normalize().multiplyScalar(dist);

    // mirror a globe-scene point (lat/lng/alt) into the overlay: same screen
    // position, same apparent size (globe craft is scale 5.5, ours is 1)
    const kO = (window.innerHeight / 2) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const kG = (el.clientHeight / 2) / Math.tan(THREE.MathUtils.degToRad(world.camera().fov / 2));
    const _gv = new THREE.Vector3();
    function overlayPos(lat, lng, alt, out) {
      const gPos = world.getCoords(lat, lng, alt);
      const dG = world.camera().position.distanceTo(_gv.set(gPos.x, gPos.y, gPos.z));
      const scr = world.getScreenCoords(lat, lng, alt);
      const gRect = el.getBoundingClientRect();
      const nx = ((gRect.left + scr.x) / window.innerWidth) * 2 - 1;
      const ny = -(((gRect.top + scr.y) / window.innerHeight) * 2 - 1);
      return out.copy(ndcAt(nx, ny, (kO * dG) / (5.5 * kG)));
    }

    // flight path: bottom-left, close & huge → arcs up → descent start point
    const C = overlayPos(SITE.lat + 3, SITE.lng - 16, 0.7, new THREE.Vector3());
    const A = ndcAt(-0.9, -0.75, 9);
    const B = ndcAt(-0.15, 0.5, Math.min(28, C.length() * 0.5)); // arcs up over the headline
    const bez = (t, a, b, c) => {
      const s = 1 - t;
      return a.clone().multiplyScalar(s * s)
        .add(b.clone().multiplyScalar(2 * s * t))
        .add(c.clone().multiplyScalar(t * t));
    };

    const FLIGHT = 5400;
    // slow start (readable close-up), then accelerate straight into the
    // descent — speed never drops to zero, so flight + landing read as one move
    const easeIn = (t) => t * t;
    const start = performance.now();
    let done = false;
    const dir = new THREE.Vector3();
    const lean = new THREE.Vector3();
    const iv = new THREE.Vector3();
    const iq = new THREE.Quaternion();
    const qEnd = new THREE.Quaternion();
    const qTarget = new THREE.Quaternion();
    const pv = new THREE.Vector3();

    function frame(t) {
      if (done) return;
      requestAnimationFrame(frame);
      const ms = t - start;
      if (ms < FLIGHT) {
        const e = easeIn(Math.min(1, ms / FLIGHT));
        const pos = bez(e, A, B, C);
        const ahead = bez(Math.min(1, e + 0.02), A, B, C);
        craft.position.copy(pos);
        // nose mostly up, leaning gently into the direction of travel
        dir.copy(ahead).sub(pos).normalize();
        lean.set(dir.x * 0.45, 1, dir.z * 0.45).normalize();
        craft.quaternion.setFromUnitVectors(UP, lean);
        // roll so the hull lettering faces the viewer head-on, every frame
        iv.copy(cam.position).sub(craft.position);
        iv.applyQuaternion(iq.copy(craft.quaternion).invert());
        craft.rotateY(Math.atan2(iv.x, iv.z) + Math.PI);
        qEnd.copy(craft.quaternion); // pose to blend from once the descent takes over
        setThrottle(0.8 + Math.random() * 0.2, t, false, craft);
        updatePlume(1 / 60, 0.9, craft);
      } else {
        const p = Math.min(1, (ms - FLIGHT) / DESCENT);
        const e = easeOutQuart(p);
        const lat = SITE.lat + 3 * (1 - e);
        const lng = SITE.lng - 16 * (1 - e);
        const alt = 0.7 * (1 - e);
        // pose the (still hidden) globe rocket, then mirror it into the overlay
        placeRocket(lat, lng, alt);
        craft.position.copy(overlayPos(lat, lng, alt, pv));
        qTarget.copy(world.camera().quaternion).invert().multiply(rocket.quaternion);
        craft.quaternion.copy(qEnd).slerp(qTarget, Math.min(1, p / 0.18));
        const th = p < 1 ? 0.35 + 0.65 * (1 - e) : 0;
        setThrottle(th, t, alt < 0.045, craft);
        updatePlume(1 / 60, th, craft);
        if (p >= 1) {
          done = true;
          rocket.visible = true; // globe rocket takes over in the exact same pose
          touchdown();
          renderer.render(scene, cam);
          requestAnimationFrame(() => { renderer.dispose(); ic.remove(); });
          return;
        }
      }
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  }

  const UP = new THREE.Vector3(0, 1, 0);
  const _v = new THREE.Vector3();
  const _q = new THREE.Quaternion();
  function placeRocket(lat, lng, alt) {
    const c = world.getCoords(lat, lng, alt);
    rocket.position.set(c.x, c.y, c.z);
    const n = _v.set(c.x, c.y, c.z).normalize();
    rocket.quaternion.setFromUnitVectors(UP, n);
    // roll around the local up-axis so a hull-text column faces the camera
    _v.copy(world.camera().position).sub(rocket.position);
    _v.applyQuaternion(_q.copy(rocket.quaternion).invert());
    rocket.rotateY(Math.atan2(_v.x, _v.z) + Math.PI);
  }

  /* ---------- Landing sequence ---------- */
  const DESCENT = 6500;   // ms
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  let landed = false;

  // throttle drives cones, engine ring, light; nearGround flattens the plume
  function setThrottle(th, t, nearGround, craft) {
    const u = (craft || rocket).userData;
    const on = th > 0.01;
    u.outer.visible = u.flame.visible = u.core.visible = on;
    u.engineRing.material.opacity = on ? Math.min(1, 0.25 + th * 0.9) : 0;
    if (!on) { u.light.intensity = 0; u.plume.material.opacity = 0; return; }
    const flick = 0.85 + Math.sin(t * 0.05) * 0.08 + Math.random() * 0.18;
    const splash = nearGround ? 1.7 : 1;                 // exhaust spreads at the surface
    const w = (0.9 + Math.random() * 0.2) * splash;
    u.outer.scale.set(w, Math.max(0.05, th * flick * (nearGround ? 0.7 : 1.05)), w);
    u.flame.scale.set(splash * 0.9, Math.max(0.05, th * flick), splash * 0.9);
    u.core.scale.set(1, Math.max(0.05, th * (0.9 + Math.random() * 0.2)), 1);
    u.outer.material.opacity = 0.4 * th;
    u.flame.material.opacity = 0.75 * th;
    u.core.material.opacity = 0.95 * th;
    u.plume.material.opacity = 0.8 * th;
    u.light.intensity = 260 * th * flick;
  }

  function updatePlume(dt, th, craft) {
    const u = (craft || rocket).userData;
    if (th <= 0.01) return;
    const pos = u.pPos;
    for (let i = 0; i < u.pVel.length; i++) {
      const p = u.pVel[i];
      p.age += dt;
      if (p.age >= p.life) {
        p.age = 0;
        p.life = 0.3 + Math.random() * 0.35;
        pos[i * 3] = (Math.random() - 0.5) * 0.3;
        pos[i * 3 + 1] = -0.35;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        p.vx = (Math.random() - 0.5) * (2 + th * 2);
        p.vy = -(7 + Math.random() * 6) * th;
        p.vz = (Math.random() - 0.5) * (2 + th * 2);
      } else {
        pos[i * 3] += p.vx * dt;
        pos[i * 3 + 1] += p.vy * dt;
        pos[i * 3 + 2] += p.vz * dt;
      }
    }
    u.pGeo.attributes.position.needsUpdate = true;
  }

  function touchdown() {
    landed = true;
    setThrottle(0, 0, false);
    world.ringsData([SITE]);
    world.labelsData([...ZONES, LANDED_LABEL]);
    setTimeout(() => world.ringsData([]), 3800);
    setTimeout(() => { controls.autoRotate = !reduced; }, 1800);
  }

  function tick(t) {
    requestAnimationFrame(tick);
    fill.position.copy(world.camera().position);
    // nav light pulse — always on, feels alive after landing too
    const nav = rocket.userData.nav;
    nav.material.opacity = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.006));
    // keep the landed rocket planted and its lettering facing the camera
    if (landed) placeRocket(SITE.lat, SITE.lng, 0);
  }

  world.onGlobeReady(() => {
    el.style.opacity = "1";
    if (reduced) {
      rocket.visible = true;
      placeRocket(SITE.lat, SITE.lng, 0);
      setThrottle(0, 0, false);
      landed = true;
      world.labelsData([...ZONES, LANDED_LABEL]);
    } else {
      setTimeout(runIntro, 500);
    }
  });
  requestAnimationFrame(tick);

  /* ---------- Housekeeping ---------- */
  window.addEventListener("resize", () => {
    const w = Math.floor(wrap.getBoundingClientRect().width);
    if (w && w !== size) { size = w; world.width(w).height(w); }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      const vis = entries.some((en) => en.isIntersecting);
      vis ? world.resumeAnimation() : world.pauseAnimation();
    }, { rootMargin: "160px" }).observe(el);
  }
}
