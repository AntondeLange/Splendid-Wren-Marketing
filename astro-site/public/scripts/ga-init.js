(() => {
  const currentScript = document.currentScript;
  if (!(currentScript instanceof HTMLScriptElement)) {
    return;
  }

  const gaId = currentScript.dataset.gaId?.trim();
  if (!gaId) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', gaId);
})();
