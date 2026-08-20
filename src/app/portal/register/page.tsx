import fs from 'fs';
import path from 'path';
import ClientPage from './ClientPage';
import { prisma } from '@/lib/prisma';
import { resolveTemplateDir } from '@/lib/portal-template-utils';

// Força a página a sempre buscar os dados frescos no servidor
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  let template = typeof resolvedSearchParams?.template === 'string' ? resolvedSearchParams.template : '';

  if (!template) {
    try {
      const configRecord = await prisma.systemConfig.findUnique({
        where: { key: 'LAST_DEPLOYED_TEMPLATE' }
      });
      if (configRecord) {
        template = configRecord.value;
      }
    } catch (e) {
      console.warn('Erro ao buscar LAST_DEPLOYED_TEMPLATE no DB:', e);
    }
  }

  if (!template) {
    template = 'default';
  }

  const templateDir = resolveTemplateDir(template);
  let initialConfig = null;

  try {
    let configPath = path.join(templateDir, 'config.json');

    // Fallback chains
    if (!fs.existsSync(configPath)) {
      configPath = path.join(process.cwd(), 'hotspot', 'default', 'config.json');
    }
    if (!fs.existsSync(configPath)) {
      configPath = path.join(process.cwd(), 'hotspot', 'config.json');
    }

    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf8');
      initialConfig = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Erro ao ler config.json no servidor:', error);
  }

  if (initialConfig) {
    initialConfig.template = template;
  } else {
    initialConfig = { template };
  }

  return <ClientPage initialConfig={initialConfig} />;
}
