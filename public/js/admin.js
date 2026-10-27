document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});
async function loadDashboardStats() {
    try {
        const response = await fetch('/med/api/admin/stats');
        const result = await response.json();
        if (!result.success) {
            alert('Ошибка доступа к админ-панели: ' + result.message);
            window.location.href = '/med/html/login.html';
            return;
        }
        document.getElementById('statClinics').textContent = result.stats.summary.totalClinics;
        document.getElementById('statPatients').textContent = result.stats.summary.totalPatients;
        document.getElementById('statStaff').textContent = result.stats.summary.totalStaff;
        await loadClinicsDropdown();
    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
    }
}
async function loadClinicsDropdown() {
    try {
                const response = await fetch('/med/api/admin/list-clinics');
        const result = await response.json();
        
        const select = document.getElementById('staffClinic');
        select.innerHTML = '<option value="">-- Выберите больницу --</option>';

        if (result.success && result.data.length > 0) {
            result.data.forEach(clinic => {
                const opt = document.createElement('option');
                opt.value = clinic.id;                 opt.textContent = `[ID: ${clinic.id}] ${clinic.name}`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Ошибка наполнения списка клиник:', err);
    }
}

async function viewClinicsTable() {
    const block = document.getElementById('tableViewerBlock');
    const title = document.getElementById('tableViewerTitle');
    const content = document.getElementById('tableViewerContent');

    block.classList.remove('hidden');
    title.textContent = ' 🏥 Реестр медицинских учреждений системы';
    content.innerHTML = '<p>Загрузка таблицы...</p>';

    try {
                const res = await fetch('/med/api/admin/list-clinics');
        const result = await res.json();

        if (result.success && result.data.length > 0) {
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>ID Клиники</th>
                            <th>Название</th>
                            <th>Тип</th>
                            <th>Адрес</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            result.data.forEach(c => {
                html += `
                    <tr>
                        <td><span class="uid-badge">${c.id}</span></td>
                        <td><b>${c.name}</b></td>
                        <td>${c.type}</td>
                        <td>${c.address}</td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
            content.innerHTML = html;
        } else {
            content.innerHTML = '<p>В базе данных пока нет созданных учреждений.</p>';
        }
    } catch (err) {
        content.innerHTML = '<p style="color:red;">Ошибка загрузки данных клиник</p>';
    }
}

async function viewStaffTable() {
    const block = document.getElementById('tableViewerBlock');
    const title = document.getElementById('tableViewerTitle');
    const content = document.getElementById('tableViewerContent');

    block.classList.remove('hidden');
    title.textContent = '👨‍⚕️ Зарегистрированный медицинский персонал';
    content.innerHTML = '<p>Загрузка таблицы...</p>';

    try {
        const res = await fetch('/med/api/admin/list-staff');
        const result = await res.json();

        if (result.success && result.data.length > 0) {
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>ID Сотрудника</th>
                            <th>ФИО</th>
                            <th>Email</th>
                            <th>Должность</th> <!-- Новая колонка -->
                            <th>Специализация</th>
                            <th>Место работы</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            result.data.forEach(s => {
                const clinicName = s.Clinic ? s.Clinic.name : '<span style="color:red;">Не привязан</span>';
                html += `
                    <tr>
                        <td><span class="uid-badge">${s.id}</span></td>
                        <td><b>${s.fullName}</b></td>
                        <td>${s.email}</td>
                        <td><span class="badge" style="background:#f1f5f9; color:#475569;">${s.position || 'Врач'}</span></td> <!-- Выводим должность -->
                        <td>${s.specialty || 'Нет'}</td>
                        <td>${clinicName}</td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
            content.innerHTML = html;
        } else {
            content.innerHTML = '<p>В штате системы пока нет зарегистрированных сотрудников.</p>';
        }
    } catch (err) {
        content.innerHTML = '<p style="color:red;">Ошибка загрузки данных персонала</p>';
    }
}
document.getElementById('clinicForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('clinicName').value,
        type: document.getElementById('clinicType').value,
        address: document.getElementById('clinicAddress').value
    };
    try {
        const response = await fetch('/med/api/admin/clinics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            alert(`Учреждение успешно добавлено в SQLite под ID №${result.data.id}!`);
            document.getElementById('clinicForm').reset();
            await loadDashboardStats();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (err) {
        alert('Ошибка сети при создании клиники');
    }
});
document.getElementById('staffForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const clinicSelect = document.getElementById('staffClinic');
    const selectedClinicId = clinicSelect.value;
    const selectedProfile = document.getElementById('staffMedicalProfile').value;
    if (!selectedClinicId) {
        alert('Пожалуйста, выберите больницу из списка!');
        return;
    }
    const payload = {
        fullName: document.getElementById('staffName').value,
        email: document.getElementById('staffEmail').value,
        rawPassword: document.getElementById('staffPassword').value,
        medicalProfile: selectedProfile, 
        clinicId: parseInt(selectedClinicId, 10)
    };
    try {
        const response = await fetch('/med/api/admin/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            alert(`Сотрудник успешно создан!\nПрофиль: ${selectedProfile}`);
            document.getElementById('staffForm').reset();
            await loadDashboardStats();
        } else {
            alert('Ошибка создания: ' + result.error);
        }
    } catch (err) {
        alert('Ошибка сети при создании сотрудника');
    }
});
async function logout() {
    await fetch('/med/api/auth/logout', { method: 'POST' });
    window.location.href = '/med/html/login.html';
}