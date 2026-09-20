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
    print(f"STDOUT: {repr(out)}")
    print(f"STDERR: {repr(err)}")

run('''sudo docker run --rm --platform linux/arm64 --security-opt seccomp=unconfined -v /home/hotspot/mikrogestor-prod/node_modules/.prisma/client:/app/prisma node:20-slim /bin/bash -c "apt-get update -y && apt-get install -y openssl && node -e \\"const q = require('/app/prisma/libquery_engine-linux-arm64-openssl-3.0.x.so.node'); console.log('PRISMA ENGINE SUCCESS:', Object.keys(q));\\"" ''')

ssh.close()
