#!/usr/bin/env bash
# Уборка на сервере (от root):
#  1) тестовые пользователи смоук-тестов (*@smoke.unick.test) и их школы, уведомления о них;
#  2) файлы хранилища курсов, которых больше нет в базе (после удаления курса или тестов).
# Запуск: bash /opt/unick/cleanup.sh            — выполнить
#         DRY_RUN=1 bash /opt/unick/cleanup.sh  — только показать
set -euo pipefail
PSQL="docker exec -i supabase-db psql -U postgres -d postgres -tA -v ON_ERROR_STOP=1"
ENV=/opt/unick/supabase/.env
SERVICE_KEY=$(grep '^SERVICE_ROLE_KEY=' "$ENV" | cut -d= -f2-)
API=$(grep '^SUPABASE_PUBLIC_URL=' "$ENV" | cut -d= -f2-)

if [ "${DRY_RUN:-0}" = 1 ]; then
  echo "Тестовых пользователей: $($PSQL -c "select count(*) from auth.users where email like '%@smoke.unick.test'")"
else
  $PSQL <<'SQL'
delete from public.notifications where body like '%@smoke.unick.test%';
delete from public.schools where owner_id in (select id from auth.users where email like '%@smoke.unick.test');
delete from auth.users where email like '%@smoke.unick.test';
SQL
fi

# Папки хранилища называются по id курса; курса нет в базе — файлы лишние
orphans=$($PSQL -c "
  select distinct bucket_id || '/' || split_part(name, '/', 1) from storage.objects o
  where bucket_id in ('covers', 'lesson-files', 'homework-files')
    and not exists (select 1 from public.courses c where c.id::text = split_part(o.name, '/', 1))")
for item in $orphans; do
  bucket=${item%%/*}; course=${item#*/}
  [[ "$course" =~ ^[0-9a-f-]{36}$ ]] || continue
  echo "лишние файлы: $bucket/$course"
  if [ "${DRY_RUN:-0}" != 1 ]; then
    # Прямое удаление из storage.objects запрещено — удаляем через Storage API сервисным ключом
    names=$($PSQL -c "select coalesce(json_agg(name), '[]') from storage.objects where bucket_id = '$bucket' and name like '$course/%'")
    curl -fsS -X DELETE "$API/storage/v1/object/$bucket" \
      -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" \
      -d "{\"prefixes\": $names}" >/dev/null
  fi
done
echo "CLEANUP_DONE"
