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

  // Scanner State
  const [scanning, setScanning] = useState(false);
  const [scannedRouters, setScannedRouters] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  // Router Form
  const [rName, setRName] = useState('');
  const [rHost, setRHost] = useState('');
  const [rUser, setRUser] = useState('');
  const [rPass, setRPass] = useState('');

  const fetchRouters = async () => {
    try {
      const res = await fetch('/api/system/routers');
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

  const handleScanNetwork = async () => {
    setScanning(true);
    setScannedRouters([]);
    setShowScanner(true);
    setShowRouterForm(false);
    try {
      const res = await fetch('/api/hotspot/scan');
      const data = await res.json();
      if (data.success) {
        setScannedRouters(data.routers || []);
      } else {
        alert('Erro ao escanear a rede: ' + data.error);
      }
    } catch (err) {
      alert('Erro de conexão ao escanear a rede.');
    } finally {
      setScanning(false);
    }
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/system/users', {
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
      const res = await fetch('/api/system/routers', {
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
      const res = await fetch('/api/system/routers', {
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
    <main className="w-full p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#3b82f6' }}>
            ▶ SYSTEM // HARDWARE ROUTERS & USERS CONFIG
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Roteadores e Sistema
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Gerencie roteadores MikroTik integrados e credenciais de acesso locais do painel
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Routers List — Main area */}
        <div className="lg:col-span-3 aurora-card p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Unidades MikroTik Cadastradas
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleScanNetwork}
                  className="aurora-btn text-[10px] py-1.5 px-3"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                >
                  🔍 Scan / Winbox
                </button>
                <button
                  onClick={() => setShowRouterForm(!showRouterForm)}
                  className="aurora-btn text-[10px] py-1.5 px-3"
                >
                  {showRouterForm ? 'Fechar Form' : '+ Adicionar Roteador'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {showScanner && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Scanner de Rede (MNDP)</h4>
                    <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                  </div>
                  {scanning ? (
                    <p className="text-center text-slate-400 text-xs py-4 animate-pulse">Buscando MikroTiks na rede local...</p>
                  ) : scannedRouters.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-4">Nenhum equipamento encontrado na rede.</p>
                  ) : (
                    <div className="space-y-2">
                      {scannedRouters.map((r, i) => (
                        <div key={i} className="border border-white/10 bg-white/5 p-3 rounded-xl flex items-center justify-between hover:bg-white/10 cursor-pointer transition-colors" onClick={() => {
                          setRName(r.identity || 'MikroTik Local');
                          setRHost(r.ipAddress || r.macAddress); // Fallback para MAC, mas note que API precisa de IP
                          setRUser('admin');
                          setShowRouterForm(true);
                          setShowScanner(false);
                        }}>
                          <div>
                            <p className="text-xs font-bold text-white">{r.identity || 'MikroTik'} <span className="text-[10px] font-normal text-slate-400">({r.board || r.platform})</span></p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">IP: {r.ipAddress || '0.0.0.0'} | MAC: {r.macAddress}</p>
                          </div>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md">Usar</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showRouterForm && (
                <form onSubmit={handleAddRouter} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">Cadastrar Novo Roteador</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome de Identificação</label>
                    <input type="text" value={rName} onChange={e => setRName(e.target.value)} required placeholder="Ex: Mikrotik Matriz" className="aurora-input py-1.5 px-3 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IP ou Host</label>
                    <input type="text" value={rHost} onChange={e => setRHost(e.target.value)} required placeholder="Ex: 192.168.88.1" className="aurora-input py-1.5 px-3 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Usuário API</label>
                      <input type="text" value={rUser} onChange={e => setRUser(e.target.value)} required placeholder="admin" className="aurora-input py-1.5 px-3 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Senha</label>
                      <input type="password" value={rPass} onChange={e => setRPass(e.target.value)} placeholder="••••" className="aurora-input py-1.5 px-3 text-xs" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowRouterForm(false)} className="aurora-btn text-[10px] py-1.5 px-3" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Cancelar</button>
                    <button type="submit" className="aurora-btn text-[10px] py-1.5 px-3">Salvar Roteador</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {loadingRouters ? (
                  <p className="text-center text-slate-400 text-xs py-6 animate-pulse">Carregando unidades de hardware...</p>
                ) : routers.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center space-y-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                      <span className="text-slate-400 text-sm">🖧</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white text-xs font-bold font-mono">Nenhum Roteador Cadastrado</p>
                      <p className="text-slate-500 text-[10px] leading-normal">Cadastre um MikroTik no botão "+ Adicionar Roteador" acima para inicializar a integração do painel.</p>
                    </div>
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
                      BANCO: {dbStatus}
                    </span>
                  </div>
                ) : (
                  routers.map(router => (
                    <div key={router.id} className="border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-all bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                          <span className="text-slate-400 text-xs">📟</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider">{router.name}</h4>
                          <p className="text-[10px] text-slate-450 mt-0.5">{router.host} · {router.user}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => connectToRouter(router)}
                          disabled={connectingId === router.id}
                          className="aurora-btn text-[10px] py-1.5 px-3"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                          {connectingId === router.id ? 'Conectando...' : '⚡ Conectar'}
                        </button>
                        <button
                          onClick={() => handleDeleteRouter(router.id)}
                          className="aurora-btn text-[10px] py-1.5 px-3"
                          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
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
        </div>

        {/* Right Column settings panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel User Card */}
          <div className="aurora-card p-5 md:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Credenciais do Sistema
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Modifique as credenciais de segurança locais para acessar este painel do MikroGestor.
              </p>

              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Novo Usuário Admin</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Ex: admin" className="aurora-input py-1.5 px-3 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nova Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="aurora-input py-1.5 px-3 text-xs" />
                </div>
                <button type="submit" disabled={saving} className="w-full aurora-btn text-xs">
                  {saving ? 'Salvando...' : 'Salvar Credenciais'}
                </button>
              </form>
            </div>
          </div>

          {/* DB Status Card */}
          <div className="aurora-card p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
              <span className="text-emerald-400">🖴</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Banco de Dados Local</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-led-pulse" />
                <p className="text-[10px] text-slate-400">SQLite: {dbStatus} — dados persistidos offline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
