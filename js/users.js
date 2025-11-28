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
            const roleBadge = user.id_Rol === 1 ? 'badge-admin' : user.id_Rol === 2 ? 'badge-secretary' : 'badge-doctor';

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
        document.getElementById('detailRegistryDate').textContent =
            new Date(user.fecha_Registro).toLocaleString();

        const doctorFields = document.querySelectorAll('.doctorFields');

        // Obtener botón desde antes (para evitar re-declaración)
        const btnEdit = document.getElementById('btnEditUser');

        if (user.id_Rol === 2) { // Médico
            const medicoId = user.ID_Medico; // <-- EL ID REAL DEL MÉDICO

            // Traer nombre especialidad
            const espRes = await fetch(`https://localhost:7193/api/Especialidades/${user.ID_Especialidad}`);
            const especialidades = await espRes.json();

            // Traer contrato
            const contRes = await fetch(`https://localhost:7193/api/TipoContrato/${user.ID_Contrato}`);
            const contrato = await contRes.json();

            doctorFields.forEach(f => f.style.display = "grid");

            // Llenar datos
            document.getElementById('detailDoctorSpecialty').textContent = especialidades.nombre_Especialidad;
            document.getElementById('detailDoctorSchedule').textContent = user.Horario_Atencion || '-';
            document.getElementById('detailDoctorPhone').textContent = user.Telefono_Consulta || '-';
            document.getElementById('detailDoctorContract').textContent = contrato.descripcion || '-';

            // Guardar valores para el botón Editar
            btnEdit.dataset.userid = userId;
            btnEdit.dataset.medicoid = medicoId;
            btnEdit.dataset.roleid = user.id_Rol;

            // Asignar función editar con TODOS los valores
            btnEdit.onclick = () =>
                editUserDetail(
                    userId,
                    medicoId,
                    user.id_Rol
                );
        } else {
            doctorFields.forEach(f => f.style.display = "none");

            // Solo usuario normal
            if (btnEdit) {
                btnEdit.dataset.userid = userId;
                btnEdit.dataset.roleid = user.id_Rol;

                btnEdit.onclick = () =>
                    editUserDetail(
                        userId,
                        null, // No tiene medicoId
                        user.id_Rol
                    );
            }
        }

    } catch (error) {
        console.error('Error al cargar detalle del usuario:', error);
    }
}

async function editUserDetail(userId, medicoId, roleId) {
    try {
        const res = await fetch(`https://localhost:7193/api/Usuarios/${userId}`);
        const user = await res.json();

        const editHtmlRes = await fetch('../views/admin/edit-user.html');
        const editHtml = await editHtmlRes.text();
        const container = document.getElementById('contentAdmin');
        container.innerHTML = editHtml;

        setTimeout(async () => {

            // Cargar combos
            await loadSpecialties("editDoctorSpecialty");
            await loadContracts("editDoctorContract");

            // Llenar datos usuario básico
            document.getElementById('editUserName').value = user.nombre;
            document.getElementById('editUserLastname').value = user.apellido;
            document.getElementById('editUserEmail').value = user.email || '';
            document.getElementById('editUserCedula').value = user.cedula;
            document.getElementById('editUserPhone').value = user.telefono || '';
            document.getElementById('editUserPassword').value = '';

            const doctorFields = document.getElementById('editDoctorFields');

            if (roleId == 2) {
                doctorFields.style.display = 'block';

                document.getElementById('editDoctorSpecialty').value = user.ID_Especialidad;
                document.getElementById('editDoctorContract').value = user.ID_Contrato;
                document.getElementById('editDoctorSchedule').value = user.Horario_Atencion || '';
                document.getElementById('editDoctorConsultPhone').value = user.Telefono_Consulta || '';
            } else {
                doctorFields.style.display = 'none';
            }

            // ====== BOTÓN GUARDAR ======
            document.getElementById("btnUpdateUser").onclick = () => {
                saveEditedUser(userId, medicoId, roleId);
            };

        }, 50);

        // ====== BOTÓN VOLVER ======
        document.getElementById('btnBackEdit').onclick = async () => {
            const detailHtmlRes = await fetch('../views/admin/userDetail.html');
            const detailHtml = await detailHtmlRes.text();

            const container = document.getElementById('contentAdmin');
            container.innerHTML = detailHtml;

            loadUserDetail(userId);
        };

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
    }
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
        await loadSpecialties("doctorSpecialty");
        await loadContracts("doctorContract");
    } else {
        doctorFields.style.display = "none";
    }
}


// ====================================
// CARGAR ESPECIALIDADES
// ====================================
async function loadSpecialties(elementId) {
    try {
        const res = await fetch("https://localhost:7193/api/Especialidades/combo");
        const data = await res.json();

        const select = document.getElementById(elementId);
        if (!select) {
            console.error(`Elemento con id ${elementId} no encontrado`);
            return;
        }

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

// ====================================
// CARGAR CONTRATO
// ====================================
async function loadContracts(elementId) {
    try {
        const res = await fetch("https://localhost:7193/api/TipoContrato");
        const data = await res.json();

        const select = document.getElementById(elementId);
        if (!select) {
            console.error(`Elemento con id ${elementId} no encontrado`);
            return;
        }

        select.innerHTML = '<option value="">-- Seleccionar --</option>';

        data.forEach(e => {
            select.innerHTML += `
                <option value="${e.iD_Contrato}">${e.descripcion}</option>
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
    const contract= document.getElementById("doctorContract").value;

    const doctorBody = {
        ...baseData,
        iD_Especialidad: parseInt(specialty),
        iD_Contrato: contract,                
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

async function saveEditedUser(userId, medicoId, roleId) {

    const userBody = {
        nombre: document.getElementById('editUserName').value,
        apellido: document.getElementById('editUserLastname').value,
        email: document.getElementById('editUserEmail').value,
        telefono: document.getElementById('editUserPhone').value
    };

    await fetch(`https://localhost:7193/api/Usuarios/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userBody)
    });

    // Médico
    if (roleId == 2) {

        const doctorBody = {
            id_Especialidad: parseInt(document.getElementById('editDoctorSpecialty').value),
            id_Contrato: parseInt(document.getElementById('editDoctorContract').value),
            horario_Atencion: document.getElementById('editDoctorSchedule').value,
            telefono_Consulta: document.getElementById('editDoctorConsultPhone').value
        };

        await fetch(`https://localhost:7193/api/Medicos/${medicoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doctorBody)
        });
    }

    alert("Cambios guardados ✔");


    const detailHtmlRes = await fetch('../views/admin/userDetail.html');
    const detailHtml = await detailHtmlRes.text();

    const container = document.getElementById('contentAdmin');
    container.innerHTML = detailHtml;

    loadUserDetail(userId);
}