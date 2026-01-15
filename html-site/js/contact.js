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
    const nextField = document.getElementById('form-next');
    const successBanner = document.getElementById('contact-success');

    if (nextField) {
      const baseUrl = window.location.origin + window.location.pathname;
      nextField.value = baseUrl + '?success=1';
    }

    if (successBanner) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === '1') {
        successBanner.style.display = 'block';
        successBanner.setAttribute('tabindex', '-1');
        successBanner.focus();
      }
    }
    
    // Character counter
    function updateMessageState() {
      if (!messageField || !charCount) {
        return;
      }

      const length = messageField.value.length;
      charCount.textContent = length + '/' + MAX_MESSAGE_LENGTH;

      if (length > MAX_MESSAGE_LENGTH) {
        charCount.classList.add('error');
        messageField.classList.add('error');
      } else {
        charCount.classList.remove('error');
        messageField.classList.remove('error');
      }

      if (submitButton) {
        submitButton.disabled = length > MAX_MESSAGE_LENGTH || length === 0;
      }
    }

    if (messageField && charCount) {
      updateMessageState();
      messageField.addEventListener('input', updateMessageState);
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
