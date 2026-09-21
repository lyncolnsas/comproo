/**
 * POST /api/vpn/router/generate
 * Gera chaves WireGuard + aloca IP VPN + adiciona peer no servidor + persiste no banco.
 * Body: { routerId: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wireguardService, isWireGuardAvailable } from "@/services/wireguard";

export async function POST(req: NextRequest) {
  try {
    const { routerId } = await req.json();

    if (!routerId) {
      return NextResponse.json({ error: "routerId e obrigatorio" }, { status: 400 });
    }

    const router = await prisma.router.findUnique({ where: { id: routerId } });
    if (!router) {
      return NextResponse.json({ error: "Roteador nao encontrado" }, { status: 404 });
    }

    if (router.vpnEnabled && router.vpnIp) {
      return NextResponse.json(
        { error: "VPN ja configurada. Revogue antes de reconfigurar." },
        { status: 409 }
      );
    }

    const wgAvailable = await isWireGuardAvailable();

    // Gerar chaves via daemon (ou placeholder em dev)
    const keyPair = await wireguardService.generateKeyPair();

    // Alocar IP VPN unico
    const vpnIp = await wireguardService.allocateVpnIp();

    // Adicionar peer no WireGuard server
    if (wgAvailable) {
      await wireguardService.addPeer(keyPair.publicKey, vpnIp);
    }

    // Persistir no banco — host passa a ser o IP VPN
    await prisma.router.update({
      where: { id: routerId },
      data: {
        vpnEnabled:   true,
        vpnIp,
        vpnPublicKey: keyPair.publicKey,
        vpnPrivKey:   keyPair.privateKey,
        vpnStatus:    "pending",
        host:         vpnIp,
      },
    });

    // Gerar script RouterOS
    const script = wireguardService.generateRouterOSScript({
      routerName:     router.name,
      vpnIp,
      mikrotikPrivKey: keyPair.privateKey,
      vpsPublicKey:   process.env.VPS_WG_PUBLIC_KEY ?? "CONFIGURE_VPS_WG_PUBLIC_KEY_NO_ENV",
      vpsIp:          process.env.VPS_PUBLIC_IP ?? "SEU_IP_VPS",
      vpsPort:        51820,
    });

    return NextResponse.json({
      success: true,
      routerId,
      vpnIp,
      script,
      message: "VPN configurada. Execute o script no MikroTik para ativar.",
    });
  } catch (err) {
    console.error("[VPN GENERATE]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar configuracao VPN" },
      { status: 500 }
    );
  }
}