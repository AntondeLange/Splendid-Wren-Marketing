// Contact Form Handler
(function() {
  'use strict';
  
  const MAX_MESSAGE_LENGTH = 200;
  
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Character counter
    if (messageField && charCount) {
      messageField.addEventListener('input', function() {
        const length = messageField.value.length;
        charCount.textContent = length + '/' + MAX_MESSAGE_LENGTH;
        
        if (length > MAX_MESSAGE_LENGTH) {
          charCount.classList.add('error');
          messageField.classList.add('error');
        } else {
          charCount.classList.remove('error');
          messageField.classList.remove('error');
        }
        
        // Update submit button state
        if (submitButton) {
          submitButton.disabled = length > MAX_MESSAGE_LENGTH || length === 0;
        }
      });
    }
    
    // Allow native form submission to FormSubmit
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
