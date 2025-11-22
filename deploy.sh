#!/usr/bin/env bash
set -euo pipefail

echo "== [DEPLOY] Indo para pasta do projeto =="
cd "$(dirname "$0")"

echo "== [DEPLOY] Atualizando código (git fetch/reset) =="
git fetch origin
git reset --hard origin/main

echo "== [DEPLOY] Subindo containers com Docker Compose =="

# Verifica se o compose v2 está disponível
if docker compose version >/dev/null 2>&1; then
    echo "== [DEPLOY] Usando Docker Compose v2 =="
    docker compose up -d --build
else
    echo "ERRO: 'docker compose' não encontrado no servidor."
    exit 1
fi

echo "== [DEPLOY] Limpando imagens antigas =="
docker image prune -f

echo "== [DEPLOY] Finalizado =="
