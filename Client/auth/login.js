document.addEventListener("DOMContentLoaded", () => {
  // Получаем форму авторизации
  const loginForm = document.querySelector("#login-form");

  // Проверяем, что форма существует
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Функция для обработки отправки формы авторизации
  function handleLogin(event) {
    event.preventDefault(); // Отменяем стандартное поведение формы

    // Собираем данные из формы
    const data = {
      username: document.querySelector("#login-username").value,
      password: document.querySelector("#login-password").value,
    };

    // Отправляем запрос на сервер
    fetch("http://localhost:8000/api/token/", {
      // Замените URL на ваш
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка авторизации");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Login success:", data);
        // Сохраняем токен в localStorage или cookies
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        // Перенаправляем пользователя на другую страницу
        window.location.href = "../dashboard/index.html"; 
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("Ошибка: неверные имя пользователя или пароль");
      });
  }
});
