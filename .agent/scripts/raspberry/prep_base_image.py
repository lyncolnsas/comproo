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

# 1. Preparar container base
run('sudo docker rm -f prep-node || true')
code, _ = run('sudo docker run -d --name prep-node --platform linux/arm64 --security-opt seccomp=unconfined node:20-slim sleep 300')
if code == 0:
    run('sudo docker exec prep-node apt-get update')
    run('sudo docker exec prep-node apt-get install -y openssl ca-certificates tzdata curl')
    run('sudo docker commit prep-node mikrogestor-base:arm64')
    run('sudo docker rm -f prep-node')
    print("Imagem mikrogestor-base:arm64 criada com sucesso!")

ssh.close()
