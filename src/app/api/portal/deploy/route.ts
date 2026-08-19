import { NextResponse } from 'next/server';
import { getSessionCredentials } from '@/lib/session';
import path from 'path';
import fs from 'fs';
import * as ftp from 'basic-ftp';

export async function POST(request: Request) {
  const client = new ftp.Client();

  try {
    const body = await request.json().catch(() => ({}));
    const ftpPort = parseInt(body.ftpPort) || 21;

    // Get active router credentials from cookies
    const credentials = await getSessionCredentials();

    // Check if the local hotspot directory exists
    const localHotspotDir = path.join(process.cwd(), 'hotspot');
    if (!fs.existsSync(localHotspotDir)) {
      return NextResponse.json({ 
        success: false, 
        message: 'A pasta local "hotspot" não foi encontrada no servidor.' 
      }, { status: 400 });
    }

    // Connect to MikroTik via FTP
    await client.access({
      host: credentials.ip,
      user: credentials.user,
      password: credentials.pass,
      port: ftpPort,
      secure: false
    });

    // Detect if we should use '/flash/hotspot' or '/hotspot'
    let remotePath = '/hotspot';
    try {
      const rootList = await client.list('/');
      const hasFlash = rootList.some(item => 
        item.name.toLowerCase() === 'flash' && 
        (item.isDirectory || item.type === 2)
      );
      if (hasFlash) {
        remotePath = '/flash/hotspot';
      }
    } catch (err) {
      console.warn('Could not list root directory to detect flash folder. Defaulting to /hotspot.', err);
    }

    // Ensure remote directory exists
    await client.ensureDir(remotePath);

    // Clean old ad media files from the MikroTik router to free up space
    try {
      const remoteFiles = await client.list(remotePath);
      const localFiles = fs.readdirSync(localHotspotDir);
      
      for (const file of remoteFiles) {
        if (file.isFile || file.type === 1) {
          const fileName = file.name;
          const isAdFile = fileName.startsWith('ad_');
          const isMediaFile = (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp')) && fileName !== 'human.png';
          
          if ((isAdFile || isMediaFile) && !localFiles.includes(fileName)) {
            console.log(`Deleting stale remote file: ${remotePath}/${fileName}`);
            // Use path.posix to join remote paths safely
            const remoteFilePath = remotePath.endsWith('/') ? `${remotePath}${fileName}` : `${remotePath}/${fileName}`;
            await client.remove(remoteFilePath).catch(err => {
              console.warn(`Could not delete remote file ${fileName}:`, err);
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not clean old remote media files:', err);
    }

    // Sync directory recursively (will transfer human.png, login.html, etc. correctly as binary)
    await client.uploadFromDir(localHotspotDir, remotePath);

    client.close();

    return NextResponse.json({ 
      success: true, 
      message: `Deploy concluído! Os arquivos foram sincronizados via FTP na pasta "${remotePath}" do seu MikroTik.` 
    });

  } catch (error: any) {
    client.close();
    console.error('FTP Deploy Error:', error);

    let errorMsg = error.message || 'Erro desconhecido durante o deploy via FTP.';
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMsg = `Não foi possível conectar ao FTP em ${error.address || 'roteador'}:${error.port || 21}. Verifique se a porta FTP (21) está liberada no MikroTik (IP > Services).`;
    } else if (error.message && error.message.includes('Timeout')) {
      errorMsg = 'Tempo limite de conexão esgotado (Timeout). Verifique se o roteador está acessível na porta FTP.';
    } else if (error.message && error.message.includes('530')) {
      errorMsg = 'Usuário ou senha do FTP incorretos (Erro 530).';
    }

    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
