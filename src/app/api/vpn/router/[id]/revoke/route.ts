/**
 * DELETE /api/vpn/router/[id]/revoke
 * Revoga o acesso VPN de um roteador.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wireguardService, isWireGuardAvailable } from "@/services/wireguard";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const router = await prisma.router.findUnique({ where: { id } });
    if (!router) {
      return NextResponse.json({ error: "Roteador nao encontrado" }, { status: 404 });
    }
    if (!router.vpnEnabled) {
      return NextResponse.json({ error: "VPN nao habilitada neste roteador" }, { status: 400 });
    }

    if (router.vpnPublicKey && (await isWireGuardAvailable())) {
      await wireguardService.removePeer(router.vpnPublicKey);
    }

    // Se o roteador foi criado exclusivamente para a VPN (host == vpnIp), remove do banco
    if (router.host === router.vpnIp || !router.host) {
      await prisma.router.delete({ where: { id } });
    } else {
      await prisma.router.update({
        where: { id },
        data: {
          vpnEnabled:   false,
          vpnIp:        null,
          vpnPublicKey: null,
          vpnPrivKey:   null,
          vpnLastSeen:  null,
          vpnStatus:    "disconnected",
          active:       false,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Acesso VPN revogado com sucesso." });
  } catch (err) {
    console.error("[VPN REVOKE]", err);
    return NextResponse.json({ error: "Erro ao revogar VPN" }, { status: 500 });
  }
}