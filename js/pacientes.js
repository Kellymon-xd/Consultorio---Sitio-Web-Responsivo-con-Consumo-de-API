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

            html += `
                <tr>
                    <td>${patient.cedula}</td>
                    <td>${patient.nombreCompleto}</td>
                    <td>${patient.email || '-'}</td>
                    <td><span class="badge ${stateClass}">${stateBadge}</span></td>
                    <td>
                        <button class="btn-action btn-view" onclick="viewSecretaryPatientDetail('${patient.id}')">Ver</button>
                        <button class="btn-action btn-edit" onclick="loadEditPatientForm('${patient.id}')">Editar</button>
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
    const secretaryPatientsList = document.getElementById('doctorPatientsList');
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

        secretaryPatientsList.innerHTML = html;

    } catch (error) {
        console.error(error);
        secretaryPatientsList.innerHTML = '<tr><td colspan="7">Error cargando usuarios</td></tr>';
    }
}