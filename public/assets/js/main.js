/* =============================================================================
   Jerwin Babatugon — Portfolio. Vanilla, dependency-free.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function setPressed() {
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(currentTheme() === "light"));
  }
  setPressed();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "light" ? "#ffffff" : "#0b0c0f");
      setPressed();
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");
  var lastFocused = null;

  function openNav() {
    nav.setAttribute("data-open", "true");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    lastFocused = document.activeElement;
    var first = nav.querySelector("a, button");
    if (first) first.focus();
    document.addEventListener("keydown", onNavKeydown);
  }
  function closeNav(restore) {
    nav.removeAttribute("data-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.removeEventListener("keydown", onNavKeydown);
    if (restore && lastFocused) lastFocused.focus();
  }
  function onNavKeydown(e) {
    if (e.key === "Escape") { closeNav(true); return; }
    if (e.key !== "Tab") return;
    var focusables = nav.querySelectorAll("a, button");
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (nav.getAttribute("data-open") === "true") closeNav(true); else openNav();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeNav(false);
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var setScrolled = function () {
      header.setAttribute("data-scrolled", String(window.scrollY > 8));
    };
    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });
  }

  /* ---------- Scrollspy for nav links ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var sections = navLinks
    .map(function (l) { return document.getElementById(l.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (l) {
          l.toggleAttribute("aria-current", l.getAttribute("href") === "#" + id);
          if (l.getAttribute("href") === "#" + id) l.setAttribute("aria-current", "true");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");
  var revealAll = function () {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { revObs.observe(el); });
    // Safety net: never leave content hidden (e.g. observer/transition edge cases).
    setTimeout(revealAll, 2500);
    window.addEventListener("pageshow", revealAll);
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var statusEl = document.getElementById("cf-status");
    var submitBtn = document.getElementById("cf-submit");

    var setError = function (id, msg) {
      var input = document.getElementById(id);
      var err = document.getElementById(id + "-err");
      if (err) err.textContent = msg || "";
      if (input) {
        if (msg) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
      return !msg;
    };

    var validate = function () {
      var ok = true;
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      ok = setError("cf-name", name ? "" : "Please enter your name.") && ok;
      ok = setError("cf-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email.") && ok;
      ok = setError("cf-msg", msg.length >= 10 ? "" : "Please enter a short message (at least 10 characters).") && ok;
      return ok;
    };

    var showStatus = function (state, text) {
      statusEl.hidden = false;
      statusEl.setAttribute("data-state", state);
      statusEl.textContent = text;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.botcheck && form.botcheck.value) return; // honeypot
      if (!validate()) return;

      submitBtn.disabled = true;
      var original = submitBtn.textContent;
      submitBtn.textContent = "Sending…";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showStatus("ok", "Thanks — your message has been sent. I'll reply by email.");
          } else {
            showStatus("error", (res.d && res.d.message) || "Something went wrong. Please email jerbabats@gmail.com instead.");
          }
        })
        .catch(function () {
          showStatus("error", "Network error. Please email jerbabats@gmail.com instead.");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        });
    });
  }

  /* ---------- Scroll-snap gallery (case-study pages) ---------- */
  document.querySelectorAll(".gallery").forEach(function (gallery) {
    var track = gallery.querySelector(".gallery__track");
    var prev = gallery.querySelector('[data-gallery="prev"]');
    var next = gallery.querySelector('[data-gallery="next"]');
    if (!track) return;
    var step = function () {
      var fig = track.querySelector("figure");
      return fig ? fig.getBoundingClientRect().width + 16 : track.clientWidth;
    };
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
  });
})();
