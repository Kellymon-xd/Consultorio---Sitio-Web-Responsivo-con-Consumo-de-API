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
            roleText = "Médico";
            filePath = "../views/doctor/menuDoctor.html";
            break;
        case 3:
            roleText = "Secretario";
            filePath = "../views/secretaria/menuSecretaria.html";
            break;
        default:
            roleText = "Usuario";
    }

    document.getElementById("userRole").textContent = roleText;

    fetch(filePath)
    .then(r => r.text())
    .then(html => {
        document.getElementById("mainContent").innerHTML = html;

        
        if (currentUser.id_Rol === 1) {
            showAdminSection('users');
        }
        else if (currentUser.id_Rol === 2) {
            showDoctorSection('pacientes');
        }
        else if (currentUser.id_Rol === 3) {
            showSecretarySection('pacientes');
        }
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
        default:
            return;
    }

    try {
        const res = await fetch(filePath);
        const html = await res.text();
        document.getElementById('contentAdmin').innerHTML = html;

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

/* FUNCIONES DE MENU SECRETARIA*/
async function showSecretarySection(section) {
    let filePath = '';
    switch (section) {
        case 'pacientes':
            filePath = '../views/secretaria/pacientes.html';
            break;
        case 'citas':
            filePath = '../views/secretaria/citas.html';
            break;
        case 'registrarPaciente':
            filePath = '../views/secretaria/registrarPaciente.html';
            break;
        case 'registrarCita':
            filePath = '../views/secretaria/registrarCita.html';
            break;
        default:
            return;
    }

    try {
        const res = await fetch(filePath);
        const html = await res.text();
        document.getElementById('contentSecretaria').innerHTML = html;

        if (section === 'pacientes') {
            loadSecrePatientsList();
        }
        if (section === 'citas') {
            loadSecretaryCitasList()
        }
        if (section === 'registrarCita') {
            loadPacientes("appointmentPatient");
            loadMedicos("appointmentDoctor");
        }
    } catch (error) {
        console.error('Error cargando sección:', error);
        mainContent.innerHTML = '<p>Error cargando la sección.</p>';
    }
}

/* FUNCIONES DE MENU DOCTOR*/
async function showDoctorSection(section) {
    let filePath = '';
    switch (section) {
        case 'pacientes':
            filePath = '../views/doctor/pacientes.html';
            break;
        case 'citas':
            filePath = '../views/doctor/citas.html';
            break;
        case 'regAtencionMedica':
            filePath = '../views/doctor/atencionMedica.html';
            break;
        default:
            return;
    }

    try {
        const res = await fetch(filePath);
        const html = await res.text();
        document.getElementById('contentDoctor').innerHTML = html;

        if (section === 'pacientes') {
            loadDocPatientsList();
        }
        if (section === 'citas') {
            loadDoctorAppointments();
        }
        if (section === 'regAtencionMedica') {
            loadCitasParaAtencion("careAppointment");   
        }
    } catch (error) {
        console.error('Error cargando sección:', error);
        mainContent.innerHTML = '<p>Error cargando la sección.</p>';
    }
}