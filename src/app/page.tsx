"use client";

import { useEffect, useState } from 'react';

export default function SystemLogin() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    return <main style={{ minHeight: '100vh', background: '#0c0c18' }} />;
  }

  return (
    <main
      className="aurora-scene min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: '#0c0c18' }}
    >
      {/* ── Aurora Blobs ───────────────────────────────────────────────── */}
      <div className="aurora-blob blob-indigo"
        style={{ width: '520px', height: '520px', top: '-160px', left: '-160px', animationDelay: '0s' }} />
      <div className="aurora-blob blob-cyan aurora-blob-reverse"
        style={{ width: '420px', height: '420px', bottom: '-130px', right: '-130px', animationDelay: '-5s' }} />
      <div className="aurora-blob blob-violet"
        style={{ width: '340px', height: '340px', top: '-80px', left: '50%', transform: 'translateX(-50%)', animationDelay: '-3s', opacity: 0.55 }} />
      <div className="aurora-blob blob-indigo aurora-blob-reverse"
        style={{ width: '280px', height: '280px', bottom: '-90px', left: '-50px', animationDelay: '-9s', opacity: 0.45 }} />
      <div className="aurora-blob blob-cyan"
        style={{ width: '260px', height: '260px', top: '-70px', right: '-70px', animationDelay: '-1s', opacity: 0.35 }} />

      {/* ── Login Card ─────────────────────────────────────────────────── */}
      <div
        className="aurora-card w-full max-w-sm animate-fade-in"
        style={{ padding: '2.5rem 2rem' }}
      >
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #2dd4bf 100%)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.45), 0 2px 8px rgba(45,212,191,0.25)',
            }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9 9 0 0112.14 0M1.394 9h.01m21.196 0h.01" />
            </svg>
          </div>

          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Mikro<span style={{ color: '#818cf8' }}>Gestor</span>
          </h1>
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Hotspot Gateway v2.0
          </p>

          {/* Online indicator */}
          <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 6px #22c55e', animation: 'led-pulse 2s ease-in-out infinite' }} />
            <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#4ade80' }}>
              Sistema Online
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Usuário
            </label>
            <input
              id="login-username"
              type="text"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="ex: mikrogestor"
              className="aurora-input"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="aurora-input"
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="aurora-btn w-full mt-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Autenticando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar no Painel
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] mt-6" style={{ color: 'rgba(255,255,255,0.18)' }}>
          MikroGestor © 2025 — Sistema de Gestão Hotspot
        </p>
      </div>
    </main>
  );
}
