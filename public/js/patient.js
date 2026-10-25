document.addEventListener('DOMContentLoaded', () => {
    loadPatientData();
});

// 1. Загрузка всех данных пациента одной транзакцией с бэкенда
async function loadPatientData() {
    try {
        const response = await fetch('/med/api/patient/me');
        const result = await response.json();

        if (!result.success) {
            alert('Ошибка загрузки данных: ' + result.message);
            window.location.href = '/med/html/login.html';
            return;
        }

        const data = result.data;

        // Заполняем шапку профиля
        document.getElementById('patientName').textContent = data.personalInfo.fullName;
        document.getElementById('patientEmail').textContent = data.personalInfo.email;

        // Заполняем информацию об адресе и участке
        const districtInfo = document.getElementById('districtInfo');
        if (data.personalInfo.UserAddress) {
            const addr = data.personalInfo.UserAddress;
            districtInfo.innerHTML = `
                <p><b>Ваш адрес:</b> г. ${addr.city}, ул. ${addr.street}, д. ${addr.houseNumber}</p>
                <p style="margin-top: 10px;">🩺 <span class="badge">${addr.assignedDistrict}</span></p>
                <p style="margin-top: 10px;">🚪 <span class="badge" style="background:#ecfdf5; color:#065f46;">${addr.assignedCabinet}</span></p>
            `;
            // Предзаполняем форму текущими данными
            document.getElementById('addrCity').value = addr.city;
            document.getElementById('addrStreet').value = addr.street;
            document.getElementById('addrHouse').value = addr.houseNumber;
        }

        // Рендерим медицинскую карту и историю приемов
        const historyContainer = document.getElementById('medicalHistoryList');
        historyContainer.innerHTML = '';

        if (data.medicalHistory && data.medicalHistory.length > 0) {
            data.medicalHistory.forEach(record => {
                const card = document.createElement('div');
                
                if (record.status === 'ожидается') {
                    // Будущий запланированный прием
                    card.className = 'record-card future';
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; font-weight:bold; color:#047857;">
                            <span>📅 Предстоящий прием: ${record.date} в ${record.time}</span>
                            <span>Статус: ожидается</span>
                        </div>
                        <p style="margin: 5px 0 0 0;"><b>Врач:</b> ${record.Doctor.fullName} (${record.Doctor.specialty})</p>
                    `;
                } else if (record.status === 'завершен') {
                    // Прошедший прием с диагнозом и осмотром
                    card.className = 'record-card';
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; font-weight:bold; color:#1e3a8a; margin-bottom: 8px;">
                            <span>🩺 Осмотр от ${record.date} в ${record.time}</span>
                            <span style="color:#2563eb;">Диагноз: [${record.Disease.code}] ${record.Disease.name}</span>
                        </div>
                        <p style="margin: 4px 0;"><b>Врач:</b> ${record.Doctor.fullName} (${record.Doctor.specialty})</p>
                        <p style="margin: 4px 0; font-size:14px;"><b>Жалобы:</b> ${record.complaints || '—'}</p>
                        <p style="margin: 4px 0; font-size:14px;"><b>Данные осмотра:</b> ${record.objectively || '—'}</p>
                        <div style="margin-top:8px; padding:8px; background:#f1f5f9; border-radius:4px; font-size:13px;">
                            <p style="margin:0 0 4px 0;">💊 <b>Рекомендации и лекарства:</b> ${record.Disease.treatmentRecommendations}</p>
                            <p style="margin:0;"><b>Назначено:</b> ${record.Disease.recommendedMedications}</p>
                        </div>
                    `;
                }
                historyContainer.appendChild(card);
            });
        } else {
            historyContainer.innerHTML = '<p style="color: #64748b;">У вас пока нет записей в медицинской карте.</p>';
        }

    } catch (err) {
        console.error('Ошибка связи с сервером:', err);
    }
}

// 2. Отправка формы адреса для автоматического перерасчета участка
document.getElementById('addressForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        city: document.getElementById('addrCity').value,
        street: document.getElementById('addrStreet').value,
        houseNumber: document.getElementById('addrHouse').value
    };

    try {
        const response = await fetch('/med/api/patient/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            alert('Адрес сохранен! Система автоматически пересчитала ваш лечебный участок.');
            loadPatientData(); // Перезагружаем профиль, чтобы увидеть новый участок и кабинет
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (err) {
        alert('Ошибка сети при отправке адреса');
    }
});

async function logout() {
    await fetch('/med-api/auth/logout', { method: 'POST' });
    window.location.href = '/med/html/login.html';
}
