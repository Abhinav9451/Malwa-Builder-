/* =====================================================================
   MALWA BUILDERS — MAIN JS
   - Three.js 3D hero (rotating wireframe city/house)
   - GSAP scroll reveals + parallax
   - WhatsApp deep links + contact form
   - Gallery + lightbox, counters, mobile nav
   ===================================================================== */
(function () {
  "use strict";
  const CFG = window.MB_CONFIG || {};

  /* ---------- Helpers ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const wa = (msg) =>
    `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(
      msg || CFG.defaultMessage || "Hello Malwa Builders!"
    )}`;

  /* ---------- Wire up config-driven links ---------- */
  function wireLinks() {
    const waUrl = wa();
    [["heroWhatsapp"], ["bannerWhatsapp"], ["floatWhatsapp"], ["waLink2"]].forEach(
      ([id]) => { const el = $("#" + id); if (el) el.href = waUrl; }
    );
    const set = (id, href, text) => {
      const el = $("#" + id);
      if (!el) return;
      if (href) el.href = href;
      if (text) el.textContent = text;
    };
    const maps = "https://www.google.com/maps/search/" + encodeURIComponent(CFG.location || "Malwa Builders Jagraon Punjab");
    set("fbLink", CFG.facebook);
    set("fbLink2", CFG.facebook);
    set("fbReelsBtn", (CFG.facebook || "").replace(/\/?$/, "/") + "reels");
    set("igLink", CFG.instagram);
    set("igLink2", CFG.instagram);
    set("igLinkFooter", CFG.instagram, "@malwabuilders");
    set("instaBtn", CFG.instagram);
    set("phoneLink", "tel:" + (CFG.whatsappNumber ? "+" + CFG.whatsappNumber : ""), CFG.phoneDisplay);
    set("phoneLinkAlt", "tel:" + (CFG.phoneAlt || "").replace(/\s/g, ""), CFG.phoneAlt);
    set("emailLink", "mailto:" + CFG.email, CFG.email);
    set("locLink", maps, CFG.location);
    set("footerMap", maps);
    set("footerPhone", "tel:" + (CFG.whatsappNumber ? "+" + CFG.whatsappNumber : ""), CFG.phoneDisplay);
    set("footerPhoneAlt", "tel:" + (CFG.phoneAlt || "").replace(/\s/g, ""), CFG.phoneAlt);
    const addr = $("#footerAddress"); if (addr && CFG.location) addr.textContent = CFG.location;
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Loader ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => $("#loader") && $("#loader").classList.add("hidden"), 700);
  });

  /* ---------- Navbar scroll + mobile menu ---------- */
  function nav() {
    const navEl = $("#nav");
    const onScroll = () => navEl.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = $("#hamburger");
    const links = $("#navLinks");
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      links.classList.toggle("open");
    });
    $$("#navLinks a").forEach((a) =>
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        links.classList.remove("open");
      })
    );
  }

  /* ---------- Custom cursor ---------- */
  function cursor() {
    const dot = $(".cursor-dot"), ring = $(".cursor-ring");
    if (!dot || matchMedia("(hover: none)").matches) return;
    let rx = 0, ry = 0, x = 0, y = 0;
    document.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.left = x + "px"; dot.style.top = y + "px";
    });
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    };
    loop();
    $$("a, button, .g-item, .card").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("grow"));
      el.addEventListener("mouseleave", () => ring.classList.remove("grow"));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveals() {
    const els = $$(".reveal");
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      els.forEach((el) =>
        gsap.fromTo(el, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        })
      );
    } else {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
        { threshold: 0.12 }
      );
      els.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Animated counters ---------- */
  function counters() {
    const nums = $$("[data-count]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        let cur = 0; const step = Math.max(1, Math.ceil(target / 60));
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = target + (target >= 100 ? "+" : ""); }
          else { el.textContent = cur; requestAnimationFrame(tick); }
        };
        tick(); io.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Reels gallery (REAL Malwa Builders content) ----------
     Each card shows the real reel poster. Clicking opens the actual
     reel on the Malwa Builders Facebook page in a new tab.
  ------------------------------------------------------------------- */
  const REELS = [
    { poster: "assets/reels/reel1.jpg", link: "https://www.facebook.com/reel/763708350134179/",   title: "Luxury House Walkthrough", tag: "Reel" },
    { poster: "assets/reels/reel2.jpg", link: "https://www.facebook.com/reel/1317885930416828/",  title: "Modern Elevation",         tag: "Reel" },
    { poster: "assets/reels/reel3.jpg", link: "https://www.facebook.com/reel/1653998529165761/",  title: "Interior Detailing",       tag: "Reel" },
    { poster: "assets/reels/reel4.jpg", link: "https://www.facebook.com/reel/2398507333976287/",  title: "Bungalow Tour",            tag: "Reel" },
    { poster: "assets/reels/reel7.jpg", link: "https://www.facebook.com/reel/4242328356019293/",  title: "Design Showcase",          tag: "Reel" },
    { poster: "assets/reels/reel9.jpg", link: "https://www.facebook.com/reel/945812608231055/",   title: "On-Site Build",            tag: "Reel" },
  ];

  function gallery() {
    const wrap = $("#reels");
    if (!wrap) return;
    wrap.innerHTML = REELS.map((r) => `
      <a class="reel reveal" href="${r.link}" target="_blank" rel="noopener" aria-label="${r.title} — watch on Facebook">
        <div class="reel-media">
          <img class="reel-poster" src="${r.poster}" alt="${r.title}" loading="lazy" />
          <span class="reel-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </div>
        <div class="reel-cap"><strong>${r.title}</strong></div>
      </a>`).join("");
  }

  /* ---------- Contact form -> WhatsApp ---------- */
  function contactForm() {
    const f = $("#contactForm");
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(f);
      const msg =
        `*New enquiry — Malwa Builders*%0A` +
        `*Name:* ${d.get("name")}%0A` +
        `*Phone:* ${d.get("phone")}%0A` +
        `*Service:* ${d.get("service")}%0A` +
        `*Details:* ${d.get("message") || "-"}`;
      window.open(`https://wa.me/${CFG.whatsappNumber}?text=${msg}`, "_blank");
    });
  }

  /* ---------- Three.js hero: floating low-poly skyline ---------- */
  function hero3D() {
    const canvas = $("#heroCanvas");
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0e12, 0.06);

    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 3.2, 11);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffe9b0, 1.1);
    key.position.set(6, 10, 6); scene.add(key);
    const rim = new THREE.PointLight(0xb9a06e, 1.4, 40);
    rim.position.set(-8, 6, -4); scene.add(rim);

    // City group: a grid of buildings
    const city = new THREE.Group();
    const gold = new THREE.Color(0xb9a06e);
    const dark = new THREE.Color(0x1a1d26);
    const cols = 7, rows = 7, gap = 1.7;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const h = 0.6 + Math.random() * 3.6;
        const geo = new THREE.BoxGeometry(0.9, h, 0.9);
        const isGold = Math.random() > 0.78;
        const mat = new THREE.MeshStandardMaterial({
          color: isGold ? gold : dark,
          metalness: isGold ? 0.9 : 0.4,
          roughness: isGold ? 0.25 : 0.6,
          emissive: isGold ? new THREE.Color(0x3a2c08) : new THREE.Color(0x000000),
        });
        const m = new THREE.Mesh(geo, mat);
        m.position.set((i - cols / 2) * gap, h / 2 - 1.2, (j - rows / 2) * gap);
        // wireframe overlay for tech feel
        const wire = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color: 0xb9a06e, transparent: true, opacity: 0.16 })
        );
        m.add(wire);
        m.userData.baseY = m.position.y;
        m.userData.phase = Math.random() * Math.PI * 2;
        city.add(m);
      }
    }
    scene.add(city);

    // Ground grid
    const grid = new THREE.GridHelper(40, 40, 0xb9a06e, 0x222530);
    grid.material.opacity = 0.12; grid.material.transparent = true;
    grid.position.y = -1.2; scene.add(grid);

    // Floating particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 300, pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pos[i] = (Math.random() - 0.5) * 40;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(
      pGeo, new THREE.PointsMaterial({ color: 0xb9a06e, size: 0.06, transparent: true, opacity: 0.45 })
    );
    scene.add(particles);

    // Mouse parallax
    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / innerWidth - 0.5);
      my = (e.clientY / innerHeight - 0.5);
    });

    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      city.rotation.y = t * 0.08;
      city.children.forEach((m) => {
        m.position.y = m.userData.baseY + Math.sin(t * 0.9 + m.userData.phase) * 0.12;
      });
      particles.rotation.y = t * 0.02;
      camera.position.x += (mx * 3 - camera.position.x) * 0.04;
      camera.position.y += (3.2 - my * 2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.4, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    wireLinks();
    nav();
    cursor();
    gallery();
    contactForm();
    counters();
    reveals();
    hero3D();
  });
})();
