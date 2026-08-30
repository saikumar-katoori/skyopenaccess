import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const initHeroBookSlider = () => {
  const showcase = document.querySelector(".hero-book-showcase");
  if (!showcase) return () => undefined;

  const cards = Array.from(showcase.querySelectorAll(".hero-book"));
  if (!cards.length) return () => undefined;

  let frameId = 0;
  let viewportCenterX = window.innerWidth / 2;
  let influenceRadius = 500;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateMeasurements = () => {
    viewportCenterX = window.innerWidth / 2;
    influenceRadius = Math.max(
      260,
      Math.min(window.innerWidth * 0.45, showcase.clientWidth * 0.75)
    );
  };

  const render = () => {
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const distance = viewportCenterX - cardCenterX;
      const absDistance = Math.abs(distance);

      const proximity = clamp(1 - absDistance / influenceRadius, 0, 1);
      const eased = proximity * proximity * (3 - 2 * proximity);

      const scale = 0.55 + eased * 0.75;
      const opacity = 0.18 + eased * 0.82;
      const zMove = -220 + eased * 520;

      let rotateY = distance / 18;
      rotateY = clamp(rotateY, -28, 28);

      const blur = (1 - proximity) * 3;
      const shadow = 0.1 + eased * 0.22;

      card.style.setProperty("--hero-card-scale", scale.toFixed(3));
      card.style.setProperty("--hero-card-opacity", opacity.toFixed(3));
      card.style.setProperty("--hero-card-z", `${zMove}px`);
      card.style.setProperty("--hero-card-rotate", `${rotateY}deg`);
      card.style.setProperty("--hero-card-blur", `${blur}px`);
      card.style.setProperty("--hero-card-shadow", shadow.toFixed(3));
    });

    frameId = requestAnimationFrame(render);
  };

  const startLoop = () => {
    if (frameId) return;
    frameId = requestAnimationFrame(render);
  };

  const stopLoop = () => {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = 0;
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    updateMeasurements();
    startLoop();
  };

  updateMeasurements();
  startLoop();
  window.addEventListener("resize", updateMeasurements, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    stopLoop();
    window.removeEventListener("resize", updateMeasurements);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};

const initJournalIntro = () => {
  const slider = document.querySelector(".book-slider");
  const content = document.querySelector(".journal-content");
  const intro = document.querySelector(".journals-intro");

  if (!slider || !content) return () => undefined;

  const sliderTimer = window.setTimeout(() => {
    slider.classList.add("active");
  }, 200);

  const contentTimer = window.setTimeout(() => {
    content.classList.add("show");
    if (intro) intro.style.display = "none";
  }, 2500);

  return () => {
    window.clearTimeout(sliderTimer);
    window.clearTimeout(contentTimer);
  };
};

const initCounters = () => {
  const counters = Array.from(document.querySelectorAll(".stat-number"));
  if (!counters.length) return () => undefined;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number.parseInt(el.getAttribute("data-target"), 10);
        if (Number.isNaN(target)) return;

        let current = 0;
        const step = target / 40;
        const timer = window.setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            window.clearInterval(timer);
          }
          el.textContent = Math.round(current);
        }, 30);

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));

  return () => observer.disconnect();
};

export const usePublicInteractions = () => {
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;
      navbar.style.boxShadow =
        window.scrollY > 50 ? "0 4px 25px rgba(0,0,0,0.15)" : "0 2px 10px rgba(0,0,0,0.08)";
    };

    const onAnchorClick = (event) => {
      const target = event.target.closest('a[href^="#"]');
      if (!target) return;
      const selector = target.getAttribute("href");
      if (!selector || selector.length < 2) return;

      const element = document.querySelector(selector);
      if (!element) return;

      event.preventDefault();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onContactSubmit = (event) => {
      event.preventDefault();
      window.alert("Thank you for your message! We will get back to you soon.");
      event.currentTarget.reset();
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target
            .querySelectorAll(".from-left, .from-right")
            .forEach((el) => el.classList.add("show"));
          sectionObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          fadeObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".observe").forEach((section) => sectionObserver.observe(section));
    document.querySelectorAll(".fade-up").forEach((el) => fadeObserver.observe(el));

    const contactForm = document.querySelector(".contact-form");
    if (contactForm) contactForm.addEventListener("submit", onContactSubmit);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onAnchorClick);
    onScroll();

    const cleanupHero = initHeroBookSlider();
    const cleanupCounters = initCounters();
    const cleanupJournal = initJournalIntro();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onAnchorClick);
      if (contactForm) contactForm.removeEventListener("submit", onContactSubmit);
      sectionObserver.disconnect();
      fadeObserver.disconnect();
      cleanupHero();
      cleanupCounters();
      cleanupJournal();
    };
  }, [location.pathname]);
};
