import { MikrotikAPI } from '../../src/lib/routeros';
import { prisma } from '../../src/lib/prisma';

async function check() {
  const r = await prisma.router.findFirst();
  if (!r) {
    console.log('No router in DB');
    return;
  }
  console.log('Connecting to MikroTik at', r.host, 'user:', r.user);
  const api = new MikrotikAPI();
  const ok = await api.connect(r.host, r.user, r.password, r.port);
  console.log('MikroTik connected:', ok);
  if (ok) {
    const raw = (api as any).client;
    if (raw) {
      console.log('--- SYSTEM RESOURCE ---');
      const res = await raw.menu('/system/resource').get();
      console.log(res[0]);

      console.log('--- IP ADDRESSES ---');
      const ips = await raw.menu('/ip/address').get();
      console.log(ips);

      console.log('--- DHCP LEASES ---');
      const leases = await raw.menu('/ip/dhcp-server/lease').get();
      leases.forEach((l: any) => {
        console.log(`IP: ${l.address} | MAC: ${l['mac-address']} | Host: ${l['host-name']} | Status: ${l.status}`);
      });

      console.log('--- HOTSPOT IP BINDINGS ---');
      const bindings = await raw.menu('/ip/hotspot/ip-binding').get();
      bindings.forEach((b: any) => {
        console.log(`IP: ${b.address} | MAC: ${b['mac-address']} | Type: ${b.type} | Comment: ${b.comment}`);
      });

      console.log('--- HOTSPOT HOSTS ---');
      const hosts = await raw.menu('/ip/hotspot/host').get();
      hosts.forEach((h: any) => {
        console.log(`IP: ${h.address} | MAC: ${h['mac-address']} | Bypassed: ${h.bypassed} | Authorized: ${h.authorized}`);
      });

      console.log('--- HOTSPOT SERVERS ---');
      const hs = await raw.menu('/ip/hotspot').get();
      console.log(hs);

      console.log('--- HOTSPOT PROFILES ---');
      const prof = await raw.menu('/ip/hotspot/profile').get();
      console.log(prof);

      console.log('--- WALLED GARDEN IP ---');
      const walled = await raw.menu('/ip/hotspot/walled-garden/ip').get();
      console.log(walled);

      console.log('--- DNS STATIC ---');
      const dnsStatic = await raw.menu('/ip/dns/static').get();
      console.log(dnsStatic);
    }
    await api.close();
  }
}

check().catch(console.error);
