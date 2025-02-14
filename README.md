# Task Manager

## Описание

Task Manager — это веб-приложение для управления задачами, разработанное на Django и Django REST Framework. Позволяет создавать, редактировать, удалять задачи, устанавливать дедлайны и фильтровать их по статусу.

## Функционал

- Создание задач
- Редактирование задач
- Удаление задач
- Установка дедлайна
- Фильтрация задач по статусу: активные, завершённые, просроченные
- Авторизация и защита данных

## Будущие улучшения

- Добавление настроек профиля (изменение пароля, ника, почты)
- Возможность назначать задачи другим пользователям
- Возможность принимать задачи для выполнения

## Установка (локальная)

### 1. Клонирование репозитория

```bash
git clone https://github.com/M0rnstar/TaskManager-Django.git
cd TaskManager-Django
```

### 2. Создание и активация виртуального окружения

```bash
python -m venv venv
source venv/bin/activate  # Для Linux и macOS
venv\Scripts\activate    # Для Windows
```

### 3. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 4. Настройка базы данных и миграции

Проект использует PostgreSQL. Необходимо создать базу данных и указать параметры подключения в файле `.env`. Пример конфигурации находится в `.env.example`.

```bash
python manage.py migrate
```

### 5. Запуск сервера

```bash
python manage.py runserver
```

Приложение будет доступно по адресу: [http://127.0.0.1:8000](http://127.0.0.1:8000/)

## API эндпоинты

- `POST /api/user/register/` — регистрация пользователя
- `POST /api/token/` — получение JWT-токена
- `POST /api/token/refresh/` — обновление JWT-токена
- `GET /api/tasks/` — список задач
- `POST /api/tasks/create` — создание задачи
- `DELETE /api/tasks/<int:pk>/delete` — удаление задачи
- `PUT /api/tasks/<int:pk>/update` — обновление задачи
- `GET /api/user/profile` — профиль пользователя

## Безопасность

- Используется аутентификация через JWT-токены
- Доступ к API защищён

## Тестирование

Тесты пока отсутствуют, но планируется их добавление.

## Технологии

- Python 3
- Django
- Django REST Framework
- PostgreSQL
- HTML/CSS
- JavaScript

## Авторы

Разработано: M0rnstar

Если есть вопросы, пишите: [morningstar4092@gmail.com](mailto:morningstar4092@gmail.com)