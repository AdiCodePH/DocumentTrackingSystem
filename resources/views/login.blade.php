<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - City Legal Office</title>
    <link rel="stylesheet" href="CSS/main.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ruda:wght@400..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</head>

<body class="auth-body">
    <main class="auth-shell">
        <section class="auth-panel">
            <div class="auth-brand">
                <img src="images/logo.png?v=20260601-185623" alt="City Legal Office logo" class="logo">
                <div>
                    <p class="eyebrow">Panabo City</p>
                    <h1>Document Tracking System</h1>
                </div>
            </div>

            <form class="auth-form" method="POST" action="login">
                @csrf
                <div>
                    <p class="eyebrow">Secure Access</p>
                    <h2>Sign in to continue</h2>
                </div>

                @if ($errors->any())
                    <div class="auth-alert" role="alert">{{ $errors->first() }}</div>
                @endif

                <label>
                    Email address
                    <input name="email" type="email" value="{{ old('email') }}" required autocomplete="email"
                        placeholder="admin@example.com">
                </label>
                <label>
                    Password
                    <input name="password" type="password" required autocomplete="current-password"
                        placeholder="Enter password">
                </label>

                <label class="remember-row">
                    <input name="remember" type="checkbox" value="1">
                    Remember me
                </label>

                <button class="primary-button" type="submit">
                    <span class="material-icons-outlined">login</span>
                    Log in
                </button>

                <div class="demo-credentials">
                    <strong>Default accounts</strong>
                    <span>Admin: admin@example.com / admin123</span>
                    <span>Super Admin: superadmin@example.com / super123</span>
                </div>
                <div class="DevelopersTag">
                    <p>Developed by: Paul Adrian E. Paculanang</p>
                    <p>Contributor: Althia Grace P. Gimarino</p>
                </div>
            </form>
        </section>
    </main>
</body>

</html>
