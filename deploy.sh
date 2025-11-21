#!/usr/bin/env bash
set -e

echo "== [DEPLOY] Indo para pasta do projeto =="
cd "$(dirname "$0")"

echo "== [DEPLOY] Atualizando código (git pull) =="
git fetch origin
git reset --hard origin/main

echo "== [DEPLOY] Subindo containers =="
docker compose -f docker-compose.yml up -d --build

echo "== [DEPLOY] Limpando imagens antigas =="
docker image prune -f

echo "== [DEPLOY] Finalizado =="
