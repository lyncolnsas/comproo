"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RouterOffline from '@/components/RouterOffline';

export default function SecurityControl() {
  const [activeTab, setActiveTab] = useState<'walled-garden' | 'time-block' | 'keywords'>('walled-garden');
  const [notConnected, setNotConnected] = useState(false);
  
  // Walled Garden States
  const [rules, setRules] = useState<any[]>([]);
  const [walledLoading, setWalledLoading] = useState(true);
  const [host, setHost] = useState('');
  const [action, setAction] = useState('allow');
  const [comment, setComment] = useState('');
  
  // Time Block States
  const [startHour, setStartHour] = useState('22:00:00');
  const [endHour, setEndHour] = useState('06:00:00');
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeRules, setTimeRules] = useState<any[]>([]);

  // Keywords States
  const [keywords, setKeywords] = useState<any[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsLoading, setKeywordsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWalledGardenRules = async () => {
    setWalledLoading(true);
    try {
      const res = await fetch('/api/security/walled-garden');
      if (res.status === 401) {
        setNotConnected(true);
        setWalledLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRules(data.data);
        setNotConnected(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWalledLoading(false);
    }
  };

  const fetchKeywords = async () => {
    setKeywordsLoading(true);
    try {
      const res = await fetch('/api/security/keywords');
      if (res.status === 401) {
        setNotConnected(true);
        setKeywordsLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setKeywords(data.data);
        setNotConnected(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const fetchTimeRules = async () => {
    setTimeLoading(true);
    try {
      const res = await fetch('/api/security/time-block');
      if (res.status === 401) {
        setNotConnected(true);
        setTimeLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTimeRules(data.data);
        setNotConnected(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchWalledGardenRules();
      fetchKeywords();
      fetchTimeRules();
    }, 0);
  }, []);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalledLoading(true);
    try {
      await fetch('/api/security/walled-garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, host, comment })
      });
      setHost('');
      setComment('');
      fetchWalledGardenRules();
    } catch (err) {
      setWalledLoading(false);
    }
  };

  const handleWhitelistMikroGestor = async () => {
    setWalledLoading(true);
    try {
      // 1. Fetch server LAN IP and MAC from backend
      const ipRes = await fetch('/api/system/network');
      const ipData = await ipRes.json();
      let targetIp = window.location.hostname;
      let targetMac = '';
      
      if (ipData.success && ipData.ip && ipData.ip !== '127.0.0.1') {
        targetIp = ipData.ip;
        targetMac = ipData.mac || '';
      }
      
      // 2. Add rule to Walled Garden & Auto-Create IP Binding
      await fetch('/api/security/walled-garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'allow', 
          host: targetIp, 
          mac: targetMac,
          comment: 'MikroGestor Auto-Cadastro / API' 
        })
      });
      alert(`Servidor ${targetIp} (MAC: ${targetMac || 'N/A'}) liberado com sucesso no Walled Garden e IP Bindings!`);
      fetchWalledGardenRules();
    } catch (err) {
      alert('Erro ao liberar servidor.');
      setWalledLoading(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    setWalledLoading(true);
    try {
      await fetch('/api/security/walled-garden', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchWalledGardenRules();
    } catch (err) {
      setWalledLoading(false);
    }
  };

  const handleAddTimeBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeLoading(true);
    const activeDays = 'sun,mon,tue,wed,thu,fri,sat';
    
    try {
      const res = await fetch('/api/security/time-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: startHour, endTime: endHour, days: activeDays, comment: 'Bloqueio Geral' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Regra de bloqueio de horário ativada com sucesso no MikroTik!');
        fetchTimeRules();
      } else {
        alert('Erro ao criar regra: ' + data.message);
      }
    } catch (err) {
      alert('Erro ao criar regra de bloqueio.');
    } finally {
      setTimeLoading(false);
    }
  };

  const handleDeleteTimeRule = async (id: string) => {
    setTimeLoading(true);
    try {
      const res = await fetch('/api/security/time-block', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchTimeRules();
      } else {
        alert(data.message || 'Erro ao remover regra.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeLoading(false);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/security/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keywordInput })
      });
      const data = await res.json();
      if (data.success) {
        setKeywordInput('');
        fetchKeywords();
      } else {
        alert(data.message || 'Erro ao adicionar palavra-chave.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKeyword = async (keyword: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/security/keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      const data = await res.json();
      if (data.success) {
        fetchKeywords();
      } else {
        alert(data.message || 'Erro ao remover palavra-chave.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (notConnected) {
    return (
      <RouterOffline 
        title="Segurança e Acessos" 
        description="Gerencie firewalls, sites liberados pré-login e bloqueio por palavras-chave" 
      />
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-red animate-led-pulse" />
        <div>
          <div style={{ color: 'var(--led-red)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ SECURITY // ROUTER FIREWALL GATEKEEPER
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            Segurança e Acessos
          </h1>
        </div>
        <div className="ml-auto rack-screw" />
      </header>

      {/* Tabs Menu styled as physical key switches */}
      <div className="flex flex-wrap gap-3 bg-[#0a0a18]/40 p-2.5 rounded-xl border border-[#252542] w-fit shadow-[inset_0_2px_5px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setActiveTab('walled-garden')}
          className={`retro-btn ${activeTab === 'walled-garden' ? 'retro-btn-primary' : 'retro-btn-dark'}`}
        >
          🌐 Sites Walled Garden
        </button>
        <button
          onClick={() => setActiveTab('time-block')}
          className={`retro-btn ${activeTab === 'time-block' ? 'retro-btn-primary' : 'retro-btn-dark'}`}
        >
          🕒 Bloqueio de Horário
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`retro-btn ${activeTab === 'keywords' ? 'retro-btn-primary' : 'retro-btn-dark'}`}
        >
          🚫 Palavras-Chave
        </button>
      </div>

      {/* Tab Content Cabinet */}
      <div className="space-y-6">
        
        {/* Walled Garden Tab */}
        {activeTab === 'walled-garden' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1 retro-card">
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
                <div className="rack-screw" />
                <span className="font-mono text-xs font-bold text-slate-450">CREATE_RULE_MODULE</span>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Permita ou bloqueie domínios de passarem pelo Portal de Hotspot antes de realizar o login na rede.
                </p>
                
                <form onSubmit={handleAddSite} className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Domínio / Host</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      required
                      placeholder="Ex: google.com"
                      className="retro-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Ação</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="retro-input"
                      style={{ background: '#06080e' }}
                    >
                      <option value="allow" className="bg-[#0c0c18]">Liberar (Permitir)</option>
                      <option value="deny" className="bg-[#0c0c18]">Bloquear (Negar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Comentário</label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ex: Liberar updates"
                      className="retro-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={walledLoading}
                    className="w-full retro-btn retro-btn-primary"
                  >
                    {walledLoading ? 'Processando...' : 'Adicionar Regra'}
                  </button>
                </form>

                <div className="pt-4 border-t border-[#0a0a18]" style={{ boxShadow: '0 -1px 0 rgba(255,255,255,0.03)' }}>
                  <span className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Acesso Rápido</span>
                  <button
                    type="button"
                    onClick={handleWhitelistMikroGestor}
                    disabled={walledLoading}
                    className="w-full retro-btn retro-btn-success text-xs"
                  >
                    ⚡ Liberar Auto Cadastro / API
                  </button>
                  <p className="text-[9px] text-slate-500 font-mono text-center mt-2 leading-normal">
                    Libera o IP/Domínio deste painel de administração no Walled Garden e IP Bindings do MikroTik.
                  </p>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 retro-card">
              <div className="px-5 py-3 border-b border-[#0a0a18] flex justify-between items-center bg-[#1e1e3a] md:bg-transparent" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
                <div className="flex items-center gap-2">
                  <div className="rack-screw" />
                  <span className="font-mono text-xs font-bold text-slate-450">WALLED_GARDEN_RULES_REGISTRY</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="retro-badge retro-badge-blue font-mono">{rules.length} REGRAS</span>
                  <div className="rack-screw" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="retro-table-wrap max-h-[460px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0" style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18', zIndex: 10 }}>
                      <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Site / Domínio</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Ação</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {walledLoading && rules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            <div className="inline-block animate-pulse">Consultando regras do Walled Garden...</div>
                          </td>
                        </tr>
                      ) : rules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            Nenhuma regra cadastrada no Walled Garden.
                          </td>
                        </tr>
                      ) : (
                        rules.map((rule, index) => (
                          <tr key={`${rule.id || rule.host}-${index}`} className="hover:bg-[#101026]/40 transition-colors">
                            <td className="px-6 py-4 font-bold text-white text-sm tracking-wide">{rule.host}</td>
                            <td className="px-6 py-4">
                              <span className={`retro-badge ${rule.action === 'allow' ? 'retro-badge-green' : 'retro-badge-red'}`}>
                                {rule.action === 'allow' ? 'LIBERADO' : 'BLOQUEADO'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteSite(rule.id)}
                                className="retro-btn retro-btn-danger py-1.5 px-3 text-[9px]"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Blocking Tab */}
        {activeTab === 'time-block' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1 retro-card">
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
                <div className="rack-screw" />
                <span className="font-mono text-xs font-bold text-slate-450">TIME_INTERVAL_SCHEDULER</span>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Crie janelas de bloqueio geral temporário para derrubar toda a navegação de hotspot na rede local.
                </p>

                <form onSubmit={handleAddTimeBlock} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Início (Bloqueio)</label>
                      <input
                        type="time"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        required
                        step="1"
                        className="retro-input focus:border-red-500"
                        style={{ color: 'var(--led-red)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Fim (Liberação)</label>
                      <input
                        type="time"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        required
                        step="1"
                        className="retro-input focus:border-emerald-500"
                        style={{ color: 'var(--led-green)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Dias Ativos</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                        <label key={dia} className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer border border-[#252542] hover:border-slate-500 transition-colors text-[9px] font-mono font-bold" style={{ background: 'linear-gradient(180deg, #121226 0%, #0a0a1a 100%)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                          <input type="checkbox" defaultChecked className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-3 h-3 bg-slate-900 cursor-pointer" />
                          <span className="text-slate-400">{dia}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={timeLoading}
                    className="w-full retro-btn retro-btn-danger"
                  >
                    {timeLoading ? 'Aplicando...' : 'Ativar Regra'}
                  </button>
                  <p className="text-[9px] text-slate-500 font-mono text-center mt-1">A regra de filtragem drop será aplicada no Forward Chain do Firewall.</p>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 retro-card">
              <div className="px-5 py-3 border-b border-[#0a0a18] flex justify-between items-center bg-[#1e1e3a] md:bg-transparent" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
                <div className="flex items-center gap-2">
                  <div className="rack-screw" />
                  <span className="font-mono text-xs font-bold text-slate-450">SCHEDULED_DROP_RULES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="retro-badge retro-badge-red font-mono">{timeRules.length} REGRAS</span>
                  <div className="rack-screw" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="retro-table-wrap max-h-[460px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0" style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18', zIndex: 10 }}>
                      <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Horário de Bloqueio</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Dias da Semana</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {timeLoading && timeRules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            <div className="inline-block animate-pulse">Consultando agendamentos...</div>
                          </td>
                        </tr>
                      ) : timeRules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            Nenhuma regra de bloqueio de horário configurada.
                          </td>
                        </tr>
                      ) : (
                        timeRules.map((rule, index) => {
                          const timeParts = rule.time ? rule.time.split(',') : [];
                          const hours = timeParts[0] || '';
                          const days = timeParts[1] || 'todos';
                          return (
                            <tr key={`${rule.id || index}`} className="hover:bg-[#101026]/40 transition-colors">
                              <td className="px-6 py-4 font-bold text-red-400 text-sm tracking-wide">{hours.replace('-', ' às ')}</td>
                              <td className="px-6 py-4 text-xs font-mono">
                                <span className="retro-badge retro-badge-amber">{days}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteTimeRule(rule.id)}
                                  disabled={timeLoading}
                                  className="retro-btn retro-btn-danger py-1.5 px-3 text-[9px]"
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keywords Blocking Tab */}
        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1 retro-card">
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
                <div className="rack-screw" />
                <span className="font-mono text-xs font-bold text-slate-450">CONTENT_KEYWORD_FILTER</span>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Derruba conexões cujo domínio (HTTP Header ou SNI HTTPS) contenha as strings indicadas.
                </p>
                
                <form onSubmit={handleAddKeyword} className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Palavra-Chave</label>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      required
                      placeholder="Ex: torrent, poker, bet"
                      className="retro-input"
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1.5 block leading-normal">
                      Pesquisas no Google continuarão disponíveis, porém domínios diretos com o termo serão bloqueados.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full retro-btn retro-btn-danger"
                  >
                    {actionLoading ? 'Aplicando Regra...' : 'Bloquear Termo'}
                  </button>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 retro-card">
              <div className="px-5 py-3 border-b border-[#0a0a18] flex justify-between items-center bg-[#1e1e3a] md:bg-transparent" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
                <div className="flex items-center gap-2">
                  <div className="rack-screw" />
                  <span className="font-mono text-xs font-bold text-slate-450">ACTIVE_BLOCKLIST_KEYWORDS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="retro-badge retro-badge-red font-mono">{keywords.length} TERMOS</span>
                  <div className="rack-screw" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="retro-table-wrap max-h-[460px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0" style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18', zIndex: 10 }}>
                      <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Termo Bloqueado</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Método de Filtro</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {keywordsLoading && keywords.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            <div className="inline-block animate-pulse">Lendo palavras bloqueadas...</div>
                          </td>
                        </tr>
                      ) : keywords.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            Nenhuma palavra-chave bloqueada no firewall.
                          </td>
                        </tr>
                      ) : (
                        keywords.map((kw, index) => (
                          <tr key={`${kw.id || kw.keyword}-${index}`} className="hover:bg-[#101026]/40 transition-colors">
                            <td className="px-6 py-4 font-bold text-red-400 text-sm tracking-wide font-mono">{kw.keyword}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 font-mono">
                                <span className="retro-badge retro-badge-blue">HTTP CONTENT</span>
                                <span className="retro-badge retro-badge-blue">HTTPS TLS-SNI</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteKeyword(kw.keyword)}
                                disabled={actionLoading}
                                className="retro-btn retro-btn-dark py-1.5 px-3 text-[9px]"
                              >
                                🔓 Desbloquear
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
