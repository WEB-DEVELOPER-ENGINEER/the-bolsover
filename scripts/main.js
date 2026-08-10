(function () {
  const config = window.BolsoverConfig;
  const data = window.BolsoverData;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function initHeader() {
    const header = $(".site-header");
    const nav = $("[data-site-nav]");
    const menu = $("[data-menu-toggle]");
    const sections = ["hero", "location", "lifestyle", "services", "virtual-tour", "contact"].map((id) => document.getElementById(id)).filter(Boolean);

    menu?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });

    $$("[data-site-nav] a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menu?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });

    const setHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.72);
    };
    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      if (!active) return;
      $$("[data-nav-link]").forEach((link) => {
        const matches = link.getAttribute("href") === `#${active.target.id}`;
        link.classList.toggle("is-active", matches);
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });
    sections.forEach((section) => observer.observe(section));
  }

  function initHeroTeaser() {
    const video = $("[data-hero-video]");
    const filmFrame = $("[data-film-frame-video]");
    if (!video) return;

    const settings = config.film;
    const segments = settings.teaserSegments;
    let index = 0;
    let seeking = false;

    [video, filmFrame].filter(Boolean).forEach((item) => {
      item.src = settings.fullSrc;
      item.poster = settings.poster;
      item.style.objectPosition = mobileQuery.matches ? settings.mobileObjectPosition : settings.desktopObjectPosition;
    });

    function playSegment() {
      const segment = segments[index];
      seeking = true;
      video.currentTime = segment.start;
      video.play().catch(() => {});
      seeking = false;
      $("[data-hero-scene]").textContent = `${String(index + 1).padStart(2, "0")} / ${segments.length} ${segment.label}`;
    }

    video.addEventListener("loadedmetadata", playSegment, { once: true });
    video.addEventListener("timeupdate", () => {
      if (seeking || !segments[index]) return;
      if (video.currentTime >= segments[index].end) {
        index = (index + 1) % segments.length;
        playSegment();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    });
  }

  function initHeroScroll() {
    if (reducedMotion) return;
    const hero = $("#hero");
    if (!hero) return;
    let ticking = false;

    function update() {
      const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.95)));
      hero.style.setProperty("--hero-progress", progress.toFixed(3));
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function initFilmModal() {
    const modal = $("[data-film-modal]");
    const video = $("[data-full-film]");
    const closeButton = $("[data-close-film]");
    let previousScroll = 0;

    function open() {
      previousScroll = window.scrollY;
      modal.hidden = false;
      document.body.classList.add("modal-open");
      video.src = config.film.fullSrc;
      video.currentTime = 0;
      video.play().catch(() => {});
      closeButton.focus();
      $(".floating-action-rail")?.classList.add("force-hidden");
    }

    function close() {
      video.pause();
      video.removeAttribute("src");
      video.load();
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      $(".floating-action-rail")?.classList.remove("force-hidden");
      window.scrollTo({ top: previousScroll, behavior: "instant" });
    }

    $$("[data-open-film]").forEach((button) => button.addEventListener("click", open));
    closeButton?.addEventListener("click", close);
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!modal.hidden) close();
        closeMobileActions();
      }
    });
  }

  function initLifestyle() {
    const section = $("#lifestyle");
    const image = $("[data-lifestyle-image]");
    const label = $("[data-lifestyle-label]");
    const destination = $("[data-lifestyle-destination]");
    const time = $("[data-lifestyle-time]");
    const copy = $("[data-lifestyle-copy]");
    const controls = $$("[data-lifestyle-control]");
    if (!section || !image) return;

    function render(index) {
      const item = data.lifestyle[index];
      image.classList.add("is-changing");
      window.setTimeout(() => {
        image.src = item.image;
        image.alt = item.destination;
        label.textContent = item.label;
        destination.textContent = item.destination;
        time.textContent = item.time;
        copy.textContent = item.copy;
        controls.forEach((control, controlIndex) => {
          const active = controlIndex === index;
          control.classList.toggle("is-active", active);
          control.setAttribute("aria-pressed", String(active));
        });
        image.classList.remove("is-changing");
      }, reducedMotion ? 0 : 140);
    }

    controls.forEach((control, index) => {
      control.addEventListener("mouseenter", () => render(index));
      control.addEventListener("focus", () => render(index));
      control.addEventListener("click", () => render(index));
    });

    if (!reducedMotion && !mobileQuery.matches) {
      window.addEventListener("scroll", () => {
        const rect = section.getBoundingClientRect();
        const span = rect.height - window.innerHeight;
        if (rect.top > 0 || rect.bottom < window.innerHeight * 0.4 || span <= 0) return;
        const progress = Math.min(0.999, Math.max(0, -rect.top / span));
        render(Math.floor(progress * data.lifestyle.length));
      }, { passive: true });
    }
    render(0);
  }

  function initLocation() {
    const map = $("[data-map]");
    const detail = $("[data-location-detail]");
    const controls = $$("[data-location-category]");
    if (!map || !detail) return;

    const home = document.createElement("button");
    home.type = "button";
    home.className = "map-pin is-home is-selected";
    home.style.left = "49%";
    home.style.top = "47%";
    home.setAttribute("aria-label", "The Bolsover, 3-8 Bolsover Street");
    home.innerHTML = "<span></span>";
    map.appendChild(home);

    const pins = data.locations.map((location) => {
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "map-pin";
      pin.style.left = `${location.x}%`;
      pin.style.top = `${location.y}%`;
      pin.dataset.category = location.category;
      pin.setAttribute("aria-label", `${location.name}, ${location.time}`);
      pin.innerHTML = "<span></span>";
      pin.addEventListener("click", () => selectLocation(location, pin));
      map.appendChild(pin);
      return { pin, location };
    });

    function selectLocation(location, selectedPin) {
      $$(".map-pin", map).forEach((pin) => pin.classList.remove("is-selected"));
      selectedPin.classList.add("is-selected");
      detail.innerHTML = `
        <span>${location.category}</span>
        <strong>${location.name}</strong>
        <em>${location.time}</em>
        <p>${location.detail}</p>
      `;
    }

    function setCategory(category) {
      controls.forEach((control) => {
        const active = control.dataset.locationCategory === category;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-pressed", String(active));
      });
      const first = pins.find(({ location }) => location.category === category) || pins[0];
      pins.forEach(({ pin, location }, index) => {
        const visible = location.category === category;
        pin.classList.toggle("is-muted", !visible);
        pin.style.transitionDelay = visible ? `${index * 28}ms` : "0ms";
      });
      selectLocation(first.location, first.pin);
    }

    controls.forEach((control) => {
      ["mouseenter", "focus", "click"].forEach((eventName) => {
        control.addEventListener(eventName, () => setCategory(control.dataset.locationCategory));
      });
    });
    setCategory("Regent’s Park");
  }

  function initServices() {
    const button = $("[data-services-toggle]");
    const detail = $("#services-detail");
    if (!button || !detail) return;
    button.addEventListener("click", () => {
      const open = detail.hidden;
      detail.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initFloatingActions() {
    const rail = $(".floating-action-rail");
    const mobile = $(".mobile-action");
    const hero = $("#hero");
    const contact = $("#contact");
    const footer = $(".site-footer");
    const hiddenTargets = [hero, contact, footer].filter(Boolean);
    if (!rail) return;

    const observer = new IntersectionObserver((entries) => {
      const hidden = entries.some((entry) => entry.isIntersecting);
      const show = !hidden && window.scrollY > window.innerHeight * 0.6;
      rail.classList.toggle("is-visible", show);
      mobile?.classList.toggle("is-visible", show);
    }, { threshold: 0.12 });
    hiddenTargets.forEach((target) => observer.observe(target));

    $("[data-mobile-action-toggle]")?.addEventListener("click", () => {
      mobile.classList.toggle("is-open");
    });
    document.addEventListener("click", (event) => {
      if (mobile && !mobile.contains(event.target)) closeMobileActions();
    });
  }

  function closeMobileActions() {
    $(".mobile-action")?.classList.remove("is-open");
  }

  function initBrochureAndPlaceholders() {
    async function handleBrochure(event) {
      event.preventDefault();
      try {
        const response = await fetch(config.brochurePath, { method: "HEAD" });
        if (response.ok) {
          window.location.href = config.brochurePath;
          return;
        }
      } catch (error) {
        // Prototype-only fallback for missing brochure asset.
      }
      showToast("Brochure asset pending.");
    }

    $$("[data-brochure]").forEach((button) => button.addEventListener("click", handleBrochure));
    $$("[data-toast]").forEach((button) => button.addEventListener("click", (event) => {
      if (button.matches("a")) event.preventDefault();
      showToast(button.dataset.toast);
    }));
    $$("[data-whatsapp]").forEach((link) => {
      link.href = `https://wa.me/?text=${encodeURIComponent(config.whatsappMessage)}`;
    });
    $$("[data-maps-link]").forEach((link) => {
      link.href = config.googleMapsUrl;
    });
  }

  function initVirtualTour() {
    const shell = $("[data-tour-shell]");
    const closeButton = $("[data-close-tour]");
    function open() {
      shell.hidden = false;
      document.body.classList.add("modal-open");
      $(".floating-action-rail")?.classList.add("force-hidden");
      closeButton.focus();
    }
    function close() {
      shell.hidden = true;
      document.body.classList.remove("modal-open");
      $(".floating-action-rail")?.classList.remove("force-hidden");
    }
    $$("[data-open-tour]").forEach((button) => button.addEventListener("click", open));
    closeButton?.addEventListener("click", close);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !shell.hidden) close();
    });
  }

  function initForm() {
    const form = $("[data-enquiry-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type='submit']");
      if (!form.checkValidity()) {
        form.classList.add("has-errors");
        showToast("Please complete the required fields.");
        return;
      }
      form.classList.remove("has-errors");
      form.classList.add("is-submitting");
      submit.textContent = "Submitting";
      window.setTimeout(() => {
        form.classList.remove("is-submitting");
        form.classList.add("is-success");
        submit.textContent = "Register Interest";
        showToast("Thank you. Your enquiry has been received.");
        form.reset();
      }, 850);
    });
  }

  function showToast(message) {
    const toast = $("[data-toast-region]");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  initHeader();
  initHeroTeaser();
  initHeroScroll();
  initFilmModal();
  initLifestyle();
  initServices();
  initLocation();
  initFloatingActions();
  initBrochureAndPlaceholders();
  initVirtualTour();
  initForm();
})();
