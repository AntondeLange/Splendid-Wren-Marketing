import { useEffect } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_IDS = ['name', 'businessName', 'email', 'message'] as const;

export default function ContactFormEnhancer() {
  useEffect(() => {
    const form = document.querySelector('[data-contact-form]');
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const status = document.querySelector('[data-form-status]');
    const charCount = form.querySelector('[data-char-count]');
    const messageField = form.querySelector('#message');
    const submitButton = form.querySelector('button[type="submit"]');

    const clearError = (id: string): void => {
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

    const setError = (id: string, message: string): void => {
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

    const setStatus = (message: string, tone: 'ok' | 'error'): void => {
      if (!(status instanceof HTMLElement)) {
        return;
      }

      status.textContent = message;
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

    const updateCharCount = (): void => {
      if (!(messageField instanceof HTMLTextAreaElement) || !(charCount instanceof HTMLElement)) {
        return;
      }

      charCount.textContent = `${messageField.value.length}/200`;
    };

    const onSubmit = async (event: SubmitEvent): Promise<void> => {
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

      if (message.length < 10 || message.length > 200) {
        setError('message', 'Please provide a message between 10 and 200 characters.');
        hasError = true;
      }

      if (hasError) {
        setStatus('Please correct the highlighted fields and try again.', 'error');
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

        type ApiPayload = {
          ok?: boolean;
          message?: string;
          errors?: string[];
        };

        const payload: ApiPayload | null = await response.json().catch(() => null);

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
    }

    form.addEventListener('submit', onSubmit);

    return () => {
      if (messageField instanceof HTMLTextAreaElement) {
        messageField.removeEventListener('input', updateCharCount);
      }

      form.removeEventListener('submit', onSubmit);
    };
  }, []);

  return null;
}
