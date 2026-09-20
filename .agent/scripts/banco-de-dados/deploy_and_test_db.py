import paramiko
import time

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

# 1. Parar container antigo
run('cd /home/hotspot/mikrogestor-prod && sudo docker-compose down')

# 2. Escrever novo Dockerfile baseado em mikrogestor-base:arm64
dockerfile_content = """FROM mikrogestor-base:arm64
ENV TZ=America/Belem
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-arm64-openssl-3.0.x.so.node

WORKDIR /app
COPY . .

EXPOSE 80
CMD ["node", "server.js"]
"""

sftp = ssh.open_sftp()
with sftp.file('/home/hotspot/mikrogestor-prod/Dockerfile', 'w') as f:
    f.write(dockerfile_content)

# 3. docker-compose.yml
compose_content = """services:
  mikrogestor:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mikrogestor-voucher
    restart: always
    network_mode: "host"
    security_opt:
      - seccomp:unconfined
    environment:
      - DATABASE_URL=file:./prisma/dev.db
      - JWT_SECRET=mikrogestor_super_secret_key_change_me_in_production
      - NODE_ENV=production
      - PORT=80
      - HOSTNAME=0.0.0.0
      - PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-arm64-openssl-3.0.x.so.node
    volumes:
      - ./prisma:/app/prisma
      - ./public/uploads:/app/public/uploads
      - ./public/portal:/app/public/portal
"""

with sftp.file('/home/hotspot/mikrogestor-prod/docker-compose.yml', 'w') as f:
    f.write(compose_content)
sftp.close()

# 4. Build e Up
run('cd /home/hotspot/mikrogestor-prod && sudo docker-compose build --no-cache')
run('cd /home/hotspot/mikrogestor-prod && sudo docker-compose up -d')

print("Aguardando 10 segundos para inicializacao do Next.js...")
time.sleep(10)

# 5. Inspecionar logs
run('sudo docker logs mikrogestor-voucher --tail 40')

# 6. Testar chamada HTTP local
run('curl -I http://127.0.0.1:80')

# 7. Testar query real do prisma de dentro do container
run('sudo docker exec mikrogestor-voucher node -e "const { PrismaClient } = require(\'@prisma/client\'); const p = new PrismaClient(); p.user.findMany().then(u => { console.log(\'PRISMA DB TEST SUCCESS! Users found:\', u.length); process.exit(0); }).catch(e => { console.error(\'PRISMA DB ERROR:\', e); process.exit(1); });"')

ssh.close()
