"use client";

/**
 * /dashboard/vpn — Painel de VPN Control
 * Gerencia conexões WireGuard entre a VPS e os MikroTiks.
 */

import { useState, useEffect, useCallback } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface VpnRouter {
  id: string;
  name: string;
  vpnIp: string | null;
  vpnStatus: string;
  vpnLastSeen: string | null;
  peer: {
    endpoint: string | null;
    lastHandshake: string | null;
    transferRx: number;
    transferTx: number;
  } | null;
}

interface RouterBasic {
  id: string;
  name: string;
  host: string;
  vpnEnabled: boolean;
}

// ─── Utils ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const d = new Date(dateStr);
  const ago = Math.floor((Date.now() - d.getTime()) / 1000);
  if (ago < 60) return `${ago}s atrás`;
  if (ago < 3600) return `${Math.floor(ago / 60)}m atrás`;
  if (ago < 86400) return `${Math.floor(ago / 3600)}h atrás`;
  return d.toLocaleDateString("pt-BR");
}

// ─── Componentes ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; dot: string; label: string }> = {
    connected:    { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500 animate-pulse", label: "Online" },
    pending:      { color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",                 label: "Aguardando" },
    disconnected: { color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-400",                   label: "Offline" },
  };
  const s = map[status] ?? map.disconnected;
  return (
    <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border " + s.color}>
      <span className={"w-1.5 h-1.5 rounded-full " + s.dot} />
      {s.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copiado!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copiar Script
        </>
      )}
    </button>
  );
}

// ─── Modal: Configurar VPN ────────────────────────────────────────────────

interface ConfigModalProps {
  router: RouterBasic;
  onClose: () => void;
  onSuccess: () => void;
}

function ConfigModal({ router, onClose, onSuccess }: ConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"confirm" | "script">("confirm");
  const [script, setScript] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vpn/router/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routerId: router.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setScript(data.script);
      setStep("script");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ("mikrogestor-vpn-" + router.name.replace(/\s+/g, "-").toLowerCase() + ".rsc");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Configurar VPN WireGuard</h2>
            <p className="text-sm text-slate-500 mt-0.5">{router.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === "confirm" && (
            <>
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <h3 className="font-semibold text-sky-800 mb-2">O que será feito:</h3>
                <ul className="text-sm text-sky-700 space-y-1">
                  <li>✅ Geração de chaves WireGuard únicas para este roteador</li>
                  <li>✅ Alocação de IP VPN exclusivo (10.8.0.X)</li>
                  <li>✅ Registro do peer no servidor WireGuard da VPS</li>
                  <li>✅ Geração do script RouterOS para configuração no MikroTik</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Requer RouterOS 7.x</strong> — WireGuard é nativo apenas no RouterOS 7.x.
                  Verifique a versão do firmware antes de continuar.
                </p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="px-5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-lg transition-colors"
                >
                  {loading ? "Gerando..." : "Gerar Configuração VPN"}
                </button>
              </div>
            </>
          )}

          {step === "script" && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800 font-medium">
                  ✅ VPN configurada! Execute o script abaixo no MikroTik para ativar a conexão.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Script RouterOS (.rsc)</h3>
                  <div className="flex gap-2">
                    <CopyButton text={script} />
                    <button
                      onClick={downloadScript}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Baixar .rsc
                    </button>
                  </div>
                </div>
                <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-auto max-h-64 font-mono leading-relaxed whitespace-pre-wrap">
                  {script}
                </pre>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Como executar no MikroTik:</h4>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Abra o <strong>Winbox</strong> ou acesse via <strong>SSH</strong></li>
                  <li>Vá em <strong>New Terminal</strong></li>
                  <li>Cole o script completo e pressione <strong>Enter</strong></li>
                  <li>Aguarde a mensagem &quot;Configuracao concluida!&quot;</li>
                  <li>O roteador aparecerá como <strong>Online</strong> nesta tela</li>
                </ol>
              </div>
              <div className="flex justify-end">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors">
                  Fechar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────

export default function VpnPage() {
  const [vpnRouters, setVpnRouters] = useState<VpnRouter[]>([]);
  const [allRouters, setAllRouters] = useState<RouterBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [configRouter, setConfigRouter] = useState<RouterBasic | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [wgAvailable, setWgAvailable] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const [statusRes, routersRes] = await Promise.all([
        fetch("/api/vpn/status"),
        fetch("/api/system/routers").catch(() => null),
      ]);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setVpnRouters(data.routers ?? []);
        setWgAvailable(data.wgAvailable ?? true);
      }
      if (routersRes?.ok) {
        const data = await routersRes.json();
        setAllRouters(data?.routers ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // atualizar a cada 30s
    return () => clearInterval(interval);
  }, [loadStatus]);

  const revoke = async (routerId: string, routerName: string) => {
    if (!confirm(("Revogar acesso VPN de " + routerName + "? O MikroTik perderá conexão com a plataforma."))) return;
    setRevoking(routerId);
    try {
      await fetch(("/api/vpn/router/" + routerId + "/revoke"), { method: "DELETE" });
      await loadStatus();
    } finally {
      setRevoking(null);
    }
  };

  const nonVpnRouters = allRouters.filter((r) => !r.vpnEnabled);

  const connected = vpnRouters.filter((r) => r.vpnStatus === "connected").length;
  const pending   = vpnRouters.filter((r) => r.vpnStatus === "pending").length;
  const offline   = vpnRouters.filter((r) => r.vpnStatus === "disconnected").length;

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">VPN Control</h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle remoto de MikroTiks sem IP público via WireGuard
          </p>
        </div>
        {!wgAvailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700">
            ⚠️ WireGuard não detectado na VPS — instale antes de usar
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Online",      value: connected, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Aguardando",  value: pending,   color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
          { label: "Offline",     value: offline,   color: "text-red-600",     bg: "bg-red-50 border-red-100" },
        ].map((s) => (
          <div key={s.label} className={"border rounded-2xl p-4 " + s.bg}>
            <p className={"text-3xl font-bold " + s.color}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabela VPN */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Roteadores VPN</h2>
          <span className="text-xs text-slate-400">Atualiza automaticamente a cada 30s</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Carregando...</div>
        ) : vpnRouters.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Nenhum roteador com VPN configurada.</p>
            <p className="text-slate-300 text-xs mt-1">Use o painel abaixo para adicionar.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {vpnRouters.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    IP VPN: <span className="font-mono text-slate-600">{r.vpnIp ?? "—"}</span>
                    {r.peer?.endpoint && (
                      <> · Endpoint: <span className="font-mono">{r.peer.endpoint}</span></>
                    )}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 hidden md:block">
                  {r.peer ? (
                    <>
                      <p>↑ {formatBytes(r.peer.transferTx)} · ↓ {formatBytes(r.peer.transferRx)}</p>
                      <p className="mt-0.5">Visto: {formatLastSeen(r.peer.lastHandshake)}</p>
                    </>
                  ) : (
                    <p>Visto: {formatLastSeen(r.vpnLastSeen)}</p>
                  )}
                </div>
                <StatusBadge status={r.vpnStatus} />
                <div className="flex gap-2">
                  <a
                    href={("/api/vpn/router/" + r.id + "/script")}
                    download
                    className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors"
                    title="Baixar script .rsc"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <button
                    onClick={() => revoke(r.id, r.name)}
                    disabled={revoking === r.id}
                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-40"
                    title="Revogar acesso VPN"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Adicionar Roteador à VPN */}
      {nonVpnRouters.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Adicionar à VPN</h2>
            <p className="text-xs text-slate-400 mt-0.5">Roteadores cadastrados sem conexão VPN ativa</p>
          </div>
          <div className="divide-y divide-slate-50">
            {nonVpnRouters.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-slate-700 text-sm">{r.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{r.host}</p>
                </div>
                <button
                  onClick={() => setConfigRouter(r)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Configurar VPN
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Guia Rápido */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h2 className="font-semibold text-white mb-4">📋 Guia Rápido — VPS (execute uma vez)</h2>
        <div className="space-y-3 text-sm">
          <div className="bg-white/10 rounded-xl p-3 font-mono text-green-300 text-xs overflow-auto">
            <p className="text-slate-400 mb-1"># 1. Instalar WireGuard na VPS</p>
            <p>apt update && apt install -y wireguard</p>
            <br />
            <p className="text-slate-400"># 2. Gerar chaves do servidor</p>
            <p>wg genkey | tee /etc/wireguard/private.key | wg pubkey</p>
            <br />
            <p className="text-slate-400"># 3. Salvar a chave pública no .env do MikroGestor</p>
            <p>VPS_WG_PUBLIC_KEY=&quot;[saída do comando acima]&quot;</p>
            <br />
            <p className="text-slate-400"># 4. Abrir porta UDP 51820</p>
            <p>ufw allow 51820/udp && ufw reload</p>
          </div>
          <p className="text-slate-400 text-xs">
            Após configurar a VPS, use o botão &quot;Configurar VPN&quot; em cada roteador para gerar o script RouterOS.
          </p>
        </div>
      </section>

      {/* Modal */}
      {configRouter && (
        <ConfigModal
          router={configRouter}
          onClose={() => setConfigRouter(null)}
          onSuccess={loadStatus}
        />
      )}
    </main>
  );
}