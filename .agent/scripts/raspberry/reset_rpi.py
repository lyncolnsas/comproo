import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Conectando ao Raspberry Pi 192.168.88.253...")
client.connect('192.168.88.253', port=22, username='hotspot', password='22101844', timeout=15)

script = """
echo "=== 1. PARANDO PROCESSOS PM2 ==="
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 save --force 2>/dev/null || true

echo "=== 2. PARANDO E LIMPANDO DOCKER ==="
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true

echo "=== 3. EXECUTANDO RESET TOTAL SH ==="
cd /home/hotspot
if [ -f reset_total.sh ]; then
    echo "22101844" | sudo -S bash reset_total.sh --yes || true
fi

echo "=== 4. REMOVENDO PASTAS DE PROJETOS E CORE DUMPS ==="
rm -rf /home/hotspot/bridge-ts
rm -rf /home/hotspot/AgendaBot
rm -rf /home/hotspot/planka-whats
rm -f /home/hotspot/deploy_to_pi.zip
rm -f /home/hotspot/get-docker.sh
rm -f /home/hotspot/*.zip
rm -f /home/hotspot/core.*
rm -f /home/hotspot/*.log

echo "=== 5. LIBERANDO CACHE DE MEMORIA E PACOTES ==="
echo "22101844" | sudo -S apt-get autoremove -y 2>/dev/null || true
echo "22101844" | sudo -S apt-get clean 2>/dev/null || true
echo "22101844" | sudo -S sync
echo "22101844" | sudo -S sh -c "echo 3 > /proc/sys/vm/drop_caches"

echo "=== 6. VERIFICANDO NOVO STATUS DE DISCO E PROCESSOS ==="
df -h /
free -m
pm2 list
ls -la /home/hotspot
"""

stdin, stdout, stderr = client.exec_command(script, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

client.close()
print("\n[RESET TOTAL CONCLUIDO COM SUCESSO]")
