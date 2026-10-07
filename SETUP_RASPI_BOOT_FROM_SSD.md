# Raspberry Pi 4 - Boot von SSD (2TB) - Komplette Anleitung

## Voraussetzungen
- Raspberry Pi 4 mit 8GB RAM
- 2TB SSD (USB oder NVMe mit Adapter)
- Fritzbox mit Portweiterleitung auf nox314server.fritz.link
- Raspberry Pi Imager

---

## Phase 1: Raspberry Pi OS auf die SSD installieren

### 1. EEPROM vor dem flashen aktualisieren (wichtig!)

Auf einem anderen Pi oder PC mit Linux:

```bash
# Option A: Mit existierendem Pi
ssh pi@raspberrypi.local
sudo apt update
sudo apt install rpi-eeprom
sudo rpi-eeprom-update -d -f /lib/firmware/rpi-eeprom/release/
# Neustart
sudo reboot
```

Dies braucht man NUR einmal, damit der Pi von USB booten kann.

### 2. SSD mit Raspberry Pi Imager flashen

1. **SSD anschließen** an deinen PC/Mac (USB-Adapter wenn nötig)
2. **Raspberry Pi Imager** downloaden: https://www.raspberrypi.com/software/
3. **Im Imager:**
   - "Choose OS" → "Raspberry Pi OS (64-bit)" (oder Lite für Server)
   - "Choose Storage" → Deine SSD wählen (ACHTUNG: richtige Disk!)
   - Zahnrad-Icon (Advanced options):
     - ✅ Enable SSH
     - Set username/password: `pi` / dein_sicheres_passwort
     - Configure wireless LAN: Dein WLAN
     - Locale: de_DE.UTF-8, Europe/Berlin
   - "Write" klicken

### 3. SSD in den Raspberry Pi einbauen & booten

1. Pi ausschalten
2. SSD via USB anschließen (Port 3 oder 4, nicht Port 1-2)
3. SD-Karte entfernen (!)
4. Pi einschalten
5. Warten (erste Boot dauert ~2 Minuten)

### 4. SSH verbinden

```bash
ssh pi@raspberrypi.local
# oder mit IP aus Fritzbox:
ssh pi@192.168.x.x
```

**Test erfolgreich?** ✅ Dann gehts weiter!

---

## Phase 2: System aktualisieren

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano htop
```

---

## Phase 3: Apache + PHP + MariaDB installieren

### 1. Apache2

```bash
sudo apt install -y apache2 apache2-utils
sudo systemctl start apache2
sudo systemctl enable apache2
sudo systemctl status apache2
```

### 2. PHP

```bash
sudo apt install -y php php-mysql php-curl php-xml php-json php-mbstring php-common
php -v
```

### 3. MariaDB

```bash
sudo apt install -y mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Sicherung
sudo mysql_secure_installation
```

Antworte:
- Enter (kein aktuelles Passwort)
- `y` → Root-Passwort setzen → **sicheres Passwort merken!**
- `y` → Anonyme Benutzer löschen
- `n` → Remote-Login deaktivieren
- `y` → Test-DB löschen
- `y` → Rechte neu laden

### 4. Rewrite Module

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## Phase 4: Verzeichnisse & VirtualHost

### 1. Ordnerstruktur auf der SSD

```bash
# Erstelle auf der SSD (die ist jetzt / wenn du von ihr bootest)
sudo mkdir -p /home/nox314/{public_html,api}
sudo chown -R www-data:www-data /home/nox314
sudo chmod -R 755 /home/nox314
```

Oder wenn du extra Verzeichnis willst:

```bash
sudo mkdir -p /var/www/nox314/{public_html,api}
sudo chown -R www-data:www-data /var/www/nox314
sudo chmod -R 755 /var/www/nox314
```

### 2. VirtualHost konfigurieren

```bash
sudo nano /etc/apache2/sites-available/nox314.conf
```

Paste rein:

```apache
<VirtualHost *:80>
    ServerName nox314server.fritz.link
    ServerAlias www.nox314server.fritz.link
    
    DocumentRoot /var/www/nox314/public_html
    
    <Directory /var/www/nox314/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/nox314/api>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/nox314_error.log
    CustomLog ${APACHE_LOG_DIR}/nox314_access.log combined
    
    # CORS für API
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</VirtualHost>
```

Speichern: `CTRL+O` → Enter → `CTRL+X`

```bash
# Aktivieren
sudo a2ensite nox314.conf
sudo a2dissite 000-default.conf

# Testen
sudo apache2ctl configtest
# → "Syntax OK"

# Neustarten
sudo systemctl restart apache2
```

---

## Phase 5: MariaDB Datenbank erstellen

```bash
sudo mysql -u root -p
```

Gib dein Root-Passwort ein:

```sql
-- Datenbank
CREATE DATABASE nox314_users CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Benutzer
CREATE USER 'nox314_app'@'localhost' IDENTIFIED BY 'DeinSicheresPasswort123!';

-- Rechte
GRANT ALL PRIVILEGES ON nox314_users.* TO 'nox314_app'@'localhost';
FLUSH PRIVILEGES;

-- Tabellen
USE nox314_users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

EXIT;
```

---

## Phase 6: PHP API-Dateien erstellen

### 1. config.php

```bash
sudo nano /var/www/nox314/api/config.php
```

```php
<?php
// config.php
define('DB_HOST', 'localhost');
define('DB_USER', 'nox314_app');
define('DB_PASS', 'DeinSicheresPasswort123!');  // ← ÄNDERN
define('DB_NAME', 'nox314_users');
define('JWT_SECRET', 'dein_super_sicherer_jwt_secret_string_123!@#');  // ← ÄNDERN

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Datenbankverbindung fehlgeschlagen']);
    exit();
}

$mysqli->set_charset('utf8mb4');

function sanitize($input) {
    return htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8');
}
?>
```

Speichern: `CTRL+O` → Enter → `CTRL+X`

### 2. register.php

```bash
sudo nano /var/www/nox314/api/register.php
```

```php
<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email'], $data['password'], $data['fullname'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Erforderliche Felder fehlen']);
    exit();
}

$email = sanitize($data['email']);
$password = $data['password'];
$fullname = sanitize($data['fullname']);

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Passwort muss mindestens 8 Zeichen lang sein']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige E-Mail']);
    exit();
}

$stmt = $mysqli->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'E-Mail bereits registriert']);
    exit();
}

$password_hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $mysqli->prepare('INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $fullname, $email, $password_hash);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registrierung erfolgreich',
        'user' => [
            'id' => $mysqli->insert_id,
            'fullname' => $fullname,
            'email' => $email
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Fehler beim Registrieren']);
}
?>
```

### 3. login.php

```bash
sudo nano /var/www/nox314/api/login.php
```

```php
<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-Mail und Passwort erforderlich']);
    exit();
}

$email = sanitize($data['email']);
$password = $data['password'];

$stmt = $mysqli->prepare('SELECT id, fullname, password_hash FROM users WHERE email = ? AND is_active = TRUE');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'E-Mail oder Passwort falsch']);
    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'E-Mail oder Passwort falsch']);
    exit();
}

// JWT Token
$header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
$payload = base64_encode(json_encode([
    'user_id' => $user['id'],
    'email' => $email,
    'iat' => time(),
    'exp' => time() + (24 * 60 * 60)
]));
$signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
$token = "$header.$payload.$signature";

$expires_at = date('Y-m-d H:i:s', time() + (24 * 60 * 60));
$stmt = $mysqli->prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)');
$stmt->bind_param('iss', $user['id'], $token, $expires_at);
$stmt->execute();

$stmt = $mysqli->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();

echo json_encode([
    'success' => true,
    'message' => 'Anmeldung erfolgreich',
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'fullname' => $user['fullname'],
        'email' => $email
    ]
]);
?>
```

### 4. profile.php

```bash
sudo nano /var/www/nox314/api/profile.php
```

```php
<?php
require 'config.php';

$token = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches);
    $token = $matches[1] ?? null;
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token erforderlich']);
    exit();
}

$stmt = $mysqli->prepare('SELECT user_id FROM sessions WHERE token = ? AND is_active = TRUE AND expires_at > NOW()');
$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token ungültig oder abgelaufen']);
    exit();
}

$session = $result->fetch_assoc();
$user_id = $session['user_id'];

$stmt = $mysqli->prepare('SELECT id, fullname, email, created_at, last_login FROM users WHERE id = ?');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

echo json_encode([
    'success' => true,
    'user' => $user
]);
?>
```

### 5. logout.php

```bash
sudo nano /var/www/nox314/api/logout.php
```

```php
<?php
require 'config.php';

$token = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches);
    $token = $matches[1] ?? null;
}

if ($token) {
    $stmt = $mysqli->prepare('UPDATE sessions SET is_active = FALSE WHERE token = ?');
    $stmt->bind_param('s', $token);
    $stmt->execute();
}

echo json_encode(['success' => true, 'message' => 'Abgemeldet']);
?>
```

---

## Phase 7: Berechtigungen setzen

```bash
sudo chown -R www-data:www-data /var/www/nox314
sudo chmod -R 755 /var/www/nox314
sudo chmod 640 /var/www/nox314/api/config.php
```

---

## Phase 8: Frontend hochladen

### Option A: GitHub clonen

```bash
cd /var/www/nox314/public_html
git clone https://github.com/Nox314/Home.git .
sudo chown -R www-data:www-data /var/www/nox314/public_html
```

### Option B: Manuell mit SCP (von deinem PC)

```bash
scp -r ~/Downloads/Home/* pi@192.168.x.x:/var/www/nox314/public_html/
```

---

## Phase 9: HTTPS mit Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-apache

sudo certbot --apache -d nox314server.fritz.link -d www.nox314server.fritz.link
```

Folge den Anweisungen:
- E-Mail eingeben
- Terms akzeptieren
- Automatic renewal aktivieren

---

## Phase 10: Testen

### 1. API-Test (Registrierung)

```bash
curl -X POST http://192.168.x.x/api/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "message": "Registrierung erfolgreich",
  "user": {
    "id": 1,
    "fullname": "Test User",
    "email": "test@example.com"
  }
}
```

### 2. API-Test (Login)

```bash
curl -X POST http://192.168.x.x/api/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "message": "Anmeldung erfolgreich",
  "token": "eyJ0eXAi...",
  "user": { ... }
}
```

### 3. Browser-Test

Öffne: `http://192.168.x.x` (oder später https://nox314server.fritz.link)

Du solltest die Startseite mit Login/Register-Buttons sehen.

---

## Troubleshooting

### Apache startet nicht

```bash
sudo apache2ctl configtest
sudo systemctl status apache2
sudo tail -f /var/log/apache2/error.log
```

### MariaDB läuft nicht

```bash
sudo systemctl status mariadb
sudo mysql -u root -p
```

### API antwortet nicht

```bash
sudo ls -la /var/www/nox314/api/
sudo tail -f /var/log/apache2/nox314_error.log
```

### Berechtigungsfehler

```bash
sudo chown -R www-data:www-data /var/www/nox314
sudo chmod -R 755 /var/www/nox314
```

---

## Fertig! 🎉

Dein Server läuft jetzt auf der SSD!

- **Frontend:** http://192.168.x.x → später https://nox314server.fritz.link
- **API:** http://192.168.x.x/api/
- **Datenbank:** MariaDB auf localhost

Du kannst dich registrieren, einloggen und das Profil anschauen!
