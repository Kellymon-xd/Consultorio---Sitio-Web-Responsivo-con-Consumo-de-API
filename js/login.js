async function login(e) {
    e.preventDefault();

    const email = document.getElementById('username').value;
    const contrasena = document.getElementById('password').value;

    const alertDiv = document.getElementById('alertLogin');
    alertDiv.style.display = "none";

    try {
        const resp = await fetch("https://localhost:7193/api/Usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, contrasena })
        });

        const msg = await resp.text();

        switch (resp.status) {

            case 200: // OK
                const data = JSON.parse(msg);
                sessionStorage.setItem("currentUser", JSON.stringify(data));
                window.location.href = "../pages/dashboard.html";
                return;

            case 401:
                showLoginError("Correo o contraseña incorrectos");
                return;

            case 403:
                showLoginError("Usuario inactivo. Contacte al administrador.");
                return;

            case 423:
                showLoginError("Usuario bloqueado por intentos fallidos.");
                return;

            default:
                showLoginError("Error inesperado");
                return;
        }

    } catch (err) {
        showLoginError("Error de conexión con el servidor");
    }
}

function showLoginError(msg) {
    const alertDiv = document.getElementById('alertLogin');
    alertDiv.textContent = msg;
    alertDiv.className = "alert alert-danger";
    alertDiv.style.display = "block";
}