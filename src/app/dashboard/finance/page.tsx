"use client";

import { useEffect, useState } from 'react';
import RouterOffline from '@/components/RouterOffline';

export default function FinanceReport() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Mercado Pago State
  const [mpToken, setMpToken] = useState('');
  const [manualPixKey, setManualPixKey] = useState('');
  const [mpSaving, setMpSaving] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchFinance = async () => {
    try {
      const res = await fetch('/api/finance');
      if (res.status === 401 || res.status === 503) {
        setNotConnected(true);
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success) {
        setFinanceData(json.data);
        setNotConnected(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
    fetchMpConfig();
  }, []);

  const fetchMpConfig = async () => {
    try {
      const res = await fetch('/api/config/mercadopago');
      const data = await res.json();
      if (data.success) {
        setMpToken(data.token);
        setManualPixKey(data.manualPixKey || '');
      }
    } catch (e) {}
  };

  const handleSaveMpToken = async () => {
    setMpSaving(true);
    try {
      const res = await fetch('/api/config/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mpToken, manualPixKey })
      });
      const data = await res.json();
      if (data.success) {
        alert('Chave API do Mercado Pago salva com sucesso!');
        fetchMpConfig();
      } else {
        alert('Erro ao salvar a chave.');
      }
    } catch (e) {
      alert('Erro de conexão ao salvar chave.');
    } finally {
      setMpSaving(false);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Log cleaning execution
  const handleClearLogs = async (monthOwner: string | null = null, monthLabel: string = '') => {
    const confirmMsg = monthOwner
      ? `Tem certeza que deseja apagar permanentemente todas as transações de ${monthLabel} salvas no MikroTik?`
      : 'Tem certeza que deseja apagar permanentemente TODO o histórico de vendas salvo no MikroTik?';

    if (!confirm(confirmMsg)) return;

    setClearing(true);
    try {
      const url = monthOwner ? `/api/finance?month=${monthOwner}` : '/api/finance';
      const res = await fetch(url, { method: 'DELETE' });
      const resJson = await res.json();
      if (resJson.success) {
        alert(`Sucesso! ${resJson.count} registros de venda foram removidos.`);
        await fetchFinance(); // reload data
      } else {
        alert('Erro ao limpar histórico: ' + resJson.message);
      }
    } catch (e) {
      alert('Erro na conexão com o roteador.');
    } finally {
      setClearing(false);
    }
  };

  // CSV Export handler
  const handleExportCSV = (filteredTransactions: any[]) => {
    if (filteredTransactions.length === 0) {
      alert('Nenhuma transação disponível para exportação.');
      return;
    }

    const headers = ['Data', 'Hora', 'Usuario', 'Preco (R$)', 'Validade', 'Perfil', 'MAC Address', 'IP Address', 'Lote/Comentario'];
    const csvRows = [headers.join(';')];

    filteredTransactions.forEach(t => {
      const row = [
        t.formattedDate,
        t.time,
        t.username,
        t.price.toFixed(2),
        t.validity,
        t.profile,
        t.mac,
        t.ip,
        t.comment
      ];
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for correct encoding in Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (notConnected) {
    return (
      <RouterOffline 
        title="Financeiro e Vendas (Mikhmon v3)" 
        description="Faturamento consolidado em tempo real lido das transações persistidas no MikroTik" 
      />
    );
  }

  if (loading) {
    return (
      <main className="p-4 md:p-6 space-y-6">
        <header className="retro-card p-4 flex items-center gap-3">
          <div className="rack-screw" />
          <span className="led led-amber animate-led-blink" />
          <div>
            <div style={{ color: 'var(--led-amber)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              ▶ FINANCE // LOADING HARDWARE LOGS
            </div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
              Financeiro e Vendas
            </h1>
          </div>
          <div className="ml-auto rack-screw" />
        </header>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-28 bg-[#1e1e35] rounded-xl border border-slate-700"></div>
            <div className="h-28 bg-[#1e1e35] rounded-xl border border-slate-700"></div>
            <div className="h-28 bg-[#1e1e35] rounded-xl border border-slate-700"></div>
            <div className="h-28 bg-[#1e1e35] rounded-xl border border-slate-700"></div>
          </div>
          <div className="h-96 bg-[#1e1e35] rounded-xl border border-slate-700"></div>
        </div>
      </main>
    );
  }

  // Filtering transactions
  const allTransactions = financeData?.transactions || [];
  const filteredTransactions = allTransactions.filter((t: any) => {
    const username = String(t.username || '');
    const mac = String(t.mac || '');
    const comment = String(t.comment || '');
    const matchesSearch = 
      username.toLowerCase().includes(search.toLowerCase()) ||
      mac.toLowerCase().includes(search.toLowerCase()) ||
      comment.toLowerCase().includes(search.toLowerCase());

    const matchesProfile = selectedProfile === 'all' || t.profile === selectedProfile;

    // Filter by month key. Date format stored in transactions is year-month (represented by owner/data)
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      const yearMonthKey = selectedMonth; // e.g. "2026-05"
      const dateParts = t.date.split('/'); // may/22/2026
      
      const monthsMap: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };

      let tYear = '';
      let tMonth = '';

      if (dateParts.length === 3) {
        tYear = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
        const monthAbbrev = dateParts[0].toLowerCase().substring(0, 3);
        tMonth = monthsMap[monthAbbrev] || '01';
      } else if (t.date.includes('-')) {
        const partsHyphen = t.date.split('-');
        if (partsHyphen.length === 3) {
          if (partsHyphen[0].length === 4) {
            tYear = partsHyphen[0];
            tMonth = partsHyphen[1];
          } else {
            tYear = partsHyphen[2].length === 2 ? `20${partsHyphen[2]}` : partsHyphen[2];
            tMonth = partsHyphen[1];
          }
        }
      }
      
      const compKey = `${tYear}-${tMonth}`;
      matchesMonth = compKey === yearMonthKey;
    }

    return matchesSearch && matchesProfile && matchesMonth;
  });

  // Calculate stats on currently filtered items
  const filteredRevenue = filteredTransactions.reduce((acc: number, curr: any) => acc + curr.price, 0);

  // Pagination Logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  return (
    <main className="w-full p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#22c55e' }}>
            ▶ SYSTEM // FINANCIAL AUDITING MODULE
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Financeiro e Vendas
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Faturamento consolidado em tempo real lido das transações persistidas no MikroTik
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => handleExportCSV(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
            className="aurora-btn text-xs"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <span>📥</span> Exportar CSV
          </button>
          <button
            onClick={() => handleClearLogs(null)}
            disabled={clearing || allTransactions.length === 0}
            className="aurora-btn text-xs"
            style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
          >
            <span>🗑️</span> Limpar Tudo
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="aurora-card p-5 flex flex-col justify-between h-28">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL FATURAMENTO</span>
          <p className="text-2xl font-black text-sky-400 mt-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {formatBRL(financeData?.totalRevenue || 0)}
          </p>
          <span className="block text-[10px] text-slate-500 mt-auto">Persistido no script do MikroTik</span>
        </div>
        
        <div className="aurora-card p-5 flex flex-col justify-between h-28">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">FATURAMENTO DO MÊS</span>
          <p className="text-2xl font-black text-emerald-400 mt-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {formatBRL(financeData?.monthlyRevenue || 0)}
          </p>
          <span className="block text-[10px] text-slate-500 mt-auto">Vendas do mês atual</span>
        </div>

        <div className="aurora-card p-5 flex flex-col justify-between h-28">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">FATURAMENTO HOJE</span>
          <p className="text-2xl font-black text-amber-400 mt-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {formatBRL(financeData?.todayRevenue || 0)}
          </p>
          <span className="block text-[10px] text-slate-500 mt-auto">Vendas nas últimas 24h</span>
        </div>

        <div className="aurora-card p-5 flex flex-col justify-between h-28">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL DE VOUCHERS</span>
          <p className="text-2xl font-black text-white mt-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {financeData?.salesCount || 0}
          </p>
          <span className="block text-[10px] text-slate-500 mt-auto">Vouchers ativos no sistema</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aggregated Panels */}
        <div className="space-y-6 lg:col-span-1">
          {/* Revenue by Profile */}
          <div className="aurora-card p-5 md:p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Faturamento por Plano
              </h3>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
              {financeData?.profilesArray.map((p: any, idx: number) => (
                <div key={`${p.name}-${idx}`} className="px-4 py-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div>
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="block text-[10px] text-slate-400">{p.count} transações</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">{formatBRL(p.revenue)}</span>
                </div>
              ))}
              {(!financeData?.profilesArray || financeData.profilesArray.length === 0) && (
                <div className="px-4 py-3 text-center text-slate-500 text-xs">
                  Nenhum dado consolidado por plano.
                </div>
              )}
            </div>
          </div>
          
          {/* Integração de Pagamento */}
          <div className="aurora-card p-5 md:p-6 flex flex-col border border-sky-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Opções de Pagamento e PIX
              </h3>
            </div>
            
            {/* Mercado Pago API */}
            <p className="text-xs text-slate-400 mb-2"><b>API Mercado Pago (Automático)</b></p>
            <div className="flex flex-col gap-2 mb-4">
              <input 
                type="password" 
                className="w-full bg-[#0b1220] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500" 
                placeholder="APP_USR-XXXXXXXXX-XXXXX..." 
                value={mpToken} 
                onChange={e => setMpToken(e.target.value)} 
              />
            </div>

            {/* Chave Manual */}
            <p className="text-xs text-slate-400 mb-2 mt-2"><b>Chave PIX Manual (Modo de Confiança)</b></p>
            <p className="text-[10px] text-slate-500 mb-2">Usado caso a API acima esteja vazia.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                className="w-full bg-[#0b1220] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500" 
                placeholder="ex: seu-email@gmail.com, CPF, Telefone..." 
                value={manualPixKey} 
                onChange={e => setManualPixKey(e.target.value)} 
              />
              <button 
                className="aurora-btn text-xs w-full justify-center mt-2" 
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}
                onClick={handleSaveMpToken}
                disabled={mpSaving}
              >
                {mpSaving ? 'Salvando...' : 'Salvar Configurações de Pagamento'}
              </button>
            </div>
          </div>

          {/* Revenue by Month & Deletion Controls */}
          <div className="aurora-card p-5 md:p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Fechamentos Consolidados
              </h3>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5 max-h-64 overflow-y-auto custom-scrollbar">
              {financeData?.monthsArray.map((m: any, idx: number) => {
                const monthsNames: Record<string, string> = {
                  '01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr', '05': 'may', '06': 'jun',
                  '07': 'jul', '08': 'aug', '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dec'
                };
                const [year, month] = m.key.split('-');
                const monthName = monthsNames[month] || 'jan';
                const ownerString = `${monthName}${year}`;

                return (
                  <div key={`${m.key}-${idx}`} className="px-4 py-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div>
                      <span className="font-bold text-white text-sm">{m.label}</span>
                      <span className="block text-[10px] text-slate-405">{m.count} vendas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400 text-sm">{formatBRL(m.revenue)}</span>
                      <button
                        onClick={() => handleClearLogs(ownerString, m.label)}
                        title={`Limpar histórico de ${m.label}`}
                        className="p-1 hover:scale-110 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
              {(!financeData?.monthsArray || financeData?.monthsArray.length === 0) && (
                <div className="p-6 text-center text-sm text-slate-400 italic">Nenhum fechamento consolidado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Transaction Log Table */}
        <div className="aurora-card p-5 md:p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Histórico de Transações
              </h3>
              <p className="text-xs text-slate-400">Listagem dinâmica com filtragem local</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Filtrado</span>
              <span className="text-xl font-black text-emerald-400" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(52, 211, 153, 0.2)' }}>
                {formatBRL(filteredRevenue)}
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por usuário, MAC ou lote..."
                className="aurora-input text-xs py-2 px-3"
              />
            </div>
            
            <div className="w-full md:w-44">
              <select
                value={selectedProfile}
                onChange={(e) => { setSelectedProfile(e.target.value); setCurrentPage(1); }}
                className="aurora-input text-xs py-2 px-3"
                style={{ background: '#0c0c18' }}
              >
                <option value="all" className="bg-[#0c0c18]">Todos os Perfis</option>
                {financeData?.profilesArray.map((p: any) => (
                  <option key={p.name} value={p.name} className="bg-[#0c0c18]">{p.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-44">
              <select
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                className="aurora-input text-xs py-2 px-3"
                style={{ background: '#0c0c18' }}
              >
                <option value="all" className="bg-[#0c0c18]">Todos os Meses</option>
                {financeData?.monthsArray.map((m: any) => (
                  <option key={m.key} value={m.key} className="bg-[#0c0c18]">{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Data / Hora</th>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Plano</th>
                    <th className="px-4 py-3">Preço</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">MAC Address</th>
                    <th className="px-4 py-3">Lote/Comentário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedTransactions.map((t: any, idx: number) => (
                    <tr key={`${t.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-white block text-[11px]">{t.formattedDate}</span>
                        <span className="text-slate-500 block text-[9px] font-mono leading-none mt-0.5">{t.time}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#7dd3fc]">{t.username}</td>
                      <td className="px-4 py-3 text-slate-350">{t.profile}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{formatBRL(t.price)}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{t.validity || 'indefinida'}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{t.mac || 'bypassed/trial'}</td>
                      <td className="px-4 py-3 text-slate-400 italic max-w-xs overflow-hidden text-ellipsis" title={t.comment}>
                        {t.comment || '-'}
                      </td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-450 italic">
                        Nenhuma transação financeira corresponde aos filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <span className="text-slate-400">
                Exibindo {startIndex + 1} - {endIndex} de {totalItems} transações
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="aurora-btn text-[10px] py-1 px-3"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`text-[10px] py-1.5 px-3 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-slate-500 px-0.5">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="aurora-btn text-[10px] py-1 px-3"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
