(() => {
  const audio = document.querySelector('[data-hero-audio]');
  const button = document.querySelector('[data-hero-sound-toggle]');
  if (!(audio instanceof HTMLAudioElement) || !(button instanceof HTMLButtonElement)) return;
  const label = button.querySelector('[data-sound-label]');
  const onIcon = button.querySelector('[data-sound-on-icon]');
  const offIcon = button.querySelector('[data-sound-off-icon]');
  const preferenceKey = 'swm_hero_sound_v1';
  let enabled = true;
  let pending = false;
  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch { /* Use this document's choice. */ }
  audio.volume = 0.28;

  const placeControl = () => {
    button.style.bottom = '';
    const notice = document.querySelector('#analytics-consent-banner');
    if (!(notice instanceof HTMLElement)) return;
    const control = button.getBoundingClientRect();
    const banner = notice.getBoundingClientRect();
    if (control.bottom > banner.top && control.top < banner.bottom && control.right > banner.left && control.left < banner.right) {
      const bottom = parseFloat(getComputedStyle(button).bottom) || 0;
      button.style.bottom = `${bottom + control.bottom - banner.top + 12}px`;
    }
  };

  const render = () => {
    const playing = enabled && !audio.paused;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Turn sound off' : 'Turn sound on');
    if (label) label.textContent = playing ? 'Sound on' : enabled ? 'Enable sound' : 'Sound off';
    onIcon?.classList.toggle('hidden', !playing);
    offIcon?.classList.toggle('hidden', playing);
    placeControl();
  };
  const start = () => {
    if (!enabled || pending || !audio.paused || document.hidden) return;
    pending = true;
    // A denied autoplay promise is expected. Show the actual state and retry
    // on a visitor gesture; never claim that blocked audio is already playing.
    audio.play().then(() => {
      if (!enabled || document.hidden) audio.pause();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); else start(); });
  window.addEventListener('pagehide', () => audio.pause());
  window.addEventListener('pageshow', start);
  // Keep the mute control reachable above the optional consent notice.
  window.addEventListener('resize', placeControl);
  window.addEventListener('scroll', placeControl, { passive: true });
  new MutationObserver(placeControl).observe(document.body, { childList: true });
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
  start();
})();
