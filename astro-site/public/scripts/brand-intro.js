(() => {
  const intro = document.querySelector('[data-brand-intro]');
  const image = intro?.querySelector('[data-brand-intro-image]');
  const skip = intro?.querySelector('[data-intro-skip]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'swm_intro_seen_v1';
  if (!(intro instanceof HTMLDialogElement) || !(image instanceof HTMLImageElement) || !(skip instanceof HTMLAnchorElement)) return;
  // Let direct section links reach their target without interrupting focus.
  if (window.location.hash) return;
  // Storage failure must never block access or cause a redirect loop.
  try {
    if (sessionStorage.getItem(key) === 'true' || motion.matches) return;
    sessionStorage.setItem(key, 'true');
  } catch { return; }
  if (typeof intro.showModal !== 'function') return;

  const previousOverflow = document.documentElement.style.overflow;
  const dismiss = () => {
    if (!intro.open) return;
    intro.close();
    document.documentElement.style.overflow = previousOverflow;
    const main = document.querySelector('#main-content');
    if (main instanceof HTMLElement) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  };
  skip.addEventListener('click', (event) => { event.preventDefault(); dismiss(); });
  intro.addEventListener('cancel', (event) => { event.preventDefault(); dismiss(); });
  image.addEventListener('animationend', dismiss, { once: true });
  image.addEventListener('error', dismiss, { once: true });
  motion.addEventListener('change', (event) => { if (event.matches) dismiss(); });
  intro.showModal();
  document.documentElement.style.overflow = 'hidden';
  skip.focus();
})();
