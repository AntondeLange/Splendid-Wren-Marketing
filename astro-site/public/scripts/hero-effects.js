(() => {
  const initHeroEffects = () => {
    const heroSection = document.querySelector('.hero-section');
    const heroVideo = document.querySelector('[data-hero-video]');

    if (!(heroSection instanceof HTMLElement) || !(heroVideo instanceof HTMLVideoElement)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion || prefersReducedData) {
      return;
    }

    const startPlayback = () => {
      heroVideo.autoplay = true;
      heroVideo.loop = true;
      heroVideo.play().catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      startPlayback();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        observer.disconnect();

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            startPlayback();
          }, { timeout: 1000 });
        } else {
          window.setTimeout(startPlayback, 250);
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(heroSection);

    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'hero-ripple-container';
    heroSection.appendChild(rippleContainer);

    const RIPPLE_INTERVAL_MS = 140;
    const MAX_RIPPLES = 8;

    let pointerInside = false;
    let lastRippleAt = 0;
    let pendingX = 0;
    let pendingY = 0;
    let rafId = 0;

    const addRipple = (x, y) => {
      if (rippleContainer.childElementCount >= MAX_RIPPLES) {
        rippleContainer.firstElementChild?.remove();
      }

      const ripple = document.createElement('span');
      ripple.className = 'hero-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      rippleContainer.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };

    const maybeRenderRipple = () => {
      rafId = 0;

      if (!pointerInside) {
        return;
      }

      const now = performance.now();
      if (now - lastRippleAt < RIPPLE_INTERVAL_MS) {
        return;
      }

      lastRippleAt = now;
      addRipple(pendingX, pendingY);
    };

    const updatePointerPosition = (event) => {
      const rect = heroSection.getBoundingClientRect();
      pendingX = event.clientX - rect.left;
      pendingY = event.clientY - rect.top;
    };

    const handlePointerEnter = (event) => {
      pointerInside = true;
      updatePointerPosition(event);
      addRipple(pendingX, pendingY);
    };

    const handlePointerMove = (event) => {
      updatePointerPosition(event);
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(maybeRenderRipple);
      }
    };

    const handlePointerDown = (event) => {
      updatePointerPosition(event);
      addRipple(pendingX, pendingY);
    };

    const handlePointerLeave = () => {
      pointerInside = false;
    };

    heroSection.addEventListener('pointerdown', handlePointerDown, { passive: true });

    if (hasFinePointer) {
      heroSection.addEventListener('pointerenter', handlePointerEnter);
      heroSection.addEventListener('pointermove', handlePointerMove, { passive: true });
      heroSection.addEventListener('pointerleave', handlePointerLeave);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroEffects, { once: true });
  } else {
    initHeroEffects();
  }
})();
