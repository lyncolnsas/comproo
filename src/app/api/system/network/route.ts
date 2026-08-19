import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = '';
    let localMac = '';

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const alias of iface) {
        // Encontrar o IPv4 que não é loopback interno (127.0.0.1)
        if (alias.family === 'IPv4' && !alias.internal) {
          // Vamos priorizar IPs locais convencionais (192.168.x.x ou 10.x.x.x)
          if (alias.address.startsWith('192.168.') || alias.address.startsWith('10.')) {
            localIp = alias.address;
            localMac = alias.mac;
            break;
          } else if (!localIp) {
            // Se achar algum IP publico / outro, guarda como fallback
            localIp = alias.address;
            localMac = alias.mac;
          }
        }
      }
      if (localIp && (localIp.startsWith('192.168.') || localIp.startsWith('10.'))) {
        break; // Achou o melhor candidato
      }
    }

    if (!localIp) {
      localIp = '127.0.0.1'; // Falhou em achar, volta pro localhost
    }

    return NextResponse.json({ success: true, ip: localIp, mac: localMac });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
