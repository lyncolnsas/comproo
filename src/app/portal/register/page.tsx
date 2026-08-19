import fs from 'fs';
import path from 'path';
import ClientPage from './ClientPage';

// Força a página a sempre buscar os dados frescos no servidor
export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  let initialConfig = null;

  try {
    const HOTSPOT_DIR = path.join(process.cwd(), 'hotspot');
    const CONFIG_PATH = path.join(HOTSPOT_DIR, 'config.json');

    if (fs.existsSync(CONFIG_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
      initialConfig = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Erro ao ler config.json no servidor:', error);
  }

  return <ClientPage initialConfig={initialConfig} />;
}
