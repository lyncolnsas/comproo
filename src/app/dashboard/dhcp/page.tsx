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
    <main className="w-full p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#f59e0b' }}
          >
            ▶ NETWORK // DHCP ACTIVE LEASES
          </p>
          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            DHCP Leases
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Concessões DHCP ativas e mapeamento de endereços IP na rede
          </p>
        </div>
      </header>

      {/* Main Table Card */}
      <div className="aurora-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Network Clients Identified</h2>
            <p className="text-xs text-white/30 mt-0.5">Dispositivos conectados que receberam IPs via DHCP</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-400 tracking-wider uppercase">
            {leases.length} LEASES
          </span>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-white/40">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Endereço IP</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">MAC Address</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Host Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Servidor</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                      <div className="inline-block animate-pulse">Lendo leases ativas no pool DHCP do roteador...</div>
                    </td>
                  </tr>
                ) : leases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                      Nenhum dispositivo com lease DHCP registrada na rede.
                    </td>
                  </tr>
                ) : (
                  leases.map((lease, index) => (
                    <tr key={`${lease.id || lease.address}-${index}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-300 text-sm tracking-wide font-sans">{lease.address}</td>
                      <td className="px-6 py-4 text-slate-400 uppercase text-[10px]">{lease.mac}</td>
                      <td className="px-6 py-4 font-bold text-white font-sans">{lease.hostName || <span className="text-slate-600 italic">sem hostname</span>}</td>
                      <td className="px-6 py-4 text-slate-400 font-sans">{lease.server}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${lease.status === 'bound' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'}`}>
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
