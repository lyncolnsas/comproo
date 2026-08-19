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
    <main className="w-full p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>
            ▶ SECURITY // ROUTER FIREWALL GATEKEEPER
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Segurança e Acessos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Gerencie firewalls, sites liberados pré-login e bloqueio por palavras-chave
          </p>
        </div>
      </header>

      {/* Tabs Menu styled as modern glass pills */}
      <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('walled-garden')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'walled-garden'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          🌐 Sites Walled Garden
        </button>
        <button
          onClick={() => setActiveTab('time-block')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'time-block'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          🕒 Bloqueio de Horário
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'keywords'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
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
            <div className="lg:col-span-1 aurora-card p-5 md:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Criar Regra
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Permita ou bloqueie domínios de passarem pelo Portal de Hotspot antes de realizar o login na rede.
                </p>
                
                <form onSubmit={handleAddSite} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Domínio / Host</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      required
                      placeholder="Ex: google.com"
                      className="aurora-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Ação</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="aurora-input"
                      style={{ background: '#0c0c18' }}
                    >
                      <option value="allow" className="bg-[#0c0c18]">Liberar (Permitir)</option>
                      <option value="deny" className="bg-[#0c0c18]">Bloquear (Negar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Comentário</label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ex: Liberar updates"
                      className="aurora-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={walledLoading}
                    className="w-full aurora-btn text-xs"
                  >
                    {walledLoading ? 'Processando...' : 'Adicionar Regra'}
                  </button>
                </form>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10">
                <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">Acesso Rápido</span>
                <button
                  type="button"
                  onClick={handleWhitelistMikroGestor}
                  disabled={walledLoading}
                  className="w-full aurora-btn text-xs"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  ⚡ Liberar Auto Cadastro / API
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2 leading-normal">
                  Libera o IP/Domínio deste painel de administração no Walled Garden e IP Bindings do MikroTik.
                </p>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 aurora-card p-5 md:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Regras Ativas
                </h3>
                <span className="bg-white/5 border border-white/10 text-slate-350 text-[10px] font-bold rounded-lg px-2.5 py-1">
                  {rules.length} REGRAS
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="max-h-[460px] overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5">Site / Domínio</th>
                        <th className="px-6 py-3.5">Ação</th>
                        <th className="px-6 py-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
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
                          <tr key={`${rule.id || rule.host}-${index}`} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-bold text-white text-sm tracking-wide">{rule.host}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                rule.action === 'allow' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {rule.action === 'allow' ? 'LIBERADO' : 'BLOQUEADO'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteSite(rule.id)}
                                className="aurora-btn text-[10px] py-1 px-3"
                                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
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
            <div className="lg:col-span-1 aurora-card p-5 md:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Agendar Bloqueio
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Crie janelas de bloqueio geral temporário para derrubar toda a navegação de hotspot na rede local.
                </p>

                <form onSubmit={handleAddTimeBlock} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-450 tracking-wider mb-1">Início (Bloqueio)</label>
                      <input
                        type="time"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        required
                        step="1"
                        className="aurora-input focus:border-red-500 text-rose-450 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-450 tracking-wider mb-1">Fim (Liberação)</label>
                      <input
                        type="time"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        required
                        step="1"
                        className="aurora-input focus:border-emerald-500 text-emerald-450 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-450 tracking-wider mb-2">Dias Ativos</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                        <label key={dia} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl cursor-pointer border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-[10px] font-mono font-bold text-slate-350">
                          <input type="checkbox" defaultChecked className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-black/40 cursor-pointer" />
                          <span>{dia}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={timeLoading}
                    className="w-full aurora-btn text-xs"
                    style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                  >
                    {timeLoading ? 'Aplicando...' : 'Ativar Regra'}
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-1">A regra de filtragem drop será aplicada no Forward Chain do Firewall.</p>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 aurora-card p-5 md:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Bloqueios Agendados
                </h3>
                <span className="bg-white/5 border border-white/10 text-slate-350 text-[10px] font-bold rounded-lg px-2.5 py-1">
                  {timeRules.length} REGRAS
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="max-h-[460px] overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5">Horário de Bloqueio</th>
                        <th className="px-6 py-3.5">Dias da Semana</th>
                        <th className="px-6 py-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
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
                            <tr key={`${rule.id || index}`} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-rose-450 text-sm tracking-wide">{hours.replace('-', ' às ')}</td>
                              <td className="px-6 py-4 text-xs font-mono">
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">{days}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteTimeRule(rule.id)}
                                  disabled={timeLoading}
                                  className="aurora-btn text-[10px] py-1 px-3"
                                  style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
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
            <div className="lg:col-span-1 aurora-card p-5 md:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Bloquear Conteúdo
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Derruba conexões cujo domínio (HTTP Header ou SNI HTTPS) contenha as strings indicadas.
                </p>
                
                <form onSubmit={handleAddKeyword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-450 tracking-wider mb-1">Palavra-Chave</label>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      required
                      placeholder="Ex: torrent, poker, bet"
                      className="aurora-input"
                    />
                    <span className="text-[10px] text-slate-500 mt-1.5 block leading-normal">
                      Pesquisas no Google continuarão disponíveis, porém domínios diretos com o termo serão bloqueados.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full aurora-btn text-xs"
                    style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                  >
                    {actionLoading ? 'Aplicando Regra...' : 'Bloquear Termo'}
                  </button>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 aurora-card p-5 md:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Termos Bloqueados
                </h3>
                <span className="bg-white/5 border border-white/10 text-slate-350 text-[10px] font-bold rounded-lg px-2.5 py-1">
                  {keywords.length} TERMOS
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="max-h-[460px] overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5">Termo Bloqueado</th>
                        <th className="px-6 py-3.5">Método de Filtro</th>
                        <th className="px-6 py-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
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
                          <tr key={`${kw.id || kw.keyword}-${index}`} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-bold text-rose-450 text-sm tracking-wide font-mono">{kw.keyword}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">HTTP CONTENT</span>
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">HTTPS TLS-SNI</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteKeyword(kw.keyword)}
                                disabled={actionLoading}
                                className="aurora-btn text-[10px] py-1 px-3"
                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
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
