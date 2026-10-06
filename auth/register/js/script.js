// Register form validation and submission handler
(function() {
  'use strict';

  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  // Form validation
  const validateForm = () => {
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const terms = document.getElementById('terms').checked;

    const errors = [];

    if (!fullname) errors.push('Name ist erforderlich');
    if (!email) errors.push('E-Mail ist erforderlich');
    if (!password) errors.push('Passwort ist erforderlich');
    if (password.length < 8) errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    if (password !== passwordConfirm) errors.push('Passwörter stimmen nicht überein');
    if (!terms) errors.push('Sie müssen den Bedingungen zustimmen');

    return errors;
  };

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Fehler bei der Registrierung:\n' + errors.join('\n'));
      return;
    }

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    alert(`Registrierung erfolgreich!\nWillkommen ${fullname}!\nE-Mail: ${email}`);
    registerForm.reset();
  });
})();