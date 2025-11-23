#!/bin/bash

echo "== [DEPLOY] Indo para pasta do projeto =="
cd ~/saas-guild

echo "== [DEPLOY] Puxando código atualizado =="
git fetch --all
git reset --hard origin/main

echo "== [DEPLOY] Subindo containers com Docker Compose =="
docker compose down
docker compose up -d --build

echo "== [DEPLOY] Finalizado com sucesso! =="
