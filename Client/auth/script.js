// script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Собираем данные из формы
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Проверяем совпадение пароля и подтверждения
        if (data.password !== data.confirm_password) {
            alert('Пароли не совпадают!');
            return;
        }

        // Отправляем запрос на сервер
        try {
            const response = await fetch('/api/user/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password,
                }),
            });

            // Обрабатываем ответ от сервера
            if (response.ok) {
                alert('Регистрация прошла успешно!');
                form.reset();
            } else {
                const result = await response.json();
                alert(`Ошибка: ${result.detail || 'Что-то пошло не так'}`);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером.');
        }
    });
});
