#!/usr/bin/env bash
set -euo pipefail

echo "== [DEPLOY] Indo para pasta do projeto =="
cd "$(dirname "$0")"

echo "== [DEPLOY] Atualizando código (git fetch/reset) =="
git fetch origin
git reset --hard origin/main

echo "== [DEPLOY] Subindo containers com Docker Compose =="
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  docker compose up -d --build
elif command -v docker-compose &>/dev/null; then
  docker-compose up -d --build
else
  echo "ERRO: nem 'docker compose' nem 'docker-compose' encontrados no servidor."
  exit 1
fi

echo "== [DEPLOY] Limpando imagens antigas =="
docker image prune -f

echo "== [DEPLOY] Finalizado =="
