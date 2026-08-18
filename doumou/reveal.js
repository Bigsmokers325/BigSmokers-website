/* ============================================================
   دموع (Doumou) — scroll reveal
   Elements with class "reveal" tilt and lift into place (a soft
   3D rotateX + rise) the first time they cross into view. Product
   cards get this class at render time in app.js; call
   window.observeReveal(container) after adding new elements to a
   container to pick them up (used after each catalog render/page).
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    window.observeReveal = function (container) {
      const scope = container || document;
      scope.querySelectorAll(".reveal:not(.in-view)").forEach((el) => el.classList.add("in-view"));
    };
    document.addEventListener("DOMContentLoaded", () => window.observeReveal());
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  window.observeReveal = function (container) {
    const scope = container || document;
    const els = scope.querySelectorAll(".reveal:not(.in-view)");
    els.forEach((el, i) => {
      if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i * 0.05, 0.4) + "s";
      observer.observe(el);
    });
  };

  document.addEventListener("DOMContentLoaded", () => window.observeReveal());
})();
