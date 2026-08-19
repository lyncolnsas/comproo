"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RouterOffline from '@/components/RouterOffline';

export default function DHCPLeases() {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const res = await fetch('/api/dhcp');
        if (res.status === 401) {
          setNotConnected(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.success) {
          setLeases(data.data);
          setNotConnected(false);
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    fetchLeases();
  }, []);

  if (notConnected) {
    return (
      <RouterOffline 
        title="DHCP Leases" 
        description="Dispositivos conectados na rede local" 
      />
    );
  }

  return (
    <main className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header as a Rack Module */}
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-amber animate-led-pulse" />
        <div>
          <div style={{ color: 'var(--led-amber)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ NETWORK // DHCP ACTIVE LEASES
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            DHCP Leases
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
            <span className="font-mono text-xs font-bold text-slate-450 uppercase tracking-wider">NETWORK_CLIENTS_IDENTIFIED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="retro-badge retro-badge-amber font-mono">{leases.length} LEASES</span>
            <div className="rack-screw" />
          </div>
        </div>

        {/* Retro Table */}
        <div className="p-4">
          <div className="retro-table-wrap">
            <table className="w-full text-left text-xs border-collapse">
              <thead style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18' }}>
                <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Endereço IP</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">MAC Address</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Host Name</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Servidor</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                      <div className="inline-block animate-pulse">Lendo leases ativas no pool DHCP do roteador...</div>
                    </td>
                  </tr>
                ) : leases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                      Nenhum dispositivo com lease DHCP registrada na rede.
                    </td>
                  </tr>
                ) : (
                  leases.map((lease, index) => (
                    <tr key={`${lease.id || lease.address}-${index}`} className="hover:bg-[#101026]/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#7dd3fc] text-sm tracking-wide">{lease.address}</td>
                      <td className="px-6 py-4 text-slate-400 uppercase font-mono text-[10px]">{lease.mac}</td>
                      <td className="px-6 py-4 font-bold text-white">{lease.hostName || <span className="text-slate-650 italic">sem hostname</span>}</td>
                      <td className="px-6 py-4 text-slate-400">{lease.server}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`retro-badge ${lease.status === 'bound' ? 'retro-badge-green' : 'retro-badge-amber'}`}>
                          {lease.status.toUpperCase()}
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
