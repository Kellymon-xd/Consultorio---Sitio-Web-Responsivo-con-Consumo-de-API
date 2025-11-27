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

        if (!resp.ok) {
            alertDiv.textContent = "Credenciales incorrectas";
            alertDiv.className = "alert alert-danger";
            alertDiv.style.display = "block";
            return;
        }

        const data = await resp.json();
        sessionStorage.setItem("currentUser", JSON.stringify(data));

        window.location.href = "../pages/dashboard.html";

    } catch (err) {
        alert("Error de conexión con el servidor");
    }
}