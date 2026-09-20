import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.88.253', username='hotspot', password='22101844', timeout=10)

def run(cmd):
    print(f"\n>>> Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    code = stdout.channel.recv_exit_status()
    print(f"Exit code: {code}")
    res = (out + err).strip()
    try:
        print(res.encode('ascii', errors='replace').decode('ascii'))
    except Exception:
        pass
    return code, res

# 1. Atualizar docker-compose.yml para usar mikrogestor-base:arm64
compose_content = """services:
  mikrogestor:
    image: mikrogestor-base:arm64
    container_name: mikrogestor-voucher
    restart: always
    network_mode: "host"
    security_opt:
      - seccomp:unconfined
    working_dir: /app
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - JWT_SECRET=mikrogestor_super_secret_key_change_me_in_production
      - NODE_ENV=production
      - PORT=80
      - HOSTNAME=0.0.0.0
    volumes:
      - /home/hotspot/mikrogestor-prod:/app
    command: ["node", "server.js"]
"""

sftp = ssh.open_sftp()
with sftp.file('/home/hotspot/mikrogestor-prod/docker-compose.yml', 'w') as f:
    f.write(compose_content)

# 2. Criar script de inicializacao rapida
start_sh = """#!/bin/bash
cd /home/hotspot/mikrogestor-prod
sudo docker-compose down
sudo docker-compose up -d
sudo docker logs -f mikrogestor-voucher
"""
with sftp.file('/home/hotspot/mikrogestor-prod/start.sh', 'w') as f:
    f.write(start_sh)
sftp.close()

run('chmod +x /home/hotspot/mikrogestor-prod/start.sh')

# 3. Testar docker-compose down && docker-compose up -d
run('cd /home/hotspot/mikrogestor-prod && sudo docker-compose down && sudo docker-compose up -d')

# 4. Status
run('sudo docker ps')
run('sudo docker logs mikrogestor-voucher --tail 30')

ssh.close()
