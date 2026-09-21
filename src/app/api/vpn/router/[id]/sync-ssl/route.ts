import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wireguardService } from '@/services/wireguard';
import { MikrotikAPI } from '@/lib/routeros';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let mk: MikrotikAPI | null = null;

  try {
    const { id } = await params;

    const router = await prisma.router.findUnique({
      where: { id },
    });

    if (!router) {
      return NextResponse.json({ success: false, message: 'Roteador não encontrado' }, { status: 404 });
    }

    if (!router.subdomain) {
      return NextResponse.json(
        { success: false, message: 'Roteador não possui subdomínio configurado' },
        { status: 400 }
      );
    }

    // 1. Verifica se o certificado já existe no Traefik (acme.json)
    const certResult = await wireguardService.getDomainCert(router.subdomain);
    if (!certResult.ok || !certResult.certificate) {
      return NextResponse.json({
        success: false,
        pending: true,
        message: `O certificado SSL para ${router.subdomain} ainda está sendo emitido pelo Let's Encrypt. Acesse https://${router.subdomain} no navegador uma vez para disparar a emissão do desafio e tente novamente em 1 minuto.`,
      });
    }

    // 2. Conecta ao MikroTik via VPN (ou IP cadastrado)
    const host = router.vpnIp || router.host;
    const port = router.port || 8728;
    const user = router.user;
    const pass = router.password;

    mk = new MikrotikAPI();
    const connected = await mk.connect(host, user, pass, port);

    if (!connected) {
      return NextResponse.json({
        success: false,
        message: `Certificado SSL está pronto na VPS, mas o MikroTik não pôde ser contatado em ${host}:${port}. Verifique se o túnel WireGuard está ativo.`,
      });
    }

    const conn = (mk as any).connection;
    const slug = router.subdomain.split('.')[0];
    const certName = `mg-ssl-${slug}`;

    // 3. Executa download e importação do certificado diretamente no MikroTik via script temporário
    const syncCmds = `
:do {
  :log info "[MikroGestor] Sincronizando certificado SSL para ${router.subdomain}..."
  /tool fetch url="https://www.mikrogestor.com/api/vpn/router/${router.id}/cert-file?type=cert" dst-path="mg-cert.pem" check-certificate=no
  :delay 2s
  /tool fetch url="https://www.mikrogestor.com/api/vpn/router/${router.id}/cert-file?type=key" dst-path="mg-key.pem" check-certificate=no
  :delay 2s
  :do { /certificate remove [find name="${certName}"] } on-error={}
  /certificate import file-name=mg-cert.pem passphrase="" name="${certName}"
  :delay 2s
  /certificate import file-name=mg-key.pem passphrase="" name="${certName}"
  :delay 2s
  :do { /file remove [find name="mg-cert.pem"] } on-error={}
  :do { /file remove [find name="mg-key.pem"] } on-error={}
  :do { /ip service set www-ssl certificate="${certName}" disabled=no port=443 } on-error={}
  :do { /ip hotspot profile set [find name=hsprof_hotspot] ssl-certificate="${certName}" https=yes dns-name="${router.subdomain}" } on-error={}
  :log info "[MikroGestor] Certificado SSL ${router.subdomain} injetado com sucesso!"
} on-error={
  :log error "[MikroGestor] Erro ao sincronizar certificado SSL para ${router.subdomain}"
}
    `.trim();

    const scriptsMenu = (mk as any).client?.menu('/system/script');
    if (scriptsMenu && conn?.rosApi) {
      // Limpa scripts anteriores
      const existing = await scriptsMenu.where('name', 'mg-ssl-manual-sync').get().catch(() => []);
      for (const s of existing) {
        await scriptsMenu.remove(s.id || s['.id']).catch(() => {});
      }

      const scriptItem = await scriptsMenu.add({
        name: 'mg-ssl-manual-sync',
        policy: 'ftp,reboot,read,write,policy,test,password,sniff,sensitive,romon',
        source: syncCmds,
      });

      // Executa script
      await conn.rosApi.write('/system/script/run', ['=.id=' + (scriptItem.id || scriptItem['.id'])]);

      // Aguarda 4 segundos para conclusão dos fetches e imports
      await new Promise((r) => setTimeout(r, 4000));

      // Limpa o script temporário
      await scriptsMenu.remove(scriptItem.id || scriptItem['.id']).catch(() => {});
    }

    // 4. Atualiza o banco de dados com status SSL ativo
    const expiresAt = new Date(Date.now() + 85 * 24 * 60 * 60 * 1000);
    await prisma.router.update({
      where: { id: router.id },
      data: {
        sslActive: true,
        sslExpiresAt: expiresAt,
      },
    });

    mk.disconnect();

    return NextResponse.json({
      success: true,
      message: `Certificado SSL para ${router.subdomain} injetado e ativado no MikroTik com sucesso! O captive portal agora responderá com HTTPS seguro.`,
      subdomain: router.subdomain,
      sslExpiresAt: expiresAt,
    });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json(
      { success: false, message: `Erro ao sincronizar SSL: ${error.message}` },
      { status: 500 }
    );
  }
}
