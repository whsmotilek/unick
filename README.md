# Unick

Платформа, где автор создаёт курс (видео, тексты, тесты, домашние задания), приглашает учеников по ссылке и ведёт обучение.

- Сайт: https://unick.online
- Сервер и деплой: [deploy/README.md](deploy/README.md)
- План и статус: [docs/ROADMAP.md](docs/ROADMAP.md)
- Подключение бэкенда: [docs/SETUP.md](docs/SETUP.md)

## Стек

React 18 + Vite + Tailwind, Supabase (PostgreSQL с RLS, Auth, Storage). Без ключей Supabase приложение работает в демо-режиме (данные в localStorage).

## Разработка

```bash
npm ci
npm run dev        # http://localhost:5173/unick/
npm run typecheck
npm test
```

Миграции базы — `supabase/migrations`, тесты прав доступа — `supabase/tests`.
