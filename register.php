<?php
require_once __DIR__ . '/../auth/config.php';

$message = '';
$messageType = '';
$nickname = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nickname = trim($_POST['nickname'] ?? '');
    $password = $_POST['password'] ?? '';
    $passconfirm = $_POST['passconfirm'] ?? '';
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $timestamp = date('Y-m-d H:i:s');
    $t = getTranslations($_SESSION['lang']);

    if (empty($nickname) || empty($password) || empty($passconfirm)) {
        $message = $t['error_empty'] ?? 'Fehler';
        $messageType = 'error';
    } elseif ($password !== $passconfirm) {
        $message = 'Passwörter stimmen nicht überein.';
        $messageType = 'error';
    } elseif (strlen($password) < 6) {
        $message = 'Passwort muss mindestens 6 Zeichen haben.';
        $messageType = 'error';
    } else {
        $savePath = '/var/www/html/nox314/users.txt';
        $dir = dirname($savePath);
        
        if (!file_exists($dir)) { mkdir($dir, 0777, true); }
        if (is_writable($dir)) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $entry = "$timestamp | $nickname | $hashedPassword\n";
            
            if (file_put_contents($savePath, $entry, FILE_APPEND | LOCK_EX) !== false) {
                file_put_contents('/var/www/html/nox314/errors.txt', 
                    "[$timestamp] IP: $ipAddress | ERFOLG: Neuer Benutzer $nickname\n", 
                    FILE_APPEND | LOCK_EX);
                header('Location: /login/login.php?registered=1');
                exit();
            } else {
                $message = 'Systemfehler';
                $messageType = 'error';
            }
        } else {
            $message = 'Server-Fehler';
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrieren - nox!314</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --proton-blue: #624aff; --proton-dark: #1c1c1d; --proton-light: #f5f7fa; --shadow-md: 0 8px 24px rgba(0,0,0,0.08); --radius: 12px; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: var(--proton-light); display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .card { background: white; border-radius: var(--radius); padding: 40px; max-width: 450px; width: 100%; box-shadow: var(--shadow-md); }
        .logo { text-align: center; font-size: 28px; font-weight: 700; color: var(--proton-dark); margin-bottom: 10px; }
        .logo span { color: var(--proton-blue); }
        h2 { text-align: center; color: #666; font-weight: 500; margin-top: 0; }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #555; }
        input[type="text"], input[type="password"] { width: 100%; padding: 12px 16px; border: 1px solid #e0e4eb; border-radius: 8px; font-size: 15px; transition: all 0.3s; box-sizing: border-box; }
        input:focus { border-color: var(--proton-blue); outline: none; box-shadow: 0 0 0 3px rgba(98,74,255,0.1); }
        button { width: 100%; padding: 14px; background: var(--proton-blue); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        button:hover { background: #4f37e0; transform: translateY(-1px); }
        .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
        .alert-success { background: #e6fffa; color: #00b894; }
        .alert-error { background: #fff5f5; color: #e53e3e; }
        .links { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .links a { color: var(--proton-blue); text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">nox<span>!</span>314</div>
        <h2>Registrieren</h2>
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>"><?php echo htmlspecialchars($message); ?></div>
        <?php elseif (isset($_GET['registered'])): ?>
            <div class="alert alert-success">Erfolg! Du kannst dich jetzt anmelden.</div>
        <?php endif; ?>
        <form method="post" action="">
            <div class="form-group">
                <label>Nickname</label>
                <input type="text" name="nickname" placeholder="Dein Nickname" value="<?php echo htmlspecialchars($nickname); ?>" required autocomplete="off">
            </div>
            <div class="form-group">
                <label>Passwort</label>
                <input type="password" name="password" placeholder="Mindestens 6 Zeichen" required>
            </div>
            <div class="form-group">
                <label>Passwort bestätigen</label>
                <input type="password" name="passconfirm" placeholder="Wiederholen" required>
            </div>
            <button type="submit">Registrieren</button>
        </form>
        <div class="links"><a href="/login/login.php/">Bereits registriert? Anmelden</a></div>
    </div>
</body>
</html>
