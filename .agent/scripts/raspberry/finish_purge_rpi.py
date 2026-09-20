import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('192.168.88.253', port=22, username='hotspot', password='22101844', timeout=15)

# Pass DEBIAN_FRONTEND=noninteractive to avoid any prompt
script = """
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

echo "=== CONCLUINDO REMOCAO DE PHPMYADMIN E MARIADB SEM PROMPT ==="
echo "22101844" | sudo -S DEBIAN_FRONTEND=noninteractive apt-get purge -y phpmyadmin dbconfig-common dbconfig-mysql mariadb* mysql* php* 2>/dev/null || true
echo "22101844" | sudo -S rm -rf /var/lib/mysql /etc/mysql /var/log/mysql /etc/php /var/lib/php /etc/phpmyadmin /var/lib/phpmyadmin

echo "=== REMOVENDO SERVICOS DE IMPRESSAO CUPS ==="
echo "22101844" | sudo -S DEBIAN_FRONTEND=noninteractive apt-get purge -y cups cups-browsed cups-core-drivers cups-daemon 2>/dev/null || true

echo "=== PURGA E AUTOREMOVE FINAL ==="
echo "22101844" | sudo -S DEBIAN_FRONTEND=noninteractive apt-get autoremove --purge -y 2>/dev/null || true
echo "22101844" | sudo -S apt-get clean 2>/dev/null || true
echo "22101844" | sudo -S journalctl --vacuum-time=1d 2>/dev/null || true
echo "22101844" | sudo -S rm -rf /tmp/* /var/tmp/* /var/cache/apt/archives/* /var/www/* /var/www/.* 2>/dev/null || true

echo "=== VERIFICACAO FINAL DE ESTADO ==="
echo "--- ESPACO EM DISCO ---"
df -h /
echo "--- MEMORIA RAM ---"
free -m
echo "--- TESTE DE FERRAMENTAS ---"
which docker pm2 mariadb php nginx apache2 2>&1 || true
echo "--- FERRAMENTAS UTEIS MANTIDAS ---"
which node npm python3 git curl 2>&1 || true
echo "--- ARQUIVOS NA HOME /home/hotspot ---"
ls -la /home/hotspot
"""

stdin, stdout, stderr = client.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

client.close()
