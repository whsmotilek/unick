#!/usr/bin/env bash
# Базовая подготовка сервера Ubuntu 24.04: обновления, файрвол, fail2ban, swap, Docker.
# Идемпотентно: можно запускать повторно.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

timedatectl set-timezone Europe/Moscow || true
apt-get update -q
apt-get upgrade -yq
apt-get install -yq ca-certificates curl gnupg git ufw fail2ban unattended-upgrades jq openssl rsync postgresql-client

# Автоматические обновления безопасности
dpkg-reconfigure -fnoninteractive unattended-upgrades

# SSH: только ключи
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?KbdInteractiveAuthentication .*/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config
grep -q '^PasswordAuthentication no' /etc/ssh/sshd_config || echo 'PasswordAuthentication no' >> /etc/ssh/sshd_config
systemctl reload ssh || systemctl reload sshd || true

# Файрвол: только SSH и веб (Docker-порты дополнительно привязаны к 127.0.0.1)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable --now fail2ban

# Swap 2 ГБ — запас памяти для контейнеров Supabase
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -w vm.swappiness=10 >/dev/null
grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf

# Docker из официального репозитория
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -yq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
# Ротация логов контейнеров
cat > /etc/docker/daemon.json <<'JSON'
{ "log-driver": "json-file", "log-opts": { "max-size": "20m", "max-file": "3" } }
JSON
systemctl restart docker
docker --version
docker compose version
echo BASE_DONE
