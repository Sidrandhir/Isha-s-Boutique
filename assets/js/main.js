/* =============================================================
   ISHA'S BOUTIQUE — shared site behaviour & gallery engine
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

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });

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

  /* ---------- Marquee ---------- */
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
    let paused = prefersReducedMotion();

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", () => !paused && start());
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : !paused && restart()
    );

    go(0);
    syncPauseBtn();
    start();
  });

  /* ---------- Product cards -> WhatsApp enquiry ---------- */
  document.querySelectorAll("[data-enquire]").forEach((el) => {
    const piece = el.dataset.enquire;
    el.href = waLink(
      `Hi Isha's Boutique! I'd like to know more about "${piece}" — availability, sizes and price please.`
    );
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Lead form ---------- */
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

  /* ---------- HERO CAROUSEL LOGIC ---------- */
  const heroV3 = document.querySelector(".hero-v5") || document.querySelector(".hero-v4") || document.getElementById("hero-v3");
  if (heroV3) {
    const slides = Array.from(heroV3.querySelectorAll(".hv5-slide, .hv3-slide"));
    const thumbs = Array.from(heroV3.querySelectorAll(".hv5-thumb, .hv3-thumb"));
    const prevBtn = document.getElementById("hv3-prev-btn");
    const nextBtn = document.getElementById("hv3-next-btn");
    const currentNum = document.getElementById("hv3-current-num");
    const progressBar = document.getElementById("hv3-progress");

    let currentIdx = 0;
    let autoTimer = null;

    function goToSlide(index) {
      currentIdx = (index + slides.length) % slides.length;

      slides.forEach((s, i) => s.classList.toggle("is-active", i === currentIdx));
      thumbs.forEach((t, i) => t.classList.toggle("is-active", i === currentIdx));

      if (currentNum) {
        currentNum.textContent = String(currentIdx + 1).padStart(2, "0");
      }
      if (progressBar) {
        progressBar.style.width = `${((currentIdx + 1) / slides.length) * 100}%`;
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (!prefersReducedMotion()) {
        autoTimer = setInterval(() => goToSlide(currentIdx + 1), 5000);
      }
    }

    function stopAutoPlay() {
      if (autoTimer) clearInterval(autoTimer);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentIdx - 1);
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToSlide(currentIdx + 1);
        startAutoPlay();
      });
    }

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const slideIdx = parseInt(thumb.dataset.slide, 10);
        goToSlide(slideIdx);
        startAutoPlay();
      });
    });

    heroV3.addEventListener("mouseenter", stopAutoPlay);
    heroV3.addEventListener("mouseleave", startAutoPlay);

    goToSlide(0);
    startAutoPlay();
  }

  /* =============================================================
     COMPLETE PORTFOLIO DATABASE & LIGHTBOX WITH ZOOM ENGINE
     ============================================================= */

  const lookbookImages = [
    { src: "assets/images/hero-saree.png", alt: "Magenta Silk Saree with Hand-Embroidered Zardosi Blouse", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-01.jpg", alt: "Handcrafted Silk Frock with Traditional Zari Border", cat: "kids" },
    { src: "assets/images/Gallery/gallery-02.jpg", alt: "Emerald Green Festive Anarkali Gown", cat: "bridal" },
    { src: "assets/images/Gallery/gallery-03.jpg", alt: "Pastel Floral Smocked Kids Outfit", cat: "kids" },
    { src: "assets/images/Gallery/gallery-04.jpg", alt: "Royal Purple Zari Bordered Girl's Dress", cat: "kids" },
    { src: "assets/images/Gallery/gallery-05.jpg", alt: "Custom Zardosi Handwork Designer Blouse", cat: "embroidery" },
    { src: "assets/images/Gallery/gallery-06.jpg", alt: "Crimson Red Bridal Dupatta & Lehenga Detail", cat: "bridal" },
    { src: "assets/images/Gallery/gallery-07.jpg", alt: "Traditional Maharastrian Paithani Silk Saree", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-08.jpg", alt: "Yellow Handblock Printed Cotton Kurta Set", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-09.jpg", alt: "Designer Heavy Brocade Lehenga Set", cat: "bridal" },
    { src: "assets/images/Gallery/gallery-10.jpg", alt: "Cute Smocked Cotton Summer Frock", cat: "kids" },
    { src: "assets/images/Gallery/gallery-11.jpg", alt: "Royal Blue Hand-Embroidered Silk Blouse", cat: "embroidery" },
    { src: "assets/images/Gallery/gallery-12.jpg", alt: "Lavender Butterfly Organza Party Gown", cat: "kids" },
    { src: "assets/images/Gallery/gallery-13.jpg", alt: "Mustard Yellow Silk Saree with Zari Motif", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-14.jpg", alt: "Teal Blue Silk Anarkali Dress", cat: "bridal" },
    { src: "assets/images/Gallery/gallery-15.jpg", alt: "Rose Pink Smocked Cotton Dress for Girls", cat: "kids" },
    { src: "assets/images/Gallery/gallery-16.jpg", alt: "Gold Thread Cutwork Designer Blouse Back", cat: "embroidery" },
    { src: "assets/images/Gallery/gallery-17.jpg", alt: "Royal Ruby Satin Dress with Bow & Pearls", cat: "kids" },
    { src: "assets/images/Gallery/gallery-18.jpg", alt: "Traditional Festive Kurta Set for Kids", cat: "kids" },
    { src: "assets/images/Gallery/gallery-19.jpg", alt: "Zardosi Embroidered Bridal Velvet Blouse", cat: "embroidery" },
    { src: "assets/images/Gallery/gallery-20.jpg", alt: "Pastel Pink Smocked Linen Frock", cat: "kids" },
    { src: "assets/images/Gallery/gallery-21.jpg", alt: "Victorian Lace Heirloom Gown", cat: "kids" },
    { src: "assets/images/Gallery/gallery-22.jpg", alt: "Canary Yellow Smocked Daisy Dress", cat: "kids" },
    { src: "assets/images/Gallery/gallery-23.jpg", alt: "Heavy Peacock Zardosi Work Bridal Lehenga", cat: "bridal" },
    { src: "assets/images/Gallery/gallery-24.jpg", alt: "Mustard Handblock Printed Saree", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-25.jpg", alt: "Teal Paithani Silk Saree Pallu", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-26.jpg", alt: "Sky Blue Pearl-Smocked Linen Frock", cat: "kids" },
    { src: "assets/images/Gallery/gallery-27.jpg", alt: "Sunlit Botanical Cotton Midi Dress", cat: "sarees" },
    { src: "assets/images/Gallery/gallery-28.jpg", alt: "Ivory Sheer Organza Dream Gown", cat: "bridal" },
    { src: "assets/images/collection/crimson-bridal-lehenga.png", alt: "Crimson Red Bridal Lehenga with Gold Peacock Embroidery", cat: "bridal" },
    { src: "assets/images/collection/mustard-handblock-saree.png", alt: "Mustard Handblock Printed Saree in Artisan Studio", cat: "sarees" },
    { src: "assets/images/collection/lavender-butterfly-gown.png", alt: "Lavender Butterfly Organza Kids Gown", cat: "kids" },
    { src: "assets/images/collection/emerald-anarkali-gown.png", alt: "Emerald Silk Anarkali with Gold Thread Embroidery", cat: "bridal" },
    { src: "assets/images/collection/teal-paithani-saree.png", alt: "Teal Paithani Silk Saree with Peacock Pallu", cat: "sarees" },
    { src: "assets/images/collection/rose-smocked-frock-girl.png", alt: "Rose Garden Smocked Cotton Frock for Girls", cat: "kids" },
    { src: "assets/images/collection/kids-smocked-pastel.png", alt: "Pastel Pink Smocked Cotton Frock", cat: "kids" },
    { src: "assets/images/collection/kids-victorian-heirloom.jpg", alt: "Victorian Lace Heirloom Gown", cat: "kids" },
    { src: "assets/images/collection/kids-canary-yellow.png", alt: "Canary Yellow Smocked Daisy Frock", cat: "kids" },
    { src: "assets/images/collection/kids-festive-brocade.png", alt: "Royal Blue Gold Brocade Frock", cat: "kids" },
    { src: "assets/images/collection/kids-ruby-satin-bow.jpg", alt: "Royal Ruby Satin Pearl Bow Dress", cat: "kids" },
    { src: "assets/images/collection/kids-pearl-smocked.jpg", alt: "Sky Blue Pearl Smocked Linen Frock", cat: "kids" },
    { src: "assets/images/collection/couture-ivory-sheer.jpg", alt: "Ivory Sheer Organza Dream Gown", cat: "bridal" },
    { src: "assets/images/collection/couture-tiered-organza.jpg", alt: "Tiered Organza Layered Couture Dress", cat: "bridal" },
    { src: "assets/images/collection/atelier-miniature-dress.jpg", alt: "Atelier Miniature Designer Dress", cat: "kids" },
    { src: "assets/images/collection/women-garden-midi.jpg", alt: "Sunlit Garden Botanical Midi Dress", cat: "sarees" },
    { src: "assets/images/collection/women-sakura-chiffon.jpg", alt: "Cherry Blossom Off-Shoulder Chiffon Dress", cat: "bridal" },
    { src: "assets/images/flat-4-800w.webp", alt: "Paithani Zari Silk Frock", cat: "kids" },
    { src: "assets/images/hero-vogue-couture.png", alt: "Atelier Silk Couture", cat: "bridal" },
    { src: "assets/images/model-2-800w.webp", alt: "Lavender Smocked Organza Frock", cat: "kids" },
    { src: "assets/images/flat-5-800w.webp", alt: "Bluebell Bow Printed Cotton Frock", cat: "kids" },
    { src: "assets/images/model-6-800w.webp", alt: "Festive Gold Brocade Set", cat: "kids" },
    { src: "assets/images/hero-bridal-couture.png", alt: "Zardosi Handwork Bridal Blouse", cat: "embroidery" },
    { src: "assets/images/model-1-800w.webp", alt: "Lace Embroidery Gown", cat: "bridal" },
    { src: "assets/images/model-3-800w.webp", alt: "Wildflower Botanical Handprint Dress", cat: "sarees" },
    { src: "assets/images/model-8-800w.webp", alt: "Terracotta Rust Linen Smock Dress", cat: "kids" }
  ];

  /* ---------- FAST GALLERY GRID FILTERING ---------- */
  const galleryGrid = document.getElementById("main-gallery-grid");
  const filterBtns = document.querySelectorAll(".gallery-filters .filter-btn");

  if (galleryGrid) {
    const staticCards = galleryGrid.querySelectorAll(".gallery-card");

    staticCards.forEach((card) => {
      card.addEventListener("click", () => {
        const idx = parseInt(card.dataset.galleryIdx || "0", 10);
        openGallery(idx);
      });
    });

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        const filterCat = btn.dataset.filter || "all";

        staticCards.forEach((card) => {
          const cardCat = card.dataset.category;
          if (filterCat === "all" || cardCat === filterCat) {
            card.classList.remove("is-hidden");
          } else {
            card.classList.add("is-hidden");
          }
        });
      });
    });
  }

  /* ---------- LIGHTBOX MODAL WITH ZOOM ENGINE ---------- */
  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("modal-img-el");
  const modalImgWrap = document.getElementById("modal-img-wrap");
  const modalCaption = document.getElementById("modal-caption-el");
  const modalCounter = document.getElementById("modal-counter-el");
  const closeBtn = document.getElementById("modal-close-btn");
  const prevBtnModal = document.getElementById("modal-prev-btn");
  const nextBtnModal = document.getElementById("modal-next-btn");
  const openLookbookBtn = document.getElementById("open-lookbook-btn");

  const zoomInBtn = document.getElementById("modal-zoom-in");
  const zoomOutBtn = document.getElementById("modal-zoom-out");
  const zoomResetBtn = document.getElementById("modal-zoom-reset");
  const zoomValEl = document.getElementById("modal-zoom-val");

  let activeGalleryIdx = 0;
  let zoomScale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function setZoom(scale, resetPan = true) {
    zoomScale = Math.min(Math.max(scale, 1), 3.5);
    if (zoomScale === 1 && resetPan) {
      panX = 0;
      panY = 0;
    }
    if (modalImg) {
      modalImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
      modalImg.classList.toggle("is-zoomed", zoomScale > 1);
    }
    if (zoomValEl) {
      zoomValEl.textContent = `${Math.round(zoomScale * 100)}%`;
    }
  }

  function resetZoom() {
    panX = 0;
    panY = 0;
    setZoom(1, true);
  }

  function openGallery(index) {
    if (!modal) return;
    activeGalleryIdx = index;
    resetZoom();
    updateGalleryStage();
    modal.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeGallery() {
    if (!modal) return;
    modal.classList.remove("is-active");
    document.body.style.overflow = "";
    resetZoom();
  }

  function updateGalleryStage() {
    if (!modalImg || !modalCaption || !modalCounter) return;
    resetZoom();
    const item = lookbookImages[activeGalleryIdx];
    modalImg.src = item.src;
    modalImg.alt = item.alt;
    modalCaption.textContent = item.alt;
    modalCounter.textContent = `${activeGalleryIdx + 1} / ${lookbookImages.length}`;
  }

  function nextGalleryItem() {
    activeGalleryIdx = (activeGalleryIdx + 1) % lookbookImages.length;
    updateGalleryStage();
  }

  function prevGalleryItem() {
    activeGalleryIdx = (activeGalleryIdx - 1 + lookbookImages.length) % lookbookImages.length;
    updateGalleryStage();
  }

  // Zoom button handlers
  if (zoomInBtn) zoomInBtn.addEventListener("click", () => setZoom(zoomScale + 0.5));
  if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => setZoom(zoomScale - 0.5));
  if (zoomResetBtn) zoomResetBtn.addEventListener("click", resetZoom);

  // Click / Double click to zoom image
  if (modalImg) {
    modalImg.addEventListener("click", (e) => {
      if (zoomScale > 1) {
        resetZoom();
      } else {
        setZoom(2.2);
      }
    });

    // Panning image when zoomed
    modalImg.addEventListener("mousedown", (e) => {
      if (zoomScale <= 1) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      modalImg.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging || zoomScale <= 1) return;
      e.preventDefault();
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      setZoom(zoomScale, false);
    });

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        if (modalImg) modalImg.classList.remove("is-dragging");
      }
    });
  }

  // Bind lookbook preview cards on home page
  document.querySelectorAll("a[data-gallery-idx]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(el.dataset.galleryIdx || el.getAttribute("data-gallery-idx"), 10);
      openGallery(idx);
    });
  });

  if (openLookbookBtn) {
    openLookbookBtn.addEventListener("click", () => {
      openGallery(0);
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeGallery);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal-stage")) {
        closeGallery();
      }
    });
  }

  if (prevBtnModal) prevBtnModal.addEventListener("click", prevGalleryItem);
  if (nextBtnModal) nextBtnModal.addEventListener("click", nextGalleryItem);

  // Keyboard navigation & zoom shortcuts
  document.addEventListener("keydown", (e) => {
    if (!modal || !modal.classList.contains("is-active")) return;
    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowRight") nextGalleryItem();
    if (e.key === "ArrowLeft") prevGalleryItem();
    if (e.key === "+" || e.key === "=") setZoom(zoomScale + 0.4);
    if (e.key === "-") setZoom(zoomScale - 0.4);
    if (e.key === "0") resetZoom();
  });


  /* ---------- Header Nav: Home, Logo & Shop Scroll Handling ---------- */
  const isHome = () => {
    const p = window.location.pathname.toLowerCase();
    return p === '/' || p.endsWith('/index.html') || p.endsWith('/home') || p === '';
  };

  // Home & Logo links
  document.querySelectorAll('a[href="index.html"], a[href="/"], a.brand').forEach((link) => {
    link.addEventListener("click", (e) => {
      if (isHome()) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // Shop link -> scroll to #shop (Curated Collection Kids, Embroidery & Creative Cottons)
  document.querySelectorAll('a[href="index.html#shop"], a[href="#shop"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      if (isHome()) {
        e.preventDefault();
        const shopSection = document.getElementById("shop");
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

});
