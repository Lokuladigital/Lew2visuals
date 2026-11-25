/*
  Halftone dot wordmark — "LEW2VISUALS" drawn as a field of dots.
  Pointer pushes dots away; click/tap sends a shockwave. Dots spring home.
  Pauses itself when off-screen or settled.
*/
(function () {
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function DotWordmark(canvas, opts = {}) {
    const ctx = canvas.getContext("2d");
    const parts = opts.parts || [["LEW", "#f1f1f1"], ["2", "#6e6e6e"], ["VISUALS", "#f1f1f1"]];
    const fontFamily = opts.font || "Anton";
    let W = 0, H = 0, dpr = 1, gap = 9, dots = [], raf = 0, visible = false, awake = false;
    const ptr = { x: -9999, y: -9999, active: false };

    function build() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      gap = Math.max(5, Math.round(W / 170));

      // Render text into an offscreen buffer, one colour channel per part, then sample a grid.
      const off = document.createElement("canvas");
      off.width = Math.round(W); off.height = Math.round(H);
      const o = off.getContext("2d");
      let size = H * 1.18;
      o.font = `${size}px "${fontFamily}"`;
      const full = parts.map((p) => p[0]).join("");
      let tw = o.measureText(full).width;
      size = Math.min(size, size * (W / tw));       // fit width edge to edge
      o.font = `${size}px "${fontFamily}"`;
      tw = o.measureText(full).width;
      o.textBaseline = "alphabetic";
      const m = o.measureText(full);
      const asc = m.actualBoundingBoxAscent || size * 0.75;
      const desc = m.actualBoundingBoxDescent || 0;
      const y = (H + asc - desc) / 2;
      let x = (W - tw) / 2;
      parts.forEach((p, i) => {
        o.fillStyle = i === 1 ? "rgb(0,255,0)" : "rgb(255,0,0)";
        o.fillText(p[0], x, y);
        x += o.measureText(p[0]).width;
      });
      const data = o.getImageData(0, 0, off.width, off.height).data;
      dots = [];
      for (let gy = gap / 2; gy < H; gy += gap) {
        for (let gx = gap / 2; gx < W; gx += gap) {
          const i = (Math.floor(gy) * off.width + Math.floor(gx)) * 4;
          const rr = data[i], gg = data[i + 1];
          const v = Math.max(rr, gg) / 255;
          if (v < 0.12) continue;
          dots.push({
            hx: gx, hy: gy, x: gx, y: gy, vx: 0, vy: 0,
            r: (gap * 0.42) * (0.45 + 0.55 * v),
            c: gg > rr ? parts[1][1] : parts[0][1]
          });
        }
      }
      draw();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      let last = "";
      for (const d of dots) {
        if (d.c !== last) { ctx.fillStyle = d.c; last = d.c; }
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
      }
    }

    function step() {
      raf = 0;
      const R = Math.max(90, W * 0.07);
      let energy = 0;
      for (const d of dots) {
        if (ptr.active) {
          const dx = d.x - ptr.x, dy = d.y - ptr.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < R * R) {
            const dist = Math.sqrt(dist2) || 1;
            const f = (1 - dist / R) * 2.4;
            d.vx += (dx / dist) * f; d.vy += (dy / dist) * f;
          }
        }
        // critically-damped-ish spring home
        d.vx += (d.hx - d.x) * 0.06; d.vy += (d.hy - d.y) * 0.06;
        d.vx *= 0.82; d.vy *= 0.82;
        d.x += d.vx; d.y += d.vy;
        energy += Math.abs(d.vx) + Math.abs(d.vy) + Math.abs(d.hx - d.x) * 0.1;
      }
      draw();
      awake = ptr.active || energy > 0.5;
      if (awake && visible) raf = requestAnimationFrame(step);
    }
    function wake() { if (!raf && visible && !REDUCED) raf = requestAnimationFrame(step); }

    function local(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const p = local(e); ptr.x = p.x; ptr.y = p.y; ptr.active = true; wake();
    });
    canvas.addEventListener("pointerleave", () => { ptr.active = false; wake(); });
    canvas.addEventListener("pointerdown", (e) => {
      if (REDUCED) return;
      const p = local(e);
      const R = W * 0.22;
      for (const d of dots) {
        const dx = d.x - p.x, dy = d.y - p.y, dist = Math.hypot(dx, dy) || 1;
        if (dist < R) { const f = (1 - dist / R) * 26; d.vx += (dx / dist) * f; d.vy += (dy / dist) * f; }
      }
      wake();
      opts.onBurst && opts.onBurst();
    });

    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }, { rootMargin: "100px" }).observe(canvas);
    let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(build, 120); }).observe(canvas);

    (document.fonts ? document.fonts.load(`40px "${fontFamily}"`).then(() => document.fonts.ready) : Promise.resolve()).then(build);
    return { rebuild: build };
  }

  window.DotWordmark = DotWordmark;
})();
