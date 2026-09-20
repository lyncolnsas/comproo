import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

deploy_script = """
cd /home/hotspot/mikrogestor-prod

echo "=== 1. CRIANDO DOCKERFILE NATIVO ALPINE ==="
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

echo "=== 2. CRIANDO DOCKER-COMPOSE.YML ==="
cat << 'EOF' > docker-compose.yml
version: '3.8'
services:
  mikrogestor:
    build: .
    image: mikrogestor-voucher:latest
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

echo "=== 3. CONSTRUINDO E SUBINDO CONTAINER VIA DOCKER-COMPOSE ==="
echo "22101844" | sudo -S docker stop mikrogestor-voucher 2>/dev/null || true
echo "22101844" | sudo -S docker rm mikrogestor-voucher 2>/dev/null || true
echo "22101844" | sudo -S docker-compose up -d --build

echo "=== 4. STATUS DO CONTAINER ==="
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
