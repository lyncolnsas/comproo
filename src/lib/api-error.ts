import { NextResponse } from 'next/server';
import { MikrotikSessionError } from './session';

/**
 * Retorna o HTTP status code e mensagem correta baseado no tipo de erro:
 * - MikrotikSessionError NO_SESSION / INVALID_SESSION → 401 (frontend mostra "Não Conectado")
 * - MikrotikSessionError CONNECTION_FAILED → 503 (frontend mostra "Não Conectado" com detalhe)
 * - RouterOS API error (ex: "no such command prefix") → 422 (frontend mostra erro normal, não banner)
 * - Outros erros → 500
 */
export function routerErrorResponse(error: unknown) {
  if (error instanceof MikrotikSessionError) {
    if (error.code === 'NO_SESSION' || error.code === 'INVALID_SESSION') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    if (error.code === 'CONNECTION_FAILED') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 503 }
      );
    }
  }

  // RouterOS API errors or any other runtime error — session is valid, but command failed
  const msg: string = error instanceof Error ? error.message : typeof error === 'object' && error ? String((error as Record<string, unknown>).message || error) : String(error);
  const isRouterOsError =
    msg.includes('no such command') ||
    msg.includes('no such item') ||
    msg.includes('unknown parameter') ||
    msg.includes('invalid value') ||
    msg.includes('bad command') ||
    msg.includes('UNKNOWNREPLY');

  if (isRouterOsError) {
    return NextResponse.json(
      { success: false, message: msg, routerError: true },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { success: false, message: msg },
    { status: 500 }
  );
}
