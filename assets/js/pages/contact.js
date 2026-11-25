/* Contact page — inquiry form */
window.L2V.page = function () {
  const D = window.L2V, S = D.site;
  const { $, $$, REDUCED } = D.ui;
  const form = $("[data-form]");

  const OPTIONS = {
    type: [...D.services.map((s) => s.title), "Something else"],
    location: ["Edmonton", "Calgary", "Toronto", "Somewhere else"],
    budget: ["Under $1k", "$1k – $3k", "$3k – $7k", "$7k+", "Not sure yet"]
  };
  $$("[data-chips]", form).forEach((wrap) => {
    const key = wrap.dataset.chips, multi = wrap.hasAttribute("data-multi");
    const hidden = $(`input[name="${key}"]`, form);
    wrap.innerHTML = OPTIONS[key].map((o) => `<button type="button" class="chip" aria-pressed="false" data-v="${o}">${o}</button>`).join("");
    const sync = () => (hidden.value = $$(".chip[aria-pressed='true']", wrap).map((c) => c.dataset.v).join(", "));
    $$(".chip", wrap).forEach((c) => c.addEventListener("click", () => {
      const on = c.getAttribute("aria-pressed") !== "true";
      if (!multi) $$(".chip", wrap).forEach((x) => x.setAttribute("aria-pressed", "false"));
      c.setAttribute("aria-pressed", String(on));
      sync();
    }));
  });

  // preselect type from ?type= (links from the services page)
  const pre = new URLSearchParams(location.search).get("type");
  if (pre) { const c = $(`[data-chips="type"] .chip[data-v="${CSS.escape(pre)}"]`, form); c && c.click(); }

  // inline validation, on blur then live once touched
  const rules = {
    name: (v) => (v.trim().length > 1 ? "" : "Add your name so Lewis knows who to reply to."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "That email doesn't look right."),
    details: (v) => (v.trim().length > 9 ? "" : "A sentence or two about the shoot helps a lot.")
  };
  const check = (input) => {
    const rule = rules[input.name]; if (!rule) return true;
    const msg = rule(input.value);
    const field = input.closest(".field");
    field.classList.toggle("is-invalid", !!msg);
    $(".field__err", field).textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };
  Object.keys(rules).forEach((n) => {
    const i = form.elements[n];
    i.addEventListener("blur", () => { i.dataset.touched = "1"; check(i); });
    i.addEventListener("input", () => i.dataset.touched && check(i));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).map((n) => form.elements[n]).filter((i) => !check(i));
    if (bad.length) { bad[0].focus(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    const render = $("[data-render]"), bar = $(".render__bar i", render), pct = $("[data-render-pct]", render);
    const title = $("[data-render-title]", render), msg = $("[data-render-msg]", render);
    render.classList.add("is-on");
    $$(".field, fieldset, .form__foot", form).forEach((el) => (el.style.display = "none"));

    let sent = false;
    if (S.formEndpoint) {
      try {
        const r = await fetch(S.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        sent = r.ok;
      } catch (_) { sent = false; }
    }

    const o = { p: 0 };
    const finish = () => {
      title.textContent = sent ? "Render complete — inquiry sent" : "Render complete";
      if (sent) {
        msg.textContent = `Thanks ${data.name.split(" ")[0]}. Lewis replies ${S.replies.toLowerCase()}.`;
      } else {
        // no form backend yet: hand off to the visitor's email app with everything filled in
        const body = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}: ${v}`).join("\n");
        const href = `mailto:${S.email}?subject=${encodeURIComponent("New project — " + (data.type || "Inquiry"))}&body=${encodeURIComponent(body)}`;
        msg.innerHTML = `Your brief is ready. <a class="link-u" href="${href}" style="color:var(--fg)">Open it in your email app →</a>`;
      }
    };
    if (REDUCED) { bar.style.transform = "scaleX(1)"; pct.textContent = "100%"; finish(); return; }
    gsap.to(o, { p: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => { bar.style.transform = `scaleX(${o.p / 100})`; pct.textContent = Math.round(o.p) + "%"; }, onComplete: finish });
    ScrollTrigger.refresh();
  });
};
