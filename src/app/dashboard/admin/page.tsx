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

  // Free Wifi Mode
  const [freeWifiMode, setFreeWifiMode] = useState(false);
  const [savingFreeWifi, setSavingFreeWifi] = useState(false);

  // Max Users Limit
  const [maxUsers, setMaxUsers] = useState<string>('0');
  const [savingMaxUsers, setSavingMaxUsers] = useState(false);

  const fetchSystemConfig = async () => {
    try {
      const res = await fetch('/api/config/system');
      const data = await res.json();
      if (data.success && data.data) {
        setFreeWifiMode(data.data.free_wifi_mode === 'true');
        setMaxUsers(data.data.MAX_HOTSPOT_USERS || '0');
      }
    } catch (e) {}
  };

  const handleToggleFreeWifi = async () => {
    setSavingFreeWifi(true);
    const newValue = !freeWifiMode;
    try {
      const res = await fetch('/api/config/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'free_wifi_mode', value: newValue ? 'true' : 'false' })
      });
      const data = await res.json();
      if (data.success) {
        setFreeWifiMode(newValue);
      }
    } catch (e) {} finally {
      setSavingFreeWifi(false);
    }
  };

  const handleSaveMaxUsers = async () => {
    setSavingMaxUsers(true);
    try {
      const res = await fetch('/api/config/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'MAX_HOTSPOT_USERS', value: maxUsers })
      });
      const data = await res.json();
      if (data.success) {
        alert('Limite atualizado!');
      }
    } catch (e) {
      alert('Erro ao salvar limite.');
    } finally {
      setSavingMaxUsers(false);
    }
  };

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
    fetchSystemConfig();
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
    <main className="w-full p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              SYSTEM // HARDWARE ROUTERS & USERS CONFIG
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Roteadores e Sistema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie roteadores MikroTik integrados e credenciais de acesso locais do painel
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Routers List — Main area */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Unidades MikroTik Cadastradas
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleScanNetwork}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  🔍 Scan / Winbox
                </button>
                <button
                  onClick={() => setShowRouterForm(!showRouterForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {showRouterForm ? 'Fechar Form' : '+ Adicionar Roteador'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {showScanner && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Scanner de Rede (MNDP)</h4>
                    <button onClick={() => setShowScanner(false)} className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer">✕</button>
                  </div>
                  {scanning ? (
                    <p className="text-center text-slate-600 text-xs py-4 animate-pulse">Buscando MikroTiks na rede local...</p>
                  ) : scannedRouters.length === 0 ? (
                    <p className="text-center text-slate-600 text-xs py-4">Nenhum equipamento encontrado na rede.</p>
                  ) : (
                    <div className="space-y-2">
                      {scannedRouters.map((r, i) => (
                        <div key={i} className="border border-slate-200 bg-white p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors shadow-xs" onClick={() => {
                          setRName(r.identity || 'MikroTik Local');
                          setRHost(r.ipAddress || r.macAddress);
                          setRUser('admin');
                          setShowRouterForm(true);
                          setShowScanner(false);
                        }}>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{r.identity || 'MikroTik'} <span className="text-[10px] font-normal text-slate-500">({r.board || r.platform})</span></p>
                            <p className="text-[10px] text-slate-600 font-mono mt-0.5">IP: {r.ipAddress || '0.0.0.0'} | MAC: {r.macAddress}</p>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md border border-blue-200">Usar</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showRouterForm && (
                <form onSubmit={handleAddRouter} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Cadastrar Novo Roteador</h4>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Nome de Identificação</label>
                    <input type="text" value={rName} onChange={e => setRName(e.target.value)} required placeholder="Ex: Mikrotik Matriz" className="w-full bg-white border-2 border-slate-400 text-slate-950 font-bold rounded-xl px-3 py-2 text-xs focus:border-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">IP ou Host</label>
                    <input type="text" value={rHost} onChange={e => setRHost(e.target.value)} required placeholder="Ex: 192.168.88.1" className="w-full bg-white border-2 border-slate-400 text-slate-950 font-bold rounded-xl px-3 py-2 text-xs focus:border-blue-600 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Usuário API</label>
                      <input type="text" value={rUser} onChange={e => setRUser(e.target.value)} required placeholder="admin" className="w-full bg-white border-2 border-slate-400 text-slate-950 font-bold rounded-xl px-3 py-2 text-xs focus:border-blue-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Senha</label>
                      <input type="password" value={rPass} onChange={e => setRPass(e.target.value)} placeholder="••••" className="w-full bg-white border-2 border-slate-400 text-slate-950 font-bold rounded-xl px-3 py-2 text-xs focus:border-blue-600 outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowRouterForm(false)} className="bg-white border-2 border-slate-300 text-slate-800 font-bold text-xs py-1.5 px-3 rounded-xl hover:bg-slate-100 cursor-pointer">Cancelar</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-1.5 px-3.5 rounded-xl shadow-sm cursor-pointer">Salvar Roteador</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {loadingRouters ? (
                  <p className="text-center text-slate-800 font-bold text-xs py-6 animate-pulse">Carregando unidades de hardware...</p>
                ) : routers.length === 0 ? (
                  <div className="bg-slate-100/70 border border-slate-300 p-6 rounded-2xl text-center space-y-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center mx-auto shadow-xs">
                      <span className="text-slate-700 text-sm">🖧</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-950 text-sm font-black">Nenhum Roteador Cadastrado</p>
                      <p className="text-slate-700 text-xs font-semibold leading-normal">Cadastre um MikroTik no botão "+ Adicionar Roteador" acima para inicializar a integração do painel.</p>
                    </div>
                    <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                      BANCO: {dbStatus}
                    </span>
                  </div>
                ) : (
                  routers.map(router => (
                    <div key={router.id} className="border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition-all bg-white shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 border border-slate-300 shadow-xs">
                          <span className="text-slate-700 text-sm">📟</span>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-950 text-xs uppercase tracking-wider">{router.name}</h4>
                          <p className="text-xs text-slate-700 font-mono font-bold mt-0.5">{router.host} · {router.user}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => connectToRouter(router)}
                          disabled={connectingId === router.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {connectingId === router.id ? 'Conectando...' : '⚡ Conectar'}
                        </button>
                        <button
                          onClick={() => handleDeleteRouter(router.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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
          {/* Free Wi-Fi Mode Card */}
          <div
            className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 md:p-6 transition-all duration-300"
            style={{
              borderColor: freeWifiMode ? '#10b981' : undefined,
              backgroundColor: freeWifiMode ? '#f0fdf4' : '#ffffff',
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-300"
                  style={{
                    background: freeWifiMode ? '#dcfce7' : '#f1f5f9',
                    border: freeWifiMode ? '1px solid #86efac' : '1px solid #e2e8f0',
                  }}
                >
                  {freeWifiMode ? '🎉' : '🎟️'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Modo Evento / Wi-Fi Gratuito
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    Desabilita a cobrança de PIX. Clientes receberão vouchers grátis imediatamente.
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={handleToggleFreeWifi}
                disabled={savingFreeWifi}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none cursor-pointer ${
                  savingFreeWifi ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  freeWifiMode
                    ? 'bg-emerald-500 border-emerald-400'
                    : 'bg-slate-200 border-slate-300 hover:border-slate-400'
                }`}
                title={freeWifiMode ? 'Clique para desativar' : 'Clique para ativar'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full shadow-md transition-transform duration-300 ${
                    freeWifiMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                  }`}
                />
              </button>
            </div>

            {/* Status badge row */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {savingFreeWifi ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Salvando...
                  </span>
                ) : freeWifiMode ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    MODO GRATUITO ATIVO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    COBRANÇA PIX NORMAL
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                free_wifi_mode
              </span>
            </div>
          </div>

          {/* Capacidade Máxima Card */}
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Limite de Capacidade (Fila)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Defina o número máximo de usuários ativos (0 = sem limite). Se atingido, novos clientes entrarão em uma fila de espera no WhatsApp.
            </p>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={maxUsers} 
                onChange={(e) => setMaxUsers(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 outline-none" 
                placeholder="Ex: 50"
              />
              <button 
                onClick={handleSaveMaxUsers} 
                disabled={savingMaxUsers}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {savingMaxUsers ? '...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Panel User Card */}
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Credenciais do Sistema
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Modifique as credenciais de segurança locais para acessar este painel do MikroGestor.
              </p>

              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Novo Usuário Admin</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Ex: admin" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nova Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 outline-none" />
                </div>
                <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar Credenciais'}
                </button>
              </form>
            </div>
          </div>

          {/* DB Status Card */}
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-200 shrink-0">
              <span className="text-emerald-600">🖴</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Banco de Dados Local</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <p className="text-xs text-slate-600">SQLite: <span className="font-bold text-slate-800">{dbStatus}</span> — dados persistidos offline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
