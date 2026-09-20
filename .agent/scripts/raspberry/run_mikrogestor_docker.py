import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

deploy_script = """
echo "=== 1. EXTRAINDO BUILD STANDALONE ==="
cd /home/hotspot
rm -rf mikrogestor-prod
mkdir -p mikrogestor-prod
unzip -q mikrogestor_standalone.zip -d mikrogestor-prod
cd /home/hotspot/mikrogestor-prod

echo "=== 2. CRIANDO DOCKERFILE NATIVO LEVE COM RUNTIME ALPINE ==="
cat << 'EOF' > Dockerfile
FROM alpine:3.19
RUN apk add --no-cache nodejs tzdata curl openssl libc6-compat
ENV TZ=America/Belem
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0

WORKDIR /app
COPY . .

EXPOSE 80
CMD ["node", "server.js"]
EOF

echo "=== 3. CRIANDO DOCKER-COMPOSE.YML COM AUTO-INICIALIZACAO NO BOOT ==="
cat << 'EOF' > docker-compose.yml
services:
  mikrogestor:
    build: .
    container_name: mikrogestor-voucher
    restart: always
    network_mode: "host"
    environment:
      - DATABASE_URL=file:./prisma/dev.db
      - JWT_SECRET=mikrogestor_super_secret_key_change_me_in_production
      - NODE_ENV=production
      - PORT=80
      - HOSTNAME=0.0.0.0
    volumes:
      - ./prisma:/app/prisma
      - ./public/uploads:/app/public/uploads
      - ./public/portal:/app/public/portal
EOF

echo "=== 4. EXECUTANDO DOCKER-COMPOSE BUILD E UP ==="
echo "22101844" | sudo -S docker stop mikrogestor-voucher 2>/dev/null || true
echo "22101844" | sudo -S docker rm mikrogestor-voucher 2>/dev/null || true
echo "22101844" | sudo -S docker-compose up -d --build

echo "=== 5. AGUARDANDO SUBIDA DO SERVICO NA PORTA 80 ==="
sleep 8
echo "22101844" | sudo -S docker ps
echo "--- LOGS DO MIKROGESTOR ---"
echo "22101844" | sudo -S docker logs mikrogestor-voucher --tail 25
echo "--- TESTANDO RESPOSTA HTTP PORTA 80 ---"
curl -I http://127.0.0.1 2>&1 | head -n 10
"""

stdin, stdout, stderr = c.exec_command(deploy_script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
