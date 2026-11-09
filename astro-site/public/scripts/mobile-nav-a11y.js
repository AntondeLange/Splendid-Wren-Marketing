(() => {
  const nav = document.querySelector('[data-mobile-nav]');
  if (!(nav instanceof HTMLDetailsElement)) {
    return;
  }

  const summary = nav.querySelector('summary');
  if (!(summary instanceof HTMLElement)) {
    return;
  }

  const syncState = () => {
    const expanded = nav.open;
    summary.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    summary.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  };

  const close = (restoreFocus = false) => {
    nav.open = false;
    syncState();
    if (restoreFocus) summary.focus();
  };
  document.addEventListener('click', (event) => {
    if (nav.open && event.target instanceof Node && !nav.contains(event.target)) close();
  });
  document.addEventListener('focusin', (event) => {
    if (nav.open && event.target instanceof Node && !nav.contains(event.target)) close();
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => close()));
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) close();
  });
  syncState();
  nav.addEventListener('toggle', syncState);

  nav.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.open) {
      return;
    }

    nav.open = false;
    syncState();
    summary.focus();
  });
})();
