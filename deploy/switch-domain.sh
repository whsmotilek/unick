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

cat > /opt/unick/proxy/Caddyfile <<CADDY
# Платформа (SPA)
{\$APP_DOMAIN} {
    root * /srv/unick
    encode zstd gzip
    @assets path /assets/*
    header @assets Cache-Control "public, max-age=31536000, immutable"
    header {
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        X-Frame-Options SAMEORIGIN
        Strict-Transport-Security "max-age=31536000"
        -server
    }
    try_files {path} /index.html
    file_server
}

# www и старый временный адрес — постоянный редирект на основной домен
www.{\$APP_DOMAIN}, $OLD_APP {
    redir https://{\$APP_DOMAIN}{uri} permanent
}

# API Supabase + Studio (Studio под паролем). Старый API-адрес оставлен для уже открытых вкладок.
{\$PROXY_DOMAIN}, $OLD_API {
    @supabase_api path /auth/v1/* /rest/v1/* /graphql/v1 /realtime/v1/* /storage/v1/* /functions/v1/* /sso/* /.well-known/oauth-authorization-server

    handle @supabase_api {
        reverse_proxy api-gw:8000
    }

    handle {
        basic_auth {
            {\$PROXY_AUTH_USERNAME} {\$PROXY_AUTH_PASSWORD}
        }
        reverse_proxy studio:3000
    }

    header -server
}
CADDY

docker compose up -d --force-recreate auth caddy studio storage >/dev/null
sleep 20
curl -fsS -o /dev/null -w "app  https://$APP -> %{http_code}\n" "https://$APP/" || true
curl -sS -o /dev/null -w "api  https://$API -> %{http_code} (401 без ключа — норма)\n" "https://$API/auth/v1/health" || true
echo SWITCH_DONE
