import { NextResponse } from 'next/server';
import { getMikrotikClient, MikrotikSessionError } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

/**
 * POST /api/hotspot/provision/fix-api-rule
 *
 * Lightweight endpoint: ensures the MikroGestor API + Winbox firewall
 * accept rules exist and are enabled. Does NOT touch any other config.
 * Called by the "Corrigir agora" quick-fix button in the provisioning audit.
 */
export async function POST() {
  let mk;
  try {
    mk = await getMikrotikClient();

    // This creates/enables both rules in one shot
    await mk.ensureApiAccessNotBlocked();

    // Read back to confirm
    const rules = await mk.getAllFirewallFilterRules();
    const apiRule    = rules.find((r: any) => r.comment === 'MikroGestor: Accept API Access');
    const winboxRule = rules.find((r: any) => r.comment === 'MikroGestor: Accept Winbox');

    mk.disconnect();

    return NextResponse.json({
      success: true,
      apiRule:    apiRule    ? { id: apiRule.id,    disabled: apiRule.disabled    } : null,
      winboxRule: winboxRule ? { id: winboxRule.id, disabled: winboxRule.disabled } : null,
      message: 'Regras de liberação da API e Winbox verificadas/criadas com sucesso.',
    });
  } catch (error: any) {
    if (mk) try { mk.disconnect(); } catch { /* ignore */ }
    return routerErrorResponse(error);
  }
}
