'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RaffleModal from '@/components/leads/RaffleModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [isRaffleOpen, setIsRaffleOpen] = useState(false);
  const [resettingRaffle, setResettingRaffle] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (q: string = '') => {
    try {
      const res = await fetch(`/api/leads?search=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error('Erro ao carregar leads:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (paymentId: string, action: 'approve' | 'block') => {
    if (!confirm(action === 'approve' ? 'Aprovar acesso e enviar mensagem de confirmação?' : 'Bloquear acesso do cliente no MikroTik e enviar cobrança?')) return;
    
    setActionLoading(paymentId);
    try {
      const res = await fetch('/api/leads/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(action === 'approve' ? 'Acesso Aprovado!' : 'Acesso Bloqueado e Cobrança Enviada!');
        fetchLeads(search);
      } else {
        alert('Erro: ' + (data.error || 'Falha ao processar'));
      }
    } catch (e) {
      alert('Erro ao executar ação.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cadastro de "${leadName || 'Sem nome'}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingId(leadId);
    try {
      const res = await fetch(`/api/leads?id=${encodeURIComponent(leadId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
      } else {
        alert('Erro ao excluir: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (e) {
      alert('Erro de comunicação ao excluir o lead.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllLeads = async () => {
    if (leads.length === 0) {
      alert('A base de leads já está vazia.');
      return;
    }

    const confirmFirst = confirm(`ATENÇÃO: Você está prestes a excluir TODOS os ${leads.length} leads cadastrados no banco de dados.\n\nDeseja continuar?`);
    if (!confirmFirst) return;

    const confirmSecond = confirm(`Confirmação final: Todos os históricos de auto-cadastro e cobranças manuais serão apagados permanentemente.\n\nClique em OK para confirmar.`);
    if (!confirmSecond) return;

    setClearingAll(true);
    try {
      const res = await fetch('/api/leads?all=true', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('Todos os leads foram excluídos com sucesso!');
        setLeads([]);
      } else {
        alert('Erro ao limpar base: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (e) {
      alert('Erro de conexão ao limpar base de leads.');
    } finally {
      setClearingAll(false);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleResetRaffle = async () => {
    if (!confirm('Deseja zerar o histórico de sorteios? Todos os leads poderão ser sorteados novamente.')) return;
    setResettingRaffle(true);
    try {
      const res = await fetch('/api/leads/raffle/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Sorteios zerados! ${data.count} leads estão disponíveis novamente.`);
      }
    } catch {
      alert('Erro ao zerar sorteios.');
    } finally {
      setResettingRaffle(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">Leads & Cobranças</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              {leads.length} {leads.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Gerencie os clientes capturados pelo portal e compras via WhatsApp.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsRaffleOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-500/50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Sortear Novo Lead
          </button>
          <button
            onClick={handleResetRaffle}
            disabled={resettingRaffle}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            {resettingRaffle ? 'Zerando...' : 'Zerar Sorteios'}
          </button>
          <button
            onClick={handleClearAllLeads}
            disabled={clearingAll || leads.length === 0}
            className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            {clearingAll ? (
              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Limpar Todos os Leads
          </button>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Buscar por usuário, nome ou WhatsApp..." 
              className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLeads(search)}
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            onClick={() => fetchLeads(search)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md w-full sm:w-auto cursor-pointer"
          >
            Buscar
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-bold tracking-wider">Usuário Hotspot</th>
                <th className="px-6 py-4 font-bold tracking-wider">WhatsApp</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status Pagamento</th>
                <th className="px-6 py-4 font-bold tracking-wider">Plano (R$)</th>
                <th className="px-6 py-4 font-bold tracking-wider">Data Cadastro</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono text-slate-400">Carregando base de leads...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">👥</span>
                      <p className="text-sm font-bold text-slate-300">Nenhum lead encontrado.</p>
                      <p className="text-xs text-slate-500 font-mono">Os cadastros realizados no Hotspot e pedidos aparecerão aqui.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map(lead => {
                  const lastPayment = lead.payments?.[0];
                  const isDeleting = deletingId === lead.id;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/40 text-indigo-300 flex items-center justify-center text-xs font-bold">
                            {(lead.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-200 text-xs leading-none">{lead.name || 'Sem nome'}</span>
                            {lead.email && <span className="text-[10px] text-slate-500 font-mono">{lead.email}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-xs font-mono text-sky-400">
                          {lead.hotspotUser}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {lead.whatsappNumber ? (
                          <a
                            href={`https://wa.me/55${lead.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-mono transition-colors"
                          >
                            <span>💬 {lead.whatsappNumber}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {!lastPayment ? (
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                            Auto-Cadastro
                          </span>
                        ) : lastPayment.status === 'approved' ? (
                          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            ✅ Aprovado
                          </span>
                        ) : lastPayment.status === 'pending' ? (
                          <span className="text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            ⏳ Pendente
                          </span>
                        ) : (
                          <span className="text-rose-400 bg-rose-950/60 border border-rose-800/50 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            🛑 Bloqueado
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {!lastPayment ? (
                          <span className="text-slate-500 text-xs font-mono">—</span>
                        ) : (
                          <div>
                            <div className="font-bold text-xs text-slate-200">{formatBRL(lastPayment.amount)}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{lastPayment.profile}</div>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lastPayment && lastPayment.status !== 'approved' && (
                            <button
                              onClick={() => handleAction(lastPayment.id, 'approve')}
                              disabled={actionLoading === lastPayment.id}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Aprovar Pagamento"
                            >
                              ✅ Aprovar
                            </button>
                          )}

                          {lastPayment && (
                            <button
                              onClick={() => handleAction(lastPayment.id, 'block')}
                              disabled={actionLoading === lastPayment.id}
                              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Bloquear no MikroTik & Cobrar"
                            >
                              🛑 Bloquear
                            </button>
                          )}

                          {/* Delete Lead Button */}
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            disabled={isDeleting}
                            className="bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800/60 p-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                            title="Excluir Lead"
                          >
                            {isDeleting ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isRaffleOpen && (
        <RaffleModal 
          onClose={() => setIsRaffleOpen(false)} 
          onRaffleComplete={() => fetchLeads(search)} 
        />
      )}
    </div>
  );
}
