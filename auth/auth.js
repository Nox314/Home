<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profil - nox!314</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --blue: #624aff;
      --blue-dark: #4f37e0;
      --dark: #1c1c1c;
      --light: #f5f7fa;
      --line: #e0e4eb;
      --text: #333333;
      --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
      --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
      --radius: 12px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: var(--light);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    a { text-decoration: none; }
    #topMenu {
      background: white;
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    #topMenu .wrap { display: flex; align-items: center; justify-content: space-between; height: 70px; }
    .logo { font-weight: 700; font-size: 24px; color: var(--dark); }
    .logo span { color: var(--blue); }
    .nav-links { display: flex; align-items: center; gap: 18px; }
    .nav-links a {
      color: var(--text);
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 500;
    }
    .nav-links a:hover, .nav-links a.active { color: var(--blue); background: rgba(98,74,255,0.08); }
    .btn-register {
      background: var(--blue);
      color: white !important;
      border-radius: 8px;
      padding: 10px 20px !important;
      box-shadow: 0 4px 12px rgba(98,74,255,0.2);
    }
    .main-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 56px 20px;
    }
    .profile-card {
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow-md);
      width: min(700px, 100%);
      padding: 42px;
    }
    .avatar {
      width: 82px;
      height: 82px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), #8a7bff);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 auto 18px;
    }
    h1 {
      text-align: center;
      margin: 0 0 8px;
      font-size: 2rem;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 28px;
    }
    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin: 28px 0;
    }
    .info-box {
      background: #fafbff;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 18px;
    }
    .label {
      display: block;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #777;
      margin-bottom: 8px;
    }
    .value {
      font-weight: 700;
      font-size: 1rem;
      word-break: break-word;
    }
    .button-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 18px;
    }
    .primary-btn, .secondary-btn {
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
    .primary-btn {
      background: var(--blue);
      color: white;
    }
    .secondary-btn {
      background: #f2f4ff;
      color: var(--dark);
    }
    footer {
      background: white;
      border-top: 1px solid var(--line);
      padding: 26px 0;
      text-align: center;
      color: #666;
    }
    .footer-links {
      margin-top: 12px;
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-links a {
      color: var(--blue);
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .data-grid { grid-template-columns: 1fr; }
      .nav-links { display: none; }
      .hamburger { display: flex; flex-direction: column; gap: 6px; background: none; border: none; padding: 8px; cursor: pointer; }
      .hamburger span { width: 24px; height: 3px; border-radius: 2px; background: var(--dark); }
      .nav-links.mobile-open { display: flex; position: absolute; top: 70px; left: 0; right: 0; flex-direction: column; background: white; padding: 16px 20px; border-top: 1px solid var(--line); }
    }
  </style>
</head>
<body>
  <nav id="topMenu">
    <div class="wrap">
      <a href="/Home/index.html" class="logo">nox<span>!</span>314</a>
      <button class="hamburger" id="hamburger" aria-label="Menü öffnen">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks">
        <a href="/Home/index.html">Start</a>
        <a href="/Home/date.html">Weltuhr</a>
        <a href="/Home/iss.html">Iss</a>
        <a href="/Home/info.html">Info</a>
        <a href="/Home/auth/login/index.html" id="loginLink">Login</a>
        <a href="/Home/auth/register/index.html" id="registerLink" class="btn-register">Registrieren</a>
      </div>
    </div>
  </nav>

  <main class="main-container">
    <div class="profile-card">
      <div class="avatar" id="avatar">👤</div>
      <h1 id="fullName">Profil</h1>
      <div class="subtitle" id="subtitle">Lade Profil…</div>

      <div class="data-grid">
        <div class="info-box">
          <span class="label">Name</span>
          <div class="value" id="nameValue">-</div>
        </div>
        <div class="info-box">
          <span class="label">E-Mail</span>
          <div class="value" id="emailValue">-</div>
        </div>
      </div>

      <div class="button-row">
        <button class="secondary-btn" type="button" onclick="window.location.href='/Home/index.html'">Zur Startseite</button>
        <button class="primary-btn" id="logoutBtn" type="button">Abmelden</button>
      </div>
    </div>
  </main>

  <footer>
    <div class="wrap">
      <div>© 2026 nox!314</div>
      <div class="footer-links">
        <a href="/Home/sourcecodes.html">Quellcode</a>
        <a href="/Home/news.html">News</a>
        <a href="/Home/sitemap.html">Sitemap</a>
      </div>
    </div>
  </footer>

  <script src="/Home/auth/auth.js"></script>
  <script>
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const logoutBtn = document.getElementById('logoutBtn');

    hamburger.addEventListener('click', () => navLinks.classList.toggle('mobile-open'));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('mobile-open')));

    async function loadProfile() {
      const user = await window.auth.getCurrentUser();
      if (!user) {
        window.location.href = '/Home/auth/login/index.html';
        return;
      }

      document.getElementById('fullName').textContent = user.fullname || 'Unbekannter Nutzer';
      document.getElementById('subtitle').textContent = 'Dein persönliches Konto';
      document.getElementById('nameValue').textContent = user.fullname || '-';
      document.getElementById('emailValue').textContent = user.email || '-';
      document.getElementById('avatar').textContent = (user.fullname || 'U').charAt(0).toUpperCase();
    }

    logoutBtn.addEventListener('click', async () => {
      const result = await window.auth.logout();
      if (result.success) {
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/Home/auth/login/index.html';
      } else {
        alert(result.message || 'Abmeldung fehlgeschlagen');
      }
    });

    loadProfile();
  </script>
</body>
</html>
