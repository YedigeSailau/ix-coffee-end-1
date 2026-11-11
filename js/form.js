// ---------- pre-order form validation (no alerts, errors under the fields) ----------
(function () {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const fieldNames = ['name', 'email', 'phone', 'time', 'note'];
  const touched = new Set(); // fields the visitor has already visited

  const rules = {
    name(value) {
      const v = value.trim();
      if (v === '') return 'Enter your name.';
      if (v.length < 2 || !/^[\p{L}][\p{L}\s'’-]*$/u.test(v)) return 'Use at least 2 letters, without digits.';
      return '';
    },
    email(value) {
      const v = value.trim();
      if (v === '') return 'Enter your email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email, for example you@example.com.';
      return '';
    },
    phone(value) {
      const digits = value.replace(/[\s\-()]/g, '');
      if (digits === '') return 'Enter your phone number.';
      if (!/^(\+7|8)\d{10}$/.test(digits)) return 'Use the format +7 700 123 45 67.';
      return '';
    },
    time(value) {
      if (value === '') return 'Choose a pickup time.';
      if (value < '08:00' || value > '22:00') return 'We are open 08:00–22:00. Choose a time in that range.';
      return '';
    },
    note(value) {
      return value.length > 120 ? 'Keep the note under 120 characters (now ' + value.length + ').' : '';
    }
  };

  function showState(field, message) {
    const feedback = document.getElementById(field.id + '-error');
    feedback.textContent = message;
    field.classList.toggle('is-invalid', message !== '');
    field.classList.toggle('is-valid', message === '' && field.value !== '');
    field.setAttribute('aria-invalid', String(message !== ''));
  }

  function validateField(field) {
    const message = rules[field.name](field.value);
    showState(field, message);
    return message === '';
  }

  fieldNames.forEach(fieldName => {
    const field = form.elements[fieldName];
    field.addEventListener('blur', () => { touched.add(fieldName); validateField(field); });
    // an error disappears as soon as the value becomes correct
    field.addEventListener('input', () => { if (touched.has(fieldName)) validateField(field); });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    let firstInvalid = null;
    fieldNames.forEach(fieldName => {
      const field = form.elements[fieldName];
      touched.add(fieldName);
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    const totals = cartTotals();
    const cartError = document.getElementById('cartError');
    cartError.hidden = totals.count > 0;

    if (firstInvalid) { firstInvalid.focus(); return; }
    if (totals.count === 0) {
      document.getElementById('cart').scrollIntoView({ block: 'center' });
      return;
    }

    const name = form.elements.name.value.trim();
    const time = form.elements.time.value;
    document.getElementById('formMsg').textContent =
      'Thanks, ' + name + '! Your pre-order of ' + totals.count + (totals.count === 1 ? ' item' : ' items') +
      ' (' + formatPrice(totals.total) + ') is in. We will keep it warm until ' + time + '.';

    form.reset();
    touched.clear();
    fieldNames.forEach(fieldName => {
      const field = form.elements[fieldName];
      field.classList.remove('is-invalid', 'is-valid');
      field.removeAttribute('aria-invalid');
      document.getElementById(field.id + '-error').textContent = '';
    });
    clearCart();
    document.dispatchEvent(new CustomEvent('order:placed'));
  });
})();
