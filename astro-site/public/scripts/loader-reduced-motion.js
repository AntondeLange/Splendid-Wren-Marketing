(() => {
  const HOME_URL = '/?from=loader';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

  const initLoaderRedirect = () => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
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
        window.location.replace(HOME_URL);
      }, redirectDelaySeconds * 1000);
    };

    scheduleRedirect();

    if (!(extendControl instanceof HTMLButtonElement)) {
      return;
    }

    extendControl.addEventListener('click', () => {
      redirectDelaySeconds += 10;
      scheduleRedirect();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoaderRedirect, { once: true });
    return;
  }

  initLoaderRedirect();
})();
