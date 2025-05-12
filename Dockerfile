# Stage de build usando Debian (Bullseye), que inclui distutils
FROM node:18-bullseye-slim AS builder

# Instala pré-requisitos para compilação de módulos nativos (ex: node-sass)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3-distutils \
      python3-venv \
      build-essential \
      make \
      g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia apenas manifestos para aproveitar cache de npm install
COPY package.json package-lock.json* ionic.config.json tsconfig.json ./

# Faz o install, agora sem erro de distutils
RUN npm install --legacy-peer-deps

# Copia o restante do source e gera o build do Ionic
COPY . .
RUN npm run build

# Artefato final — apenas os arquivos estáticos dentro de /app/www
FROM scratch AS output
COPY --from=builder /app/www /www

# (Embora este estágio não seja executável, serve para extrair apenas 
#  os artefatos que o NGINX em outro container irá servir.)
