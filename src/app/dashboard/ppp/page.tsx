"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RouterOffline from '@/components/RouterOffline';

export default function PPPoESecrets() {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const res = await fetch('/api/ppp');
        if (res.status === 401) {
          setNotConnected(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.success) {
          setSecrets(data.data);
          setNotConnected(false);
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    fetchSecrets();
  }, []);

  if (notConnected) {
    return (
      <RouterOffline 
        title="PPP / PPPoE Secrets" 
        description="Gerencie os usuários PPPoE conectados" 
      />
    );
  }

  return (
    <main className="w-full p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#3b82f6' }}
          >
            ▶ INTERFACES // PPPoE SECRETS DATABASE
          </p>
          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            PPPoE Secrets
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Gerenciamento de usuários e segredos PPPoE do MikroTik
          </p>
        </div>
      </header>

      {/* Main Table Card */}
      <div className="aurora-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Secure Tunnels Active</h2>
            <p className="text-xs text-white/30 mt-0.5">Usuários cadastrados no servidor PPPoE</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#818cf8]/35 bg-[#818cf8]/10 text-[#a5b4fc] tracking-wider uppercase">
            {secrets.length} SECRETS
          </span>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-white/40">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Nome (Usuário)</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Perfil (Profile)</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                      <div className="inline-block animate-pulse">Consultando registros PPP no roteador...</div>
                    </td>
                  </tr>
                ) : secrets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                      Nenhum usuário PPPoE encontrado na base ativa.
                    </td>
                  </tr>
                ) : (
                  secrets.map((secret, index) => (
                    <tr key={`${secret.id || secret.name}-${index}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-sm tracking-wide font-sans">{secret.name}</td>
                      <td className="px-6 py-4 text-slate-400 uppercase text-[10px]">{secret.service}</td>
                      <td className="px-6 py-4 font-bold text-indigo-300 font-sans">{secret.profile}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${secret.disabled ? 'border-rose-500/20 bg-rose-500/10 text-rose-450' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'}`}>
                          {secret.disabled ? 'DESATIVADO' : 'ATIVO'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
