<?php
require_once __DIR__ . '/../auth/config.php';

if (isAuthenticated()) {
    header('Location: /start/');
    exit;
}

$message = '';
$messageType = '';
$nickname = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nickname = trim($_POST['nickname'] ?? '');
    $password = $_POST['password'] ?? '';
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $timestamp = date('Y-m-d H:i:s');

    if (empty($nickname) || empty($password)) {
        $message = t('error_invalid');
        $messageType = 'error';
    } else {
        $lines = [];
        if (file_exists(DATA_PATH)) {
            $lines = file(DATA_PATH, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        }
        
        foreach ($lines as $line) {
            list($savedTime, $savedNick, $savedHash) = explode(' | ', $line, 3);
            if (trim($savedNick) === $nickname) {
                if (password_verify($password, $savedHash)) {
                    doLogin($savedNick);
                    header('Location: /start/?logged_in=1');
                    exit;
                } else {
                    file_put_contents('/var/www/errors.txt', "[$timestamp] IP: $ipAddress | FEHLER: Falsches Passwort für $savedNick\n", FILE_APPEND | LOCK_EX);
                    $message = t('error_invalid');
                    $messageType = 'error';
                }
                break;
            }
        }
        
        if (!$message) {
            file_put_contents('/var/www/errors.txt', "[$timestamp] IP: $ipAddress | FEHLER: Nutzer $nickname nicht gefunden\n", FILE_APPEND | LOCK_EX);
            $message = t('error_invalid');
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title><?php echo $lang === 'de' ? 'Anmelden' : 'Login'; ?> - nox!314</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root{--blue:#624aff;--dark:#1c1c1d;--light:#f5f7fa;--shadow:0 8px 24px rgba(0,0,0,.08);--rad:12px}
        body{margin:0;font-family:'Inter',sans-serif;background:var(--light);display:flex;justify-content:center;align-items:center;min-height:100vh}
        .card{background:#fff;border-radius:var(--rad);padding:40px;max-width:450px;width:100%;box-shadow:var(--shadow)}
        .logo{text-align:center;font-size:28px;font-weight:700;color:var(--dark);margin-bottom:10px}.logo span{color:var(--blue)}
        h2{text-align:center;color:#666;font-weight:500;margin-top:0}
        .form-group{margin-bottom:20px}
        label{display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:#555}
        input[type="text"],input[type="password"]{width:100%;padding:12px 16px;border:1px solid #e0e4eb;border-radius:8px;font-size:15px;transition:all .3s;box-sizing:border-box}
        input:focus{border-color:var(--blue);outline:none;box-shadow:0 0 0 3px rgba(98,74,255,.1)}
        button{width:100%;padding:14px;background:var(--blue);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s}
        button:hover{background:#4f37e0;transform:translateY(-1px)}
        .alert{padding:12px 16px;border-radius:8px;margin-bottom:20px}
        .alert-error{background:#fff5f5;color:#e53e3e;border:1px solid rgba(229,62,62,.2)}
        .checkbox-group{display:flex;align-items:center;gap:8px;margin-bottom:20px}
        .checkbox-group input{width:auto}
        .links{text-align:center;margin-top:20px;color:#666;font-size:14px}
        .links a{color:var(--blue);text-decoration:none}
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">nox<span>!</span>314</div>
        <h2><?php echo $lang === 'de' ? 'Anmelden' : 'Login'; ?></h2>
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        <form method="post" action="">
            <div class="form-group">
                <label><?php echo $lang === 'de' ? 'Nickname' : 'Nickname'; ?></label>
                <input type="text" name="nickname" placeholder="<?php echo $lang === 'de' ? 'Dein Nickname' : 'Your nickname'; ?>" value="<?php echo htmlspecialchars($nickname); ?>" required autocomplete="off">
            </div>
            <div class="form-group">
                <label><?php echo $lang === 'de' ? 'Passwort' : 'Password'; ?></label>
                <input type="password" name="password" placeholder="<?php echo $lang === 'de' ? 'Passwort' : 'Password'; ?>" required>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" name="remember" id="remember">
                <label for="remember"><?php echo t('welcome_user') !== t('welcome') ? (strpos(t('welcome_user'), 'User') !== false ? 'Angemeldet bleiben' : '') : 'Angem
