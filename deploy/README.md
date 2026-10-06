# Сервер Unick (VPS)

| | |
|---|---|
| Хостинг | Beget VPS, Санкт-Петербург, Ubuntu 24.04, 4 ядра / 6 ГБ / 80 ГБ NVMe |
| IP | `159.194.245.212` |
| Платформа | https://unick.online (www и старый адрес unick.159-194-245-212.sslip.io перенаправляют сюда) |
| API Supabase | https://api.unick.online |
| Studio (админка БД) | только через SSH-туннель, см. раздел «Studio» |

Домен `unick.online` (Beget). DNS: A-записи `@`, `www`, `api` → `159.194.245.212`.

## Что где лежит

```
/opt/unick/
  supabase/        официальный self-hosted Supabase (v0.8.2), .env с секретами (chmod 600)
    docker-compose.unick.yml   наши настройки: закрытый пулер БД, Caddy раздаёт сайт
  proxy/Caddyfile  HTTPS (Let's Encrypt автоматически): сайт + API + Studio
  web/             собранный фронтенд (сюда выкладывает GitHub Actions)
  backups/         ежедневные бэкапы (03:30), хранятся 14 дней
  backup.sh
```

**Безопасность:**
- вход по SSH только по ключу, пароли отключены;
- `ufw` пропускает только порты 22, 80 и 443, работает `fail2ban`;
- порты базы наружу не публикуются;
- сайт выкладывает отдельный пользователь `deploy`, у которого есть доступ только к `/opt/unick/web`;
- обновления безопасности ставятся автоматически.

## Ключи

- `~/.ssh/unick_vps` (на Mac разработчика) — вход `root`. Псевдоним в `~/.ssh/config`: `ssh unick`.
- `~/.ssh/unick_ci` — вход `deploy` для GitHub Actions (секрет `VPS_SSH_KEY`).

## Деплой

Каждый пуш в `main` запускает `.github/workflows/deploy-vps.yml`: проверка типов, тесты, сборка с `VITE_BASE=/` и rsync в `/opt/unick/web`. Ручной запуск: Actions → Deploy to VPS → Run workflow.

## Миграции базы

Новые файлы из `supabase/migrations/` применяются по порядку:

```bash
scp supabase/migrations/0004_xxx.sql unick:/opt/unick/
ssh unick 'docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < /opt/unick/0004_xxx.sql'
```

Перед этим прогнать тесты прав доступа локально (`supabase/tests/run.sh`) и смоук-тест против сервера:

```bash
SUPABASE_URL=https://api.unick.online SUPABASE_ANON_KEY=<anon> node scripts/smoke.mjs
```

Смоук создаёт пользователей `*@smoke.unick.test` — потом удалить:
```sql
delete from public.schools where owner_id in (select id from auth.users where email like '%@smoke.unick.test');
delete from auth.users where email like '%@smoke.unick.test';
```

## Управление Supabase

```bash
ssh unick
cd /opt/unick/supabase
sh run.sh status          # состояние контейнеров
sh run.sh logs auth       # логи сервиса
sh run.sh restart         # перезапуск
```

## Роли

Администратор платформы (страница `/admin`) — зарегистрироваться на сайте, затем:
```bash
ssh unick "docker exec supabase-db psql -U postgres -c \"update profiles set role='admin' where email='you@example.com'\""
```

## Ручной сброс пароля (пока нет почты)

Пользователь забыл пароль, а письмо не уйдёт: задать временный пароль и сообщить его пользователю лично,
попросить сменить в профиле.
```bash
ssh unick "docker exec supabase-db psql -U postgres -c \"update auth.users set encrypted_password = crypt('Временный-пароль-2026', gen_salt('bf')) where email = 'user@example.com'\""
```

## Studio (панель базы данных)

Наружу не публикуется. Открыть через SSH-туннель:
```bash
ssh -L 3001:127.0.0.1:3001 unick
```
и зайти на http://localhost:3001.

## Безопасность (deploy/02-security.sh)

- SSH: только ключи, `PermitRootLogin prohibit-password`, `MaxAuthTries 3`. Облачный `50-cloud-init.conf` включал пароли — перекрыт `00-unick-hardening.conf`.
- fail2ban (`fail2ban-client status <jail>`):
  - `sshd` — 4 попытки, бан на 6 часов;
  - `unick-auth` — 10 неудачных входов или регистраций за 10 минут, бан на час;
  - `unick-scan` — сканеры (`.env`, `wp-admin`, `.php`), бан на сутки;
  - `recidive` — повторные нарушители, бан на неделю.

  Баны ставятся в цепочку `DOCKER-USER`, потому что порты Docker обходят `ufw`.
- Caddy: HSTS, CSP, Permissions-Policy, лимит тела запроса (API 1 МБ, загрузки 55 МБ), JSON-журнал `/var/log/caddy/access.log`.
- Авторизация: лимиты по реальному IP клиента (`X-Forwarded-For`), пароль от 8 символов, ротация refresh-токенов.
- Хранилище: лимиты по бакетам, загрузка HTML/SVG/JS запрещена (миграция 0005).
- Разбанить IP: `fail2ban-client set unick-auth unbanip <ip>`.

## Почта (сделать до массового приглашения учеников)

Сейчас SMTP не подключён, поэтому:
- регистрация подтверждается автоматически (`ENABLE_EMAIL_AUTOCONFIRM=true`);
- письма о сбросе пароля не уходят.

Чтобы включить почту:
1. Получить SMTP: почта на домене в Beget, Яндекс 360, Unisender Go и т. п.
2. В `/opt/unick/supabase/.env` заполнить `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL` и поставить `ENABLE_EMAIL_AUTOCONFIRM=false`.
3. Выполнить `sh run.sh recreate auth`.

## Смена домена

Скрипт `deploy/switch-domain.sh <домен>` (на сервере) делает пункт 2 автоматически.

1. DNS: A-записи `@` и `api` на `159.194.245.212`.
2. На сервере в `/opt/unick/supabase/.env` заменить `unick.159-194-245-212.sslip.io` на домен в `SITE_URL`, `SUPABASE_PUBLIC_URL`, `API_EXTERNAL_URL`, `PROXY_DOMAIN`, `ADDITIONAL_REDIRECT_URLS`. В `docker-compose.unick.yml` поменять `APP_DOMAIN`. Затем выполнить `sh run.sh recreate`.
3. В GitHub: секрет `SUPABASE_URL` → `https://api.<домен>`, переменная `APP_URL` → `https://<домен>`. Перезапустить деплой.
