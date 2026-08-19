"use client";

import { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [dbStatus] = useState('Conectado');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [routers, setRouters] = useState<any[]>([]);
  const [loadingRouters, setLoadingRouters] = useState(true);
  const [showRouterForm, setShowRouterForm] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Router Form
  const [rName, setRName] = useState('');
  const [rHost, setRHost] = useState('');
  const [rUser, setRUser] = useState('');
  const [rPass, setRPass] = useState('');

  const fetchRouters = async () => {
    try {
      const res = await fetch('/api/admin/routers');
      const data = await res.json();
      if (data.success) {
        setRouters(data.routers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRouters(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRouter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/routers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rName, host: rHost, user: rUser, password: rPass })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setRName(''); setRHost(''); setRUser(''); setRPass('');
        setShowRouterForm(false);
        fetchRouters();
      }
    } catch (err) {
      alert('Erro de conexão ao salvar router.');
    }
  };

  const handleDeleteRouter = async (id: string) => {
    if (!confirm('Deseja excluir este Mikrotik do sistema?')) return;
    try {
      const res = await fetch('/api/admin/routers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) fetchRouters();
      else alert(data.message);
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  const connectToRouter = async (router: any) => {
    setConnectingId(router.id);
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: router.host, user: router.user, pass: router.password })
      });
      const data = await res.json();
      if (data.success) {
        alert('Conectado com sucesso a ' + router.name + '!');
        window.location.href = '/dashboard';
      } else {
        alert('Erro ao conectar: ' + data.message);
      }
    } catch (e) {
      alert('Erro de rede ao conectar.');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-blue animate-led-pulse" />
        <div>
          <div style={{ color: 'var(--led-blue)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ SYSTEM // HARDWARE ROUTERS & USERS CONFIG
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            Roteadores e Sistema
          </h1>
        </div>
        <div className="ml-auto rack-screw" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Routers List — Main area */}
        <div className="lg:col-span-3 retro-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="flex items-center gap-2">
              <div className="rack-screw" />
              <span className="font-mono text-xs font-bold text-slate-450 uppercase">CONNECTED_MIKROTIK_UNITS</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRouterForm(!showRouterForm)}
                className="retro-btn retro-btn-primary py-1 px-3 text-[10px]"
              >
                + Adicionar
              </button>
              <div className="rack-screw" />
            </div>
          </div>

          <div className="p-5 space-y-4">
            {showRouterForm && (
              <form onSubmit={handleAddRouter} className="bg-[#0c0c1c]/60 p-4 border border-[#252542] rounded-xl space-y-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">Cadastrar Novo Roteador</h3>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Nome de Identificação</label>
                  <input type="text" value={rName} onChange={e => setRName(e.target.value)} required placeholder="Ex: Mikrotik Matriz" className="retro-input py-1.5 px-3 text-xs" />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>IP ou Host</label>
                  <input type="text" value={rHost} onChange={e => setRHost(e.target.value)} required placeholder="Ex: 192.168.88.1" className="retro-input py-1.5 px-3 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Usuário API</label>
                    <input type="text" value={rUser} onChange={e => setRUser(e.target.value)} required placeholder="admin" className="retro-input py-1.5 px-3 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Senha</label>
                    <input type="password" value={rPass} onChange={e => setRPass(e.target.value)} placeholder="••••" className="retro-input py-1.5 px-3 text-xs" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowRouterForm(false)} className="retro-btn retro-btn-dark py-1.5 px-3 text-[10px]">Cancelar</button>
                  <button type="submit" className="retro-btn retro-btn-primary py-1.5 px-3 text-[10px]">Salvar MikroTik</button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {loadingRouters ? (
                <p className="text-center text-slate-400 text-xs py-6 font-mono animate-pulse">Carregando unidades de hardware...</p>
              ) : routers.length === 0 ? (
                <div className="bg-[#0c0c18] p-6 border border-[#252542] rounded-xl text-center space-y-4">
                  <div className="w-10 h-10 rounded-full bg-[#1b1b36] flex items-center justify-center mx-auto" style={{ border: '2px solid #3d3d6b', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)' }}>
                    <span className="text-slate-400 text-sm">🖧</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-xs font-bold font-mono">Nenhum Roteador Cadastrado</p>
                    <p className="text-slate-500 text-[10px] font-mono leading-normal">Cadastre um MikroTik no botão "+ Adicionar" acima para inicializar a integração do painel.</p>
                  </div>
                  <span className="retro-badge retro-badge-amber font-mono">
                    BANCO: {dbStatus}
                  </span>
                </div>
              ) : (
                routers.map(router => (
                  <div key={router.id} className="border border-[#252542] rounded-xl p-4 flex items-center justify-between hover:border-[#3d3d6b] transition-all" style={{ background: 'linear-gradient(180deg, #181830 0%, #121224 100%)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0a0a18', border: '1px solid #252542' }}>
                        <span className="text-slate-400 text-xs">📟</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">{router.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{router.host} · {router.user}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => connectToRouter(router)}
                        disabled={connectingId === router.id}
                        className="retro-btn retro-btn-success py-1.5 px-3 text-[10px]"
                      >
                        {connectingId === router.id ? 'Conectando...' : '⚡ Conectar'}
                      </button>
                      <button
                        onClick={() => handleDeleteRouter(router.id)}
                        className="retro-btn retro-btn-danger py-1.5 px-3 text-[10px]"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column settings panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel User Card */}
          <div className="retro-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
              <div className="rack-screw" />
              <span className="font-mono text-xs font-bold text-slate-450 uppercase">SYSTEM_ACCESS_CREDENTIALS</span>
              <div className="ml-auto rack-screw" />
            </div>

            <div className="p-5 space-y-4">
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                Modifique as credenciais de segurança locais para acessar este painel do MikroGestor.
              </p>

              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Novo Usuário Admin</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Ex: admin" className="retro-input py-1.5 px-3 text-xs" />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Nova Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="retro-input py-1.5 px-3 text-xs" />
                </div>
                <button type="submit" disabled={saving} className="w-full retro-btn retro-btn-dark py-2">
                  {saving ? 'Salvando...' : 'Salvar Credenciais no Banco'}
                </button>
              </form>
            </div>
          </div>

          {/* DB Status Card */}
          <div className="retro-card p-4 flex items-center gap-3">
            <div className="rack-screw" />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0a0a18', border: '1px solid #252542' }}>
              <span className="text-[#4ade80]">🖴</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase font-mono tracking-wider">Banco de Dados Local</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="led led-green animate-led-pulse" />
                <p className="text-[9px] text-slate-450 font-mono">SQLite: {dbStatus} — dados persistidos offline</p>
              </div>
            </div>
            <div className="ml-auto rack-screw" />
          </div>
        </div>
      </div>
    </main>
  );
}
