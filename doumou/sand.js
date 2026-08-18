/* ============================================================
   دموع (Doumou) — ambient sand field
   A soft field of drifting sand grains behind the page. Each grain
   has a depth: nearer grains are bigger, brighter, and move faster
   against scroll than distant ones, reading as a 3D drift rather
   than a flat scroll effect.
   ============================================================ */
(function () {
  const canvas = document.getElementById("sandCanvas");
  if (!canvas || typeof canvas.getContext !== "function") return;
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // CSS already hides the canvas in this case

  const GRAINS = [
    [182, 146, 79],   // gold
    [216, 189, 130],  // gold-light
    [140, 58, 74],    // rose
    [232, 208, 163],  // pale sand
  ];

  let W = 0, H = 0, DPR = 1;
  let particles = [];

  function makeParticles() {
    const isSmall = W < 760;
    const count = Math.round((isSmall ? 55 : 140) * Math.min(1, (W * H) / (1280 * 900)));
    particles = Array.from({ length: Math.max(30, count) }, () => {
      const depth = Math.random(); // 0 = far, 1 = near
      const color = GRAINS[(Math.random() * GRAINS.length) | 0];
      return {
        x: Math.random() * W,
        baseY: Math.random() * (H + 120) - 60,
        depth,
        r: 0.7 + depth * 2.1,
        color,
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.4,
        driftAmp: 5 + depth * 16,
      };
    });
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    makeParticles();
  }

  let scrollY = window.scrollY;
  let targetScrollY = scrollY;
  window.addEventListener("scroll", () => { targetScrollY = window.scrollY; }, { passive: true });
  window.addEventListener("resize", resize);

  let t = 0;
  function frame() {
    t += 1;
    scrollY += (targetScrollY - scrollY) * 0.075; // eased, gives a settling/inertial drift

    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      const parallax = 0.12 + p.depth * 0.5; // nearer grains track scroll faster
      let y = (p.baseY - scrollY * parallax) % (H + 120);
      if (y < -60) y += H + 120;
      const x = p.x + Math.sin(t * 0.006 * p.speed + p.phase) * p.driftAmp;
      const alpha = 0.10 + p.depth * 0.30;
      const [r, g, b] = p.color;

      if (p.r > 1.6) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.r * 2.4);
        glow.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, p.r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();
