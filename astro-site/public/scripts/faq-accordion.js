for (const accordion of document.querySelectorAll('[data-faq-accordion]')) {
  const items = [...accordion.querySelectorAll('details')];
  const track = (eventName, params = {}) => {
    const analytics = window.SWMAnalytics;
    if (!analytics || typeof analytics.track !== 'function') {
      return;
    }

    analytics.track(eventName, params);
  };

  for (const item of items) {
    item.addEventListener('toggle', () => {
      if (!item.open) {
        return;
      }

      const summary = item.querySelector('summary');
      const question = (summary?.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80);
      track('faq_open', {
        question: question || 'faq_item',
      });

      for (const sibling of items) {
        if (sibling !== item) {
          sibling.open = false;
        }
      }
    });
  }
}
