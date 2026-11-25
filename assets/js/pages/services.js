/* Services page */
window.L2V.page = function () {
  const D = window.L2V;
  const { $, $$, tc, REDUCED, loadVideo } = D.ui;

  /* ---------- Sticky media + service list ---------- */
  const frame = $("[data-svc-frame]");
  const tag = $("[data-svc-tag]");
  const vtc = $("[data-svc-tc]");
  const list = $("[data-svc-list]");
  list.innerHTML = D.services.map((s) => `
    <article class="svc__item" id="${s.id}" data-svc="${s.id}">
      <div class="frame"><video muted loop playsinline preload="none" data-src="${D.clipSrc(s.clip)}" poster="${D.posterSrc(s.clip)}"></video></div>
      <span class="mono mono--dim">${s.seq}</span>
      <h2 class="display display--m">${s.title}</h2>
      <span class="mono mono--dim" style="margin-top:12px">For: ${s.for}</span>
      <ul>${s.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      <a class="link-u mono" href="contact.html?type=${encodeURIComponent(s.title)}" style="margin-top:28px;align-self:flex-start">Book ${s.title.toLowerCase()} →</a>
    </article>`).join("");

  const vids = D.services.map((s, i) => {
    const v = document.createElement("video");
    Object.assign(v, { muted: true, loop: true, playsInline: true, preload: i ? "none" : "auto", poster: D.posterSrc(s.clip) });
    v.dataset.src = D.clipSrc(s.clip);
    frame.prepend(v);
    return v;
  });

  let current = -1;
  const activate = (i) => {
    if (i === current) return;
    current = i;
    vids.forEach((v, j) => {
      if (j === i) { loadVideo(v); v.classList.add("is-on"); v.play().catch(() => {}); }
      else { v.classList.remove("is-on"); setTimeout(() => v.pause(), 600); }
    });
    $$("[data-svc]").forEach((el, j) => el.classList.toggle("is-on", j === i));
    tag.textContent = `${D.services[i].seq} — ${D.services[i].title}`;
    if (!REDUCED) gsap.fromTo(frame, { clipPath: "inset(4% 4% 4% 4%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.out" });
  };
  $$("[data-svc]").forEach((el, i) => {
    ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && activate(i) });
  });
  activate(0);
  const tick = () => { const v = vids[current]; if (v) vtc.textContent = tc(v.currentTime); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);

  // mobile: inline clips play when visible
  if (matchMedia("(max-width: 820px)").matches) {
    $$(".svc__item .frame video").forEach((v) => new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { loadVideo(v); v.play().catch(() => {}); } else v.pause();
    }, { threshold: 0.5 }).observe(v));
  }

  // deep link from home (#streetwear etc.)
  if (location.hash) {
    const t = $(location.hash);
    if (t) setTimeout(() => (D.lenis ? D.lenis.scrollTo(t, { offset: -80, immediate: true }) : t.scrollIntoView()), 60);
  }

  /* ---------- Process: a playhead scrubs the four clips ---------- */
  const P = D.process;
  const total = P.reduce((a, s) => a + s.span, 0);
  $("[data-pwhens]").innerHTML = P.map((s) => `<span style="flex:${s.span}">${s.when}</span>`).join("");
  $("[data-pclips]").innerHTML = P.map((s) => `<div class="ptrack__clip" style="flex:${s.span}"><i></i><span>${s.id}</span></div>`).join("");
  $("[data-psteps]").innerHTML = P.map((s, i) => `
    <div class="pstep"><span class="mono mono--dim">0${i + 1} / ${s.when}</span><h3>${s.title}</h3><p>${s.body}</p></div>`).join("");
  const clips = $$(".ptrack__clip"), fills = clips.map((c) => $("i", c)), steps = $$(".pstep"), phead = $("[data-phead]");
  const bounds = []; let acc = 0;
  P.forEach((s) => { bounds.push([acc / total, (acc + s.span) / total]); acc += s.span; });
  const setProgress = (p) => {
    phead.style.left = p * 100 + "%";
    bounds.forEach(([a, b], i) => {
      const local = Math.min(1, Math.max(0, (p - a) / (b - a)));
      fills[i].style.transform = `scaleX(${local})`;
      const on = p >= a && (p < b || (i === bounds.length - 1 && p >= b));
      clips[i].classList.toggle("is-on", on);
      steps[i].classList.toggle("is-on", p >= a);
    });
  };
  if (!REDUCED && matchMedia("(min-width: 821px)").matches) {
    ScrollTrigger.create({
      trigger: "[data-process-pin]", start: "top top", end: "+=" + innerHeight * 1.6, pin: true, scrub: true,
      onUpdate: (self) => setProgress(self.progress)
    });
    setProgress(0);
  } else setProgress(1);

  /* ---------- FAQ: smooth open/close ---------- */
  $$("[data-faq] details").forEach((d) => {
    const s = $("summary", d), body = $(".faq__body", d);
    s.addEventListener("click", (e) => {
      if (REDUCED) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: 0.35, ease: "power2.inOut", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.45, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });
};
