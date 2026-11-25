/* Work page — filterable grid + index view */
window.L2V.page = function () {
  const D = window.L2V;
  const { $, $$, pad, REDUCED, FINE, cardHTML, bindCards } = D.ui;
  const P = D.projects;
  const entrances = [];

  // grid rhythm: rows of 1 (wide), 2 (half), 3 (thirds), repeating — the last row always fills
  const ROW = { 1: "is-wide", 2: "", 3: "is-third" };
  const rhythm = (n) => {
    const out = []; let k = 0;
    while (out.length < n) { const size = Math.min([1, 2, 3][k++ % 3], n - out.length); for (let j = 0; j < size; j++) out.push(ROW[size]); }
    return out;
  };
  const grid = $("[data-grid]");
  const initial = rhythm(P.length);
  grid.innerHTML = P.map((p, i) => cardHTML(p, { cls: initial[i] })).join("");

  const index = $("[data-index]");
  index.innerHTML = `
    <div class="index__row index__head mono" role="presentation"><span>#</span><span>Title</span><span>Client</span><span>Type</span><span>Year</span><span>TC</span></div>` +
    P.map((p, i) => `
    <a class="index__row mono" role="listitem" href="project.html?p=${p.slug}" data-type="${p.type}" data-clip-src="${D.clipSrc(p.slug)}" data-cursor="View">
      <span>${pad(i + 1)}</span><span class="t">${p.title}</span><span>${p.client}</span><span>${p.type}</span><span>${p.year}</span><span>${p.duration}</span>
    </a>`).join("");

  // filters
  const types = ["All", ...new Set(P.map((p) => p.type))];
  const fwrap = $("[data-filters]");
  fwrap.innerHTML = types.map((t) => {
    const n = t === "All" ? P.length : P.filter((p) => p.type === t).length;
    return `<button class="chip" data-filter="${t}" aria-pressed="${t === "All"}">${t}<sup>${pad(n)}</sup></button>`;
  }).join("");
  $$("[data-filter]", fwrap).forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.filter;
    $$("[data-filter]", fwrap).forEach((x) => x.setAttribute("aria-pressed", x === b));
    const cards = $$(".card", grid);
    // entrance tweens would fight the swap — finish them first
    entrances.forEach((tw) => tw.progress(1).kill()); entrances.length = 0;
    const apply = () => {
      cards.forEach((c) => c.classList.toggle("is-hidden", t !== "All" && c.dataset.type !== t));
      // recompute rhythm for visible cards so the grid stays tidy
      const shown = cards.filter((c) => !c.classList.contains("is-hidden"));
      const r = rhythm(shown.length);
      shown.forEach((c, i) => { c.classList.remove("is-wide", "is-third"); if (r[i]) c.classList.add(r[i]); });
      $$(".index__row[data-type]", index).forEach((r) => r.classList.toggle("is-hidden", t !== "All" && r.dataset.type !== t));
      ScrollTrigger.refresh();
      return shown;
    };
    if (REDUCED) { apply(); return; }
    // quick cut out, then the new selection staggers back in
    gsap.killTweensOf(cards);
    gsap.to(cards.filter((c) => !c.classList.contains("is-hidden")), {
      opacity: 0, y: 16, duration: 0.2, ease: "power2.in", stagger: 0.02, overwrite: true,
      onComplete: () => {
        const shown = apply();
        gsap.fromTo(shown, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, clearProps: "transform,opacity" });
      }
    });
  }));

  // view toggle
  const work = $("[data-work]");
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => {
    const idx = b.dataset.view === "index";
    $$("[data-view]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    gsap.to(work, { opacity: 0, duration: 0.18, ease: "power2.in", onComplete: () => {
      work.classList.toggle("is-index", idx);
      ScrollTrigger.refresh();
      gsap.to(work, { opacity: 1, duration: 0.35, ease: "power2.out" });
      if (idx && !REDUCED) gsap.from($$(".index__row", index), { y: 16, opacity: 0, stagger: 0.03, duration: 0.5, ease: "expo.out" });
    }});
  }));

  // index hover peek
  if (FINE && !REDUCED) {
    const peek = $("[data-peek]"); const pv = $("video", peek);
    const xTo = gsap.quickTo(peek, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(peek, "y", { duration: 0.55, ease: "power3" });
    index.addEventListener("pointermove", (e) => { xTo(e.clientX + 40); yTo(e.clientY); });
    $$(".index__row[data-clip-src]", index).forEach((r) => r.addEventListener("pointerenter", () => {
      if (pv.getAttribute("src") !== r.dataset.clipSrc) pv.src = r.dataset.clipSrc;
      pv.play().catch(() => {});
      gsap.to(peek, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" });
    }));
    index.addEventListener("pointerleave", () => { gsap.to(peek, { opacity: 0, scale: 0.9, duration: 0.25 }); pv.pause(); });
  }

  // cards rise in as they enter
  if (!REDUCED) {
    $$(".card", grid).forEach((c) => {
      entrances.push(gsap.from(c, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 92%", once: true } }));
    });
  }
  bindCards(grid);
};
