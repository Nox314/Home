<?php
// Authentifizierungs-Konfiguration
session_start();

// Pfade definieren
define('DATA_PATH', __DIR__ . '/../users.txt');
define('ERRORS_LOG', __DIR__ . '/../errors.txt');
define('BASE_URL', '/');

// Sprache
$lang = $_SESSION['lang'] ?? 'de';

// Authentifizierungs-Status prüfen
function isAuthenticated() {
    return isset($_SESSION['user']) && !empty($_SESSION['user']);
}

// Login durchführen
function doLogin($nickname) {
    $_SESSION['user'] = $nickname;
    $_SESSION['login_time'] = time();
}

// Logout durchführen
function doLogout() {
    unset($_SESSION['user']);
    unset($_SESSION['login_time']);
    session_destroy();
}

// Benutzerobjekt erhalten
function getCurrentUser() {
    return $_SESSION['user'] ?? null;
}

// Fehlermeldungen ausgeben
function logError($message) {
    $timestamp = date('Y-m-d H:i:s');
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    file_put_contents(ERRORS_LOG, "[$timestamp] IP: $ipAddress | $message\n", FILE_APPEND | LOCK_EX);
}

// Übersetzungen
function getTranslations($language = 'de') {
    $translations = [
        'de' => [
            'error_invalid' => 'Ungültige Anmeldedaten',
            'error_empty' => 'Bitte füllen Sie alle Felder aus',
            'welcome' => 'Willkommen',
            'welcome_user' => 'Willkommen, Nutzer',
            'error_password_mismatch' => 'Passwörter stimmen nicht überein',
            'error_password_too_short' => 'Passwort muss mindestens 6 Zeichen haben',
            'success_registered' => 'Erfolgreich registriert. Sie können sich jetzt anmelden.',
            'error_system' => 'Systemfehler',
            'error_server' => 'Server-Fehler'
        ],
        'en' => [
            'error_invalid' => 'Invalid credentials',
            'error_empty' => 'Please fill in all fields',
            'welcome' => 'Welcome',
            'welcome_user' => 'Welcome, User',
            'error_password_mismatch' => 'Passwords do not match',
            'error_password_too_short' => 'Password must be at least 6 characters',
            'success_registered' => 'Successfully registered. You can now log in.',
            'error_system' => 'System error',
            'error_server' => 'Server error'
        ]
    ];
    return $translations[$language] ?? $translations['de'];
}

// Kurz-Funktion für Übersetzungen
function t($key) {
    global $lang;
    $translations = getTranslations($lang);
    return $translations[$key] ?? $key;
}
?>
