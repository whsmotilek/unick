# Подключение бэкенда (Supabase)

Пока не заданы `SUPABASE_URL` и `SUPABASE_ANON_KEY`, сайт работает в **демо-режиме**: данные хранятся в браузере, вверху кабинета жёлтая плашка. Для пилота с реальными учениками нужен бэкенд. Это займёт 20–30 минут.

## 1. Проект Supabase

1. Зарегистрироваться на supabase.com и создать проект (New project). Регион ближе к России — Frankfurt (eu-central-1). Пароль базы сохранить в менеджере паролей.
2. **Важно про 152-ФЗ.** Персональные данные граждан РФ должны храниться в базе на территории РФ. Облачный Supabase подходит для разработки и тестов на своих данных. Перед приёмом реальных учеников есть два варианта:
   - развернуть self-hosted Supabase (Docker) в российском облаке: Yandex Cloud, Selectel, VK Cloud, Timeweb. Код приложения не меняется, меняются только URL и ключ;
   - или осознанно принять риск на время пилота, по согласованию с юристом.

## 2. Схема базы

SQL Editor → New query. Выполнить файлы **по порядку**, каждый целиком:

1. `supabase/migrations/0001_core.sql` — таблицы, права доступа (RLS), хранилище файлов, функции приглашений;
2. `supabase/migrations/0002_progress_rules.sql` — правила прогресса: засчёт ДЗ после проверки и последовательное открытие уроков.

Права доступа покрыты тестами (`supabase/tests/rls_test.sql`, 32 проверки). Запуск на локальном Postgres:

```bash
PGHOST=/tmp PGPORT=54329 PGUSER=postgres ./supabase/tests/run.sh
```

## 3. Авторизация

Authentication → URL Configuration:
- **Site URL:** `https://whsmotilek.github.io/unick/`
- **Redirect URLs:** `https://whsmotilek.github.io/unick/**` и `http://localhost:5173/unick/**`

Authentication → Providers → Email: включено, «Confirm email» — включено (рекомендуется).

**Почта.** Встроенная отправка Supabase ограничена несколькими письмами в час, для пилота этого мало. Authentication → SMTP Settings — подключить свой SMTP: Unisender Go, Yandex Cloud Postbox, Mail.ru для бизнеса и т. п. Шаблоны писем (Authentication → Email Templates) стоит перевести на русский.

## 4. Ключи в GitHub

Project Settings → API: скопировать **Project URL** и **anon public** ключ. anon-ключ публичный по своей природе: всё защищено RLS. `service_role` никуда не копировать.

В репозитории: Settings → Secrets and variables → Actions.
- **Secrets:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (и уже существующий `WAITLIST_ENDPOINT`).
- **Variables:** `LEGAL_OPERATOR` (ИП ФИО / ООО «…»), `LEGAL_REQUISITES` (ИНН, ОГРНИП), `CONTACT_EMAIL`. Они подставляются в политику обработки ПДн и условия использования.

Затем Actions → Deploy to GitHub Pages → Run workflow (или любой пуш в `main`).

## 5. Роли

- **Автор** и **ученик** выбирают роль при регистрации. У автора автоматически создаётся школа.
- **Куратор** назначается вручную (SQL Editor):
  ```sql
  update profiles set role = 'curator',
    school_id = (select school_id from profiles where email = 'author@example.com')
  where email = 'curator@example.com';
  ```
- **Администратор** платформы:
  ```sql
  update profiles set role = 'admin' where email = 'you@example.com';
  ```

## 6. Видео

- Файлы до 50 МБ можно загружать прямо в урок (лимит бесплатного тарифа Supabase).
- Большие видео — ссылкой: **Kinescope** (защита от скачивания, рекомендуется для платных курсов), VK Видео, Rutube или YouTube (ссылку легко переслать — не подходит для платного контента).

## 7. Локальная разработка

```bash
npm ci
cp .env.example .env.local   # заполнить VITE_SUPABASE_* или оставить пустыми для демо-режима
npm run dev                  # http://localhost:5173/unick/
npm run typecheck && npm test
```

## 8. Таблица предзаписи (Google Apps Script)

ID таблицы больше не хранится в репозитории. В редакторе Apps Script: Project Settings → Script Properties → `SHEET_ID` = id таблицы. Затем Deploy → Manage deployments → Edit → New version. Доступ к самой таблице должен быть «Доступ ограничен».
