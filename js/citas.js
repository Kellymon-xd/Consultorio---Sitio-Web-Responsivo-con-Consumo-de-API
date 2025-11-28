async function loadSecretaryCitasList() {
    const secretaryCitasList = document.getElementById('secretaryCitasList');
    const noCitasMessage = document.getElementById('noCitasMessage');

    try {
        const citasRes = await fetch('https://localhost:7193/api/Citas');
        const citas = await citasRes.json();

        const stateRes = await fetch('https://localhost:7193/api/EstadoCita');
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
                            onchange="updateAppointmentStatus(${cita.iD_Cita}, this.value); updateStatusSelectColor(this)">
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

        const res = await fetch(`https://localhost:7193/api/Citas/${idCita}/estado`, {
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