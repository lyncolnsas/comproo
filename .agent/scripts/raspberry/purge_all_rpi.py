import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Conectando ao Raspberry Pi 192.168.88.253...")
client.connect('192.168.88.253', port=22, username='hotspot', password='22101844', timeout=15)

script = """
echo "=== 1. PARANDO E DESINSTALANDO DOCKER & CONTAINERD COMPLETAMENTE ==="
echo "22101844" | sudo -S systemctl stop docker.socket docker.service containerd.service 2>/dev/null || true
echo "22101844" | sudo -S systemctl disable docker.socket docker.service containerd.service 2>/dev/null || true
echo "22101844" | sudo -S apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker.io containerd runc 2>/dev/null || true
echo "22101844" | sudo -S rm -rf /var/lib/docker /var/lib/containerd /etc/docker ~/.docker /etc/apt/keyrings/docker.gpg /etc/apt/sources.list.d/docker.list

echo "=== 2. REMOVENDO PM2 E LIMPEZA GLOBAL DO NODE ==="
pm2 kill 2>/dev/null || true
echo "22101844" | sudo -S pm2 unstartup systemd 2>/dev/null || true
echo "22101844" | sudo -S npm uninstall -g pm2 pnpm yarn ts-node tsx 2>/dev/null || true
rm -rf /home/hotspot/.pm2 /home/hotspot/.npm

echo "=== 3. DESINSTALANDO BANCO DE DADOS MARIADB / MYSQL & PHP RESIDUAL ==="
echo "22101844" | sudo -S systemctl stop mariadb mysql php8.4-fpm 2>/dev/null || true
echo "22101844" | sudo -S systemctl disable mariadb mysql php8.4-fpm 2>/dev/null || true
echo "22101844" | sudo -S apt-get purge -y mariadb-server mariadb-client mariadb-common mysql-common php8.4* php-common 2>/dev/null || true
echo "22101844" | sudo -S rm -rf /var/lib/mysql /etc/mysql /var/log/mysql /etc/php /var/lib/php

echo "=== 4. REMOVENDO SERVICOS DE IMPRESSAO (CUPS) DESNECESSARIOS ==="
echo "22101844" | sudo -S systemctl stop cups cups-browsed 2>/dev/null || true
echo "22101844" | sudo -S systemctl disable cups cups-browsed 2>/dev/null || true
echo "22101844" | sudo -S apt-get purge -y cups cups-browsed cups-core-drivers cups-daemon 2>/dev/null || true

echo "=== 5. LIMPANDO DIRETORIO /var/www E ARQUIVOS RESIDUAIS ==="
echo "22101844" | sudo -S rm -rf /var/www/* /var/www/.* 2>/dev/null || true
rm -f /home/hotspot/reset_total.sh /home/hotspot/get-docker.sh /home/hotspot/*.zip /home/hotspot/*.sh

echo "=== 6. LIMPEZA PROFUNDA DE PACOTES, CACHE E LOGS ==="
echo "22101844" | sudo -S apt-get autoremove --purge -y 2>/dev/null || true
echo "22101844" | sudo -S apt-get clean 2>/dev/null || true
echo "22101844" | sudo -S journalctl --vacuum-time=1d 2>/dev/null || true
echo "22101844" | sudo -S rm -rf /tmp/* /var/tmp/* /var/cache/apt/archives/*

echo "=== 7. VERIFICANDO NOVO STATUS DO SISTEMA RECEM-FORMATADO ==="
echo "--- ESPACO EM DISCO ---"
df -h /
echo "--- MEMORIA RAM ---"
free -m
echo "--- RUNTIMES RESTANTES ---"
which node npm python3 2>&1
echo "--- VERIFICANDO SE RESTA DOCKER OU PM2 ---"
which docker pm2 2>&1 || echo "Docker e PM2 totalmente removidos!"
echo "--- ARQUIVOS NA HOME ---"
ls -la /home/hotspot
"""

stdin, stdout, stderr = client.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

client.close()
print("\n[PURGA COMPLETA E FORMATACAO CONCLUIDA COM SUCESSO]")
