/* SCRIP DE LAS VISTAS DE ADMIN PARA LA GESTIÓN DE PACIENTES */
async function loadSecrePatientsList() {
    const secretaryPatientsList = document.getElementById('secretaryPatientsList');
    const noPatientsMessage = document.getElementById('noPatientsMessage');

    try {
        const pacientesRes = await fetch(URLBASE+'Pacientes');
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

            html += `
                <tr>
                    <td data-label="Cedula">${patient.cedula}</td>
                    <td data-label="Nombre">${patient.nombreCompleto}</td>
                    <td data-label="Email">${patient.email || '-'}</td>
                    <td data-label="Estado"><span class="badge ${stateClass}">${stateBadge}</span></td>
                    <td data-label="Acciones">
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
        const pacientesRes = await fetch(URLBASE+'Pacientes');
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
                    <td data-label="Cedula">${patient.cedula}</td>
                    <td data-label="Nombre">${patient.nombreCompleto}</td>
                    <td data-label="Email">${patient.email || '-'}</td>
                    <td data-label="Telefono">${patient.telefono || '-'}</td>
                    <td data-label="Acciones">
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
        const pRes = await fetch(URLBASE+`Pacientes/${idPaciente}`);
        const paciente = await pRes.json();

        document.getElementById("patientDetailId").textContent = paciente.iD_Paciente;
        document.getElementById("patientDetailName").textContent = paciente.nombre;
        document.getElementById("patientDetailLastname").textContent = paciente.apellido;
        document.getElementById("patientDetailCedula").textContent = paciente.cedula;
        document.getElementById("patientDetailEmail").textContent = paciente.email || "-";
        document.getElementById("patientDetailPhone").textContent = paciente.telefono || "-";
        document.getElementById("patientDetailBirth").textContent = paciente.fecha_Nacimiento?.split("T")[0] || "-";
        document.getElementById("patientDetailGender").textContent = paciente.sexo || "-";
        document.getElementById("patientDetailAddress").textContent = paciente.direccion || "-";
        document.getElementById("patientDetailEmergency").textContent = paciente.contactoEmergencia || "-";


        // ----- ANTECEDENTES -----
        const antRes = await fetch(URLBASE+`AntecedentesMedicos/paciente/${idPaciente}`);
        let antecedente = null;

        const antBox = document.getElementById("patientMedicalHistoryBox");
        const antEmpty = document.getElementById("patientMedicalHistoryEmpty");
        if (antRes.status === 204) {
            antBox.style.display = "none";
            antEmpty.style.display = "block";
        } else {
            antecedente = await antRes.json();

            document.getElementById("patientHistoryAllergies").textContent = antecedente.alergias || "-";
            document.getElementById("patientHistoryChronic").textContent = antecedente.enfermedades_Cronicas || "-";
            document.getElementById("patientHistoryObservations").textContent = antecedente.observaciones_Generales || "-";
            document.getElementById("patientHistoryDate").textContent = antecedente.fecha_Registro || "-";

            antBox.style.display = "block";
            antEmpty.style.display = "none";
        }

        // ----- ATENCIONES -----
        const medRes = await fetch(URLBASE+`AtencionMedica/paciente/${idPaciente}`);

        const container = document.getElementById("patientMedicalCaresContainer");
        const emptyBox = document.getElementById("patientMedicalCaresEmpty");

        if (medRes.status === 204) {
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
            editBtn.onclick = () => showEditPatientFormDoctor(paciente, antecedente);
        }

        const createAntecedente = document.getElementById("patientMedicalHistoryEmpty");
        if (createAntecedente) {
            createAntecedente.onclick = () => showRegAntecedenteFormDoctor(idPaciente, [paciente.nombre + " " + paciente.apellido]);
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
            pacienteInput.dataset.idPaciente = idPaciente;
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
        const res = await fetch(URLBASE+`Pacientes/${idPaciente}`);
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
            showEditPatientFormSecretary(p);
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

async function showEditPatientFormSecretary(paciente) {
    try {
        const res = await fetch('../views/secretaria/edit-patient.html');
        const html = await res.text();
        document.getElementById('contentSecretaria').innerHTML = html;

        await loadEditPatientFormSecretary(paciente);
        document.getElementById("btnBackEdit").onclick = () => {
            showPatientDetailSecretary(paciente.iD_Paciente);
        };

    } catch (error) {
        console.error("Error cargando vista de edición:", error);
    }
}

function loadEditPatientFormSecretary(paciente) {
    try {

        document.getElementById("editPatientName").value = paciente.nombre;
        document.getElementById("editPatientLastname").value = paciente.apellido;

        document.getElementById("editPatientCedula").value = paciente.cedula;
        document.getElementById("editPatientCedula").disabled = true;

        document.getElementById("editPatientEmail").value = paciente.email;
        document.getElementById("editPatientPhone").value = paciente.telefono;

        document.getElementById("editPatientBirthDate").value = paciente.fecha_Nacimiento?.split("T")[0];
        document.getElementById("editPatientBirthDate").disabled = true;

        document.getElementById("editPatientGender").value = paciente.sexo;
        document.getElementById("editPatientGender").disabled = true;

        document.getElementById("editPatientAddress").value = paciente.direccion;
        document.getElementById("editPatientEmergency").value = paciente.contactoEmergencia;

        document.getElementById("editPatientActive").value = paciente.activo ? "true" : "false";

        document.getElementById("editPatientForm").dataset.patientid = paciente.iD_Paciente;

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
        const res = await fetch(URLBASE+`Pacientes/${idPaciente}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            alert("Error actualizando al paciente");
            return;
        }

        alert("Paciente actualizado correctamente");
        showPatientDetailSecretary(idPaciente);

    } catch (error) {
        console.error("Error guardando cambios:", error);
        alert("Error de conexión con el servidor");
    }
}


async function showEditPatientFormDoctor(paciente, antecedente) {
    try {
        const res = await fetch('../views/doctor/edit-patient.html');

        const html = await res.text();

        document.getElementById('contentDoctor').innerHTML = html;

        loadDoctorEditForm(paciente, antecedente);
        document.getElementById("btnBackEdit").onclick = () => {
            showPatientDetailDoctor(paciente.iD_Paciente);
        };

    } catch (error) {
        console.error("Error cargando vista de edición:", error);
    }
}

async function loadDoctorEditForm(paciente, antecedente) {
    try {

        document.getElementById("completeEditName").value = paciente.nombre || "";
        document.getElementById("completeEditLastname").value = paciente.apellido || "";
        document.getElementById("completeEditCedula").value = paciente.cedula || "";
        document.getElementById("completeEditEmail").value = paciente.email || "";
        document.getElementById("completeEditPhone").value = paciente.telefono || "";
        document.getElementById("completeEditBirthDate").value = paciente.fecha_Nacimiento?.split("T")[0] || "";
        document.getElementById("completeEditGender").value = paciente.sexo || "";
        document.getElementById("completeEditAddress").value = paciente.direccion || "";
        document.getElementById("completeEditEmergency").value = paciente.contactoEmergencia || "";


        const form = document.getElementById("completeEditForm");
        if (form) form.dataset.patientid = paciente.iD_Paciente;


        if (!antecedente) {
            const antSection = document.getElementById("formAntecendente");
            if (antSection) antSection.style.display = "none";
        } else {
            const antSection = document.getElementById("formAntecendente");
            if (antSection) antSection.style.display = "block";

            document.getElementById("completeEditAllergies").value = antecedente.alergias || "";
            document.getElementById("completeEditChronic").value = antecedente.enfermedades_Cronicas || "";
            document.getElementById("completeEditObservations").value = antecedente.observaciones_Generales || "";
            document.getElementById("completeEditHistoryId").value = antecedente.id_Antecedente || antecedente.iD_Antecedente || "";
        }

        const saveBtn = document.getElementById("btnSavePatient");
        if (saveBtn) {
            const idPaciente = paciente.iD_Paciente;
            const idAntecedente = antecedente ? (antecedente.iD_Antecedente) : null;

            saveBtn.onclick = () => saveDoctorEditedPatient(idPaciente, idAntecedente);
        }


    } catch (error) {
        console.error("Error llenando el formulario de edición (doctor):", error);
        alert("Error cargando datos del paciente");
    }
}

async function saveDoctorEditedPatient(idPaciente, idAntecedente) {
    try {
        if (!idPaciente) throw new Error("ID de paciente no encontrado");

        const patientBody = {
            nombre: document.getElementById("completeEditName").value,
            apellido: document.getElementById("completeEditLastname").value,
            telefono: document.getElementById("completeEditPhone").value,
            email: document.getElementById("completeEditEmail").value,
            direccion: document.getElementById("completeEditAddress").value,
            contactoEmergencia: document.getElementById("completeEditEmergency").value,
            activo: true
        };

        console.log("Enviando PUT paciente:", patientBody);

        const updatePatientRes = await fetch(URLBASE+`Pacientes/${idPaciente}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patientBody)
        });

        const textResp = await updatePatientRes.text();
        console.log("Respuesta backend paciente:", updatePatientRes.status, textResp);

        if (!updatePatientRes.ok) {
            alert("Error actualizando datos del paciente");
            return;
        }

        if (idAntecedente) {
            const antecedenteBody = {
                iD_Paciente: parseInt(idPaciente),
                alergias: document.getElementById("completeEditAllergies").value,
                enfermedades_Cronicas: document.getElementById("completeEditChronic").value,
                observaciones_Generales: document.getElementById("completeEditObservations").value
            };

            console.log("Enviando PUT antecedente:", antecedenteBody);

            const resHist = await fetch(URLBASE+`AntecedentesMedicos/${idAntecedente}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(antecedenteBody)
            });

            const textHist = await resHist.text();
            console.log("Respuesta backend antecedente:", resHist.status, textHist);

            if (!resHist.ok) {
                alert("Paciente actualizado, pero error actualizando antecedente");
            }
        }

        alert("Cambios guardados correctamente");
        await showPatientDetailDoctor(idPaciente);

    } catch (error) {
        console.error("Error guardando cambios (doctor):", error);
        alert("Error al guardar cambios");
    }
}

// ====================================
// GUARDAR ATENCIÓN MÉDICA
// ====================================
async function saveMedicalCare(event) {
    event.preventDefault();

    const selectCita = document.getElementById("careAppointment");
    const fecha = document.getElementById("careDate").value;
    const motivo = document.getElementById("careReason").value.trim();
    const diagnostico = document.getElementById("careDiagnosis").value.trim();
    const observaciones = document.getElementById("careObservations").value.trim();

    if (!selectCita.value || !fecha || !motivo || !diagnostico || !observaciones) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const body = {
        ID_Cita: parseInt(selectCita.value),
        Motivo_Consulta: motivo,
        Diagnostico: diagnostico,
        Observaciones: observaciones,
        Fecha: new Date(fecha).toISOString()
    };


    try {
        const res = await fetch(URLBASE+"AtencionMedica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const textResp = await res.text();
        console.log("Respuesta backend POST atencion:", res.status, textResp);

        if (!res.ok) {
            alert("Error al registrar la atención. Revisa los campos.");
            return;
        }

        alert("Atención médica registrada correctamente.");

        selectCita.value = "";
        document.getElementById("careDate").value = "";
        document.getElementById("careReason").value = "";
        document.getElementById("careDiagnosis").value = "";
        document.getElementById("careObservations").value = "";

    } catch (error) {
        console.error("Error guardando atención médica:", error);
        alert("No se pudo registrar la atención. Revisa la consola.");
    }
}

// ====================================
// REGISTRAR ANTECEDENTE MEDICO
// ====================================
async function saveMedicalHistory(event) {
    event.preventDefault();

    const idPaciente = document.getElementById("historyPatient").dataset.idPaciente; 
    const alergias = document.getElementById("historyAllergies").value.trim();
    const cronicas = document.getElementById("historyChronic").value.trim();
    const observaciones = document.getElementById("historyObservations").value.trim();

    if (!idPaciente || !alergias || !cronicas) {
        alert("Todos los campos obligatorios deben estar llenos.");
        return;
    }

    const body = {
        iD_Paciente: parseInt(idPaciente),
        alergias: alergias,
        enfermedades_Cronicas: cronicas,
        observaciones_Generales: observaciones
    };


    try {
        const res = await fetch(URLBASE+"AntecedentesMedicos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const textResp = await res.text();
        console.log("Respuesta backend:", res.status, textResp);

        if (!res.ok) {
            alert("No se pudo registrar el antecedente.");
            return;
        }

        alert("Antecedente médico registrado correctamente.");

        document.getElementById("historyAllergies").value = "";
        document.getElementById("historyChronic").value = "";
        document.getElementById("historyObservations").value = "";
        showPatientDetailDoctor(idPaciente);

    } catch (err) {
        console.error("Error al guardar antecedente:", err);
        alert("Error al conectar con el servidor.");
    }
}

// ====================================
// REGISTRAR PACIENTE
// ====================================
async function saveNewPatient(event) {
    event.preventDefault();

    const nombre = document.getElementById("patientName").value.trim();
    const apellido = document.getElementById("patientLastname").value.trim();
    const cedula = document.getElementById("patientCedula").value.trim();
    const email = document.getElementById("patientEmail").value.trim();
    const telefono = document.getElementById("patientPhone").value.trim();
    const fechaNacimiento = document.getElementById("patientBirthDate").value;
    const sexo = document.getElementById("patientGender").value;
    const direccion = document.getElementById("patientAddress").value.trim();
    const contactoEmergencia = document.getElementById("patientEmergency").value.trim();

    if (!nombre || !apellido || !cedula || !email || !telefono || !fechaNacimiento || !sexo || !direccion || !contactoEmergencia) {
        alert("Por favor llena todos los campos.");
        return;
    }

    const newPatient = {
        nombre: nombre,
        apellido: apellido,
        cedula: cedula,
        telefono: telefono,
        email: email,
        fecha_Nacimiento: fechaNacimiento,
        sexo: sexo,
        direccion: direccion,
        contactoEmergencia: contactoEmergencia
    };

    try {
        const res = await fetch(URLBASE+'Pacientes', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPatient)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(text);
            throw new Error("Error al registrar el paciente");
        }

        alert("Paciente registrado con éxito");
        document.getElementById("registerPatientForm").reset();

    } catch (error) {
        console.error(error);
        alert("Hubo un problema al registrar el paciente");
    }
}