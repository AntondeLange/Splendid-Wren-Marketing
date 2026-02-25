(() => {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^[\d\s()+-]{6,20}$/;
  const ALLOWED_SERVICE_FOCUS = new Set([
    'small-business-marketing-consulting',
    'ai-marketing-support',
    'brand-strategy',
    'not-sure-yet',
  ]);
  const FIELD_IDS = ['name', 'businessName', 'email', 'phone', 'serviceFocus', 'message'];

  const form = document.querySelector('[data-contact-form]');
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const status = document.querySelector('[data-form-status]');
  const charCount = form.querySelector('[data-char-count]');
  const messageField = form.querySelector('#message');
  const submitButton = form.querySelector('button[type="submit"]');

  const clearError = (id) => {
    const errorEl = form.querySelector(`[data-error-for="${id}"]`);
    const field = form.querySelector(`#${id}`);

    if (errorEl instanceof HTMLElement) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    if (field instanceof HTMLElement) {
      field.removeAttribute('aria-invalid');
    }
  };

  const setError = (id, message) => {
    const errorEl = form.querySelector(`[data-error-for="${id}"]`);
    const field = form.querySelector(`#${id}`);

    if (errorEl instanceof HTMLElement) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }

    if (field instanceof HTMLElement) {
      field.setAttribute('aria-invalid', 'true');
    }
  };

  const setStatus = (message, tone) => {
    if (!(status instanceof HTMLElement)) {
      return;
    }

    status.textContent = message;
    status.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    status.classList.remove(
      'hidden',
      'border-red-200',
      'bg-red-50',
      'text-red-800',
      'border-sky-200',
      'bg-sky-50',
      'text-sky-800',
    );

    if (tone === 'error') {
      status.classList.add('border-red-200', 'bg-red-50', 'text-red-800');
      return;
    }

    status.classList.add('border-sky-200', 'bg-sky-50', 'text-sky-800');
  };

  const updateCharCount = () => {
    if (!(messageField instanceof HTMLTextAreaElement) || !(charCount instanceof HTMLElement)) {
      return;
    }

    charCount.textContent = `${messageField.value.length}/200`;
  };

  const focusFirstErrorField = () => {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid instanceof HTMLElement) {
      firstInvalid.focus();
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    FIELD_IDS.forEach((fieldId) => clearError(fieldId));
    setStatus('', 'ok');
    if (status instanceof HTMLElement) {
      status.classList.add('hidden');
    }

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const businessName = String(data.get('businessName') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const serviceFocus = String(data.get('serviceFocus') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    let hasError = false;

    if (!name) {
      setError('name', 'Please provide your name.');
      hasError = true;
    }

    if (!businessName) {
      setError('businessName', 'Please provide your business name.');
      hasError = true;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError('email', 'Please provide a valid email address.');
      hasError = true;
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      setError('phone', 'Please provide a valid phone number, or leave this blank.');
      hasError = true;
    }

    if (serviceFocus && !ALLOWED_SERVICE_FOCUS.has(serviceFocus)) {
      setError('serviceFocus', 'Please choose a valid option.');
      hasError = true;
    }

    if (message.length < 10 || message.length > 200) {
      setError('message', 'Please provide a message between 10 and 200 characters.');
      hasError = true;
    }

    if (hasError) {
      setStatus('Please correct the highlighted fields and try again.', 'error');
      focusFirstErrorField();
      return;
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    setStatus('Submitting your message securely...', 'ok');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        const errorMessage =
          payload?.errors?.join(' ') || payload?.message || 'Unable to submit your message right now.';
        throw new Error(errorMessage);
      }

      form.reset();
      updateCharCount();
      setStatus('Thanks, your message has been sent. We will reply by email soon.', 'ok');
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Unable to submit your message right now. Please try again.',
        'error',
      );
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
    }
  };

  updateCharCount();

  if (messageField instanceof HTMLTextAreaElement) {
    messageField.addEventListener('input', updateCharCount);
    messageField.setAttribute('aria-describedby', 'message-char-count message-error');
  }

  form.addEventListener('submit', onSubmit);
})();
