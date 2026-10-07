// ============================================================
// X!314 Authentication System
// Handles registration, login, and session management
// ============================================================

class AuthSystem {
  constructor() {
    this.storageKey = 'x314_users';
    this.sessionKey = 'x314_session';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  register(fullname, email, password) {
    const cleanName = (fullname || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return { success: false, message: 'Bitte fülle alle Felder aus.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
    }

    if (cleanPassword.length < 8) {
      return { success: false, message: 'Das Passwort muss mindestens 8 Zeichen lang sein.' };
    }

    const users = this.getAllUsers();
    if (users.some(user => user.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Diese E-Mail ist bereits registriert.' };
    }

    const newUser = {
      id: Date.now(),
      fullname: cleanName,
      email: cleanEmail,
      password: this.hashPassword(cleanPassword),
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registrierung erfolgreich.', user: newUser };
  }

  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'E-Mail und Passwort sind erforderlich.' };
    }

    const users = this.getAllUsers();
    const user = users.find(item => item.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Dieser Benutzer existiert nicht.' };
    }

    if (!this.verifyPassword(cleanPassword, user.password)) {
      return { success: false, message: 'Das Passwort ist falsch.' };
    }

    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);

    const session = {
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(session));

    return { success: true, message: 'Anmeldung erfolgreich.', user, session };
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    return { success: true, message: 'Erfolgreich abgemeldet.' };
  }

  isLoggedIn() {
    return !!this.getSession();
  }

  getSession() {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const users = this.getAllUsers();
    return users.find(user => user.id === session.userId) || null;
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  getUserById(userId) {
    return this.getAllUsers().find(user => user.id === userId) || null;
  }
}

window.auth = new AuthSystem();
