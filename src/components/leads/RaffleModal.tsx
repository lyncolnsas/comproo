'use client';

import { useState, useEffect } from 'react';

interface RaffleModalProps {
  onClose: () => void;
  onRaffleComplete: () => void;
}

export default function RaffleModal({ onClose, onRaffleComplete }: RaffleModalProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [winner, setWinner] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [whatsappMsg, setWhatsappMsg] = useState('Parabéns [Nome]! Você acaba de ser sorteado!');

  useEffect(() => {
    fetchEligibleLeads();
  }, []);

  const fetchEligibleLeads = async () => {
    try {
      const res = await fetch('/api/leads/raffle/eligible');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      } else {
        setError(data.error || 'Erro ao carregar leads');
      }
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const executeRaffle = async () => {
    if (leads.length === 0) return;
    setIsProcessing(true);
    setError('');
    
    // Pick random
    const winnerIndex = Math.floor(Math.random() * leads.length);
    const chosenWinner = leads[winnerIndex];
    
    try {
      const parsedMsg = whatsappMsg.replace('[Nome]', chosenWinner.name || 'Cliente');
      
      const res = await fetch('/api/leads/raffle/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: chosenWinner.id,
          phone: chosenWinner.phone,
          message: parsedMsg
        })
      });
      const data = await res.json();

      if (data.success) {
        setWinner(chosenWinner);
        onRaffleComplete();
      } else {
        setError('Erro ao processar ganhador: ' + (data.error || 'Falha no servidor'));
      }
    } catch (e) {
      setError('Erro de conexão ao salvar ganhador.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] rounded-2xl p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {loading ? (
          <div className="py-8">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Carregando leads...</p>
          </div>
        ) : error ? (
          <div className="w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-rose-500/20 text-rose-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="text-xl font-black mb-2 text-rose-400">Erro!</h3>
            <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">{error}</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer">
              Fechar
            </button>
          </div>
        ) : leads.length === 0 && !winner ? (
          <div className="w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-800 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path></svg>
            </div>
            <h3 className="text-xl font-black mb-2 text-slate-300">Sem leads</h3>
            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Não há leads disponíveis para sorteio.</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer">
              Fechar
            </button>
          </div>
        ) : winner ? (
          <div className="w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-500/20 text-emerald-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-black mb-2 text-emerald-400">Sorteio Concluído!</h3>
            <div className="bg-slate-950 border border-emerald-900/30 rounded-xl p-4 my-4">
              <p className="text-xs text-slate-400 mb-1">Ganhador:</p>
              <p className="text-lg font-bold text-white truncate">{winner.name || 'Sem nome'}</p>
              <p className="text-sm font-mono text-emerald-500 mt-1">{winner.phone || 'Sem número'}</p>
            </div>
            <p className="text-slate-300 text-xs mb-6">A mensagem foi enviada via WhatsApp (se conectado).</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer">
              Concluir
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-500/20 text-emerald-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-xl font-black mb-2 text-emerald-400">Sortear Lead</h3>
            <p className="text-slate-300 text-sm font-medium mb-4 leading-relaxed">
              Temos <strong>{leads.length}</strong> leads disponíveis para o sorteio.
            </p>
            
            <div className="text-left mb-6">
              <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Mensagem WhatsApp:</label>
              <textarea 
                value={whatsappMsg}
                onChange={e => setWhatsappMsg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none resize-none h-20"
              />
              <p className="text-[10px] text-slate-500 mt-1 ml-1">Use [Nome] para o nome do ganhador.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} disabled={isProcessing} className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer">
                Cancelar
              </button>
              <button onClick={executeRaffle} disabled={isProcessing || !whatsappMsg.trim()} className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex justify-center items-center cursor-pointer">
                {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Realizar Sorteio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
