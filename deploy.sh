#!/usr/bin/env bash
set -euo pipefail

echo "== [DEPLOY] Indo para pasta do projeto =="
cd "$(dirname "$0")"

echo "== [DEPLOY] Atualizando código (git fetch/reset) =="
git fetch origin
git reset --hard origin/main

echo "== [DEPLOY] Subindo containers com Docker Compose =="

# Usa APENAS o docker-compose clássico neste servidor
if command -v docker-compose &>/dev/null; then
  docker-compose up -d --build
else
  echo "ERRO: 'docker-compose' não encontrado no servidor."
  exit 1
fi

echo "== [DEPLOY] Limpando imagens antigas =="
docker image prune -f

echo "== [DEPLOY] Finalizado =="
