/* SCRIP DE LAS VISTAS DE ADMIN PARA LA GESTIÓN DE USUARIOS DEL SISTEMA */
async function loadUsersList() {
    const usersList = document.getElementById('usersList');
    const noUsersMessage = document.getElementById('noUsersMessage');
     
    try {
        const rolesRes = await fetch('https://localhost:7193/api/Rol');
        const roles = await rolesRes.json();
        const rolesMap = {};
        roles.forEach(r => rolesMap[r.id_Rol] = r.descripcion_Rol);
       

        const usersRes = await fetch('https://localhost:7193/api/Usuarios');
        const users = await usersRes.json();

        if (users.length === 0) {
            usersList.innerHTML = '';
            noUsersMessage.style.display = 'block';
            return;
        } else {
            noUsersMessage.style.display = 'none';
        }

        let html = '';
        users.forEach(user => {
            const roleName = rolesMap[user.id_Rol];
            const stateBadge = user.activo ? 'Activo' : 'Inactivo';
            const stateClass = user.activo ? 'badge-active' : 'badge-inactive';
            const roleBadge =    user.id_Rol === 1 ? 'badge-admin' :    user.id_Rol === 2 ? 'badge-secretary' :    'badge-doctor';

            const lockBadge = user.bloqueado
                ? '<span class="badge badge-inactive">Bloqueado</span>'
                : '<span class="badge" style="background: #d4edda; color: #155724;">Normal</span>';

            html += `
                <tr>
                    <td>${user.cedula}</td>
                    <td>${user.nombre} ${user.apellido}</td>
                    <td>${user.email || '-'}</td>
                    <td><span class="badge ${roleBadge}">${roleName}</span></td>
                    <td><span class="badge ${stateClass}">${stateBadge}</span></td>
                    <td>${lockBadge}</td>
                    <td>
                        <button class="btn-action btn-view" onclick="showUserDetail('${user.id_Usuario}')">Dettalle</button>
                        <button class="btn-action btn-delete" onclick="toggleUserStatus('${user.id_Usuario}')">${user.activo ? 'Inactivar' : 'Activar'}</button>
                    </td>
                </tr>
            `;
        });

        usersList.innerHTML = html;

    } catch (error) {
        console.error(error);
        usersList.innerHTML = '<tr><td colspan="7">Error cargando usuarios</td></tr>';
    }
}

async function loadUserDetail(userId) {
    try {
        // Traer datos del usuario
        const res = await fetch(`https://localhost:7193/api/Usuarios/${userId}`);
        const user = await res.json();

        // Traer nombre rol
        const rolRes = await fetch(`https://localhost:7193/api/Rol/${user.id_Rol}`);    
        const rol = await rolRes.json();

        // Llenar datos básicos
        document.getElementById('detailName').textContent = user.nombre;
        document.getElementById('detailLastname').textContent = user.apellido;
        document.getElementById('detailEmail').textContent = user.email || '-';
        document.getElementById('detailCedula').textContent = user.cedula;
        document.getElementById('detailPhone').textContent = user.telefono || '-';
        document.getElementById('detailRole').textContent = rol.descripcion_Rol;
        document.getElementById('detailRegistryDate').textContent = new Date(user.fecha_Registro).toLocaleString();

        // Mostrar datos de médico si aplica
const doctorFields = document.querySelectorAll('.doctorFields');

if (user.id_Rol === 2) { // 2 = médico
            // Traer nombre especialidad
        const espRes = await fetch(`https://localhost:7193/api/Especialidades/${user.ID_Especialidad}`);
        const especialidades = await espRes.json();

    doctorFields.forEach(f => f.style.display = "grid");

    document.getElementById('detailDoctorSpecialty').textContent = especialidades.nombre_Especialidad;
    document.getElementById('detailDoctorSchedule').textContent = user.Horario_Atencion || '-';
    document.getElementById('detailDoctorPhone').textContent = user.Telefono_Consulta || '-';

} else {
    doctorFields.forEach(f => f.style.display = "none");
}

        // Asignar userId al botón de editar
const btnEdit = document.getElementById('btnEditUser');
if (btnEdit) {
    btnEdit.dataset.userid = userId; 
    btnEdit.onclick = () => editUserDetail(userId);
}
    } catch (error) {
        console.error('Error al cargar detalle del usuario:', error);
    }
}



async function editUserDetail(userId) {
    try {

        const res = await fetch(`https://localhost:7193/api/Usuarios/${userId}`);
        const user = await res.json();

        // Cargar el HTML de editar usuario
        const editHtmlRes = await fetch('../views/admin/edit-user.html');
        const editHtml = await editHtmlRes.text();
        const container = document.getElementById('contentAdmin');
        container.innerHTML = editHtml;

            const btnBack = document.getElementById('btnBackEdit');

        setTimeout(() => {
            document.getElementById('editUserName').value = user.nombre;
            document.getElementById('editUserLastname').value = user.apellido;
            document.getElementById('editUserEmail').value = user.email || '';
            document.getElementById('editUserCedula').value = user.cedula;
            document.getElementById('editUserPhone').value = user.telefono || '';
            document.getElementById('editUserPassword').value = ''; 
            // Mostrar/ocultar campos de doctor si aplica
            const doctorFields = document.getElementById('editDoctorFields');
            if (user.id_Rol === 2) {
                doctorFields.style.display = 'block';
                document.getElementById('editDoctorSpecialty').value = user.ID_Especialidad || '';
                document.getElementById('editDoctorSchedule').value = user.Horario_Atencion || '';
                document.getElementById('editDoctorConsultPhone').value = user.Telefono_Consulta || '';
            } else {
                doctorFields.style.display = 'none';
            }
        }, 0);

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
    }

    btnBackEdit.onclick = async () => {
    const detailHtmlRes = await fetch('../views/admin/userDetail.html');
    const detailHtml = await detailHtmlRes.text();

    const container = document.getElementById('contentAdmin');
    container.innerHTML = detailHtml;

    loadUserDetail(userId);
};

}


// ===============================
// CARGAR ROLES EN EL COMBOBOX
// ===============================
async function loadRoles() {
    try {
        const res = await fetch("https://localhost:7193/api/Rol");
        const data = await res.json();

        const select = document.getElementById("newUserRole");
        select.innerHTML = '<option value="">-- Seleccionar --</option>';

        data.forEach(r => {
            select.innerHTML += `
                <option value="${r.id_Rol}">${r.descripcion_Rol}</option>
            `;
        });
    } catch (error) {
        console.error("Error cargando roles:", error);
    }
}

// ========================================
// MOSTRAR CAMPOS EXTRA SI ROL = MÉDICO
// ========================================
async function updateRoleFields() {
    const role = document.getElementById("newUserRole").value;
    const doctorFields = document.getElementById("doctorFields");

    if (role == 2) { // Médico
        doctorFields.style.display = "block";
        await loadSpecialties();
    } else {
        doctorFields.style.display = "none";
    }
}


// ===============================
// CARGAR ESPECIALIDADES
// ===============================
async function loadSpecialties() {
    try {
        const res = await fetch("https://localhost:7193/api/Especialidades/combo");
        const data = await res.json();

        const select = document.getElementById("doctorSpecialty");
        select.innerHTML = '<option value="">-- Seleccionar --</option>';

        data.forEach(e => {
            select.innerHTML += `
                <option value="${e.iD_Especialidad}">${e.nombre_Especialidad}</option>
            `;
        });
    } catch (error) {
        console.error("Error cargando especialidades:", error);
    }
}



// =====================================
// GUARDAR USUARIO (NORMAL O MÉDICO)
// =====================================
async function saveNewUser(event) {
    event.preventDefault();

    const rol = document.getElementById("newUserRole").value;

    // ← Datos básicos
    const baseData = {
        nombre: document.getElementById("newUserName").value,
        apellido: document.getElementById("newUserLastname").value,
        email: document.getElementById("newUserEmail").value,
        cedula: document.getElementById("newUserCedula").value,
        telefono: document.getElementById("newUserPhone").value,
        contrasena: document.getElementById("newUserPassword").value
    };

    // -------------------------
    // CASO 1 → Usuario normal
    // -------------------------
    if (rol != 2) {
        const body = {
            ...baseData,
            idRol: parseInt(rol)
        };

        try {
            const res = await fetch("https://localhost:7193/api/Usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert("Usuario registrado con éxito");
                event.target.reset();
            } else {
                alert("Error al registrar usuario");
            }

        } catch (error) {
            console.error("Error:", error);
        }

        return;
    }

    // -------------------------
    // CASO 2 → Médico
    // -------------------------
    const specialty = document.getElementById("doctorSpecialty").value;
    const schedule = document.getElementById("doctorSchedule").value;
    const consultPhone = document.getElementById("doctorConsultPhone").value;

    const doctorBody = {
        ...baseData,
        iD_Especialidad: parseInt(specialty),
        iD_Contrato: 1,                // si tienes contrato por defecto
        horario_Atencion: schedule,
        telefono_Consulta: consultPhone
    };

    try {
        const res = await fetch("https://localhost:7193/api/Medicos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doctorBody)
        });

        if (res.ok) {
            alert("Médico registrado con éxito");
            event.target.reset();
            document.getElementById("doctorFields").style.display = "none";
        } else {
            alert("Error al registrar médico");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}