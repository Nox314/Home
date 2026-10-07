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
    // Initialize users database if it doesn't exist
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Get all registered users
  getAllUsers() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  // Save users to storage
  saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // Register a new user
  register(fullname, email, password) {
    const users = this.getAllUsers();
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'E-Mail bereits registriert!' };
    }

    // Validate inputs
    if (!fullname || !email || !password) {
      return { success: false, message: 'Alle Felder sind erforderlich!' };
    }

    if (password.length < 8) {
      return { success: false, message: 'Passwort muss mindestens 8 Zeichen lang sein!' };
    }

    // Create new user with unique ID
    const newUser = {
      id: Date.now(),
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      password: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registrierung erfolgreich!', user: newUser };
  }

  // Login a user
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'E-Mail nicht gefunden!' };
    }

    if (!this.verifyPassword(password, user.password)) {
      return { success: false, message: 'Passwort falsch!' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(session));

    return { 
      success: true, 
      message: 'Anmeldung erfolgreich!', 
      user: user,
      session: session
    };
  }

  // Logout
  logout() {
    localStorage.removeItem(this.sessionKey);
    return { success: true, message: 'Abgemeldet!' };
  }

  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem(this.sessionKey) !== null;
  }

  // Get current user session
  getSession() {
    const session = localStorage.getItem(this.sessionKey);
    return session ? JSON.parse(session) : null;
  }

  // Get current user data
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    
    const users = this.getAllUsers();
    return users.find(u => u.id === session.userId) || null;
  }

  // Simple password hashing (for demo - use proper hashing in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Verify password
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // Get user by ID
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }
}

// Initialize auth system
const auth = new AuthSystem();
