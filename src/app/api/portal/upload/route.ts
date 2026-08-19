import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let buffer: Buffer;
    let type: string;
    let slot: string | null = null;
    let fileName: string = '';
    let ext: string = '.png';

    if (!contentType.includes('multipart/form-data')) {
      // 1. Raw Binary Upload Mode (Highly robust for large media files)
      const url = new URL(request.url);
      type = url.searchParams.get('type') || 'ad';
      slot = url.searchParams.get('slot');
      const paramFilename = url.searchParams.get('filename') || 'media.mp4';
      ext = path.extname(paramFilename) || '.png';
      
      const arrayBuffer = await request.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = paramFilename;
    } else {
      // 2. Traditional Multipart Form Data Mode (Fallback)
      const formData = await request.formData();
      const file = formData.get('file') as File;
      type = formData.get('type') as string; // 'logo' | 'ad'
      slot = formData.get('slot') as string;

      if (!file) {
        return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      ext = path.extname(file.name) || '.png';
      fileName = file.name;
    }

    if (type === 'logo') {
      const hotspotDir = path.join(process.cwd(), 'hotspot');
      if (!fs.existsSync(hotspotDir)) {
        fs.mkdirSync(hotspotDir, { recursive: true });
      }
      const filePath = path.join(hotspotDir, 'human.png');
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ success: true, message: 'Logo salva como hotspot/human.png com sucesso!' });
    } else if (type === 'ad') {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      if (slot) {
        const slotNum = parseInt(slot);
        if (slotNum >= 1 && slotNum <= 5) {
          const fileName = `ad_media_${slot}${ext}`;

          // Clean older extensions for this slot to prevent file pollution
          const possibleExts = ['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov'];
          possibleExts.forEach(e => {
            try {
              const oldPublicPath = path.join(uploadDir, `ad_media_${slot}${e}`);
              if (fs.existsSync(oldPublicPath)) fs.unlinkSync(oldPublicPath);
            } catch (err) {}
          });

          // Save to public/uploads (for admin preview and central streaming)
          const publicPath = path.join(uploadDir, fileName);
          fs.writeFileSync(publicPath, buffer);

          const fileUrl = `/uploads/${fileName}`;
          return NextResponse.json({ 
            success: true, 
            fileUrl,
            fileName,
            message: `Mídia do Slot ${slot} salva com sucesso!` 
          });
        }
      }

      // Fallback fallback legacy upload
      const fileName = `ad_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${fileName}`;
      
      return NextResponse.json({ 
        success: true, 
        fileUrl, 
        message: 'Mídia de anúncio salva com sucesso!' 
      });
    } else {
      return NextResponse.json({ success: false, message: 'Tipo de upload inválido.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const configPath = path.join(process.cwd(), 'hotspot', 'config.json');
    let config: any = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ success: true, message: 'Diretório de uploads vazio.', deletedCount: 0 });
    }

    // 1. Coleta todas as URLs de mídia ativas na configuração atual
    const activeUrls = new Set<string>();
    if (config.ad) {
      if (config.ad.mediaUrl) {
        activeUrls.add(config.ad.mediaUrl);
      }
      if (Array.isArray(config.ad.items)) {
        config.ad.items.forEach((item: any) => {
          if (item && item.url) {
            activeUrls.add(item.url);
          }
        });
      }
    }

    // 2. Varrer arquivos e remover os que começam com "ad_" e não estão em uso
    const files = fs.readdirSync(uploadDir);
    let deletedCount = 0;
    files.forEach(file => {
      if (file.startsWith('ad_')) {
        const fileUrl = `/uploads/${file}`;
        if (!activeUrls.has(fileUrl)) {
          try {
            fs.unlinkSync(path.join(uploadDir, file));
            deletedCount++;
          } catch (err) {}
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Limpeza concluída! ${deletedCount} arquivo(s) não utilizado(s) foram apagado(s) da pasta uploads.`,
      deletedCount
    });
  } catch (error: any) {
    console.error('Cleanup Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
