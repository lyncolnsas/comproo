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
    <main className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header as a Rack Module */}
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-blue animate-led-pulse" />
        <div>
          <div style={{ color: 'var(--led-blue)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ INTERFACES // PPPoE SECRETS DATABASE
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            PPP / PPPoE Secrets
          </h1>
        </div>
        <div className="ml-auto rack-screw" />
      </header>

      {/* Main Table Card */}
      <div className="retro-card overflow-hidden">
        {/* Module Header Bar */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="rack-screw" />
            <span className="font-mono text-xs font-bold text-slate-450 uppercase tracking-wider">SECURE_TUNNELS_ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="retro-badge retro-badge-blue font-mono">{secrets.length} SECRETS</span>
            <div className="rack-screw" />
          </div>
        </div>

        {/* Retro Table */}
        <div className="p-4">
          <div className="retro-table-wrap">
            <table className="w-full text-left text-xs border-collapse">
              <thead style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18' }}>
                <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Nome (Usuário)</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Perfil (Profile)</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                      <div className="inline-block animate-pulse">Consultando registros PPP no roteador...</div>
                    </td>
                  </tr>
                ) : secrets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                      Nenhum usuário PPPoE encontrado na base ativa.
                    </td>
                  </tr>
                ) : (
                  secrets.map((secret, index) => (
                    <tr key={`${secret.id || secret.name}-${index}`} className="hover:bg-[#101026]/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-sm tracking-wide">{secret.name}</td>
                      <td className="px-6 py-4 text-slate-400 uppercase font-mono text-[10px]">{secret.service}</td>
                      <td className="px-6 py-4 font-bold text-[#7dd3fc]">{secret.profile}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`retro-badge ${secret.disabled ? 'retro-badge-red' : 'retro-badge-green'}`}>
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
