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

    const chirpAudio = new Audio('/media/blue-wren-audio.mp3');
    chirpAudio.preload = 'metadata';
    chirpAudio.volume = 0.28;

    const RIPPLE_INTERVAL_MS = 140;
    const CHIRP_INTERVAL_MS = 1800;
    const MAX_RIPPLES = 8;

    let audioUnlocked = false;
    let pointerInside = false;
    let lastRippleAt = 0;
    let lastChirpAt = 0;
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

    const tryUnlockAudio = () => {
      if (audioUnlocked) {
        return;
      }

      chirpAudio
        .play()
        .then(() => {
          chirpAudio.pause();
          chirpAudio.currentTime = 0;
          audioUnlocked = true;
        })
        .catch(() => {});
    };

    const maybePlayChirp = () => {
      if (!audioUnlocked) {
        return;
      }

      const now = performance.now();
      if (now - lastChirpAt < CHIRP_INTERVAL_MS) {
        return;
      }

      lastChirpAt = now;
      chirpAudio.currentTime = 0;
      chirpAudio.play().catch(() => {});
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
      tryUnlockAudio();
      updatePointerPosition(event);
      addRipple(pendingX, pendingY);
      maybePlayChirp();
    };

    const handlePointerMove = (event) => {
      updatePointerPosition(event);
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(maybeRenderRipple);
      }
    };

    const handlePointerDown = (event) => {
      tryUnlockAudio();
      updatePointerPosition(event);
      addRipple(pendingX, pendingY);
      maybePlayChirp();
    };

    const handlePointerLeave = () => {
      pointerInside = false;
    };

    document.addEventListener('pointerdown', tryUnlockAudio, { once: true, passive: true });
    document.addEventListener('keydown', tryUnlockAudio, { once: true });
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
