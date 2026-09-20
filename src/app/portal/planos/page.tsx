import PlanosClientPage from './ClientPage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PlanosPage() {
  let dnsName = process.env.HOTSPOT_DNS_NAME || 'portal.wifi.local';
  let networkName = process.env.HOTSPOT_NETWORK_NAME || 'Wi-Fi Hotspot';

  try {
    const dnsConfig = await prisma.systemConfig.findUnique({ where: { key: 'HOTSPOT_DNS_NAME' } });
    if (dnsConfig?.value) dnsName = dnsConfig.value;
    const netConfig = await prisma.systemConfig.findUnique({ where: { key: 'HOTSPOT_NETWORK_NAME' } });
    if (netConfig?.value) networkName = netConfig.value;
  } catch (e) {
    console.warn('Erro ao carregar configurações para portal de planos:', e);
  }

  return <PlanosClientPage dnsName={dnsName} networkName={networkName} />;
}
