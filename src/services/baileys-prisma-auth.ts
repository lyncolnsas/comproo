import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * Provedor de autenticação Baileys persistido diretamente no SQLite via Prisma.
 * Elimina milhares de arquivos .json em disco e migra automaticamente dados legados.
 */
export async function usePrismaAuthState(instanceId: string, fallbackFolder?: string) {
  const Baileys = await import('@whiskeysockets/baileys');
  const { initAuthCreds, BufferJSON, proto } = Baileys;

  const readData = async (key: string): Promise<any> => {
    try {
      const record = await prisma.baileysAuth.findUnique({
        where: {
          instanceId_key: {
            instanceId,
            key,
          },
        },
      });

      if (record?.value) {
        return JSON.parse(record.value, BufferJSON.reviver);
      }
      return null;
    } catch (err) {
      console.error(`[BaileysAuth] Erro ao ler chave ${key}:`, err);
      return null;
    }
  };

  const writeData = async (key: string, data: any): Promise<void> => {
    try {
      const serialized = JSON.stringify(data, BufferJSON.replacer);
      const id = `${instanceId}:${key}`;

      await prisma.baileysAuth.upsert({
        where: {
          instanceId_key: {
            instanceId,
            key,
          },
        },
        create: {
          id,
          instanceId,
          key,
          value: serialized,
        },
        update: {
          value: serialized,
        },
      });
    } catch (err) {
      console.error(`[BaileysAuth] Erro ao gravar chave ${key}:`, err);
    }
  };

  const removeData = async (key: string): Promise<void> => {
    try {
      await prisma.baileysAuth.deleteMany({
        where: {
          instanceId,
          key,
        },
      });
    } catch {
      // Ignore not found
    }
  };

  // ─── Migração Automática de Arquivos Legados em Disco para o Banco ───────────
  let creds = await readData('creds');

  if (!creds && fallbackFolder && fs.existsSync(fallbackFolder)) {
    const credsFile = path.join(fallbackFolder, 'creds.json');
    if (fs.existsSync(credsFile)) {
      try {
        console.log(`[BaileysAuth][${instanceId}] Migrando credenciais legadas em disco para SQLite...`);
        const rawCreds = fs.readFileSync(credsFile, 'utf-8');
        creds = JSON.parse(rawCreds, BufferJSON.reviver);
        await writeData('creds', creds);

        // Migra demais arquivos JSON da pasta (keys, lids, app-state)
        const files = fs.readdirSync(fallbackFolder);
        for (const file of files) {
          if (!file.endsWith('.json') || file === 'creds.json') continue;
          try {
            const raw = fs.readFileSync(path.join(fallbackFolder, file), 'utf-8');
            const parsed = JSON.parse(raw, BufferJSON.reviver);
            const key = file.replace(/\.json$/, '');
            await writeData(key, parsed);
          } catch {}
        }
        console.log(`[BaileysAuth][${instanceId}] Migração concluída com sucesso! Banco SQLite sincronizado.`);
      } catch (migErr) {
        console.warn(`[BaileysAuth][${instanceId}] Aviso na migração legada:`, migErr);
      }
    }
  }

  if (!creds) {
    creds = initAuthCreds();
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: Record<string, any> = {};
          await Promise.all(
            ids.map(async (id) => {
              const key = `${type}-${id}`;
              let value = await readData(key);
              if (type === 'app-state-sync-key' && value && proto?.Message?.AppStateSyncKeyData) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: Record<string, Record<string, any>>) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(key, value));
              } else {
                tasks.push(removeData(key));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      await writeData('creds', creds);
    },
  };
}
