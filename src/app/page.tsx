"use client";

import { useEffect, useState } from 'react';

export default function SystemLogin() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [powering, setPowering] = useState(true);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setPowering(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.trim(), password: pass.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Usuário ou senha incorretos.');
        setLoading(false);
      }
    } catch {
      setError('Erro ao se conectar ao banco de dados local.');
      setLoading(false);
    }
  };

  if (!mounted) {
    return <main style={{ minHeight: '100vh', background: 'var(--chassis)' }} />;
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'var(--chassis)',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px),
          radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(30,30,60,0.6) 0%, transparent 60%)
        `
      }}>

      {/* Scan line sweep effect on power-on */}
      {powering && (
        <div
          className="fixed inset-x-0 h-1 z-50 pointer-events-none animate-power-on"
          style={{
            background: 'rgba(59,130,246,0.4)',
            boxShadow: '0 0 20px rgba(59,130,246,0.6)',
            animation: 'scan-sweep 0.6s ease-out forwards'
          }}
        />
      )}

      <div
        className={`relative w-full max-w-sm ${powering ? 'animate-power-on' : 'animate-scale-up'}`}>

        {/* Rack unit container */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(180deg, #222242 0%, #1c1c38 100%)',
            border: '3px solid #0a0a18',
            borderRadius: '16px',
            boxShadow: `
              0 0 0 1px #3d3d6b,
              0 12px 0 #0a0a18,
              0 16px 30px rgba(0,0,0,0.8),
              inset 0 1px 0 rgba(255,255,255,0.07),
              inset 0 -2px 0 rgba(0,0,0,0.4)
            `
          }}>

          {/* Top rack rail */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{
              borderBottom: '2px solid #0a0a18',
              background: 'linear-gradient(180deg, #2a2a4c 0%, #1e1e3a 100%)',
              borderRadius: '12px 12px 0 0',
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.4)'
            }}>
            <div className="flex items-center gap-1.5">
              <div className="rack-screw" />
              <div className="rack-screw" />
            </div>
            {/* Power LED cluster */}
            <div className="flex items-center gap-2">
              <div className="led led-red" style={{ width: '7px', height: '7px' }} />
              <div className="led led-amber animate-led-pulse" style={{ width: '7px', height: '7px' }} />
              <div className="led led-green animate-led-pulse" style={{ width: '7px', height: '7px' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="rack-screw" />
              <div className="rack-screw" />
            </div>
          </div>

          {/* Main panel body */}
          <div className="p-6">

            {/* Brand display */}
            <div className="retro-display px-5 py-4 mb-6 text-center">
              <div className="text-[8px] font-bold tracking-widest uppercase mb-2" style={{ color: '#2563ab', fontFamily: 'Share Tech Mono, monospace' }}>
                ▶ SYSTEM AUTHENTICATION REQUIRED
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Mikro<span style={{ color: 'var(--led-blue)' }}>Gestor</span>
              </h1>
              <p className="text-[10px] mt-2" style={{ color: 'var(--display-dim)', fontFamily: 'Share Tech Mono, monospace' }}>
                HOTSPOT GATEWAY v2.0
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="led led-green animate-led-pulse" style={{ width: '6px', height: '6px' }} />
                <span className="text-[9px]" style={{ color: 'var(--led-green)', fontFamily: 'Share Tech Mono, monospace' }}>
                  SISTEMA ONLINE
                </span>
                <span className="animate-cursor text-[9px]" style={{ color: 'var(--led-green)' }}>_</span>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="retro-display px-4 py-3 mb-5 flex items-center gap-3"
                style={{ borderColor: '#7f1d1d', boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.8), 0 0 12px rgba(239,68,68,0.1), 0 0 0 1px #7f1d1d' }}>
                <span className="led led-red animate-led-blink shrink-0" />
                <span className="text-[11px] font-bold" style={{ color: '#f87171', fontFamily: 'Share Tech Mono, monospace' }}>
                  ERR: {error}
                </span>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#4a4a7a' }}>
                  ▶ Identificação do Usuário
                </label>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="ex: mikrogestor"
                  className="retro-input"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#4a4a7a' }}>
                  ▶ Senha de Acesso
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="retro-input"
                  autoComplete="current-password"
                />
              </div>

              {/* Submit button — full physical mechanics */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="retro-btn retro-btn-primary w-full py-3 mt-2 text-xs"
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="led led-amber animate-led-blink" style={{ width: '7px', height: '7px' }} />
                    AUTENTICANDO...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    ENTRAR NO PAINEL
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Bottom rack rail */}
          <div className="flex items-center justify-between px-4 py-2"
            style={{
              borderTop: '2px solid #0a0a18',
              background: 'linear-gradient(180deg, #1a1a34 0%, #141428 100%)',
              borderRadius: '0 0 12px 12px',
              boxShadow: 'inset 0 3px 4px rgba(0,0,0,0.4)'
            }}>
            <div className="flex items-center gap-1.5">
              <div className="rack-screw" />
              <div className="rack-screw" />
            </div>
            <span className="text-[8px] font-bold tracking-widest" style={{ color: '#2a2a48', fontFamily: 'Share Tech Mono, monospace' }}>
              MIKROGESTOR-RU1 © 2025
            </span>
            <div className="flex items-center gap-1.5">
              <div className="rack-screw" />
              <div className="rack-screw" />
            </div>
          </div>
        </div>

        {/* Bottom shadow extrusion (3D effect) */}
        <div
          className="absolute inset-x-4 -bottom-3 -z-10 rounded-2xl"
          style={{
            height: '12px',
            background: '#0a0a18',
            filter: 'blur(4px)',
            opacity: 0.8
          }}
        />
      </div>
    </main>
  );
}
