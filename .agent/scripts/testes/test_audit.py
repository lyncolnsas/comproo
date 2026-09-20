import urllib.request
import json

url = 'http://192.168.88.251/api/hotspot/provision'
try:
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("=== RESULTADO DA AUDITORIA DE PROVISIONAMENTO ===")
        print(f"Provisionado: {data.get('isProvisioned')}")
        print(f"Possui Falhas: {data.get('hasFailures')}")
        print(f"Interface Alvo / Bridge: {data.get('detectedWanInterface')}")
        print(f"Gateway IP Sugerido: {data.get('suggestedGateway')}")
        print("\nPontos da Auditoria:")
        for k, v in data.get('audit', {}).items():
            print(f"  [{v.get('status').upper()}] {k}: {v.get('message')}")
except Exception as e:
    print("Erro ao consultar provisionamento:", e)
