import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
const AdmZip = require('adm-zip');

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), 'hotspot');
    if (!fs.existsSync(rootDir)) {
       fs.mkdirSync(rootDir, { recursive: true });
    }
    const items = fs.readdirSync(rootDir, { withFileTypes: true });
    let templates = items
      .filter(item => item.isDirectory() && fs.existsSync(path.join(rootDir, item.name, 'login.html')))
      .map(item => item.name);
    
    // Sort so 'default' is always first
    templates = templates.sort((a, b) => {
        if (a === 'default') return -1;
        if (b === 'default') return 1;
        return a.localeCompare(b);
    });

    // Fetch last deployed template
    let lastDeployed = null;
    try {
      const configRecord = await prisma.systemConfig.findUnique({
        where: { key: 'LAST_DEPLOYED_TEMPLATE' }
      });
      if (configRecord) {
        lastDeployed = configRecord.value;
      }
    } catch (e) {
      console.warn('Could not fetch LAST_DEPLOYED_TEMPLATE:', e);
    }

    return NextResponse.json({ success: true, templates, lastDeployedTemplate: lastDeployed });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    
    if (!file.name.endsWith('.zip')) {
       return NextResponse.json({ success: false, message: 'Apenas arquivos .zip são permitidos.' }, { status: 400 });
    }

    const cleanName = file.name.replace('.zip', '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderName = cleanName;
    const extractPath = path.join(process.cwd(), 'hotspot', folderName);
    
    if (fs.existsSync(extractPath)) {
       return NextResponse.json({ success: false, message: `O template "${folderName}" já existe.` }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    try {
      const zip = new AdmZip(buffer);
      zip.extractAllTo(extractPath, true);
    } catch (unzipError: any) {
      return NextResponse.json({ success: false, message: 'Erro ao extrair ZIP: ' + unzipError.message }, { status: 500 });
    }

    // Simple check: if the extracted folder contains exactly ONE subfolder and NO files,
    // it means the user zipped the folder itself instead of its contents.
    // In a more complex scenario, we could move everything up, but for now this works.
    const extractedContents = fs.readdirSync(extractPath);
    if (extractedContents.length === 1) {
        const singleItem = path.join(extractPath, extractedContents[0]);
        if (fs.lstatSync(singleItem).isDirectory()) {
            // Move contents up one level
            const subItems = fs.readdirSync(singleItem);
            for (const subItem of subItems) {
                fs.renameSync(path.join(singleItem, subItem), path.join(extractPath, subItem));
            }
            fs.rmdirSync(singleItem);
        }
    }

    // Ensure config.json exists, if not, copy from default hotspot
    const configPath = path.join(extractPath, 'config.json');
    if (!fs.existsSync(configPath)) {
        const defaultHotspotConfig = path.join(process.cwd(), 'hotspot', 'default', 'config.json');
        if (fs.existsSync(defaultHotspotConfig)) {
            fs.copyFileSync(defaultHotspotConfig, configPath);
        } else {
            fs.writeFileSync(configPath, JSON.stringify({ businessName: folderName }));
        }
    }

    return NextResponse.json({ success: true, message: 'Template enviado e extraído com sucesso!', template: folderName });
  } catch(e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
