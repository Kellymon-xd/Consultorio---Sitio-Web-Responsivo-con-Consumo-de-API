function showDashboard() {

    const userJson = sessionStorage.getItem("currentUser");
    console.log("Usuario cargado:", userJson);

    if (!userJson) {
        console.log("No hay sesión, redirigiendo...");
        window.location.href = "../pages/index.html";
        return;
    }

    const currentUser = JSON.parse(userJson);

    document.getElementById("userName").textContent =
        `${currentUser.nombre} ${currentUser.apellido}`;

    let roleText = "";
    let filePath = "";

    switch (currentUser.id_Rol) {
        case 1:
            roleText = "Administrador";
            filePath = "../views/admin/menuAdmin.html";
            break;
        case 2:
            roleText = "Secretario";
            filePath = "../views/secretaria/menuSecretaria.html";
            break;
        case 3:
            roleText = "Médico";
            filePath = "../views/doctor/menuDoctor.html";
            break;
        default:
            roleText = "Usuario";
    }

    document.getElementById("userRole").textContent = roleText;

    fetch(filePath)
        .then(r => r.text())
        .then(html => {
            document.getElementById("mainContent").innerHTML = html;
        })
        .catch(err => console.error("Error cargando vista:", err));
}

function logout() {
    // Borrar sesión del usuario
    sessionStorage.removeItem("currentUser");

    // Limpiar toda la sesión:
    sessionStorage.clear();

    // Redirigir al login
    window.location.href = "../pages/index.html";
}

async function loadView(path) {
    try {
        const html = await fetch(path).then(r => r.text());
        document.getElementById("mainContent").innerHTML = html;
    } catch (e) {
        document.getElementById("mainContent").innerHTML =
            "<p>Error cargando la vista.</p>";
    }
}

/* FUNCIONES DE MENU ADMIN */
async function showAdminSection(section) {
    let filePath = '';
    switch (section) {
        case 'users':
            filePath = '../views/admin/users.html';
            break;
        case 'registerUser':
            filePath = '../views/admin/register-user.html';
            break;
        case 'statistics':
            filePath = '../views/admin/statistics.html';
            break;
        default:
            return;
    }

    try {
        const res = await fetch(filePath);
        const html = await res.text();
        document.getElementById('contentAdmin').innerHTML = html;

        // Llamar JS específico después de cargar el HTML
        if (section === 'users') {
            loadUsersList();
        }
        if (section === 'registerUser') {
            loadRoles();   
        }
    } catch (error) {
        console.error('Error cargando sección:', error);
        mainContent.innerHTML = '<p>Error cargando la sección.</p>';
    }
}

async function showUserDetail(userId) {
    try {
        // Cargar el HTML del detalle de usuario
        const res = await fetch('../views/admin/userDetail.html');
        const html = await res.text();
        document.getElementById('contentAdmin').innerHTML = html;

        // Llamar a la función que llena los datos
        await loadUserDetail(userId);

    } catch (error) {
        console.error('Error cargando detalle del usuario:', error);
        document.getElementById('contentAdmin').innerHTML = '<p>Error cargando detalle del usuario.</p>';
    }
}