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

  /* ---------- Project gallery ----------------------------------------
     Renders from assets/projects/<slug>.webp (grid) and
     <slug>-full.webp (lightbox). Regenerate with tools/build-projects.py
     after adding new renders.
  ------------------------------------------------------------------- */
  const PROJECT_FILTERS = [
    { id: "all",        label: "All Work" },
    { id: "villas",     label: "Luxury Villas" },
    { id: "bungalows",  label: "Bungalows & Farmhouses" },
    { id: "houses",     label: "Houses & Elevations" },
    { id: "interiors",  label: "Interiors" },
  ];

  /* span: lead = 4 cols x 2 rows, wide = 3 cols, blank = 2 cols.
     ("hero" is avoided as a class name - it collides with the hero section.)
     Wide slots are panoramic, so only long-and-low compositions go there. */
  const PROJECTS = [
    { img: "villa-front",          cat: "villas",    span: "lead", title: "Neoclassical Grand Villa",      shot: "Front elevation & forecourt" },
    { img: "villa-portico",        cat: "villas",    span: "",     title: "Neoclassical Grand Villa",      shot: "Portico & driveway" },
    { img: "villa-lawn",           cat: "villas",    span: "",     title: "Neoclassical Grand Villa",      shot: "Lawn lounge" },
    { img: "courtyard-dusk",       cat: "bungalows", span: "wide", title: "Mediterranean Courtyard Home",  shot: "Dusk elevation" },
    { img: "courtyard-aerial",     cat: "bungalows", span: "wide", title: "Mediterranean Courtyard Home",  shot: "Courtyard from above" },
    { img: "villa-arched",         cat: "villas",    span: "",     title: "Arched Classical Villa",        shot: "Grand entrance" },
    { img: "villa-pavilion",       cat: "villas",    span: "",     title: "Neoclassical Grand Villa",      shot: "Garden pavilion" },
    { img: "farmhouse-porch",      cat: "bungalows", span: "",     title: "Terracotta Farmhouse",          shot: "Entrance porch" },
    { img: "farmhouse-arcade",     cat: "bungalows", span: "wide", title: "Terracotta Farmhouse",          shot: "Arched arcade" },
    { img: "farmhouse-wing",       cat: "bungalows", span: "wide", title: "Terracotta Farmhouse",          shot: "Guest wing" },
    { img: "modern-split",         cat: "houses",    span: "",     title: "Contemporary Split-Level Home", shot: "Dusk elevation" },
    { img: "heritage-street",      cat: "houses",    span: "",     title: "Heritage Street Villa",         shot: "Street elevation & gate" },
    { img: "stone-arcade-veranda", cat: "houses",    span: "",     title: "Stone Arcade Residence",        shot: "Veranda detail" },
    { img: "stone-arcade-front",   cat: "houses",    span: "wide", title: "Stone Arcade Residence",        shot: "Symmetrical front" },
    { img: "office-waiting",       cat: "interiors", span: "wide", title: "Corporate Office Fit-Out",      shot: "Waiting lounge" },
    { img: "office-reception",     cat: "interiors", span: "",     title: "Corporate Office Fit-Out",      shot: "Reception" },
    { img: "office-cabin",         cat: "interiors", span: "",     title: "Corporate Office Fit-Out",      shot: "Director's cabin" },
    { img: "office-conference",    cat: "interiors", span: "",     title: "Corporate Office Fit-Out",      shot: "Conference room" },
  ];

  function projectGallery() {
    const grid = $("#projectGrid");
    const bar = $("#projectFilters");
    if (!grid) return;

    grid.innerHTML = PROJECTS.map((p, i) => `
      <button class="pcard ${p.span}" type="button" data-cat="${p.cat}" data-i="${i}"
              aria-label="${p.title}, ${p.shot} — open full screen">
        <img src="assets/projects/${p.img}.webp" alt="${p.title} — ${p.shot}" loading="lazy" decoding="async" />
        <span class="pzoom" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6M11 8v6M8 11h6"/></svg>
        </span>
        <span class="pcap"><strong>${p.title}</strong><span>${p.shot}</span></span>
      </button>`).join("");

    const cards = $$(".pcard", grid);

    // Cards fade up as they enter view, independent of the global reveal pass
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    cards.forEach((c) => io.observe(c));

    if (bar) {
      bar.innerHTML = PROJECT_FILTERS.map((f, i) =>
        `<button class="pfilter${i === 0 ? " active" : ""}" type="button" data-cat="${f.id}">${f.label}</button>`
      ).join("");

      $$(".pfilter", bar).forEach((btn) => {
        btn.addEventListener("click", () => {
          $$(".pfilter", bar).forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const cat = btn.dataset.cat;
          cards.forEach((c) => {
            const show = cat === "all" || c.dataset.cat === cat;
            c.classList.toggle("is-hidden", !show);
            if (show) c.classList.add("in"); // never leave a filtered-in card blank
          });
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        });
      });
    }

    lightbox(cards);
  }

  /* ---------- Lightbox for the project gallery ---------- */
  function lightbox(cards) {
    const box = $("#lightbox");
    const img = $("#lbImg");
    if (!box || !img) return;
    const title = $("#lbTitle"), meta = $("#lbMeta");
    let idx = 0;

    const visible = () => cards.filter((c) => !c.classList.contains("is-hidden"));

    const show = (card) => {
      idx = cards.indexOf(card);
      const p = PROJECTS[+card.dataset.i];
      const list = visible();
      img.src = `assets/projects/${p.img}-full.webp`;
      img.alt = `${p.title} — ${p.shot}`;
      if (title) title.textContent = p.title;
      if (meta) meta.textContent = `${p.shot} · ${list.indexOf(card) + 1} / ${list.length}`;
    };

    const open = (card) => {
      show(card);
      box.classList.add("open");
      box.setAttribute("aria-hidden", "false");
      document.body.classList.add("lb-open");
      $("#lbClose").focus();
    };

    const close = () => {
      box.classList.remove("open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lb-open");
    };

    const step = (dir) => {
      const list = visible();
      if (!list.length) return;
      const at = list.indexOf(cards[idx]);
      show(list[(at + dir + list.length) % list.length]);
    };

    cards.forEach((c) => c.addEventListener("click", () => open(c)));
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => step(-1));
    $("#lbNext").addEventListener("click", () => step(1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
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

  /* ---------- Architecture Studio: SVG line-draw + parallax ---------- */
  function atelierScene() {
    const board = $("#atelierBoard");
    const stage = $("#atelierStage");
    const svg = $("#atelierSvg");
    const section = $("#studio");
    if (!board || !svg || !section) return;

    const prepStroke = (el) => {
      let len = 0;
      try {
        if (typeof el.getTotalLength === "function") len = el.getTotalLength();
      } catch (_) { len = 0; }
      if (!len || !isFinite(len)) len = 120;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      el.dataset.len = String(len);
    };

    const strokeEls = $$(".draw-line, .draw-group path, .draw-group line", svg);
    strokeEls.forEach(prepStroke);

    const quote = $(".atelier-quote", board);
    const brand = $(".atelier-brand", board);
    const legend = $(".atelier-legend", board);
    const hotspots = $$(".hotspot", board);
    const earthFills = $$(".earth-fill, .fade-in", svg);
    const figures = $(".figures", svg);
    const birds = $$(".birds .bird", svg);
    const dims = $(".dims", svg);
    const notes = $(".notes", svg);
    const smoke = $(".smoke", svg);
    const celestial = $(".celestial", svg);

    const playDraw = () => {
      if (section.classList.contains("is-drawn")) return;
      section.classList.add("is-drawn");

      if (window.gsap) {
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        tl.to(quote, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0);
        tl.to(earthFills, { opacity: 1, duration: 1.1, stagger: 0.08 }, 0.15);
        tl.to(strokeEls, {
          strokeDashoffset: 0,
          duration: 1.6,
          stagger: { each: 0.012, from: "start" },
          ease: "power1.inOut",
        }, 0.25);
        tl.to(figures, { opacity: 1, duration: 0.7 }, 1.4);
        tl.to(birds, { opacity: 1, duration: 0.5, stagger: 0.06 }, 1.2);
        tl.to(dims, { opacity: 0.6, duration: 0.6 }, 1.6);
        tl.to(notes, { opacity: 0.92, duration: 0.7 }, 1.65);
        tl.to(brand, { opacity: 1, duration: 0.6 }, 1.5);
        tl.to(legend, { opacity: 1, duration: 0.6 }, 1.55);
        tl.to(hotspots, { opacity: 1, duration: 0.5, stagger: 0.1 }, 1.7);
        if (smoke) {
          tl.to(smoke, { strokeDashoffset: 0, duration: 1.4, ease: "sine.out" }, 1.3);
          gsap.to(smoke, {
            strokeDashoffset: -40,
            duration: 3.2,
            repeat: -1,
            ease: "none",
            delay: 2.6,
          });
        }
        if (celestial) {
          gsap.to(celestial, {
            rotation: 360,
            transformOrigin: "0px 0px",
            duration: 80,
            repeat: -1,
            ease: "none",
          });
        }
        birds.forEach((b, i) => {
          gsap.to(b, {
            x: 18 + i * 4,
            y: "+=6",
            duration: 2.4 + i * 0.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 1.8 + i * 0.1,
          });
        });
      } else {
        strokeEls.forEach((el) => { el.style.strokeDashoffset = "0"; });
        earthFills.forEach((el) => { el.style.opacity = "1"; });
        if (dims) dims.style.opacity = ".6";
        if (notes) notes.style.opacity = ".92";
        if (figures) figures.style.opacity = "1";
        if (quote) quote.style.opacity = "1";
        if (brand) brand.style.opacity = "1";
        if (legend) legend.style.opacity = "1";
        hotspots.forEach((h) => { h.style.opacity = "1"; });
        birds.forEach((b) => { b.style.opacity = "1"; });
      }
    };

    // IntersectionObserver fires on any scroll path, including #studio deep links
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        playDraw();
        io.disconnect();
      }),
      { threshold: 0.18 }
    );
    io.observe(section);

    // Subtle scroll parallax on SVG layers
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      $$("[data-depth]", svg).forEach((layer) => {
        const d = parseFloat(layer.dataset.depth || "0.5");
        gsap.to(layer, {
          y: (1 - d) * -40,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }

    // Mouse tilt — architectural model feel
    if (!matchMedia("(hover: none)").matches) {
      board.addEventListener("mousemove", (e) => {
        const r = board.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (window.gsap) {
          gsap.to(stage, {
            rotateY: px * 8,
            rotateX: -py * 6,
            transformPerspective: 900,
            duration: 0.6,
            ease: "power2.out",
          });
        } else {
          stage.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 6}deg)`;
        }
      });
      board.addEventListener("mouseleave", () => {
        if (window.gsap) {
          gsap.to(stage, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
        } else {
          stage.style.transform = "";
        }
      });
    }

    // Legend focus highlights
    $$(".legend-item", board).forEach((item) => {
      item.addEventListener("click", () => {
        $$(".legend-item", board).forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        const focus = item.dataset.focus;
        const building = $(".layer-building", svg);
        const figs = $(".figures", svg);
        const wins = $(".windows", svg);
        if (!window.gsap) return;
        gsap.to([building, figs, wins], { opacity: 1, duration: 0.35 });
        if (focus === "light" && wins) {
          gsap.fromTo(wins, { opacity: 0.3 }, { opacity: 1, duration: 0.6, yoyo: true, repeat: 1 });
        } else if (focus === "scale" && figs) {
          gsap.fromTo(figs, { opacity: 0.4 }, { opacity: 1, duration: 0.5, yoyo: true, repeat: 1 });
        } else if (focus === "structure" && building) {
          gsap.fromTo(building, { opacity: 0.5 }, { opacity: 1, duration: 0.5, yoyo: true, repeat: 1 });
        }
      });
    });
  }

  /* Revolving villa model — disabled; swap heroRibGrid() for hero3DHouse() in init to restore. */
  function hero3DHouse() {
    return;
    const canvas = $("#heroCanvas");
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0d11, 0.016);

    const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Cheap studio environment — without it, metal and glazing render almost black
    (function studioEnv() {
      const c = document.createElement("canvas");
      c.width = 16; c.height = 128;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#3b3730");
      g.addColorStop(0.5, "#1d1b18");
      g.addColorStop(1, "#0a0b0d");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 128);
      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = tex;
    })();

    // Studio lighting: soft, three-point, so white volumes keep readable facets
    scene.add(new THREE.AmbientLight(0xa8a49a, 0.45));
    const key = new THREE.DirectionalLight(0xfff2da, 1.05);
    key.position.set(9, 14, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -14; key.shadow.camera.right = 14;
    key.shadow.camera.top = 14; key.shadow.camera.bottom = -14;
    key.shadow.camera.near = 1; key.shadow.camera.far = 50;
    key.shadow.radius = 3;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9aa2ad, 0.28);
    fill.position.set(-10, 6, 7); scene.add(fill);
    const rim = new THREE.PointLight(0xb9a06e, 2.2, 34);
    rim.position.set(-6, 4, -9); scene.add(rim);

    // Palette: charcoal massing, bronze metalwork, glazing lit from within
    const PAPER = new THREE.MeshStandardMaterial({ color: 0x2d2c29, metalness: 0.1, roughness: 0.82 });
    const STONE = new THREE.MeshStandardMaterial({ color: 0x1f1e1c, metalness: 0.08, roughness: 0.92 });
    const BRONZE = new THREE.MeshStandardMaterial({ color: 0xb9a06e, metalness: 0.6, roughness: 0.3 });
    const GLASS = new THREE.MeshStandardMaterial({
      color: 0x1d1a12, emissive: 0xffcb8c, emissiveIntensity: 0.92,
      metalness: 0.2, roughness: 0.14, transparent: true, opacity: 0.92,
    });
    // Balustrades and railings read as clear glass, not lit rooms
    const GLASS_CLEAR = new THREE.MeshStandardMaterial({
      color: 0x1b2226, metalness: 0.5, roughness: 0.06, transparent: true, opacity: 0.45,
    });
    const WATER = new THREE.MeshStandardMaterial({
      color: 0x14303a, emissive: 0x0a2831, emissiveIntensity: 0.25,
      metalness: 0.4, roughness: 0.05, transparent: true, opacity: 0.9,
    });
    const INK = new THREE.LineBasicMaterial({ color: 0xe8e0cd, transparent: true, opacity: 0.6 });

    // The turntable holds the model; the stage offsets it away from the headline
    const stage = new THREE.Group();
    const model = new THREE.Group();
    stage.add(model); scene.add(stage);

    // Drawn edges on every volume are what make this read as a physical model
    function volume(geo, mat, x, y, z) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true; m.receiveShadow = true;
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), INK));
      model.add(m);
      return m;
    }
    const box = (w, h, d, mat, x, y, z) => volume(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
    const post = (r, h, mat, x, y, z) =>
      volume(new THREE.CylinderGeometry(r, r, h, 12), mat, x, y, z);

    /* --- Site: model baseboard, bronze trim, plot grid --- */
    box(12, 0.4, 9.4, STONE, 0, -0.2, 0);
    box(12.5, 0.14, 9.9, BRONZE, 0, -0.47, 0);
    const plot = new THREE.GridHelper(9, 18, 0xb9a06e, 0x39404a);
    plot.material.opacity = 0.35; plot.material.transparent = true;
    plot.position.y = 0.01; model.add(plot);

    /* --- Boundary wall, left open at the gate --- */
    box(5.4, 0.5, 0.2, STONE, -3.1, 0.25, 4.5);
    box(2.6, 0.5, 0.2, STONE, 4.5, 0.25, 4.5);
    box(0.2, 0.5, 9.0, STONE, -5.8, 0.25, 0);
    box(0.2, 0.5, 9.0, STONE, 5.8, 0.25, 0);
    box(12, 0.5, 0.2, STONE, 0, 0.25, -4.5);
    // Gate + driveway
    box(3.0, 0.66, 0.1, BRONZE, 1.7, 0.33, 4.5);
    box(2.8, 0.06, 4.2, STONE, 1.7, 0.03, 2.5);

    /* --- Ground floor: long living block + double-height wing --- */
    box(6.4, 2.6, 4.8, PAPER, -0.9, 1.3, 0);
    box(3.4, 3.7, 4.4, PAPER, 3.1, 1.85, 0.2);
    // Rear service block
    box(2.8, 1.9, 2.8, PAPER, -4.3, 0.95, -2.7);

    /* --- Upper floor, set back, with a cantilevered deck --- */
    box(5.6, 2.4, 4.4, PAPER, -1.1, 3.8, -0.2);
    box(6.8, 0.24, 1.8, PAPER, -0.9, 2.72, 2.5);
    box(6.8, 0.62, 0.05, GLASS_CLEAR, -0.9, 3.15, 3.36);
    box(6.8, 0.07, 0.07, BRONZE, -0.9, 3.48, 3.36);
    // Two slim columns carrying the deck edge — the portico
    post(0.09, 2.6, BRONZE, -3.9, 1.3, 3.15);
    post(0.09, 2.6, BRONZE, 0.5, 1.3, 3.15);

    /* --- Hipped roof over the upper mass --- */
    const hip = volume(new THREE.ConeGeometry(1, 1, 4), PAPER, -1.1, 5.75, -0.2);
    hip.rotation.y = Math.PI / 4;
    hip.scale.set(4.3, 1.5, 3.5);
    box(0.5, 1.4, 0.5, STONE, 0.6, 5.6, -1.0); // chimney

    /* --- Flat roof + parapet over the wing --- */
    box(3.6, 0.2, 4.6, PAPER, 3.1, 3.8, 0.2);
    box(3.7, 0.16, 0.12, BRONZE, 3.1, 3.96, 2.45);

    /* --- Glazing rhythm --- */
    box(2.9, 3.1, 0.08, GLASS, 3.1, 1.75, 2.45);   // double-height wing
    [2.0, 3.1, 4.2].forEach((x) => box(0.07, 3.1, 0.1, BRONZE, x, 1.75, 2.47)); // mullions
    box(1.3, 1.5, 0.08, GLASS, -3.3, 1.45, 2.45);
    box(1.7, 1.5, 0.08, GLASS, 0.7, 1.45, 2.45);
    box(1.15, 2.15, 0.08, GLASS, -1.5, 1.07, 2.45); // entry
    box(2.4, 1.3, 0.08, GLASS, -2.7, 3.9, 2.05);
    box(1.7, 1.3, 0.08, GLASS, 0.7, 3.9, 2.05);
    box(1.6, 1.4, 0.08, GLASS, -4.15, 1.45, -1.2); // side elevation
    box(1.6, 1.4, 0.08, GLASS, -3.95, 3.9, -1.4);

    /* --- Pool deck at the rear --- */
    box(4.0, 0.1, 2.4, STONE, 3.2, 0.05, -2.9);
    box(3.4, 0.14, 1.8, WATER, 3.2, 0.08, -2.9);

    /* --- Model trees: faceted canopies on slim trunks --- */
    [[-5.1, 3.2], [-5.2, -0.4], [5.0, 3.4], [5.1, -3.7]].forEach(([x, z], i) => {
      post(0.07, 0.8, STONE, x, 0.4, z);
      const canopy = volume(new THREE.IcosahedronGeometry(0.55 + i * 0.05, 0), PAPER, x, 1.25, z);
      canopy.rotation.set(i, i * 0.7, 0);
    });

    /* --- Warm spill from inside the house, so the glow feels lit --- */
    const glowA = new THREE.PointLight(0xffc98a, 2.6, 11);
    glowA.position.set(1.4, 1.6, 2.0); model.add(glowA);
    const glowB = new THREE.PointLight(0xffc98a, 1.6, 9);
    glowB.position.set(-1.6, 3.8, 1.6); model.add(glowB);

    /* --- Bronze dust in the air --- */
    const pGeo = new THREE.BufferGeometry();
    const pCount = 180, pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 12 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(
      pGeo, new THREE.PointsMaterial({ color: 0x8d6e3c, size: 0.055, transparent: true, opacity: 0.5 })
    );
    scene.add(particles);

    // Camera framing: model sits right of the headline on desktop, centred on mobile
    const base = new THREE.Vector3();
    const target = new THREE.Vector3();
    function layout() {
      // 0 on a phone (model centred) → 1 on a wide desktop (model pushed clear of the copy)
      const k = Math.min(1, Math.max(0, (innerWidth - 700) / 700));
      stage.position.x = 4.6 * k;
      base.set(0, 8.6 - 2.0 * k, 24 - 6 * k);
      target.set(-0.6 * k, 2.2 - 0.4 * k, 0);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }
    layout();
    camera.position.copy(base);

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });

    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      model.rotation.y = -0.5 + t * 0.11;          // slow turntable
      model.position.y = Math.sin(t * 0.6) * 0.06; // barely-there float
      particles.rotation.y = t * 0.015;
      camera.position.x += (base.x + mx * 3.4 - camera.position.x) * 0.045;
      camera.position.y += (base.y - my * 2.6 - camera.position.y) * 0.045;
      camera.position.z += (base.z - camera.position.z) * 0.045;
      camera.lookAt(target);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    addEventListener("resize", layout);
  }

  /* ---------- Three.js hero: architectural rib grid (Calatrava-style) ---------- */
  function heroRibGrid() {
    const canvas = $("#heroCanvas");
    if (!canvas || !window.THREE) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 1.72;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0d11, 0.014);

    const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x0b0d11, 1);

    scene.add(new THREE.AmbientLight(0x9a9590, 0.28));
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(8, 12, 16);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8c0b4, 0.45);
    fill.position.set(-6, 2, 10);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xd4bc8a, 0.42);
    rim.position.set(-10, 6, -8);
    scene.add(rim);

    const vault = new THREE.Group();
    scene.add(vault);

    const ribMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.28,
      roughness: 0.26,
      emissive: 0x4a4540,
      emissiveIntensity: 0.18,
    });
    const ribGhost = ribMat.clone();
    ribGhost.transparent = true;
    ribGhost.opacity = 0.28;
    ribGhost.color.setHex(0xe8e2d8);

    const RIBS = 58;
    const SEG = 44;

    function ribPoints(index, layer) {
      const v = index / (RIBS - 1);
      const layerOff = layer * 0.14;
      const pts = [];
      for (let i = 0; i <= SEG; i++) {
        const u = i / SEG;
        const sweep = u * Math.PI * 0.98;
        const fan = (v - 0.5) * 10.5;
        const twist = u * 0.48 + v * 0.32 + layerOff;
        const radius = 3.0 + u * 7.8 + Math.sin(v * Math.PI) * 1.1;
        let x = Math.cos(sweep + twist) * radius + fan * 0.62 + u * 5.6;
        let y = Math.sin(sweep * 0.52) * 3.6 + u * 8.2 - 4.0 + Math.sin(u * Math.PI) * 1.35;
        let z = Math.sin(sweep + twist) * radius * 0.72 + fan * 1.05 + (u - 0.5) * 3.2;
        x *= SCALE;
        y *= SCALE;
        z *= SCALE;
        pts.push(new THREE.Vector3(x, y, z));
      }
      return pts;
    }

    for (let r = 0; r < RIBS; r++) {
      const curve = new THREE.CatmullRomCurve3(ribPoints(r, 0));
      const t = r / (RIBS - 1);
      const tubeR = (0.042 + (1 - Math.abs(t - 0.5) * 1.75) * 0.038) * (SCALE * 0.55);
      const geo = new THREE.TubeGeometry(curve, 56, tubeR, 7, false);
      vault.add(new THREE.Mesh(geo, ribMat));
    }
    for (let r = 0; r < RIBS; r += 2) {
      const curve = new THREE.CatmullRomCurve3(ribPoints(r, 1));
      const geo = new THREE.TubeGeometry(curve, 40, 0.028 * SCALE, 6, false);
      vault.add(new THREE.Mesh(geo, ribGhost));
    }

    function addGrid(size, divisions, opacity, rotX, rotY, y, z) {
      const g = new THREE.GridHelper(size, divisions, 0x4a4540, 0x252320);
      g.material.opacity = opacity;
      g.material.transparent = true;
      g.rotation.set(rotX, rotY, 0);
      g.position.set(4.2 * SCALE, y, z);
      vault.add(g);
    }
    addGrid(42 * SCALE, 84, 0.2, Math.PI / 2, 0, -5.5 * SCALE, -1.5);
    addGrid(36 * SCALE, 72, 0.1, Math.PI / 2.4, 0.35, -4 * SCALE, 2);

    const stage = new THREE.Group();
    stage.add(vault);
    scene.add(stage);

    const baseCam = new THREE.Vector3();
    const lookAt = new THREE.Vector3();
    let baseRotY = -0.36;

    function layout() {
      const k = Math.min(1, Math.max(0, (innerWidth - 680) / 720));
      const narrow = innerWidth < 720;
      if (narrow) {
        stage.position.set(0.2, -1.6, 0.5);
        stage.rotation.set(-0.1, -0.22, 0.03);
        vault.scale.setScalar(1.12);
        baseCam.set(0, 0.2, 12.8);
        lookAt.set(1.2, 0.6, 0);
        baseRotY = -0.22;
      } else {
        stage.position.set(0.6 + k * 1.4, -2.0, -0.8);
        stage.rotation.set(-0.05, -0.36 - k * 0.08, 0.035);
        vault.scale.setScalar(1.38 + k * 0.42);
        baseCam.set(-0.15 * (1 - k), 0.35, 9.2 - k * 0.8);
        lookAt.set(2.2 + k * 3.2, 1.0, 0);
        baseRotY = -0.36 - k * 0.08;
      }
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }
    layout();
    camera.position.copy(baseCam);
    camera.lookAt(lookAt);

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });

    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      if (!reduced) {
        vault.rotation.y = Math.sin(t * 0.1) * 0.035;
        vault.rotation.z = Math.sin(t * 0.07) * 0.018;
        stage.rotation.y = baseRotY + mx * 0.06;
      }
      camera.position.x += (baseCam.x + mx * 2.2 - camera.position.x) * 0.04;
      camera.position.y += (baseCam.y - my * 1.4 - camera.position.y) * 0.04;
      camera.position.z += (baseCam.z - camera.position.z) * 0.04;
      camera.lookAt(
        lookAt.x + mx * 0.75,
        lookAt.y - my * 0.45,
        lookAt.z
      );
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    addEventListener("resize", layout);
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    wireLinks();
    nav();
    projectGallery();
    cursor();
    gallery();
    contactForm();
    counters();
    reveals();
    atelierScene();
    heroRibGrid();
    // hero3DHouse(); // previous revolving villa model
  });
})();
