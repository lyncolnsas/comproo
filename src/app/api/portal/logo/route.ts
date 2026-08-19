import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logoPath = path.join(process.cwd(), 'hotspot', 'human.png');
    if (fs.existsSync(logoPath)) {
      const fileBuffer = fs.readFileSync(logoPath);
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }
    return new Response('Logo not found', { status: 404 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
