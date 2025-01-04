const token = localStorage.getItem("accessToken");
if (!token) {
  // Если токена нет, перенаправляем на страницу авторизации
  window.location.href = "../auth/login.html";
}

// Функция для генерации HTML карточки
function createCardHTML(title, deadline) {
  return `
    <div class="card__content">
      <div class="card__main">
        <div class="card__left">
          <input type="checkbox" class="checkbox" />
        </div>
        <div class="card__right">
          <div class="card__deadline">До ${deadline}</div>
          <div class="card__title">${title}</div>
        </div>
      </div>
      <div class="card__close">&times;</div>
    </div>
  `;
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    // Убираем активный класс со всех элементов
    document
      .querySelectorAll(".nav-item")
      .forEach((nav) => nav.classList.remove("active"));

    // Добавляем активный класс текущему элементу
    this.classList.add("active");
  });
});

const modal = document.getElementById("taskModal");
const openModalBtn = document.getElementById("addTask");
const closeBtn = document.getElementsByClassName("close")[0];
const submitBtn = document.getElementById("submitModal");
const cardsContainer = document.querySelector(".cards");

let editingCard = null;
let cardIdCounter = 0; // Счётчик для ID карточек

// Открыть модальное окно при клике на кнопку
openModalBtn.onclick = function () {
  modal.style.display = "block";
  clearModalFields();
  editingCard = null;
};

// Закрыть окно при клике на Х
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// Закрыть окно при клике вне его области
window.addEventListener("mousedown", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Очистка полей модального окна
function clearModalFields() {
  document.getElementById("modalTitle").value = "";
  document.getElementById("modalContent").value = "";
  document.getElementById("modalDeadline").value = ""; // Очищаем поле дедлайна
}

// Функция для отображения задачи на странице
function displayTask(task) {
  const newCard = document.createElement("div");
  newCard.classList.add("card");

  // Сохраняем ID задачи в data-id
  newCard.dataset.id = task.id; // Предположим, что task содержит поле id
  newCard.dataset.title = task.title;
  newCard.dataset.content = task.content;
  newCard.dataset.deadline = task.deadline;

  newCard.innerHTML = createCardHTML(task.title, task.deadline);

  // Добавляем карточку в контейнер
  cardsContainer.appendChild(newCard);

  const closeButton = newCard.querySelector(".card__close");

  // Обработка события клика на крестик (если нужно удаление)
  closeButton.addEventListener("click", function () {
    const cardId = newCard.dataset.id; // Теперь получаем правильный ID

    if (cardId) {
      // Отправляем DELETE-запрос на сервер для удаления задачи
      fetch(`/api/delete-task/${cardId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            newCard.remove(); // Удаляем карточку с фронтенда
          } else {
            console.error("Ошибка при удалении задачи");
            console.log(`Attempting to delete task with ID: ${cardId}`);
          }
        })
        .catch((error) => console.error("Ошибка:", error));
    } else {
      console.error("Ошибка: ID задачи не найден");
    }
  });

  // Обработчик для открытия модального окна при клике на карточку
  newCard.querySelector(".card__right").onclick = function () {
    modal.style.display = "block";
    document.getElementById("modalTitle").value = newCard.dataset.title;
    document.getElementById("modalContent").value = newCard.dataset.content;
    document.getElementById("modalDeadline").value = newCard.dataset.deadline;
    editingCard = newCard;
  };
}

// Загружаем задачи с сервера при загрузке страницы
window.onload = function () {
  fetch("/api/get-tasks") // Отправляем GET-запрос
    .then((response) => response.json()) // Преобразуем ответ в JSON
    .then((tasks) => {
      tasks.forEach((task) => {
        displayTask(task); // Отображаем каждую задачу
      });
    })
    .catch((error) => console.error("Ошибка при загрузке задач:", error));
};

submitBtn.onclick = function () {
  const title = document.getElementById("modalTitle").value;
  const content = document.getElementById("modalContent").value;
  const deadline = document.getElementById("modalDeadline").value; // Получаем дедлайн

  if (editingCard) {
    const cardId = editingCard.dataset.id; // Получаем ID карточки

    // Обновляем title, content и deadline
    editingCard.querySelector(".card__title").textContent = title;
    editingCard.querySelector(".card__deadline").textContent = `До ${deadline}`;
    editingCard.dataset.title = title;
    editingCard.dataset.content = content;
    editingCard.dataset.deadline = deadline; // Обновляем dataset дедлайна
    const updatedTaskData = {
      title: title,
      content: content,
      deadline: deadline,
    };

    fetch(`/api/update-task/${cardId}`, {
      method: "PUT", // Используем метод PUT для обновления
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTaskData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log(data.message); // Логируем сообщение об обновлении задачи
        }
      })
      .catch((error) => console.error("Ошибка:", error));
    editingCard = null; // Сбрасываем editingCard после обновления
  } else {
    // Создаём новую карточку
    cardIdCounter++; // Увеличиваем счётчик ID
    const newCard = document.createElement("div");
    newCard.classList.add("card");

    // Сохраняем данные в dataset
    newCard.dataset.id = cardIdCounter; // Присваиваем ID карточке
    newCard.dataset.title = title;
    newCard.dataset.content = content;
    newCard.dataset.deadline = deadline; // Сохраняем дедлайн

    newCard.innerHTML = createCardHTML(title, deadline);

    // Добавляем карточку в контейнер
    cardsContainer.appendChild(newCard);
    const closeButton = newCard.querySelector(".card__close");

    // Обработка события клика на крестик
    closeButton.addEventListener("click", function () {
      const cardId = newCard.dataset.id; // Предположим, что у карточки есть уникальный ID

      // Отправляем DELETE-запрос на сервер для удаления задачи
      fetch(`/api/delete-task/${cardId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            // Если запрос успешный, удаляем карточку с фронтенда
            newCard.remove();
          } else {
            console.error("Ошибка при удалении задачи");
          }
        })
        .catch((error) => console.error("Ошибка:", error));
    });

    // Обработчик только для card__right
    newCard.querySelector(".card__right").onclick = function () {
      modal.style.display = "block";
      document.getElementById("modalTitle").value = newCard.dataset.title;
      document.getElementById("modalContent").value = newCard.dataset.content;
      document.getElementById("modalDeadline").value = newCard.dataset.deadline; // Устанавливаем дедлайн в модальном окне
      editingCard = newCard; // Устанавливаем editingCard на новую карточку
    };

    // Отправляем POST-запрос на сервер при создании новой карточки
    const taskData = {
      title: title,
      content: content,
      deadline: deadline,
    };

    fetch("/api/add-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData), // Преобразуем объект в JSON
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log(data.message); // Логируем сообщение о добавлении задачи
        }
      })
      .catch((error) => console.error("Ошибка:", error)); // Обрабатываем возможные ошибки
  }

  modal.style.display = "none"; // Закрываем модальное окно
};

// Получаем элементы
const username = document.getElementById("username");
const dropdownMenu = document.getElementById("dropdownMenu");

// Открываем/закрываем шторку при клике на никнейм
username.addEventListener("click", function () {
  // Переключаем display между 'none' и 'block'
  if (
    dropdownMenu.style.display === "none" ||
    dropdownMenu.style.display === ""
  ) {
    dropdownMenu.style.display = "block";
  } else {
    dropdownMenu.style.display = "none";
  }
});

// Закрываем шторку, если клик был вне меню
window.addEventListener("click", function (event) {
  if (
    !event.target.closest("#username") &&
    !event.target.closest("#dropdownMenu")
  ) {
    dropdownMenu.style.display = "none";
  }
});
