for (const accordion of document.querySelectorAll('[data-faq-accordion]')) {
  const items = [...accordion.querySelectorAll('details')];

  for (const item of items) {
    item.addEventListener('toggle', () => {
      if (!item.open) {
        return;
      }

      for (const sibling of items) {
        if (sibling !== item) {
          sibling.open = false;
        }
      }
    });
  }
}
