(() => {
  const audio = document.querySelector('[data-hero-audio]');
  const button = document.querySelector('[data-hero-sound-toggle]');
  if (!(audio instanceof HTMLAudioElement) || !(button instanceof HTMLButtonElement)) return;
  const hero = button.closest('.hero-section');
  const position = button.closest('[data-hero-sound-position]');
  const label = button.querySelector('[data-sound-label]');
  const onIcon = button.querySelector('[data-sound-on-icon]');
  const offIcon = button.querySelector('[data-sound-off-icon]');
  const preferenceKey = 'swm_hero_sound_v1';
  let enabled = true;
  let pending = false;
  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch { /* Use this document's choice. */ }
  audio.volume = 0.28;

  const heroIsVisible = () => {
    if (!(hero instanceof HTMLElement)) return false;
    const rect = hero.getBoundingClientRect();
    const headerBottom = document.querySelector('body > header')?.getBoundingClientRect().bottom ?? 0;
    return rect.bottom > Math.max(0, headerBottom) && rect.top < window.innerHeight;
  };
  const canPlay = () => enabled && !document.hidden && heroIsVisible();
  const placeControl = () => {
    if (!(position instanceof HTMLElement)) return;
    position.style.bottom = '';
    const notice = document.querySelector('#analytics-consent-banner');
    if (!(notice instanceof HTMLElement)) return;
    const control = button.getBoundingClientRect();
    const banner = notice.getBoundingClientRect();
    if (control.bottom > banner.top && control.top < banner.bottom && control.right > banner.left && control.left < banner.right) {
      const bottom = parseFloat(getComputedStyle(position).bottom) || 0;
      position.style.bottom = `${bottom + control.bottom - banner.top + 12}px`;
    }
  };

  const render = () => {
    const playing = enabled && !audio.paused;
    button.setAttribute('aria-pressed', String(playing));
    const action = playing ? 'Turn sound off' : 'Turn sound on';
    button.setAttribute('aria-label', action);
    button.title = action;
    if (label) label.textContent = playing ? 'Sound on' : enabled ? 'Enable sound' : 'Sound off';
    onIcon?.classList.toggle('hidden', !playing);
    offIcon?.classList.toggle('hidden', playing);
  };
  const start = () => {
    if (!canPlay() || pending || !audio.paused) return;
    pending = true;
    // A denied autoplay promise is expected. Show the actual state and retry
    // on a visitor gesture; never claim that blocked audio is already playing.
    audio.play().then(() => {
      if (!canPlay()) audio.pause();
    }).catch(() => {}).finally(() => { pending = false; render(); });
  };
  button.addEventListener('click', () => {
    enabled = audio.paused || !enabled;
    try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch { /* Keep the choice in this document. */ }
    if (enabled) start(); else audio.pause();
    render();
  });
  const unlock = (event) => {
    if (event.target instanceof Node && button.contains(event.target)) return;
    start();
  };
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('keydown', unlock);
  const syncViewport = () => {
    // Preserve the visitor's on/off choice while pausing off-screen playback.
    // Recheck geometry on gestures too, so other page interactions cannot
    // restart sound after the hero has passed behind the sticky header.
    if (!canPlay()) audio.pause(); else start();
    placeControl();
  };
  document.addEventListener('visibilitychange', syncViewport);
  window.addEventListener('scroll', syncViewport, { passive: true });
  window.addEventListener('resize', syncViewport);
  new MutationObserver(placeControl).observe(document.body, { childList: true });
  window.addEventListener('pagehide', () => audio.pause());
  window.addEventListener('pageshow', start);
  window.addEventListener('storage', (event) => {
    if (event.key !== preferenceKey) return;
    enabled = event.newValue !== 'off';
    if (enabled) start(); else audio.pause();
    render();
  });
  audio.addEventListener('playing', render);
  audio.addEventListener('pause', render);
  audio.addEventListener('error', render);
  button.hidden = false;
  render();
  placeControl();
  start();
})();
