"use client";

import { useState } from 'react';

type LoginStep = 'CREDENTIALS' | 'OTP_WHATSAPP' | 'EMERGENCY_TOKEN';

export default function SystemLogin() {
  const [step, setStep] = useState<LoginStep>('CREDENTIALS');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [emergencyToken, setEmergencyToken] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  // Etapa 1: Validação de Credenciais
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass) {
      setError('Por favor, informe o usuário e a senha.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessInfo('');

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.trim(), password: pass }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429) {
          setError(data?.message || 'Muitas tentativas incorretas. Acesso bloqueado por 15 minutos.');
        } else if (data?.message) {
          const remainingInfo =
            typeof data.remainingAttempts === 'number' && data.remainingAttempts < 3
              ? ` (${data.remainingAttempts} tentativa(s) restante(s))`
              : '';
          setError(`${data.message}${remainingInfo}`);
        } else {
          setError('Usuário ou senha incorretos.');
        }
        return;
      }

      // Se 2FA não for necessário (sem telefone configurado ou login direto)
      if (data?.otpRequired === false) {
        if (data?.emergencyFallback) {
          // WhatsApp indisponível, mas tem tokens de emergência cadastrados
          setEmergencyAvailable(true);
          setStep('EMERGENCY_TOKEN');
          setError('WhatsApp offline. Utilize um Token de Emergência para prosseguir.');
          return;
        }
        // Login direto efetuado com sucesso (cookie já emitido)
        window.location.href = '/dashboard';
        return;
      }

      // Se 2FA ativo -> avança para tela de OTP
      if (data?.otpRequired === true) {
        setMaskedPhone(data.maskedPhone || 'seu WhatsApp');
        setEmergencyAvailable(!!data.emergencyAvailable);
        setStep('OTP_WHATSAPP');
        setSuccessInfo(`Código enviado para ${data.maskedPhone || 'seu WhatsApp'}.`);
        return;
      }

      setError('Resposta inesperada do servidor.');
    } catch (networkError) {
      console.error('Erro de conexão ao autenticar:', networkError);
      setError('Não foi possível conectar ao servidor. Verifique a rede.');
    } finally {
      setLoading(false);
    }
  };

  // Etapa 2A: Verificação do Código OTP recebido no WhatsApp
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Informe o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.trim(), code: otpCode.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        window.location.href = '/dashboard';
        return;
      }

      setError(data?.message || 'Código inválido ou expirado.');
    } catch (err) {
      setError('Erro de conexão ao validar o código.');
    } finally {
      setLoading(false);
    }
  };

  // Etapa 2B: Fallback de Segurança com Token Offline de Emergência
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyToken.trim()) {
      setError('Informe o token de emergência.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/emergency-tokens/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.trim(), token: emergencyToken.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        window.location.href = '/dashboard';
        return;
      }

      setError(data?.message || 'Token de emergência inválido ou já utilizado.');
    } catch (err) {
      setError('Erro de conexão ao validar token de emergência.');
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

      {/* ── Login Card ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md animate-fade-in z-10">
        
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
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
          <p className="text-xs font-semibold text-slate-300 mt-0.5">
            Hotspot Gateway v2.0 • Proteção 2FA
          </p>

          {/* Status pill */}
          <div className="flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300">
              {step === 'CREDENTIALS' ? 'Acesso Seguro' : step === 'OTP_WHATSAPP' ? 'Autenticação 2FA' : 'Modo de Emergência'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 bg-rose-500/20 border border-rose-500/50">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span className="text-xs font-bold text-rose-200">{error}</span>
          </div>
        )}

        {/* Success / Info Message */}
        {successInfo && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 bg-blue-500/20 border border-blue-500/40">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-blue-200">{successInfo}</span>
          </div>
        )}

        {/* ── TELA 1: Credenciais ── */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Usuário
              </label>
              <input
                id="login-username"
                type="text"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="ex: admin"
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all placeholder:text-slate-500"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  {showPass ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all placeholder:text-slate-500 pr-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Prosseguir</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── TELA 2: Código OTP via WhatsApp ── */}
        {step === 'OTP_WHATSAPP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
              <span className="text-2xl mb-1 block">📱</span>
              <p className="text-xs text-slate-300">
                Enviamos um código de 6 dígitos via WhatsApp para:
              </p>
              <p className="text-xs font-bold text-blue-400 mt-0.5">{maskedPhone}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 text-center">
                Código de Verificação (6 dígitos)
              </label>
              <input
                id="login-otp"
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-xl font-mono bg-slate-800 border border-slate-600 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-500 placeholder:text-sm"
                autoFocus
              />
            </div>

            <button
              id="otp-submit"
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar e Entrar</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </>
              )}
            </button>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => { setStep('CREDENTIALS'); setOtpCode(''); }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Voltar e alterar credenciais
              </button>

              {emergencyAvailable && (
                <button
                  type="button"
                  onClick={() => { setStep('EMERGENCY_TOKEN'); setError(''); }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>📴 WhatsApp inacessível? Usar Token de Emergência</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── TELA 3: Token Offline de Emergência ── */}
        {step === 'EMERGENCY_TOKEN' && (
          <form onSubmit={handleEmergencySubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span className="text-2xl mb-1 block">🚨</span>
              <p className="text-xs text-amber-200 font-bold">
                Modo de Recuperação Offline
              </p>
              <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                Utilize um dos tokens pré-gerados salvos no seu grupo seguro ou guardados offline.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 text-center">
                Token de Emergência
              </label>
              <input
                id="emergency-token"
                type="text"
                required
                value={emergencyToken}
                onChange={(e) => setEmergencyToken(e.target.value.toUpperCase())}
                placeholder="EMG-XXXX-XXXX"
                className="w-full text-center font-mono text-base uppercase bg-slate-800 border border-slate-600 focus:border-amber-500 text-amber-300 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-500 placeholder:text-sm"
                autoFocus
              />
            </div>

            <button
              id="emergency-submit"
              type="submit"
              disabled={loading || !emergencyToken.trim()}
              className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Verificando Token...</span>
                </>
              ) : (
                <>
                  <span>Desbloquear Painel</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 12.75v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </>
              )}
            </button>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => { setStep('CREDENTIALS'); setEmergencyToken(''); setError(''); }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Voltar para login normal
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] font-medium text-slate-500 mt-6">
          MikroGestor © 2026 — Hotspot Gateway Enterprise
        </p>
      </div>
    </main>
  );
}
