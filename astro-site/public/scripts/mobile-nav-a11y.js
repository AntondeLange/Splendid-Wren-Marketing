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
