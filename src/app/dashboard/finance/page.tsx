"use client";

import { useEffect, useState } from 'react';
import RouterOffline from '@/components/RouterOffline';

export default function FinanceReport() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [clearing, setClearing] = useState(false);

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
  }, []);

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
    <main className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="retro-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rack-screw" />
          <span className="led led-green animate-led-pulse" />
          <div>
            <div style={{ color: 'var(--led-green)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              ▶ SYSTEM // FINANCIAL AUDITING MODULE
            </div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
              Financeiro e Vendas
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportCSV(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
            className="retro-btn retro-btn-success text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>📥</span> Exportar CSV
          </button>
          <button
            onClick={() => handleClearLogs(null)}
            disabled={clearing || allTransactions.length === 0}
            className="retro-btn retro-btn-danger text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🗑️</span> Limpar Tudo
          </button>
          <div className="rack-screw" />
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="retro-stat-box flex flex-col justify-between h-28 relative">
          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1 text-left">TOTAL_FATURAMENTO</span>
          <p className="text-2xl font-bold tracking-tight text-blue-400 text-left mt-2">
            {formatBRL(financeData?.totalRevenue || 0)}
          </p>
          <span className="block text-[8px] text-slate-600 text-left mt-auto font-mono">Persistido no script do MikroTik</span>
        </div>
        
        <div className="retro-stat-box flex flex-col justify-between h-28 relative">
          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1 text-left">FATURAMENTO_MES</span>
          <p className="text-2xl font-bold tracking-tight text-emerald-450 text-left mt-2">
            {formatBRL(financeData?.monthlyRevenue || 0)}
          </p>
          <span className="block text-[8px] text-slate-600 text-left mt-auto font-mono">Vendas do mês atual</span>
        </div>

        <div className="retro-stat-box flex flex-col justify-between h-28 relative">
          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1 text-left">FATURAMENTO_HOJE</span>
          <p className="text-2xl font-bold tracking-tight text-amber-500 text-left mt-2">
            {formatBRL(financeData?.todayRevenue || 0)}
          </p>
          <span className="block text-[8px] text-slate-600 text-left mt-auto font-mono">Vendas nas últimas 24h</span>
        </div>

        <div className="retro-stat-box flex flex-col justify-between h-28 relative">
          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1 text-left">TOTAL_VENDAS_VOUCHERS</span>
          <p className="text-2xl font-bold tracking-tight text-white text-left mt-2">
            {financeData?.salesCount || 0}
          </p>
          <span className="block text-[8px] text-slate-600 text-left mt-auto font-mono">Vouchers ativos no sistema</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aggregated Panels */}
        <div className="space-y-6 lg:col-span-1">
          {/* Revenue by Profile */}
          <div className="retro-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
              <div className="flex items-center gap-2">
                <div className="rack-screw" />
                <span className="font-mono text-xs font-bold text-slate-450 uppercase">REVENUE_BY_PLAN</span>
              </div>
              <div className="rack-screw" />
            </div>
            
            <div className="divide-y divide-[#0c0c1c] max-h-60 overflow-y-auto custom-scrollbar p-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              {financeData?.profilesArray.map((p: any, idx: number) => (
                <div key={`${p.name}-${idx}`} className="px-3 py-2 flex justify-between items-center hover:bg-[#101026]/40 transition-colors">
                  <div>
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="block text-[10px] text-slate-500">{p.count} transações</span>
                  </div>
                  <span className="font-bold text-emerald-450 text-sm">{formatBRL(p.revenue)}</span>
                </div>
              ))}
              {(!financeData?.profilesArray || financeData?.profilesArray.length === 0) && (
                <div className="p-6 text-center text-sm text-slate-400 italic">Nenhum perfil detectado.</div>
              )}
            </div>
          </div>

          {/* Revenue by Month & Deletion Controls */}
          <div className="retro-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
              <div className="flex items-center gap-2">
                <div className="rack-screw" />
                <span className="font-mono text-xs font-bold text-slate-450 uppercase">MONTHLY_CLOSURE_LOGS</span>
              </div>
              <div className="rack-screw" />
            </div>
            
            <div className="divide-y divide-[#0c0c1c] max-h-64 overflow-y-auto custom-scrollbar p-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              {financeData?.monthsArray.map((m: any, idx: number) => {
                const monthsNames: Record<string, string> = {
                  '01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr', '05': 'may', '06': 'jun',
                  '07': 'jul', '08': 'aug', '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dec'
                };
                const [year, month] = m.key.split('-');
                const monthName = monthsNames[month] || 'jan';
                const ownerString = `${monthName}${year}`;

                return (
                  <div key={`${m.key}-${idx}`} className="px-3 py-2 flex justify-between items-center hover:bg-[#101026]/40 transition-colors">
                    <div>
                      <span className="font-bold text-white text-sm">{m.label}</span>
                      <span className="block text-[10px] text-slate-500">{m.count} vendas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-450 text-sm">{formatBRL(m.revenue)}</span>
                      <button
                        onClick={() => handleClearLogs(ownerString, m.label)}
                        title={`Limpar histórico de ${m.label}`}
                        className="p-1 text-red-500 hover:text-red-300 transition-colors"
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
        <div className="retro-card lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-4 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="rack-screw" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Transações</h3>
                <p className="text-[10px] text-slate-400 font-mono">Listagem dinâmica // filtragem local</p>
              </div>
            </div>
            
            {/* Show local revenue for filtered set */}
            <div className="text-right">
              <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wider block font-mono">TOTAL_FILTERED</span>
              <span className="text-lg font-bold text-emerald-400 font-mono" style={{ textShadow: '0 0 8px rgba(52, 211, 153, 0.3)' }}>{formatBRL(filteredRevenue)}</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="px-5 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por usuário, MAC ou lote..."
                className="retro-input text-xs py-2 px-3"
              />
            </div>
            
            <div className="w-full md:w-44">
              <select
                value={selectedProfile}
                onChange={(e) => { setSelectedProfile(e.target.value); setCurrentPage(1); }}
                className="retro-input text-xs py-2 px-3"
                style={{ background: '#06080e' }}
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
                className="retro-input text-xs py-2 px-3"
                style={{ background: '#06080e' }}
              >
                <option value="all" className="bg-[#0c0c18]">Todos os Meses</option>
                {financeData?.monthsArray.map((m: any) => (
                  <option key={m.key} value={m.key} className="bg-[#0c0c18]">{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="p-4">
            <div className="retro-table-wrap overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18' }}>
                  <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Data / Hora</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Usuário</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Plano</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Preço</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Vencimento</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">MAC Address</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Lote/Comentário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {paginatedTransactions.map((t: any, idx: number) => (
                    <tr key={`${t.id}-${idx}`} className="hover:bg-[#101026]/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-white block text-[11px]">{t.formattedDate}</span>
                        <span className="text-slate-500 block text-[9px] font-mono leading-none mt-0.5">{t.time}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#7dd3fc]">{t.username}</td>
                      <td className="px-4 py-3 text-slate-450">{t.profile}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{formatBRL(t.price)}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{t.validity || 'indefinida'}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{t.mac || 'bypassed/trial'}</td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs overflow-hidden text-ellipsis" title={t.comment}>
                        {t.comment || '-'}
                      </td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 italic">
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
            <div className="px-5 py-4 border-t border-[#0a0a18] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <span className="text-slate-400">
                Exibindo {startIndex + 1} - {endIndex} de {totalItems} transações
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="retro-btn retro-btn-dark py-1 px-2.5 text-[10px]"
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
                        className={`retro-btn py-1 px-2 text-[10px] ${
                          currentPage === pageNum ? 'retro-btn-primary' : 'retro-btn-dark'
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
                  className="retro-btn retro-btn-dark py-1 px-2.5 text-[10px]"
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
