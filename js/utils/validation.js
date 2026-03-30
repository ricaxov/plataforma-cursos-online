export function isRequired(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function isPositiveNumber(value) {
  const n = parseFloat(value);
  return !isNaN(n) && n > 0;
}

export function isIntegerPositive(value) {
  const n = parseInt(value, 10);
  return !isNaN(n) && n > 0 && n === parseFloat(value);
}

export function clearValidation(form) {
  form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
  });
  form.querySelectorAll('.invalid-feedback').forEach(el => {
    el.textContent = '';
  });
}

export function setInvalid(input, message) {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  const feedback = input.parentElement.querySelector('.invalid-feedback')
    || input.closest('.mb-3')?.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = message;
}

export function setValid(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
}

export function validateField(input, validators) {
  const value = input.value;
  for (const { test, message } of validators) {
    if (!test(value)) {
      setInvalid(input, message);
      return false;
    }
  }
  setValid(input);
  return true;
}

export function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1100';
    document.body.appendChild(container);
  }

  const bgClass = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-warning';
  const textClass = type === 'warning' ? 'text-dark' : 'text-white';
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center ${textClass} ${bgClass} border-0`;
  toastEl.setAttribute('role', 'alert');
  const closeBtn = type === 'warning' ? 'btn-close' : 'btn-close btn-close-white';
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="${closeBtn} me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;

  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
