import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

setup_script = """
echo "=== 1. EXTRAINDO PROJETO MIKROGESTOR ==="
cd /home/hotspot
rm -rf mikrogestor
mkdir -p mikrogestor
unzip -q mikrogestor_deploy.zip -d mikrogestor
cd /home/hotspot/mikrogestor

echo "=== 2. CRIANDO DOCKERFILE NATIVO OTIMIZADO ARM64 ==="
cat << 'EOF' > Dockerfile
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat tzdata curl
ENV TZ=America/Belem
ENV NODE_ENV=production
ENV PORT=80

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install --omit=dev --no-audit

RUN npx prisma generate

COPY . .

EXPOSE 80
CMD ["npm", "run", "start"]
EOF

echo "=== 3. CRIANDO DOCKER-COMPOSE.YML COM AUTO-RESTART ==="
cat << 'EOF' > docker-compose.yml
services:
  mikrogestor:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mikrogestor-voucher
    restart: always
    network_mode: "host"
    environment:
      - DATABASE_URL=file:./dev.db
      - JWT_SECRET=mikrogestor_super_secret_key_change_me_in_production
      - NODE_ENV=production
      - PORT=80
    volumes:
      - ./prisma/dev.db:/app/prisma/dev.db
      - ./uploads:/app/uploads
      - ./public/portal:/app/public/portal
EOF

echo "=== 4. CONSTRUINDO IMAGEM DOCKER NATIVA (ARM64) ==="
echo "22101844" | sudo -S docker compose down 2>/dev/null || true
echo "22101844" | sudo -S docker compose build --no-cache

echo "=== 5. INICIALIZANDO BANCO E SERVICO MIKROGESTOR NA PORTA 80 ==="
echo "22101844" | sudo -S docker compose up -d

echo "=== 6. VERIFICANDO STATUS DO CONTAINER E PORTA 80 ==="
sleep 5
echo "22101844" | sudo -S docker ps
curl -I http://127.0.0.1 2>&1 | head -n 5
"""

stdin, stdout, stderr = c.exec_command(setup_script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
