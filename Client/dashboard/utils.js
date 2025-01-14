/************************************************
 * utils.js
 * Скрипт для фильтрации карточек
 * ("В процессе", "Просроченные", "Завершённые")
 * + моментальное обновление при изменении чекбокса.
 ************************************************/

console.log("utils.js подключен");

/**
 * Храним название текущего фильтра.
 * Может быть "inProcess", "overdue", "completed" или null (если не выбрано).
 */
let currentFilter = null;

/**
 * Парсим строку "dd.mm.yyyy" → объект Date, иначе возвращаем null.
 */
function parseDMY(dateStr) {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS: 0–11
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * Проверяем, просрочена ли задача (deadline < now).
 */
function isOverdue(card) {
  const deadlineStr = card.dataset.deadline;
  if (!deadlineStr) return false; // если дедлайна нет — не просрочена

  const deadlineDate = parseDMY(deadlineStr);
  if (!deadlineDate) return false; // не смогли распарсить → считаем, что не просрочена

  const now = new Date();
  return deadlineDate < now;
}

/**
 * Проверяем, завершена ли задача (чекбокс).
 */
function isCompleted(card) {
  const checkbox = card.querySelector(".checkbox");
  return checkbox && checkbox.checked;
}

/**
 * "В процессе":
 *  - Дедлайн не прошёл (не просрочено)
 *  - Чекбокс не установлен (не завершено)
 */
function filterInProcess() {
  currentFilter = "inProcess";
  const allCards = document.querySelectorAll(".card");
  if (allCards.length === 0) {
    console.log("No cards found – nothing to filter (inProcess).");
    return;
  }

  allCards.forEach((card) => {
    const overdue = isOverdue(card);
    const completed = isCompleted(card);

    if (!overdue && !completed) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * "Просроченные":
 *  - Дедлайн уже прошёл (deadline < now)
 *  (если хотите исключать завершённые, добавьте !isCompleted(card))
 */
function filterOverdue() {
  currentFilter = "overdue";
  const allCards = document.querySelectorAll(".card");
  if (allCards.length === 0) {
    console.log("No cards found – nothing to filter (overdue).");
    return;
  }

  allCards.forEach((card) => {
    const overdue = isOverdue(card);
    if (overdue) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * "Завершённые":
 *  - Чекбокс установлен
 */
function filterCompleted() {
  currentFilter = "completed";
  const allCards = document.querySelectorAll(".card");
  if (allCards.length === 0) {
    console.log("No cards found – nothing to filter (completed).");
    return;
  }

  allCards.forEach((card) => {
    const completed = isCompleted(card);
    if (completed) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * Повторно применяем текущий фильтр (если он установлен),
 * чтобы карточки мгновенно обновлялись при клике на чекбокс.
 */
function rerunActiveFilter() {
  if (currentFilter === "inProcess") {
    filterInProcess();
  } else if (currentFilter === "overdue") {
    filterOverdue();
  } else if (currentFilter === "completed") {
    filterCompleted();
  } else {
    // Если нет активного фильтра, ничего не делаем
    // Можно написать логику, чтобы показывать все карточки
  }
}

// Привязываем фильтры к соответствующим вкладкам
document.getElementById("inProcessItem").addEventListener("click", filterInProcess);
document.getElementById("overdueItem").addEventListener("click", filterOverdue);
document.getElementById("completedItem").addEventListener("click", filterCompleted);
