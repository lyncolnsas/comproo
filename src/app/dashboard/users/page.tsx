/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RouterOffline from '@/components/RouterOffline';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [notConnected, setNotConnected] = useState(false);

  // Print & Delete Batch States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchPrintComment, setBatchPrintComment] = useState('');
  const [batchDeleteComment, setBatchDeleteComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Unified Active Tab State
  const [activeTab, setActiveTab] = useState<'list' | 'batch' | 'single'>('list');

  // Common Form States (Profiles & Servers Options)
  const [profiles, setProfiles] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Single Creation Form States
  const [singleName, setSingleName] = useState('');
  const [singlePass, setSinglePass] = useState('');
  const [singleComment, setSingleComment] = useState('');
  const [singlePrice, setSinglePrice] = useState(0);
  const [singleProfile, setSingleProfile] = useState('');
  const [singleServer, setSingleServer] = useState('all');
  const [creatingSingle, setCreatingSingle] = useState(false);
  const [singleMessage, setSingleMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<any | null>(null);

  // Batch Generation Form States
  const [qty, setQty] = useState(10);
  const [mode, setMode] = useState('up'); // up = User=Pass, vc = User & Pass diff
  const [userLen, setUserLen] = useState(5);
  const [prefix, setPrefix] = useState('');
  const [charset, setCharset] = useState('low'); // low, upp, num, mix
  const [genComment, setGenComment] = useState('');
  const [genPrice, setGenPrice] = useState(0);
  const [genServer, setGenServer] = useState('all');
  const [genProfile, setGenProfile] = useState('');
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [batchMessage, setBatchMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [generatedBatchList, setGeneratedBatchList] = useState<any[]>([]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const res = await fetch('/api/hotspot/profiles');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfiles(data.data.profiles);
          setServers(data.data.servers);
          if (data.data.profiles.length > 0) {
            setSingleProfile(data.data.profiles[0].name);
            setGenProfile(data.data.profiles[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar perfis:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName) return;
    setCreatingSingle(true);
    setSingleMessage(null);
    setNewlyCreatedUser(null);

    try {
      const payload = { 
        name: singleName, 
        pass: singlePass, 
        server: singleServer, 
        profile: singleProfile, 
        comment: singleComment, 
        price: singlePrice 
      };
      const res = await fetch('/api/hotspot/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSingleMessage({ type: 'success', text: `Voucher avulso "${data.user.name}" criado com sucesso no Mikrotik!` });
        setNewlyCreatedUser(data.user);
        
        // Reset inputs
        setSingleName('');
        setSinglePass('');
        setSingleComment('');
        setSinglePrice(0);
        
        // Reload list
        fetchUsers();
      } else {
        setSingleMessage({ type: 'error', text: data.message || 'Erro ao criar usuário' });
      }
    } catch (err) {
      setSingleMessage({ type: 'error', text: 'Falha na requisição ao criar usuário' });
    } finally {
      setCreatingSingle(false);
    }
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingBatch(true);
    setBatchMessage(null);
    setGeneratedBatchList([]);

    try {
      const payload = { 
        qty, 
        server: genServer, 
        mode, 
        userLen, 
        prefix, 
        charset, 
        profile: genProfile, 
        comment: genComment, 
        price: genPrice 
      };
      const res = await fetch('/api/hotspot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setBatchMessage({ type: 'success', text: `Sucesso! ${data.count} vouchers gerados e enviados ao Mikrotik.` });
        setGeneratedBatchList(data.users);
        // Save to sessionStorage for printing
        sessionStorage.setItem('mikro_vouchers_print', JSON.stringify({
          users: data.users,
          profile: genProfile,
          comment: genComment
        }));
        
        // Clear form values
        setGenComment('');
        setGenPrice(0);
        
        // Refresh users list
        fetchUsers();
      } else {
        setBatchMessage({ type: 'error', text: data.message || 'Erro ao gerar vouchers' });
      }
    } catch (err: any) {
      setBatchMessage({ type: 'error', text: 'Falha na requisição ao gerar vouchers' });
    } finally {
      setGeneratingBatch(false);
    }
  };

  const handlePrintNewlyCreated = () => {
    if (!newlyCreatedUser) return;
    
    sessionStorage.setItem('mikro_vouchers_print', JSON.stringify({
      users: [{ name: newlyCreatedUser.name, pass: newlyCreatedUser.pass || newlyCreatedUser.name }],
      profile: newlyCreatedUser.profile,
      comment: newlyCreatedUser.comment
    }));
    
    window.open('/dashboard/print', '_blank');
  };

  const handlePrintBatchGenerated = () => {
    if (generatedBatchList.length === 0) return;
    window.open('/dashboard/print', '_blank');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hotspot/users');
      if (res.status === 401) {
        setNotConnected(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setSelectedIds([]); // Clear selection on reload
        setNotConnected(false);
      } else {
        setError(data.message);
      }
    } catch (_err) {
      setError('Falha ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOptions();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'batch' || tabParam === 'single' || tabParam === 'list') {
        setActiveTab(tabParam as 'list' | 'batch' | 'single');
      }
    }
  }, []);

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja apagar o usuário ${name}?`)) return;
    
    try {
      const res = await fetch('/api/hotspot/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (_err) {
      alert('Erro ao apagar usuário.');
    }
  };

  const handleBatchDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchDeleteComment) return;
    if (!confirm(`CUIDADO: Você vai apagar TODOS os usuários que tenham o Lote/Comentário exatamente igual a "${batchDeleteComment}". Confirmar?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/hotspot/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchComment: batchDeleteComment })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setBatchDeleteComment('');
        fetchUsers();
      }
    } catch (err) {
      alert('Erro ao apagar lote.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Row Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map(u => u.id || u.name));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Printing Handlers
  const handlePrintSelected = () => {
    if (selectedIds.length === 0) return;
    
    // Extract selected user objects
    const selectedUsers = users.filter(u => selectedIds.includes(u.id || u.name));
    
    const firstUser = selectedUsers[0];
    const uniformProfile = selectedUsers.every(u => u.profile === firstUser.profile) ? firstUser.profile : 'Múltiplos';
    const uniformComment = selectedUsers.every(u => u.comment === firstUser.comment) ? (firstUser.comment || 'Lote') : 'Lote Misto';

    // Save print payload to sessionStorage
    sessionStorage.setItem('mikro_vouchers_print', JSON.stringify({
      users: selectedUsers.map(u => ({ name: u.name, pass: u.pass || u.name })),
      profile: uniformProfile,
      comment: uniformComment
    }));

    // Open print page in a new window/tab
    window.open('/dashboard/print', '_blank');
  };

  const handlePrintBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchPrintComment) return;

    // Filter loaded users list by comment/lote
    const batchUsers = users.filter(u => String(u.comment || '').toLowerCase() === batchPrintComment.toLowerCase());
    
    if (batchUsers.length === 0) {
      alert(`Nenhum voucher encontrado com o lote/comentário "${batchPrintComment}"`);
      return;
    }

    const firstUser = batchUsers[0];
    const uniformProfile = batchUsers.every(u => u.profile === firstUser.profile) ? firstUser.profile : 'Múltiplos';

    // Save to sessionStorage
    sessionStorage.setItem('mikro_vouchers_print', JSON.stringify({
      users: batchUsers.map(u => ({ name: u.name, pass: u.pass || u.name })),
      profile: uniformProfile,
      comment: batchPrintComment
    }));

    // Open print page
    window.open('/dashboard/print', '_blank');
  };

  const filteredUsers = users.filter(u => {
    const name = String(u.name || '');
    const comment = String(u.comment || '');
    return name.toLowerCase().includes(search.toLowerCase()) || 
           comment.toLowerCase().includes(search.toLowerCase());
  });

  if (notConnected) {
    return (
      <RouterOffline 
        title="Usuários Hotspot" 
        description="Gerencie os acessos e limpe vouchers antigos" 
      />
    );
  }

  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedIds.includes(u.id || u.name));

  return (
    <main className="w-full p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in relative pb-24">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#3b82f6' }}
          >
            ▶ HOTSPOT // VOUCHERS DATABASE CONSOLE
          </p>
          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Central de Vouchers
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Geração, gerenciamento e monitoramento de vouchers de acesso
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 shrink-0">
          <button 
            onClick={() => { setActiveTab('list'); setError(''); }}
            className="aurora-btn text-xs"
            style={activeTab !== 'list' ? { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' } : undefined}
          >
            📋 Lista de Vouchers
          </button>
          <button 
            onClick={() => { setActiveTab('batch'); setBatchMessage(null); }}
            className="aurora-btn text-xs"
            style={activeTab !== 'batch' ? { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' } : undefined}
          >
            ⚡ Gerar em Lote
          </button>
          <button 
            onClick={() => { setActiveTab('single'); setSingleMessage(null); }}
            className="aurora-btn text-xs"
            style={activeTab !== 'single' ? { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' } : undefined}
          >
            👤 Criar Avulso
          </button>
        </div>
      </header>

      {error && (
        <div className="aurora-card p-4 flex items-center gap-3 animate-pulse" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-red-450 shrink-0" style={{ boxShadow: '0 0 6px #ef4444' }} />
          <span className="text-xs font-semibold text-rose-300 font-mono">
            SYSTEM_DATABASE_ERROR // {error}
          </span>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'list' ? (
        /* ==================== TAB 1: LIST MANAGEMENT ==================== */
        <div className="space-y-6 animate-fade-in">
          {/* Control Cards (Search, Print Batch, Delete Batch) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="aurora-card p-5 md:col-span-2 lg:col-span-2 space-y-2">
              <span className="block text-xs font-semibold text-slate-400">Buscar Usuário</span>
              <input 
                type="text" 
                placeholder="Buscar por nome ou lote..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="aurora-input py-2 px-3 text-xs"
              />
            </div>

            {/* Print Batch */}
            <div className="aurora-card p-5 space-y-2">
              <span className="block text-xs font-semibold text-emerald-400">Imprimir Lote (Comentário)</span>
              <form onSubmit={handlePrintBatch} className="flex gap-2 w-full">
                <input 
                  type="text" 
                  placeholder="Ex: dez-2023" 
                  value={batchPrintComment}
                  onChange={(e) => setBatchPrintComment(e.target.value)}
                  className="aurora-input py-1.5 px-3 text-xs flex-1"
                />
                <button 
                  disabled={!batchPrintComment} 
                  type="submit" 
                  className="aurora-btn py-1.5 px-3 text-xs shrink-0 font-medium"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  Imprimir
                </button>
              </form>
            </div>

            {/* Delete Batch */}
            <div className="aurora-card p-5 space-y-2">
              <span className="block text-xs font-semibold text-rose-400">Excluir Lote (Comentário)</span>
              <form onSubmit={handleBatchDelete} className="flex gap-2 w-full">
                <input 
                  type="text" 
                  placeholder="Ex: dez-2023" 
                  value={batchDeleteComment}
                  onChange={(e) => setBatchDeleteComment(e.target.value)}
                  className="aurora-input py-1.5 px-3 text-xs flex-1"
                />
                <button 
                  disabled={isDeleting || !batchDeleteComment} 
                  type="submit" 
                  className="aurora-btn py-1.5 px-3 text-xs shrink-0 font-medium hover:shadow-red-500/20"
                  style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                >
                  {isDeleting ? '...' : 'Apagar'}
                </button>
              </form>
            </div>
          </div>

          {/* Users Table */}
          <div className="aurora-card overflow-hidden">
            <div className="px-4 sm:px-6 py-5 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Vouchers Registrados no Roteador</h2>
                <p className="text-xs text-white/30 mt-0.5">Exibindo registros correspondentes aos filtros ativos</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#818cf8]/35 bg-[#818cf8]/10 text-[#a5b4fc] tracking-wider uppercase self-start sm:self-auto shrink-0">
                {filteredUsers.length} VOUCHERS
              </span>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto w-full max-h-[500px] custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 bg-[#0d0d1e] border-b border-white/5 text-white/40 font-semibold" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="px-6 py-4 w-12 text-center">
                        <input 
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-white/10 text-indigo-600 focus:ring-indigo-500 bg-white/5 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Servidor</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Nome (Voucher)</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Perfil</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Uptime</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Comentário / Lote</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                          <div className="inline-block animate-pulse">Carregando base de vouchers do Mikrotik...</div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                          Nenhum voucher localizado.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => {
                        const isChecked = selectedIds.includes(user.id || user.name);
                        
                        return (
                          <tr key={`${user.id || user.name}-${index}`} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 text-center">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleSelectRow(user.id || user.name)}
                                className="w-4 h-4 rounded border-white/10 text-indigo-600 focus:ring-indigo-500 bg-white/5 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 text-slate-400 uppercase font-mono text-[10px]">{user.server}</td>
                            <td className="px-6 py-4 font-bold text-white text-sm tracking-wide">{user.name}</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#818cf8]/35 bg-[#818cf8]/10 text-[#a5b4fc]">
                                {user.profile}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-450 font-mono text-xs">{user.uptime}</td>
                            <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{user.comment || '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.name)} 
                                className="aurora-btn py-1 px-3 text-[10px] hover:shadow-red-500/20"
                                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'batch' ? (
        /* ==================== TAB 2: BATCH GENERATION ==================== */
        <div className="aurora-card max-w-3xl animate-fade-in">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gerador de Vouchers em Lote</h2>
            <p className="text-xs text-white/30 mt-0.5">Crie múltiplos vouchers de forma automatizada</p>
          </div>

          <div className="p-6">
            {batchMessage && (
              <div className={`p-4 mb-6 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${batchMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-widest mb-1 text-slate-450">SYSTEM_OUTPUT //</span>
                  <span className="font-bold text-xs">{batchMessage.text}</span>
                </div>
                {generatedBatchList.length > 0 && (
                  <button 
                    onClick={handlePrintBatchGenerated}
                    className="aurora-btn text-xs py-1.5 px-3 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    🖨️ Imprimir Lote ({generatedBatchList.length})
                  </button>
                )}
              </div>
            )}

            {loadingOptions ? (
              <div className="animate-pulse space-y-4 py-6">
                <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
                <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
                <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
              </div>
            ) : (
              <form onSubmit={handleGenerateBatch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Quantidade de Vouchers</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="1000" 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))} 
                      className="aurora-input text-xs" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Servidor Hotspot</label>
                    <select 
                      value={genServer} 
                      onChange={(e) => setGenServer(e.target.value)} 
                      className="aurora-input text-xs"
                      style={{ background: '#0a0a18' }}
                    >
                      <option value="all">All</option>
                      {servers.map((s, idx) => <option key={`${s.id || s.name}-${idx}`} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Modo de Login</label>
                    <select 
                      value={mode} 
                      onChange={(e) => setMode(e.target.value)} 
                      className="aurora-input text-xs"
                      style={{ background: '#0a0a18' }}
                    >
                      <option value="up">Usuário = Senha</option>
                      <option value="vc">Usuário e Senha Diferentes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tamanho do Código</label>
                    <input 
                      type="number" 
                      min="3" 
                      max="12" 
                      value={userLen} 
                      onChange={(e) => setUserLen(Number(e.target.value))} 
                      className="aurora-input text-xs" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Prefixo do Código (Opcional)</label>
                    <input 
                      type="text" 
                      value={prefix} 
                      onChange={(e) => setPrefix(e.target.value)} 
                      placeholder="Ex: VIP-" 
                      className="aurora-input text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Caracteres</label>
                    <select 
                      value={charset} 
                      onChange={(e) => setCharset(e.target.value)} 
                      className="aurora-input text-xs"
                      style={{ background: '#0a0a18' }}
                    >
                      <option value="low">Letras Minúsculas (a-z)</option>
                      <option value="upp">Letras Maiúsculas (A-Z)</option>
                      <option value="num">Apenas Números (0-9)</option>
                      <option value="mix">Misto (a-Z, 0-9)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Perfil de Velocidade (Profile)</label>
                    <select 
                      value={genProfile} 
                      onChange={(e) => setGenProfile(e.target.value)} 
                      className="aurora-input text-xs"
                      style={{ background: '#0a0a18' }}
                    >
                      {profiles.map((p, idx) => <option key={`${p.id || p.name}-${idx}`} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Lote / Comentário Identificador</label>
                    <input 
                      type="text" 
                      value={genComment} 
                      onChange={(e) => setGenComment(e.target.value)} 
                      placeholder="Ex: dez-2023" 
                      className="aurora-input text-xs" 
                      required 
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-emerald-450 mb-1">Preço de Venda Unitário (R$) - Opcional</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={genPrice} 
                      onChange={(e) => setGenPrice(Number(e.target.value))} 
                      placeholder="Ex: 5.00" 
                      className="aurora-input text-xs" 
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-none uppercase">Este valor será utilizado no financeiro para o cálculo de faturamento.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button 
                    type="submit" 
                    disabled={generatingBatch}
                    className="w-full aurora-btn py-3 font-semibold text-sm"
                  >
                    {generatingBatch ? 'Gerando Lote...' : 'Gerar Vouchers em Lote Agora'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ==================== TAB 3: SINGLE CREATION ==================== */
        <div className="aurora-card max-w-3xl animate-fade-in">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Criar Voucher Avulso</h2>
            <p className="text-xs text-white/30 mt-0.5">Provisione uma credencial individual no Hotspot</p>
          </div>

          <div className="p-6">
            {singleMessage && (
              <div className={`p-4 mb-6 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${singleMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-widest mb-1 text-slate-450">CREATION_OUTPUT //</span>
                  <span className="font-bold text-xs">{singleMessage.text}</span>
                </div>
                {newlyCreatedUser && (
                  <button 
                    onClick={handlePrintNewlyCreated}
                    className="aurora-btn text-xs py-1.5 px-3 shrink-0 font-semibold"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    🖨️ Imprimir Voucher
                  </button>
                )}
              </div>
            )}

            {loadingOptions ? (
              <div className="animate-pulse space-y-4 py-6">
                <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
                <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
                <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
              </div>
            ) : (
              <form onSubmit={handleCreateSingle} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome de Usuário (Login)</label>
                    <input 
                      type="text" 
                      value={singleName} 
                      onChange={(e) => setSingleName(e.target.value)} 
                      placeholder="Ex: pedro ou vip-cliente"
                      className="aurora-input text-xs" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Senha (Opcional)</label>
                    <input 
                      type="text" 
                      value={singlePass} 
                      onChange={(e) => setSinglePass(e.target.value)} 
                      placeholder="Igual ao login se em branco"
                      className="aurora-input text-xs" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Servidor Hotspot</label>
                    <select 
                      value={singleServer} 
                      onChange={(e) => setSingleServer(e.target.value)} 
                      className="aurora-input text-xs"
                      style={{ background: '#0a0a18' }}
                    >
                      <option value="all">All</option>
                      {servers.map((s, idx) => <option key={`${s.id || s.name}-${idx}`} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Perfil de Velocidade (Profile)</label>
                    <select 
                      value={singleProfile} 
                      onChange={(e) => setSingleProfile(e.target.value)} 
                      className="aurora-input text-xs"
                      style={{ background: '#0a0a18' }}
                    >
                      {profiles.map((p, idx) => <option key={`${p.id || p.name}-${idx}`} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Comentário / Lote Identificador</label>
                    <input 
                      type="text" 
                      value={singleComment} 
                      onChange={(e) => setSingleComment(e.target.value)} 
                      placeholder="Ex: VIP-Ana ou avulso" 
                      className="aurora-input text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">Preço de Venda (R$) - Opcional</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={singlePrice} 
                      onChange={(e) => setSinglePrice(Number(e.target.value))} 
                      placeholder="Ex: 10.00" 
                      className="aurora-input text-xs animate-none" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button 
                    type="submit" 
                    disabled={creatingSingle}
                    className="w-full aurora-btn py-3 font-semibold text-sm"
                  >
                    {creatingSingle ? 'Criando Usuário...' : 'Criar Usuário Avulso Agora'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Sticky Print Bar */}
      {selectedIds.length > 0 && activeTab === 'list' && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-2xl flex items-center justify-between gap-6 shadow-2xl z-50 animate-scale-up max-w-[90vw] md:max-w-xl w-full aurora-card border border-white/10"
          style={{ background: 'rgba(10,10,22,0.85)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" style={{ boxShadow: '0 0 8px #3b82f6' }} />
            <span className="text-white font-bold tracking-wider uppercase">
              {selectedIds.length} {selectedIds.length === 1 ? 'SELECIONADO' : 'SELECIONADOS'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedIds([])}
              className="aurora-btn py-1.5 px-3 text-xs font-semibold"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              Limpar
            </button>
            <button 
              onClick={handlePrintSelected}
              className="aurora-btn py-1.5 px-4 text-xs font-semibold"
            >
              🖨️ Imprimir Selecionados
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
