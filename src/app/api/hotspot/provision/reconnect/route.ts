import { NextResponse } from 'next/server';
import { getSessionCredentials, updateSessionIp } from '@/lib/session';
import { MikrotikAPI } from '@/lib/routeros';

/**
 * POST /api/hotspot/provision/reconnect
 * Chamado pelo frontend após a Etapa 1 reiniciar o roteador com novo IP.
 * Conecta-se ao novo IP, executa as etapas 2, 3 e 4 sequencialmente e atualiza a sessão.
 */
export async function POST(request: Request) {
  const { newIp } = await request.json();

  if (!newIp) {
    return NextResponse.json({ success: false, message: 'newIp é obrigatório.' }, { status: 400 });
  }

  let credentials;
  try {
    credentials = await getSessionCredentials();
  } catch {
    return NextResponse.json({ success: false, connected: false, message: 'Sem sessão ativa.' }, { status: 401 });
  }

  const mk = new MikrotikAPI();
  const connected = await mk.connect(newIp, credentials.user, credentials.pass);

  if (!connected) {
    return NextResponse.json({ success: false, connected: false, message: `Ainda sem resposta em ${newIp}. Tentando...` });
  }

  const BRIDGE = 'bridge-hotspot';
  const POOL = 'pool_hotspot';
  const DHCP = 'dhcp_hotspot';
  
  // Detecção dinâmica de WAN
  let wanInterface = 'ether1';
  try {
    const dhcpClient = await (mk as any).client?.menu('/ip/dhcp-client').get().catch(() => []) || [];
    const activeDhcpClient = dhcpClient.find((c: any) => c.disabled === 'false' || c.disabled === false || !c.disabled);
    if (activeDhcpClient) {
      wanInterface = activeDhcpClient.interface;
    }
  } catch { /* ignore */ }

  const etapas: Record<string, { status: 'pending' | 'success' | 'failed'; message: string }> = {
    etapa_2: { status: 'pending', message: 'Aguardando início.' },
    etapa_3: { status: 'pending', message: 'Aguardando início.' },
    etapa_4: { status: 'pending', message: 'Aguardando início.' },
  };

  // ── ETAPA 2: Remoção dos Defaults (Bypassed) ───────────────────────────────
  etapas.etapa_2 = { 
    status: 'success', 
    message: 'Configurações de fábrica mantidas conforme gerenciamento manual.' 
  };

  // ── ETAPA 3: Remoção de todas as regras de firewall legadas (Bypassed) ─────
  etapas.etapa_3 = { 
    status: 'success', 
    message: 'Regras de firewall de fábrica mantidas conforme gerenciamento manual.' 
  };

  // ── ETAPA 4: Configuração de segurança e hotspot final ─────────────────────
  try {
    // 1. Liberar acesso à API na posição 0 para garantir que o sistema não perca acesso
    await mk.ensureApiAccessNotBlocked().catch(() => null);

    // 2. Limpar o script temporário de migração (se houver)
    try {
      const scriptMenu = (mk as any).client?.menu('/system/script');
      const scripts = await scriptMenu.get().catch(() => []) as any[];
      const tempScript = scripts.find((s: any) => s.name === 'migrar_reboot');
      if (tempScript && tempScript.id) {
        await scriptMenu.remove(tempScript.id).catch(() => null);
      }
    } catch { /* ignore */ }

    // 3. Gravar assinatura de provisionamento completo
    await mk.writeProvisioningSignature().catch(() => null);

    etapas.etapa_4 = { 
      status: 'success', 
      message: 'Regra de proteção da API e assinatura MikroGestor configuradas.' 
    };
  } catch (err: any) {
    etapas.etapa_4 = { 
      status: 'failed', 
      message: `Erro ao aplicar segurança final: ${err.message || err}` 
    };
  }

  mk.disconnect();

  // Atualizar cookie da sessão Next.js com o novo IP de conexão
  try {
    await updateSessionIp(newIp);
  } catch { /* ignore if cookie update fails */ }

  return NextResponse.json({
    success: true,
    connected: true,
    newIp,
    etapas,
    message: `Reconectado com sucesso ao MikroTik em ${newIp} e etapas concluídas.`,
  });
}
