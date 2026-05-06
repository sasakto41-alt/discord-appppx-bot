# 🤖 Discord Bot + Web Dashboard

Профессиональный Discord бот с красивой веб-панелью управления.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## ✨ Возможности

### 🤖 Discord Бот
- **Модерация**: ban, kick, mute, warn, purge, jail
- **Защита**: AntiRaid, AntiSpam, AntiLink, AntiNSFW, AntiBot, AutoMod
- **Верификация**: CAPTCHA, кнопка, реакция
- **Тикеты**: создание, закрытие, панель тикетов
- **Экономика**: баланс, ежедневная награда, работа, магазин
- **Уровни**: XP система, уровни, таблица лидеров
- **Приветствие**: welcome/goodbye сообщения с embed
- **Розыгрыши**: создание, завершение, перевыбор
- **Музыка**: воспроизведение (требуется Lavalink)
- **АвтоГолос**: автоматические голосовые каналы
- **Логи**: сообщения, голос, роли, участники, инвайты
- **Бэкапы**: резервное копирование и восстановление
- **AI**: интеграция с OpenAI для умных ответов

### 🌐 Web Dashboard
- Авторизация через Discord OAuth2
- Управление всеми настройками сервера
- Настройка модерации и защиты
- Управление тикетами
- Экономика и уровни
- Логи и аналитика
- Современный UI с glassmorphism и анимациями
- Тёмная/светлая тема
- Мобильная адаптация

---

## 📁 Структура Проекта

```
discord-bot-dashboard/
├── bot/                    # Discord Бот
│   ├── src/
│   │   ├── commands/       # Slash команды
│   │   │   ├── moderation/ # ban, kick, mute, warn, purge
│   │   │   ├── economy/    # balance, daily, work
│   │   │   ├── admin/      # setup, settings
│   │   │   ├── utility/    # help, serverinfo, userinfo, ticket, giveaway
│   │   │   ├── fun/        # level, leaderboard
│   │   │   └── music/      # play
│   │   ├── events/         # Обработчики событий
│   │   ├── structures/     # BotClient
│   │   └── utils/          # Утилиты, embeds
│   ├── package.json
│   └── tsconfig.json
├── api/                    # Backend API
│   ├── src/
│   │   ├── routes/         # REST API маршруты
│   │   ├── middleware/      # Аутентификация
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── dashboard/              # Next.js Frontend
│   ├── src/
│   │   ├── app/            # Страницы (App Router)
│   │   ├── components/     # React компоненты
│   │   ├── hooks/          # Zustand stores
│   │   ├── lib/            # API клиент, утилиты
│   │   └── styles/         # Глобальные стили
│   ├── package.json
│   └── tsconfig.json
├── prisma/                 # Схема базы данных
│   └── schema.prisma
├── .env.example            # Переменные окружения
└── README.md
```

---

## 🚀 Быстрый Старт

### Требования
- Node.js 18+
- MongoDB
- Discord Bot Token

### 1. Клонирование
```bash
git clone <repo-url>
cd discord-bot-dashboard
```

### 2. Установка зависимостей
```bash
# Корневые зависимости (Prisma)
npm install

# Бот
cd bot && npm install && cd ..

# API
cd api && npm install && cd ..

# Dashboard
cd dashboard && npm install && cd ..
```

### 3. Настройка окружения
```bash
cp .env.example .env
```

Заполните `.env` файл:
- `DISCORD_TOKEN` — токен бота из [Discord Developer Portal](https://discord.com/developers/applications)
- `DISCORD_CLIENT_ID` — ID приложения
- `DISCORD_CLIENT_SECRET` — секрет приложения
- `DATABASE_URL` — URL MongoDB
- `JWT_SECRET` — секретный ключ для JWT
- `NEXTAUTH_SECRET` — секрет NextAuth

### 4. Настройка базы данных
```bash
npx prisma generate
npx prisma db push
```

### 5. Запуск
```bash
# В отдельных терминалах:

# Бот
cd bot && npm run dev

# API
cd api && npm run dev

# Dashboard
cd dashboard && npm run dev
```

Бот: подключится к Discord  
API: http://localhost:3001  
Dashboard: http://localhost:3000

---

## 🔧 Настройка Discord Бота

### Создание бота
1. Перейдите на [Discord Developer Portal](https://discord.com/developers/applications)
2. Создайте новое приложение
3. Перейдите в раздел **Bot**
4. Нажмите **Reset Token** и скопируйте токен
5. Включите **Privileged Gateway Intents**:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### OAuth2
1. В разделе **OAuth2** → **Redirects**
2. Добавьте: `http://localhost:3000/api/auth/callback`
3. Скопируйте Client ID и Client Secret

### Invite URL
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

---

## 📋 Slash Команды

| Команда | Описание |
|---------|----------|
| `/ban` | Забанить пользователя |
| `/kick` | Кикнуть пользователя |
| `/mute` | Замутить пользователя |
| `/warn` | Предупредить пользователя |
| `/purge` | Удалить сообщения |
| `/setup` | Настройка сервера |
| `/settings` | Управление функциями |
| `/balance` | Проверить баланс |
| `/daily` | Ежедневная награда |
| `/work` | Работа за монеты |
| `/level` | Проверить уровень |
| `/leaderboard` | Таблица лидеров |
| `/ticket` | Система тикетов |
| `/giveaway` | Розыгрыши |
| `/help` | Список команд |
| `/serverinfo` | Информация о сервере |
| `/userinfo` | Информация о пользователе |
| `/play` | Воспроизвести музыку |

---

## 🛠️ Технологии

### Backend
- **Node.js** + **TypeScript**
- **Discord.js** v14
- **Express.js**
- **Prisma** ORM
- **MongoDB**
- **JWT** авторизация

### Frontend
- **Next.js** 14 (App Router)
- **React** 18
- **TailwindCSS**
- **Framer Motion**
- **Zustand**
- **Radix UI**

### Дизайн
- Glassmorphism
- Neon эффекты
- Анимации
- Адаптивность
- Тёмная/светлая тема

---

## 📝 Лицензия

MIT License

---

## 🤝 Вклад

Pull requests приветствуются! Для крупных изменений, пожалуйста, сначала откройте issue.
