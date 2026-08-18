(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    document.body.classList.remove("loading");

    setupHeader();
    setupMobileMenu();
    setupHeroCarousel();
    setupReveal();
    setupNewsletter();
    setupBag();
    setupYear();
  }

  /* Sticky header background swap on scroll */
  function setupHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile hamburger menu */
  function setupMobileMenu() {
    var btn = document.getElementById("menuBtn");
    var nav = document.getElementById("mobileNav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Hero slide carousel: dots, arrows, autoplay */
  function setupHeroCarousel() {
    var slidesWrap = document.getElementById("heroSlides");
    var dotsWrap = document.getElementById("heroDots");
    if (!slidesWrap || !dotsWrap) return;

    var slides = Array.prototype.slice.call(slidesWrap.querySelectorAll(".hero-slide"));
    if (!slides.length) return;

    var current = 0;
    var timer = null;
    var AUTOPLAY_MS = 5500;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, AUTOPLAY_MS);
    }

    var prevBtn = document.getElementById("heroPrev");
    var nextBtn = document.getElementById("heroNext");
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });

    restart();
  }

  /* Fade-in-on-scroll for [data-reveal] elements */
  function setupReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* Newsletter form: front-end only confirmation */
  function setupNewsletter() {
    var form = document.getElementById("newsletterForm");
    var note = document.getElementById("newsletterNote");
    if (!form || !note) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      if (!input || !input.value) return;
      note.textContent = "Thank you — you're on the list, " + input.value.split("@")[0] + ".";
      note.classList.add("success");
      form.reset();
      showToast("Welcome to the inner circle.");
    });
  }

  /* Bag button placeholder interaction */
  function setupBag() {
    var bagBtn = document.getElementById("bagBtn");
    var accountBtn = document.getElementById("accountBtn");
    if (bagBtn) {
      bagBtn.addEventListener("click", function () {
        showToast("Your bag is empty. Start exploring the collections.");
      });
    }
    if (accountBtn) {
      accountBtn.addEventListener("click", function () {
        showToast("Account access is coming soon.");
      });
    }
  }

  function setupYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3200);
  }
})();
