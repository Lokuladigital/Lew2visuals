/* Project (single clip) page — reads ?p=slug */
(function () {
  // Fill content synchronously so the shell's split/reveal helpers see real text
  const D = window.L2V;
  const slug = new URLSearchParams(location.search).get("p");
  const i = Math.max(0, D.projects.findIndex((x) => x.slug === slug));
  const p = D.projects[i];
  const next = D.projects[(i + 1) % D.projects.length];
  const q = (s) => document.querySelector(s);
  document.title = `${p.title} | Lew2Visuals`;
  q('meta[name="description"]').setAttribute("content", `${p.title} — ${p.type} film by Lew2Visuals. ${p.brief}`);
  q("[data-p-title]").textContent = p.title;
  q("[data-p-title]").setAttribute("data-split", "");
  q("[data-p-type]").textContent = p.type;
  q("[data-p-tc]").textContent = "TC " + p.duration + ":00";
  q("[data-p-client]").textContent = p.client;
  q("[data-p-year]").textContent = p.year;
  q("[data-p-brief]").textContent = p.brief;
  q("[data-p-table]").innerHTML = [
    ["Client", p.client], ["Type", p.type], ["Role", p.role], ["Delivered", p.deliverables], ["Year", p.year], ["Runtime", p.duration]
  ].map(([k, v]) => `<div class="table__row"><span>${k}</span><span>${v}</span></div>`).join("");
  q("[data-p-stills]").innerHTML = [1, 2, 3].map((n) =>
    `<div class="frame"><img src="${D.posterSrc(p.slug, n)}" alt="${p.title} frame grab ${n}" loading="lazy" decoding="async" data-wipe></div>`).join("");
  const v = q("[data-p-video]");
  v.src = D.clipSrc(p.slug); v.poster = D.posterSrc(p.slug);
  const nx = q("[data-p-next]");
  nx.href = `project.html?p=${next.slug}`;
  q("[data-next-title]").textContent = next.title + " →";
  q("[data-next-type]").textContent = next.type + " / " + next.year;
  q(".next__bg video").dataset.src = D.clipSrc(next.slug);

  D.page = function () {
    const { $, tc, REDUCED, FINE, loadVideo } = D.ui;
    const player = $("[data-player]");
    const scrub = $("[data-scrub]"), fill = $(".scrub__fill", scrub), head = $(".scrub__head", scrub);
    const time = $("[data-time]"), toggle = $("[data-toggle]");

    const setPlaying = (on) => {
      player.classList.toggle("is-playing", on);
      toggle.textContent = on ? "Pause" : "Play";
      toggle.setAttribute("aria-label", on ? "Pause" : "Play");
      player.dataset.cursor = on ? "Pause" : "Play";
    };
    const togglePlay = () => (v.paused ? v.play() : v.pause());
    v.addEventListener("play", () => setPlaying(true));
    v.addEventListener("pause", () => setPlaying(false));
    $("[data-play]").addEventListener("click", togglePlay);
    toggle.addEventListener("click", togglePlay);
    v.addEventListener("click", togglePlay);

    const draw = () => {
      const pr = v.duration ? v.currentTime / v.duration : 0;
      fill.style.transform = `scaleX(${pr})`;
      head.style.left = pr * 100 + "%";
      time.textContent = tc(v.currentTime);
      scrub.setAttribute("aria-valuenow", Math.round(pr * 100));
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    // scrubbing: pointer-captured, follows the finger 1:1
    const seek = (e) => {
      const r = scrub.getBoundingClientRect();
      const pr = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      if (v.duration) v.currentTime = pr * v.duration;
    };
    scrub.addEventListener("pointerdown", (e) => { scrub.setPointerCapture(e.pointerId); seek(e); scrub.onpointermove = seek; });
    scrub.addEventListener("pointerup", () => (scrub.onpointermove = null));
    scrub.addEventListener("keydown", (e) => {
      if (!v.duration) return;
      if (e.key === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 1);
      if (e.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 1);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === " " && document.activeElement === document.body) { e.preventDefault(); togglePlay(); }
    });
    $("[data-fs]").addEventListener("click", () => {
      const el = player;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });

    // hide controls when idle
    let idle;
    player.addEventListener("pointermove", () => { player.classList.remove("is-idle"); clearTimeout(idle); idle = setTimeout(() => player.classList.add("is-idle"), 2200); });

    // the player opens up from a framed monitor as it scrolls into view
    if (!REDUCED) {
      gsap.fromTo(player, { clipPath: "inset(6% 8% 6% 8%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: player, start: "top 90%", end: "top 20%", scrub: true }
      });
      // autoplay muted when it enters, like a monitor rolling
      v.muted = true;
      ScrollTrigger.create({ trigger: player, start: "top 60%", once: true, onEnter: () => v.play().catch(() => {}) });
    }

    // next clip: background rolls when in view
    const nv = $(".next__bg video");
    new IntersectionObserver(([en]) => { if (en.isIntersecting) { loadVideo(nv); nv.play().catch(() => {}); } else nv.pause(); }).observe(nx);
  };
})();
