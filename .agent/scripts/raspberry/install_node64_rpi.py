import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

script = """
echo "=== 1. BAIXANDO E INSTALANDO NODE.JS 64-BIT (ARM64) ==="
mkdir -p /home/hotspot/node64 && cd /home/hotspot/node64
if [ ! -f node-arm64.tar.xz ]; then
    curl -fsSL https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-arm64.tar.xz -o node-arm64.tar.xz
fi
tar -xJf node-arm64.tar.xz
echo "22101844" | sudo -S cp -R node-v20.18.0-linux-arm64/* /usr/local/
node -e "console.log('NOVO NODE:', process.version, process.arch)"

echo "=== 2. TESTANDO ENGINE PRISMA ARM64 ==="
cd /home/hotspot/test-prisma
npx --yes prisma -v 2>&1
"""

stdin, stdout, stderr = c.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
