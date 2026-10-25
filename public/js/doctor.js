// Загрузка расписания при старте страницы
document.addEventListener('DOMContentLoaded', () => {
    loadSchedule();
    loadDiseasesCatalog();
});

async function loadSchedule() {
    const res = await fetch('/med/api/doctor/schedule');
    const data = await res.json();
    
    const list = document.getElementById('scheduleList');
    list.innerHTML = '';

    if (data.schedule && data.schedule.length > 0) {
        data.schedule.forEach(ap => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${ap.time}</b> - ${ap.Patient.fullName} 
                            <button onclick="startExamination('${ap.id}', '${ap.Patient.fullName}')" class="btn-action">Принять</button>`;
            list.appendChild(li);
        });
    } else {
        list.innerHTML = '<li>Ближайших записей на сегодня нет</li>';
    }
}

// Загрузка справочника болезней для выпадающего списка
async function loadDiseasesCatalog() {
    // Для простоты подгрузим базовые заболевания (их создает наш db-init.js)
    // В реальной админке список можно расширять
    const select = document.getElementById('examDisease');
    // Полноценный справочник можно получить эндпоинтом админа или выделить под это публичный роут
    // Для примера добавим жесткие опции или сделаем запрос к бэкенду
    const res = await fetch('/med/api/admin/stats'); // Отсюда можно забрать топ или список
    const data = await res.json();
    
    if (data.stats && data.stats.topDiseases) {
        data.stats.topDiseases.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id; // UUID болезни
            opt.textContent = `[${d.code}] ${d.name}`;
            select.appendChild(opt);
        });
    }
}

function startExamination(appointmentId, patientName) {
    document.getElementById('examBlock').classList.remove('hidden');
    document.getElementById('activeAppointmentId').value = appointmentId;
    document.getElementById('currentPatientName').textContent = patientName;
}

// Сохранение осмотра
document.getElementById('examForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        appointmentId: document.getElementById('activeAppointmentId').value,
        complaints: document.getElementById('examComplaints').value,
        objectively: document.getElementById('examObjective').value,
        doctorNotes: document.getElementById('examNotes').value,
        diseaseId: document.getElementById('examDisease').value
    };

    const res = await fetch('/med-api/doctor/complete-examination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
        alert('Осмотр успешно зафиксирован! Статистика болезней обновлена.');
        document.getElementById('examBlock').classList.add('hidden');
        document.getElementById('examForm').reset();
        loadSchedule(); // Обновляем список пациентов
    } else {
        alert('Ошибка: ' + result.error);
    }
});

async function logout() {
    await fetch('/med/api/auth/logout', { method: 'POST' });
    window.location.href = '/med/html/login.html';
}
