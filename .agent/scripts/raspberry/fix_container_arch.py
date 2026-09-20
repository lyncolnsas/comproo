import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

compose_content = """version: '3.8'
services:
  mikrogestor:
    image: mikrogestor-voucher:latest
    platform: linux/arm64
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
with sftp.file('/home/hotspot/mikrogestor-prod/docker-compose.yml', 'w') as f:
    f.write(compose_content)
sftp.close()

script = """
echo "22101844" | sudo -S docker stop mikrogestor-voucher 2>/dev/null || true
echo "22101844" | sudo -S docker rm mikrogestor-voucher 2>/dev/null || true
cd /home/hotspot/mikrogestor-prod
echo "22101844" | sudo -S docker-compose up -d
sleep 4
echo "22101844" | sudo -S docker ps
"""

stdin, stdout, stderr = c.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
