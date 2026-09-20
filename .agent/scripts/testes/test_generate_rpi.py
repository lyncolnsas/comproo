import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

script = """
cd /home/hotspot/test-prisma
echo 'datasource db { provider = "sqlite" url = "file:./test.db" } generator client { provider = "prisma-client-js" binaryTargets = ["native"] } model Test { id Int @id @default(autoincrement()) }' > schema.prisma
PRISMA_CLI_QUERY_ENGINE_TYPE=binary ./node_modules/.bin/prisma generate --schema=schema.prisma 2>&1
"""

stdin, stdout, stderr = c.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

c.close()
