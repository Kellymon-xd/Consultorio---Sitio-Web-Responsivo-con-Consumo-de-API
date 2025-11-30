async function loadSecrePatientsList() {
    const secretaryPatientsList = document.getElementById('secretaryPatientsList');
    const noPatientsMessage = document.getElementById('noPatientsMessage');

    try {
        const pacientesRes = await fetch('https://localhost:7193/api/Pacientes');
        const pacientes = await pacientesRes.json();

        if (pacientes.length === 0) {
            secretaryPatientsList.innerHTML = '';
            noPatientsMessage.style.display = 'block';
            return;
        } else {
            noPatientsMessage.style.display = 'none';
        }

        let html = '';
        pacientes.forEach(patient => {
            const stateBadge = patient.activo ? 'Activo' : 'Inactivo';
            const stateClass = patient.activo ? 'badge-active' : 'badge-inactive';
            console.info(patient.iD_Paciente);

            html += `
                <tr>
                    <td>${patient.cedula}</td>
                    <td>${patient.nombreCompleto}</td>
                    <td>${patient.email || '-'}</td>
                    <td><span class="badge ${stateClass}">${stateBadge}</span></td>
                    <td>
                        <button class="btn-action btn-view" onclick="showPatientDetailSecretary(${patient.id_Paciente})">Ver Detalle</button>
                    </td>
                </tr>
            `;
        });

        secretaryPatientsList.innerHTML = html;

    } catch (error) {
        console.error(error);
        secretaryPatientsList.innerHTML = '<tr><td colspan="7">Error cargando usuarios</td></tr>';
    }
}

async function loadDocPatientsList() {
    const doctorPatientsList = document.getElementById('doctorPatientsList');
    const noPatientsMessage = document.getElementById('noPatientsMessage');

    try {
        const pacientesRes = await fetch('https://localhost:7193/api/Pacientes');
        const pacientes = await pacientesRes.json();

        if (pacientes.length === 0) {
            doctorPatientsList.innerHTML = '';
            noPatientsMessage.style.display = 'block';
            return;
        } else {
            noPatientsMessage.style.display = 'none';
        }

        let html = '';
        pacientes.forEach(patient => {
            const stateBadge = patient.activo ? 'Activo' : 'Inactivo';
            const stateClass = patient.activo ? 'badge-active' : 'badge-inactive';

            html += `
                <tr>
                    <td>${patient.cedula}</td>
                    <td>${patient.nombreCompleto}</td>
                    <td>${patient.email || '-'}</td>
                    <td><span class="badge ${stateClass}">${stateBadge}</span></td>
                    <td>
                        <button class="btn-action btn-view" onclick="viewDoctorPatientDetail('${patient.id}')">Ver Expediente</button>
                    </td>
                </tr>
            `;
        });

        doctorPatientsList.innerHTML = html;

    } catch (error) {
        console.error(error);
        doctorPatientsList.innerHTML = '<tr><td colspan="7">Error cargando usuarios</td></tr>';
    }
}

async function showPatientDetailDoctor(idPaciente) {
    try {
        const res = await fetch('../views/doctor/detallePaciente.html');
        const html = await res.text();
        document.getElementById('contentDoctor').innerHTML = html;

        await loadPatientDetailDoctor(idPaciente);

    } catch (error) {
        console.error('Error cargando detalle del paciente:', error);
        document.getElementById('contentDoctor').innerHTML = '<p>Error cargando detalle del usuario.</p>';
    }
}

async function loadPatientDetailSecretary(idPaciente) {
    try {
        const res = await fetch(`https://localhost:7193/api/Pacientes/${idPaciente}`);
        const p = await res.json();

        document.getElementById("patientDetailName").textContent = p.nombre;
        document.getElementById("patientDetailLastname").textContent = p.apellido;
        document.getElementById("patientDetailCedula").textContent = p.cedula;
        document.getElementById("patientDetailEmail").textContent = p.email || "-";
        document.getElementById("patientDetailPhone").textContent = p.telefono || "-";
        document.getElementById("patientDetailBirth").textContent = p.fecha_Nacimiento?.split("T")[0] || "-";
        document.getElementById("patientDetailGender").textContent = p.sexo || "-";
        document.getElementById("patientDetailAddress").textContent = p.direccion || "-";
        document.getElementById("patientDetailEmergency").textContent = p.contactoEmergencia || "-";

        const statusSpan = document.getElementById("patientDetailStatus");
        statusSpan.textContent = p.activo ? "Activo" : "Inactivo";
        statusSpan.className = p.activo ? "badge badge-active" : "badge badge-inactive";

        document.getElementById("btnEditPatient").onclick = () => {
            showEditPatientForm(idPaciente);
        };

    } catch (error) {
        console.error("Error cargando detalle del paciente:", error);
    }
}


async function showPatientDetailSecretary(patientId) {
    try {
        const res = await fetch('../views/secretaria/detallePaciente.html');
        const html = await res.text();
        document.getElementById('contentSecretaria').innerHTML = html;

        await loadPatientDetailSecretary(patientId);

    } catch (error) {
        console.error('Error cargando detalle del paciente:', error);
        document.getElementById('contentSecretaria').innerHTML = '<p>Error cargando detalle del usuario.</p>';
    }
}

async function showEditPatientForm(idPaciente) {
    try {
        const res = await fetch('../views/secretaria/edit-patient.html');
        const html = await res.text();
        document.getElementById('contentSecretaria').innerHTML = html;

        await loadEditPatientForm(idPaciente);

    } catch (error) {
        console.error("Error cargando vista de edición:", error);
    }
}


async function loadEditPatientForm(idPaciente) {
    try {
        const res = await fetch(`https://localhost:7193/api/Pacientes/${idPaciente}`);
        const p = await res.json();

        document.getElementById("editPatientName").value = p.nombre;
        document.getElementById("editPatientLastname").value = p.apellido;

        document.getElementById("editPatientCedula").value = p.cedula;
        document.getElementById("editPatientCedula").disabled = true;

        document.getElementById("editPatientEmail").value = p.email;
        document.getElementById("editPatientPhone").value = p.telefono;

        document.getElementById("editPatientBirthDate").value = p.fecha_Nacimiento?.split("T")[0];
        document.getElementById("editPatientBirthDate").disabled = true;

        document.getElementById("editPatientGender").value = p.sexo;
        document.getElementById("editPatientGender").disabled = true;

        document.getElementById("editPatientAddress").value = p.direccion;
        document.getElementById("editPatientEmergency").value = p.contactoEmergencia;

        // ⬅ nuevo
        document.getElementById("editPatientActive").value = p.activo ? "true" : "false";

        // Guardar ID en el form (tu forma actual)
        document.getElementById("editPatientForm").dataset.patientid = idPaciente;

        document.getElementById("btnBackEdit").onclick = () => {
            showPatientDetailSecretary(idPaciente);
        };

    } catch (error) {
        console.error("Error llenando el formulario:", error);
    }
}


async function saveEditedPatient(event) {
    event.preventDefault();

    const form = document.getElementById("editPatientForm");
    const idPaciente = form.dataset.patientid;

    const body = {
        nombre: document.getElementById("editPatientName").value,
        apellido: document.getElementById("editPatientLastname").value,
        telefono: document.getElementById("editPatientPhone").value,
        email: document.getElementById("editPatientEmail").value,
        direccion: document.getElementById("editPatientAddress").value,
        contactoEmergencia: document.getElementById("editPatientEmergency").value,
        activo: document.getElementById("editPatientActive").value === "true"
    };

    try {
        const res = await fetch(`https://localhost:7193/api/Pacientes/${idPaciente}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            alert("Error actualizando al paciente");
            return;
        }

        alert("Paciente actualizado correctamente");
        loadView('views/secretaria/patients.html');

    } catch (error) {
        console.error("Error guardando cambios:", error);
        alert("Error de conexión con el servidor");
    }
}
