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
    <main className="w-full p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded tracking-wider uppercase">
              Firewall & Acessos
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Segurança e Acessos
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            Gerencie firewalls, sites liberados pré-login no Hotspot e bloqueio por palavras-chave
          </p>
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-1.5 rounded-xl w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('walled-garden')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'walled-garden'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
          }`}
        >
          🌐 Sites Walled Garden
        </button>
        <button
          onClick={() => setActiveTab('time-block')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'time-block'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
          }`}
        >
          🕒 Bloqueio de Horário
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'keywords'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
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
            <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  Criar Regra
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                  Permita ou bloqueie domínios de passarem pelo Hotspot antes de realizar o login.
                </p>
                
                <form onSubmit={handleAddSite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">Domínio / Host</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      required
                      placeholder="Ex: google.com"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">Ação</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none shadow-sm"
                    >
                      <option value="allow">Liberar (Permitir)</option>
                      <option value="deny">Bloquear (Negar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">Comentário</label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ex: Liberar updates"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={walledLoading}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {walledLoading ? 'Processando...' : 'Adicionar Regra'}
                  </button>
                </form>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200">
                <span className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Acesso Rápido</span>
                <button
                  type="button"
                  onClick={handleWhitelistMikroGestor}
                  disabled={walledLoading}
                  className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  ⚡ Liberar Auto Cadastro / API
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2 leading-normal font-medium">
                  Libera o IP/Domínio deste painel no Walled Garden e IP Bindings do MikroTik.
                </p>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-slate-900">
                  Regras Ativas
                </h3>
                <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1">
                  {rules.length} REGRAS
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="max-h-[460px] overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="px-5 py-3">Site / Domínio</th>
                        <th className="px-5 py-3">Ação</th>
                        <th className="px-5 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {walledLoading && rules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-500 italic font-medium">
                            <div className="inline-block animate-pulse">Consultando regras do Walled Garden...</div>
                          </td>
                        </tr>
                      ) : rules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-500 italic font-medium">
                            Nenhuma regra cadastrada no Walled Garden.
                          </td>
                        </tr>
                      ) : (
                        rules.map((rule, index) => (
                          <tr key={`${rule.id || rule.host}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">{rule.host}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                rule.action === 'allow' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {rule.action === 'allow' ? 'LIBERADO' : 'BLOQUEADO'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteSite(rule.id)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
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
            <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  Agendar Bloqueio
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                  Crie janelas de bloqueio temporário para cessar a navegação de hotspot na rede local.
                </p>

                <form onSubmit={handleAddTimeBlock} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">Início (Bloqueio)</label>
                      <input
                        type="time"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        required
                        step="1"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-rose-600 rounded-xl p-2.5 text-xs font-bold text-rose-700 outline-none shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">Fim (Liberação)</label>
                      <input
                        type="time"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        required
                        step="1"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 rounded-xl p-2.5 text-xs font-bold text-emerald-700 outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Dias Ativos</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                        <label key={dia} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-700">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer" />
                          <span>{dia}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={timeLoading}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {timeLoading ? 'Aplicando...' : 'Ativar Regra'}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-1 font-medium">A regra de filtragem drop será aplicada no Forward Chain do Firewall.</p>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-slate-900">
                  Bloqueios Agendados
                </h3>
                <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1">
                  {timeRules.length} REGRAS
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="max-h-[460px] overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="px-5 py-3">Horário de Bloqueio</th>
                        <th className="px-5 py-3">Dias da Semana</th>
                        <th className="px-5 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timeLoading && timeRules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-500 italic font-medium">
                            <div className="inline-block animate-pulse">Consultando agendamentos...</div>
                          </td>
                        </tr>
                      ) : timeRules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-500 italic font-medium">
                            Nenhuma regra de bloqueio de horário configurada.
                          </td>
                        </tr>
                      ) : (
                        timeRules.map((rule, index) => {
                          const timeParts = rule.time ? rule.time.split(',') : [];
                          const hours = timeParts[0] || '';
                          const days = timeParts[1] || 'todos';
                          return (
                            <tr key={`${rule.id || index}`} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-rose-700 text-sm tracking-wide">{hours.replace('-', ' às ')}</td>
                              <td className="px-5 py-3.5 text-xs">
                                <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">{days}</span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => handleDeleteTimeRule(rule.id)}
                                  disabled={timeLoading}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
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
            <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  Bloquear Conteúdo
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                  Derruba conexões cujo domínio (HTTP Header ou SNI HTTPS) contenha as palavras indicadas.
                </p>
                
                <form onSubmit={handleAddKeyword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">Palavra-Chave</label>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      required
                      placeholder="Ex: torrent, poker, bet"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400"
                    />
                    <span className="text-[11px] text-slate-500 mt-1.5 block leading-normal font-medium">
                      Pesquisas no Google continuarão disponíveis, porém domínios diretos com o termo serão bloqueados.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? 'Aplicando Regra...' : 'Bloquear Termo'}
                  </button>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-slate-900">
                  Termos Bloqueados
                </h3>
                <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1">
                  {keywords.length} TERMOS
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="max-h-[460px] overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="px-5 py-3">Termo Bloqueado</th>
                        <th className="px-5 py-3">Método de Filtro</th>
                        <th className="px-5 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keywordsLoading && keywords.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-500 italic font-medium">
                            <div className="inline-block animate-pulse">Lendo palavras bloqueadas...</div>
                          </td>
                        </tr>
                      ) : keywords.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-500 italic font-medium">
                            Nenhuma palavra-chave bloqueada no firewall.
                          </td>
                        </tr>
                      ) : (
                        keywords.map((kw, index) => (
                          <tr key={`${kw.id || kw.keyword}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-rose-700 text-sm font-mono">{kw.keyword}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex gap-2">
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">HTTP CONTENT</span>
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200">HTTPS TLS-SNI</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteKeyword(kw.keyword)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-xs"
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
