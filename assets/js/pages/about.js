/* About page */
window.L2V.page = function () {
  const D = window.L2V;
  const { $, $$, REDUCED, pad } = D.ui;

  // BTS frame opens from a small monitor to full screen as you scroll
  if (!REDUCED) {
    const mobile = matchMedia("(max-width: 820px)").matches;
    gsap.fromTo("[data-about-frame]",
      { clipPath: mobile ? "inset(40% 6% 12% 6%)" : "inset(18% 8% 18% 46%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".about-hero__media", start: "top top", end: "bottom bottom", scrub: 0.5 } });
    gsap.to(".about-hero__title", { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".about-hero__media", start: "top top", end: "40% top", scrub: true } });
  }

  // BTS gallery — drag with momentum, rubber-band at the edges
  const track = $("[data-drag-track]");
  const picks = ["bts", "after-hours", "smoke-and-strobe", "floodlights", "golden-overpass", "after-dark-gala", "dusk-run"];
  track.innerHTML = picks.map((s, i) => `
    <div class="drag__cell frame"><img src="${D.posterSrc(s, (i % 3) + 1)}" alt="Behind the scenes frame ${i + 1}" loading="lazy" decoding="async" draggable="false">
      <span class="frame__tag mono">LEWIS_BTS_${pad(i + 1, 3)}</span></div>`).join("");

  const wrap = $("[data-drag]");
  let x = 0, min = 0, dragging = false, startX = 0, startPos = 0, hist = [], raf = 0, target = null;
  const bounds = () => { min = Math.min(0, wrap.clientWidth - track.scrollWidth); };
  const rubber = (over, dim) => (over * dim * 0.55) / (dim + 0.55 * Math.abs(over));
  const render = () => {
    let shown = x;
    if (x > 0) shown = rubber(x, wrap.clientWidth);
    else if (x < min) shown = min + rubber(x - min, wrap.clientWidth);
    track.style.transform = `translate3d(${shown}px,0,0)`;
  };
  const settle = () => {
    // spring toward target (projected momentum, clamped to bounds)
    let v = 0;
    const step = () => {
      const t = Math.max(min, Math.min(0, target));
      v += (t - x) * 0.12; v *= 0.72; x += v;
      render();
      if (Math.abs(t - x) > 0.3 || Math.abs(v) > 0.3) raf = requestAnimationFrame(step); else { x = t; render(); }
    };
    cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
  };
  wrap.addEventListener("pointerdown", (e) => {
    bounds(); dragging = true; cancelAnimationFrame(raf);
    wrap.setPointerCapture(e.pointerId);
    startX = e.clientX; startPos = x; hist = [{ x: e.clientX, t: performance.now() }];
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    x = startPos + (e.clientX - startX);
    hist.push({ x: e.clientX, t: performance.now() }); if (hist.length > 5) hist.shift();
    render();
  });
  const end = () => {
    if (!dragging) return; dragging = false;
    const a = hist[0], b = hist[hist.length - 1];
    const vel = b && a && b.t !== a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0; // px/s
    const d = 0.998;
    target = x + (vel / 1000) * d / (1 - d) * 0.35; // projected landing point
    settle();
  };
  wrap.addEventListener("pointerup", end);
  wrap.addEventListener("pointercancel", end);
  // keyboard: arrow keys nudge the strip
  wrap.tabIndex = 0;
  wrap.setAttribute("aria-label", "Behind the scenes gallery, use arrow keys to scroll");
  wrap.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    bounds(); target = x + (e.key === "ArrowRight" ? -400 : 400); settle();
  });
  addEventListener("resize", () => { bounds(); x = Math.max(min, Math.min(0, x)); render(); });
  bounds();
};
