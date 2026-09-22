export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug || slug.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const filename = slug[slug.length - 1];

    if (filename === 'fonts.css') {
      const cssPath = path.join(process.cwd(), 'public', 'fonts', 'fonts.css');
      if (fs.existsSync(cssPath)) {
        return new NextResponse(fs.readFileSync(cssPath), {
          status: 200,
          headers: {
            'Content-Type': 'text/css; charset=utf-8',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    const fontPath = path.join(process.cwd(), 'public', 'fonts', filename);
    if (fs.existsSync(fontPath)) {
      const ext = path.extname(filename).toLowerCase();
      const mime = ext === '.woff2' ? 'font/woff2' : ext === '.woff' ? 'font/woff' : ext === '.ttf' ? 'font/ttf' : 'application/octet-stream';
      return new NextResponse(fs.readFileSync(fontPath), {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new NextResponse('Font not found', { status: 404 });
  } catch (err) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
