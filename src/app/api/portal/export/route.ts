import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { resolveTemplateDir } from '@/lib/portal-template-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'default';
    const templateDir = resolveTemplateDir(template);

    if (!fs.existsSync(templateDir)) {
      return NextResponse.json(
        { success: false, message: `Template "${template}" não encontrado.` },
        { status: 404 }
      );
    }

    const zip = new AdmZip();
    zip.addLocalFolder(templateDir);

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="mikrotik-hotspot-${template}-${Date.now()}.zip"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar ZIP do hotspot:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao gerar arquivo ZIP.' },
      { status: 500 }
    );
  }
}
