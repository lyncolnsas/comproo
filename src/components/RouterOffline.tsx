import Link from 'next/link';

interface RouterOfflineProps {
  title: string;
  description?: string;
  errorMessage?: string;
}

export default function RouterOffline({ title, description, errorMessage }: RouterOfflineProps) {
  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Module Header */}
      <header className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-rose-600 tracking-wider uppercase">
            Alerta de Conectividade
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
      </header>

      {/* Main warning cabinet */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Module bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Diagnóstico do Roteador</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Desconectado
          </span>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Warning indicator badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-3xl">⚠️</span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                Roteador MikroTik Não Conectado
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {description || "Não foi possível estabelecer comunicação com o seu MikroTik. Verifique se o roteador está acessível na rede ou conecte-se novamente."}
              </p>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs font-mono space-y-1 text-left">
                  <div className="text-[10px] font-bold uppercase text-rose-700 tracking-wider">Log do Sistema:</div>
                  <pre className="whitespace-pre-wrap break-all leading-normal text-rose-800 font-semibold">
                    {errorMessage}
                  </pre>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Link
                  href="/dashboard/admin"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>🔌</span>
                  <span>Gerenciar Roteadores</span>
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Tentar Novamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
