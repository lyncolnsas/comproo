"use client";

import { useEffect, useState } from 'react';
import { Plus, Phone, RefreshCcw, LogOut, Trash2 } from 'lucide-react';

interface WhatsappInstance {
  id: string;
  name: string;
  number: string | null;
  profilePicUrl?: string | null;
  status: string;
  qr: string | null;
}

export default function WhatsappConnection() {
  const [instances, setInstances] = useState<WhatsappInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const loadInstances = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setInstances(data.instances || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
    const interval = setInterval(loadInstances, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    await fetch('/api/whatsapp/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: newName })
    });
    setNewName('');
    setIsCreating(false);
    loadInstances();
  };

  const handleAction = async (id: string, action: 'connect' | 'logout' | 'delete') => {
    setLoading(true);
    await fetch('/api/whatsapp/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id })
    });
    loadInstances();
  };

  return (
    <main className="w-full p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#22c55e' }}>
            ▶ SYSTEM // WHATSAPP INTEGRATION
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Aparelhos Conectados
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Gerencie múltiplos números de WhatsApp para balanceamento de carga no atendimento automático.
          </p>
        </div>
      </header>

      <div className="aurora-card p-4 md:p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Adicionar Novo Aparelho</h2>
        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: WhatsApp Suporte" 
            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
          />
          <button 
            onClick={handleCreate} 
            disabled={isCreating || !newName.trim()}
            className="aurora-btn text-xs px-4 py-2 flex items-center gap-2" 
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && instances.length === 0 ? (
          <div className="aurora-card p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sky-400 font-bold">Carregando dispositivos...</p>
          </div>
        ) : instances.length === 0 ? (
          <div className="aurora-card p-6 flex flex-col items-center justify-center min-h-[300px] col-span-full">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
              <Phone className="text-slate-500" size={32} />
            </div>
            <p className="text-slate-400 font-bold text-xl mb-2">Nenhum aparelho configurado</p>
            <p className="text-sm text-slate-500 text-center">
              Adicione um aparelho acima para começar a usar a integração.
            </p>
          </div>
        ) : (
          instances.map(inst => (
            <div key={inst.id} className="aurora-card flex flex-col min-h-[400px]">
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                <div>
                  <h3 className="font-bold text-white text-sm">{inst.name}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${inst.status === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {inst.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <button 
                  onClick={() => handleAction(inst.id, 'delete')}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  title="Excluir Aparelho"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {inst.status === 'connected' ? (
                  <div className="flex flex-col items-center w-full">
                    {inst.profilePicUrl ? (
                      <img src={inst.profilePicUrl} alt="WhatsApp" className="w-20 h-20 rounded-full border-2 border-emerald-500/50 mb-4 object-cover shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/50">
                        <span className="text-3xl">📱</span>
                      </div>
                    )}
                    <p className="text-emerald-400 font-bold text-lg mb-1">{inst.number ? `+${inst.number}` : 'Pronto para uso'}</p>
                    <p className="text-xs text-slate-400 text-center mb-6">
                      Sessão ativa e processando mensagens automáticas.
                    </p>
                    <button  
                      onClick={() => handleAction(inst.id, 'logout')} 
                      className="aurora-btn text-xs w-full py-2 flex items-center justify-center gap-2" 
                      style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                    >
                      <LogOut size={14} /> Sair do WhatsApp
                    </button>
                  </div>
                ) : inst.status === 'connecting' && !inst.qr ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-sky-400 font-bold text-sm">Iniciando sessão...</p>
                  </div>
                ) : inst.qr ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="bg-white p-3 rounded-2xl mb-4 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inst.qr)}`} alt="QR Code" className="w-40 h-40" />
                    </div>
                    <p className="text-white font-bold text-sm mb-1">Escaneie o QR Code</p>
                    <p className="text-[10px] text-slate-400 text-center mb-5">
                      Abra o WhatsApp no celular, vá em Aparelhos Conectados e escaneie.
                    </p>
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleAction(inst.id, 'connect')} 
                        className="aurora-btn text-[10px] flex-1 py-2 flex items-center justify-center gap-1" 
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                      >
                        <RefreshCcw size={12} /> Atualizar
                      </button>
                      <button 
                        onClick={() => handleAction(inst.id, 'logout')} 
                        className="aurora-btn text-[10px] flex-1 py-2 flex items-center justify-center gap-1" 
                        style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                      >
                        <LogOut size={12} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                      <span className="text-3xl text-slate-500">🚫</span>
                    </div>
                    <p className="text-slate-400 font-bold text-lg mb-1">Desconectado</p>
                    <p className="text-xs text-slate-500 text-center mb-6">
                      Clique abaixo para parear o dispositivo.
                    </p>
                    <button 
                      onClick={() => handleAction(inst.id, 'connect')} 
                      className="aurora-btn text-xs w-full py-2" 
                      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                    >
                      Conectar Dispositivo
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-6 mt-8">
        <div className="aurora-card p-6">
          <h3 className="text-md font-bold text-white mb-3">Como Funciona o Balanceamento?</h3>
          <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-sky-400">1.</span>
                Ao conectar mais de um aparelho, o sistema irá revezá-los de forma inteligente sempre que um cliente for redirecionado.
              </li>
              <li className="flex gap-2">
                <span className="text-sky-400">2.</span>
                Isso distribui a carga de mensagens e ajuda a evitar bloqueios do WhatsApp por atividades atípicas.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">3.</span>
                Se um dos aparelhos cair a conexão, o sistema continuará operando com os demais que estiverem online.
              </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
