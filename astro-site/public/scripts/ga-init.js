(() => {
  const currentScript = document.currentScript;
  if (!(currentScript instanceof HTMLScriptElement)) {
    return;
  }

  const gaId = currentScript.dataset.gaId?.trim();
  if (!gaId) {
    return;
  }

  const CONSENT_KEY = 'swm_analytics_consent_v1';
  const TRACKED_ONCE_PREFIX = 'swm_analytics_once_';
  const CONSENT_GRANTED = 'granted';
  const CONSENT_DENIED = 'denied';
  const MAX_LABEL_LENGTH = 80;
  const EVENT_NAME_PATTERN = /^[a-z0-9_]{1,40}$/;
  const isLoaderPage = window.location.pathname.startsWith('/loader');
  const gtagScriptSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  const defaultConsentState = {
    analytics_storage: CONSENT_DENIED,
    ad_storage: CONSENT_DENIED,
    ad_user_data: CONSENT_DENIED,
    ad_personalization: CONSENT_DENIED,
  };
  const grantedConsentState = {
    analytics_storage: CONSENT_GRANTED,
    ad_storage: CONSENT_DENIED,
    ad_user_data: CONSENT_DENIED,
    ad_personalization: CONSENT_DENIED,
  };
  const queue = [];
  let isAnalyticsEnabled = false;

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore storage failures (private mode, blocked storage).
      }
    },
  };

  const safeSessionStorage = {
    get(key) {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {
        // Ignore storage failures (private mode, blocked storage).
      }
    },
  };

  function normalizeLabel(value) {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, MAX_LABEL_LENGTH);
  }

  function sanitizeEventParams(params) {
    const result = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        result[key] = normalizeLabel(value);
        continue;
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        result[key] = value;
      }
    }

    return result;
  }

  function markTrackedOnce(onceKey) {
    safeSessionStorage.set(`${TRACKED_ONCE_PREFIX}${onceKey}`, '1');
  }

  function hasTrackedOnce(onceKey) {
    return safeSessionStorage.get(`${TRACKED_ONCE_PREFIX}${onceKey}`) === '1';
  }

  function getConsent() {
    const stored = safeStorage.get(CONSENT_KEY);
    if (stored === CONSENT_GRANTED || stored === CONSENT_DENIED) {
      return stored;
    }

    return null;
  }

  function inferLocation(element) {
    const locationElement = element.closest('[data-cta-location], [data-track-location], section, header, footer, nav, aside, main');
    if (!(locationElement instanceof HTMLElement)) {
      return 'unknown';
    }

    const explicitLocation = locationElement.dataset.ctaLocation ?? locationElement.dataset.trackLocation;
    if (explicitLocation) {
      return normalizeLabel(explicitLocation).toLowerCase();
    }

    if (locationElement.id) {
      return normalizeLabel(locationElement.id).toLowerCase();
    }

    return locationElement.tagName.toLowerCase();
  }

  function ensureGtagBootstrap() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }
  }

  function ensureGtagScript() {
    const existingScript = Array.from(document.scripts).find((script) => script.src === gtagScriptSrc);
    if (existingScript) {
      return;
    }

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = gtagScriptSrc;
    gaScript.dataset.swmGaScript = 'true';
    document.head.append(gaScript);
  }

  function initializeGoogleTagDefaults() {
    ensureGtagBootstrap();
    ensureGtagScript();

    if (window.SWMAnalyticsDefaultsApplied) {
      return;
    }

    window.gtag('js', new Date());
    window.gtag('consent', 'default', defaultConsentState);
    window.SWMAnalyticsDefaultsApplied = true;
  }

  function applyDeniedConsent() {
    if (typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('consent', 'update', defaultConsentState);
  }

  function flushQueue() {
    if (!isAnalyticsEnabled || typeof window.gtag !== 'function') {
      return;
    }

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) {
        continue;
      }

      window.gtag('event', item.eventName, item.params);
    }
  }

  function enableAnalytics() {
    initializeGoogleTagDefaults();
    window.gtag('consent', 'update', grantedConsentState);
    if (!isAnalyticsEnabled) {
      window.gtag('config', gaId, {
        anonymize_ip: true,
        send_page_view: !isLoaderPage,
      });
      isAnalyticsEnabled = true;
    }

    flushQueue();
  }

  function setConsent(value) {
    if (value !== CONSENT_GRANTED && value !== CONSENT_DENIED) {
      return;
    }

    safeStorage.set(CONSENT_KEY, value);
    if (value === CONSENT_GRANTED) {
      enableAnalytics();
      track('consent_update', { analytics_storage: CONSENT_GRANTED }, { onceKey: 'consent_granted' });
      return;
    }

    applyDeniedConsent();
  }

  function track(eventName, params = {}, options = {}) {
    if (!EVENT_NAME_PATTERN.test(eventName)) {
      return;
    }

    if (options.onceKey && hasTrackedOnce(options.onceKey)) {
      return;
    }

    if (getConsent() !== CONSENT_GRANTED) {
      return;
    }

    const payload = sanitizeEventParams({
      page_path: window.location.pathname,
      transport_type: 'beacon',
      ...params,
    });

    if (options.onceKey) {
      markTrackedOnce(options.onceKey);
    }

    if (!isAnalyticsEnabled || typeof window.gtag !== 'function') {
      queue.push({ eventName, params: payload });
      return;
    }

    window.gtag('event', eventName, payload);
  }

  window.SWMAnalytics = window.SWMAnalytics || {
    track,
    setConsent,
    getConsent,
    hasConsent: () => getConsent() === CONSENT_GRANTED,
  };

  function maybeAttachConsentBanner() {
    if (getConsent() !== null) {
      return;
    }

    if (window.location.pathname.startsWith('/loader')) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'analytics-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.style.position = 'fixed';
    banner.style.left = '1rem';
    banner.style.right = '1rem';
    banner.style.bottom = '1rem';
    banner.style.zIndex = '80';
    banner.style.maxWidth = '56rem';
    banner.style.margin = '0 auto';
    banner.style.border = '1px solid #bccce1';
    banner.style.borderRadius = '0.75rem';
    banner.style.background = '#ffffff';
    banner.style.boxShadow = '0 12px 28px rgba(13, 32, 54, 0.22)';
    banner.style.padding = '0.9rem';
    banner.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;justify-content:space-between;">
        <p style="margin:0;max-width:38rem;color:#1e3a5f;font:500 0.92rem/1.4 Poppins, sans-serif;">
          We use analytics cookies to understand visits and improve enquiries. See our <a href="/privacy" style="color:#1e3a5f;text-decoration:underline;">privacy policy</a>.
        </p>
        <div style="display:inline-flex;gap:0.5rem;">
          <button type="button" data-consent-action="decline" style="border:1px solid #1e3a5f;background:#fff;color:#1e3a5f;border-radius:0.5rem;padding:0.5rem 0.85rem;font:600 0.86rem/1 Poppins, sans-serif;cursor:pointer;">Decline</button>
          <button type="button" data-consent-action="accept" style="border:1px solid #1e3a5f;background:#1e3a5f;color:#fff;border-radius:0.5rem;padding:0.5rem 0.85rem;font:600 0.86rem/1 Poppins, sans-serif;cursor:pointer;">Accept</button>
        </div>
      </div>
    `;

    const dismiss = () => banner.remove();
    banner.querySelector('[data-consent-action="accept"]')?.addEventListener('click', () => {
      setConsent(CONSENT_GRANTED);
      dismiss();
    });
    banner.querySelector('[data-consent-action="decline"]')?.addEventListener('click', () => {
      setConsent(CONSENT_DENIED);
      dismiss();
    });

    document.body.append(banner);
  }

  function getSafeUrl(rawHref) {
    try {
      return new URL(rawHref, window.location.origin);
    } catch {
      return null;
    }
  }

  function getSocialNetwork(hostname) {
    const host = hostname.toLowerCase();
    if (host.includes('facebook.com')) return 'facebook';
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('linkedin.com')) return 'linkedin';
    return null;
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest('a');
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const loaderAction = link.dataset.loaderAction;
    if (loaderAction) {
      track('loader_action', { action: loaderAction });
      return;
    }

    const url = getSafeUrl(link.getAttribute('href') ?? '');
    if (!url) {
      return;
    }

    const isSameOrigin = url.origin === window.location.origin;
    if (isSameOrigin && (url.pathname === '/contact' || url.pathname === '/contact/')) {
      track('cta_click', {
        cta_location: inferLocation(link),
        cta_label: normalizeLabel(link.textContent || 'contact').toLowerCase(),
        destination_path: '/contact',
      });
      return;
    }

    const network = getSocialNetwork(url.hostname);
    if (network) {
      track('social_click', {
        network,
        click_location: inferLocation(link),
      });
    }
  });

  initializeGoogleTagDefaults();

  const storedConsent = getConsent();
  if (storedConsent === CONSENT_GRANTED) {
    enableAnalytics();
  } else if (storedConsent === CONSENT_DENIED) {
    applyDeniedConsent();
  } else if (storedConsent === null) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', maybeAttachConsentBanner, { once: true });
    } else {
      maybeAttachConsentBanner();
    }
  }
})();
