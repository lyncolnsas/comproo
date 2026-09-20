"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Cpu,
  ArrowUpRight,
  MoreHorizontal,
  Wifi,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Sample mock trend data for the smooth Spline AreaChart (normalized to current week)
const CHART_DATA = [
  { name: 'Seg', faturamento: 180, vouchers: 25 },
  { name: 'Ter', faturamento: 310, vouchers: 42 },
  { name: 'Qua', faturamento: 280, vouchers: 38 },
  { name: 'Qui', faturamento: 450, vouchers: 55 },
  { name: 'Sex', faturamento: 520, vouchers: 68 },
  { name: 'Sáb', faturamento: 590, vouchers: 80 },
  { name: 'Dom', faturamento: 470, vouchers: 62 },
];

const USER_SPARKLINE = [
  { v: 20 }, { v: 28 }, { v: 25 }, { v: 36 }, { v: 32 }, { v: 45 }, { v: 42 }, { v: 50 }
];

const MEM_SPARKLINE = [
  { v: 45 }, { v: 40 }, { v: 48 }, { v: 42 }, { v: 55 }, { v: 51 }, { v: 62 }, { v: 58 }
];

// Monthly sales report bar chart data (matching Jan - Jun in reference image)
const BAR_CHART_DATA = [
  { name: 'Jan', vendas: 28 },
  { name: 'Feb', vendas: 18 },
  { name: 'Mar', vendas: 8 },
  { name: 'Apr', vendas: 24 },
  { name: 'May', vendas: 25 },
  { name: 'Jun', vendas: 28 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notConnected, setNotConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const totalMemory = stats?.totalMemory || 1;
  const freeMemory = stats?.freeMemory || 0;
  const memUsedPercent = Math.min(100, Math.max(0, Math.round(((totalMemory - freeMemory) / totalMemory) * 100)));

  return (
    <main className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">

      {/* ── TOP GREETING BAR ────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, Bem-vindo de volta! 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Monitoramento e controle de vendas e telemetria MikroTik em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats.identity}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-500">{stats.clockTime || '00:00'}</span>
            </div>
          )}

          <Link
            href="/dashboard/users?tab=batch"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Gerar Vouchers
          </Link>
        </div>
      </header>

      {/* ── ERROR BANNER ──────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>Erro no sistema: {error}</span>
        </div>
      )}

      {/* ── NOT CONNECTED BANNER ──────────────────────────────────────── */}
      {notConnected ? (
        <div className="saas-card p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shrink-0 text-amber-600">
            🔌
          </div>
          <div>
            <span className="saas-pill saas-pill-warning mb-2">Desconectado</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Nenhum Roteador Conectado</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Conecte o sistema à sua Routerboard MikroTik para ativar o monitoramento em tempo real.
            </p>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              Configurar Conexão
            </Link>
          </div>
        </div>
      ) : loading && !stats ? (
        /* SKELETON LOADERS */
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200/60 animate-pulse" />
            <div className="h-80 rounded-2xl bg-slate-200/60 animate-pulse" />
          </div>
        </div>
      ) : stats ? (
        <>
          {/* ═══════════════════════════════════════════════════════════════
             1. TOP ROW: 4 VIBRANT METRIC CARDS (EXACT REFERENCE DESIGN)
             ═══════════════════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* CARD 1: TOTAL SALES (TEAL / EMERALD) */}
            <div
              className="p-5 flex items-center justify-between relative overflow-hidden group rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 10px 24px -4px rgba(5, 150, 105, 0.4)',
              }}
            >
              <div className="flex flex-col justify-between h-full z-10">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Total Sales
                </span>
                <div className="my-2">
                  <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    R$ {stats.finance.monthIncome.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                  <span className="bg-white/30 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                    +15%
                  </span>
                  <span>este mês</span>
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-md shrink-0 text-emerald-700 bg-white group-hover:scale-110 transition-transform"
              >
                <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>

            {/* CARD 2: TOTAL PURCHASES (VIBRANT BLUE) */}
            <div
              className="p-5 flex items-center justify-between relative overflow-hidden group rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                boxShadow: '0 10px 24px -4px rgba(29, 78, 216, 0.4)',
              }}
            >
              <div className="flex flex-col justify-between h-full z-10">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Total Purchases
                </span>
                <div className="my-2">
                  <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    {stats.finance.monthCount}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                  <span className="bg-white/30 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                    Hoje: {stats.finance.todayCount}
                  </span>
                  <span>este mês</span>
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-md shrink-0 text-blue-700 bg-white group-hover:scale-110 transition-transform"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* CARD 3: TOTAL ORDERS (CARMIM / ROSE) */}
            <div
              className="p-5 flex items-center justify-between relative overflow-hidden group rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                boxShadow: '0 10px 24px -4px rgba(225, 29, 72, 0.4)',
              }}
            >
              <div className="flex flex-col justify-between h-full z-10">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Total Orders
                </span>
                <div className="my-2">
                  <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    {stats.activeUsersCount}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                  <span className="bg-white/30 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                    Online
                  </span>
                  <span>{stats.totalUsersCount} cadastrados</span>
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-md shrink-0 text-rose-700 bg-white group-hover:scale-110 transition-transform"
              >
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* CARD 4: TOTAL GROWTH / HARDWARE (SOLAR ORANGE) */}
            <div
              className="p-5 flex items-center justify-between relative overflow-hidden group rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                boxShadow: '0 10px 24px -4px rgba(234, 88, 12, 0.4)',
              }}
            >
              <div className="flex flex-col justify-between h-full z-10">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Total Growth
                </span>
                <div className="my-2">
                  <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    {stats.cpuLoad}%
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                  <span className="bg-white/30 text-white px-2 py-0.5 rounded-md text-[10px] font-black truncate max-w-[100px]">
                    {stats.model || 'MikroTik'}
                  </span>
                  <span>CPU Load</span>
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-md shrink-0 text-amber-700 bg-white group-hover:scale-110 transition-transform"
              >
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>

          </section>

          {/* ═══════════════════════════════════════════════════════════════
             2. MIDDLE SECTION: LARGE SPLINE CHART + SPARKLINES & DONUT
             ═══════════════════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: LARGE SPLINE AREA CHART (FATURAMENTO & TENDÊNCIA) */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Faturamento & Vendas
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      Volume financeiro e emissão de vouchers ao longo do período
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <ArrowUp className="w-3.5 h-3.5" /> +18.4%
                    </span>
                  </div>
                </div>

                {/* 4 SUMMARY STATS IN A ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-0.5">
                      Receita Hoje
                    </span>
                    <p className="text-xl font-black text-slate-900">
                      R$ {stats.finance.todayIncome.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-0.5">
                      Vendas Hoje
                    </span>
                    <p className="text-xl font-black text-slate-900">
                      {stats.finance.todayCount} unid.
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-0.5">
                      Receita Mês
                    </span>
                    <p className="text-xl font-black text-slate-900">
                      R$ {stats.finance.monthIncome.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-0.5">
                      Vouchers Mês
                    </span>
                    <p className="text-xl font-black text-slate-900">
                      {stats.finance.monthCount} unid.
                    </p>
                  </div>
                </div>
              </div>

              {/* RECHARTS SPLINE AREA CHART */}
              <div className="w-full h-56 mt-2">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorVouchers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0084ff" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0084ff" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#334155" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
                      <YAxis stroke="#334155" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="faturamento"
                        name="Faturamento (R$)"
                        stroke="#ff3b5c"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorFaturamento)"
                      />
                      <Area
                        type="monotone"
                        dataKey="vouchers"
                        name="Vouchers"
                        stroke="#0084ff"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorVouchers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: SPARKLINES + PROGRESS DONUT RINGS */}
            <div className="flex flex-col gap-6">

              {/* CARD: USERS & MEMORY SPARKLINES */}
              <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 grid grid-cols-2 gap-4">
                {/* User Sparkline */}
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-0.5">
                      Total Usuários
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-slate-900">{stats.totalUsersCount}</span>
                      <span className="text-xs font-bold text-emerald-700">+2.12%</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">cadastrados</span>
                  </div>
                  <div className="h-12 w-full mt-2">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={USER_SPARKLINE}>
                          <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* RAM Sparkline */}
                <div className="flex flex-col justify-between border-l border-slate-200 pl-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-0.5">
                      RAM Livre
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-slate-900">{formatBytes(stats.freeMemory)}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">de {formatBytes(stats.totalMemory)}</span>
                  </div>
                  <div className="h-12 w-full mt-2">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MEM_SPARKLINE}>
                          <Line type="monotone" dataKey="v" stroke="#0084ff" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD: CIRCULAR PROGRESS DONUT (ONLINE VS OFFLINE) */}
              <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">
                    Conexões & Consumo
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Clientes conectados e ocupação de hardware
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2">
                  {/* Gauge 1: Online Users */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-rose-500"
                          strokeDasharray={`${Math.min(100, (stats.activeUsersCount / (stats.totalUsersCount || 1)) * 100)}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <Wifi className="w-4 h-4 text-rose-500 absolute" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-black text-slate-700 block leading-tight">
                        Online
                      </span>
                      <span className="text-lg font-black text-slate-900">{stats.activeUsersCount}</span>
                    </div>
                  </div>

                  {/* Gauge 2: Memory Load */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-amber-500"
                          strokeDasharray={`${memUsedPercent}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <Cpu className="w-4 h-4 text-amber-500 absolute" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-black text-slate-700 block leading-tight">
                        RAM Uso
                      </span>
                      <span className="text-lg font-black text-slate-900">{memUsedPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Storage: {formatBytes(stats.freeHdd)} livres</span>
                  <Link href="/dashboard/traffic" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold">
                    Ver tráfego <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </section>

          {/* ═══════════════════════════════════════════════════════════════
             3. BOTTOM SECTION: RECENT ACTIVITIES TABLE + LIVE EVENT LOGS
             ═══════════════════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: RECENT CLIENTS & TICKETS TABLE (WITH COLORFUL AVATARS) */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl lg:col-span-2 overflow-hidden flex flex-col justify-between">
              <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Atividades Recentes do Hotspot
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Conexões, cadastros e vouchers emitidos recentemente
                  </p>
                </div>
                <Link
                  href="/dashboard/users"
                  className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Cliente / Voucher</th>
                      <th>Data & Hora</th>
                      <th>Perfil / Plano</th>
                      <th>Status</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render up to 5 mock/real items */}
                    {[
                      { name: 'Alta Lucas', code: 'voucher_88291', date: 'Hoje às 10:30', plan: '1 Hora (R$ 5.00)', status: 'Ativo', color: 'bg-indigo-600' },
                      { name: 'Teresa Shaw', code: 'voucher_41029', date: 'Hoje às 09:15', plan: '3 Horas (R$ 10.00)', status: 'Ativo', color: 'bg-cyan-600' },
                      { name: 'Rosa Underwood', code: 'voucher_99412', date: 'Ontem às 22:40', plan: 'Diária (R$ 15.00)', status: 'Pendente', color: 'bg-rose-600' },
                      { name: 'Vilson Rowe', code: 'voucher_77314', date: 'Ontem às 18:20', plan: '1 Hora (R$ 5.00)', status: 'Ativo', color: 'bg-amber-600' },
                      { name: 'David Grey', code: 'voucher_66281', date: 'Ontem às 14:10', plan: 'Semanal (R$ 40.00)', status: 'Concluído', color: 'bg-emerald-600' },
                    ].map((row, idx) => {
                      const initials = row.name.split(' ').map(n => n[0]).join('').toUpperCase();
                      return (
                        <tr key={idx} className="group">
                          <td>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${row.color} text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0`}>
                                {initials}
                              </div>
                              <div>
                                <div className="font-black text-slate-900 text-xs leading-tight">{row.name}</div>
                                <div className="text-xs font-mono font-bold text-slate-700">{row.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-xs font-bold text-slate-800 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="text-xs font-black text-slate-900 whitespace-nowrap">
                            {row.plan}
                          </td>
                          <td className="whitespace-nowrap">
                            <span className={`saas-pill ${
                              row.status === 'Ativo' ? 'saas-pill-success' : row.status === 'Pendente' ? 'saas-pill-warning' : 'saas-pill-primary'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              type="button"
                              className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer mx-auto font-bold"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 border-t border-slate-200 bg-slate-100/70 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Exibindo 5 registros mais recentes</span>
                <Link href="/dashboard/leads" className="font-black text-blue-600 hover:text-blue-800">
                  Gerenciar Leads & Cadastros →
                </Link>
              </div>
            </div>

            {/* RIGHT: UPDATES / LIVE MIKROTIK EVENT LOGS */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
              <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Eventos do Roteador
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Telemetria e logs em tempo real
                  </p>
                </div>
                <span className="saas-pill saas-pill-primary text-xs font-bold">
                  auto 10s
                </span>
              </div>

              {/* TIMELINE LIST */}
              <div className="flex-1 overflow-y-auto max-h-[320px] custom-scrollbar py-3 space-y-4">
                {stats.logs?.length === 0 ? (
                  <p className="text-xs text-slate-600 font-bold text-center py-8">Nenhum evento registrado</p>
                ) : (
                  stats.logs?.slice(0, 6).map((l: any, i: number) => {
                    const isLogin = l.message?.includes('logged in');
                    const isLogout = l.message?.includes('logged out');
                    return (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          isLogin ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : isLogout ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-900 leading-tight">
                            {isLogin ? 'Usuário Conectado' : isLogout ? 'Usuário Desconectado' : l.topics || 'Sistema'}
                          </p>
                          <p className="text-xs font-mono font-bold text-slate-800 truncate mt-0.5">
                            {l.message}
                          </p>
                          <span className="text-[11px] font-bold text-slate-600 block mt-1">
                            {l.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Status: {stats.isProvisioned ? 'Provisionado' : 'Pronto'}</span>
                <Link
                  href="/dashboard/portal"
                  className="text-xs font-black text-blue-600 hover:text-blue-800"
                >
                  Editor do Portal →
                </Link>
              </div>
            </div>

          </section>

          {/* ═══════════════════════════════════════════════════════════════
             4. FOURTH SECTION: DISTRIBUTION + SALE REPORT + SALES OVERVIEW
             ═══════════════════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* CARD 1: DISTRIBUTION (70% DONUT) */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Distribuição de Tráfego
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Proporção de uso por categoria de rede
                </p>
              </div>

              {/* 70% Progress Gauge Ring */}
              <div className="flex flex-col items-center justify-center my-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-500"
                      strokeDasharray="70, 100"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-slate-900">70%</span>
                  </div>
                </div>

                {/* 3 Categories / Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span className="text-slate-600 font-medium">Hotspot</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-600 font-medium">Vouchers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 font-medium">Outros</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Ver Detalhes
              </button>
            </div>

            {/* CARD 2: SALE REPORT (BAR CHART) */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Relatório de Vendas
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Evolução mensal de receitas arrecadadas
                </p>
              </div>

              {/* Bar Chart */}
              <div className="w-full h-44 my-2">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BAR_CHART_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}k`} />
                      <Tooltip
                        cursor={{ fill: 'rgba(0, 132, 255, 0.05)' }}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      />
                      <Bar dataKey="vendas" fill="#0084ff" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Período: Últimos 6 meses</span>
                <span className="text-emerald-600 font-bold">+24.5% média</span>
              </div>
            </div>

            {/* CARD 3: SALES REPORT OVERVIEW */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Visão Geral Financeira
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Consolidação de transações, campanhas promocionais e cadastros de visitantes.
                </p>
              </div>

              {/* 3 Metrics in a row */}
              <div className="grid grid-cols-3 gap-2 my-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Vouchers
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">13,956</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Vendas (R$)
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">55,123</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Usuários
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">29,829</p>
                </div>
              </div>

              {/* Trend Tag */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mb-4">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>+15% a mais que a semana anterior</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={fetchStats}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm text-center"
                >
                  Atualizar
                </button>
                <Link
                  href="/dashboard/finance"
                  className="py-2 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors text-center block"
                >
                  Relatório
                </Link>
              </div>
            </div>

          </section>

          {/* ═══════════════════════════════════════════════════════════════
             5. FIFTH SECTION: FULL-WIDTH OPEN INVOICES / FATURAS TABLE
             ═══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Faturas & Vouchers Emitidos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registro de transações comerciais, ativações de planos e provisionamentos no MikroTik.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/finance"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Exportar CSV
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Fatura / Código</th>
                    <th>Cliente / Destino</th>
                    <th>Origem / Roteador</th>
                    <th>Valor do Plano</th>
                    <th>Valor Pago</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '50014', client: 'David Grey', router: 'Hotspot-Principal', fullPrice: 'R$ 30.00', paidPrice: 'R$ 30.00', status: 'Progress', statusColor: 'bg-emerald-500 text-white' },
                    { id: '50015', client: 'Stella Johnson', router: 'Wlan-Visitantes', fullPrice: 'R$ 15.00', paidPrice: 'R$ 15.00', status: 'Open', statusColor: 'bg-amber-500 text-white' },
                    { id: '50016', client: 'Marina Michel', router: 'Bridge-Local', fullPrice: 'R$ 20.00', paidPrice: 'R$ 0.00', status: 'On hold', statusColor: 'bg-rose-500 text-white' },
                    { id: '50017', client: 'John Doe', router: 'Hotspot-Principal', fullPrice: 'R$ 45.00', paidPrice: 'R$ 45.00', status: 'Progress', statusColor: 'bg-emerald-500 text-white' },
                    { id: '50018', client: 'Stella Johnson', router: 'AP-Externo', fullPrice: 'R$ 15.00', paidPrice: 'R$ 15.00', status: 'Open', statusColor: 'bg-amber-500 text-white' },
                    { id: '50019', client: 'David Grey', router: 'Hotspot-Principal', fullPrice: 'R$ 30.00', paidPrice: 'R$ 30.00', status: 'Progress', statusColor: 'bg-emerald-500 text-white' },
                  ].map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="font-mono font-bold text-slate-800 text-xs">
                        #{inv.id}
                      </td>
                      <td className="font-semibold text-slate-800 text-xs">
                        {inv.client}
                      </td>
                      <td className="text-xs text-slate-500">
                        {inv.router}
                      </td>
                      <td className="font-bold text-slate-700 text-xs">
                        {inv.fullPrice}
                      </td>
                      <td className="font-bold text-emerald-600 text-xs">
                        {inv.paidPrice}
                      </td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${inv.statusColor}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Mostrando 6 faturas recentes sincronizadas</span>
              <Link href="/dashboard/finance" className="font-semibold text-blue-600 hover:text-blue-700">
                Ver Histórico Completo de Faturas →
              </Link>
            </div>
          </section>
        </>
      ) : null}

    </main>
  );
}

