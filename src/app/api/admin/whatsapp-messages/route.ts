import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  WHATSAPP_TRIGGERS,
  MessageTriggerDefinition,
  getFlowConfig,
  saveFlowConfig,
  SystemFlowMap
} from '@/services/whatsapp-custom-messages';

export async function GET() {
  try {
    const keys = WHATSAPP_TRIGGERS.map(t => t.key);
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: [...keys, 'PORTAL_SALES_MODE'] } }
    });

    const configMap = configs.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const activeSystemMode = configMap['PORTAL_SALES_MODE'] === 'free' ? 'free' : 'paid';
    const flowConfig = await getFlowConfig();

    const triggers = WHATSAPP_TRIGGERS.map(t => ({
      ...t,
      currentTemplate: configMap[t.key] || t.defaultTemplate,
      isCustomized: Boolean(configMap[t.key] && configMap[t.key] !== t.defaultTemplate)
    }));

    return NextResponse.json({ success: true, triggers, activeSystemMode, flowConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao carregar templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, template, action, mode, flowConfig } = body;

    // Ação para salvar o fluxograma completo
    if (action === 'saveFlow') {
      if (!flowConfig) {
        return NextResponse.json({ success: false, message: 'Dados de fluxo ausentes' }, { status: 400 });
      }
      const ok = await saveFlowConfig(flowConfig as SystemFlowMap);
      return NextResponse.json({
        success: ok,
        message: ok ? 'Fluxograma e réguas de mensagens atualizados com sucesso!' : 'Erro ao salvar fluxograma'
      });
    }

    // Ação para definir o modo global de operação (Pago ou Free)
    if (action === 'setActiveMode') {
      if (mode !== 'free' && mode !== 'paid') {
        return NextResponse.json({ success: false, message: 'Modo inválido' }, { status: 400 });
      }

      // Sincroniza tanto PORTAL_SALES_MODE quanto free_wifi_mode para manter 100% de coerência
      const isFree = mode === 'free';
      await Promise.all([
        prisma.systemConfig.upsert({
          where: { key: 'PORTAL_SALES_MODE' },
          update: { value: mode },
          create: { key: 'PORTAL_SALES_MODE', value: mode }
        }),
        prisma.systemConfig.upsert({
          where: { key: 'free_wifi_mode' },
          update: { value: isFree ? 'true' : 'false' },
          create: { key: 'free_wifi_mode', value: isFree ? 'true' : 'false' }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: `Modo do sistema alterado para: ${mode === 'paid' ? 'Modelos Pagos (Venda)' : 'Modelos Free (Gratuito)'}`,
        activeSystemMode: mode
      });
    }

    if (!key) {
      return NextResponse.json({ success: false, message: 'Chave obrigatória' }, { status: 400 });
    }

    const triggerDef = WHATSAPP_TRIGGERS.find(t => t.key === key);
    if (!triggerDef) {
      return NextResponse.json({ success: false, message: 'Gatilho não reconhecido' }, { status: 404 });
    }

    if (action === 'reset') {
      // Remove do banco para restaurar padrão
      await prisma.systemConfig.deleteMany({ where: { key } });
      return NextResponse.json({
        success: true,
        message: 'Mensagem restaurada para o padrão de fábrica.',
        template: triggerDef.defaultTemplate,
        isCustomized: false
      });
    }

    // Salva personalização
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(template) },
      create: { key, value: String(template) }
    });

    return NextResponse.json({
      success: true,
      message: 'Modelo de mensagem salvo com sucesso!',
      template,
      isCustomized: template !== triggerDef.defaultTemplate
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao salvar modelo' }, { status: 500 });
  }
}
