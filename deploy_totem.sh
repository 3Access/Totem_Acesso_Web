#!/usr/bin/env bash

# Script de implantação do Totem Web
# - Executa git pull
# - Reconstrói a imagem Docker do cliente web
# - Extrai a build estática e copia para /var/www/totem

set -euo pipefail

# Caminho do projeto Totem Web
PROJECT_DIR="/root/3access/Totem_Acesso_Web"
# Nome da imagem Docker builder
IMAGE_NAME="totem-web-builder"
# Nome do container temporário
TEMP_CONTAINER="totem-web-build"
# Diretório de destino no host onde o NGINX serve
DEST_DIR="/var/www/totem"

echo "[1/5] Atualizando repositório git em $PROJECT_DIR"
cd "$PROJECT_DIR"
git pull origin master

echo "[2/5] Construindo imagem Docker $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

# Se existir um container antigo, remove
if docker ps -a --format '{{.Names}}' | grep -q "^$TEMP_CONTAINER$"; then
  echo "[3/5] Removendo container temporário existente $TEMP_CONTAINER"
  docker rm -f "$TEMP_CONTAINER"
fi

# Cria container temporário sem executar nada
echo "[4/5] Criando container temporário $TEMP_CONTAINER"
docker create --name "$TEMP_CONTAINER" "$IMAGE_NAME" /bin/true

# Prepara diretório de destino
echo "[5/5] Limpando $DEST_DIR e copiando novos arquivos"
rm -rf "$DEST_DIR"/*
mkdir -p "$DEST_DIR"
docker cp "$TEMP_CONTAINER":/www/. "$DEST_DIR"

# Ajusta permissões
chown -R www-data:www-data "$DEST_DIR"

# Remove container temporário
docker rm "$TEMP_CONTAINER"

echo "Deploy do Totem Web concluído com sucesso!"
