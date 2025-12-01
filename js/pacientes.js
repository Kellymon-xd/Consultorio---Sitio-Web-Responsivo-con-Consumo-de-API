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
                        <button class="btn-action btn-view" onclick="showPatientDetailDoctor(${patient.id_Paciente})">Ver Expediente</button>
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

async function loadPatientDetailDoctor(idPaciente) {
    try {
        const pRes = await fetch(`https://localhost:7193/api/Pacientes/${idPaciente}`);
        const p = await pRes.json();

        document.getElementById("patientDetailId").textContent = p.iD_Paciente;
        document.getElementById("patientDetailName").textContent = p.nombre;
        document.getElementById("patientDetailLastname").textContent = p.apellido;
        document.getElementById("patientDetailCedula").textContent = p.cedula;
        document.getElementById("patientDetailEmail").textContent = p.email || "-";
        document.getElementById("patientDetailPhone").textContent = p.telefono || "-";
        document.getElementById("patientDetailBirth").textContent = p.fecha_Nacimiento?.split("T")[0] || "-";
        document.getElementById("patientDetailGender").textContent = p.sexo || "-";
        document.getElementById("patientDetailAddress").textContent = p.direccion || "-";
        document.getElementById("patientDetailEmergency").textContent = p.contactoEmergencia || "-";


        // ----- ANTECEDENTES -----
        const antRes = await fetch(`https://localhost:7193/api/AntecedentesMedicos/paciente/${idPaciente}`);

        const antBox = document.getElementById("patientMedicalHistoryBox");
        const antEmpty = document.getElementById("patientMedicalHistoryEmpty");
        if (antRes.ok) {
            antecedente = await antRes.json();

            document.getElementById("patientHistoryAllergies").textContent = antecedente.alergias || "-";
            document.getElementById("patientHistoryChronic").textContent = antecedente.enfermedades_Cronicas || "-";
            document.getElementById("patientHistoryObservations").textContent = antecedente.observaciones_Generales || "-";
            document.getElementById("patientHistoryDate").textContent = antecedente.fecha_Registro || "-";

            antBox.style.display = "block";
            antEmpty.style.display = "none";

        } else {
            antBox.style.display = "none";
            antEmpty.style.display = "block";
        }

        // ----- ATENCIONES -----
        const medRes = await fetch(`https://localhost:7193/api/AtencionMedica/paciente/${idPaciente}`);
        
        const container = document.getElementById("patientMedicalCaresContainer");
        const emptyBox = document.getElementById("patientMedicalCaresEmpty");

        if (!medRes.ok) {
            container.innerHTML = "";
            emptyBox.style.display = "block";
        } else {
            const atenciones = await medRes.json();
            emptyBox.style.display = "none";

            atenciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            let html = `<div class="care-list-scroll">`;

            atenciones.forEach((a, index) => {
                const fechaText = a.fecha ? a.fecha.split("T")[0] : "-";

                html += `
                    <div class="care-item" onclick="toggleCareDetail('care${index}')">
                        <div class="care-header">
                            <div>
                                <p class="care-motivo">${fechaText} — ${a.motivo || "-"}</p>
                            </div>
                            <span id="careArrow${index}" class="care-arrow">▼</span>
                        </div>

                        <div id="care${index}" class="care-detail">
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Diagnóstico</label>
                                    <p>${a.diagnostico || "-"}</p>
                                </div>
                                <div class="info-item full">
                                    <label>Tratamiento / Observaciones</label>
                                    <p>${a.tratamiento || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += "</div>";
            container.innerHTML = html;
        }


        // Botón editar
        const editBtn = document.getElementById("btnEditPatient");
        if (editBtn) {
            editBtn.onclick = () => showEditPatientFormDoctor(idPaciente);
        }

        const createAntecedente = document.getElementById("patientMedicalHistoryEmpty");
        if (createAntecedente) {
            createAntecedente.onclick = () => showRegAntecedenteFormDoctor(idPaciente, [p.nombre+" "+p.apellido]);
        }

    } catch (error) {
        console.error("Error cargando expediente médico:", error);
    }
}

async function showRegAntecedenteFormDoctor(idPaciente, nombre) {
    try {
        const res = await fetch('../views/doctor/antecedenteMedico.html');
        if (!res.ok) throw new Error("No se pudo cargar el formulario.");

        const html = await res.text();
        document.getElementById('contentDoctor').innerHTML = html;

        const pacienteInput = document.getElementById("historyPatient");
        if (pacienteInput) {
            pacienteInput.value = `${idPaciente} - ${nombre}`;
            pacienteInput.dataset.idPaciente = idPaciente; // guardamos el id real por si lo necesitas al guardar
        }

        const btnBack = document.getElementById("btnBack");
        if (btnBack) {
            btnBack.onclick = () => showPatientDetailDoctor(idPaciente);
        }

    } catch (error) {
        console.error('Error cargando formularioAntecedente:', error);
        document.getElementById('contentDoctor').innerHTML =
            '<p>Error cargando el formulario de antecedente.</p>';
    }
}


function toggleCareDetail(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const isHidden = el.style.display === "" || el.style.display === "none";
    el.style.display = isHidden ? "block" : "none";

    const arrow = document.getElementById("careArrow" + id.replace("care", ""));
    if (arrow) arrow.classList.toggle("open");
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
            showEditPatientFormSecretary(idPaciente);
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

async function showEditPatientFormSecretary(idPaciente) {
    try {
        const res = await fetch('../views/secretaria/edit-patient.html');
        const html = await res.text();
        document.getElementById('contentSecretaria').innerHTML = html;

        await loadEditPatientForm(idPaciente);
        document.getElementById("btnBackEdit").onclick = () => {
            showPatientDetailSecretary(idPaciente);
        };

    } catch (error) {
        console.error("Error cargando vista de edición:", error);
    }
}


async function loadEditPatientFormSecretary(idPaciente) {
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

        document.getElementById("editPatientActive").value = p.activo ? "true" : "false";

        document.getElementById("editPatientForm").dataset.patientid = idPaciente;

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

    } catch (error) {
        console.error("Error guardando cambios:", error);
        alert("Error de conexión con el servidor");
    }
}


async function showEditPatientFormDoctor(idPaciente) {
    try {
        const res = await fetch('../views/doctor/edit-patient.html');

        const html = await res.text();

        document.getElementById('contentDoctor').innerHTML = html;

        loadDoctorEditForm(idPaciente);
        document.getElementById("btnBackEdit").onclick = () => {
            showPatientDetailDoctor(idPaciente);
        };

    } catch (error) {
        console.error("Error cargando vista de edición:", error);
    }
}

async function loadDoctorEditForm(idPaciente) {
    try {
        const res = await fetch(`https://localhost:7193/api/Pacientes/${idPaciente}`);
        if (!res.ok) throw new Error("Error al obtener paciente");
        const p = await res.json();

        document.getElementById("completeEditName").value = p.nombre || "";
        document.getElementById("completeEditLastname").value = p.apellido || "";
        document.getElementById("completeEditCedula").value = p.cedula || "";
        document.getElementById("completeEditEmail").value = p.email || "";
        document.getElementById("completeEditPhone").value = p.telefono || "";
        document.getElementById("completeEditBirthDate").value = p.fecha_Nacimiento?.split("T")[0] || "";
        document.getElementById("completeEditGender").value = p.sexo || "";
        document.getElementById("completeEditAddress").value = p.direccion || "";
        document.getElementById("completeEditEmergency").value = p.contactoEmergencia || "";


        const form = document.getElementById("completeEditForm");
        if (form) form.dataset.patientid = idPaciente;


        const antRes = await fetch(`https://localhost:7193/api/AntecedentesMedicos/paciente/${idPaciente}`);
        if (!antRes.ok) throw new Error("Error al obtener antecedentes");
        const antecedente = await antRes.json();

        if (!antecedente || antecedente.length === 0) {
            const noBox = document.getElementById("noAntecedentesBox");
            const antSection = document.getElementById("antecedentesSection");
            if (noBox) noBox.style.display = "block";
            if (antSection) antSection.style.display = "none";
        } else {
            const noBox = document.getElementById("noAntecedentesBox");
            const antSection = document.getElementById("antecedentesSection");
            if (noBox) noBox.style.display = "none";
            if (antSection) antSection.style.display = "block";

            document.getElementById("completeEditAllergies").value = antecedente.alergias || "";
            document.getElementById("completeEditChronic").value = antecedente.enfermedades_Cronicas || "";
            document.getElementById("completeEditObservations").value = antecedente.observaciones_Generales || "";
            document.getElementById("completeEditHistoryId").value = antecedente.id_Antecedente || antecedente.iD_Antecedente || "";
        }

        if (form) {
            form.onsubmit = saveDoctorEditedPatient;
        } else {
            console.warn("No se encontró #completeEditForm");
        }

    } catch (error) {
        console.error("Error llenando el formulario de edición (doctor):", error);
        alert("Error cargando datos del paciente");
    }
}
