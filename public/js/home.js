// Запуск подгрузки живой ленты новостей при открытии сайта
document.addEventListener("DOMContentLoaded", () => {
  loadLiveNews();
});

// Статические вкладки информационного портала
const staticSections = {
  about: {
    title: "О нашей клинике",
    text: "Мы — современный цифровой медицинский центр РБ, работающий по стандартам автоматизированного распределения пациентов. Наша цель — сделать медицинскую помощь доступной и быстрой.",
  },
  info: {
    title: "Информационный источник",
    text: "Полезные статьи о профилактике сезонных ОРВИ, контроле артериального давления при гипертонии и правилах подготовки к плановым диагностическим осмотрам в кабинетах поликлиники.",
  },
  contacts: {
    title: "Контактная информация",
    text: "Телефон регистратуры: +375 (17) 000-00-00. Режим работы окон справок: Пн-Пт с 8:00 до 20:00. Адрес: г. Минск, центральный лечебный корпус.",
  },
};

// Динамическое скачивание новостей из SQLite без авторизации
async function loadLiveNews() {
  const box = document.getElementById("news-box");
  box.innerHTML =
    '<p style="color: #64748b;">Загрузка свежих новостей клиники...</p>';

  try {
    const res = await fetch("/med/api/public/news-list");
    const result = await res.json();

    if (result.success && result.data.length > 0) {
      let html = "";
      result.data.forEach((post) => {
        const date = new Date(post.createdAt).toLocaleDateString("ru-RU");
        html += `
                    <div style="margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <span style="font-size:12px; color:#64748b;">📅 Опубликовано: ${date}</span>
                        <h2 style="margin: 5px 0 10px 0; color:#1e3a8a;">${post.title}</h2>
                        <p style="line-height: 1.6; color:#475569; margin:0;">${post.content}</p>
                    </div>
                `;
      });
      box.innerHTML = html;
    } else {
      box.innerHTML =
        '<h2>Лента новостей</h2><p style="color:#64748b;">На данный момент новостей и объявлений нет.</p>';
    }
  } catch (err) {
    console.error("Ошибка загрузки новостей:", err);
    box.innerHTML =
      '<p style="color:red;">Не удалось загрузить ленту новостей сервера.</p>';
  }
}

// Переключатель вкладок навигации по чертежу
function switchSection(sectionKey, element) {
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  element.classList.add("active");
  const elements = {
    news: document.getElementById("news-box"),
    about: document.getElementById("about-box"),
    info: document.getElementById("info-box"),
    contact: document.getElementById("contacts-box"), // изменил ключ на contact для соответствия строке
  };

  // 1. Вызываем функцию для новостей, если выбрана эта секция
  if (sectionKey === "news" && typeof loadLiveNews === "function") {
    loadLiveNews();
  }

  // 2. Скрываем все элементы и показываем только нужный
  Object.keys(elements).forEach((key) => {
    if (elements[key]) {
      // проверка, что элемент нашелся в DOM
      elements[key].style.display = key === sectionKey ? "block" : "none";
    }
  });
}
// Онлайн-проверка лечебного участка по полному адресу кнопкой "ОК"
async function checkDistrictOnline() {
  const city = document.getElementById("checkCityInput").value;
  const street = document.getElementById("checkStreetInput").value;
  const house = document.getElementById("checkHouseInput").value;
  const resultBox = document.getElementById("checkResultBox");

  if (!city || !street || !house) {
    resultBox.innerHTML =
      '<span style="color:red;">Заполните все три поля: Город, Улица, Дом!</span>';
    return;
  }

  resultBox.innerHTML = "Проверка адреса в SQLite...";

  try {
    // Формируем безопасный GET-запрос со всеми параметрами адреса
    const url = `/med/api/public/check-district?clinicId=1&city=${encodeURIComponent(city)}&street=${encodeURIComponent(street)}&house=${encodeURIComponent(house)}`;
    const res = await fetch(url);
    const result = await res.json();

    if (result.success) {
      resultBox.innerHTML = `🩺 ${result.data.assignedDistrict} <br> 🚪 ${result.data.assignedCabinet}`;
    } else {
      resultBox.innerHTML = `<span style="color:red;">Ошибка: ${result.error}</span>`;
    }
  } catch (err) {
    console.error(err);
    resultBox.innerHTML =
      '<span style="color:red;">Ошибка соединения с базой данных</span>';
  }
}
