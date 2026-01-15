(function() {
  'use strict';

  const GA_ID = 'G-XXXXXXXXXX';
  const CONSENT_KEY = 'swm_analytics_consent';

  function loadAnalytics() {
    if (GA_ID === 'G-XXXXXXXXXX') {
      return;
    }
    if (window.gtagLoaded) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    script.onload = function() {
      window.gtagLoaded = true;
      gtag('js', new Date());
      gtag('config', GA_ID);
    };

    document.head.appendChild(script);
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    if (value === 'granted') {
      loadAnalytics();
    }
  }

  function createBanner() {
    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.innerHTML = [
      '<div class="consent-banner__content">',
      '<p class="consent-banner__text">We use Google Analytics to understand site usage. You can read our <a href="privacy.html">Privacy Policy</a>.</p>',
      '<div class="consent-banner__actions">',
      '<button type="button" class="btn btn-outline-custom consent-btn" data-consent="denied">Decline</button>',
      '<button type="button" class="btn btn-primary-custom consent-btn" data-consent="granted">Accept</button>',
      '</div>',
      '</div>'
    ].join('');

    banner.addEventListener('click', function(event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const choice = target.getAttribute('data-consent');
      if (!choice) {
        return;
      }
      setConsent(choice);
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  function init() {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'granted') {
      loadAnalytics();
      return;
    }
    if (consent === 'denied') {
      return;
    }
    createBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
