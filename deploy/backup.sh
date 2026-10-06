#!/usr/bin/env bash
# Ежедневный бэкап Unick: дамп базы (сжатый) + файлы хранилища. Хранится 14 дней.
# Установка (cron от root): 30 3 * * * /opt/unick/backup.sh >> /var/log/unick-backup.log 2>&1
set -euo pipefail
DIR=/opt/unick/backups
STAMP=$(date +%F_%H%M)
mkdir -p "$DIR"
chmod 700 "$DIR"

docker exec supabase-db pg_dumpall -U postgres --clean --if-exists | gzip -9 > "$DIR/db_$STAMP.sql.gz"
tar -czf "$DIR/storage_$STAMP.tar.gz" -C /opt/unick/supabase/volumes storage

find "$DIR" -type f -mtime +14 -delete
echo "$(date -Is) backup ok: $(du -sh "$DIR" | cut -f1)"
