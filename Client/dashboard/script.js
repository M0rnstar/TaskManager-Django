// ---------------------
// БАЗОВЫЕ КОНСТАНТЫ
// ---------------------
const baseURL = "http://127.0.0.1:8000/api/tasks";
// Если у вас другой адрес (например, просто /api/tasks/ или /api/tasks/create),
// замените в коде ниже соответствующие эндпойнты.

const token = localStorage.getItem("accessToken"); // Токен из localStorage

// ---------------------
// ССЫЛКИ НА ЭЛЕМЕНТЫ
// ---------------------
const addTaskBtn = document.getElementById("addTask");
const modal = document.getElementById("taskModal");
const closeModalBtn = modal.querySelector(".close");
const submitModalBtn = document.getElementById("submitModal");

const modalTitleInput = document.getElementById("modalTitle");
const modalContentInput = document.getElementById("modalContent");
const modalDeadlineInput = document.getElementById("modalDeadline");

const cardsContainer = document.querySelector(".cards");

const username = document.getElementById("username");
const dropdownMenu = document.getElementById("dropdownMenu");

let editingCard = null; // Хранит ссылку на редактируемую карточку (null, если создаём новую)

// ---------------------
// ФУНКЦИИ
// ---------------------

/**
 * Функция, возвращающая innerHTML для содержимого карточки.
 * При необходимости можете кастомизировать отображение дедлайна.
 */
function createCardHTML(title, deadline) {
  return `
    <div class="card__content">
      <div class="card__main">
        <div class="card__left">
          <input type="checkbox" class="checkbox" />
        </div>
        <div class="card__right">
          <div class="card__deadline">До ${deadline || "..."}</div>
          <div class="card__title">${title || "Без названия"}</div>
        </div>
      </div>
      <div class="card__close">&times;</div>
    </div>
  `;
}

/**
 * Очистка полей модального окна.
 */
function clearModalFields() {
  modalTitleInput.value = "";
  modalContentInput.value = "";
  modalDeadlineInput.value = "";
}

/**
 * Функция отрисовывает задачу в контейнере .cards.
 * Принимает объект задачи (task), содержащий хотя бы:
 *  {
 *    id: number,
 *    title: string,
 *    content: string,
 *    deadline: string (формат YYYY-MM-DD),
 *    ...
 *  }
 */
function displayTask(task) {
  const newCard = document.createElement("div");
  newCard.classList.add("card");

  // Сохраняем данные в data-атрибутах для удобства
  newCard.dataset.id = task.id;
  newCard.dataset.title = task.title || "";
  newCard.dataset.content = task.content || "";
  newCard.dataset.deadline = task.deadline || "";

  // Заполняем карточку HTML
  newCard.innerHTML = createCardHTML(task.title, task.deadline);

  // Добавляем карточку в контейнер
  cardsContainer.appendChild(newCard);

  // Находим кнопку-крестик для удаления
  const closeButton = newCard.querySelector(".card__close");
  closeButton.addEventListener("click", () => {
    const cardId = newCard.dataset.id;
    if (!cardId) {
      console.error("У карточки нет ID. Удалить не получится.");
      return;
    }

    // Отправляем DELETE-запрос на сервер
    fetch(`${baseURL}/${cardId}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Удаляем карточку из DOM
          newCard.remove();
        } else {
          console.error("Ошибка при удалении задачи:", response.status);
        }
      })
      .catch((error) => {
        console.error("Ошибка при удалении задачи:", error);
      });
  });

  // Клик по .card__right - открыть модалку в режиме редактирования
  const cardRight = newCard.querySelector(".card__right");
  cardRight.addEventListener("click", () => {
    editingCard = newCard; // Запоминаем, что будем редактировать именно эту карточку
    modal.style.display = "block";

    // Заполняем поля в модалке из data-атрибутов
    modalTitleInput.value = newCard.dataset.title;
    modalContentInput.value = newCard.dataset.content;
    modalDeadlineInput.value = newCard.dataset.deadline;
  });
}

/**
 * Загрузка всех задач с сервера (GET /api/tasks/).
 * Затем вызываем displayTask для каждой задачи.
 */
function loadTasks() {
  fetch(baseURL + "/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Ошибка при загрузке задач, статус: " + response.status
        );
      }
      return response.json();
    })
    .then((tasks) => {
      // Очищаем контейнер на случай повторной загрузки
      cardsContainer.innerHTML = "";
      tasks.forEach((task) => {
        displayTask(task);
      });
    })
    .catch((error) => {
      console.error("Ошибка при получении списка задач:", error);
    });
}

/**
 * Обработка сохранения (кнопка "Сохранить") в модалке.
 * Если editingCard != null → Редактирование существующей задачи.
 * Иначе → Создание новой задачи.
 */
function handleSaveTask() {
  const title = modalTitleInput.value.trim();
  const content = modalContentInput.value.trim();
  const deadline = modalDeadlineInput.value; // Формат YYYY-MM-DD

  if (editingCard) {
    // Режим редактирования
    const cardId = editingCard.dataset.id;
    const updatedTask = { title, content, deadline };

    // Сразу обновим карточку в DOM
    editingCard.dataset.title = title;
    editingCard.dataset.content = content;
    editingCard.dataset.deadline = deadline;
    editingCard.querySelector(".card__title").textContent = title;
    editingCard.querySelector(".card__deadline").textContent = `До ${deadline}`;

    // Отправим PUT-запрос на сервер
    fetch(`${baseURL}/${cardId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Ошибка при обновлении задачи, статус: " + response.status
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Задача обновлена:", data);
      })
      .catch((error) => {
        console.error("Ошибка:", error);
      });

    // Сбросим editingCard, закроем модалку
    editingCard = null;
    modal.style.display = "none";
    clearModalFields();
  } else {
    // Режим создания новой задачи
    const newTask = { title, content, deadline };

    fetch(baseURL + "/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Ошибка при создании задачи, статус: " + response.status
          );
        }
        return response.json();
      })
      .then((createdTask) => {
        console.log("Задача создана:", createdTask);
        // Добавляем её на страницу
        displayTask(createdTask);
      })
      .catch((error) => {
        console.error("Ошибка при создании задачи:", error);
      });

    modal.style.display = "none";
    clearModalFields();
  }
}

// ---------------------
// РАБОТА С МОДАЛКОЙ
// ---------------------

// Открыть модалку по кнопке "Добавить задачу"
addTaskBtn.addEventListener("click", () => {
  console.log("лог отображается");
  editingCard = null; // Создаём новую задачу (не редактируем)
  clearModalFields();
  modal.style.display = "block";
  console.log(modal.style.display);
});

// Закрыть модалку по крестику
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Закрыть модалку при клике вне области модального окна
window.addEventListener("mousedown", (event) => {
  // Если клик по фону модалки (а не по содержимому)
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Сохранить задачу (кнопка "Сохранить")
submitModalBtn.addEventListener("click", handleSaveTask);

// ---------------------
// ПОВЕДЕНИЕ "NAV-ITEM"
// ---------------------
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    document
      .querySelectorAll(".nav-item")
      .forEach((nav) => nav.classList.remove("active"));
    this.classList.add("active");
  });
});

// ---------------------
// ВЫПАДАЮЩЕЕ МЕНЮ (USERNAME)
// ---------------------
username.addEventListener("click", () => {
  // Переключаем видимость меню
  if (!dropdownMenu.style.display || dropdownMenu.style.display === "none") {
    dropdownMenu.style.display = "block";
  } else {
    dropdownMenu.style.display = "none";
  }
});

// Если клик вне dropdownMenu и вне username - скрываем меню
window.addEventListener("click", (event) => {
  if (
    !event.target.closest("#username") &&
    !event.target.closest("#dropdownMenu")
  ) {
    dropdownMenu.style.display = "none";
  }
});

// ---------------------
// КНОПКА "ВЫЙТИ"
// ---------------------
const logoutBtn = document.querySelector(".logout-button");
logoutBtn.addEventListener("click", () => {
  localStorage.clear(); // Стираем токен
  // Здесь можно сделать редирект на страницу логина (если требуется)
  window.location.href = "../auth/login.html";
  console.log("Вы вышли из системы.");
});

// ---------------------
// СТАРТОВАЯ ИНИЦИАЛИЗАЦИЯ
// ---------------------
window.addEventListener("DOMContentLoaded", () => {
  // Если нет токена, можно перекидывать на страницу логина или выводить ошибку
  if (!token) {
    console.warn("Токен не найден! Перенаправление на страницу логина...");
    window.location.href = "../auth/login.html";
    return;
  }
  // Загружаем задачи
  loadTasks();
});
