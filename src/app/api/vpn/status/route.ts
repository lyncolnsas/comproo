/**
 * GET /api/vpn/status
 * Retorna o status de todos os peers WireGuard + dados dos roteadores VPN no banco.
 */
import { NextResponse } from "next/server";
import net from "net";
import { prisma, ensureVpnColumns } from "@/lib/prisma";
import { wireguardService, isWireGuardAvailable } from "@/services/wireguard";

function checkTcpPort(host: string, port = 8728, timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      done = true;
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once("error", () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

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
    const enriched = await Promise.all(
      routers.map(async (router) => {
        const peer = router.vpnPublicKey ? peersStatus[router.vpnPublicKey] : null;
        let isConnected = !!peer?.connected;
        let lastSeen: Date | null = peer?.lastHandshake ?? router.vpnLastSeen;

        // Fallback resiliente: se o daemon WireGuard não reportou conexão ou não tem o peer,
        // testa diretamente a conectividade via API RouterOS (porta 8728) no IP da VPN
        if (!isConnected && router.vpnIp) {
          const isReachable = await checkTcpPort(router.vpnIp, 8728, 1200);
          if (isReachable) {
            isConnected = true;
            lastSeen = new Date();
          }
        }

        const status = isConnected ? "connected" : "disconnected";

        if (status !== router.vpnStatus || (lastSeen && lastSeen !== router.vpnLastSeen)) {
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
            : isConnected
            ? {
                endpoint: "Túnel WireGuard Ativo (TCP 8728)",
                lastHandshake: lastSeen,
                transferRx: 0,
                transferTx: 0,
              }
            : null,
        };
      })
    );

    Promise.allSettled(updates).catch(console.error);

    return NextResponse.json({ wgAvailable: wgAvailable || enriched.some(r => r.vpnStatus === 'connected'), routers: enriched });
  } catch (err) {
    console.error("[VPN STATUS]", err);
    return NextResponse.json({ error: "Erro ao obter status VPN" }, { status: 500 });
  }
}