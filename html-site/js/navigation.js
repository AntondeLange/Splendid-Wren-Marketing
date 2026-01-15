// Navigation Handler
(function() {
  'use strict';
  
  function initNavigation() {
    // Close menu when clicking a link (Bootstrap handles the toggle)
    const menuCollapse = document.querySelector('.navbar-collapse');
    if (menuCollapse) {
      const navLinks = menuCollapse.querySelectorAll('.nav-link');
      navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
          if (window.innerWidth < 768) {
            // Use Bootstrap's collapse instance to hide
            const bsCollapse = bootstrap.Collapse.getInstance(menuCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          }
        });
      });
    }
    
    // Set active nav link based on current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      const linkPage = href.split('/').pop();
      const isActive = linkPage === currentPage || (currentPage === '' && linkPage === 'index.html');

      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
