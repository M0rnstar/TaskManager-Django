const token = localStorage.getItem("accessToken");
if (!token) {
  // Если токена нет, перенаправляем на страницу авторизации
  window.location.href = "../auth/login.html";
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

submitBtn.onclick = function () {
  const title = document.getElementById("modalTitle").value;
  const content = document.getElementById("modalContent").value;
  const deadline = document.getElementById("modalDeadline").value; // Получаем дедлайн

  if (editingCard) {
    // Обновляем title, content и deadline
    editingCard.querySelector(".card__title").textContent = title;
    editingCard.querySelector(".card__deadline").textContent = `До ${deadline}`;
    editingCard.dataset.title = title;
    editingCard.dataset.content = content;
    editingCard.dataset.deadline = deadline; // Обновляем dataset дедлайна
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

    newCard.innerHTML = `
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

    // Добавляем карточку в контейнер
    cardsContainer.appendChild(newCard);
    const closeButton = newCard.querySelector(".card__close");

    // Обработка события клика на крестик (если нужно удаление)
    closeButton.addEventListener("click", function () {
      newCard.remove(); // Удаляем карточку при нажатии на крестик
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

//Закрываем шторку, если клик был вне меню
window.addEventListener("click", function (event) {
  if (
    !event.target.closest("#username") &&
    !event.target.closest("#dropdownMenu")
  ) {
    dropdownMenu.style.display = "none";
  }
});

document.querySelector(".logout-button").addEventListener("click", () => {
  localStorage.clear(); // Удаляем токен и данные пользователя
  window.location.href = "../auth/login.html"; // Перенаправляем на страницу входа
});
