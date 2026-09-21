/**
 * GET /api/vpn/status
 * Retorna o status de todos os peers WireGuard + dados dos roteadores VPN no banco.
 */
import { NextResponse } from "next/server";
import { prisma, ensureVpnColumns } from "@/lib/prisma";
import { wireguardService, isWireGuardAvailable } from "@/services/wireguard";

export async function GET() {
  try {
    await ensureVpnColumns();
    const routers = await prisma.router.findMany({
      where: { vpnEnabled: true },
      select: {
        id: true,
        name: true,
        vpnIp: true,
        vpnPublicKey: true,
        vpnStatus: true,
        vpnLastSeen: true,
      },
    });

    const wgAvailable = await isWireGuardAvailable();
    const peersStatus = wgAvailable ? await wireguardService.getPeersStatus() : {};

    const updates: Promise<unknown>[] = [];
    const enriched = routers.map((router) => {
      const peer = router.vpnPublicKey ? peersStatus[router.vpnPublicKey] : null;
      const status = peer?.connected ? "connected" : "disconnected";
      const lastSeen = peer?.lastHandshake ?? router.vpnLastSeen;

      if (router.vpnPublicKey && peer) {
        updates.push(
          prisma.router.update({
            where: { id: router.id },
            data: { vpnStatus: status, vpnLastSeen: lastSeen },
          })
        );
      }

      return {
        ...router,
        vpnStatus: status,
        vpnLastSeen: lastSeen,
        peer: peer
          ? {
              endpoint: peer.endpoint,
              lastHandshake: peer.lastHandshake,
              transferRx: peer.transferRx,
              transferTx: peer.transferTx,
            }
          : null,
      };
    });

    Promise.allSettled(updates).catch(console.error);

    return NextResponse.json({ wgAvailable, routers: enriched });
  } catch (err) {
    console.error("[VPN STATUS]", err);
    return NextResponse.json({ error: "Erro ao obter status VPN" }, { status: 500 });
  }
}