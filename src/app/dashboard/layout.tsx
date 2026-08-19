"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    document.cookie = 'system_auth=; Max-Age=0; path=/';
    document.cookie = 'mikro_session=; Max-Age=0; path=/';
    window.location.href = '/';
  };

  const NavLink = ({
    href,
    icon,
    children: label,
  }: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={`retro-nav-link ${isActive(href) ? 'active' : ''}`}
      onClick={() => setMobileMenuOpen(false)}
    >
      <span className="opacity-70 shrink-0">{icon}</span>
      <span>{label}</span>
      {isActive(href) && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full led led-blue animate-led-pulse" />
      )}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden font-sans"
      style={{ background: 'var(--chassis)' }}>

      {/* Mobile Top Bar */}
      <header className="md:hidden w-full text-white px-4 py-3 flex items-center justify-between z-50 sticky top-0"
        style={{
          background: 'linear-gradient(180deg, #1c1c38 0%, #14142a 100%)',
          borderBottom: '2px solid #0a0a18',
          boxShadow: '0 4px 0 #0a0a18, 0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
        }}>
        <div className="flex items-center gap-2.5">
          <div className="rack-screw" />
          <div className="flex items-center gap-1.5">
            <span className="led led-green animate-led-pulse" />
            <h2 className="text-base font-black tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Mikro<span style={{ color: 'var(--led-blue)' }}>Gestor</span>
            </h2>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          type="button"
          className="retro-btn retro-btn-dark w-9 h-9 p-0 rounded-lg"
          style={{ fontSize: '16px' }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Backdrop mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — Rack Panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 md:relative z-40 w-60 flex flex-col shrink-0 print:hidden
          transition-transform duration-300 ease-in-out md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #1e1e3c 0%, #16162e 100%)',
          borderRight: '3px solid #0a0a18',
          boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.4), 4px 0 0 #3d3d6b, 6px 0 12px rgba(0,0,0,0.5)',
        }}>

        {/* Brand Header */}
        <div className="p-4 flex items-center gap-2.5"
          style={{
            borderBottom: '2px solid #0a0a18',
            background: 'linear-gradient(180deg, #252548 0%, #1c1c38 100%)',
            boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.4), 0 2px 0 #3d3d6b'
          }}>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="rack-screw" />
            <div className="rack-screw" />
          </div>
          <div className="flex items-center gap-2 flex-1">
            {/* Logo chip */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                border: '2px solid #0a0a18',
                boxShadow: '0 3px 0 #1e3a8a, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9 9 0 0112.14 0M1.394 9h.01m21.196 0h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-none text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Mikro<span style={{ color: 'var(--led-blue)' }}>Gestor</span>
              </h2>
              <span className="text-[8px] font-bold tracking-widest uppercase block mt-0.5" style={{ color: '#4a4a7a' }}>
                Hotspot Gateway
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="rack-screw" />
            <div className="rack-screw" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar space-y-0.5">

          <div className="rack-label">Principal</div>
          <NavLink href="/dashboard" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }>Visão Geral</NavLink>

          <div className="rack-divider" />
          <div className="rack-label">Hotspot</div>

          <NavLink href="/dashboard/profiles" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }>Planos / Perfis</NavLink>

          <NavLink href="/dashboard/users" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }>Central de Vouchers</NavLink>

          <NavLink href="/dashboard/portal" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          }>Configurar Portal</NavLink>

          <div className="rack-divider" />
          <div className="rack-label">Serviços &amp; Rede</div>

          <NavLink href="/dashboard/traffic" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          }>Monitor de Tráfego</NavLink>

          <NavLink href="/dashboard/ppp" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }>PPPoE Secrets</NavLink>

          <NavLink href="/dashboard/dhcp" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-4v.01M12 12v.01M12 16v.01" />
            </svg>
          }>DHCP Leases</NavLink>

          <div className="rack-divider" />
          <div className="rack-label">Administração</div>

          <NavLink href="/dashboard/security" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }>Controle de Acesso</NavLink>

          <NavLink href="/dashboard/finance" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }>Financeiro / Vendas</NavLink>

          <NavLink href="/dashboard/admin" icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          }>Roteadores e Sistema</NavLink>
        </nav>

        {/* Footer — User + Logout */}
        <div className="p-3"
          style={{
            borderTop: '2px solid #0a0a18',
            background: 'linear-gradient(180deg, #14142c 0%, #0e0e22 100%)',
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4), 0 -1px 0 #3d3d6b'
          }}>
          {/* User info */}
          <div className="flex items-center gap-2.5 mb-3 px-1.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black"
                style={{
                  background: 'linear-gradient(180deg, #252548 0%, #1a1a36 100%)',
                  border: '2px solid #0a0a18',
                  boxShadow: '0 3px 0 #0a0a18, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                  color: '#6060a0'
                }}>
                SYS
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 led led-green" style={{ width: '8px', height: '8px', border: '1.5px solid #0e0e22' }} />
            </div>
            <div>
              <p className="text-[11px] font-black leading-none text-white">Administrador</p>
              <p className="text-[9px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: '#4a4a7a' }}>MikroTik Conectado</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            type="button"
            className="retro-btn retro-btn-danger w-full py-2 text-[10px]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden min-h-screen flex flex-col"
        style={{
          background: 'linear-gradient(180deg, var(--chassis) 0%, #0e0e20 100%)',
        }}>
        {children}
      </div>
    </div>
  );
}
