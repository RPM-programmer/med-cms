const express = require('express');
const path = require('path');
const initMedCms = require('./index.js'); // Импортируем наш модуль через главную точку входа
const chalk = require("chalk-palette");
const app = express();
const PORT = process.env.PORT || 3000;

(async()=>{
    await initMedCms(app);
    app.use((req, res) => {
        res.status(404).send('<h1>404 | Медицинский модуль: Страница не найдена</h1>');
    });
    app.listen(PORT, () => {
        console.log('\n==================================================');
        console.log(`🚀 ТЕСТОВЫЙ СЕРВЕР MED-CMS УСПЕШНО ЗАПУЩЕН!`);
        console.log(chalk.url(`🔗 Откройте в браузере: http://localhost:${PORT}`));
        console.log('==================================================\n');
        console.log('📝 ИНСТРУКЦИЯ ДЛЯ ТЕСТИРОВАНИЯ:');
        console.log('1. Перейдите по ссылке, откроется страница входа.');
        console.log('2. Нажмите "Зарегистрироваться как пациент" и создайте тестовый аккаунт.');
        console.log('3. Проверьте в консоли разработчика (F12 -> Application -> Cookies), что кука med_auth_token установилась.');
        console.log('4. Чтобы зайти под Админом или Врачом, вы можете использовать созданный файл test-database.sqlite.\n');
    });
})()



