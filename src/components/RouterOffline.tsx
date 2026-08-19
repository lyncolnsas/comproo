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
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-red animate-led-blink" />
        <div>
          <div style={{ color: 'var(--led-red)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ ALERTA // LINK DE DADOS INDISPONÍVEL
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            {title}
          </h1>
        </div>
        <div className="ml-auto rack-screw" />
      </header>

      {/* Main warning cabinet */}
      <div className="retro-card overflow-hidden">
        {/* Module metal bar */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #22223c 0%, #1a1a35 100%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.4)' }}>
          <div className="rack-screw" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">ERROR DIAGNOSTICS</span>
          <div className="ml-auto flex gap-1">
            <span className="led led-red animate-led-pulse" />
            <span className="led led-off" />
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Warning indicator badge */}
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(180deg, #2c1a1a 0%, #1a0c0c 100%)', border: '2px solid #7f1d1d', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}>
              <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))' }}>⚠️</span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <h3 className="text-lg font-bold text-red-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Roteador MikroTik Não Conectado
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {description || "Não foi possível estabelecer comunicação com o seu MikroTik. Verifique se o roteador está acessível na rede ou conecte-se novamente."}
              </p>

              {errorMessage && (
                <div className="retro-display p-4 text-xs text-red-500 font-bold space-y-1">
                  <div style={{ color: 'var(--display-dim)', fontSize: '9px', letterSpacing: '0.05em' }}>SYSTEM_LOG_ERROR //</div>
                  <pre className="whitespace-pre-wrap break-all leading-normal" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {errorMessage}
                  </pre>
                </div>
              )}

              {/* Physical button panel */}
              <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link href="/dashboard/admin" className="retro-btn retro-btn-danger">
                  🔌 Gerenciar Roteadores
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="retro-btn retro-btn-dark"
                >
                  🔄 Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
