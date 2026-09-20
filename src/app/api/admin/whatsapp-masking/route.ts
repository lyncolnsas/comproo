import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp';

/**
 * GET /api/admin/whatsapp-masking
 * Returns current Baileys masking configuration.
 */
export async function GET() {
  try {
    const config = await whatsappService.getBaileysMAskingConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 });
  }
}

/**
 * POST /api/admin/whatsapp-masking
 * Saves Baileys masking configuration.
 * Body: Partial<MaskingConfig>
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    await whatsappService.saveBaileysMAskingConfig(body);
    const config = await whatsappService.getBaileysMAskingConfig();
    return NextResponse.json({ success: true, message: 'Configurações de mascaramento salvas.', config });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 });
  }
}
