import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

script = """
rm -rf /home/hotspot/test-prisma
mkdir -p /home/hotspot/test-prisma
cd /home/hotspot/test-prisma
echo '{"name":"test-prisma","dependencies":{"@prisma/client":"^5.22.0","prisma":"^5.22.0"}}' > package.json
npm install --no-audit --prefer-offline 2>&1
./node_modules/.bin/prisma -v 2>&1
"""

stdin, stdout, stderr = c.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
