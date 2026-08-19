"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function VuBar({ value, danger = 85 }: { value: number; danger?: number }) {
  return (
    <div className="vu-track mt-2">
      <div
        className={`vu-fill ${value > danger ? 'vu-fill-red' : 'vu-fill-green'}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

/* ── Bento Stat — número grande com rótulo ── */
function BentoStat({
  label,
  value,
  unit,
  accent = '#818cf8',
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col justify-between h-full">
      <span
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {label}
      </span>
      <div>
        <div
          className="text-5xl font-black leading-none tabular-nums"
          style={{ color: accent, fontFamily: 'Orbitron, sans-serif' }}
        >
          {value}
        </div>
        {unit && (
          <div className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notConnected, setNotConnected] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) { setNotConnected(true); setLoading(false); return; }
      const data = await res.json();
      if (data.success) { setStats(data.data); setNotConnected(false); }
      else setError(data.message);
    } catch {
      setError('Falha na comunicação com o sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 md:p-6 flex flex-col gap-6 animate-fade-in">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#6366f1' }}
          >
            MikroTik Live Telemetry
          </p>
          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Painel de Controle
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Métricas em tempo real — atualiza a cada 10s
          </p>
        </div>

        {stats && (
          <div
            className="aurora-card flex items-center gap-3 px-4 py-3 self-start sm:self-auto"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: '#4ade80', boxShadow: '0 0 8px #22c55e', animation: 'led-pulse 2s ease-in-out infinite' }}
            />
            <div>
              <div
                className="text-xl font-black leading-none tabular-nums"
                style={{ color: '#e2e8f0', fontFamily: 'Orbitron, sans-serif' }}
              >
                {stats.clockTime}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {stats.clockDate} · {stats.clockTimeZone}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div
          className="aurora-card p-4 flex items-center gap-3"
          style={{ borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" style={{ boxShadow: '0 0 6px #ef4444' }} />
          <span className="text-sm font-semibold" style={{ color: '#f87171' }}>
            Erro de sistema: {error}
          </span>
        </div>
      )}

      {/* ── Not connected ──────────────────────────────────────────────── */}
      {notConnected ? (
        <div className="aurora-card p-8 animate-scale-up flex flex-col sm:flex-row items-center gap-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}
          >
            🔌
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#fbbf24' }}>
              Status: Desconectado
            </div>
            <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Nenhum Roteador Conectado
            </h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Cadastre e autentique a conexão com um roteador MikroTik ativo.
            </p>
            <Link href="/dashboard/admin" className="aurora-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurar Conexão
            </Link>
          </div>
        </div>

      ) : loading && !stats ? (
        /* Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto md:auto-rows-[160px]">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`aurora-card animate-pulse ${i === 0 ? 'md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-0' : i === 3 ? 'md:col-span-2 min-h-[160px]' : 'min-h-[160px]'}`}
              style={{ opacity: 0.3 }}
            />
          ))}
        </div>

      ) : stats ? (
        /* ══════════════ BENTO GRID ══════════════ */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto md:auto-rows-[160px]">

          {/* ── [2×2] Usuários Ativos — destaque principal ── */}
          <div className="aurora-card md:col-span-2 md:row-span-2 p-6 flex flex-col justify-between overflow-hidden min-h-[280px] md:min-h-0">
            {/* accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'linear-gradient(90deg, #6366f1, #2dd4bf)' }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  style={{ boxShadow: '0 0 6px #6366f1' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Hotspot
                </span>
              </div>
              <p className="text-xs font-semibold text-white mb-3">Usuários Ativos Agora</p>
            </div>

            {/* Number */}
            <div
              className="text-7xl md:text-[6rem] font-black leading-none tabular-nums"
              style={{ color: '#818cf8', fontFamily: 'Orbitron, sans-serif', lineHeight: 1 }}
            >
              {stats.activeUsersCount}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {stats.totalUsersCount} vouchers cadastrados
              </span>
              <Link
                href="/dashboard/users"
                className="text-[11px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ color: '#818cf8' }}
              >
                Ver todos
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* ── [1×1] Receita Hoje ── */}
          <div className="aurora-card p-5 flex flex-col justify-between overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Receita Hoje
            </div>
            <div>
              <div className="text-2xl font-black tabular-nums"
                style={{ color: '#34d399', fontFamily: 'Orbitron, sans-serif' }}>
                R$ {stats.finance.todayIncome.toFixed(2)}
              </div>
              <div className="mt-1.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                >
                  {stats.finance.todayCount} vendas
                </span>
              </div>
            </div>
          </div>

          {/* ── [1×1] Receita Mensal ── */}
          <div className="aurora-card p-5 flex flex-col justify-between overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Receita do Mês
            </div>
            <div>
              <div className="text-2xl font-black tabular-nums"
                style={{ color: '#2dd4bf', fontFamily: 'Orbitron, sans-serif' }}>
                R$ {stats.finance.monthIncome.toFixed(2)}
              </div>
              <div className="mt-1.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.2)' }}
                >
                  {stats.finance.monthCount} vendas
                </span>
              </div>
            </div>
          </div>

          {/* ── [2×1] CPU + Hardware ── */}
          <div className="aurora-card md:col-span-2 p-5 flex flex-col justify-between overflow-hidden min-h-[200px] md:min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Hardware · {stats.identity}
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">{stats.model}</div>
              </div>
              <span
                className="text-[10px] px-2 py-1 rounded-lg font-bold"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                v{stats.version}
              </span>
            </div>

            {/* CPU bar */}
            <div>
              <div className="flex justify-between text-[10px] font-semibold mb-1">
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>CPU Load</span>
                <span style={{ color: stats.cpuLoad > 85 ? '#f87171' : '#4ade80' }}>
                  {stats.cpuLoad}%
                </span>
              </div>
              <VuBar value={stats.cpuLoad} />
            </div>

            {/* RAM / Storage inline */}
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  RAM livre
                </div>
                <div className="text-sm font-bold" style={{ color: '#7dd3fc' }}>
                  {formatBytes(stats.freeMemory)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Storage
                </div>
                <div className="text-sm font-bold" style={{ color: '#7dd3fc' }}>
                  {formatBytes(stats.freeHdd)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Uptime
                </div>
                <div className="text-sm font-bold truncate" style={{ color: '#fbbf24' }}>
                  {stats.uptime}
                </div>
              </div>
            </div>
          </div>

          {/* ── [1×1] Status do Sistema ── */}
          <div className="aurora-card p-5 flex flex-col justify-between overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Status do Sistema
            </div>

            <div className="flex flex-col gap-2 my-2">
              {/* Provisioned */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Provisionado</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={stats.isProvisioned
                    ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
                    : { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }
                  }
                >
                  {stats.isProvisioned ? '✓ Ativo' : '⚡ Pendente'}
                </span>
              </div>
              {/* RouterOS */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>RouterOS</span>
                <span className="text-xs font-bold" style={{ color: '#34d399' }}>v{stats.version}</span>
              </div>
              {/* Board */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Board</span>
                <span className="text-xs font-bold text-white">{stats.boardName}</span>
              </div>
            </div>

            {!stats.isProvisioned && (
              <Link
                href="/dashboard/portal?tab=provisioning"
                className="text-[11px] font-semibold flex items-center gap-1 mt-1"
                style={{ color: '#fbbf24' }}
              >
                Provisionar →
              </Link>
            )}
          </div>

          {/* ── [3×2 full width] Log Console ── */}
          <div
            className="aurora-card md:col-span-3 md:row-span-2 overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#fbbf24', boxShadow: '0 0 6px #f59e0b', animation: 'led-pulse 2s ease-in-out infinite' }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Event Console
                </span>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                ⟳ auto 10s
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: '280px' }}>
              <table className="w-full text-left border-collapse">
                <thead style={{ background: 'rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    {['Hora', 'Tópico', 'Mensagem'].map(h => (
                      <th key={h}
                        className="px-5 py-3 text-[9px] font-black tracking-widest uppercase"
                        style={{ color: 'rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.logs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-sm"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>
                        Nenhum registro de log recente
                      </td>
                    </tr>
                  ) : (
                    stats.logs.map((log: any, idx: number) => {
                      const isLogin  = log.message.includes('logged in');
                      const isLogout = log.message.includes('logged out');
                      return (
                        <tr
                          key={`log-${log.time}-${idx}`}
                          className="hover:bg-white/[0.02] transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        >
                          <td className="px-5 py-2.5 whitespace-nowrap text-[11px] font-mono font-bold"
                            style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {log.time}
                          </td>
                          <td className="px-5 py-2.5 whitespace-nowrap">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded font-semibold"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}
                            >
                              {log.topics}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-[11px] font-mono"
                            style={{ color: isLogin ? '#4ade80' : isLogout ? '#fbbf24' : 'rgba(255,255,255,0.55)' }}>
                            {isLogin ? '▶ ' : isLogout ? '◀ ' : '· '}
                            {log.message}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── [1×1] Ações Rápidas ── */}
          <div className="aurora-card p-5 flex flex-col justify-between overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Ações Rápidas
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Link href="/dashboard/users?tab=batch" className="aurora-btn text-xs py-2.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gerar Vouchers
              </Link>
              <Link
                href="/dashboard/finance"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver Relatório
              </Link>
            </div>
          </div>

          {/* ── [1×1] Total Vouchers ── */}
          <div className="aurora-card p-5 flex flex-col justify-between overflow-hidden">
            <BentoStat
              label="Total de Vouchers"
              value={stats.totalUsersCount}
              unit="cadastrados no sistema"
              accent="#a5b4fc"
            />
          </div>

          {/* ── [1×1] CPU Live ── */}
          <div className="aurora-card p-5 flex flex-col justify-between overflow-hidden">
            <BentoStat
              label="CPU Load"
              value={`${stats.cpuLoad}%`}
              unit={`${stats.identity} · ${stats.boardName}`}
              accent={stats.cpuLoad > 85 ? '#f87171' : '#4ade80'}
            />
          </div>

        </div>
        /* ══════════════ /BENTO GRID ══════════════ */

      ) : null}
    </main>
  );
}
