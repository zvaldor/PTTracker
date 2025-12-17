# GitHub Pages Deployment Guide

## Инструкция по развертыванию на GitHub Pages

### Шаг 1: Настройка репозитория

1. **Включите GitHub Pages:**
   - Перейдите в Settings → Pages
   - Source: выберите "GitHub Actions" (не "Deploy from a branch")
   - Нажмите Save

2. **Настройте секреты (опционально):**
   - Settings → Secrets and variables → Actions
   - Добавьте `NEXT_PUBLIC_API_URL` с адресом вашего API
   - Например: `https://your-api.railway.app`
   - Если не добавите, будет использоваться `https://your-api.railway.app` по умолчанию

### Шаг 2: Настройте базовый путь

Откройте `apps/web/next.config.js` и измените:

```javascript
const repoName = 'PTTracker'; // Замените на имя вашего репозитория
```

**Если используете custom domain или user/organization pages:**
```javascript
// Закомментируйте эти строки:
// basePath: isProd ? `/${repoName}` : '',
// assetPrefix: isProd ? `/${repoName}/` : '',
```

### Шаг 3: Разверните бэкенд на Railway

GitHub Pages - это статический хостинг, поэтому бэкенд должен быть развернут отдельно.

1. **Следуйте инструкциям из DEPLOY.md** для развертывания API на Railway
2. **Получите URL вашего API** (например: `https://pttracker-api.railway.app`)
3. **Добавьте его в GitHub Secrets** как `NEXT_PUBLIC_API_URL`

### Шаг 4: Деплой

Два способа запустить деплой:

**Автоматический (при коммите):**
```bash
git add .
git commit -m "Configure GitHub Pages"
git push origin main
```

**Ручной:**
1. Перейдите в Actions → Deploy to GitHub Pages
2. Нажмите "Run workflow"
3. Выберите ветку
4. Нажмите "Run workflow"

### Шаг 5: Проверка

После успешного деплоя:
- Сайт будет доступен по адресу: `https://username.github.io/PTTracker/`
- Проверьте вкладку Actions для статуса сборки
- Перейдите по URL и протестируйте приложение

### Важные замечания

#### 1. URL API в production

Убедитесь, что frontend знает адрес вашего API. Проверьте в консоли браузера:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

#### 2. CORS настройки

В Railway API добавьте URL GitHub Pages в CORS:
```bash
FRONTEND_URL=https://username.github.io
```

Или для разработки и production:
```bash
FRONTEND_URL=https://username.github.io,http://localhost:3000
```

#### 3. Использование custom domain

Если хотите использовать свой домен:

1. **В GitHub:**
   - Settings → Pages → Custom domain
   - Введите ваш домен (например: `pttracker.com`)
   - Сохраните

2. **В DNS:**
   Добавьте записи:
   ```
   A record:
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

3. **В next.config.js:**
   Закомментируйте basePath и assetPrefix

4. **В Railway:**
   Обновите `FRONTEND_URL` на ваш домен

#### 4. Отладка проблем

**Сборка падает:**
- Проверьте логи в Actions
- Убедитесь, что все зависимости установлены
- Проверьте синтаксис в `next.config.js`

**404 ошибки на ресурсах:**
- Проверьте `basePath` в `next.config.js`
- Убедитесь, что `repoName` совпадает с именем репозитория

**API не доступен:**
- Проверьте `NEXT_PUBLIC_API_URL` в GitHub Secrets
- Убедитесь, что Railway API запущен
- Проверьте CORS настройки в Railway

**Страницы не загружаются:**
- Проверьте, что используется `output: 'export'`
- Убедитесь, что нет серверных API routes
- Проверьте console в браузере на ошибки

### Альтернатива: Vercel (рекомендуется)

GitHub Pages хорош для статических сайтов, но Vercel лучше подходит для Next.js:

**Преимущества Vercel:**
- ✅ Автоматическая оптимизация изображений
- ✅ Поддержка API routes (если нужно)
- ✅ Автоматический SSL
- ✅ Preview deployments для PR
- ✅ Нет нужды в статическом экспорте

**Деплой на Vercel:**
1. Импортируйте репозиторий
2. Root: `apps/web`
3. Build command: `cd ../.. && pnpm install && cd apps/web && pnpm build`
4. Добавьте `NEXT_PUBLIC_API_URL` в переменные окружения
5. Деплой!

### Структура деплоя

```
┌─────────────────┐
│  GitHub Pages   │ ← Frontend (статика)
│  username.github│
│  .io/PTTracker  │
└────────┬────────┘
         │ API calls
         ↓
┌─────────────────┐
│  Railway API    │ ← Backend (NestJS)
│  your-api.rail- │
│  way.app        │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL DB  │ ← Database
└─────────────────┘
```

### Локальное тестирование production build

```bash
cd apps/web

# Собрать production build
pnpm build

# Проверить содержимое out/
ls -la out/

# Запустить локальный сервер
npx serve out
```

Откройте http://localhost:3000/PTTracker/ (с базовым путем)

### Обновление приложения

После изменений в коде:

```bash
git add .
git commit -m "Update application"
git push origin main
```

GitHub Actions автоматически пересоберет и задеплоит.

### Откат к предыдущей версии

1. Перейдите в Actions
2. Найдите успешный деплой
3. Нажмите "Re-run all jobs"

---

Готово! Ваше приложение теперь доступно на GitHub Pages 🎉
