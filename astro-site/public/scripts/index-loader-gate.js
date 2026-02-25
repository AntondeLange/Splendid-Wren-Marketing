(() => {
  const currentUrl = new URL(window.location.href);
  const fromValue = currentUrl.searchParams.get('from');

  if (fromValue === 'loader') {
    sessionStorage.setItem('loaderShown', 'true');
    currentUrl.searchParams.delete('from');
    const cleanPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState({}, document.title, cleanPath || '/');
    return;
  }

  if (sessionStorage.getItem('loaderShown') === 'true') {
    return;
  }

  window.location.replace('/loader');
})();
