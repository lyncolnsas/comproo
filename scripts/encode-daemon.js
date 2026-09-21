const fs = require('fs');

const script = `#!/usr/bin/env python3
import http.server, json, subprocess, os, sys, logging, hmac

logging.basicConfig(level=logging.INFO, format='%(asctime)s [WG-MGR] %(levelname)s %(message)s')
log = logging.getLogger(__name__)

WG_INTERFACE = os.environ.get('WG_INTERFACE', 'wg0')
BIND_HOST    = '0.0.0.0'
BIND_PORT    = int(os.environ.get('WG_MANAGER_PORT', '51821'))
SECRET_FILE  = '/etc/mikrogestor-wg.secret'

def load_secret():
    try:
        with open(SECRET_FILE) as f:
            return f.read().strip()
    except Exception as e:
        log.error(f'Cannot read secret: {e}')
        sys.exit(1)

SECRET = load_secret()

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

def verify_secret(headers):
    auth = headers.get('X-WG-Secret', '')
    return hmac.compare_digest(auth, SECRET)

class WGHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        log.info(f'{self.client_address[0]} - {format % args}')

    def send_json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def do_GET(self):
        if not verify_secret(self.headers):
            return self.send_json(401, {'error': 'Unauthorized'})
        if self.path == '/health':
            return self.send_json(200, {'ok': True})
        if self.path == '/status':
            stdout, stderr, rc = run(f'wg show {WG_INTERFACE} dump')
            if rc != 0:
                return self.send_json(500, {'error': stderr})
            lines = [l for l in stdout.splitlines() if l.strip()]
            peers = []
            for line in lines[1:]:
                parts = line.split('\t')
                if len(parts) < 8:
                    continue
                pub_key, _, endpoint, allowed_ips, last_hs, rx, tx, _ = parts[:8]
                peers.append({
                    'publicKey': pub_key,
                    'endpoint': endpoint if endpoint != '(none)' else None,
                    'allowedIps': allowed_ips,
                    'lastHandshake': int(last_hs),
                    'transferRx': int(rx),
                    'transferTx': int(tx),
                })
            return self.send_json(200, {'interface': WG_INTERFACE, 'peers': peers})
        return self.send_json(404, {'error': 'Not found'})

    def do_POST(self):
        if not verify_secret(self.headers):
            return self.send_json(401, {'error': 'Unauthorized'})
        body = self.read_body()
        if self.path == '/peer/add':
            pub_key = body.get('publicKey', '').strip()
            vpn_ip  = body.get('vpnIp', '').strip()
            if not pub_key or not vpn_ip:
                return self.send_json(400, {'error': 'publicKey and vpnIp required'})
            _, err, rc = run(f'wg set {WG_INTERFACE} peer "{pub_key}" allowed-ips {vpn_ip}/32')
            if rc != 0:
                return self.send_json(500, {'error': err})
            run(f'wg-quick save {WG_INTERFACE}')
            return self.send_json(200, {'ok': True, 'vpnIp': vpn_ip})
        if self.path == '/peer/remove':
            pub_key = body.get('publicKey', '').strip()
            if not pub_key:
                return self.send_json(400, {'error': 'publicKey required'})
            run(f'wg set {WG_INTERFACE} peer "{pub_key}" remove')
            run(f'wg-quick save {WG_INTERFACE}')
            return self.send_json(200, {'ok': True})
        return self.send_json(404, {'error': 'Not found'})

if __name__ == '__main__':
    server = http.server.HTTPServer((BIND_HOST, BIND_PORT), WGHandler)
    log.info(f'WG Manager listening on {BIND_HOST}:{BIND_PORT}')
    server.serve_forever()
`;

console.log(Buffer.from(script).toString('base64'));
