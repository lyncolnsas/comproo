import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

# Dockerfile forçando FROM --platform=linux/arm64 node:20-alpine
dockerfile_content = """FROM --platform=linux/arm64 node:20-alpine
RUN apk add --no-cache tzdata curl openssl libc6-compat
ENV TZ=America/Belem
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0

WORKDIR /app
COPY . .

EXPOSE 80
CMD ["node", "server.js"]
"""

compose_content = """services:
  mikrogestor:
    build:
      context: .
      dockerfile: Dockerfile
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
"""

sftp = c.open_sftp()
with sftp.file('/home/hotspot/mikrogestor-prod/Dockerfile', 'w') as f:
    f.write(dockerfile_content)
with sftp.file('/home/hotspot/mikrogestor-prod/docker-compose.yml', 'w') as f:
    f.write(compose_content)
sftp.close()

script = """
cd /home/hotspot/mikrogestor-prod
echo "22101844" | sudo -S docker-compose up -d --build
sleep 5
echo "22101844" | sudo -S docker ps
"""

stdin, stdout, stderr = c.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
