/************************************************
 * main.js
 * Основная логика: CRUD, проверка авторизации,
 * работа с модальным окном, создание карточек.
 * Теперь чекбокс is_completed сохраняется
 * при каждом клике на него.
 ************************************************/

// ---------------------
// БАЗОВЫЕ КОНСТАНТЫ
// ---------------------
const baseURL = "http://127.0.0.1:8000/api/tasks";
const token = localStorage.getItem("accessToken"); // Токен из localStorage

// ---------------------
// ССЫЛКИ НА ЭЛЕМЕНТЫ
// ---------------------
const addTaskBtn = document.getElementById("addTask"); // Кнопка «Добавить задачу»
const modal = document.getElementById("taskModal"); // Модалка
const closeModalBtn = modal.querySelector(".close"); // Крестик в модалке
const submitModalBtn = document.getElementById("submitModal");

const modalTitleInput = document.getElementById("modalTitle");
const modalContentInput = document.getElementById("modalContent");
const modalDeadlineInput = document.getElementById("modalDeadline");
const deadlineText = document.getElementById("deadlineText"); // «До …»
const btnBold = document.querySelector(".btn-bold");
const btnItalic = document.querySelector(".btn-italic");
const taskDescription = document.querySelector("textarea.task-description");

const cardsContainer = document.querySelector(".cards");

const username = document.getElementById("username");
const dropdownMenu = document.getElementById("dropdownMenu");

let editingCard = null; // Хранит ссылку на редактируемую карточку (null, если создаём новую)

// ---------------------
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ---------------------

/**
 * Преобразует "yyyy-mm-dd" → "dd.mm.yyyy"
 * Если на вход пришло "", возвращаем "".
 */
function formatToDdMmYyyy(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-"); // ["yyyy","mm","dd"]
  if (parts.length !== 3) return "";
  const [yyyy, mm, dd] = parts;
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Преобразует "dd.mm.yyyy" → "yyyy-mm-dd"
 * Если на вход пришло "", возвращаем "".
 */
function formatToYyyyMmDd(dottedDate) {
  if (!dottedDate) return "";
  const parts = dottedDate.split("."); // ["dd","mm","yyyy"]
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Функция, возвращающая HTML для содержимого карточки.
 * deadline приходит в формате "dd.mm.yyyy" (например, "13.02.2025").
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
  modalDeadlineInput.value = ""; // Сбрасываем hidden-инпут
  deadlineText.textContent = "До ..."; // Визуальный текст
}

/**
 * Функция отрисовывает задачу в контейнере .cards.
 * Принимает объект задачи (task):
 *  {
 *    id: number,
 *    title: string,
 *    content: string,
 *    deadline: string (формат "dd.mm.yyyy"),
 *    is_completed: boolean,
 *    ...
 *  }
 */
function displayTask(task) {
  const newCard = document.createElement("div");
  newCard.classList.add("card");

  // Сохраняем данные в data-атрибутах (deadline в "dd.mm.yyyy")
  newCard.dataset.id = task.id;
  newCard.dataset.title = task.title || "";
  newCard.dataset.content = task.content || "";
  newCard.dataset.deadline = task.deadline || "";

  // Заполняем карточку HTML
  newCard.innerHTML = createCardHTML(task.title, task.deadline);

  // Добавляем карточку в контейнер
  cardsContainer.appendChild(newCard);

  // ==== Работа с чекбоксом (is_completed) ====
  const checkbox = newCard.querySelector(".checkbox");
  checkbox.checked = Boolean(task.is_completed);

  // При клике на чекбокс отправляем запрос на сервер, чтобы обновить is_completed
  checkbox.addEventListener("change", () => {
    const cardId = newCard.dataset.id;
    const isCompleted = checkbox.checked;

    const updatedTask = { is_completed: isCompleted };

    fetch(`${baseURL}/${cardId}/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Ошибка при обновлении is_completed, статус: " + response.status
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          `Задача ${cardId} обновлена (is_completed=${isCompleted}).`,
          data
        );
        rerunActiveFilter(); // <-- функция из utils.js, если у вас есть фильтр
      })
      .catch((err) => {
        console.error("Ошибка при обновлении чекбокса:", err);
      });
  });

  // ==== Кнопка-крестик для удаления ====
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

  // ==== Клик по .card__right - открыть модалку для редактирования ====
  const cardRight = newCard.querySelector(".card__right");
  cardRight.addEventListener("click", () => {
    editingCard = newCard;
    modal.style.display = "block";

    // Заполняем поля модалки из data-атрибутов
    modalTitleInput.value = newCard.dataset.title;
    modalContentInput.value = newCard.dataset.content;

    // deadline хранится в "dd.mm.yyyy"
    const ddMmYyyy = newCard.dataset.deadline;
    if (ddMmYyyy) {
      // Ставим в input "yyyy-mm-dd"
      const iso = formatToYyyyMmDd(ddMmYyyy);
      modalDeadlineInput.value = iso;
      deadlineText.textContent = "До " + ddMmYyyy;
    } else {
      // Если нет даты, сбросим:
      modalDeadlineInput.value = "";
      deadlineText.textContent = "До ...";
    }
  });
}

/**
 * Загрузка всех задач (GET /api/tasks/).
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
      // Очищаем контейнер, чтобы не было дублирования
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
 * Обработка "Сохранить" (иконка в модалке).
 */
function handleSaveTask() {
  const title = modalTitleInput.value.trim();
  const content = modalContentInput.value.trim();

  // modalDeadlineInput.value = "yyyy-mm-dd" (или пусто)
  const isoDate = modalDeadlineInput.value.trim();
  const deadlineFormatted = isoDate ? formatToDdMmYyyy(isoDate) : "";

  if (editingCard) {
    // Редактируем существующую задачу
    const cardId = editingCard.dataset.id;
    const updatedTask = {
      title,
      content,
      deadline: deadlineFormatted, // "dd.mm.yyyy"
    };

    // Обновим карточку в DOM
    editingCard.dataset.title = title;
    editingCard.dataset.content = content;
    editingCard.dataset.deadline = deadlineFormatted;
    editingCard.querySelector(".card__title").textContent = title;
    editingCard.querySelector(
      ".card__deadline"
    ).textContent = `До ${deadlineFormatted}`;

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
        console.log("Задача обновлена на сервере:", data);
      })
      .catch((error) => {
        console.error("Ошибка:", error);
      });

    editingCard = null;
    modal.style.display = "none";
    clearModalFields();
  } else {
    // Создаём новую задачу (по умолчанию is_completed = false)
    const newTask = {
      title,
      content,
      deadline: deadlineFormatted, // "dd.mm.yyyy"
    };

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
        displayTask(createdTask);
      })
      .catch((error) => {
        console.error("Ошибка при создании задачи:", error);
      });

    modal.style.display = "none";
    clearModalFields();
  }
}

// Функция для загрузки никнейма
function loadUser() {
  fetch("http://127.0.0.1:8000/api/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при загрузке имени пользователя");
      }
      return response.json();
    })
    .then((data) => {
      const usernameElement = document.getElementById("username");
      const emailElement = document.getElementById("email");
      if (usernameElement) {
        console.log(data);
        usernameElement.textContent = data.username;
      }
      if (emailElement) {
        console.log("Емайл найден");
        emailElement.textContent = data.email;
      }
    })
    .catch((err) => {
      console.error("Ошибка при загрузке профиля пользователя:", err);
    });
}

// ---------------------
// РАБОТА С МОДАЛКОЙ
// ---------------------

// Открыть модалку «Добавить задачу»
addTaskBtn.addEventListener("click", () => {
  editingCard = null;
  clearModalFields();
  modal.style.display = "block";
});

// Закрыть модалку по крестику
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Закрыть модалку при клике вне области
window.addEventListener("mousedown", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// "Сохранить" (в модалке)
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
  window.location.href = "../auth/login.html";
  console.log("Вы вышли из системы.");
});

// ---------------------
// СТАРТОВАЯ ИНИЦИАЛИЗАЦИЯ
// ---------------------
window.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    console.warn("Токен не найден! Перенаправление на страницу логина...");
    window.location.href = "../auth/login.html";
    return;
  }
  // Загружаем задачи и никнейм при старте
  loadUser();
  loadTasks();

  // Дополнительно: подписываемся на change, чтобы сразу менялся текст «До ...»
  // при выборе даты в модалке (без сохранения).
  if (modalDeadlineInput && deadlineText) {
    modalDeadlineInput.addEventListener("change", () => {
      const iso = modalDeadlineInput.value; // "yyyy-mm-dd"
      if (!iso) {
        deadlineText.textContent = "До ...";
      } else {
        deadlineText.textContent = "До " + formatToDdMmYyyy(iso);
      }
    });
  }
});

