import urllib.request
import json

base_url = 'http://192.168.88.251'

login_data = json.dumps({'username': 'admin', 'password': '123'}).encode('utf-8')
login_req = urllib.request.Request(f'{base_url}/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(login_req, timeout=10) as resp:
        cookies = resp.headers.get('Set-Cookie')
        print('Login bem-sucedido!')
        
        prov_req = urllib.request.Request(f'{base_url}/api/hotspot/provision', headers={'Cookie': cookies})
        with urllib.request.urlopen(prov_req, timeout=10) as prov_resp:
            prov_data = json.loads(prov_resp.read().decode('utf-8'))
            print('\n=== DADOS RETORNADOS PELA API DE PROVISIONAMENTO ===')
            print('Sucesso:', prov_data.get('success'))
            print('Gateway Sugerido:', prov_data.get('suggestedGateway'))
            print('Interface / Bridge Detectada:', prov_data.get('detectedWanInterface'))
            print(f"Total de Interfaces: {len(prov_data.get('interfaces', []))}")
            for iface in prov_data.get('interfaces', []):
                print(f"  * {iface.get('name')} | Tipo: {iface.get('type')} | IP: {iface.get('configuredIp')} | Bridge: {iface.get('isBridge')}")
            print('\nStatus da Auditoria:')
            for k, v in prov_data.get('audit', {}).items():
                print(f"  [{v.get('status').upper()}] {k}: {v.get('message')}")
except Exception as e:
    print('Erro:', e)
