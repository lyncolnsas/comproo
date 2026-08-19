"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ── Icon shortcuts ─────────────────────────────────────────────────── */
const Icon = ({ d }: { d: string }) => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  overview:  "M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  profiles:  "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  users:     "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  portal:    "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  traffic:   "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z",
  ppp:       "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  dhcp:      "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8v.01M12 12v.01",
  security:  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  finance:   "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  admin:     "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  whatsapp:  "M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21zm5.5-12.5a.5.5 0 00-.5.5c0 1.5 1.5 4 3 5s3.5 1.5 4 .5.5-1 0-1.5l-2-.5c-.5 0-1 .5-1.5 0s-2-1.5-2-2 .5-1 0-1.5l-.5-2c-.5-.5-1 0-1.5 0z",
  leads:     "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  store:     "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
};

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',          label: 'Visão Geral',       icon: 'overview'  },
    ],
  },
  {
    label: 'Hotspot',
    items: [
      { href: '/dashboard/profiles', label: 'Planos / Perfis',   icon: 'profiles'  },
      { href: '/dashboard/users',    label: 'Central de Vouchers', icon: 'users'   },
      { href: '/dashboard/portal',   label: 'Configurar Portal', icon: 'portal'    },
    ],
  },
  {
    label: 'Serviços & Rede',
    items: [
      { href: '/dashboard/traffic',  label: 'Monitor de Tráfego', icon: 'traffic'  },
      { href: '/dashboard/ppp',      label: 'PPPoE Secrets',     icon: 'ppp'       },
      { href: '/dashboard/dhcp',     label: 'DHCP Leases',       icon: 'dhcp'      },
    ],
  },
  {
    label: 'Administração',
    items: [
      { href: '/dashboard/whatsapp', label: 'Conexão WhatsApp', icon: 'whatsapp' },
      { href: '/dashboard/whatsapp-plans', label: 'Planos WhatsApp', icon: 'store' },
      { href: '/dashboard/leads',    label: 'Leads / Cobranças', icon: 'leads' },
      { href: '/dashboard/security', label: 'Controle de Acesso', icon: 'security' },
      { href: '/dashboard/finance',  label: 'Financeiro / Vendas', icon: 'finance' },
      { href: '/dashboard/admin',    label: 'Roteadores e Sistema', icon: 'admin'  },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = 'system_auth=; Max-Age=0; path=/';
    document.cookie = 'mikro_session=; Max-Age=0; path=/';
    window.location.href = '/';
  };

  return (
    /* Root: aurora-scene para blobs, sem overflow:hidden aqui */
    <div
      className="aurora-scene min-h-screen flex flex-col md:flex-row font-sans"
      style={{ background: '#0c0c18' }}
    >
      {/* ── Aurora Blobs (fundo fixo sem quebrar position: sticky) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora-blob blob-indigo"
          style={{ width: '600px', height: '600px', top: '-200px', left: '0%', animationDelay: '0s', opacity: 0.28 }} />
        <div className="aurora-blob blob-cyan aurora-blob-reverse"
          style={{ width: '500px', height: '500px', bottom: '-160px', right: '5%', animationDelay: '-6s', opacity: 0.22 }} />
        <div className="aurora-blob blob-violet"
          style={{ width: '400px', height: '400px', top: '30%', right: '20%', animationDelay: '-3s', opacity: 0.16 }} />
      </div>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(12,12,24,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #2dd4bf)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9 9 0 0112.14 0" />
            </svg>
          </div>
          <span className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Mikro<span style={{ color: '#818cf8' }}>Gestor</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-56 flex flex-col shrink-0',
          'md:sticky md:top-0 md:h-screen md:translate-x-0',
          'transition-transform duration-300 ease-in-out',
          'print:hidden',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{
          background: 'rgba(10,10,22,0.85)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #2dd4bf)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}
          >
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9 9 0 0112.14 0M1.394 9h.01m21.196 0h.01" />
            </svg>
          </div>
          <div>
            <div
              className="text-sm font-black text-white leading-none"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Mikro<span style={{ color: '#818cf8' }}>Gestor</span>
            </div>
            <div
              className="text-[9px] font-semibold uppercase tracking-widest mt-0.5"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Hotspot Gateway
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-1">
              {/* Section label */}
              <div
                className="px-4 pt-4 pb-1.5 text-[9px] font-bold uppercase tracking-[0.15em]"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {section.label}
              </div>

              {/* Links */}
              {section.items.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 mx-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all relative group"
                    style={{
                      color: active ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                      background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {/* Active bar */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r"
                        style={{ background: 'linear-gradient(180deg, #6366f1, #2dd4bf)' }}
                      />
                    )}
                    <Icon d={ICONS[item.icon as keyof typeof ICONS]} />
                    <span>{item.label}</span>
                    {active && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#818cf8', boxShadow: '0 0 6px #6366f1' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer — user + logout */}
        <div
          className="p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8',
              }}
            >
              SYS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white leading-none">Administrador</p>
              <p className="text-[9px] mt-0.5 uppercase tracking-wider truncate"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                MikroTik Online
              </p>
            </div>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: '#4ade80', boxShadow: '0 0 6px #22c55e' }}
            />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-semibold transition-all"
            style={{
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <Icon d={ICONS.logout} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
