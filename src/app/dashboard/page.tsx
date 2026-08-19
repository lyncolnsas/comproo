"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* ── Small LED VU-meter bar ── */
function VuBar({ value, danger = 85 }: { value: number; danger?: number }) {
  return (
    <div className="vu-track">
      <div
        className={`vu-fill ${value > danger ? 'vu-fill-red' : 'vu-fill-green'}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

/* ── Retro stat value display ── */
function LcdStat({
  label,
  value,
  unit,
  color = 'var(--display-text)',
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="retro-stat-box">
      <div className="text-[8px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#2563ab' }}>
        {label}
      </div>
      <div className="text-2xl font-black leading-none" style={{ color, fontFamily: 'Share Tech Mono, monospace' }}>
        {value}
        {unit && (
          <span className="text-sm ml-1" style={{ color: '#2563ab' }}>{unit}</span>
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
      if (res.status === 401) {
        setNotConnected(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        setNotConnected(false);
      } else {
        setError(data.message);
      }
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
    <main className="p-4 md:p-6 space-y-6 animate-fade-in">

      {/* ── Header — LCD Display Panel ── */}
      <header className="retro-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title area */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="rack-screw" />
            <div className="rack-screw" />
          </div>
          <div>
            <div className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--led-amber)', fontFamily: 'Share Tech Mono, monospace' }}>
              ▶ MIKROTIK LIVE TELEMETRY
            </div>
            <h1 className="text-xl font-black tracking-tight text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Painel de Controle
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: '#4a4a7a' }}>
              Métricas de tráfego, vendas e gerenciamento em tempo real.
            </p>
          </div>
        </div>

        {/* Clock display */}
        {stats && (
          <div className="retro-display px-4 py-3 flex items-center gap-3 text-xs">
            <span className="led led-green animate-led-pulse" />
            <div style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <div className="text-lg font-black leading-none" style={{ color: 'var(--display-text)' }}>
                {stats.clockTime}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--display-dim)' }}>
                {stats.clockDate} &nbsp;·&nbsp; {stats.clockTimeZone}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="retro-card p-4 flex items-center gap-3 border-red-900"
          style={{ borderColor: '#7f1d1d', boxShadow: '0 0 15px rgba(239,68,68,0.1), 0 8px 20px rgba(0,0,0,0.6)' }}>
          <span className="led led-red animate-led-blink" />
          <span className="text-sm font-bold" style={{ color: '#f87171', fontFamily: 'Share Tech Mono, monospace' }}>
            ⚠ SYSTEM ERROR: {error}
          </span>
        </div>
      )}

      {/* ── Not connected ── */}
      {notConnected ? (
        <div className="retro-card p-8 animate-scale-up"
          style={{ borderColor: '#78350f', boxShadow: '0 0 20px rgba(245,158,11,0.08), 0 8px 20px rgba(0,0,0,0.6)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                  border: '2px solid #0a0a18',
                  boxShadow: '0 6px 0 #78350f, 0 8px 15px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.25)'
                }}>
                🔌
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-bold tracking-widest uppercase mb-1.5 flex items-center gap-2" style={{ color: 'var(--led-amber)' }}>
                <span className="led led-amber animate-led-blink" />
                STATUS: DESCONECTADO
              </div>
              <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Nenhum Roteador Conectado
              </h3>
              <p className="text-sm" style={{ color: '#7070a0' }}>
                Cadastre e autentique a conexão com um roteador MikroTik ativo antes de visualizar o dashboard.
              </p>
              <div className="mt-5">
                <Link href="/dashboard/admin" className="retro-btn retro-btn-amber">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurar Conexão
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : loading && !stats ? (
        /* ── Loading skeleton ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="retro-card h-40 animate-pulse opacity-40" />
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-6">

          {/* ── Provisioning Status Banner ── */}
          <div className="retro-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={stats.isProvisioned ? {
              borderColor: '#14532d',
              boxShadow: '0 0 15px rgba(34,197,94,0.06), 0 8px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
            } : {
              borderColor: '#78350f',
              boxShadow: '0 0 15px rgba(245,158,11,0.06), 0 8px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  background: stats.isProvisioned
                    ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                  border: '2px solid #0a0a18',
                  boxShadow: stats.isProvisioned
                    ? '0 4px 0 #14532d, 0 6px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                    : '0 4px 0 #78350f, 0 6px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                }}>
                {stats.isProvisioned ? '🛡️' : '⚡'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`led ${stats.isProvisioned ? 'led-green animate-led-pulse' : 'led-amber animate-led-blink'}`} />
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: stats.isProvisioned ? 'var(--led-green)' : 'var(--led-amber)' }}>
                    {stats.isProvisioned ? 'SYS: OPERACIONAL' : 'SYS: AGUARDANDO PROVISIONAMENTO'}
                  </span>
                </div>
                <h3 className="font-black text-white text-sm">
                  {stats.isProvisioned ? 'MikroTik Pronto para Vendas' : 'Roteador não provisionado'}
                </h3>
                {!stats.isProvisioned && (
                  <p className="text-[11px] mt-1" style={{ color: '#6060a0' }}>
                    Configure NAT, DNS e scripts MikroTik de forma autônoma.
                  </p>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {stats.isProvisioned ? (
                <span className="retro-badge retro-badge-green">
                  <span className="led led-green" style={{ width: '6px', height: '6px' }} />
                  Ativo &amp; Assinado
                </span>
              ) : (
                <Link href="/dashboard/portal?tab=provisioning" className="retro-btn retro-btn-amber text-[10px]">
                  Provisionar Roteador →
                </Link>
              )}
            </div>
          </div>

          {/* ── Hardware Specs Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* RouterBoard Specs */}
            <div className="retro-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)',
                    border: '2px solid #0a0a18',
                    boxShadow: '0 3px 0 #0a0a18, inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#818cf8' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#818cf8' }}>Routerboard</div>
                  <div className="text-base font-black text-white" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {stats.identity}
                  </div>
                </div>
              </div>

              <div className="retro-display p-3 space-y-2">
                <div className="flex justify-between text-[11px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <span style={{ color: '#2563ab' }}>MODELO:</span>
                  <span style={{ color: 'var(--display-text)' }}>{stats.model}</span>
                </div>
                <div className="flex justify-between text-[11px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <span style={{ color: '#2563ab' }}>BOARD:</span>
                  <span style={{ color: 'var(--display-text)' }}>{stats.boardName}</span>
                </div>
                <div className="flex justify-between text-[11px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <span style={{ color: '#2563ab' }}>ROUTEROS:</span>
                  <span style={{ color: 'var(--led-green)' }}>v{stats.version}</span>
                </div>
              </div>
            </div>

            {/* Hardware Resources */}
            <div className="retro-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(180deg, #14532d 0%, #0f3d22 100%)',
                    border: '2px solid #0a0a18',
                    boxShadow: '0 3px 0 #0a0a18, inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#4ade80' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#4ade80' }}>Hardware</div>
                  <div className="text-sm font-black text-white">Telemetria de Consumo</div>
                </div>
              </div>

              <div className="space-y-4">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1.5">
                    <span style={{ color: '#4a4a7a' }}>CPU</span>
                    <span style={{ color: stats.cpuLoad > 85 ? 'var(--led-red)' : 'var(--led-green)' }}>
                      {stats.cpuLoad}%
                    </span>
                  </div>
                  <VuBar value={stats.cpuLoad} />
                </div>
                {/* RAM */}
                <div className="flex justify-between text-[10px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <span style={{ color: '#4a4a7a' }}>RAM LIVRE</span>
                  <span style={{ color: 'var(--display-text)' }}>
                    {formatBytes(stats.freeMemory)} / {formatBytes(stats.totalMemory)}
                  </span>
                </div>
                {/* HDD */}
                <div className="flex justify-between text-[10px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <span style={{ color: '#4a4a7a' }}>STORAGE</span>
                  <span style={{ color: 'var(--display-text)' }}>
                    {formatBytes(stats.freeHdd)} / {formatBytes(stats.totalHdd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Uptime Card */}
            <div className="retro-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(180deg, #78350f 0%, #562500 100%)',
                    border: '2px solid #0a0a18',
                    boxShadow: '0 3px 0 #0a0a18, inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#fbbf24' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#fbbf24' }}>Uptime</div>
                  <div className="text-sm font-black text-white">Tempo Online do Sistema</div>
                </div>
              </div>

              <div className="retro-display p-4 flex flex-col items-center justify-center text-center">
                <div className="text-xl font-black" style={{ color: 'var(--led-amber)', fontFamily: 'Share Tech Mono, monospace' }}>
                  {stats.uptime}
                </div>
                <div className="text-[8px] font-bold tracking-widest uppercase mt-2" style={{ color: '#2563ab' }}>
                  TEMPO ININTERRUPTO ▶
                </div>
              </div>
            </div>
          </div>

          {/* ── Hotspot & Finance Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Hotspot Module */}
            <div className="retro-card overflow-hidden flex flex-col">
              {/* Module header */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{
                  borderBottom: '2px solid #0a0a18',
                  background: 'linear-gradient(180deg, #1e1e3c 0%, #18183a 100%)',
                  boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.3)'
                }}>
                <div className="flex items-center gap-1.5">
                  <div className="rack-screw" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="led led-blue animate-led-pulse" />
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--led-blue)' }}>
                    MODULE // HOTSPOT
                  </span>
                </div>
                <div className="ml-auto">
                  <div className="rack-screw" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="retro-stat-box">
                    <div className="text-[8px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#2563ab' }}>
                      USUÁRIOS ATIVOS
                    </div>
                    <div className="text-3xl font-black leading-none" style={{ color: 'var(--led-blue)', fontFamily: 'Share Tech Mono, monospace' }}>
                      {stats.activeUsersCount}
                    </div>
                  </div>
                  <div className="retro-stat-box">
                    <div className="text-[8px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#2563ab' }}>
                      TOTAL VOUCHERS
                    </div>
                    <div className="text-3xl font-black leading-none" style={{ color: 'var(--led-green)', fontFamily: 'Share Tech Mono, monospace' }}>
                      {stats.totalUsersCount}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase mb-3" style={{ color: '#4a4a7a' }}>
                    ▶ AÇÕES RÁPIDAS
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/users?tab=batch" className="retro-btn retro-btn-primary text-[10px]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Gerar Vouchers
                    </Link>
                    <Link href="/dashboard/users" className="retro-btn retro-btn-dark text-[10px]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Gerenciar
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Finance Module */}
            <div className="retro-card overflow-hidden flex flex-col">
              {/* Module header */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{
                  borderBottom: '2px solid #0a0a18',
                  background: 'linear-gradient(180deg, #1e1e3c 0%, #18183a 100%)',
                  boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.3)'
                }}>
                <div className="flex items-center gap-1.5">
                  <div className="rack-screw" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="led led-green animate-led-pulse" />
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--led-green)' }}>
                    MODULE // FATURAMENTO
                  </span>
                </div>
                <div className="ml-auto">
                  <div className="rack-screw" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Today */}
                <div className="retro-display p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[8px] font-bold tracking-widest uppercase mb-1" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>
                      HOJE
                    </div>
                    <div className="text-2xl font-black" style={{ color: 'var(--display-text)', fontFamily: 'Share Tech Mono, monospace' }}>
                      R$ {stats.finance.todayIncome.toFixed(2)}
                    </div>
                  </div>
                  <span className="retro-badge retro-badge-blue">
                    {stats.finance.todayCount} vouchers
                  </span>
                </div>

                {/* Month */}
                <div className="retro-display p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[8px] font-bold tracking-widest uppercase mb-1" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>
                      ESTE MÊS
                    </div>
                    <div className="text-2xl font-black" style={{ color: 'var(--led-green)', fontFamily: 'Share Tech Mono, monospace' }}>
                      R$ {stats.finance.monthIncome.toFixed(2)}
                    </div>
                  </div>
                  <span className="retro-badge retro-badge-green">
                    {stats.finance.monthCount} vouchers
                  </span>
                </div>

                <div className="mt-auto text-right">
                  <Link href="/dashboard/finance" className="retro-btn retro-btn-success text-[10px]">
                    Ver Relatório Completo →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Event Console (Logs) ── */}
          <div className="retro-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4"
              style={{
                borderBottom: '2px solid #0a0a18',
                background: 'linear-gradient(180deg, #1e1e3c 0%, #18183a 100%)',
                boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.3)'
              }}>
              <div className="rack-screw" />
              <div className="flex items-center gap-2">
                <span className="led led-amber animate-led-pulse" />
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--led-amber)' }}>
                  MODULE // EVENT CONSOLE
                </span>
              </div>
              <span className="ml-auto retro-badge retro-badge-amber animate-led-blink">
                ⟳ 10s
              </span>
              <div className="rack-screw" />
            </div>

            {/* Terminal table */}
            <div className="retro-table-wrap">
              <div className="overflow-x-auto max-h-[340px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead style={{ background: '#040810', borderBottom: '1px solid #1a1a30' }}>
                    <tr>
                      <th className="px-5 py-3 text-[9px] font-black tracking-widest uppercase w-24" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>HORA</th>
                      <th className="px-5 py-3 text-[9px] font-black tracking-widest uppercase w-36" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>TÓPICO</th>
                      <th className="px-5 py-3 text-[9px] font-black tracking-widest uppercase" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>MENSAGEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.logs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-sm" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>
                          _ NENHUM REGISTRO DE LOG RECENTE
                        </td>
                      </tr>
                    ) : (
                      stats.logs.map((log: any, idx: number) => {
                        const isLogin  = log.message.includes('logged in');
                        const isLogout = log.message.includes('logged out');
                        return (
                          <tr key={`log-${log.time}-${idx}`}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 whitespace-nowrap text-[11px] font-bold" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>
                              {log.time}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className="retro-badge" style={{
                                background: 'rgba(30,58,138,0.15)',
                                borderColor: 'rgba(59,130,246,0.2)',
                                color: '#60a5fa',
                                fontFamily: 'Share Tech Mono, monospace',
                                fontSize: '9px'
                              }}>
                                {log.topics}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[11px] font-medium" style={{
                              fontFamily: 'Share Tech Mono, monospace',
                              color: isLogin ? 'var(--led-green)' : isLogout ? 'var(--led-amber)' : 'var(--display-text)',
                            }}>
                              {isLogin ? '► ' : isLogout ? '◄ ' : '· '}
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
          </div>

        </div>
      ) : null}
    </main>
  );
}
