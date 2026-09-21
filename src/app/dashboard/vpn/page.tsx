"use client";

/**
 * /dashboard/vpn — Painel de VPN Control
 * Gerencia conexões WireGuard entre a VPS e os MikroTiks.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Terminal,
  Server,
  Wifi,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Lock,
  Globe,
} from "lucide-react";

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface VpnRouter {
  id: string;
  name: string;
  vpnIp: string | null;
  vpnStatus: string;
  vpnLastSeen: string | null;
  subdomain?: string | null;
  sslActive?: boolean;
  sslExpiresAt?: string | null;
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

// ─── Componentes Auxiliares ────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; dot: string; label: string }> = {
    connected:    { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500 animate-pulse", label: "Online" },
    pending:      { color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",                 label: "Aguardando" },
    disconnected: { color: "bg-rose-50 text-rose-700 border-rose-200",         dot: "bg-rose-400",                  label: "Offline" },
  };
  const s = map[status] ?? map.disconnected;
  return (
    <span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border " + s.color}>
      <span className={"w-1.5 h-1.5 rounded-full " + s.dot} />
      {s.label}
    </span>
  );
}

function CopyButton({ text, label = "Copiar Script" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── Modal de Criação / Geração de Túnel ────────────────────────────────────

interface CreateTunnelModalProps {
  existingRouters: RouterBasic[];
  selectedRouter?: RouterBasic | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateTunnelModal({
  existingRouters,
  selectedRouter,
  onClose,
  onSuccess,
}: CreateTunnelModalProps) {
  const [mode, setMode] = useState<"existing" | "new">(
    selectedRouter ? "existing" : existingRouters.length > 0 ? "existing" : "new"
  );
  const [selectedId, setSelectedId] = useState(selectedRouter?.id || (existingRouters[0]?.id ?? ""));
  const [routerName, setRouterName] = useState("");
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptResult, setScriptResult] = useState<{
    routerName: string;
    vpnIp: string;
    script: string;
    subdomain?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        mode === "existing"
          ? { routerId: selectedId }
          : { routerName, user, password };

      const res = await fetch("/api/vpn/router/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar túnel VPN.");

      setScriptResult({
        routerName: data.routerName || routerName || "MikroTik",
        vpnIp: data.vpnIp,
        script: data.script,
        subdomain: data.subdomain,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    if (!scriptResult) return;
    const blob = new Blob([scriptResult.script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mikrogestor-vpn-${scriptResult.routerName.replace(/\\s+/g, "-").toLowerCase()}.rsc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {scriptResult ? "Script de Conexão Gerado" : "Novo Túnel VPN WireGuard"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {scriptResult
                  ? `Cole este comando no terminal do seu MikroTik (${scriptResult.vpnIp})`
                  : "Crie um túnel seguro para controlar seu roteador sem IP público"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!scriptResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tab Selector se houver roteadores cadastrados */}
              {existingRouters.length > 0 && (
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMode("existing")}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      mode === "existing"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Usar Roteador Cadastrado
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("new")}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      mode === "new"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Cadastrar Novo Roteador
                  </button>
                </div>
              )}

              {mode === "existing" && existingRouters.length > 0 ? (
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    Selecione o Roteador
                  </label>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 text-slate-950 font-bold rounded-2xl px-3.5 py-2.5 text-xs focus:border-blue-600 outline-none transition-colors"
                  >
                    {existingRouters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.host})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                      Nome de Identificação
                    </label>
                    <input
                      type="text"
                      value={routerName}
                      onChange={(e) => setRouterName(e.target.value)}
                      required
                      placeholder="Ex: MikroTik Principal / Hotspot Matriz"
                      className="w-full bg-white border-2 border-slate-300 text-slate-950 font-bold rounded-2xl px-3.5 py-2.5 text-xs focus:border-blue-600 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                        Usuário API
                      </label>
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        required
                        placeholder="admin"
                        className="w-full bg-white border-2 border-slate-300 text-slate-950 font-bold rounded-2xl px-3.5 py-2.5 text-xs focus:border-blue-600 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                        Senha API
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-white border-2 border-slate-300 text-slate-950 font-bold rounded-2xl px-3.5 py-2.5 text-xs focus:border-blue-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-950 space-y-1.5">
                <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
                  <Shield className="w-4 h-4 text-blue-600" />
                  O que este processo faz automaticamente:
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                  1. Gera chaves criptográficas WireGuard assimétricas exclusivas.<br />
                  2. Aloca um IP privado na VPN (ex: 10.8.0.2).<br />
                  3. Cria o script completo para você colar no Terminal do MikroTik.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gerando Túnel...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Gerar VPN & Script
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Script Output Step */
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Túnel Criado com Sucesso!
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    IP Alocado na VPN: <strong className="font-mono">{scriptResult.vpnIp}</strong>
                  </p>
                  {scriptResult.subdomain && (
                    <p className="text-xs text-blue-900 font-medium mt-1 flex items-center gap-1.5">
                      Subdomínio Seguro:{" "}
                      <a
                        href={`https://${scriptResult.subdomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-blue-700 underline font-bold inline-flex items-center gap-1"
                      >
                        https://{scriptResult.subdomain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={scriptResult.script} />
                  <button
                    onClick={downloadScript}
                    className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                    title="Baixar arquivo .rsc"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Instructions Steps */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Como Conectar o MikroTik:
                </h4>
                <ol className="text-xs text-slate-600 font-medium space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Abra o <strong>Winbox</strong> conectado ao seu MikroTik.</li>
                  <li>Clique no botão <strong>New Terminal</strong> na barra lateral esquerda.</li>
                  <li><strong>Cole o script abaixo</strong> e pressione Enter.</li>
                  <li>O MikroTik conectará à VPS em menos de 5 segundos!</li>
                </ol>
              </div>

              {/* Script Box */}
              <div>
                <div className="flex items-center justify-between pb-1 text-[11px] font-bold text-slate-500">
                  <span>Script RouterOS 7+ (.rsc)</span>
                  <span className="font-mono text-[10px]">Auto-gerado</span>
                </div>
                <pre className="bg-[#0f172a] text-slate-200 p-4 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-60 custom-scrollbar border border-slate-800 selection:bg-blue-600">
                  {scriptResult.script}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Concluído / Fechar
                </button>
              </div>
            </div>
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedForConfig, setSelectedForConfig] = useState<RouterBasic | null>(null);
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
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  const revoke = async (routerId: string, routerName: string) => {
    if (!confirm(`Revogar acesso VPN de ${routerName}? O MikroTik perderá a conexão com a plataforma.`)) return;
    setRevoking(routerId);
    try {
      await fetch(`/api/vpn/router/${routerId}/revoke`, { method: "DELETE" });
      await loadStatus();
    } finally {
      setRevoking(null);
    }
  };

  const [syncingSsl, setSyncingSsl] = useState<string | null>(null);

  const syncSsl = async (routerId: string, routerName: string) => {
    setSyncingSsl(routerId);
    try {
      const res = await fetch(`/api/vpn/router/${routerId}/sync-ssl`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Erro ao sincronizar certificado SSL.");
      } else {
        alert(data.message || "SSL sincronizado com sucesso!");
        await loadStatus();
      }
    } catch (e: any) {
      alert("Falha na comunicação ao sincronizar SSL: " + (e?.message || e));
    } finally {
      setSyncingSsl(null);
    }
  };

  const nonVpnRouters = allRouters.filter((r) => !r.vpnEnabled);
  const connected = vpnRouters.filter((r) => r.vpnStatus === "connected").length;
  const pending   = vpnRouters.filter((r) => r.vpnStatus === "pending").length;
  const offline   = vpnRouters.filter((r) => r.vpnStatus === "disconnected").length;

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              REMOTE ACCESS // WIREGUARD VPN GATEWAY
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600" />
            VPN Control
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Controle remoto e provisionamento de roteadores MikroTik sem IP público via WireGuard
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSelectedForConfig(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Novo Túnel VPN</span>
          </button>
        </div>
      </header>

      {/* ── Metric Cards ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Online / Conectados", value: connected, color: "text-emerald-600", bg: "bg-emerald-50/70 border-emerald-200", dot: "bg-emerald-500" },
          { label: "Aguardando Conexão",  value: pending,   color: "text-amber-600",   bg: "bg-amber-50/70 border-amber-200",     dot: "bg-amber-500" },
          { label: "Offline / Desconectados", value: offline, color: "text-rose-600",  bg: "bg-rose-50/70 border-rose-200",       dot: "bg-rose-500" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-3xl p-5 ${s.bg} flex items-center justify-between shadow-xs`}>
            <div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                {s.label}
              </span>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${s.dot} shadow-xs`} />
          </div>
        ))}
      </section>

      {/* ── Tabela de Roteadores VPN ──────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Roteadores com VPN Ativa</h2>
            <p className="text-xs text-slate-400 mt-0.5">Túneis privados estabelecidos entre a VPS e as Routerboards</p>
          </div>
          <button
            onClick={loadStatus}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs animate-pulse">
            Carregando status dos túneis VPN...
          </div>
        ) : vpnRouters.length === 0 ? (
          /* Empty State com Botão de Ação Direta */
          <div className="p-10 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
              <Shield className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Nenhum Roteador Conectado via VPN</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Conecte seu MikroTik à VPS através de um túnel seguro WireGuard para controle total e provisionamento sem precisar de IP fixo ou DDNS.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedForConfig(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Conectar Meu Primeiro MikroTik</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {vpnRouters.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{r.name}</h4>
                      {r.subdomain && (
                        <a
                          href={`https://${r.subdomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          title="Acessar painel do roteador via HTTPS"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>{r.subdomain}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {r.sslActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          SSL Ativo
                        </span>
                      ) : r.subdomain ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Aguardando SSL
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      IP VPN: <strong className="text-slate-800">{r.vpnIp ?? "—"}</strong>
                      {r.peer?.endpoint && (
                        <span className="text-slate-400 ml-1.5">· {r.peer.endpoint}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right text-xs text-slate-400 hidden md:block">
                    {r.peer ? (
                      <>
                        <p className="font-semibold text-slate-600">↑ {formatBytes(r.peer.transferTx)} · ↓ {formatBytes(r.peer.transferRx)}</p>
                        <p className="text-[10px] mt-0.5">Visto: {formatLastSeen(r.peer.lastHandshake)}</p>
                      </>
                    ) : (
                      <p className="text-[10px]">Visto: {formatLastSeen(r.vpnLastSeen)}</p>
                    )}
                  </div>

                  <StatusBadge status={r.vpnStatus} />

                  <div className="flex items-center gap-1.5">
                    {r.subdomain && (
                      <button
                        onClick={() => syncSsl(r.id, r.name)}
                        disabled={syncingSsl === r.id}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-emerald-200 disabled:opacity-40"
                        title="Sincronizar Certificado SSL no MikroTik"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncingSsl === r.id ? "animate-spin" : ""}`} />
                      </button>
                    )}
                    <a
                      href={`/api/vpn/router/${r.id}/script`}
                      download
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                      title="Baixar script .rsc"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => revoke(r.id, r.name)}
                      disabled={revoking === r.id}
                      className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 disabled:opacity-40"
                      title="Revogar acesso VPN"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Roteadores Cadastrados sem VPN ────────────────────────── */}
      {nonVpnRouters.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Roteadores sem VPN</h2>
              <p className="text-xs text-slate-400 mt-0.5">Roteadores cadastrados no sistema que ainda não possuem túnel WireGuard</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {nonVpnRouters.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{r.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{r.host}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedForConfig(r);
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Configurar VPN</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Guia Rápido VPS ───────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Comando de Instalação na VPS</h3>
            <p className="text-xs text-slate-400">Execute no terminal SSH da VPS apenas uma vez para ativar o servidor WireGuard</p>
          </div>
        </div>

        <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-emerald-400">
          <span className="truncate">
            curl -sSL https://raw.githubusercontent.com/lyncolnsas/mikrogestor-voucher22/master/vpn/setup-vps.sh | sudo bash
          </span>
          <CopyButton
            text="curl -sSL https://raw.githubusercontent.com/lyncolnsas/mikrogestor-voucher22/master/vpn/setup-vps.sh | sudo bash"
            label="Copiar Comando"
          />
        </div>
      </section>

      {/* ── Modal de Criação / Geração de Script ──────────────────── */}
      {showCreateModal && (
        <CreateTunnelModal
          existingRouters={nonVpnRouters}
          selectedRouter={selectedForConfig}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedForConfig(null);
          }}
          onSuccess={loadStatus}
        />
      )}
    </main>
  );
}