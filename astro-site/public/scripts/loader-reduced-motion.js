(() => {
  const HOME_URL = '/?from=loader';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const track = (eventName, params = {}) => {
    const analytics = window.SWMAnalytics;
    if (!analytics || typeof analytics.track !== 'function') {
      return;
    }

    analytics.track(eventName, params);
  };

  const initLoaderRedirect = () => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      track('loader_action', { action: 'reduced_motion_redirect' });
      window.location.replace(HOME_URL);
      return;
    }

    const body = document.body;
    const status = document.querySelector('#loader-status');
    const extendControl = document.querySelector('[data-loader-extend]');
    const initialSeconds = Number(body?.dataset.loaderSeconds ?? '5');

    let redirectDelaySeconds = Number.isFinite(initialSeconds) && initialSeconds > 0 ? initialSeconds : 5;
    let timeoutId = 0;

    const updateStatus = () => {
      if (!(status instanceof HTMLElement)) {
        return;
      }

      status.textContent = `Redirecting to the homepage in ${redirectDelaySeconds} seconds.`;
    };

    const scheduleRedirect = () => {
      window.clearTimeout(timeoutId);
      updateStatus();

      timeoutId = window.setTimeout(() => {
        track('loader_action', { action: 'auto_redirect' });
        window.location.replace(HOME_URL);
      }, redirectDelaySeconds * 1000);
    };

    scheduleRedirect();

    if (!(extendControl instanceof HTMLButtonElement)) {
      return;
    }

    extendControl.addEventListener('click', () => {
      redirectDelaySeconds += 10;
      track('loader_action', { action: 'extend', seconds_added: 10 });
      scheduleRedirect();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoaderRedirect, { once: true });
    return;
  }

  initLoaderRedirect();
})();
