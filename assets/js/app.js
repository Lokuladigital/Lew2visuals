/*
  Lew2Visuals — shared shell
  Header info strip, mobile menu, sequence timeline, cursor, grain,
  page "cuts", preloader slate, smooth scroll and reveal helpers.
*/
(function () {
  const D = window.L2V;
  const S = D.site;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, "0");
  const tc = (sec, fps = 24) => `${pad(sec / 3600)}:${pad((sec / 60) % 60)}:${pad(sec % 60)}:${pad((sec % 1) * fps)}`;

  const NAV = [
    ["index.html", "Home", "home"],
    ["work.html", "Work", "work"],
    ["services.html", "Services", "services"],
    ["about.html", "About", "about"],
    ["contact.html", "Contact", "contact"]
  ];
  const isCurrent = (key) => key === page || (page === "project" && key === "work");

  /* ---------- Shell markup ---------- */
  function logo() {
    return `<span class="logo" aria-label="${S.name}">LEW<span class="grey">2</span>VISUALS</span>`;
  }

  function header() {
    const el = document.createElement("header");
    el.className = "hdr";
    el.innerHTML = `
      <div class="hdr__brand">
        <a href="index.html" data-cursor="Home">${logo()}</a>
        <nav class="nav mono" aria-label="Main">
          ${NAV.map(([h, l, k]) => `<a href="${h}"${isCurrent(k) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
        </nav>
      </div>
      <div class="hdr__col mono">Video production<br>Based in ${S.based}</div>
      <div class="hdr__col hdr__col--contact mono">
        <a href="mailto:${S.email}">${S.email}</a><br>
        <a href="${S.instagramUrl}" target="_blank" rel="noopener">Instagram ${S.instagram}</a>
      </div>
      <div class="hdr__right">
        <div class="mono">
          <div class="hdr__clock" data-clock>--:--:--:--</div>
          <div class="mono--dim"><span class="dot dot--live" style="width:6px;height:6px"></span> ${S.booking}</div>
        </div>
        <a class="btn btn--sm" href="contact.html" data-magnetic>Start a project</a>
        <button class="menu-btn mono" aria-expanded="false" aria-controls="mmenu"><span>Menu</span><i aria-hidden="true"></i></button>
      </div>`;
    document.body.prepend(el);

    const menu = document.createElement("div");
    menu.className = "mmenu"; menu.id = "mmenu";
    menu.innerHTML = `
      <nav aria-label="Mobile">
        ${NAV.map(([h, l, k], i) => `<a href="${h}"${isCurrent(k) ? ' aria-current="page"' : ""}><span>${l}</span><span class="mono">0${i + 1}</span></a>`).join("")}
      </nav>
      <div class="mono" style="display:grid;gap:8px;color:var(--fg-2)">
        <span><span class="dot dot--live" style="width:6px;height:6px"></span> ${S.booking}</span>
        <a href="mailto:${S.email}">${S.email}</a>
        <a href="${S.instagramUrl}" target="_blank" rel="noopener">Instagram ${S.instagram}</a>
      </div>`;
    document.body.appendChild(menu);
    const btn = $(".menu-btn", el);
    btn.addEventListener("click", () => {
      const open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("is-menu", open);
      el.classList.remove("is-hidden");
      btn.setAttribute("aria-expanded", open);
      $("span", btn).textContent = open ? "Close" : "Menu";
      open ? lenis && lenis.stop() : lenis && lenis.start();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) btn.click(); });
    return el;
  }

  function footer() {
    const slot = $("[data-footer]");
    if (!slot) return;
    slot.outerHTML = `
      <footer class="ftr" data-clip="END">
        <div class="wrap ftr__grid">
          <div class="mono">
            <div class="mono--dim">Studio</div>
            <ul><li>${S.name}</li><li>${S.based}</li><li class="mono--dim">${S.shootsIn}</li></ul>
          </div>
          <div class="mono">
            <div class="mono--dim">Sequences</div>
            <ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul>
          </div>
          <div class="mono">
            <div class="mono--dim">Contact</div>
            <ul>
              <li><a href="mailto:${S.email}">${S.email}</a></li>
              <li><a href="${S.instagramUrl}" target="_blank" rel="noopener">Instagram ${S.instagram}</a></li>
              <li class="mono--dim">Replies ${S.replies.toLowerCase()}</li>
            </ul>
          </div>
          <div class="ftr__right mono">
            <span class="mono--dim">© ${new Date().getFullYear()} ${S.name}</span>
            <button class="link-u" data-top>⏮ Back to top</button>
          </div>
        </div>
        <div class="ftr__dots">
          <span class="ftr__hint mono mono--dim">Move / click the dots</span>
          <canvas class="dots-canvas" aria-label="${S.name}" role="img"></canvas>
        </div>
      </footer>`;
    const c = $(".ftr .dots-canvas");
    if (c && window.DotWordmark) window.DotWordmark(c);
    $("[data-top]").addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo(0, 0)));
  }

  function timeline() {
    const el = document.createElement("div");
    el.className = "tl";
    el.setAttribute("aria-label", "Page sequence");
    el.innerHTML = `
      <div class="tl__meta mono">
        <span class="mono--dim">${document.body.dataset.seq || "SEQ_" + page.toUpperCase()}</span>
        <span class="tl__tc"><span class="dot"></span><span data-tl-tc>00:00:00:00</span></span>
      </div>
      <div class="tl__track">
        <div class="tl__ruler"></div>
        <div class="tl__clips"></div>
        <div class="tl__head"></div>
      </div>
      <div class="tl__end mono mono--dim"><span>V1 / A1</span><span>24 FPS</span></div>`;
    document.body.appendChild(el);
    return el;
  }

  function chrome() {
    const g = document.createElement("div"); g.className = "grain"; g.setAttribute("aria-hidden", "true");
    const cut = document.createElement("div"); cut.className = "cut"; cut.setAttribute("aria-hidden", "true");
    cut.innerHTML = `<span class="cut__label"></span><span class="cut__tc mono"></span>`;
    document.body.append(g, cut);
    return cut;
  }

  /* ---------- Clock (Edmonton time with a frame counter) ---------- */
  function clock() {
    const el = $("[data-clock]");
    if (!el) return;
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: S.timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tz = new Intl.DateTimeFormat("en-CA", { timeZone: S.timeZone, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName");
    const tick = () => {
      const now = new Date();
      const f = pad((now.getMilliseconds() / 1000) * 24);
      el.textContent = `${fmt.format(now)}:${f} ${tz ? tz.value : ""}`;
    };
    tick();
    setInterval(tick, REDUCED ? 1000 : 1000 / 12);
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  function smooth() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);
    if (REDUCED || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    // pinned sections add height after load — keep Lenis's scroll limit in sync
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
    window.L2V.lenis = lenis;
    // in-page anchors
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = $(a.getAttribute("href")); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -40 });
    }));
  }

  /* ---------- Header behaviour ---------- */
  function headerScroll(hdr) {
    let last = 0;
    const lightSecs = $$(".theme-light");
    const onScroll = () => {
      const y = window.scrollY;
      hdr.classList.toggle("is-scrolled", y > 40);
      // dark text when the strip sits over a white section
      hdr.classList.toggle("is-light", !document.documentElement.classList.contains("is-menu") && lightSecs.some((sec) => { const r = sec.getBoundingClientRect(); return r.top <= 40 && r.bottom >= 40; }));
      if (!document.documentElement.classList.contains("is-menu")) {
        hdr.classList.toggle("is-hidden", y > last && y > window.innerHeight * 0.6);
      }
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Sequence timeline ---------- */
  function timelineBind(tl) {
    const clipsEl = $(".tl__clips", tl);
    const head = $(".tl__head", tl);
    const tcEl = $("[data-tl-tc]", tl);
    const sections = $$("[data-clip]");
    if (!sections.length) return;
    const btns = sections.map((s) => {
      const b = document.createElement("button");
      b.className = "tl__clip mono";
      b.innerHTML = `<span>${s.dataset.clip}</span>`;
      b.setAttribute("aria-label", `Jump to ${s.dataset.clip}`);
      b.addEventListener("click", () => (lenis ? lenis.scrollTo(s, { duration: 1.4 }) : s.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" })));
      clipsEl.appendChild(b);
      return b;
    });
    let spans = [];
    const layout = () => {
      const total = document.documentElement.scrollHeight;
      spans = sections.map((s) => {
        const r = s.getBoundingClientRect();
        return { top: r.top + scrollY, h: r.height };
      });
      spans.forEach((sp, i) => (btns[i].style.flexGrow = Math.max(0.6, (sp.h / total) * 10)));
    };
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      const tw = clipsEl.clientWidth;
      head.style.transform = `translateX(${p * tw}px)`;
      tl.style.setProperty("--p", p);
      // one pixel of scroll = one frame
      tcEl.textContent = tc(scrollY / 24 / 1.2);
      const mid = scrollY + innerHeight * 0.45;
      let active = 0;
      spans.forEach((sp, i) => { if (mid >= sp.top) active = i; });
      btns.forEach((b, i) => b.classList.toggle("is-active", i === active));
    };
    layout(); update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", () => { layout(); update(); });
    ScrollTrigger.addEventListener("refresh", () => { layout(); update(); });
  }

  /* ---------- Cursor ---------- */
  function cursor() {
    if (!FINE) return;
    const el = document.createElement("div");
    el.className = "cursor is-hidden";
    el.innerHTML = `<div class="cursor__box"><span></span></div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add("has-cursor");
    const label = $("span", el);
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); el.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => el.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      if (t) { label.textContent = t.dataset.cursor; el.classList.add("is-label"); }
      else el.classList.remove("is-label");
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function magnetic() {
    if (!FINE || REDUCED) return;
    $$("[data-magnetic]").forEach((b) => {
      const xTo = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Page cuts (transitions) ---------- */
  function cuts(cut) {
    const label = $(".cut__label", cut);
    const tcEl = $(".cut__tc", cut);
    const nameFor = (href) => {
      const f = href.split("/").pop().split("?")[0].replace(".html", "") || "index";
      return { index: "Home", work: "Work", services: "Services", about: "About", contact: "Contact", project: "Clip" }[f] || "";
    };
    // arriving: if we left the previous page with a cut, uncover now
    if (sessionStorage.getItem("l2v-cut") && !REDUCED) {
      sessionStorage.removeItem("l2v-cut");
      cut.classList.add("is-covering");
      label.textContent = document.title.split("|")[0].trim();
      requestAnimationFrame(() => {
        gsap.fromTo(cut, { clipPath: "inset(0% 0 0% 0)" }, {
          clipPath: "inset(0% 0 100% 0)", duration: 0.75, ease: "expo.inOut", delay: 0.1,
          onComplete: () => { cut.classList.remove("is-covering"); cut.style.clipPath = ""; }
        });
      });
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:/.test(href)) return;
      if (REDUCED) return;
      e.preventDefault();
      label.textContent = nameFor(href);
      tcEl.textContent = "CUT TO " + tc(Math.random() * 600);
      cut.classList.add("is-covering");
      gsap.fromTo(cut, { clipPath: "inset(100% 0 0% 0)" }, {
        clipPath: "inset(0% 0 0% 0)", duration: 0.55, ease: "expo.inOut",
        onComplete: () => { sessionStorage.setItem("l2v-cut", "1"); location.href = href; }
      });
    });
    // back/forward cache: never come back to a covered page
    addEventListener("pageshow", (e) => { if (e.persisted) { cut.classList.remove("is-covering"); cut.style.clipPath = ""; } });
  }

  /* ---------- Preloader slate (first visit per session) ---------- */
  function slate() {
    if (sessionStorage.getItem("l2v-seen") || REDUCED) return Promise.resolve(false);
    sessionStorage.setItem("l2v-seen", "1");
    const el = document.createElement("div");
    el.className = "slate";
    el.innerHTML = `
      <div class="slate__inner mono">
        <div class="slate__row"><span>Prod.</span><b>${S.name}</b></div>
        <div class="slate__row"><span>Roll / Scene / Take</span><b>A001 / 01 / 01</b></div>
        <div class="slate__tc" data-slate-tc>00:00:00:00</div>
        <div class="slate__bar"><i></i></div>
        <div class="slate__row" style="border:0"><span>${S.based}</span><b>${S.booking}</b></div>
      </div>`;
    document.body.appendChild(el);
    const tcEl = $("[data-slate-tc]", el);
    const o = { t: 0 };
    return new Promise((res) => {
      gsap.timeline({ onComplete: () => { el.remove(); res(true); } })
        .to(o, { t: 2.0, duration: 1.3, ease: "power2.inOut", onUpdate: () => (tcEl.textContent = tc(o.t)) }, 0)
        .to($(".slate__bar i", el), { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, "+=0.15");
    });
  }

  /* ---------- Reveal helpers ---------- */
  function splitLines(el) {
    // wraps each word, then groups words into visual lines
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    const html = el.innerHTML;
    // keep inner spans (e.g. .grey) by splitting on text nodes
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    const words = [];
    const walk = (node, cls) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => { if (w.trim()) words.push({ w, cls }); });
        else if (n.nodeName === "BR") words.push({ br: true });
        else walk(n, n.className || cls);
      });
    };
    walk(tmp, "");
    el.innerHTML = words.map((o) => (o.br ? "<br>" : `<span class="word${o.cls ? " " + o.cls : ""}" aria-hidden="true">${o.w}</span>`)).join(" ");
    const ws = $$(".word", el);
    const lines = []; let top = null;
    ws.forEach((w) => { const t = w.offsetTop; if (t !== top) { lines.push([]); top = t; } lines[lines.length - 1].push(w); });
    el.innerHTML = lines.map((l) => `<span class="split-line"><span>${l.map((w) => w.outerHTML).join(" ")}</span></span>`).join("");
    return $$(".split-line > span", el);
  }

  function reveals() {
    if (REDUCED) return;
    $$("[data-split]").forEach((el) => {
      const lines = splitLines(el);
      gsap.from(lines, {
        yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    $$("[data-reveal]").forEach((el) => {
      gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$("[data-stagger]").forEach((wrap) => {
      gsap.from(wrap.children, { y: 24, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: wrap, start: "top 88%", once: true } });
    });
    // words light up as you scroll past (dim -> full text colour of the section)
    $$("[data-scrub-words]").forEach((el) => {
      const text = el.innerHTML;
      el.innerHTML = text.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, w) => (tag ? tag : `<span class="word">${w}</span>`));
      gsap.to($$(".word", el), {
        color: getComputedStyle(el).getPropertyValue("--fg").trim() || "#f1f1f1", stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
      });
    });
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count); const o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => (el.textContent = Math.round(o.v) + (el.dataset.suffix || "")) });
    });
    // clip-path image reveals
    $$("[data-wipe]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
  }

  /* ---------- Video cards ---------- */
  function cardHTML(p, opts = {}) {
    const cls = ["card", opts.cls || ""].join(" ").trim();
    return `
      <a class="${cls}" href="project.html?p=${p.slug}" data-cursor="View" data-type="${p.type}" data-slug="${p.slug}">
        <div class="frame">
          <img src="${D.posterSrc(p.slug)}" alt="${p.title} — ${p.type} film still" loading="lazy" decoding="async" width="1280" height="720">
          <video muted loop playsinline preload="none" data-src="${D.clipSrc(p.slug)}" aria-hidden="true"></video>
          <div class="vf" aria-hidden="true"><i></i><i></i><i></i><i></i>
            <span class="vf__rec mono"><span class="dot"></span>REC</span>
            <span class="vf__tc mono" data-vtc>00:00:00:00</span>
          </div>
        </div>
        <div class="card__meta">
          <div><div class="card__title">${p.title}</div><div class="mono mono--dim" style="margin-top:6px">${p.client}</div></div>
          <div class="mono mono--dim" style="text-align:right">${p.type}<br>${p.year}</div>
        </div>
      </a>`;
  }

  function loadVideo(v) { if (v && !v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } }

  function bindCards(root = document) {
    $$(".card", root).forEach((card) => {
      if (card._bound) return; card._bound = true;
      const v = $("video", card); const vtc = $("[data-vtc]", card);
      let raf = 0;
      const loop = () => { if (vtc) vtc.textContent = tc(v.currentTime); raf = requestAnimationFrame(loop); };
      const play = () => { loadVideo(v); v.play().then(() => { card.classList.add("is-playing"); cancelAnimationFrame(raf); loop(); }).catch(() => {}); };
      const stop = () => { v.pause(); card.classList.remove("is-playing"); cancelAnimationFrame(raf); };
      if (FINE) {
        card.addEventListener("pointerenter", play);
        card.addEventListener("pointerleave", stop);
        card.addEventListener("focus", play); card.addEventListener("blur", stop);
      } else if (!REDUCED) {
        new IntersectionObserver(([en]) => (en.intersectionRatio > 0.6 ? play() : stop()), { threshold: [0, 0.6] }).observe(card);
      }
    });
  }

  /* ---------- Fill site settings into markup ---------- */
  function fill() {
    $$("[data-booking]").forEach((e) => (e.textContent = S.booking));
    $$("[data-email]").forEach((e) => { e.textContent = S.email; if (e.tagName === "A") e.href = "mailto:" + S.email; });
    $$("[data-instagram]").forEach((e) => { e.textContent = "Instagram " + S.instagram; if (e.tagName === "A") e.href = S.instagramUrl; });
    $$("[data-based]").forEach((e) => (e.textContent = S.based));
    $$("[data-shoots]").forEach((e) => (e.textContent = S.shootsIn));
    $$("[data-replies]").forEach((e) => (e.textContent = S.replies));
    $$("[data-work-count]").forEach((e) => (e.textContent = `(${pad(D.projects.length)})`));
  }

  /* ---------- Boot ---------- */
  fill();
  smooth();
  const hdr = header();
  const tl = timeline();
  const cut = chrome();
  footer();
  clock();
  headerScroll(hdr);
  cursor();
  cuts(cut);

  window.L2V.ui = { $, $$, tc, pad, REDUCED, FINE, cardHTML, bindCards, loadVideo, splitLines, get lenis() { return lenis; } };

  const intro = slate();
  // pages register their own init on window.L2V.page
  const boot = () => {
    if (window.L2V.page) window.L2V.page({ intro });
    reveals();
    bindCards();
    magnetic();
    timelineBind(tl);
    // video and font loads change layout; refresh triggers once things settle
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => ScrollTrigger.refresh());
    addEventListener("load", () => ScrollTrigger.refresh());
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(boot);
})();
