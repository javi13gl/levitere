/**
 * Contact form (brief §13):
 *  - client-side validation (required fields, email format)
 *  - POST to the Google Apps Script web app in VITE_FORM_ENDPOINT
 *  - in dev without an endpoint: mock that logs the payload and succeeds
 *  - success replaces the form in place with the thank-you line, no redirect
 */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';
const SUCCESS_TEXT = "Thank you. We'll be in touch shortly.";
const ERROR_TEXT = 'Something went wrong. Please try again.';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submit = form.querySelector('.form__submit');
  const errorEl = form.querySelector('.form__error');
  let sending = false;

  // Clear the invalid state as soon as the user edits a field.
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.form__field');
    if (field) {
      field.classList.remove('is-invalid');
      e.target.removeAttribute('aria-invalid');
    }
    hideError();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;

    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      company: form.elements.company.value.trim(), // honeypot
    };

    const invalid = validate(data);
    if (invalid.length > 0) {
      invalid.forEach((name) => {
        form.elements[name].closest('.form__field').classList.add('is-invalid');
        form.elements[name].setAttribute('aria-invalid', 'true');
      });
      showError(invalid.includes('email') && data.email ? 'Please enter a valid email address.' : 'Please fill in your name and email.');
      form.elements[invalid[0]].focus();
      return;
    }

    sending = true;
    submit.disabled = true;
    hideError();

    try {
      if (data.company) {
        // Bot: pretend it worked, send nothing.
        await delay(400);
      } else {
        await send(data);
      }
      showSuccess();
    } catch (err) {
      showError(ERROR_TEXT);
      submit.disabled = false;
      sending = false;
    }
  });

  function validate(data) {
    const invalid = [];
    if (!data.name) invalid.push('name');
    if (!data.email || !EMAIL_RE.test(data.email)) invalid.push('email');
    return invalid;
  }

  function showSuccess() {
    const p = document.createElement('p');
    p.className = 'form__success';
    p.setAttribute('role', 'status');
    p.textContent = SUCCESS_TEXT;
    form.replaceWith(p);
  }

  function showError(text) {
    errorEl.textContent = text;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
}

async function send(data) {
  const payload = { name: data.name, email: data.email, message: data.message, page: location.href };

  if (!ENDPOINT) {
    if (import.meta.env.DEV) {
      console.info('[contact form] VITE_FORM_ENDPOINT not set, mock submit:', payload);
      await delay(700);
      return;
    }
    throw new Error('Form endpoint not configured');
  }

  // text/plain keeps this a "simple" request (no CORS preflight), which is what
  // Apps Script web apps accept. The body is still JSON.
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json().catch(() => ({}));
  if (json.ok === false) throw new Error(json.error || 'Rejected');
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
