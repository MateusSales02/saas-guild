#!/usr/bin/env bash
set -e

echo "== [DEPLOY] Indo para pasta do projeto =="
cd "$(dirname "$0")"

echo "== [DEPLOY] Atualizando código (git fetch/reset) =="
git fetch origin
git reset --hard origin/main   # se sua branch de deploy for main; se for outra, troque aqui

echo "== [DEPLOY] Subindo containers com Docker Compose =="
docker compose -f docker-compose.yml up -d --build

echo "== [DEPLOY] Limpando imagens antigas =="
docker image prune -f

echo "== [DEPLOY] Finalizado =="
