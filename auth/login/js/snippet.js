() => {
  'use strict';

  const root = document.querySelector('.cl-login01');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  if (!form || !done) return;

  const say = (text, info) => {
    live.textContent = '';
    const p = document.createElement('p');
    if (info) p.className = 'is-info';
    p.textContent = text;
    live.append(p);
  };

  
  const messageFor = (el) => {
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email address like name@example.com.';
    if (el.minLength > 0 && el.value.length < el.minLength) return `Passwords are at least ${el.minLength} characters.`;
    return '';
  };

  const check = (field) => {
    const el = field.querySelector('input');
    const msg = messageFor(el);
    field.querySelector('[data-error]').textContent = msg;
    field.classList.toggle('is-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };

  const fields = Array.from(form.querySelectorAll('[data-field]'));
  fields.forEach((field) => {
    field.addEventListener('focusout', (e) => {
      if (field.contains(e.relatedTarget) || (e.relatedTarget && e.relatedTarget.matches('button'))) return;
      if (!field.querySelector('input').value && !field.dataset.touched) return; 
      field.dataset.touched = '1';
      check(field);
    });
    field.addEventListener('input', () => { if (field.dataset.touched) check(field); });
  });

  
  root.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    if (!input) return;
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
    });
  });

  root.querySelectorAll('[data-social]').forEach((btn) => {
    btn.addEventListener('click', () => say(`Demo — ${btn.dataset.social} sign-in is not connected here.`, true));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      say(bad.length === 1 ? 'Please fix the highlighted field.' : `Please fix ${bad.length} highlighted fields.`);
      bad[0].querySelector('input').focus();
      return;
    }
    live.textContent = '';
    const email = form.elements.email.value.trim();
    root.querySelector('[data-done-text]').textContent = `Signed in as ${email}. Loading your routes and offline maps…`;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  root.querySelector('[data-reset]').addEventListener('click', () => {
    form.reset();
    fields.forEach((f) => { delete f.dataset.touched; f.classList.remove('is-error'); f.querySelector('[data-error]').textContent = ''; f.querySelector('input').removeAttribute('aria-invalid'); });
    done.hidden = true;
    form.hidden = false;
    form.elements.email.focus();
  });
})();

