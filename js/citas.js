/* SCRIP DE LAS VISTAS DE ADMIN PARA LA GESTIÓN DE CITAS MEDICAS DE PACIENTES */
async function loadSecretaryCitasList() {
    const secretaryCitasList = document.getElementById('secretaryCitasList');
    const noCitasMessage = document.getElementById('noCitasMessage');

    try {
        const citasRes = await fetch(URLBASE+'Citas');
        const citas = await citasRes.json();

        const stateRes = await fetch(URLBASE+'EstadoCita');
        const states = await stateRes.json();

        if (citas.length === 0) {
            secretaryCitasList.innerHTML = '';
            noCitasMessage.style.display = 'block';
            return;
        } else {
            noCitasMessage.style.display = 'none';
        }

        let html = '';
        citas.forEach(cita => {

            // Determinar clase según estado
            let statusClass = "";
            if (cita.iD_Estado_Cita === 1) statusClass = "status-pendiente";
            else if (cita.iD_Estado_Cita === 2) statusClass = "status-confirmada";
            else if (cita.iD_Estado_Cita === 3) statusClass = "status-cancelada";

            html += `
                <tr>
                    <td>${cita.iD_Cita}</td>
                    <td>${cita.nombrePaciente}</td>
                    <td>${cita.nombreMedico}</td>
                    <td>${cita.fecha_Cita}</td>
                    <td>${cita.hora_Cita}</td>
                    <td>
                        <select class="status-select ${statusClass}"
                            onchange="updateAppointmentStatus(${cita.iD_Cita}, this.value);">
                            ${states.map(s => `
                                <option value="${s.iD_Estado_Cita}" 
                                    ${s.iD_Estado_Cita === cita.iD_Estado_Cita ? 'selected' : ''}>
                                    ${s.descripcion}
                                </option>
                            `).join('')}
                        </select>
                    </td>
                </tr>
            `;
        });

        secretaryCitasList.innerHTML = html;

    } catch (error) {
        console.error(error);
        secretaryCitasList.innerHTML = '<tr><td colspan="7">Error cargando citas</td></tr>';
    }
}

// ====================================
// ACTUALIZAR ESTADO DE CITA
// ====================================
async function updateAppointmentStatus(idCita, newEstado) {
    try {
        const body = {
            iD_Estado_Cita: parseInt(newEstado)
        };

        const res = await fetch(URLBASE+`Citas/${idCita}/estado`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error("Error actualizando estado");
        }

        console.log("Estado actualizado correctamente");
        loadSecretaryCitasList();

    } catch (error) {
        alert("No se pudo actualizar el estado.");
        console.error(error);
    }
}

// ====================================
// CARGAR MÉDICOS
// ====================================
async function loadMedicos(elementId) {
    try {
        const res = await fetch(URLBASE+"Medicos/combo");
        const data = await res.json();

        const select = document.getElementById(elementId);
        if (!select) {
            console.error(`Elemento con id ${elementId} no encontrado`);
            return;
        }

        select.innerHTML = '<option value="">-- Seleccionar médico --</option>';

        data.forEach(m => {
            select.innerHTML += `
                <option value="${m.id_Medico}">
                    ${m.nombreCompleto} — ${m.cedula}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando médicos:", error);
    }
}


// ====================================
// CARGAR PACIENTES
// ====================================
async function loadPacientes(elementId) {
    try {
        const res = await fetch(URLBASE+"Pacientes/combo");
        const data = await res.json();

        const select = document.getElementById(elementId);
        if (!select) {
            console.error(`Elemento con id ${elementId} no encontrado`);
            return;
        }

        select.innerHTML = '<option value="">-- Seleccionar paciente --</option>';

        data.forEach(p => {
            select.innerHTML += `
                <option value="${p.id_Paciente}">
                    ${p.nombreCompleto} — ${p.cedula}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando pacientes:", error);
    }
}

// ====================================
// CARGAR CITAS DISPONIBLES PARA ATENCIÓN
// ====================================
async function loadCitasParaAtencion(elementId) {
    try {
        const res = await fetch(URLBASE+"Citas/para-atencionMedica");
        const data = await res.json();

        const select = document.getElementById(elementId);
        if (!select) {
            console.error(`Elemento con id ${elementId} no encontrado`);
            return;
        }

        select.innerHTML = '<option value="">-- Seleccionar cita --</option>';

        data.forEach(c => {
            select.innerHTML += `
                <option value="${c.iD_Cita}">
                    ${c.nombrePaciente} — ${c.cedulaPaciente} | Dr. ${c.nombreMedico} | ${c.fecha_Cita} ${c.hora_Cita}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando citas para atención:", error);
    }
}

// ====================================
// CARGAR CITAS DE UN DOCTOR
// ====================================
async function loadDoctorAppointments() {
    const doctorAppointmentsList = document.getElementById('doctorAppointmentsList');
    const noCitasMessage = document.getElementById('noCitasMessage');

    try {
        const userJson = sessionStorage.getItem("currentUser");
        if (!userJson) return;

        const currentUser = JSON.parse(userJson);

        if (currentUser.id_Rol !== 2) {
            console.warn("El usuario no es médico.");
            return;
        }

        const idMedico = currentUser.id_Medico;
        if (!idMedico) {
            console.error("No se encontró ID_Medico en sessionStorage.");
            return;
        }

        const res = await fetch(URLBASE+`Citas/medico/${idMedico}`);
        const citas = await res.json();

        const stateRes = await fetch(URLBASE+'EstadoCita');
        const states = await stateRes.json();

        const stateMap = {};
        states.forEach(s => {
            stateMap[s.iD_Estado_Cita] = s.descripcion;
        });

        if (!citas || citas.length === 0) {
            doctorAppointmentsList.innerHTML = "";
            noCitasMessage.style.display = "block";
            return;
        }

        noCitasMessage.style.display = "none";

        let html = "";
        citas.forEach(cita => {

            let statusClass = "";
            if (cita.iD_Estado_Cita === 1) statusClass = 'badge badge-active';
            else if (cita.iD_Estado_Cita === 2) statusClass = 'badge badge-inactive';
            else if (cita.iD_Estado_Cita === 3) statusClass = 'badge badge-warning';

            const estadoTexto = stateMap[cita.iD_Estado_Cita];

            html += `
                <tr>
                    <td>${cita.nombrePaciente}</td>
                    <td>${cita.fecha_Cita}</td>
                    <td>${cita.hora_Cita}</td>
                    <td><span class="${statusClass}">${estadoTexto}</span></td>
                </tr>
            `;
        });

        doctorAppointmentsList.innerHTML = html;

    } catch (error) {
        console.error(error);
        doctorAppointmentsList.innerHTML = `
            <tr><td colspan="4">Error cargando citas</td></tr>
        `;
    }
}

// ====================================
// REGISTRAR NUEVA CITA
// ====================================
async function saveNewAppointment(event) {
    event.preventDefault();

    try {
        const pacienteId = parseInt(document.getElementById("appointmentPatient").value);
        const medicoId = parseInt(document.getElementById("appointmentDoctor").value);
        const fecha = document.getElementById("appointmentDate").value; // yyyy-mm-dd
        const hora = document.getElementById("appointmentTime").value; // HH:mm

        const horaTime = hora + ":00";

        const body = {
            ID_Paciente: pacienteId,
            ID_Medico: medicoId,
            Fecha_Cita: fecha + "T00:00:00", // DateTime
            Hora_Cita: horaTime // TimeSpan
        };

        console.log("Enviando POST cita:", body);

        const res = await fetch(URLBASE+'Citas', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const text = await res.text();
        console.log("Respuesta backend POST cita:", res.status, text);

        if (!res.ok) {
            alert("Error registrando la cita. Revisa la consola.");
            return;
        }

        alert("Cita registrada correctamente");
        document.getElementById("registerAppointmentForm").reset();


    } catch (error) {
        console.error("Error registrando cita:", error);
        alert("Error registrando cita");
    }
}