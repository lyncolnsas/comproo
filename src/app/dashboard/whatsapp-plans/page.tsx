'use client';

import { useState, useEffect } from 'react';

export default function WhatsappPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [profile, setProfile] = useState('');
  const [price, setPrice] = useState('0');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/whatsapp-plans');
      if (res.ok) setPlans(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/whatsapp-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, profile, price: Number(price), active })
    });
    setTitle('');
    setProfile('');
    setPrice('0');
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Excluir este plano?')) return;
    await fetch(`/api/whatsapp-plans/${id}`, { method: 'DELETE' });
    fetchPlans();
  };

  const toggleActive = async (plan: any) => {
    await fetch(`/api/whatsapp-plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plan, active: !plan.active })
    });
    fetchPlans();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Planos do WhatsApp (PIX)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-xl h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Adicionar Plano</h2>
          <form onSubmit={addPlan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome de Exibição (O que o cliente vê)</label>
              <input 
                required 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: 1 Dia de Acesso"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Profile (Exato do MikroTik)</label>
              <input 
                required 
                type="text" 
                value={profile} 
                onChange={e => setProfile(e.target.value)} 
                placeholder="Ex: 1_Dia_10M"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Preço R$ (Valor do PIX)</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg transition-colors">
              Salvar Plano
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p className="text-slate-400">Carregando planos...</p>
          ) : plans.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50 border-dashed">
              <p className="text-slate-400">Nenhum plano cadastrado ainda.</p>
              <p className="text-sm text-slate-500 mt-2">Os planos cadastrados aqui aparecerão para o cliente comprar via WhatsApp.</p>
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                  <div className="flex gap-4 text-sm text-slate-400 mt-1">
                    <span>Profile: <strong className="text-slate-300">{plan.profile}</strong></span>
                    <span>Preço: <strong className="text-emerald-400">R$ {plan.price.toFixed(2)}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleActive(plan)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${plan.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
                  >
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button onClick={() => deletePlan(plan.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
