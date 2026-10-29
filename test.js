const express = require("express");
const path = require("path");
const initMedCms = require("./index.js"); // Импортируем наш модуль через главную точку входа
const chalk = require("chalk-palette");
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  await initMedCms(app);
  app.use((req, res) => {
    res
      .status(404)
      .send("<h1>404 | Медицинский модуль: Страница не найдена</h1>");
  });
  app.listen(PORT, () => {});
})();
