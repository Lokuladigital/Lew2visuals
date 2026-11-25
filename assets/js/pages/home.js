/* Home page */
window.L2V.page = function ({ intro }) {
  const D = window.L2V, S = D.site;
  const { $, $$, tc, pad, REDUCED, FINE, cardHTML, loadVideo, splitLines } = D.ui;
  const desktop = matchMedia("(min-width: 821px)").matches;

  /* ---------- 001 Hero reel ---------- */
  const frame = $("[data-hero-frame]");
  const video = $("[data-hero-video]");
  const hudTc = $("[data-hero-tc]");
  const cutNo = $("[data-hero-cut]");
  // The frame shape only changes with scroll (see the ScrollTrigger below); playback never reshapes it.
  frame.style.setProperty("--fi-x", "0%");
  frame.style.setProperty("--fi-y", "0%");
  const cuts = (S.heroCuts || [0]).slice().sort((a, b) => a - b);
  const onTime = () => {
    hudTc.textContent = tc(video.currentTime);
    let c = 0; cuts.forEach((t, i) => { if (video.currentTime >= t) c = i; });
    cutNo.textContent = c + 1;
    requestAnimationFrame(onTime);
  };
  requestAnimationFrame(onTime);
  // muted autoplay can still be refused (low-power mode, hidden tab) — retry on first interaction
  const kick = () => video.paused && video.play().catch(() => {});
  kick();
  ["pointerdown", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, kick, { once: true, passive: true }));
  document.addEventListener("visibilitychange", kick);

  // Sound toggle — hidden when the reel has no audio track (placeholder clips are silent)
  const sound = $("[data-sound]");
  sound.style.display = "none";
  const checkAudio = () => {
    const has = video.mozHasAudio || (video.webkitAudioDecodedByteCount || 0) > 0 || (video.audioTracks && video.audioTracks.length > 0);
    if (has) sound.style.display = "";
  };
  video.addEventListener("playing", () => setTimeout(checkAudio, 1500), { once: true });
  sound.addEventListener("click", () => {
    video.muted = !video.muted;
    sound.setAttribute("aria-pressed", String(!video.muted));
    sound.classList.toggle("is-unmuted", !video.muted);
    $("[data-sound-label]", sound).textContent = video.muted ? "Sound off" : "Sound on";
  });

  // Scroll: the reel pulls back into a framed monitor and the HUD drifts away
  if (!REDUCED) {
    const hero = $(".hero");
    hero.style.height = desktop ? "190vh" : "150vh";
    const tlh = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 0.6 } });
    tlh.to(frame, { "--fi-x": desktop ? "18%" : "5%", "--fi-y": desktop ? "16%" : "22%", "--fr": "6px", ease: "none" }, 0)
       .to(video, { scale: 1.12, ease: "none" }, 0)
       .to(".hero__lower", { yPercent: -60, opacity: 0, ease: "none" }, 0)
       .to(".hero__scroll, .hero__rec, .hero__clipname", { opacity: 0, ease: "none" }, 0);
  }

  /* ---------- 002 Contact sheet — scattered clips assemble into a grid on scroll ---------- */
  (function sheet() {
    const grid = $("[data-sheet-grid]");
    const status = $("[data-sheet-status]");
    // featured clip sits in the big centre cell; the rest fill around it
    const order = ["after-hours", "after-dark-gala", "slow-pour", "smoke-and-strobe", "floodlights", "night-drive", "golden-overpass", "dusk-run", "city-at-night"];
    const picks = order.map((s) => D.project(s)).filter(Boolean);
    grid.innerHTML = picks.map((p, i) => `
      <a class="sheet__tile${i === 0 ? " is-feature" : ""}" href="project.html?p=${p.slug}" data-cursor="View">
        <img src="${D.posterSrc(p.slug)}" alt="${p.title} — ${p.type} film still" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none" data-src="${D.clipSrc(p.slug)}" aria-hidden="true"></video>
        <span class="sheet__frame mono" aria-hidden="true">A001_C${pad(i + 1, 3)}</span>
        <span class="sheet__label"><span class="sheet__title">${p.title}</span><span class="mono">${p.type} · ${p.year}</span></span>
      </a>`).join("");
    const tiles = $$(".sheet__tile", grid);
    const feature = tiles[0], featureVid = $("video", feature);

    const playTile = (t, on) => {
      const v = $("video", t);
      if (on) { loadVideo(v); v.play().then(() => t.classList.add("is-playing")).catch(() => {}); }
      else if (t !== feature || !grid.classList.contains("is-done")) { v.pause(); t.classList.remove("is-playing"); }
    };

    // hover: play that tile, dim the rest
    if (FINE) tiles.forEach((t) => {
      t.addEventListener("pointerenter", () => { grid.classList.add("is-hovering"); t.classList.add("is-hover"); playTile(t, true); });
      t.addEventListener("pointerleave", () => { grid.classList.remove("is-hovering"); t.classList.remove("is-hover"); playTile(t, false); });
    });

    const desktop = matchMedia("(min-width: 821px)").matches;
    const done = (on) => {
      grid.classList.toggle("is-done", on);
      status.textContent = on ? `${pad(tiles.length)} clips — hover to roll` : "Assembling…";
      if (on) playTile(feature, true); else { featureVid.pause(); feature.classList.remove("is-playing"); }
    };

    if (REDUCED || !desktop) {
      done(true);
      if (!REDUCED) gsap.from(tiles, { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: grid, start: "top 85%", once: true } });
      return;
    }

    // deterministic scatter: push each tile outward from the centre, tilt it, and set it at a depth
    const rand = (n) => { const x = Math.sin(n * 999.7) * 10000; return x - Math.floor(x); };
    const scatter = () => {
      const g = grid.getBoundingClientRect(), cx = g.left + g.width / 2, cy = g.top + g.height / 2;
      return tiles.map((t, i) => {
        const r = t.getBoundingClientRect();
        const dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
        if (i === 0) return { x: 0, y: innerHeight * 0.08, rotation: -4, scale: 0.42, depth: 1 };
        const depth = 0.55 + rand(i) * 0.45; // lower = further away
        // a loose pile across the stage: pulled toward the centre, jittered, tilted
        return {
          x: dx * (0.15 + rand(i + 3) * 0.35) + (rand(i + 7) - 0.5) * g.width * 0.55,
          y: dy * (0.2 + rand(i + 11) * 0.3) + (rand(i + 13) - 0.5) * g.height * 0.45,
          rotation: (rand(i + 17) - 0.5) * 30,
          scale: 0.5 + depth * 0.3,
          depth
        };
      });
    };
    let S0 = scatter();
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "[data-sheet-pin]", start: "top top", end: () => "+=" + innerHeight * 1.5, pin: true, scrub: 0.8,
        invalidateOnRefresh: true,
        onRefreshInit: () => { gsap.set(tiles, { clearProps: "transform,filter" }); S0 = scatter(); },
        onUpdate: (self) => { const d = self.progress > 0.92; if (d !== grid.classList.contains("is-done")) done(d); }
      }
    });
    tiles.forEach((t, i) => {
      tl.fromTo(t,
        { x: () => S0[i].x, y: () => S0[i].y, rotation: () => S0[i].rotation, scale: () => S0[i].scale,
          filter: () => `blur(${((1 - S0[i].depth) * 12).toFixed(1)}px) brightness(${(0.5 + S0[i].depth * 0.4).toFixed(2)})` },
        { x: 0, y: 0, rotation: 0, scale: 1, filter: "blur(0px) brightness(1)", ease: "power3.inOut", duration: 1 },
        i === 0 ? 0.15 : rand(i + 23) * 0.25);
    });
    tl.fromTo(".sheet__word", { scale: 1, opacity: 1 }, { scale: 0.82, opacity: 0, ease: "power2.in", duration: 0.9 }, 0);

    // before it assembles, the scattered tiles drift a little with the mouse
    if (FINE) {
      const stage = $(".sheet__stage");
      const xTo = gsap.quickTo(grid, "x", { duration: 1.2, ease: "power3" });
      const yTo = gsap.quickTo(grid, "y", { duration: 1.2, ease: "power3" });
      stage.addEventListener("pointermove", (e) => {
        const k = grid.classList.contains("is-done") ? 0 : 1;
        xTo((e.clientX / innerWidth - 0.5) * -40 * k);
        yTo((e.clientY / innerHeight - 0.5) * -24 * k);
      });
      stage.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    }
  })();

  /* ---------- 004 Selects — a curved projector reel that turns with scroll ---------- */
  const track = $("[data-selects-track]");
  const picks = D.projects.slice(0, 6);
  track.innerHTML = picks.map((p) => cardHTML(p)).join("") + `
    <div class="selects__end">
      <span class="mono mono--dim">${pad(D.projects.length)} clips in the bin</span>
      <h3 class="display display--m" style="margin:0">See the<br>full <span class="grey">index</span></h3>
      <a class="btn" href="work.html" data-magnetic>All work →</a>
    </div>`;
  if (desktop && !REDUCED) {
    const section = $(".selects");
    section.classList.add("is-reel");
    const pin = $("[data-selects-pin]");

    // stage: sprocket strip / reel / sprocket strip
    const stage = document.createElement("div");
    stage.className = "reel";
    const holes = () => { const s = document.createElement("div"); s.className = "reel__holes"; s.setAttribute("aria-hidden", "true"); return s; };
    const topHoles = holes(), bottomHoles = holes();
    track.parentNode.insertBefore(stage, track);
    stage.append(topHoles, track, bottomHoles);

    const items = Array.from(track.children);
    const STEP = 32; // degrees between cards around the reel
    let R = 0;
    const layout = () => {
      const w = items[0].offsetWidth;
      R = Math.round((w / 2) / Math.tan((STEP / 2) * Math.PI / 180)) + 40;
      items.forEach((el, i) => (el.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`));
    };

    let front = -1;
    const playFront = (n) => {
      items.forEach((el, i) => {
        const v = el.querySelector("video");
        if (!v) return;
        if (i === n) { loadVideo(v); v.play().then(() => el.classList.add("is-playing")).catch(() => {}); }
        else { v.pause(); el.classList.remove("is-playing"); }
      });
    };
    const turn = (p) => {
      const pos = p * (items.length - 1); // fractional index of the card facing the viewer
      track.style.transform = `translateZ(${-R}px) rotateY(${-pos * STEP}deg)`;
      items.forEach((el, i) => {
        const d = Math.abs(i - pos);
        el.style.opacity = d > 2.8 ? 0 : String(1 - Math.max(0, d - 0.15) * 0.22);
        el.style.filter = `brightness(${(1 - Math.min(d, 2.5) * 0.25).toFixed(3)}) grayscale(${Math.min(1, d * 0.8).toFixed(2)})`;
        el.classList.toggle("is-front", d < 0.5);
      });
      const shift = `${(-pos * 220).toFixed(1)}px 0`;
      topHoles.style.backgroundPosition = shift;
      bottomHoles.style.backgroundPosition = shift;
      gsap.set("[data-selects-progress]", { scaleX: p });
      const f = Math.round(pos);
      if (f !== front) { front = f; playFront(f); }
    };

    layout();
    turn(0);
    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1, ease: "none",
      onUpdate: () => turn(proxy.p),
      scrollTrigger: {
        trigger: pin, start: "top top", end: () => "+=" + innerHeight * (items.length - 1) * 0.55,
        pin: true, scrub: 0.8, invalidateOnRefresh: true,
        onRefresh: () => { layout(); turn(proxy.p); },
        onToggle: (self) => { if (!self.isActive) items.forEach((el) => { const v = el.querySelector("video"); v && v.pause(); }); else playFront(front); }
      }
    });
  }

  /* ---------- 007 Quotes — pinned, scroll steps through each one ---------- */
  (function quotes() {
    const Q = D.testimonials;
    const stage = $("[data-quotes]"), media = $("[data-q-media]");
    const bar = $("[data-q-bar]"), count = $("[data-q-count]"), num = $("[data-q-num]");
    stage.innerHTML = Q.map((q, i) => `
      <figure class="quote" data-q="${i}">
        <p>“${q.quote}”</p>
        <figcaption class="mono mono--dim">${q.who} — ${q.org}</figcaption>
      </figure>`).join("");
    media.innerHTML = Q.map((q, i) => `
      <div class="quotes__img" data-qi="${i}">
        <img src="${D.posterSrc(q.clip, 2)}" alt="" loading="lazy" decoding="async">
        <span class="frame__tag mono">${D.project(q.clip) ? D.project(q.clip).title : ""}</span>
      </div>`).join("");
    const figs = $$(".quote", stage), imgs = $$(".quotes__img", media);
    let qi = -1;

    const show = (n, instant) => {
      if (n === qi) return;
      const dir = n > qi ? 1 : -1, prev = qi;
      qi = n;
      count.textContent = `${pad(n + 1)} / ${pad(Q.length)}`;
      num.textContent = pad(n + 1);
      if (instant || REDUCED) {
        figs.forEach((f, j) => gsap.set(f, { autoAlpha: j === n ? 1 : 0, y: 0 }));
        imgs.forEach((m, j) => gsap.set(m, { clipPath: j === n ? "inset(0% 0 0% 0)" : "inset(100% 0 0% 0)", zIndex: j === n ? 2 : 1 }));
        return;
      }
      if (prev >= 0) gsap.to(figs[prev], { autoAlpha: 0, y: -30 * dir, duration: 0.35, ease: "power2.in", overwrite: true });
      gsap.fromTo(figs[n], { autoAlpha: 0, y: 40 * dir }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", delay: prev >= 0 ? 0.2 : 0, overwrite: true });
      // new image wipes over the old one from the scroll direction
      imgs.forEach((m, j) => gsap.set(m, { zIndex: j === n ? 3 : j === prev ? 2 : 1 }));
      gsap.fromTo(imgs[n], { clipPath: dir > 0 ? "inset(100% 0 0% 0)" : "inset(0% 0 100% 0)" },
        { clipPath: "inset(0% 0 0% 0)", duration: 0.9, ease: "expo.inOut", overwrite: true });
      gsap.fromTo($("img", imgs[n]), { scale: 1.15 }, { scale: 1, duration: 1.4, ease: "expo.out", overwrite: true });
      gsap.fromTo(num, { yPercent: 40 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out", overwrite: true });
    };
    show(0, true);
    // reduced motion: no pinning — all quotes simply sit in a list
    if (REDUCED) { gsap.set(figs, { autoAlpha: 1 }); $(".quotes__nav").style.display = "none"; return; }

    const pinEl = $("[data-quotes-pin]");
    let st = null;
    if (!REDUCED) {
      st = ScrollTrigger.create({
        trigger: pinEl, start: "top top", end: () => "+=" + innerHeight * (Q.length - 0.4), pin: true,
        onUpdate: (self) => {
          bar.style.transform = `scaleX(${self.progress})`;
          show(Math.min(Q.length - 1, Math.floor(self.progress * Q.length)));
        }
      });
    }
    // arrows scroll to the matching step, so the page and the quote never disagree
    const goTo = (n) => {
      n = Math.max(0, Math.min(Q.length - 1, n));
      if (!st) return show(n);
      const y = st.start + ((n + 0.5) / Q.length) * (st.end - st.start);
      D.lenis ? D.lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: "smooth" });
    };
    $("[data-q-next]").addEventListener("click", () => goTo(qi + 1));
    $("[data-q-prev]").addEventListener("click", () => goTo(qi - 1));
  })();

  /* ---------- 008 CTA — frame expands to full screen on scroll ---------- */
  (function expand() {
    const pin = $("[data-xp-pin]"), frame = $("[data-xp-frame]"), v = $("video", frame);
    const shade = $("[data-xp-shade]"), title = $("[data-xp-title]"), actions = $("[data-xp-actions]");
    const slug = $("[data-xp-slug]"), xtc = $("[data-xp-tc]");
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { loadVideo(v); v.play().catch(() => {}); } else v.pause();
    }).observe(pin);
    const tick = () => { xtc.textContent = tc(v.currentTime || 0); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    if (REDUCED) return; // final, fully-open state is the CSS default

    // start: a small centred frame (roughly 42% x 56% of the screen)
    const startInset = () => {
      const w = pin.clientWidth, h = pin.clientHeight;
      const fw = Math.min(w * 0.42, 620), fh = Math.min(h * 0.56, 520);
      return `inset(${((h - fh) / 2).toFixed(0)}px ${((w - fw) / 2).toFixed(0)}px round 22px)`;
    };
    const tl = gsap.timeline({
      scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + innerHeight * 1.2, pin: true, scrub: 0.8, invalidateOnRefresh: true }
    });
    tl.fromTo(frame, { clipPath: startInset }, { clipPath: "inset(0px 0px round 0px)", ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(v, { scale: 1.35 }, { scale: 1, ease: "power2.out", duration: 1 }, 0)
      .fromTo(shade, { opacity: 0.15 }, { opacity: 0.6, ease: "none", duration: 1 }, 0)
      .fromTo(title, { scale: 0.86, yPercent: 8 }, { scale: 1, yPercent: 0, ease: "power2.out", duration: 1 }, 0)
      .fromTo(slug, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, 0.7)
      .fromTo(actions.children, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.3, stagger: 0.08 }, 0.72);
  })();
};
