import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Construct the absolute path to public/uploads/[filename]
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Security check: ensure path is within the public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(uploadsDir))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const stat = fs.statSync(resolvedPath);
    const fileSize = stat.size;

    // Detect MIME type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.ogg') contentType = 'video/ogg';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.mp3') contentType = 'audio/mpeg';
    else if (ext === '.wav') contentType = 'audio/wav';

    // Parse the Range header
    const range = request.headers.get('range');

    if (!range) {
      // Standard 200 OK Response (Whole file)
      const fileBuffer = fs.readFileSync(resolvedPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Parse range e.g., "bytes=0-1048576" or "bytes=0-"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Validate boundaries
    if (isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
      return new NextResponse('Requested range not satisfiable', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${fileSize}`,
        },
      });
    }

    const chunkSize = end - start + 1;
    
    // Create read stream for the specific byte range
    const stream = fs.createReadStream(resolvedPath, { start, end });
    
    // Next.js App Router allows passing a ReadableStream in NextResponse.
    // We convert Node.js ReadStream to Web ReadableStream for compatibility.
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

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': contentType,
      },
    });
  } catch (error: any) {
    console.error('Error streaming file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
