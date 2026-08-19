import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'default';
    const safeName = template.replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let targetPath = '';

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      const found = files.find(f => (f.startsWith(`logo_${safeName}`) || f === `logo_${safeName}.png`) && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp') || f.endsWith('.svg')));
      if (found) {
        targetPath = path.join(uploadDir, found);
      } else {
        const anyLogo = files.find(f => f.startsWith('logo_') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp') || f.endsWith('.svg')));
        if (anyLogo) targetPath = path.join(uploadDir, anyLogo);
      }
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      const fallbackHuman = path.join(process.cwd(), 'public', 'uploads', 'human.png');
      if (fs.existsSync(fallbackHuman)) targetPath = fallbackHuman;
    }

    if (targetPath && fs.existsSync(targetPath)) {
      const fileBuffer = fs.readFileSync(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.webp') contentType = 'image/webp';

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }
    return new Response('Logo not found', { status: 404 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
