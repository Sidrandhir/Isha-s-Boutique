/* =============================================================
   ISHA'S BOUTIQUE — shared site behaviour
   ============================================================= */

// WhatsApp number (from business card). Change here once to update everywhere.
const WA_NUMBER = "919422800098"; // country code 91 + 94228 00098

const waLink = (text) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    const setOpen = (open) => {
      navLinks.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", () =>
      setOpen(!navLinks.classList.contains("open"))
    );

    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );

    // Escape closes the menu and hands focus back to the button that opened it,
    // so keyboard users are never stranded inside a closed menu.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tapping outside the open menu closes it.
    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("open")) return;
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion()) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Marquee: duplicate the track so the loop is seamless ---------- */
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee-track");
    if (!track || track.dataset.cloned === "true") return;
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.dataset.cloned = "true";
    track.dataset.cloned = "true";
    marquee.appendChild(clone);
  });

  /* ---------- Hero slideshow (fade, autoplay, dots) ---------- */
  document.querySelectorAll(".hero-slides").forEach((root) => {
    const slides = Array.from(root.querySelectorAll(".hero-slide"));
    if (slides.length < 2) return;

    const hero = root.closest(".hero") || root.parentElement;
    const dotsWrap = hero.querySelector(".hero-dots");
    const delay = Math.max(2500, parseInt(root.dataset.interval || "5500", 10));
    let idx = 0;
    let timer = null;
    let paused = prefersReducedMotion(); // never auto-advance if motion is reduced

    const dots = slides.map((_, i) => {
      if (!dotsWrap) return null;
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => {
        go(i);
        if (!paused) restart();
      });
      dotsWrap.appendChild(b);
      return b;
    });

    // WCAG 2.2.2: anything that moves automatically needs a visible pause.
    let pauseBtn = null;
    if (dotsWrap) {
      pauseBtn = document.createElement("button");
      pauseBtn.type = "button";
      pauseBtn.className = "hero-pause";
      dotsWrap.appendChild(pauseBtn);
      pauseBtn.addEventListener("click", () => setPaused(!paused));
    }

    const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.4" height="12" rx="1"/><rect x="13.6" y="6" width="3.4" height="12" rx="1"/></svg>';
    const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 6.2v11.6c0 .8.9 1.3 1.6.9l9-5.8c.6-.4.6-1.4 0-1.8l-9-5.8c-.7-.4-1.6.1-1.6.9z"/></svg>';

    function syncPauseBtn() {
      if (!pauseBtn) return;
      pauseBtn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
      pauseBtn.setAttribute(
        "aria-label",
        paused ? "Play the slideshow" : "Pause the slideshow"
      );
    }
    function setPaused(next) {
      paused = next;
      paused ? stop() : restart();
      syncPauseBtn();
    }

    function go(next) {
      idx = (next + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d && d.classList.toggle("is-active", i === idx));
    }
    function start() {
      if (paused) return;
      timer = setInterval(() => go(idx + 1), delay);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    function restart() {
      stop();
      start();
    }

    // Hover pause is a convenience; it must not override an explicit pause.
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", () => !paused && start());
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : !paused && restart()
    );

    go(0);
    syncPauseBtn();
    start();
  });

  /* ---------- Product cards -> WhatsApp enquiry ----------
     These are real links with a real href rather than window.open() calls, so
     they survive popup blockers and still support middle-click / open-in-new-tab. */
  document.querySelectorAll("[data-enquire]").forEach((el) => {
    const piece = el.dataset.enquire;
    el.href = waLink(
      `Hi Isha's Boutique! I'd like to know more about "${piece}" — availability, sizes and price please.`
    );
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Lead form -> WhatsApp auto-message ---------- */
  const leadForm = document.getElementById("lead-form");
  if (leadForm) {
    const status = document.getElementById("form-status");
    const field = (id) => leadForm.querySelector(id);

    const showError = (input, message) => {
      const row = input.closest(".form-row");
      const err = row && row.querySelector(".field-error");
      input.setAttribute("aria-invalid", "true");
      if (err) err.textContent = message;
    };
    const clearError = (input) => {
      const row = input.closest(".form-row");
      const err = row && row.querySelector(".field-error");
      input.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
    };

    leadForm.querySelectorAll("input, select, textarea").forEach((input) =>
      input.addEventListener("input", () => clearError(input))
    );

    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = field("#f-name");
      const phone = field("#f-phone");
      const service = field("#f-service");
      const message = field("#f-message");

      let firstBad = null;
      [name, phone].forEach(clearError);

      if (!name.value.trim()) {
        showError(name, "Please tell us your name.");
        firstBad = firstBad || name;
      }
      // Optional, but if given it has to look like a real Indian mobile number.
      const digits = phone.value.replace(/\D/g, "");
      if (phone.value.trim() && (digits.length < 10 || digits.length > 12)) {
        showError(phone, "That doesn't look like a valid phone number.");
        firstBad = firstBad || phone;
      }

      if (firstBad) {
        firstBad.focus();
        if (status) {
          status.className = "form-status is-error";
          status.textContent = "Please fix the highlighted fields.";
        }
        return;
      }

      const lines = [
        `Hi Isha's Boutique! I'm ${name.value.trim()}.`,
        service.value ? `I'm interested in: ${service.value}.` : "",
        message.value.trim() ? `Message: ${message.value.trim()}` : "",
        phone.value.trim() ? `You can reach me back on: ${phone.value.trim()}` : "",
      ].filter(Boolean);

      const url = waLink(lines.join("\n"));
      const win = window.open(url, "_blank", "noopener");

      // A blocked popup used to fail silently. Now it degrades to a visible link.
      if (status) {
        if (!win || win.closed || typeof win.closed === "undefined") {
          status.className = "form-status is-error";
          status.innerHTML =
            'Your browser blocked the new tab. ' +
            `<a href="${url}" target="_blank" rel="noopener">Open WhatsApp manually &rarr;</a>`;
        } else {
          status.className = "form-status is-ok";
          status.textContent =
            "Opening WhatsApp with your message ready to send — just press send.";
        }
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("#year, [data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
