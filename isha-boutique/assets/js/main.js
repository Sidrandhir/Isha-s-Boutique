/* =============================================================
   ISHA'S BOUTIQUE — shared site behaviour
   ============================================================= */

// WhatsApp number (from business card). Change here once to update everywhere.
const WA_NUMBER = "919422800098"; // country code 91 + 94228 00098

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
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

    const dots = slides.map((_, i) => {
      if (!dotsWrap) return null;
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => {
        go(i);
        restart();
      });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(next) {
      idx = (next + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d && d.classList.toggle("is-active", i === idx));
    }
    function start() {
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : restart()
    );

    go(0);
    start();
  });

  /* ---------- Product cards -> WhatsApp enquiry ---------- */
  document.querySelectorAll("[data-enquire]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const piece = el.dataset.enquire;
      const text = encodeURIComponent(
        `Hi Isha's Boutique! I'd like to know more about "${piece}" — availability, sizes and price please.`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
    });
  });

  /* ---------- Lead form -> WhatsApp auto-message ---------- */
  const leadForm = document.getElementById("lead-form");
  if (leadForm) {
    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (sel) => leadForm.querySelector(sel)?.value.trim() || "";
      const name = val("#f-name");
      const phone = val("#f-phone");
      const service = val("#f-service");
      const message = val("#f-message");

      const lines = [
        `Hi Isha's Boutique! I'm ${name || "a visitor from your website"}.`,
        service ? `I'm interested in: ${service}.` : "",
        message ? `Message: ${message}` : "",
        phone ? `You can reach me back on: ${phone}` : "",
      ].filter(Boolean);

      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
    });
  }

  /* ---------- Newsletter -> WhatsApp opt-in ---------- */
  const news = document.getElementById("newsletter-form");
  if (news) {
    news.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = news.querySelector("input")?.value.trim() || "";
      const text = encodeURIComponent(
        `Hi Isha's Boutique! Please add me to your new-arrivals list.${email ? ` My email: ${email}` : ""}`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
      news.reset();
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("#year, [data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
