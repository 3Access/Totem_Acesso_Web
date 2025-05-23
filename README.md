# Totem Web (Cliente)

Este README descreve como construir e publicar o cliente web do Totem usando Docker e NGINX.

## Pré-requisitos

* Docker instalado
* Acesso root ou permissão para copiar arquivos para `/var/www`
* NGINX instalado

---

## 1. Build da imagem de produção

No diretório raiz do projeto (onde está o `Dockerfile` do web):

```bash
docker build -t totem-web-builder .
```

## 2. Extrair os arquivos estáticos

1. Cria um container temporário (que não faz nada) a partir da imagem builder:

   ```bash
   docker create --name totem-web-build totem-web-builder /bin/true
   ```

docker create --name totem-web-build totem-web-builder /bin/true

````
2. Copia a pasta `/www` do container para o host:
   ```bash
docker cp totem-web-build:/www ./www
````

3. Remove o container temporário:

   ```bash
   ```

docker rm totem-web-build

````

## 3. Publicar via NGINX

1. Cria o diretório de publicação e ajusta permissões:
   ```bash
mkdir -p /var/www/totem
chown -R www-data:www-data /var/www/totem
````

2. Copia os arquivos estáticos para o diretório do NGINX:

   ```bash
   ```

cp -r www/\* /var/www/totem/
chown -R www-data\:www-data /var/www/totem

````
3. Crie ou edite o arquivo de configuração do site em `/etc/nginx/sites-available/totem.conf`:

   ```nginx
   server {
       listen 80;
       server_name totem.dbltecnologia.com.br;

       root /var/www/totem;
       index index.html;

       location /api {
         proxy_pass http://localhost:8085;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
       }

       location / {
         try_files $uri $uri/ /index.html;
       }
   }
````

4. Ative o site e recarregue o NGINX:

   ```bash
   ```

ln -s /etc/nginx/sites-available/totem.conf /etc/nginx/sites-enabled/totem.conf
nginx -t
systemctl reload nginx

````

## 4. (Opcional) HTTPS com Certbot

```bash
snap install certbot --classic
certbot --nginx -d totem.dbltecnologia.com.br
````

---

Agora o cliente estará disponível em `https://totem.dbltecnologia.com.br/`.
