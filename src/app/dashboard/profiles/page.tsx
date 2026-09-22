"use client";

import { useEffect, useState } from 'react';
import RouterOffline from '@/components/RouterOffline';
import Link from 'next/link';

export default function ProfilesManage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [pools, setPools] = useState<string[]>([]);
  const [queues, setQueues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [routerError, setRouterError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [sharedUsers, setSharedUsers] = useState('1');
  const [rateLimit, setRateLimit] = useState('');
  const [expmode, setExpmode] = useState('0');
  const [validity, setValidity] = useState('');
  const [graceperiod, setGraceperiod] = useState('5m');
  const [price, setPrice] = useState('0');
  const [sprice, setSprice] = useState('0');
  const [lockunlock, setLockunlock] = useState('Disable');
  const [ppool, setPpool] = useState('none');
  const [parent, setParent] = useState('none');

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/hotspot/profiles');
      
      // Session/connection errors → show RouterOffline banner
      if (res.status === 401 || res.status === 503) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.message || '');
        setNotConnected(true);
        setLoading(false);
        return;
      }
      
      // RouterOS API error → show inline error
      if (res.status === 422) {
        const data = await res.json().catch(() => ({}));
        setRouterError(data.message || 'Erro ao executar comando no MikroTik.');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data.profiles);
        setPools(data.data.pools || []);
        setQueues(data.data.queues || []);
        setNotConnected(false);
        setRouterError('');
        setErrorMessage('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name,
        sharedUsers,
        rateLimit,
        expmode,
        validity: expmode !== '0' ? validity : '',
        graceperiod: expmode !== '0' ? graceperiod : '',
        price,
        sprice,
        lockunlock,
        ppool,
        parent
      };

      const res = await fetch('/api/hotspot/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Perfil de Acesso salvo com sucesso!');
        setName('');
        setRateLimit('');
        setExpmode('0');
        setValidity('');
        setGraceperiod('5m');
        setPrice('0');
        setSprice('0');
        setLockunlock('Disable');
        setPpool('none');
        setParent('none');
        fetchProfiles(); // Refresh table
      } else {
        alert('Erro ao salvar perfil: ' + data.message);
      }
    } catch (e) {
      alert('Erro na conexão com a API.');
    } finally {
      setCreating(false);
    }
  };

  if (notConnected) {
    return (
      <RouterOffline 
        title="Perfis de Acesso (Profiles)" 
        description="Crie planos de banda, limites e regras de expiração idênticas ao Mikhmon"
        errorMessage={errorMessage}
      />
    );
  }

  if (routerError) {
    return (
      <main className="p-4 md:p-6 space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
        <header className="bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded tracking-wider uppercase">
                Hotspot // Erro de Roteamento
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Perfis de Acesso (Profiles)
              </h1>
            </div>
          </div>
        </header>

        {/* Diagnostic module box */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">AUDITORIA DE SERVIÇOS DO ROTEADOR</span>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <span className="text-amber-600 text-2xl">⚠️</span>
              </div>
              <div className="space-y-3 text-center md:text-left flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hotspot não configurado no Roteador</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-xl font-medium">
                  O roteador está conectado com sucesso, porém o servidor de hotspot e seus serviços correlatos não foram localizados. É necessário provisioná-los antes de gerenciar planos.
                </p>
                <div className="bg-slate-100 dark:bg-[#0e1524] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-400 font-mono">
                  {routerError}
                </div>
                <div className="pt-2">
                  <Link href="/dashboard/portal?tab=provisioning" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all">
                    ⚙️ Provisionar Hotspot Agora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full p-4 md:p-6 space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 rounded tracking-wider uppercase">
              Gerenciador de Perfis & Planos
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Planos / Perfis
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            Gerencie perfis de acesso e limites de velocidade no MikroTik
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161e31]">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Novo Perfil de Acesso</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Defina limites, validade e valores para os vouchers</p>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Plano</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value.replace(/\s/g, '-'))} 
                  required 
                  placeholder="Ex: 1-Hora-R$2" 
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">IP Pool (Address Pool)</label>
                <select 
                  value={ppool} 
                  onChange={(e) => setPpool(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm"
                >
                  <option value="none">none (Padrão do Hotspot)</option>
                  {pools.map((p, idx) => <option key={`${p}-${idx}`} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Limite de Velocidade (Rate Limit)</label>
                <input 
                  type="text" 
                  value={rateLimit} 
                  onChange={(e) => setRateLimit(e.target.value)} 
                  placeholder="Ex: 512k/2M ou 1M/5M" 
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-none font-medium">Upload/Download. Vazio para ilimitado.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Usuários Simultâneos (Shared)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={sharedUsers} 
                  onChange={(e) => setSharedUsers(e.target.value)} 
                  required
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Modo de Expiração</label>
                <select 
                  value={expmode} 
                  onChange={(e) => setExpmode(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm"
                >
                  <option value="0">Nenhum (Voucher não expira)</option>
                  <option value="rem">Remover (Apaga voucher expirado)</option>
                  <option value="ntf">Aviso (Bloqueia e mostra tela de expirado)</option>
                  <option value="remc">Remover e Registrar (Apaga e grava faturamento)</option>
                  <option value="ntfc">Aviso e Registrar (Bloqueia e grava faturamento)</option>
                </select>
              </div>

              {expmode !== '0' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Validade (Validity)</label>
                    <input 
                      type="text" 
                      value={validity} 
                      onChange={(e) => setValidity(e.target.value)} 
                      required 
                      placeholder="Ex: 1d, 12h, 30m" 
                      className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-none font-medium">Duração após o primeiro login.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Período de Graça</label>
                    <input 
                      type="text" 
                      value={graceperiod} 
                      onChange={(e) => setGraceperiod(e.target.value)} 
                      required 
                      placeholder="Ex: 5m" 
                      className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none shadow-sm" 
                    />
                  </div>
                </>
              ) : (
                <div className="hidden sm:block"></div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preço de Custo (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preço de Venda (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={sprice} 
                  onChange={(e) => setSprice(e.target.value)} 
                  required
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vincular ao MAC (Lock User)</label>
                <select 
                  value={lockunlock} 
                  onChange={(e) => setLockunlock(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm"
                >
                  <option value="Disable">Desativado (Multi-aparelho)</option>
                  <option value="Enable">Ativado (Trava no primeiro login)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fila Pai (Parent Queue)</label>
                <select 
                  value={parent} 
                  onChange={(e) => setParent(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#0e1524] border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-[#0e1524] focus:border-blue-600 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-sm"
                >
                  <option value="none">none (Nenhuma Fila Pai)</option>
                  {queues.map((q, idx) => <option key={`${q}-${idx}`} value={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                type="submit" 
                disabled={creating} 
                className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creating ? 'Salvando Configurações...' : 'Salvar Perfil de Acesso'}
              </button>
            </div>
          </form>
        </div>

        {/* Readme Panel */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-fit lg:col-span-1">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161e31]">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Documentação</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Parâmetros de configuração</p>
          </div>
          
          <div className="p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider pb-1.5 border-b border-slate-200 dark:border-slate-800">
              Guia Rápido
            </h3>
            
            <div className="space-y-4 leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              <div>
                <strong className="text-blue-700 dark:text-blue-400 block mb-1 font-bold">1. NOME DO PLANO:</strong>
                <p>Evite espaços em branco. O sistema substitui automaticamente espaços vazios por hífens (`-`).</p>
              </div>
              <div>
                <strong className="text-blue-700 dark:text-blue-400 block mb-1 font-bold">2. FORMATO DE VALIDADE:</strong>
                <p>Duração total da navegação a partir do primeiro login.</p>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li><strong>30m</strong> = 30 minutos</li>
                  <li><strong>12h</strong> = 12 horas</li>
                  <li><strong>1d</strong> = 1 dia</li>
                  <li><strong>30d</strong> = 30 dias</li>
                </ul>
              </div>
              <div>
                <strong className="text-blue-700 dark:text-blue-400 block mb-1 font-bold">3. MODOS DE REGISTRO:</strong>
                <p>Opte por registros contendo <strong>"Registrar"</strong> para habilitar gravação persistente de transações financeiras em scripts de log no MikroTik, garantindo relatórios completos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profiles List */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161e31] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Perfis Cadastrados no MikroTik</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Planos ativos e configurados no roteador</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 tracking-wider uppercase">
            {profiles.length} PERFIS
          </span>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3.5">Nome (Profile)</th>
                  <th className="px-6 py-3.5">Usuários Simultâneos</th>
                  <th className="px-6 py-3.5">Banda (Rate Limit)</th>
                  <th className="px-6 py-3.5 text-right">Pool de IPs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#111726]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic font-medium">
                      Carregando profiles cadastrados...
                    </td>
                  </tr>
                ) : profiles.map((p, index) => (
                  <tr key={`${p.id || p.name}-${index}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 text-sm">{p.name}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">{p['shared-users'] || '1'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{p['rate-limit'] || 'Ilimitada'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-right">{p['address-pool'] || 'none'}</td>
                  </tr>
                ))}
                {(!loading && profiles.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic font-medium">
                      Nenhum perfil de Hotspot encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
