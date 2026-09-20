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

# 1. Permissoes em prisma e dev.db
run('sudo chmod -R 777 /home/hotspot/mikrogestor-prod/prisma')
run('ls -la /home/hotspot/mikrogestor-prod/prisma')

# 2. Reiniciar container com DATABASE_URL="file:/app/prisma/dev.db"
run('sudo docker rm -f mikrogestor-voucher || true')

docker_cmd = (
    "sudo docker run -d "
    "--name mikrogestor-voucher "
    "--restart always "
    "--network host "
    "--security-opt seccomp=unconfined "
    "-w /app "
    "-v /home/hotspot/mikrogestor-prod:/app "
    "-e DATABASE_URL=\"file:/app/prisma/dev.db\" "
    "-e JWT_SECRET=\"mikrogestor_super_secret_key_change_me_in_production\" "
    "-e NODE_ENV=\"production\" "
    "-e PORT=\"80\" "
    "-e HOSTNAME=\"0.0.0.0\" "
    "mikrogestor-base:arm64 "
    "node server.js"
)
run(docker_cmd)

time.sleep(6)

# 3. Testar query do prisma
run('sudo docker exec mikrogestor-voucher node -e "const { PrismaClient } = require(\'@prisma/client\'); const p = new PrismaClient({ datasources: { db: { url: \'file:/app/prisma/dev.db\' } } }); p.user.findMany().then(u => { console.log(\'PRISMA DB TEST SUCCESS! Users in DB:\', u.length, u.map(x => x.username)); process.exit(0); }).catch(e => { console.error(\'PRISMA DB ERROR:\', e); process.exit(1); });"')

# 4. Inspecionar logs da aplicacao
run('sudo docker logs mikrogestor-voucher --tail 40')

ssh.close()
