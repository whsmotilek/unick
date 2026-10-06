#!/usr/bin/env bash
# Переключение Unick на свой домен. Запуск на сервере от root:
#   bash switch-domain.sh unick.online
# Требование: A-записи <домен>, www.<домен> и api.<домен> указывают на этот сервер.
set -euo pipefail
DOMAIN=${1:?Укажите домен, например unick.online}
APP=$DOMAIN
API=api.$DOMAIN
OLD_APP=unick.159-194-245-212.sslip.io
OLD_API=api.unick.159-194-245-212.sslip.io
cd /opt/unick/supabase

for h in "$APP" "www.$APP" "$API"; do
  ip=$(getent hosts "$h" | awk '{print $1}' | head -1)
  [ "$ip" = "$(curl -fsS4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')" ] || echo "ВНИМАНИЕ: $h -> ${ip:-нет записи}"
done

setv(){ if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=$2|" .env; else echo "$1=$2" >> .env; fi; }
setv SUPABASE_PUBLIC_URL "https://$API"
setv API_EXTERNAL_URL "https://$API/auth/v1"
setv SITE_URL "https://$APP"
setv ADDITIONAL_REDIRECT_URLS "https://$APP/**,https://www.$APP/**,https://$OLD_APP/**,https://whsmotilek.github.io/unick/**,http://localhost:5173/unick/**"
setv PROXY_DOMAIN "$API"
sed -i "s|APP_DOMAIN: .*|APP_DOMAIN: $APP|" docker-compose.unick.yml

# Caddyfile с переменными {$APP_DOMAIN}/{$PROXY_DOMAIN} — из репозитория (deploy/Caddyfile)
cp /opt/unick/Caddyfile /opt/unick/proxy/Caddyfile

docker compose up -d --force-recreate auth caddy studio storage >/dev/null
sleep 20
curl -fsS -o /dev/null -w "app  https://$APP -> %{http_code}\n" "https://$APP/" || true
curl -sS -o /dev/null -w "api  https://$API -> %{http_code} (401 без ключа — норма)\n" "https://$API/auth/v1/health" || true
echo SWITCH_DONE
