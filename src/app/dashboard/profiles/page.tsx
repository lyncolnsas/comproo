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
      <main className="p-4 md:p-6 space-y-6 animate-fade-in">
        <header className="retro-card p-4 flex items-center gap-3">
          <div className="rack-screw" />
          <span className="led led-amber animate-led-blink" />
          <div>
            <div style={{ color: 'var(--led-amber)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              ▶ SYSTEM // HOSTSPOT ROUTING ERROR
            </div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
              Perfis de Acesso (Profiles)
            </h1>
          </div>
          <div className="ml-auto rack-screw" />
        </header>

        {/* Diagnostic module box */}
        <div className="retro-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="rack-screw" />
            <span className="font-mono text-xs font-bold text-slate-450 uppercase">ROUTER_SERVICES_AUDIT</span>
            <div className="ml-auto rack-screw" />
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#2c1e12', border: '2px solid #b45309', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6)' }}>
                <span className="text-amber-500 text-xl">⚠️</span>
              </div>
              <div className="space-y-3 text-center md:text-left flex-1">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Hotspot não configurado no Roteador</h3>
                <p className="text-slate-400 text-xs font-mono leading-relaxed max-w-xl">
                  O roteador está conectado com sucesso, porém o servidor de hotspot e seus serviços correlatos não foram localizados. É necessário provisioná-los antes de gerenciar planos.
                </p>
                <div className="retro-display p-3 text-[10px] text-amber-500 font-mono">
                  {routerError}
                </div>
                <div className="pt-2">
                  <Link href="/dashboard/portal?tab=provisioning" className="retro-btn retro-btn-amber text-xs">
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
    <main className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-blue animate-led-pulse" />
        <div>
          <div style={{ color: 'var(--led-blue)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ HOTSPOT // BANDWIDTH PLANS & PROFILES MANAGER
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            Perfis de Acesso (Profiles)
          </h1>
        </div>
        <div className="ml-auto rack-screw" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="retro-card lg:col-span-2">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="rack-screw" />
            <span className="font-mono text-xs font-bold text-slate-450 uppercase">PROGRAM_PLAN_PROFILE</span>
          </div>

          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Nome do Plano</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value.replace(/\s/g, '-'))} 
                  required 
                  placeholder="Ex: 1-Hora-R$2" 
                  className="retro-input text-xs" 
                />
              </div>
              
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>IP Pool (Address Pool)</label>
                <select 
                  value={ppool} 
                  onChange={(e) => setPpool(e.target.value)} 
                  className="retro-input text-xs"
                  style={{ background: '#06080e' }}
                >
                  <option value="none" className="bg-[#0c0c18]">none (Padrão do Hotspot)</option>
                  {pools.map((p, idx) => <option key={`${p}-${idx}`} value={p} className="bg-[#0c0c18]">{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Limite de Velocidade (Rate Limit)</label>
                <input 
                  type="text" 
                  value={rateLimit} 
                  onChange={(e) => setRateLimit(e.target.value)} 
                  placeholder="Ex: 512k/2M ou 1M/5M" 
                  className="retro-input text-xs uppercase" 
                />
                <p className="text-[9px] text-slate-550 font-mono mt-0.5 leading-none">Upload/Download. Vazio para ilimitado.</p>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Usuários Simultâneos (Shared)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={sharedUsers} 
                  onChange={(e) => setSharedUsers(e.target.value)} 
                  required
                  className="retro-input text-xs" 
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Modo de Expiração</label>
                <select 
                  value={expmode} 
                  onChange={(e) => setExpmode(e.target.value)} 
                  className="retro-input text-xs"
                  style={{ background: '#06080e' }}
                >
                  <option value="0" className="bg-[#0c0c18]">Nenhum (Voucher não expira)</option>
                  <option value="rem" className="bg-[#0c0c18]">Remover (Apaga voucher expirado)</option>
                  <option value="ntf" className="bg-[#0c0c18]">Aviso (Bloqueia e mostra tela de expirado)</option>
                  <option value="remc" className="bg-[#0c0c18]">Remover e Registrar (Apaga e grava faturamento)</option>
                  <option value="ntfc" className="bg-[#0c0c18]">Aviso e Registrar (Bloqueia e grava faturamento)</option>
                </select>
              </div>

              {expmode !== '0' ? (
                <>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Validade (Validity)</label>
                    <input 
                      type="text" 
                      value={validity} 
                      onChange={(e) => setValidity(e.target.value)} 
                      required 
                      placeholder="Ex: 1d, 12h, 30m" 
                      className="retro-input text-xs" 
                    />
                    <p className="text-[9px] text-slate-550 font-mono mt-0.5 leading-none">Duração após o primeiro login.</p>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Período de Graça</label>
                    <input 
                      type="text" 
                      value={graceperiod} 
                      onChange={(e) => setGraceperiod(e.target.value)} 
                      required 
                      placeholder="Ex: 5m" 
                      className="retro-input text-xs" 
                    />
                  </div>
                </>
              ) : (
                <div className="hidden sm:block"></div>
              )}

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Preço de Custo (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required
                  className="retro-input text-xs" 
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Preço de Venda (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={sprice} 
                  onChange={(e) => setSprice(e.target.value)} 
                  required
                  className="retro-input text-xs" 
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Vincular ao MAC (Lock User)</label>
                <select 
                  value={lockunlock} 
                  onChange={(e) => setLockunlock(e.target.value)} 
                  className="retro-input text-xs"
                  style={{ background: '#06080e' }}
                >
                  <option value="Disable" className="bg-[#0c0c18]">Desativado (Multi-aparelho)</option>
                  <option value="Enable" className="bg-[#0c0c18]">Ativado (Trava no primeiro login)</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Fila Pai (Parent Queue)</label>
                <select 
                  value={parent} 
                  onChange={(e) => setParent(e.target.value)} 
                  className="retro-input text-xs"
                  style={{ background: '#06080e' }}
                >
                  <option value="none" className="bg-[#0c0c18]">none (Nenhuma Fila Pai)</option>
                  {queues.map((q, idx) => <option key={`${q}-${idx}`} value={q} className="bg-[#0c0c18]">{q}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={creating} 
                className="w-full retro-btn retro-btn-primary py-2.5"
              >
                {creating ? 'Salvando Configurações...' : 'Salvar Perfil de Acesso'}
              </button>
            </div>
          </form>
        </div>

        {/* Readme Panel */}
        <div className="retro-card h-fit lg:col-span-1">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="rack-screw" />
            <span className="font-mono text-xs font-bold text-slate-450 uppercase">TECHNICAL_DOCUMENTATION</span>
          </div>
          
          <div className="p-5 space-y-4 text-xs font-mono">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-[#0a0a18] pb-1.5" style={{ textShadow: '0 0 5px rgba(255,255,255,0.1)' }}>
              Guia de Configuração
            </h3>
            
            <div className="space-y-3 leading-relaxed text-slate-400">
              <div>
                <strong className="text-white block text-[10px] uppercase">1. Nome do Plano:</strong>
                <p className="text-[10px] mt-0.5">Evite espaços em branco. O sistema substitui automaticamente espaços vazios por hífens (`-`).</p>
              </div>
              <div>
                <strong className="text-white block text-[10px] uppercase">2. Formato de Validade:</strong>
                <p className="text-[10px] mt-0.5">Duração total da navegação a partir do primeiro login.</p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[10px]">
                  <li><strong>30m</strong> = 30 minutos</li>
                  <li><strong>12h</strong> = 12 horas</li>
                  <li><strong>1d</strong> = 1 dia</li>
                  <li><strong>30d</strong> = 30 dias</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block text-[10px] uppercase">3. Modos de Registro:</strong>
                <p className="text-[10px] mt-0.5">Opte por registros contendo <strong>"Registrar"</strong> (*c* no sufixo) para habilitar gravação persistente de transações financeiras em scripts de log no MikroTik, garantindo relatórios completos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profiles List */}
      <div className="retro-card">
        <div className="px-5 py-4 border-b border-[#0a0a18] flex justify-between items-center" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="rack-screw" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Perfis Cadastrados no MikroTik</h2>
              <p className="text-[10px] text-slate-400 font-mono">Planos ativos e configurados no roteador</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="retro-badge retro-badge-blue font-mono">{profiles.length} PERFIS</span>
            <div className="rack-screw" />
          </div>
        </div>

        <div className="p-4">
          <div className="retro-table-wrap">
            <table className="w-full text-left text-xs border-collapse">
              <thead style={{ background: '#070f1e', borderBottom: '2px solid #0a0a18' }}>
                <tr style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--display-dim)' }}>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Nome (Profile)</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Usuários Simultâneos</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Banda (Rate Limit)</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Pool de IPs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0c0c1c]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Carregando profiles cadastrados...</td></tr>
                ) : profiles.map((p, index) => (
                  <tr key={`${p.id || p.name}-${index}`} className="hover:bg-[#101026]/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#7dd3fc] text-sm tracking-wide">{p.name}</td>
                    <td className="px-6 py-4 text-white">{p['shared-users'] || '1'}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{p['rate-limit'] || 'Ilimitada'}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-right">{p['address-pool'] || 'none'}</td>
                  </tr>
                ))}
                {(!loading && profiles.length === 0) && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Nenhum perfil de Hotspot encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
