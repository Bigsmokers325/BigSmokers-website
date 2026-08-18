/* ============================================================
   دموع (Doumou) — continuous card tilt
   After a product card has made its first entrance (reveal.js adds
   .in-view), it keeps reacting to scroll: it tilts and lifts based
   on how far it sits from the vertical center of the viewport, and
   flattens out as it passes through center. This runs continuously
   on every scroll, not just once.
   ============================================================ */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const state = new WeakMap(); // card -> {rotate, lift, scale}
  const hovered = new WeakSet();
  const active = new Set();

  function applyTransform(card) {
    const s = state.get(card) || { rotate: 0, lift: 0, scale: 1 };
    const hoverLift = hovered.has(card) ? -4 : 0;
    card.style.transform =
      `perspective(900px) rotateX(${s.rotate}deg) translateY(${s.lift + hoverLift}px) scale(${s.scale})`;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          active.add(entry.target);
        } else {
          active.delete(entry.target);
          state.delete(entry.target);
          entry.target.style.transform = "";
        }
      });
    },
    { rootMargin: "20% 0px 20% 0px", threshold: 0 }
  );

  function track(card) {
    io.observe(card);
  }

  new MutationObserver(() => grid.querySelectorAll(".card").forEach(track)).observe(grid, { childList: true });
  grid.querySelectorAll(".card").forEach(track);

  // Fold hover into the same transform pipeline so it doesn't fight the
  // inline style the scroll loop is writing every frame.
  grid.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".card");
    if (card && !hovered.has(card)) {
      hovered.add(card);
      applyTransform(card);
    }
  });
  grid.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".card");
    if (card && !card.contains(e.relatedTarget)) {
      hovered.delete(card);
      applyTransform(card);
    }
  });

  let ticking = false;
  function update() {
    ticking = false;
    const vh = window.innerHeight;
    active.forEach((card) => {
      if (!card.classList.contains("in-view")) return; // let the entrance finish first
      const r = card.getBoundingClientRect();
      const center = r.top + r.height / 2;
      let progress = (vh / 2 - center) / (vh / 2); // -1 top .. 0 center .. 1 bottom
      progress = Math.max(-1, Math.min(1, progress));
      state.set(card, {
        rotate: progress * -7,
        lift: progress * 14,
        scale: 1 - Math.abs(progress) * 0.035,
      });
      applyTransform(card);
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", () => requestAnimationFrame(update));

  requestAnimationFrame(update);
})();
