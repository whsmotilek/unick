#!/usr/bin/env bash
# Усиление безопасности сервера Unick. Идемпотентно, запуск от root на сервере:
#   bash /opt/unick/02-security.sh
set -euo pipefail
cd /opt/unick/supabase

# ---------- SSH ----------
cat > /etc/ssh/sshd_config.d/00-unick-hardening.conf <<'CONF'
# Unick: читается первым, поэтому главнее облачных настроек (50-cloud-init.conf включал пароли)
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
PermitEmptyPasswords no
ClientAliveInterval 300
ClientAliveCountMax 2
CONF
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config.d/50-cloud-init.conf 2>/dev/null || true
sshd -t && systemctl reload ssh

# ---------- Ядро: защита сети ----------
cat > /etc/sysctl.d/90-unick.conf <<'CONF'
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.log_martians = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
CONF
sysctl --system >/dev/null

# ---------- Caddy: журнал запросов на хост, наш Caddyfile ----------
mkdir -p /var/log/caddy
cp /opt/unick/Caddyfile /opt/unick/proxy/Caddyfile

# ---------- Docker: настройки Unick поверх официального compose ----------
APP_DOMAIN=$(grep -oP 'APP_DOMAIN: \K\S+' docker-compose.unick.yml)
cat > docker-compose.unick.yml <<YML
# Настройки Unick поверх официального compose Supabase
services:
  # Пулер базы наружу не публикуем: Docker открывает порты в обход ufw
  supavisor:
    ports: !reset []

  # Studio (панель базы) — только на localhost, доступ через SSH-туннель:
  #   ssh -L 3001:127.0.0.1:3001 unick   →   http://localhost:3001
  studio:
    ports:
      - "127.0.0.1:3001:3000"

  auth:
    environment:
      # Лимиты считаются по реальному IP клиента, а не по IP прокси (иначе один лимит на всех)
      GOTRUE_RATE_LIMIT_HEADER: X-Forwarded-For
      GOTRUE_PASSWORD_MIN_LENGTH: "8"
      GOTRUE_SECURITY_REFRESH_TOKEN_ROTATION_ENABLED: "true"
      GOTRUE_SECURITY_REFRESH_TOKEN_REUSE_INTERVAL: "10"
      # Не чаще 1 письма в минуту на адрес и не больше 30 писем в час с сервера
      GOTRUE_SMTP_MAX_FREQUENCY: 60s
      GOTRUE_RATE_LIMIT_EMAIL_SENT: "30"

  caddy:
    environment:
      APP_DOMAIN: $APP_DOMAIN
    volumes: !override
      - /opt/unick/proxy:/etc/caddy
      - /opt/unick/web:/srv/unick:ro
      - /var/log/caddy:/var/log/caddy
      - caddy_data:/data
      - caddy_config:/config
YML
docker compose config --quiet
docker compose up -d --force-recreate auth caddy studio >/dev/null

# ---------- fail2ban ----------
# Docker-порты обходят обычные цепочки iptables, поэтому баним в DOCKER-USER
cat > /etc/fail2ban/action.d/docker-user.conf <<'CONF'
[Definition]
actionstart = iptables -N f2b-<name> 2>/dev/null || true
              iptables -C DOCKER-USER -j f2b-<name> 2>/dev/null || iptables -I DOCKER-USER -j f2b-<name>
actionstop  = iptables -D DOCKER-USER -j f2b-<name> 2>/dev/null || true
              iptables -F f2b-<name> 2>/dev/null || true
              iptables -X f2b-<name> 2>/dev/null || true
actioncheck = iptables -n -L f2b-<name> >/dev/null 2>&1
actionban   = iptables -I f2b-<name> 1 -s <ip> -j DROP
actionunban = iptables -D f2b-<name> -s <ip> -j DROP
CONF

# Неудачный вход по паролю: POST /auth/v1/token?grant_type=password → 400
cat > /etc/fail2ban/filter.d/unick-auth.conf <<'CONF'
[Definition]
failregex = ^.*"remote_ip":"<HOST>".*"method":"POST".*"uri":"/auth/v1/token\?grant_type=password[^"]*".*"status":(400|401|422)
            ^.*"remote_ip":"<HOST>".*"method":"POST".*"uri":"/auth/v1/(signup|recover|otp)[^"]*".*"status":(400|422|429)
ignoreregex =
datepattern = "ts":{EPOCH}
CONF

# Сканеры: массовые 404 по чужим путям (wp-admin, .env, phpmyadmin и т. п.)
cat > /etc/fail2ban/filter.d/unick-scan.conf <<'CONF'
[Definition]
failregex = ^.*"remote_ip":"<HOST>".*"uri":"[^"]*(\.env|\.git/|wp-admin|wp-login|phpmyadmin|xmlrpc\.php|/cgi-bin/|\.php)[^"]*"
ignoreregex =
datepattern = "ts":{EPOCH}
CONF

cat > /etc/fail2ban/jail.d/unick.local <<'CONF'
[DEFAULT]
bantime  = 1h
findtime = 10m
# свои адреса не баним
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled  = true
maxretry = 4
bantime  = 6h

[unick-auth]
enabled  = true
filter   = unick-auth
logpath  = /var/log/caddy/access.log
backend  = auto
maxretry = 10
findtime = 10m
bantime  = 1h
action   = docker-user

[unick-scan]
enabled  = true
filter   = unick-scan
logpath  = /var/log/caddy/access.log
backend  = auto
maxretry = 5
findtime = 10m
bantime  = 24h
action   = docker-user

# Повторные нарушители — бан на неделю
[recidive]
enabled  = true
bantime  = 1w
findtime = 1d
maxretry = 3
CONF
touch /var/log/caddy/access.log
systemctl restart fail2ban
sleep 2
fail2ban-client status | tail -1
echo SECURITY_DONE
