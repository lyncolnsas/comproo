import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer;
    let fileName: string;
    let type: string;
    let slot: string | null = null;
    let ext: string;
    let templateName: string = 'default';

    if (!contentType.includes('multipart/form-data')) {
      // 1. Raw Binary Upload Mode (Highly robust for large media files)
      const url = new URL(request.url);
      type = url.searchParams.get('type') || 'ad';
      slot = url.searchParams.get('slot');
      templateName = url.searchParams.get('template') || 'default';
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
      templateName = formData.get('template') as string || 'default';

      if (!file) {
        return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      ext = path.extname(file.name) || '.png';
      fileName = file.name;
    }

    const isVideo = ext.toLowerCase() === '.mp4' || ext.toLowerCase() === '.webm' || ext.toLowerCase() === '.mov';
    const maxSize = isVideo ? 35 * 1024 * 1024 : 10 * 1024 * 1024;

    if (type === 'bg' && buffer.length > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: `O arquivo de fundo excede o limite máximo de ${isVideo ? '35 MB para vídeos' : '10 MB para imagens'}.` 
      }, { status: 400 });
    }

    if (type === 'logo') {
      const safeName = templateName.replace(/[^a-zA-Z0-9_-]/g, '');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save logo with fixed name and timestamped name in public/uploads
      const logoPathFixed = path.join(uploadDir, `logo_${safeName}.png`);
      fs.writeFileSync(logoPathFixed, buffer);
      
      const fileName = `logo_${safeName}_${Date.now()}.png`;
      const logoPathTime = path.join(uploadDir, fileName);
      fs.writeFileSync(logoPathTime, buffer);

      return NextResponse.json({ 
        success: true, 
        fileUrl: `/uploads/${fileName}`,
        message: 'Logo salva no servidor com sucesso!' 
      });
    } else if (type === 'bg') {
      const safeName = templateName.replace(/[^a-zA-Z0-9_-]/g, '');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Clean old backgrounds for this template in public/uploads to prevent disk clogging
      try {
        const files = fs.readdirSync(uploadDir);
        files.forEach(f => {
          if (f.startsWith(`bg_${safeName}_`)) {
            try { fs.unlinkSync(path.join(uploadDir, f)); } catch (e) {}
          }
        });
      } catch (e) {}

      const isVideoFile = ext.toLowerCase() === '.mp4' || ext.toLowerCase() === '.webm' || ext.toLowerCase() === '.mov';
      let cleanExt = ext.toLowerCase();
      if (!isVideoFile && !['.png', '.jpg', '.jpeg', '.webp'].includes(cleanExt)) {
         cleanExt = '.jpg';
      }
      
      const fileName = `bg_${safeName}_${Date.now()}${cleanExt}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      // Clean any lingering bg files inside local hotspot directory if any existed
      try {
        const hDir = path.join(process.cwd(), 'hotspot', safeName);
        if (fs.existsSync(hDir)) {
           const hFiles = fs.readdirSync(hDir);
           hFiles.forEach(f => {
              if (f.startsWith('bg.') || f === 'human.png' || f === 'logo.png') {
                 try { fs.unlinkSync(path.join(hDir, f)); } catch (e) {}
              }
           });
        }
      } catch (e) {}

      const fileUrl = `/uploads/${fileName}`;

      return NextResponse.json({ 
        success: true, 
        fileUrl: fileUrl,  
        message: 'Fundo salvo com sucesso no servidor!' 
      });
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

      // Fallback legacy upload
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'default';
    const type = searchParams.get('type');
    const safeName = template.replace(/[^a-zA-Z0-9_-]/g, '');
    const configPath = path.join(process.cwd(), 'hotspot', safeName, 'config.json');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Specific deletion for Background media
    if (type === 'bg') {
      let deletedCount = 0;
      if (fs.existsSync(uploadDir)) {
        try {
          const files = fs.readdirSync(uploadDir);
          files.forEach(f => {
            if (f.startsWith(`bg_${safeName}_`)) {
              try {
                fs.unlinkSync(path.join(uploadDir, f));
                deletedCount++;
              } catch (e) {}
            }
          });
        } catch (e) {}
      }

      const hDir = path.join(process.cwd(), 'hotspot', safeName);
      if (fs.existsSync(hDir)) {
        try {
          const hFiles = fs.readdirSync(hDir);
          hFiles.forEach(f => {
            if (f.startsWith('bg.') && (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mov') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'))) {
              try {
                fs.unlinkSync(path.join(hDir, f));
                deletedCount++;
              } catch (e) {}
            }
          });
        } catch (e) {}
      }

      // Update config.json to reset bg
      if (fs.existsSync(configPath)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          cfg.bg = { type: 'default', url: '' };
          fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Mídia de fundo removida e ${deletedCount} arquivo(s) apagado(s) do servidor com sucesso!`,
        deletedCount
      });
    }

    // General cleanup for unused ad/bg files
    let config: any = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {}
    }

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ success: true, message: 'Diretório de uploads vazio.', deletedCount: 0 });
    }

    const activeUrls = new Set<string>();
    if (config.ad) {
      if (config.ad.mediaUrl) activeUrls.add(config.ad.mediaUrl.split('?')[0]);
      if (Array.isArray(config.ad.items)) {
        config.ad.items.forEach((item: any) => {
          if (item && item.url) activeUrls.add(item.url.split('?')[0]);
        });
      }
    }
    if (config.bg && config.bg.url) {
      // Strip query parameters to match actual file names in uploads directory
      const cleanUrl = config.bg.url.split('?')[0];
      activeUrls.add(cleanUrl);
    }

    const files = fs.readdirSync(uploadDir);
    let deletedCount = 0;
    files.forEach(file => {
      if (file.startsWith('ad_') || file.startsWith('bg_')) {
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
