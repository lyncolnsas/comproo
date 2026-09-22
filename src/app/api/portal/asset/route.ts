export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { resolveTemplateDir } from '@/lib/portal-template-utils';

const MIME: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.html': 'text/html',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'default';
    const file = searchParams.get('file') || '';

    if (!file || file.includes('..')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const templateDir = resolveTemplateDir(template);
    const safeName = template.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(templateDir, file);

    if (!fs.existsSync(filePath)) {
      const lowerFile = file.toLowerCase();
      // Safe logo / human.png fallback to avoid 404 onerror infinite loop
      if (lowerFile.includes('logo') || lowerFile.includes('human')) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        let logoPath = '';
        if (fs.existsSync(uploadDir)) {
          const files = fs.readdirSync(uploadDir);
          const found = files.find(f => f.startsWith(`logo_${safeName}`) && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg') || f.endsWith('.webp')));
          if (found) logoPath = path.join(uploadDir, found);
          else {
            const anyLogo = files.find(f => f.startsWith('logo_') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg') || f.endsWith('.webp')));
            if (anyLogo) logoPath = path.join(uploadDir, anyLogo);
          }
        }
        if (!logoPath || !fs.existsSync(logoPath)) {
          const defaultHuman = path.join(process.cwd(), 'public', 'uploads', 'human.png');
          if (fs.existsSync(defaultHuman)) logoPath = defaultHuman;
        }

        if (logoPath && fs.existsSync(logoPath)) {
          const buffer = fs.readFileSync(logoPath);
          const ext = path.extname(logoPath).toLowerCase();
          const mime = MIME[ext] || 'image/png';
          return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' } });
        }

        // Default crisp SVG logo if no file on disk
        const defaultLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="64" height="64"><path d="M12 3C6.95 3 2.5 5.56 0 9.42l2.36 2.36C4.12 8.44 7.78 6.5 12 6.5s7.88 1.94 9.64 5.28L24 9.42C21.5 5.56 17.05 3 12 3zm0 5c-3.31 0-6.29 1.52-8.25 3.91l2.36 2.36C7.39 12.87 9.53 12 12 12s4.61.87 5.89 2.27l2.36-2.36C18.29 9.52 15.31 8 12 8zm0 5c-1.38 0-2.5 1.12-2.5 2.5v.5H9c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-.5v-.5c0-1.38-1.12-2.5-2.5-2.5zm1 3h-2v-.5c0-.55.45-1 1-1s1 .45 1 1v.5z"/></svg>`;
        return new NextResponse(defaultLogoSvg, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
      }

      // Fallback for wifi-lock if missing in template
      if (lowerFile.includes('wifi')) {
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="48" height="48"><path d="M12 3C6.95 3 2.5 5.56 0 9.42l2.36 2.36C4.12 8.44 7.78 6.5 12 6.5s7.88 1.94 9.64 5.28L24 9.42C21.5 5.56 17.05 3 12 3zm0 5c-3.31 0-6.29 1.52-8.25 3.91l2.36 2.36C7.39 12.87 9.53 12 12 12s4.61.87 5.89 2.27l2.36-2.36C18.29 9.52 15.31 8 12 8zm0 5c-1.38 0-2.5 1.12-2.5 2.5v.5H9c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-.5v-.5c0-1.38-1.12-2.5-2.5-2.5zm1 3h-2v-.5c0-.55.45-1 1-1s1 .45 1 1v.5z"/></svg>`;
        return new NextResponse(svgIcon, {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }

      // Fallback para arquivos de fontes caso o template não possua a pasta local
      if (lowerFile.endsWith('.woff2') || lowerFile.endsWith('.woff') || lowerFile.endsWith('.ttf')) {
        const publicFontPath = path.join(process.cwd(), 'public', 'fonts', path.basename(file));
        if (fs.existsSync(publicFontPath)) {
          const buffer = fs.readFileSync(publicFontPath);
          const ext = path.extname(publicFontPath).toLowerCase();
          const mime = MIME[ext] || 'font/woff2';
          return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000' } });
        }
      }

      // For any other missing image/media file, return transparent 1x1 SVG so onerror NEVER triggers in templates
      if (lowerFile.endsWith('.png') || lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg') || lowerFile.endsWith('.webp') || lowerFile.endsWith('.gif') || lowerFile.endsWith('.svg')) {
        const transparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`;
        return new NextResponse(transparentSvg, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
      }

      return new NextResponse('Not Found', { status: 404 });
    }

    const ext = path.extname(file).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    const buffer = fs.readFileSync(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    return new NextResponse('Server Error', { status: 500 });
  }
}
