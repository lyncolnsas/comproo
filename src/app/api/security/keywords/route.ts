import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    const list = await mk.getKeywordBlockRules();
    mk.disconnect();

    // Agrupar por palavra-chave para evitar duplicidade no frontend (HTTP e HTTPS)
    const keywordsSet = new Set<string>();
    list.forEach((item: any) => {
      if (item.comment) {
        const match = item.comment.match(/^MikroGestor Bloqueio Palavra:\s*(.+?)(?:\s*\((?:HTTP|HTTPS)\))?$/i);
        if (match) {
          keywordsSet.add(match[1]);
        }
      }
    });

    const data = Array.from(keywordsSet).map(kw => ({
      id: kw, // usar o termo como ID
      keyword: kw
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}

export async function POST(request: Request) {
  let mk;
  try {
    const { keyword } = await request.json();
    if (!keyword || keyword.trim() === '') {
      return NextResponse.json({ success: false, message: 'Palavra-chave inválida' }, { status: 400 });
    }
    
    const cleanKeyword = keyword.trim().toLowerCase();
    mk = await getMikrotikClient();
    
    // Evitar duplicados
    const list = await mk.getKeywordBlockRules();
    const exists = list.some((item: any) => 
      item.comment && item.comment.toLowerCase().includes(`bloqueio palavra: ${cleanKeyword}`)
    );

    if (exists) {
      mk.disconnect();
      return NextResponse.json({ success: false, message: 'Esta palavra-chave já está bloqueada.' }, { status: 400 });
    }

    await mk.addKeywordBlockRule(cleanKeyword);
    mk.disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let mk;
  try {
    const { keyword } = await request.json();
    if (!keyword) {
      return NextResponse.json({ success: false, message: 'Palavra-chave não informada' }, { status: 400 });
    }
    mk = await getMikrotikClient();
    await mk.removeKeywordBlockRules(keyword);
    mk.disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
