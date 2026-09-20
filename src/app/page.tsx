"use client";

import { useState } from 'react';

export default function SystemLogin() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass) {
      setError('Por favor, informe o usuário e a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.trim(), password: pass }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        window.location.href = '/dashboard';
        return;
      }

      if (res.status === 429) {
        setError(data?.message || 'Muitas tentativas incorretas. Acesso bloqueado temporariamente por 15 minutos.');
      } else if (data?.message) {
        const remainingInfo =
          typeof data.remainingAttempts === 'number' && data.remainingAttempts < 3
            ? ` (${data.remainingAttempts} tentativa(s) restante(s))`
            : '';
        setError(`${data.message}${remainingInfo}`);
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (networkError) {
      console.error('Erro de conexão ao autenticar:', networkError);
      setError('Não foi possível conectar ao servidor. Verifique se o serviço está ativo.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="w-full max-w-sm bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md animate-fade-in z-10">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.4), 0 2px 8px rgba(6,182,212,0.25)',
            }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9 9 0 0112.14 0M1.394 9h.01m21.196 0h.01" />
            </svg>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Mikro<span className="text-blue-400">Gestor</span>
          </h1>
          <p className="text-xs font-semibold text-slate-300 mt-1">
            Hotspot Gateway v2.0
          </p>

          {/* Online indicator */}
          <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
              Sistema Online
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3 bg-rose-500/20 border border-rose-500/50">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span className="text-xs font-bold text-rose-200">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Usuário
            </label>
            <input
              id="login-username"
              type="text"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="ex: mikrogestor"
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:bg-slate-800/90 text-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-slate-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:bg-slate-800/90 text-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-slate-500"
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Entrar no Painel</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-slate-400 mt-6">
          MikroGestor © 2025 — Sistema de Gestão Hotspot
        </p>
      </div>
    </main>
  );
}
