#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------
# deploy_totem.sh
#   1) Reconstrói a imagem Docker do builder
#   2) Extrai o /www gerado
#   3) Copia para /var/www/totem, ajusta permissões
#   4) Reload do Nginx
# -------------------------------------------------

# 1) Variables — ajuste se seus caminhos forem diferentes
WEB_PROJECT_DIR="/root/3access/Totem_Acesso_Web"
IMAGE_NAME="totem-web-builder"
CONTAINER_TMP="totem-web-build"
NGINX_ROOT="/var/www/totem"

echo "🚀  Iniciando deploy do Totem Web..."

# 2) Build da imagem
echo "📦  1) Reconstruindo imagem Docker: $IMAGE_NAME"
cd "$WEB_PROJECT_DIR"
docker build -t "$IMAGE_NAME" .

# 3) Cria container temporário para extrair /www
echo "📂  2) Criando container temporário: $CONTAINER_TMP"
docker create --name "$CONTAINER_TMP" "$IMAGE_NAME" /bin/true

# 4) Limpa build anterior no host (se existir)
echo "🧹  3) Limpando $WEB_PROJECT_DIR/www_old"
rm -rf "$WEB_PROJECT_DIR"/www_old
mv "$WEB_PROJECT_DIR"/www "$WEB_PROJECT_DIR"/www_old || true

# 5) Copia a pasta /www do container para o host
echo "📥  4) Extraindo /www do container para host"
docker cp "$CONTAINER_TMP":/www "$WEB_PROJECT_DIR"/www

# 6) Remove container temporário
echo "🗑️   5) Removendo container temporário"
docker rm "$CONTAINER_TMP"

# 7) Garante que o diretório do Nginx exista e esteja limpo
echo "📁  6) Preparando diretório Nginx: $NGINX_ROOT"
mkdir -p "$NGINX_ROOT"
rm -rf "$NGINX_ROOT"/*

# 8) Copia novos arquivos para o Nginx e ajusta permissões
echo "📋  7) Copiando build para $NGINX_ROOT e ajustando permissões"
cp -r "$WEB_PROJECT_DIR"/www/* "$NGINX_ROOT"/
chown -R www-data:www-data "$NGINX_ROOT"

# 9) Reload do Nginx
echo "🔄  8) Reloading Nginx"
if command -v systemctl &>/dev/null; then
  systemctl reload nginx
else
  service nginx reload
fi

echo "✅  Deploy concluído com sucesso!"
