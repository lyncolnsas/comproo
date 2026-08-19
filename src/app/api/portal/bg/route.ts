import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'default';
    const safeName = template.replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      // Search for template specific background or fallback background
      let bgFile = files.find(f => f.startsWith(`bg_${safeName}_`) && (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp')));
      if (!bgFile) {
        bgFile = files.find(f => f.startsWith('bg_') && (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp')));
      }
      
      if (bgFile) {
        const filePath = path.join(uploadDir, bgFile);
        
        // Use streaming for videos to avoid loading the whole file in memory
        if (bgFile.endsWith('.mp4') || bgFile.endsWith('.webm')) {
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = request.headers.get('range');
            
            let contentType = bgFile.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
            const corsHeaders = {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            };

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const stream = fs.createReadStream(filePath, {start, end});
                
                const webStream = new ReadableStream({
                  start(controller) {
                    stream.on('data', (chunk) => {
                      controller.enqueue(new Uint8Array(chunk as Buffer));
                    });
                    stream.on('end', () => {
                      controller.close();
                    });
                    stream.on('error', (err) => {
                      controller.error(err);
                    });
                  },
                  cancel() {
                    stream.destroy();
                  }
                });
                
                return new Response(webStream, {
                    status: 206,
                    headers: {
                        ...corsHeaders,
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize.toString(),
                        'Content-Type': contentType,
                    }
                });
            } else {
                const stream = fs.createReadStream(filePath);
                const webStream = new ReadableStream({
                  start(controller) {
                    stream.on('data', (chunk) => {
                      controller.enqueue(new Uint8Array(chunk as Buffer));
                    });
                    stream.on('end', () => {
                      controller.close();
                    });
                    stream.on('error', (err) => {
                      controller.error(err);
                    });
                  },
                  cancel() {
                    stream.destroy();
                  }
                });
                
                return new Response(webStream, {
                    headers: {
                        ...corsHeaders,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': fileSize.toString(),
                        'Content-Type': contentType,
                    }
                });
            }
        } else {
            // Serve image directly
            const fileBuffer = fs.readFileSync(filePath);
            let contentType = 'image/jpeg';
            if (bgFile.endsWith('.png')) contentType = 'image/png';
            else if (bgFile.endsWith('.webp')) contentType = 'image/webp';
    
            return new Response(fileBuffer, {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': contentType,
                'Cache-Control': 'no-store, max-age=0'
              }
            });
        }
      }
    }

    // High quality default dark/gradient SVG background fallback so mobile phones NEVER receive 404 HTTP errors
    const defaultBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="50%" stop-color="#111827"/><stop offset="100%" stop-color="#070a10"/></linearGradient><radialGradient id="glow" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#bgGrad)"/><rect width="1920" height="1080" fill="url(#glow)"/></svg>`;
    return new Response(defaultBgSvg, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
