import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Conectando a 192.168.88.253...")
client.connect('192.168.88.253', port=22, username='hotspot', password='22101844', timeout=10)
print("Conectado com sucesso!")

cmds = [
    ("SISTEMA OPERACIONAL", "cat /etc/os-release && uname -a"),
    ("ESPACO EM DISCO", "df -h"),
    ("MEMORIA", "free -m"),
    ("SERVICOS WEB / RUNTIMES", "which docker pm2 node nginx apache2 php python3 2>&1"),
    ("VERSOES ENCONTRADAS", "node -v 2>/dev/null; npm -v 2>/dev/null; docker -v 2>/dev/null; pm2 -v 2>/dev/null; nginx -v 2>&1"),
    ("DOCKER CONTAINERS", "docker ps -a 2>/dev/null || echo 'Sem containers docker ou sem permissao'"),
    ("PM2 PROCESSOS", "pm2 list 2>/dev/null || echo 'Sem pm2 ativo'"),
    ("SERVICOS RUNNING SYSTEMD", "systemctl list-units --type=service --state=running --no-pager | head -n 35"),
    ("CONTEUDO HOME /home/hotspot", "ls -la /home/hotspot"),
    ("CONTEUDO /var/www", "ls -la /var/www 2>/dev/null || true"),
    ("PORTAS EM ESCUTA", "ss -tulpn 2>/dev/null || netstat -tulpn 2>/dev/null || true")
]

import sys
sys.stdout.reconfigure(encoding='utf-8')

for title, cmd in cmds:
    print(f"\n==================== [ {title} ] ====================")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print(out.strip())
    if err and not out:
        print("ERR:", err.strip())

client.close()
print("\n[FIM DA ANALISE]")
