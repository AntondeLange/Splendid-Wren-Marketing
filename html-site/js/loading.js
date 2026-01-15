// Loading Animation
(function() {
  'use strict';
  
  function initLoadingAnimation() {
    // Check if loader has been shown in this session
    if (sessionStorage.getItem('loaderShown') === 'true') {
      return;
    }
    
    // Mark as shown immediately
    sessionStorage.setItem('loaderShown', 'true');
    
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    
    const logo = document.createElement('img');
    logo.src = 'images/logo_loader.svg';
    logo.alt = 'Splendid Wren Marketing';
    logo.className = 'loading-logo';
    
    overlay.appendChild(logo);
    document.body.appendChild(overlay);
    
    // Start fade out after 5 seconds
    setTimeout(function() {
      overlay.classList.add('fade-out');
    }, 5000);
    
    // Remove from DOM after fade out completes
    setTimeout(function() {
      overlay.remove();
    }, 5500);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoadingAnimation);
  } else {
    initLoadingAnimation();
  }
})();
