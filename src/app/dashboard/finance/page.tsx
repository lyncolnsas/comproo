"use client";

import { useEffect, useState } from 'react';
import RouterOffline from '@/components/RouterOffline';

export default function FinanceReport() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [pendingPix, setPendingPix] = useState<any[]>([]);
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
    fetchPendingPix();
  }, []);

  const fetchPendingPix = async () => {
    try {
      const res = await fetch('/api/portal/admin/pending-pix');
      const data = await res.json();
      if (data.success) {
        setPendingPix(data.data);
      }
    } catch (e) {}
  };

  const handleApprovePix = async (paymentId: string) => {
    if (!confirm('Tem certeza que recebeu o pagamento e deseja aprovar este voucher?')) return;
    try {
      const res = await fetch('/api/portal/admin/approve-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'approve' })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchPendingPix();
        fetchFinance(); // Refresh transactions just in case
      } else {
        alert(json.message);
      }
    } catch {
      alert('Erro ao aprovar pagamento.');
    }
  };

  const handleRejectPix = async (paymentId: string) => {
    if (!confirm('Tem certeza que deseja REJEITAR este pagamento? O cliente não será habilitado.')) return;
    try {
      const res = await fetch('/api/portal/admin/approve-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'reject' })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchPendingPix();
      } else {
        alert(json.message);
      }
    } catch {
      alert('Erro ao rejeitar pagamento.');
    }
  };

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
        <header className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded tracking-wider uppercase">
                Financeiro // Carregando Registros
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                Financeiro e Vendas
              </h1>
            </div>
          </div>
        </header>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-28 bg-slate-200/80 rounded-2xl border border-slate-200"></div>
            <div className="h-28 bg-slate-200/80 rounded-2xl border border-slate-200"></div>
            <div className="h-28 bg-slate-200/80 rounded-2xl border border-slate-200"></div>
            <div className="h-28 bg-slate-200/80 rounded-2xl border border-slate-200"></div>
          </div>
          <div className="h-96 bg-slate-200/80 rounded-2xl border border-slate-200"></div>
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
    <main className="w-full p-4 md:p-6 space-y-6 animate-fade-in text-slate-800">
      {/* ── Pending Manual PIX Section ──────────────────────────────── */}
      {pendingPix.length > 0 && (
        <section className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Pagamentos PIX Pendentes de Aprovação</h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Verifique o recebimento em sua conta bancária antes de aprovar. Ao aprovar, o voucher é ativado imediatamente.
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar bg-white rounded-xl border border-slate-200 shadow-sm mt-4">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pendingPix.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                      {new Date(p.date).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{p.username}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="font-semibold">{p.plan}</span>
                      {p.giftTo && <span className="block text-[10px] text-blue-600 font-medium">Presente p/: {p.giftTo}</span>}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-extrabold text-sm">{formatBRL(p.amount)}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleRejectPix(p.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200 shadow-sm"
                      >
                        Rejeitar
                      </button>
                      <button 
                        onClick={() => handleApprovePix(p.id)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Aprovar e Habilitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Page Header ────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded tracking-wider uppercase">
              Auditoria Financeira
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Financeiro e Vendas
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            Faturamento consolidado em tempo real lido das transações persistidas no MikroTik
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => handleExportCSV(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>📥</span> Exportar CSV
          </button>
          <button
            onClick={() => handleClearLogs(null)}
            disabled={clearing || allTransactions.length === 0}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>🗑️</span> Limpar Tudo
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 hover:border-slate-300 transition-all">
          <span className="block text-xs font-black text-slate-800 uppercase tracking-wider">TOTAL FATURAMENTO</span>
          <p className="text-2xl md:text-3xl font-black text-blue-700 mt-1">
            {formatBRL(financeData?.totalRevenue || 0)}
          </p>
          <span className="block text-xs text-slate-700 font-bold mt-auto">Persistido no script do MikroTik</span>
        </div>
        
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 hover:border-slate-300 transition-all">
          <span className="block text-xs font-black text-slate-800 uppercase tracking-wider">FATURAMENTO DO MÊS</span>
          <p className="text-2xl md:text-3xl font-black text-emerald-700 mt-1">
            {formatBRL(financeData?.monthlyRevenue || 0)}
          </p>
          <span className="block text-xs text-slate-700 font-bold mt-auto">Vendas do mês atual</span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 hover:border-slate-300 transition-all">
          <span className="block text-xs font-black text-slate-800 uppercase tracking-wider">FATURAMENTO HOJE</span>
          <p className="text-2xl md:text-3xl font-black text-amber-700 mt-1">
            {formatBRL(financeData?.todayRevenue || 0)}
          </p>
          <span className="block text-xs text-slate-700 font-bold mt-auto">Vendas nas últimas 24h</span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 hover:border-slate-300 transition-all">
          <span className="block text-xs font-black text-slate-800 uppercase tracking-wider">TOTAL DE VOUCHERS</span>
          <p className="text-2xl md:text-3xl font-black text-slate-950 mt-1">
            {financeData?.salesCount || 0}
          </p>
          <span className="block text-xs text-slate-700 font-bold mt-auto">Vouchers gerados no sistema</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aggregated Panels */}
        <div className="space-y-6 lg:col-span-1">
          {/* Revenue by Profile */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-900">
                Faturamento por Plano
              </h3>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 divide-y divide-slate-200/70 max-h-60 overflow-y-auto custom-scrollbar">
              {financeData?.profilesArray.map((p: any, idx: number) => (
                <div key={`${p.name}-${idx}`} className="px-4 py-3 flex justify-between items-center hover:bg-slate-100/70 transition-colors">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{p.name}</span>
                    <span className="block text-[11px] text-slate-500 font-medium">{p.count} transações</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm">{formatBRL(p.revenue)}</span>
                </div>
              ))}
              {(!financeData?.profilesArray || financeData.profilesArray.length === 0) && (
                <div className="px-4 py-6 text-center text-slate-500 text-xs font-medium">
                  Nenhum dado consolidado por plano.
                </div>
              )}
            </div>
          </div>
          
          {/* Integração de Pagamento */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Opções de Pagamento e PIX
                </h3>
                <p className="text-xs text-slate-500 font-medium">Credenciais e chave bancária</p>
              </div>
            </div>
            
            {/* Mercado Pago API */}
            <label className="text-xs font-bold text-slate-700 mb-1.5">API Mercado Pago (Automático)</label>
            <div className="flex flex-col gap-2 mb-4">
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl p-3 text-xs text-slate-900 outline-none transition-all shadow-sm" 
                placeholder="APP_USR-XXXXXXXXX-XXXXX..." 
                value={mpToken} 
                onChange={e => setMpToken(e.target.value)} 
              />
            </div>

            {/* Chave Manual */}
            <label className="text-xs font-bold text-slate-700 mb-1">Chave PIX Manual (Modo de Confiança)</label>
            <p className="text-[11px] text-slate-500 mb-2 font-medium">Utilizado quando o cliente seleciona chave manual no portal.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl p-3 text-xs text-slate-900 outline-none transition-all shadow-sm" 
                placeholder="ex: seu-email@gmail.com, CPF, Telefone..." 
                value={manualPixKey} 
                onChange={e => setManualPixKey(e.target.value)} 
              />
              <button 
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center mt-1" 
                onClick={handleSaveMpToken}
                disabled={mpSaving}
              >
                {mpSaving ? 'Salvando...' : 'Salvar Configurações de Pagamento'}
              </button>
            </div>
          </div>

          {/* Revenue by Month & Deletion Controls */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-900">
                Fechamentos Consolidados
              </h3>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 divide-y divide-slate-200/70 max-h-64 overflow-y-auto custom-scrollbar">
              {financeData?.monthsArray.map((m: any, idx: number) => {
                const monthsNames: Record<string, string> = {
                  '01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr', '05': 'may', '06': 'jun',
                  '07': 'jul', '08': 'aug', '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dec'
                };
                const [year, month] = m.key.split('-');
                const monthName = monthsNames[month] || 'jan';
                const ownerString = `${monthName}${year}`;

                return (
                  <div key={`${m.key}-${idx}`} className="px-4 py-3 flex justify-between items-center hover:bg-slate-100/70 transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{m.label}</span>
                      <span className="block text-[11px] text-slate-500 font-medium">{m.count} vendas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-emerald-600 text-sm">{formatBRL(m.revenue)}</span>
                      <button
                        onClick={() => handleClearLogs(ownerString, m.label)}
                        title={`Limpar histórico de ${m.label}`}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:scale-110 transition-all cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
              {(!financeData?.monthsArray || financeData?.monthsArray.length === 0) && (
                <div className="p-6 text-center text-xs text-slate-500 italic font-medium">Nenhum fechamento consolidado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Transaction Log Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 lg:col-span-2 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Histórico de Transações
              </h3>
              <p className="text-xs text-slate-500 font-medium">Listagem dinâmica com filtragem instantânea</p>
            </div>
            
            <div className="text-right">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Filtrado</span>
              <span className="text-xl font-black text-emerald-600">
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
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none shadow-sm placeholder:text-slate-400"
              />
            </div>
            
            <div className="w-full md:w-44">
              <select
                value={selectedProfile}
                onChange={(e) => { setSelectedProfile(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none shadow-sm"
              >
                <option value="all">Todos os Perfis</option>
                {financeData?.profilesArray.map((p: any) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-44">
              <select
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none shadow-sm"
              >
                <option value="all">Todos os Meses</option>
                {financeData?.monthsArray.map((m: any) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-200 text-slate-950 font-black uppercase tracking-wider text-xs">
                    <th className="px-4 py-3.5">Data / Hora</th>
                    <th className="px-4 py-3.5">Usuário</th>
                    <th className="px-4 py-3.5">Plano</th>
                    <th className="px-4 py-3.5">Preço</th>
                    <th className="px-4 py-3.5">Vencimento</th>
                    <th className="px-4 py-3.5">MAC Address</th>
                    <th className="px-4 py-3.5">Lote/Comentário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedTransactions.map((t: any, idx: number) => (
                    <tr key={`${t.id}-${idx}`} className="hover:bg-slate-100 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-black text-slate-950 block text-xs">{t.formattedDate}</span>
                        <span className="text-slate-700 block text-xs font-mono font-bold leading-none mt-0.5">{t.time}</span>
                      </td>
                      <td className="px-4 py-3 font-black text-blue-700 text-xs">{t.username}</td>
                      <td className="px-4 py-3 text-slate-900 font-bold text-xs">{t.profile}</td>
                      <td className="px-4 py-3 font-black text-emerald-700 text-xs">{formatBRL(t.price)}</td>
                      <td className="px-4 py-3 text-slate-800 font-mono font-bold text-xs">{t.validity || 'indefinida'}</td>
                      <td className="px-4 py-3 text-slate-800 font-mono font-bold text-xs">{t.mac || 'bypassed/trial'}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium text-xs max-w-xs overflow-hidden text-ellipsis" title={t.comment}>
                        {t.comment || '-'}
                      </td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-600 italic font-bold">
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
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <span className="text-slate-600 font-medium">
                Exibindo {startIndex + 1} - {endIndex} de {totalItems} transações
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-xs font-bold py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all disabled:opacity-40"
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
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-slate-400 px-0.5">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-xs font-bold py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all disabled:opacity-40"
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
