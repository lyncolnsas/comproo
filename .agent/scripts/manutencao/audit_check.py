import sqlite3
import paramiko
import json

# Vamos conectar na Raspberry Pi e rodar um script node que consulta o MikroTik via a própria API do projeto
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.88.253', username='hotspot', password='22101844', timeout=10)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='ignore') + stderr.read().decode('utf-8', errors='ignore')

script = """
const { MikrotikAPI } = require('./src/lib/routeros.ts');
// Ou ler direto via fetch da API de provisionamento
"""

# Vamos testar diretamente a rota GET /api/hotspot/provision que faz o audit de 10 pontos!
res = run('curl -s http://127.0.0.1/api/hotspot/provision')
print("--- PROVISION AUDIT (GET /api/hotspot/provision) ---")
try:
    data = json.loads(res)
    print(json.dumps(data.get('audit', {}), indent=2))
    print("Detected Wan Interface:", data.get('detectedWanInterface'))
    print("Detected Gateway IP:", data.get('detectedGatewayIp'))
    print("Is Provisioned:", data.get('isProvisioned'))
    print("Has Failures:", data.get('hasFailures'))
except Exception as e:
    print("Raw response:", res[:500])

ssh.close()
