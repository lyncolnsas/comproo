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

# 1. Parar e remover container antigo
run('sudo docker rm -f mikrogestor-voucher || true')

# 2. Iniciar container diretamente com a imagem mikrogestor-base:arm64 montando /home/hotspot/mikrogestor-prod
docker_cmd = (
    "sudo docker run -d "
    "--name mikrogestor-voucher "
    "--restart always "
    "--network host "
    "--security-opt seccomp=unconfined "
    "-w /app "
    "-v /home/hotspot/mikrogestor-prod:/app "
    "-e DATABASE_URL=\"file:./prisma/dev.db\" "
    "-e JWT_SECRET=\"mikrogestor_super_secret_key_change_me_in_production\" "
    "-e NODE_ENV=\"production\" "
    "-e PORT=\"80\" "
    "-e HOSTNAME=\"0.0.0.0\" "
    "mikrogestor-base:arm64 "
    "node server.js"
)
code, _ = run(docker_cmd)

print("Aguardando 10 segundos para inicializacao...")
time.sleep(10)

# 3. Verificar arquitetura do node dentro do container
run('sudo docker exec mikrogestor-voucher node -e "console.log(\'CONTAINER NODE ARCH:\', process.arch)"')

# 4. Inspecionar logs
run('sudo docker logs mikrogestor-voucher --tail 40')

# 5. Testar query real do prisma no SQLite
run('sudo docker exec mikrogestor-voucher node -e "const { PrismaClient } = require(\'@prisma/client\'); const p = new PrismaClient(); p.user.findMany().then(u => { console.log(\'PRISMA DB TEST SUCCESS! Users in DB:\', u.length, u.map(x => x.username)); process.exit(0); }).catch(e => { console.error(\'PRISMA DB ERROR:\', e); process.exit(1); });"')

# 6. Testar HTTP na porta 80
run('curl -I http://127.0.0.1:80')

ssh.close()
