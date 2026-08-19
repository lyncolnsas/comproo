"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import RouterOffline from '@/components/RouterOffline';
import StudioInspector, { StudioState } from '@/components/portal/StudioInspector';
import { BrandConfig } from '@/components/portal/DynamicLogoEditor';
import { Layers, Sparkles, Upload, Type, Eye, Check, Sliders, Palette } from 'lucide-react';

const LEADS_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

interface IfaceInfo {
  name: string;
  type: string;
  macAddress: string;
  running: boolean;
  disabled: boolean;
  configuredIp: string | null;
  hasIp: boolean;
  hasDhcp: boolean;
  hasHotspot: boolean;
  isBridge: boolean;
  hasNat: boolean;
}

interface Step {
  name: 'etapa_1' | 'etapa_2' | 'etapa_3' | 'etapa_4';
  label: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  message: string;
}

const INIT_STEPS: Step[] = [
  { name: 'etapa_1', label: '⚡ Etapa 1: Provisionamento dos Serviços de Hotspot', status: 'pending', message: '' },
  { name: 'etapa_2', label: '🧹 Etapa 2: Validação de Configurações de Fábrica', status: 'pending', message: '' },
  { name: 'etapa_3', label: '🛡️ Etapa 3: Validação de Regras de Firewall', status: 'pending', message: '' },
  { name: 'etapa_4', label: '🔑 Etapa 4: Configuração de Acesso à API e Assinatura', status: 'pending', message: '' },
];

type Stage = 'select' | 'running' | 'reconnecting' | 'done' | 'error';


interface Colors {
  brand: string;
  brandDark: string;
  bg: string;
  ink: string;
  muted: string;
  blue: string; // Login button
  green: string; // Register button
  trialButtonBg?: string;
  trialButtonText?: string;
  cardBg?: string;
  cardBorder?: string;
  inputBg?: string;
  inputText?: string;
  inputBorder?: string;
  inputPlaceholder?: string;
  loginButtonText?: string;
  registerButtonText?: string;
  glassOpacity: number; // 0–100 (%) transparency for glass effect
  glassBlur: number;    // blur in px for backdrop-filter
}

interface EffectsConfig {
  bgEffect: string;
  bgEffectSpeed: 'slow' | 'normal' | 'fast';
  cardShape: 'rounded' | 'square' | 'pill' | 'scifi-cut';
  cardNoiseTexture: boolean;
  cardGlowBorder: boolean;
  cardTilt3d: boolean;
  btnShimmer: boolean;
  btnPulse: boolean;
  titleGradient: boolean;
}

interface SocialConfig {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  facebookUrl: string;
  googleMapsUrl: string;
}

interface BadgesConfig {
  showWifiSpeed: boolean;
  wifiSpeedText: string;
  showSecurityBadge: boolean;
  securityText: string;
  showConnectedCount: boolean;
  connectedCountNumber: string;
}

interface CustomCodeConfig {
  customCss: string;
}

const COLOR_PRESETS = [
  {
    name: 'Cyberpunk Neon',
    icon: '⚡',
    desc: 'Visual futurista escuro com ciano e roxo neon',
    colors: {
      brand: '#8b5cf6',
      brandDark: '#6d28d9',
      bg: '#090a0f',
      ink: '#f8fafc',
      muted: '#94a3b8',
      blue: '#6366f1',
      loginButtonText: '#ffffff',
      green: '#06b6d4',
      registerButtonText: '#090a0f',
      trialButtonBg: '#ec4899',
      trialButtonText: '#ffffff',
      cardBg: '#12131f',
      cardBorder: '#8b5cf6',
      inputBg: '#18192b',
      inputText: '#f8fafc',
      inputBorder: '#3b3d60',
      inputPlaceholder: '#64748b',
      glassOpacity: 85,
      glassBlur: 16
    }
  },
  {
    name: 'Ocean Sapphire',
    icon: '🌊',
    desc: 'Tons marinhos modernos com vidro fosco e azul royal',
    colors: {
      brand: '#0284c7',
      brandDark: '#0369a1',
      bg: '#0f172a',
      ink: '#f8fafc',
      muted: '#94a3b8',
      blue: '#0284c7',
      loginButtonText: '#ffffff',
      green: '#14b8a6',
      registerButtonText: '#ffffff',
      trialButtonBg: '#38bdf8',
      trialButtonText: '#0f172a',
      cardBg: '#1e293b',
      cardBorder: '#38bdf8',
      inputBg: '#0f172a',
      inputText: '#f8fafc',
      inputBorder: '#334155',
      inputPlaceholder: '#64748b',
      glassOpacity: 90,
      glassBlur: 12
    }
  },
  {
    name: 'Emerald Tech',
    icon: '🍃',
    desc: 'Verde esmeralda refinado e acabamento dark minimalista',
    colors: {
      brand: '#059669',
      brandDark: '#047857',
      bg: '#060d0a',
      ink: '#f0fdf4',
      muted: '#86efac',
      blue: '#10b981',
      loginButtonText: '#060d0a',
      green: '#34d399',
      registerButtonText: '#060d0a',
      trialButtonBg: '#059669',
      trialButtonText: '#ffffff',
      cardBg: '#0c1a14',
      cardBorder: '#059669',
      inputBg: '#060d0a',
      inputText: '#f0fdf4',
      inputBorder: '#166534',
      inputPlaceholder: '#4ade80',
      glassOpacity: 90,
      glassBlur: 14
    }
  },
  {
    name: 'Sunset Ember',
    icon: '🔥',
    desc: 'Gradiente quente de alta energia com âmbar e laranja',
    colors: {
      brand: '#ea580c',
      brandDark: '#c2410c',
      bg: '#180d08',
      ink: '#fff7ed',
      muted: '#fdba74',
      blue: '#f97316',
      loginButtonText: '#ffffff',
      green: '#eab308',
      registerButtonText: '#180d08',
      trialButtonBg: '#fb923c',
      trialButtonText: '#180d08',
      cardBg: '#27140b',
      cardBorder: '#ea580c',
      inputBg: '#180d08',
      inputText: '#fff7ed',
      inputBorder: '#7c2d12',
      inputPlaceholder: '#fb923c',
      glassOpacity: 88,
      glassBlur: 10
    }
  },
  {
    name: 'Luxury Gold',
    icon: '👑',
    desc: 'Preto piano premium e detalhes metálicos em dourado nobre',
    colors: {
      brand: '#d97706',
      brandDark: '#b45309',
      bg: '#0a0a0a',
      ink: '#fef3c7',
      muted: '#fde68a',
      blue: '#d97706',
      loginButtonText: '#000000',
      green: '#eab308',
      registerButtonText: '#000000',
      trialButtonBg: '#f59e0b',
      trialButtonText: '#000000',
      cardBg: '#141414',
      cardBorder: '#d97706',
      inputBg: '#0a0a0a',
      inputText: '#fef3c7',
      inputBorder: '#78350f',
      inputPlaceholder: '#d97706',
      glassOpacity: 92,
      glassBlur: 15
    }
  },
  {
    name: 'Clean Corporate',
    icon: '⚪',
    desc: 'Visual corporativo claro, cristalino e de alta legibilidade',
    colors: {
      brand: '#2563eb',
      brandDark: '#1d4ed8',
      bg: '#f8fafc',
      ink: '#0f172a',
      muted: '#64748b',
      blue: '#2563eb',
      loginButtonText: '#ffffff',
      green: '#10b981',
      registerButtonText: '#ffffff',
      trialButtonBg: '#3b82f6',
      trialButtonText: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '#e2e8f0',
      inputBg: '#f8fafc',
      inputText: '#0f172a',
      inputBorder: '#cbd5e1',
      inputPlaceholder: '#94a3b8',
      glassOpacity: 100,
      glassBlur: 0
    }
  },
  {
    name: 'Dark Violet Pro',
    icon: '🔮',
    desc: 'Design sofisticado em roxo escuro com excelente contraste',
    colors: {
      brand: '#7c3aed',
      brandDark: '#6d28d9',
      bg: '#0c0a17',
      ink: '#f5f3ff',
      muted: '#c4b5fd',
      blue: '#7c3aed',
      loginButtonText: '#ffffff',
      green: '#a855f7',
      registerButtonText: '#ffffff',
      trialButtonBg: '#8b5cf6',
      trialButtonText: '#ffffff',
      cardBg: '#161226',
      cardBorder: '#7c3aed',
      inputBg: '#0e0b1c',
      inputText: '#f5f3ff',
      inputBorder: '#4c1d95',
      inputPlaceholder: '#8b5cf6',
      glassOpacity: 88,
      glassBlur: 14
    }
  }
];

const NICHE_EFFECTS = [
  { id: 'none', icon: '🚫', name: 'Nenhum', niche: 'Fundo Padrão' },
  { id: 'cardio-pulse', icon: '🏋️', name: 'Cardio Pulse & Fitness', niche: 'Academia & Crossfit' },
  { id: 'divine-rays', icon: '⛪', name: 'Raios Divinos Celestial', niche: 'Igrejas & Templos' },
  { id: 'medical-vital', icon: '🏥', name: 'Vital Monitor & Saúde', niche: 'Clínicas & Consultórios' },
  { id: 'woodfire-embers', icon: '🍕', name: 'Brasas Forneria & Pizza', niche: 'Pizzarias & Churrascarias' },
  { id: 'luxury-bubbles', icon: '🥂', name: 'Champagne & Hotel VIP', niche: 'Hotéis & Pousadas' },
  { id: 'stadium-lights', icon: '⚽', name: 'Holofotes de Estádio', niche: 'Futebol & Arenas' },
  { id: 'digital-ocean', icon: '🌊', name: 'Ciber Oceano & Cloud', niche: 'Startups & Data Centers' },
  { id: 'cinema-marquee', icon: '🍿', name: 'Cinema & Marquee Retrô', niche: 'Cinemas & Entretenimento' },
  { id: 'chalk-constellation', icon: '🎓', name: 'Constelação Acadêmica', niche: 'Escolas & Cursos' },
  { id: 'traffic-radar', icon: '📡', name: 'Radar Tático & NOC', niche: 'Provedores & Redes' },
  { id: 'hex-shield', icon: '🛡️', name: 'Escudo Hex Cibersegurança', niche: 'Segurança & Defesa' },
  { id: 'lock-crypto', icon: '🔐', name: 'Criptografia WPA3', niche: 'Hotspot Seguro' },
  { id: 'fiber-optic', icon: '💡', name: 'Fótons Fibra Óptica', niche: 'Telecom & ISP' },
  { id: 'synthwave-arcade', icon: '🕹️', name: 'Synthwave 80s Sunset', niche: 'Gamers & Lojas Geek' },
  { id: 'barrio-sunset', icon: '🌆', name: 'Sunset Urbano Bokeh', niche: 'Cafés & Bistrôs' },
  { id: 'community-bubbles', icon: '🫧', name: 'Bolhas Comunitárias', niche: 'Praças & Coworking' },
  { id: 'workspace-ribbons', icon: '🏛️', name: 'Fitas Minimal Coworking', niche: 'Escritórios & Coworking' },
  { id: 'sunset-glass', icon: '🌇', name: 'Lounge Sunset Âmbar', niche: 'Bares & Lounges' },
  { id: 'nougat-fluid', icon: '📱', name: 'Material Flow Orgânico', niche: 'Mobile & Tech' },
  { id: 'prisma-holo', icon: '🌈', name: 'Prisma Holográfico Laser', niche: 'Moda & Estilo' },
  { id: 'aurora', icon: '🌌', name: 'Aurora Borealis', niche: 'Geral Fluido' },
  { id: 'particles', icon: '⚡', name: 'Constelação Cyber', niche: 'Tech Geral' },
  { id: 'matrix', icon: '💻', name: 'Matrix Digital Rain', niche: 'Hacker & Dev' },
  { id: 'cyber-grid', icon: '🕹️', name: 'Grid 3D Synthwave', niche: 'Retro Gaming' },
  { id: 'floating-orbs', icon: '🔮', name: 'Orbes de Vidro', niche: 'Design Moderno' },
  { id: 'fireflies', icon: '✨', name: 'Vaga-lumes Neon', niche: 'Natureza & Parques' },
  { id: 'warp-stars', icon: '🚀', name: 'Warp Stars 3D', niche: 'Espaço & Velocidade' },
  { id: 'wave-mesh', icon: '🌊', name: 'Ondas Fluidas', niche: 'Gradiente Cromático' },
];

interface AdItem {
  url: string;
  type: 'image' | 'video';
  targetUrl: string;
}

interface AdConfig {
  type: string;
  mediaUrl: string;
  targetUrl: string;
  items?: AdItem[];
  timerEnabled?: boolean;
  timerDuration?: number;
}

interface BgConfig {
  type: 'default' | 'image' | 'video';
  url: string;
}

interface FieldsConfig {
  nameEnabled: boolean;
  nameRequired: boolean;
  phoneEnabled: boolean;
  phoneRequired: boolean;
  birthDateEnabled: boolean;
  birthDateRequired: boolean;
  emailEnabled: boolean;
  emailRequired: boolean;
  cpfEnabled: boolean;
  cpfRequired: boolean;
  genderEnabled: boolean;
  genderRequired: boolean;
  passwordEnabled: boolean;
  passwordRequired: boolean;
  customFieldEnabled: boolean;
  customFieldLabel: string;
  customFieldRequired: boolean;
  optInCoursesEnabled: boolean;
  optInCoursesLabel: string;
}

interface SimulatorVideoProps {
  src: string;
  isCurrent: boolean;
  isMuted: boolean;
}

function SimulatorVideo({ src, isCurrent, isMuted }: SimulatorVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrent) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isCurrent]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted={isMuted}
      loop
      playsInline
      className="w-full h-full object-contain"
    />
  );
}


export default function PortalEditor() {
  // --- STATE FOR HUBS ---
  const [activeHubTab, setActiveHubTab] = useState<'editor' | 'leads' | 'provisioning'>('editor');

  // --- LEADS STATE ---
  const [leadsData, setLeadsData] = useState<any>(null);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState('');
  
  // --- DEPLOY MODAL STATE ---
  const [deployModal, setDeployModal] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  useEffect(() => {
    if (deployModal) {
      const timer = setTimeout(() => setDeployModal(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [deployModal]);

  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [leadsMounted, setLeadsMounted] = useState(false);

  // --- PROVISIONING STATE ---
  const [provInterfaces, setProvInterfaces] = useState<IfaceInfo[]>([]);
  const [provSuggestedGateway, setProvSuggestedGateway] = useState('10.10.10.1');
  const [provLoading, setProvLoading] = useState(true);
  const [provNotConnected, setProvNotConnected] = useState(false);
  const [provFetchError, setProvFetchError] = useState('');

  const [provSelectedWan, setProvSelectedWan] = useState<IfaceInfo | null>(null);
  const [provSteps, setProvSteps] = useState<Step[]>(INIT_STEPS.map(s => ({ ...s })));
  const [provStage, setProvStage] = useState<Stage>('select');
  const [provSummary, setProvSummary] = useState<any>(null);
  const [provAdminIp, setProvAdminIp] = useState<string | null>(null);
  const [provHotspotDiag, setProvHotspotDiag] = useState<any>(null);
  const [provErrorMsg, setProvErrorMsg] = useState('');
  const [provReconnectIp, setProvReconnectIp] = useState('');
  const [provReconnectAttempts, setProvReconnectAttempts] = useState(0);
  const [provReconnectStatus, setProvReconnectStatus] = useState('');
  const [provIsAlreadyProvisioned, setProvIsAlreadyProvisioned] = useState(false);
  const [provAudit, setProvAudit] = useState<any>(null);
  const [provHasFailures, setProvHasFailures] = useState(false);
  const [provDetectedWan, setProvDetectedWan] = useState('');
  const [provDetectedGateway, setProvDetectedGateway] = useState('');
  const [provFixingApiRule, setProvFixingApiRule] = useState(false);
  const [provFixApiRuleMsg, setProvFixApiRuleMsg] = useState('');
  const reconnectTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- LEADS FUNCTIONS ---
  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const res = await fetch('/api/dashboard/leads');
      const json = await res.json();
      if (json.success) {
        setLeadsData(json.data);
      } else {
        setLeadsError(json.message);
      }
    } catch (err) {
      setLeadsError('Erro ao carregar dados do dashboard.');
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Deseja realmente deletar este lead? Esta ação também removerá o usuário do hotspot no MikroTik.')) {
      return;
    }
    setDeletingLeadId(id);
    try {
      const res = await fetch(`/api/dashboard/leads?id=${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        await fetchLeads();
      } else {
        alert(json.message || 'Erro ao deletar lead.');
      }
    } catch {
      alert('Erro de rede ao deletar lead.');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const exportLeadsToCSV = () => {
    if (!leadsData || !leadsData.leads || leadsData.leads.length === 0) {
      alert('Sem dados para exportar.');
      return;
    }
    const headers = ['Nome', 'WhatsApp', 'E-mail', 'CPF', 'Gênero', 'Data de Nascimento', 'Senha do Hotspot', 'Resposta Customizada', 'Data do Cadastro'];
    const rows = leadsData.leads.map((l: any) => [
      l.name,
      l.phone,
      l.email || '',
      l.cpf || '',
      l.gender || '',
      l.birthDate ? new Date(l.birthDate).toLocaleDateString('pt-BR') : '',
      l.password || '',
      l.customFieldValue || '',
      new Date(l.createdAt).toLocaleString('pt-BR')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map((e: any) => e.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_hotspot_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLeadsToPDF = () => {
    if (!leadsData || !leadsData.leads || leadsData.leads.length === 0) {
      alert('Sem dados para exportar.');
      return;
    }
    const leads = leadsData.leads;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita popups para exportar em PDF.');
      return;
    }

    let html = `
      <html>
      <head>
        <title>Relatório de Leads - Hotspot</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #1e293b; }
          h1 { text-align: center; font-size: 20px; margin-bottom: 5px; color: #0f172a; }
          p.meta { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>Relatório de Cadastros do Hotspot</h1>
        <p class="meta">Gerado em ${new Date().toLocaleString('pt-BR')} • Total de registros: ${leads.length}</p>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>E-mail</th>
              <th>CPF</th>
              <th>Gênero</th>
              <th>Nascimento</th>
              <th>Senha</th>
              <th>Resposta</th>
              <th>Cadastro em</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map((l: any) => `
              <tr>
                <td><strong>${l.name}</strong></td>
                <td>${l.phone}</td>
                <td>${l.email || '-'}</td>
                <td>${l.cpf || '-'}</td>
                <td>${l.gender || '-'}</td>
                <td>${l.birthDate ? new Date(l.birthDate).toLocaleDateString('pt-BR') : '-'}</td>
                <td>${l.password || '-'}</td>
                <td>${l.customFieldValue || '-'}</td>
                <td>${new Date(l.createdAt).toLocaleString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // --- PROVISIONING FUNCTIONS ---
  const handleFixApiRule = async () => {
    setProvFixingApiRule(true);
    setProvFixApiRuleMsg('');
    try {
      const res = await fetch('/api/hotspot/provision/fix-api-rule', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProvFixApiRuleMsg('✅ Regra criada com sucesso! Atualizando...');
        setTimeout(() => {
          setProvFixApiRuleMsg('');
          fetchInterfaces(); // Re-run audit
        }, 1500);
      } else {
        setProvFixApiRuleMsg(`❌ ${data.message || 'Erro ao criar regra.'}`);
      }
    } catch {
      setProvFixApiRuleMsg('❌ Erro de conexão ao tentar corrigir a regra.');
    } finally {
      setProvFixingApiRule(false);
    }
  };

  const fetchInterfaces = async () => {
    setProvLoading(true);
    setProvFetchError('');
    try {
      const res = await fetch('/api/hotspot/provision');
      if (res.status === 401 || res.status === 503) { 
        setProvNotConnected(true); 
        return; 
      }
      const data = await res.json();
      if (data.success) {
        setProvInterfaces(data.interfaces || []);
        setProvSuggestedGateway(data.suggestedGateway || '10.10.10.1');
        setProvAudit(data.audit || null);
        setProvHasFailures(!!data.hasFailures);
        setProvDetectedWan(data.detectedWanInterface || '');
        setProvDetectedGateway(data.detectedGatewayIp || '');

        if (data.isProvisioned) {
          setProvIsAlreadyProvisioned(true);
          setProvStage('done');
          setProvSummary({
            wanInterface: 'Manual (Winbox)',
            lanBridge: data.detectedWanInterface || 'bridge',
            gatewayIp: data.detectedGatewayIp || 'Detectado',
            dnsPortal: 'hotspot.wifi.local',
            hotspotServer: 'hs_hotspot',
          });
        }
      } else {
        setProvFetchError(data.message || 'Erro ao carregar interfaces.');
      }
    } catch (e: any) {
      setProvFetchError(e.message);
    } finally {
      setProvLoading(false);
    }
  };

  const startReconnectPolling = (newIp: string) => {
    setProvReconnectIp(newIp);
    setProvStage('reconnecting');
    setProvReconnectAttempts(0);
    setProvReconnectStatus(`Aguardando sincronização com o MikroTik no IP ${newIp}...`);

    let attempts = 0;
    if (reconnectTimer.current) clearInterval(reconnectTimer.current);
    reconnectTimer.current = setInterval(async () => {
      attempts++;
      setProvReconnectAttempts(attempts);
      setProvReconnectStatus(`Tentativa ${attempts} de sincronização em ${newIp}...`);

      try {
        const res = await fetch('/api/hotspot/provision/reconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newIp }),
        });
        const data = await res.json();

        if (data.connected && data.etapas) {
          if (reconnectTimer.current) clearInterval(reconnectTimer.current);
          setProvReconnectStatus(`✅ Reconectado com sucesso em ${newIp}!`);

          const stepsData = data.etapas;
          
          setProvSteps(prev => prev.map(s => {
            if (s.name === 'etapa_1') return { ...s, status: 'success', message: 'Serviços de hotspot ativados com sucesso.' };
            if (s.name === 'etapa_2') return { ...s, status: stepsData.etapa_2.status, message: stepsData.etapa_2.message };
            if (s.name === 'etapa_3' && stepsData.etapa_2.status === 'success') return { ...s, status: 'running', message: 'Verificando regras de firewall no roteador...' };
            return s;
          }));

          if (stepsData.etapa_2.status === 'failed') {
            setProvStage('error');
            setProvErrorMsg(`Etapa 2 falhou: ${stepsData.etapa_2.message}`);
            return;
          }

          setTimeout(() => {
            setProvSteps(prev => prev.map(s => {
              if (s.name === 'etapa_3') return { ...s, status: stepsData.etapa_3.status, message: stepsData.etapa_3.message };
              if (s.name === 'etapa_4' && stepsData.etapa_3.status === 'success') return { ...s, status: 'running', message: 'Validando chaves de acesso da API...' };
              return s;
            }));

            if (stepsData.etapa_3.status === 'failed') {
              setProvStage('error');
              setProvErrorMsg(`Etapa 3 falhou: ${stepsData.etapa_3.message}`);
              return;
            }

            setTimeout(() => {
              setProvSteps(prev => prev.map(s => {
                if (s.name === 'etapa_4') return { ...s, status: stepsData.etapa_4.status, message: stepsData.etapa_4.message };
                return s;
              }));

              if (stepsData.etapa_4.status === 'failed') {
                setProvStage('error');
                setProvErrorMsg(`Etapa 4 falhou: ${stepsData.etapa_4.message}`);
                return;
              }

              setTimeout(() => {
                setProvStage('done');
                setProvSummary({
                  wanInterface: 'Manual (Winbox)',
                  lanBridge: provSelectedWan?.name || 'bridge',
                  gatewayIp: newIp,
                  network: `${newIp.split('.').slice(0, 3).join('.')}.0/24`,
                  poolRanges: `${newIp.split('.').slice(0, 3).join('.')}.10-.254`,
                  dnsPortal: 'hotspot.wifi.local',
                  hotspotServer: 'hs_hotspot',
                });
              }, 600);

            }, 800);

          }, 800);
        }
      } catch { }

      if (attempts >= 30) {
        if (reconnectTimer.current) clearInterval(reconnectTimer.current);
        setProvReconnectStatus('⚠️ Timeout de reconexão. Verifique se o MikroTik está respondendo.');
        setProvStage('error');
        setProvErrorMsg(`Não foi possível reconectar ao MikroTik em ${newIp} após 30 tentativas. Acesse o Winbox para verificar.`);
      }
    }, 3000);
  };

  const handleProvision = async (overrideWan?: string, overrideGateway?: string) => {
    const wanName = overrideWan || provSelectedWan?.name;
    const gateway = overrideGateway || provSuggestedGateway;
    if (!wanName) return;

    const updatedSteps: Step[] = [
      { name: 'etapa_1', label: '⚡ Etapa 1: Provisionamento dos Serviços de Hotspot', status: 'running', message: 'Configurando Pool, DHCP e Servidor Hotspot...' },
      { name: 'etapa_2', label: '🧹 Etapa 2: Validação de Configurações de Fábrica', status: 'pending', message: 'Aguardando Etapa 1...' },
      { name: 'etapa_3', label: '🛡️ Etapa 3: Validação de Regras de Firewall', status: 'pending', message: 'Aguardando Etapa 1...' },
      { name: 'etapa_4', label: '🔑 Etapa 4: Configuração de Acesso à API e Assinatura', status: 'pending', message: 'Aguardando Etapa 1...' },
    ];
    setProvSteps(updatedSteps);

    try {
      const res = await fetch('/api/hotspot/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wanInterface: wanName, gatewayIp: gateway }),
      });

      const data = await res.json();

      if (data.success) {
        setProvSteps(prev => prev.map(s => s.name === 'etapa_1' ? { ...s, status: 'success', message: 'Configurações iniciais aplicadas.' } : s));
        startReconnectPolling(data.newIp || gateway);
      } else if (data.connectionDropped) {
        setProvSteps(prev => prev.map(s => s.name === 'etapa_1' ? { ...s, status: 'success', message: 'Serviços de hotspot criados. Conectando...' } : s));
        startReconnectPolling(data.newIp || gateway);
      } else {
        setProvSteps(prev => prev.map(s => s.name === 'etapa_1' ? { ...s, status: 'failed', message: data.message || 'Erro no provisionamento inicial.' } : s));
        setProvErrorMsg(data.message || 'Erro no provisionamento inicial.');
        setProvStage('error');
      }
    } catch (e: any) {
      setProvSteps(prev => prev.map(s => s.name === 'etapa_1' ? { ...s, status: 'success', message: 'Conectando ao roteador na nova rede...' } : s));
      startReconnectPolling(gateway);
    }
  };

  const handleResetProvision = () => {
    if (reconnectTimer.current) clearInterval(reconnectTimer.current);
    setProvStage('select');
    setProvSelectedWan(null);
    setProvSteps(INIT_STEPS.map(s => ({ ...s })));
    setProvSummary(null);
    setProvAdminIp(null);
    setProvErrorMsg('');
    setProvReconnectAttempts(0);
    setProvIsAlreadyProvisioned(false);
    fetchInterfaces();
  };

  useEffect(() => {
    if (activeHubTab === 'leads') {
      fetchLeads();
      setLeadsMounted(true);
    } else if (activeHubTab === 'provisioning') {
      fetchInterfaces();
    }
  }, [activeHubTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'editor' || tabParam === 'leads' || tabParam === 'provisioning') {
        setActiveHubTab(tabParam as 'editor' | 'leads' | 'provisioning');
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimer.current) clearInterval(reconnectTimer.current);
    };
  }, []);

  // App settings states
  // App settings states
  const [template, setTemplate] = useState('default');

  // Load saved template on mount, prioritando o último template oficialmente subido ao MikroTik (SystemConfig)
  useEffect(() => {
    const initTemplate = async () => {
      try {
        const res = await fetch('/api/portal/templates');
        const data = await res.json();
        if (data.success && data.lastDeployedTemplate) {
          setTemplate(data.lastDeployedTemplate);
          if (typeof window !== 'undefined') {
            localStorage.setItem('mikrogestor_last_template', data.lastDeployedTemplate);
          }
          return;
        }
      } catch (err) {
        console.warn('Could not fetch last deployed template from API, falling back to localStorage:', err);
      }
      
      if (typeof window !== 'undefined') {
        const savedTemplate = localStorage.getItem('mikrogestor_last_template');
        if (savedTemplate) {
          setTemplate(savedTemplate);
        }
      }
    };
    initTemplate();
  }, []);
  const [businessName, setBusinessName] = useState('Super Wi-Fi');
  const [message, setMessage] = useState('Bem-vindo à nossa rede gratuita. Insira o seu voucher para navegar.');
  const [systemUrl, setSystemUrl] = useState('');
  const [ftpPort, setFtpPort] = useState('21');
  const [activeColorCategory, setActiveColorCategory] = useState<'presets' | 'identity' | 'card' | 'inputs' | 'buttons' | 'typography'>('presets');
  const [colors, setColors] = useState<Colors>({
    brand: '#2563eb',
    brandDark: '#1d4ed8',
    bg: '#ffffff',
    ink: '#0f172a',
    muted: '#64748b',
    blue: '#2563eb',
    green: '#10b981',
    trialButtonBg: '#1E90FF',
    trialButtonText: '#FFFFFF',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,0,0,0.08)',
    inputBg: '#ffffff',
    inputText: '#0f172a',
    inputBorder: '#e2e8f0',
    inputPlaceholder: '#94a3b8',
    loginButtonText: '#ffffff',
    registerButtonText: '#ffffff',
    glassOpacity: 100,
    glassBlur: 0
  });
  const [ad, setAd] = useState<AdConfig>({
    type: 'none',
    mediaUrl: '',
    targetUrl: '',
    items: [],
    timerEnabled: false,
    timerDuration: 5
  });
  
  const [bg, setBg] = useState<BgConfig>({
    type: 'default',
    url: ''
  });
  const [showSimulatedAd, setShowSimulatedAd] = useState(true);
  const [simulatedTimer, setSimulatedTimer] = useState(0);
  const [simulatedActiveIndex, setSimulatedActiveIndex] = useState(0);
  
  // Customizable registration texts and global enabled states
  const [enabled, setEnabled] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [loginButtonLabel, setLoginButtonLabel] = useState('Conectar');
  const [registerButtonText, setRegisterButtonText] = useState('Cadastre-se aqui');
  const [registerTitle, setRegisterTitle] = useState('Wi-Fi Grátis');
  const [registerSubtitle, setRegisterSubtitle] = useState('Cadastre-se abaixo para liberar o acesso à internet');
  const [registerSubmitText, setRegisterSubmitText] = useState('Cadastrar e Conectar');
  const [termsText, setTermsText] = useState('Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.');
  const [trialEnabled, setTrialEnabled] = useState(true);
  const [trialText, setTrialText] = useState('Acesso de teste disponível, ');
  const [trialLinkText, setTrialLinkText] = useState('clique aqui');
  const [trialModalTitle, setTrialModalTitle] = useState('Acesso de Teste');
  const [trialModalMessage, setTrialModalMessage] = useState('Tem certeza de que deseja liberar o acesso grátis por 30 minutos?');
  const [trialModalConfirmText, setTrialModalConfirmText] = useState('Sim, Conectar');
  const [trialModalCancelText, setTrialModalCancelText] = useState('Não, Voltar');

  // Lead fields configuration states
  const [fields, setFields] = useState<FieldsConfig>({
    nameEnabled: true,
    nameRequired: true,
    phoneEnabled: true,
    phoneRequired: true,
    birthDateEnabled: true,
    birthDateRequired: true,
    emailEnabled: true,
    emailRequired: false,
    cpfEnabled: true,
    cpfRequired: true,
    genderEnabled: true,
    genderRequired: true,
    passwordEnabled: true,
    passwordRequired: true,
    customFieldEnabled: false,
    customFieldLabel: 'Como nos conheceu?',
    customFieldRequired: false,
    optInCoursesEnabled: true,
    optInCoursesLabel: 'Eu aceito receber informações dos cursos'
  });

  // Visual Effects State
  const [effects, setEffects] = useState<EffectsConfig>({
    bgEffect: 'none',
    bgEffectSpeed: 'normal',
    cardShape: 'rounded',
    cardNoiseTexture: false,
    cardGlowBorder: false,
    cardTilt3d: false,
    btnShimmer: true,
    btnPulse: false,
    titleGradient: false,
  });

  // Social & Badges & Pro Code States
  const [social, setSocial] = useState<SocialConfig>({
    whatsappEnabled: false,
    whatsappNumber: '',
    whatsappMessage: 'Olá! Preciso de suporte para acessar o Wi-Fi.',
    instagramUrl: '',
    facebookUrl: '',
    googleMapsUrl: '',
  });

  const [badges, setBadges] = useState<BadgesConfig>({
    showWifiSpeed: true,
    wifiSpeedText: '🚀 Turbo Launch 5G',
    showSecurityBadge: true,
    securityText: '🔒 Ultra Fast Portal',
    showConnectedCount: false,
    connectedCountNumber: '42',
  });

  const [customCode, setCustomCode] = useState<CustomCodeConfig>({
    customCss: '',
  });

  const [studio, setStudio] = useState<StudioState>({
    activeComponent: 'submit_button',
    fontFamily: 'Inter',
    titleFontSize: 22,
    titleFontWeight: '700',
    titleLineHeight: 1.2,
    titleLetterSpacing: 0,
    titleAlign: 'center',
    titleItalic: false,
    titleUnderline: false,
    btnFontSize: 14,
    btnFontWeight: '600',
    btnLetterSpacing: 0.5,
    btnHeight: 46,
    btnPaddingTop: 12,
    btnPaddingRight: 20,
    btnPaddingBottom: 12,
    btnPaddingLeft: 20,
    btnRadiusTL: 12,
    btnRadiusTR: 12,
    btnRadiusBR: 12,
    btnRadiusBL: 12,
    btnBorderWidth: 0,
    cardRadiusTL: 20,
    cardRadiusTR: 20,
    cardRadiusBR: 20,
    cardRadiusBL: 20,
    cardPaddingTop: 24,
    cardPaddingRight: 24,
    cardPaddingBottom: 24,
    cardPaddingLeft: 24,
    cardBorderWidth: 1,
    cardBorderStyle: 'solid',
    cardGap: 16,
    inputHeight: 44,
    inputRadius: 10,
    inputBorderWidth: 1
  });

  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // UI/Interactive states
  const [activeTab, setActiveTab] = useState<'studio' | 'fields' | 'ad' | 'custom' | 'ftp'>('studio');
  const [previewScreen, setPreviewScreen] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('/api/portal/logo');
  
  // Set client-side cache buster safely on client mount after hydration
  useEffect(() => {
    setLogoPreviewUrl(`/api/portal/logo?template=${template}&t=` + Date.now());
  }, [template]);

  const [brand, setBrand] = useState<BrandConfig>({
    headerStyle: 'hidden',
    displayMode: 'both',
    logoBg: 'none',
    logoBgCustomColor: '#ffffff',
    logoShape: 'rounded',
    logoPadding: 8,
    logoSize: 100,
    logoBorder: false,
    logoShadow: true,
    titleText: 'Super Wi-Fi',
    subtitleText: '',
    fontFamily: 'Outfit',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 1.2,
    textColor: '#ffffff',
    textAlign: 'center',
    textTransform: 'none',
    textEffect: 'gradient-metal',
    entranceAnimation: 'fade-zoom',
    animationDuration: 1.2,
    animationDelay: 0.1,
    animationEasing: 'smooth',
    continuousEffect: 'none',
    taglineFontFamily: 'Outfit',
    taglineFontSize: 12,
    taglineColor: '#94a3b8',
    taglineLetterSpacing: 0,
    badgeStyle: 'none'
  });

  const handleTriggerReplay = useCallback(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'REPLAY_ANIMATION' }, '*');
    }
  }, []);

  // Sync configuration to iframe preview
  const broadcastLivePreview = useCallback(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'LIVE_PREVIEW',
        colors,
        bg,
        effects,
        studio,
        brand,
        social,
        badges,
        customCode,
        enabled,
        loginButtonLabel,
        registerButtonText,
        businessName,
        message,
        trialEnabled,
        trialText,
        trialLinkText,
        trialModalTitle,
        trialModalMsg: trialModalMessage,
        trialModalCancelText,
        trialModalConfirmText,
        fields,
        registerTitle,
        registerSubtitle,
        registerSubmitText,
        termsText
      }, '*');
    }
  }, [colors, bg, effects, studio, brand, social, badges, customCode, enabled, loginButtonLabel, registerButtonText, businessName, message, trialEnabled, trialText, trialLinkText, trialModalTitle, trialModalMessage, trialModalCancelText, trialModalConfirmText, fields, registerTitle, registerSubtitle, registerSubmitText, termsText]);

  useEffect(() => {
    broadcastLivePreview();
  }, [broadcastLivePreview]);

  useEffect(() => {
    const handleReadyHandshake = (event: MessageEvent) => {
      if (event.data?.type === 'IFRAME_READY') {
        broadcastLivePreview();
      }
    };
    window.addEventListener('message', handleReadyHandshake);
    return () => window.removeEventListener('message', handleReadyHandshake);
  }, [broadcastLivePreview]);

  // Live Inspector (Raio-X) State
  interface InspectedElementInfo {
    target: string;
    cardId: string;
    title: string;
    editableProps?: string[];
  }

  const [inspectedElement, setInspectedElement] = useState<InspectedElementInfo | null>(null);
  const [hoveredCardTarget, setHoveredCardTarget] = useState<string | null>(null);

  useEffect(() => {
    const handleInspectorMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'PREVIEW_ELEMENT_HOVER') {
        setInspectedElement({
          target: event.data.target,
          cardId: event.data.cardId,
          title: event.data.title,
          editableProps: event.data.editableProps || []
        });
      } else if (event.data.type === 'PREVIEW_ELEMENT_LEAVE') {
        setInspectedElement(null);
      } else if (event.data.type === 'PREVIEW_ELEMENT_CLICK') {
        const cardId = event.data.cardId;
        if (cardId === 'fields') {
          setActiveTab('fields');
          setPreviewScreen('register');
        } else if (cardId === 'ad') {
          setActiveTab('ad');
        } else {
          setActiveTab('studio');
          setPreviewScreen('login');
          setTimeout(() => {
            const cardEl = document.getElementById('card-' + cardId);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              cardEl.classList.remove('editor-card-active-flash');
              void cardEl.offsetWidth;
              cardEl.classList.add('editor-card-active-flash');
              setTimeout(() => cardEl.classList.remove('editor-card-active-flash'), 2500);

              // Auto-focus first input/select in the selected card
              const focusEl = cardEl.querySelector('input:not([type="checkbox"]), select') as HTMLElement;
              if (focusEl) {
                focusEl.focus();
              }
            }
          }, 80);
        }
      }
    };

    window.addEventListener('message', handleInspectorMessage);
    return () => window.removeEventListener('message', handleInspectorMessage);
  }, []);

  const handleCardHover = useCallback((target: string | null) => {
    setHoveredCardTarget(target);
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: target ? 'INSPECTOR_HOVER_CARD' : 'INSPECTOR_CLEAR',
        target
      }, '*');
    }
  }, []);

  const [adUploadLoading, setAdUploadLoading] = useState(false);
  const [logoUploadLoading, setLogoUploadLoading] = useState(false);
  const [bgUploadLoading, setBgUploadLoading] = useState(false);
  const [simulatorMuted, setSimulatorMuted] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const adInputRef = useRef<HTMLInputElement>(null);
  const adVideoInputRef = useRef<HTMLInputElement>(null);

  // Load existing configurations on mount
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/portal/config?template=${template}`);
        const data = await res.json();
        if (data.success && data.config) {
          const c = data.config;
          if (c.businessName) setBusinessName(c.businessName);
          if (c.message) setMessage(c.message);
          if (c.systemUrl) setSystemUrl(c.systemUrl);
          if (c.colors) setColors(prev => ({ ...prev, ...c.colors }));
          if (c.effects) setEffects(prev => ({ ...prev, ...c.effects }));
          if (c.social) setSocial(prev => ({ ...prev, ...c.social }));
          if (c.badges) setBadges(prev => ({ ...prev, ...c.badges }));
          if (c.customCode) setCustomCode(prev => ({ ...prev, ...c.customCode }));
          if (c.studio) setStudio(prev => ({ ...prev, ...c.studio }));
          if (c.brand) setBrand(prev => ({ ...prev, ...c.brand }));
          if (c.ad) setAd(prev => ({ ...prev, ...c.ad }));
          if (c.bg) setBg(prev => ({ ...prev, ...c.bg }));
          if (c.fields) setFields(prev => ({ ...prev, ...c.fields }));
          
          if (c.enabled !== undefined) setEnabled(c.enabled);
          if (c.redirectUrl !== undefined) setRedirectUrl(c.redirectUrl);
          if (c.registerButtonText !== undefined) setRegisterButtonText(c.registerButtonText);
          if (c.registerTitle !== undefined) setRegisterTitle(c.registerTitle);
          if (c.registerSubtitle !== undefined) setRegisterSubtitle(c.registerSubtitle);
          if (c.registerSubmitText !== undefined) setRegisterSubmitText(c.registerSubmitText);
          if (c.termsText !== undefined) setTermsText(c.termsText);
          if (c.trialEnabled !== undefined) setTrialEnabled(c.trialEnabled);
          if (c.trialText !== undefined) setTrialText(c.trialText);
          if (c.trialLinkText !== undefined) setTrialLinkText(c.trialLinkText);
          if (c.trialModalTitle !== undefined) setTrialModalTitle(c.trialModalTitle);
          if (c.trialModalMessage !== undefined) setTrialModalMessage(c.trialModalMessage);
          if (c.trialModalConfirmText !== undefined) setTrialModalConfirmText(c.trialModalConfirmText);
          if (c.trialModalCancelText !== undefined) setTrialModalCancelText(c.trialModalCancelText);
        }
      } catch (err) {
        console.error('Falha ao carregar configurações do portal:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchServerIp = async () => {
      try {
        const res = await fetch('/api/system/network');
        const data = await res.json();
        if (data.success && data.ip) {
          // Pre-populate systemUrl if empty
          setSystemUrl(prev => prev || `http://${data.ip}`);
        }
      } catch (err) {
        console.error('Falha ao detectar IP do servidor:', err);
      }
    };

    loadConfig();
    fetchServerIp();
  }, [template]);

  // Reset simulated ad preview on ad or tab change
  useEffect(() => {
    setShowSimulatedAd(true);
  }, [ad.type, ad.mediaUrl, ad.items?.length, ad.timerEnabled, ad.timerDuration, activeTab]);

  // Handle simulated countdown timer
  useEffect(() => {
    if (!showSimulatedAd) return;

    if (ad.timerEnabled) {
      setSimulatedTimer(ad.timerDuration || 5);
      const timerInterval = setInterval(() => {
        setSimulatedTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerInterval);
    } else {
      setSimulatedTimer(0);
    }
  }, [showSimulatedAd, ad.timerEnabled, ad.timerDuration]);

  // Handle simulated carousel auto-play
  useEffect(() => {
    if (!showSimulatedAd || ad.type !== 'carousel') return;
    
    const carouselItems = Array.isArray(ad.items) ? ad.items.filter(item => item && item.url) : [];
    if (carouselItems.length <= 1) return;

    const autoplayInterval = setInterval(() => {
      setSimulatedActiveIndex(prev => (prev + 1) % carouselItems.length);
    }, 4000);

    return () => clearInterval(autoplayInterval);
  }, [showSimulatedAd, ad.type, ad.items]);

  // Reset simulated active index on carousel config changes
  useEffect(() => {
    setSimulatedActiveIndex(0);
  }, [ad.items?.length, showSimulatedAd]);

  // Update a single color variable
  const handleColorChange = (key: keyof Colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle field configurations
  const handleFieldToggle = (key: keyof FieldsConfig) => {
    setFields(prev => ({
      ...prev,
      [key]: !prev[key] as any
    }));
  };

  // Set field text labels
  const handleFieldLabelChange = (value: string) => {
    setFields(prev => ({
      ...prev,
      customFieldLabel: value
    }));
  };

  // Upload Logo handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');
    formData.append('template', template);

    try {
      const res = await fetch('/api/portal/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setLogoPreviewUrl(`/api/portal/logo?template=${template}&t=` + Date.now());
        alert('Logo atualizada com sucesso!');
      } else {
        alert('Erro ao enviar logo: ' + data.message);
      }
    } catch (err) {
      alert('Falha ao enviar arquivo.');
    } finally {
      setLogoUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Upload Bg handler (Supports video up to 35MB and image up to 10MB)
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm') || file.type.startsWith('video/');
    const maxLimit = isVideo ? 35 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxLimit) {
      alert(`O arquivo excede o limite máximo de ${isVideo ? '35 MB para vídeos' : '10 MB para imagens'}.`);
      return;
    }

    setBgUploadLoading(true);

    try {
      const res = await fetch(`/api/portal/upload?type=bg&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        const newBg: BgConfig = {
          type: isVideo ? 'video' : 'image',
          url: data.fileUrl + '?t=' + Date.now()
        };
        setBg(newBg);
        alert('Mídia de fundo enviada e ativada com sucesso!');
      } else {
        alert('Erro ao enviar fundo: ' + (data.message || 'Falha no servidor.'));
      }
    } catch (err: any) {
      alert('Falha ao enviar arquivo: ' + (err?.message || 'Erro de conexão.'));
    } finally {
      setBgUploadLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Remove Bg media from server and disk to free space
  const handleBgRemove = async () => {
    if (!confirm('Deseja realmente remover a mídia de fundo e apagar o arquivo do servidor para liberar espaço?')) {
      return;
    }

    setBgUploadLoading(true);
    try {
      const res = await fetch(`/api/portal/upload?type=bg&template=${template}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setBg({
          type: 'default',
          url: ''
        });
        alert(data.message || 'Mídia removida com sucesso!');
      } else {
        alert('Erro ao remover mídia: ' + data.message);
      }
    } catch (err: any) {
      alert('Falha ao remover mídia: ' + (err?.message || 'Erro de rede.'));
    } finally {
      setBgUploadLoading(false);
    }
  };

  // Upload Ad Image handler
  const handleAdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdUploadLoading(true);

    try {
      const res = await fetch(`/api/portal/upload?type=ad&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setAd(prev => ({
          ...prev,
          mediaUrl: data.fileUrl
        }));
        alert('Imagem do anúncio enviada com sucesso!');
      } else {
        alert('Erro ao enviar imagem do anúncio: ' + data.message);
      }
    } catch (err) {
      alert('Falha ao enviar arquivo.');
    } finally {
      setAdUploadLoading(false);
      if (adInputRef.current) adInputRef.current.value = '';
    }
  };

  // Upload Ad Video handler
  const handleAdVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdUploadLoading(true);

    try {
      const res = await fetch(`/api/portal/upload?type=ad&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setAd(prev => ({
          ...prev,
          mediaUrl: data.fileUrl
        }));
        alert('Vídeo do anúncio enviado com sucesso!');
      } else {
        alert('Erro ao enviar vídeo do anúncio: ' + data.message);
      }
    } catch (err) {
      alert('Falha ao enviar arquivo.');
    } finally {
      setAdUploadLoading(false);
      if (adVideoInputRef.current) adVideoInputRef.current.value = '';
    }
  };

  // Upload slot-based ad handler (up to 5 items)
  const handleSlotAdUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdUploadLoading(true);

    try {
      const res = await fetch(`/api/portal/upload?type=ad&slot=${slot}&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
        const mediaType = isVideo ? 'video' : 'image';

        setAd(prev => {
          const currentItems = Array.isArray(prev.items) ? [...prev.items] : [];
          while (currentItems.length < slot) {
            currentItems.push({ url: '', type: 'image', targetUrl: '' });
          }
          currentItems[slot - 1] = {
            url: data.fileUrl,
            type: mediaType,
            targetUrl: currentItems[slot - 1]?.targetUrl || ''
          };
          return {
            ...prev,
            items: currentItems
          };
        });
        alert(`Mídia do Slot ${slot} enviada com sucesso!`);
      } else {
        alert('Erro ao enviar mídia: ' + data.message);
      }
    } catch (err) {
      alert('Falha ao enviar arquivo.');
    } finally {
      setAdUploadLoading(false);
    }
  };

  const handleSlotTargetUrlChange = (slot: number, val: string) => {
    setAd(prev => {
      const currentItems = Array.isArray(prev.items) ? [...prev.items] : [];
      while (currentItems.length < slot) {
        currentItems.push({ url: '', type: 'image', targetUrl: '' });
      }
      currentItems[slot - 1] = {
        ...currentItems[slot - 1],
        url: currentItems[slot - 1]?.url || '',
        type: currentItems[slot - 1]?.type || 'image',
        targetUrl: val
      };
      return {
        ...prev,
        items: currentItems
      };
    });
  };

  const handleSlotClear = (slot: number) => {
    setAd(prev => {
      const currentItems = Array.isArray(prev.items) ? [...prev.items] : [];
      if (currentItems[slot - 1]) {
        currentItems[slot - 1] = { url: '', type: 'image', targetUrl: '' };
      }
      return {
        ...prev,
        items: currentItems
      };
    });
  };

  const handleCleanUploads = async () => {
    setAdUploadLoading(true);
    try {
      const res = await fetch(`/api/portal/upload?template=${template}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert('Erro ao limpar pasta: ' + data.message);
      }
    } catch (err) {
      alert('Falha ao conectar com o servidor para realizar a limpeza.');
    } finally {
      setAdUploadLoading(false);
    }
  };

  // Save current configurations locally
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/portal/config?template=${template}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          message,
          systemUrl,
          colors,
          effects,
          studio,
          brand,
          social,
          badges,
          customCode,
          bg,
          ad,
          fields,
          enabled,
          redirectUrl,
          registerButtonText,
          registerTitle,
          registerSubtitle,
          registerSubmitText,
          termsText,
          trialEnabled,
          trialText,
          trialLinkText,
          trialModalTitle,
          trialModalMessage,
          trialModalConfirmText,
          trialModalCancelText
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Configurações salvas localmente!');
        return true;
      } else {
        alert('Erro ao salvar: ' + data.message);
        return false;
      }
    } catch (err) {
      alert('Erro de conexão ao salvar configurações.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save and deploy via FTP
  const handleSaveAndDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);

    try {
      // 1. Save locally first to compile HTML/CSS
      const saveRes = await fetch(`/api/portal/config?template=${template}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          message,
          systemUrl,
          colors,
          effects,
          studio,
          brand,
          social,
          badges,
          customCode,
          bg,
          ad,
          fields,
          enabled,
          redirectUrl,
          registerButtonText,
          registerTitle,
          registerSubtitle,
          registerSubmitText,
          termsText,
          trialEnabled,
          trialText,
          trialLinkText,
          trialModalTitle,
          trialModalMessage,
          trialModalConfirmText,
          trialModalCancelText
        })
      });
      const saveData = await saveRes.json();
      if (!saveData.success) {
        setDeployModal({ type: 'error', message: 'Falha ao salvar configurações locais. Deploy cancelado.' });
        setDeploying(false);
        return;
      }

      // 2. Trigger FTP sync
      const res = await fetch('/api/portal/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ftpPort, template })
      });
      const data = await res.json();

      if (data.success) {
        setDeployModal({ type: 'success', message: data.message });
      } else {
        setDeployModal({ type: 'error', message: 'Erro no Deploy: ' + data.message });
      }
    } catch (err) {
      setDeployModal({ type: 'error', message: 'Erro na comunicação com a API de Deploy.' });
    } finally {
      setDeploying(false);
    }
  };

  const renderAdSimulator = () => {
    if (!ad || ad.type === 'none') return null;

    const carouselItems = Array.isArray(ad.items) ? ad.items.filter(item => item && item.url) : [];

    if (!showSimulatedAd) {
      return (
        <button 
          onClick={() => setShowSimulatedAd(true)}
          className="absolute bottom-4 right-4 z-40 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold px-3 py-2 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>👁️ Ver Anúncio</span>
        </button>
      );
    }

    return (
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none z-50 animate-fade-in">
        {/* Close button (top right of phone screen overlay) */}
        {(!ad.timerEnabled || simulatedTimer === 0) ? (
          <button 
            onClick={() => setShowSimulatedAd(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm font-bold backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer z-50 border border-white/20"
            title="Fechar Publicidade"
          >
            ✕
          </button>
        ) : null}

        {/* Content Wrapper */}
        <div className={`flex flex-col items-center gap-3 w-full transition-all duration-300 ${ad.type === 'video' ? 'max-w-[480px]' : 'max-w-[290px]'}`}>
          {/* Instagram-style visual layout or widescreen video card */}
          <div className={`relative rounded-2xl overflow-hidden animate-scale-up transition-all duration-300 ${
            ad.type === 'video' 
              ? 'w-fit h-auto max-w-[90vw] max-h-[60vh] bg-transparent border-none shadow-none flex items-center justify-center' 
              : 'w-[240px] h-[426px] max-w-[90vw] max-h-[68vh] bg-black shadow-2xl flex flex-col justify-between border border-white/10'
          }`}>
            {/* Sponsored Badge */}
            <span className="absolute top-3 left-3 bg-black/60 text-white text-[8px] px-2 py-0.5 rounded font-bold uppercase z-30 tracking-wider">
              Patrocinado
            </span>

            {/* Left and Right navigation tap targets for realistic phone swiping */}
            {ad.type === 'carousel' && carouselItems.length > 1 && (
              <>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSimulatedActiveIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
                  }}
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-40 cursor-pointer"
                  title="Slide Anterior"
                />
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSimulatedActiveIndex(prev => (prev + 1) % carouselItems.length);
                  }}
                  className="absolute right-0 top-0 bottom-0 w-1/3 z-40 cursor-pointer"
                  title="Próximo Slide"
                />
              </>
            )}

            {/* Stories-style top progress bars */}
            {ad.type === 'carousel' && carouselItems.length > 1 && (
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-30">
                {carouselItems.map((_, idx) => (
                  <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                       className={`h-full bg-white transition-all duration-300 ${
                        idx < simulatedActiveIndex 
                          ? 'w-full' 
                          : idx === simulatedActiveIndex 
                            ? 'w-full animate-[progress_4s_linear]' 
                            : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Slides / Carousel Viewport */}
            <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
              {ad.type === 'carousel' ? (
                carouselItems.length > 0 ? (
                  carouselItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center ${
                        idx === simulatedActiveIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <SimulatorVideo
                          src={item.url}
                          isCurrent={idx === simulatedActiveIndex}
                          isMuted={simulatorMuted}
                        />
                      ) : (
                        <img 
                          src={item.url} 
                          alt={`Slide ${idx + 1}`} 
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => item.targetUrl && window.open(item.targetUrl, '_blank')}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs">Sem mídias no carrossel</div>
                )
              ) : (
                /* Non-carousel types (Single image/video if fallback configuration) */
                ad.mediaUrl ? (
                  ad.type === 'image' ? (
                    <img 
                      src={ad.mediaUrl} 
                      alt="Ad Banner" 
                      className="w-full h-full object-contain cursor-pointer" 
                      onClick={() => ad.targetUrl && window.open(ad.targetUrl, '_blank')}
                    />
                  ) : (
                    <video 
                      src={ad.mediaUrl} 
                      autoPlay 
                      muted={simulatorMuted} 
                      loop 
                      playsInline 
                      className={`cursor-pointer transition-all ${
                        ad.type === 'video'
                          ? 'w-auto h-auto max-w-full max-h-[60vh] rounded-2xl border border-white/10 shadow-2xl object-contain'
                          : 'w-full h-full object-cover'
                      }`}
                      onClick={() => ad.targetUrl && window.open(ad.targetUrl, '_blank')}
                    />
                  )
                ) : (
                  <div className="text-slate-500 text-xs">Sem mídia configurada</div>
                )
              )}
            </div>

            {/* Floating Audio Button in Simulator */}
            {(ad.type === 'video' || (ad.type === 'carousel' && carouselItems[simulatedActiveIndex]?.type === 'video')) && (
              <button 
                type="button"
                onClick={() => setSimulatorMuted(prev => !prev)}
                className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm hover:bg-black/85 transition-all cursor-pointer z-40 border border-white/20 animate-fade-in"
                title={simulatorMuted ? "Ativar Som" : "Mutar Som"}
              >
                {simulatorMuted ? '🔇' : '🔊'}
              </button>
            )}
          </div>

          {/* Countdown timer badge (sits BELOW the modal card) */}
          {ad.timerEnabled && simulatedTimer > 0 && (
            <div className="bg-black/85 backdrop-blur-md border border-white/10 text-white text-[10px] px-4 py-1.5 rounded-full font-bold shadow-lg select-none whitespace-nowrap transition-all animate-fade-in">
              Aguarde... ({simulatedTimer}s)
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="p-4 md:p-6 space-y-6 animate-fade-in relative pb-24">
      {/* Header */}
      <header className="retro-card p-4 flex items-center gap-3">
        <div className="rack-screw" />
        <span className="led led-blue animate-led-pulse" />
        <div>
          <div style={{ color: 'var(--led-blue)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ▶ HOTSPOT // {activeHubTab === 'editor' ? 'PORTAL DESIGN CONFIG' : activeHubTab === 'leads' ? 'ANALYTICS DATABASE' : 'ROUTER PROVISIONING'}
          </div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
            {activeHubTab === 'editor' ? 'Editor de Portal' : activeHubTab === 'leads' ? 'Leads & Cadastros' : 'Provisionamento WiFi'}
          </h1>
        </div>
        <div className="ml-auto rack-screw" />
      </header>

      {/* Primary Top Tab Switcher */}
      <div className="flex flex-wrap gap-3 bg-[#0a0a18]/40 p-2 rounded-xl border border-[#252542] w-fit shadow-[inset_0_2px_5px_rgba(0,0,0,0.6)]">
        <button 
          onClick={() => setActiveHubTab('editor')}
          type="button"
          className={`retro-btn text-xs py-1.5 px-4 ${
            activeHubTab === 'editor' ? 'retro-btn-primary' : 'retro-btn-dark'
          }`}
        >
          🎨 Editor de Portal
        </button>
        <button 
          onClick={() => setActiveHubTab('leads')}
          type="button"
          className={`retro-btn text-xs py-1.5 px-4 ${
            activeHubTab === 'leads' ? 'retro-btn-primary' : 'retro-btn-dark'
          }`}
        >
          👥 Leads & Cadastros
        </button>
        <button 
          onClick={() => setActiveHubTab('provisioning')}
          type="button"
          className={`retro-btn text-xs py-1.5 px-4 ${
            activeHubTab === 'provisioning' ? 'retro-btn-primary' : 'retro-btn-dark'
          }`}
        >
          ⚙️ Provisionamento WiFi
        </button>
      </div>

      {activeHubTab === 'editor' ? (
        loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <span className="ml-3 text-slate-600 font-medium">Carregando portal...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Controls Section (Left - 7 Columns) */}
          <div className="lg:col-span-7 retro-card flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#0a0a18]" style={{ background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
              <div className="rack-screw" />
              <span className="font-mono text-xs font-bold text-slate-450 uppercase">PORTAL_TEMPLATE_EDITOR</span>
              <div className="ml-auto rack-screw" />
            </div>
            
            {/* Tabs Selector */}
            <div className="flex flex-wrap gap-2 p-3 bg-[#0a0a18]/20 border-b border-[#0a0a18] overflow-x-auto">
              <button 
                onClick={() => { setActiveTab('studio'); setPreviewScreen('login'); }}
                type="button"
                className={`retro-btn text-xs py-1.5 px-3 ${
                  activeTab === 'studio' ? 'retro-btn-primary' : 'retro-btn-dark'
                }`}
              >
                🎨 Studio Inspector (Figma UI)
              </button>

              <button 
                onClick={() => { setActiveTab('fields'); setPreviewScreen('register'); }}
                type="button"
                className={`retro-btn text-xs py-1.5 px-3 ${
                  activeTab === 'fields' ? 'retro-btn-primary' : 'retro-btn-dark'
                }`}
              >
                📋 Form de Cadastro
              </button>

              <button 
                onClick={() => { setActiveTab('ad'); setPreviewScreen('login'); }}
                type="button"
                className={`retro-btn text-xs py-1.5 px-3 ${
                  activeTab === 'ad' ? 'retro-btn-primary' : 'retro-btn-dark'
                }`}
              >
                📢 Publicidade & Mídia
              </button>

              <button 
                onClick={() => { setActiveTab('custom'); setPreviewScreen('login'); }}
                type="button"
                className={`retro-btn text-xs py-1.5 px-3 ${
                  activeTab === 'custom' ? 'retro-btn-primary' : 'retro-btn-dark'
                }`}
              >
                💻 CSS Pro
              </button>

              <button 
                onClick={() => { setActiveTab('ftp'); setPreviewScreen('login'); }}
                type="button"
                className={`retro-btn text-xs py-1.5 px-3 ${
                  activeTab === 'ftp' ? 'retro-btn-primary' : 'retro-btn-dark'
                }`}
              >
                ⚡ Deploy (FTP)
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 flex-1 min-h-[460px] spotlight-container">
              
              {/* TAB: STUDIO INSPECTOR */}
              {activeTab === 'studio' && (
                <div className="space-y-6 animate-fade-in">
                  <StudioInspector
                    template={template}
                    setTemplate={setTemplate}
                    businessName={businessName}
                    setBusinessName={setBusinessName}
                    message={message}
                    setMessage={setMessage}
                    colors={colors}
                    setColors={setColors}
                    effects={effects}
                    setEffects={setEffects}
                    studio={studio}
                    setStudio={setStudio}
                    social={social}
                    setSocial={setSocial}
                    badges={badges}
                    setBadges={setBadges}
                    bg={bg}
                    setBg={setBg}
                    handleBgUpload={handleBgUpload}
                    handleBgRemove={handleBgRemove}
                    bgUploadLoading={bgUploadLoading}
                    COLOR_PRESETS={COLOR_PRESETS}
                    NICHE_EFFECTS={NICHE_EFFECTS}
                    hoveredTarget={hoveredCardTarget || inspectedElement?.target}
                    onCardHover={handleCardHover}
                  />
                </div>
              )}

              {/* TAB: CSS PRO LIVE */}
              {activeTab === 'custom' && (
                <div className="space-y-6 animate-fade-in">
                  <div 
                    data-focus-section="CSS Customizado"
                    className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 spotlight-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💻</span>
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Editor de CSS Customizado (Live Injection)</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                        TEMPO REAL
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Adicione regras CSS personalizadas que serão injetadas instantaneamente no portal captive. Use classes como <code className="text-indigo-300">.card</code>, <code className="text-indigo-300">.btn</code>, <code className="text-indigo-300">body</code> ou seletores próprios.
                    </p>

                    <div 
                      data-focus-label="Editor de Código CSS"
                      className="relative spotlight-field rounded-xl"
                    >
                      <textarea
                        rows={12}
                        value={customCode.customCss}
                        onChange={(e) => setCustomCode({ customCss: e.target.value })}
                        placeholder={`/* Exemplo de CSS customizado */\n.card {\n  transform: scale(1.02);\n  border-color: #10b981 !important;\n}\n\n.btn {\n  letter-spacing: 2px;\n  text-transform: uppercase;\n}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 outline-none focus:border-emerald-500 resize-y leading-relaxed shadow-inner"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
              )}



              {/* TAB 3: CAMPOS DE CADASTRO (LEADS) */}
              {activeTab === 'fields' && (
                <div className="space-y-4 animate-fade-in spotlight-group">
                  <div className="bg-[#12141d] border border-[#232738] rounded-xl p-3.5 text-xs text-slate-400 font-mono flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                      <p className="leading-tight text-[11px]">
                        Ative e defina quais campos os clientes devem preencher na tela de Auto-Cadastro. Os dados capturados alimentam a base de leads em tempo real.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                      LEADS ENGINE
                    </span>
                  </div>

                  {/* 2-COLUMN GRID FOR REGISTRATION SETTINGS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">

                    {/* CARD 1: Configurações Gerais de Auto-Cadastro */}
                    <div 
                      data-focus-section="Auto-Cadastro Geral"
                      className="bg-[#161a27] rounded-xl border border-[#262c42] p-4 space-y-3.5 shadow-sm spotlight-card"
                    >
                      <div className="flex items-center justify-between border-b border-[#23283c] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-mono text-xs">❖</span>
                          <div>
                            <span className="block font-bold text-xs text-white uppercase tracking-wider">Habilitar Auto-Cadastro</span>
                            <span className="text-[10px] text-slate-400 font-mono">Exibe o botão de cadastro no login</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setEnabled(e.target.checked)}
                          className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <div 
                          data-focus-label="Link de Redirecionamento Pós-Login"
                          className="spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Redirecionamento Pós-Login (Link / WhatsApp)</label>
                          <input
                            type="text"
                            value={redirectUrl}
                            onChange={(e) => setRedirectUrl(e.target.value)}
                            placeholder="Ex: https://wa.me/5511999999999 ou site"
                            className="w-full bg-[#0f1118] text-emerald-400 font-mono text-xs px-3 py-2 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div 
                          data-focus-label="Texto do Botão de Cadastro"
                          className="spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Texto do Botão de Cadastro (Login)</label>
                          <input
                            type="text"
                            value={registerButtonText}
                            onChange={(e) => setRegisterButtonText(e.target.value)}
                            placeholder="Ex: Cadastre-se aqui"
                            className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-2 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: Textos da Tela de Auto-Cadastro */}
                    <div 
                      data-focus-section="Textos do Cadastro"
                      className="bg-[#161a27] rounded-xl border border-[#262c42] p-4 space-y-3 shadow-sm spotlight-card"
                    >
                      <div className="flex items-center gap-2 border-b border-[#23283c] pb-2.5">
                        <span className="text-cyan-400 font-mono text-xs">📝</span>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">Textos da Tela de Cadastro</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div 
                          data-focus-label="Título da Tela de Cadastro"
                          className="spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Título da Tela</label>
                          <input
                            type="text"
                            value={registerTitle}
                            onChange={(e) => setRegisterTitle(e.target.value)}
                            placeholder="Ex: Wi-Fi Grátis"
                            className="w-full bg-[#0f1118] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div 
                          data-focus-label="Subtítulo da Tela de Cadastro"
                          className="spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Subtítulo da Tela</label>
                          <input
                            type="text"
                            value={registerSubtitle}
                            onChange={(e) => setRegisterSubtitle(e.target.value)}
                            placeholder="Ex: Cadastre-se abaixo..."
                            className="w-full bg-[#0f1118] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div 
                          data-focus-label="Texto do Botão de Envio"
                          className="spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Botão de Envio (Cadastro)</label>
                          <input
                            type="text"
                            value={registerSubmitText}
                            onChange={(e) => setRegisterSubmitText(e.target.value)}
                            placeholder="Ex: Cadastrar e Conectar"
                            className="w-full bg-[#0f1118] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div 
                          data-focus-label="Termos de Uso (Rodapé)"
                          className="spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Termos de Uso (Rodapé)</label>
                          <input
                            type="text"
                            value={termsText}
                            onChange={(e) => setTermsText(e.target.value)}
                            placeholder="Ex: Ao se cadastrar, você concorda..."
                            className="w-full bg-[#0f1118] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: Configurações de Acesso Grátis (Trial 15/30 min) (Span 2) */}
                    <div 
                      data-focus-section="Acesso Grátis (Trial)"
                      className="bg-[#161a27] rounded-xl border border-[#262c42] p-4 space-y-3.5 shadow-sm lg:col-span-2 spotlight-card"
                    >
                      <div className="flex items-center justify-between border-b border-[#23283c] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-mono text-xs">⚡</span>
                          <div>
                            <span className="block font-bold text-xs text-white uppercase tracking-wider">Habilitar Acesso Grátis (Free / Trial)</span>
                            <span className="text-[10px] text-slate-400 font-mono">Exibe botão de teste gratuito no rodapé do login</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={trialEnabled}
                          onChange={(e) => setTrialEnabled(e.target.checked)}
                          className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {trialEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 animate-fade-in">
                          <div className="space-y-2.5">
                            <div 
                              data-focus-label="Texto do Link de Teste Grátis"
                              className="spotlight-field rounded-xl"
                            >
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Texto de Teste Grátis</label>
                              <input
                                type="text"
                                value={trialText}
                                onChange={(e) => setTrialText(e.target.value)}
                                placeholder="Ex: Acesso de teste disponível, "
                                className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div 
                              data-focus-label="Rótulo do Link de Teste Grátis"
                              className="spotlight-field rounded-xl"
                            >
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Texto do Link de Teste Grátis</label>
                              <input
                                type="text"
                                value={trialLinkText}
                                onChange={(e) => setTrialLinkText(e.target.value)}
                                placeholder="Ex: clique aqui"
                                className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div 
                              data-focus-label="Mensagem de Alerta do Modal de Teste"
                              className="spotlight-field rounded-xl"
                            >
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Mensagem de Alerta do Modal</label>
                              <textarea
                                value={trialModalMessage}
                                onChange={(e) => setTrialModalMessage(e.target.value)}
                                placeholder="Ex: Tem certeza de que deseja liberar o acesso grátis por 30 minutos?"
                                rows={2}
                                className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400 resize-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <div 
                              data-focus-label="Título do Modal de Teste Grátis"
                              className="spotlight-field rounded-xl"
                            >
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Título do Modal</label>
                              <input
                                type="text"
                                value={trialModalTitle}
                                onChange={(e) => setTrialModalTitle(e.target.value)}
                                placeholder="Ex: Acesso de Teste"
                                className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div 
                              data-focus-label="Texto do Botão Confirmar"
                              className="spotlight-field rounded-xl"
                            >
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Texto do Botão Confirmar</label>
                              <input
                                type="text"
                                value={trialModalConfirmText}
                                onChange={(e) => setTrialModalConfirmText(e.target.value)}
                                placeholder="Ex: Sim, Conectar"
                                className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div 
                              data-focus-label="Texto do Botão Cancelar"
                              className="spotlight-field rounded-xl"
                            >
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Texto do Botão Cancelar</label>
                              <input
                                type="text"
                                value={trialModalCancelText}
                                onChange={(e) => setTrialModalCancelText(e.target.value)}
                                placeholder="Ex: Não, Voltar"
                                className="w-full bg-[#0f1118] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#2a3148] outline-none focus:border-cyan-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD 4: Credenciais & Info Banner (Span 2) */}
                    <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2.5 lg:col-span-2">
                      <span className="text-base">🔐</span>
                      <p className="text-[11px] text-blue-300 font-sans leading-relaxed">
                        <strong>Credenciais MikroTik:</strong> O <strong>Nome de Usuário</strong> e a <strong>Senha</strong> são as credenciais obrigatórias de acesso à rede Hotspot e estão sempre ativos. Os campos abaixo são informações adicionais para enriquecer o cadastro e base de leads.
                      </p>
                    </div>

                    {/* FIELD CARDS IN 2 COLUMNS */}
                    
                    {/* Nome Completo */}
                    <div 
                      data-focus-section="Campo: Nome Completo"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">Nome Completo</span>
                        <span className="text-[10px] text-slate-400 font-mono">Solicita o nome completo do cliente</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('nameEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.nameEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.nameEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.nameEnabled}
                          onClick={() => handleFieldToggle('nameRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.nameEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.nameRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.nameRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp / Celular */}
                    <div 
                      data-focus-section="Campo: WhatsApp / Celular"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">WhatsApp / Celular</span>
                        <span className="text-[10px] text-slate-400 font-mono">Número para contato e envio de campanhas</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('phoneEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.phoneEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.phoneEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.phoneEnabled}
                          onClick={() => handleFieldToggle('phoneRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.phoneEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.phoneRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.phoneRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* E-mail */}
                    <div 
                      data-focus-section="Campo: E-mail"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">E-mail</span>
                        <span className="text-[10px] text-slate-400 font-mono">Solicita o endereço de e-mail do cliente</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('emailEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.emailEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.emailEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.emailEnabled}
                          onClick={() => handleFieldToggle('emailRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.emailEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.emailRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.emailRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* Data de Nascimento */}
                    <div 
                      data-focus-section="Campo: Data de Nascimento"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">Data de Nascimento</span>
                        <span className="text-[10px] text-slate-400 font-mono">Aniversário / Senha padrão de acesso</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('birthDateEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.birthDateEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.birthDateEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.birthDateEnabled}
                          onClick={() => handleFieldToggle('birthDateRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.birthDateEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.birthDateRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.birthDateRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* CPF */}
                    <div 
                      data-focus-section="Campo: CPF"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">CPF</span>
                        <span className="text-[10px] text-slate-400 font-mono">Solicita o documento CPF do cliente</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('cpfEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.cpfEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.cpfEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.cpfEnabled}
                          onClick={() => handleFieldToggle('cpfRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.cpfEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.cpfRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.cpfRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* Gênero */}
                    <div 
                      data-focus-section="Campo: Gênero"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">Gênero</span>
                        <span className="text-[10px] text-slate-400 font-mono">Dropdown Masculino / Feminino</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('genderEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.genderEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.genderEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.genderEnabled}
                          onClick={() => handleFieldToggle('genderRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.genderEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.genderRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.genderRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* Criar Senha */}
                    <div 
                      data-focus-section="Campo: Criar Senha"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">Criar Senha Própria</span>
                        <span className="text-[10px] text-slate-400 font-mono">Permite ao cliente definir sua senha</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('passwordEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.passwordEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.passwordEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.passwordEnabled}
                          onClick={() => handleFieldToggle('passwordRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.passwordEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.passwordRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.passwordRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* Campo Dinâmico (Livre) */}
                    <div 
                      data-focus-section="Campo: Personalizado"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] flex flex-col justify-between gap-3 shadow-sm spotlight-card"
                    >
                      <div>
                        <span className="block font-bold text-xs text-white uppercase tracking-wider">Campo Dinâmico (Livre)</span>
                        <span className="text-[10px] text-slate-400 font-mono">Pergunta aberta personalizada</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#23283c]">
                        <button 
                          type="button" 
                          onClick={() => handleFieldToggle('customFieldEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${fields.customFieldEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.customFieldEnabled ? '✓ Habilitado' : '✕ Desabilitado'}
                        </button>
                        <button 
                          type="button" 
                          disabled={!fields.customFieldEnabled}
                          onClick={() => handleFieldToggle('customFieldRequired')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all flex-1 ${!fields.customFieldEnabled ? 'opacity-40 cursor-not-allowed bg-[#0f1118] border-[#2d344d] text-slate-600' : fields.customFieldRequired ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.customFieldRequired ? 'Obrigatório' : 'Opcional'}
                        </button>
                      </div>
                      {fields.customFieldEnabled && (
                        <div 
                          data-focus-label="Rótulo da Pergunta Personalizada"
                          className="pt-2 border-t border-[#23283c] spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Rótulo / Pergunta:</label>
                          <input 
                            type="text" 
                            value={fields.customFieldLabel}
                            onChange={(e) => handleFieldLabelChange(e.target.value)}
                            placeholder="Ex: Qual curso deseja? ou Como nos conheceu?"
                            className="w-full bg-[#0f1118] text-emerald-400 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-[#2a3148] outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Aceite de Mensagens (Cursos/Ofertas) (Span 2) */}
                    <div 
                      data-focus-section="Aceite de Mensagens"
                      className="p-3.5 rounded-xl border border-[#262c42] bg-[#161a27] space-y-3 shadow-sm lg:col-span-2 spotlight-card"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-xs text-white uppercase tracking-wider">Aceite de Mensagens (Cursos/Ofertas)</span>
                          <span className="text-[10px] text-slate-400 font-mono">Checkbox de consentimento para envio de campanhas</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFieldToggle('optInCoursesEnabled')}
                          className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all ${fields.optInCoursesEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0f1118] border-[#2d344d] text-slate-400'}`}
                        >
                          {fields.optInCoursesEnabled ? '✓ Ativado' : '✕ Desativado'}
                        </button>
                      </div>

                      {fields.optInCoursesEnabled && (
                        <div 
                          data-focus-label="Texto de Consentimento (Opt-In)"
                          className="pt-2 border-t border-[#23283c] spotlight-field rounded-xl"
                        >
                          <label className="block text-[10px] font-mono text-slate-400 mb-1">Texto do Checkbox:</label>
                          <input 
                            type="text" 
                            value={fields.optInCoursesLabel}
                            onChange={(e) => setFields(prev => ({ ...prev, optInCoursesLabel: e.target.value }))}
                            placeholder="Ex: Eu aceito receber informações dos cursos"
                            className="w-full bg-[#0f1118] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#2a3148] outline-none"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: PUBLICIDADE / ANÚNCIOS */}
               {activeTab === 'ad' && (
                <div 
                  data-focus-section="Publicidade & Anúncios"
                  className="space-y-6 spotlight-group"
                >
                  <div 
                    data-focus-label="Tipo de Publicidade (Banner / Vídeo / Carrossel)"
                    className="spotlight-card p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                  >
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Tipo de Publicidade</label>
                    <select
                      value={ad.type}
                      onChange={(e) => setAd(prev => ({ ...prev, type: e.target.value }))}
                      className="retro-input w-full px-4 py-3 bg-slate-950 text-emerald-450 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                    >
                      <option className="bg-slate-900 text-slate-100" value="none">Sem Publicidade (Apenas Formulário)</option>
                      <option className="bg-slate-900 text-slate-100" value="image">Imagem Patrocinada (Banner Estático)</option>
                      <option className="bg-slate-900 text-slate-100" value="video">Vídeo Patrocinado (MP4 ou YouTube)</option>
                      <option className="bg-slate-900 text-slate-100" value="carousel">Carrossel de Imagens & Vídeos (Estilo Instagram)</option>
                    </select>

                    <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4 shadow-inner">
                      <div>
                        <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Manutenção da Pasta de Uploads</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Arquivos de mídias não utilizados são limpos automaticamente ao salvar. Você também pode forçar a limpeza manual aqui.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCleanUploads}
                        disabled={adUploadLoading}
                        className="retro-btn retro-btn-danger px-3 py-2 text-xs font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>🗑️ Limpar Pasta</span>
                      </button>
                    </div>
                  </div>

                  {ad.type === 'image' && (
                    <div className="space-y-4 border-t border-slate-800 pt-5 spotlight-card p-4 rounded-2xl bg-slate-900/60">
                      <div 
                        data-focus-label="Link da Imagem do Banner"
                        className="spotlight-field rounded-xl"
                      >
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Link da Imagem de Banner</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={ad.mediaUrl}
                            onChange={(e) => setAd(prev => ({ ...prev, mediaUrl: e.target.value }))}
                            placeholder="URL da Imagem ou faça o upload..."
                            className="retro-input w-full px-4 py-3 bg-slate-950 text-emerald-450 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                          />
                          <button 
                            type="button"
                            onClick={() => adInputRef.current?.click()}
                            disabled={adUploadLoading}
                            className="retro-btn retro-btn-dark px-4 text-xs uppercase tracking-wider shrink-0"
                          >
                            {adUploadLoading ? 'Enviando...' : 'Upload'}
                          </button>
                          <input 
                            type="file" 
                            ref={adInputRef} 
                            onChange={handleAdUpload} 
                            accept="image/*" 
                            className="hidden" 
                      />
                        </div>
                      </div>

                      <div 
                        data-focus-label="Link de Redirecionamento da Imagem"
                        className="spotlight-field rounded-xl"
                      >
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Link de Redirecionamento (Opcional)</label>
                        <input 
                          type="text" 
                          value={ad.targetUrl}
                          onChange={(e) => setAd(prev => ({ ...prev, targetUrl: e.target.value }))}
                          placeholder="https://sua-empresa.com.br"
                          className="retro-input w-full px-4 py-3 bg-slate-950 text-emerald-450 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                        />
                        <p className="text-xs text-slate-400 font-mono mt-1.5">
                          Quando o cliente clicar no banner de anúncio, ele será levado a este site.
                        </p>
                      </div>
                    </div>
                  )}

                  {ad.type === 'video' && (
                    <div className="space-y-4 border-t border-slate-800 pt-5 spotlight-card p-4 rounded-2xl bg-slate-900/60">
                      <div 
                        data-focus-label="URL do Vídeo Patrocinado"
                        className="spotlight-field rounded-xl"
                      >
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">URL do Vídeo</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={ad.mediaUrl}
                            onChange={(e) => setAd(prev => ({ ...prev, mediaUrl: e.target.value }))}
                            placeholder="Ex: link direto .mp4 ou faça o upload..."
                            className="retro-input w-full px-4 py-3 bg-slate-950 text-emerald-450 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                          />
                          <button 
                            type="button"
                            onClick={() => adVideoInputRef.current?.click()}
                            disabled={adUploadLoading}
                            className="retro-btn retro-btn-dark px-4 text-xs uppercase tracking-wider shrink-0"
                          >
                            {adUploadLoading ? 'Enviando...' : 'Upload'}
                          </button>
                          <input 
                            type="file" 
                            ref={adVideoInputRef} 
                            onChange={handleAdVideoUpload} 
                            accept="video/*" 
                            className="hidden" 
                          />
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1.5">
                          Suporta links diretos de vídeo (.mp4 hospedado), links públicos no YouTube ou upload direto de arquivos de vídeo.
                        </p>
                      </div>
                    </div>
                  )}

                  {ad.type === 'carousel' && (
                    <div className="space-y-6 border-t border-slate-800 pt-5 spotlight-card p-4 rounded-2xl bg-slate-900/60">
                      <span className="block font-black text-xs text-slate-200 uppercase tracking-widest">Mídias do Carrossel (Até 5 Mídias)</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map((slot) => {
                          const item = ad.items?.[slot - 1];
                          const hasMedia = item && item.url;
                          
                          return (
                            <div key={slot} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 shadow-inner spotlight-field">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-350 uppercase tracking-wider">Slot {slot} - {hasMedia ? (item.type === 'video' ? 'Vídeo' : 'Imagem') : 'Vazio'}</span>
                                {hasMedia && (
                                  <button
                                    type="button"
                                    onClick={() => handleSlotClear(slot)}
                                    className="text-[10px] text-red-550 hover:text-red-400 font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    Limpar Slot
                                  </button>
                                )}
                              </div>

                              {hasMedia ? (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                                  {item.type === 'video' ? (
                                    <video src={item.url} muted className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={item.url} alt={`Slot ${slot}`} className="w-full h-full object-cover" />
                                  )}
                                </div>
                              ) : (
                                <div 
                                  onClick={() => {
                                    const input = document.getElementById(`slot-uploader-${slot}`);
                                    input?.click();
                                  }}
                                  className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 cursor-pointer transition-all gap-1.5"
                                >
                                  <svg className="w-6 h-6 shrink-0 text-slate-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="text-[10px] font-black uppercase tracking-wider">Upload Imagem ou Vídeo</span>
                                  <input
                                    id={`slot-uploader-${slot}`}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={(e) => handleSlotAdUpload(e, slot)}
                                  />
                                </div>
                              )}

                              <div data-focus-label={`Link do Slot ${slot}`}>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Link de Redirecionamento (Opcional)</label>
                                <input
                                  type="text"
                                  value={item?.targetUrl || ''}
                                  onChange={(e) => handleSlotTargetUrlChange(slot, e.target.value)}
                                  placeholder="https://sua-empresa.com.br"
                                  className="retro-input w-full px-3 py-1.5 bg-slate-950 text-emerald-450 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Temporizador Config Card (Exposto para todos os tipos de anúncio ativos) */}
                  {ad.type !== 'none' && (
                    <div 
                      data-focus-section="Temporizador"
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-4 shadow-inner spotlight-card"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <span className="block font-black text-xs text-slate-200 uppercase tracking-wider">Temporizador de Visualização Obrigatória</span>
                          <span className="text-[10px] text-slate-450 font-mono">Força o cliente a visualizar a publicidade antes de liberar os botões de acesso.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={ad.timerEnabled}
                          onChange={(e) => setAd(prev => ({ ...prev, timerEnabled: e.target.checked }))}
                          className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {ad.timerEnabled && (
                        <div 
                          data-focus-label="Duração em Segundos do Anúncio"
                          className="pt-2 spotlight-field rounded-xl"
                        >
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Duração em Segundos (Ex: 5, 10 ou 15)</label>
                          <input
                            type="number"
                            onChange={(e) => setAd(prev => ({ ...prev, timerDuration: parseInt(e.target.value) || 5 }))}
                            className="retro-input w-full max-w-[200px] px-3 py-2 bg-slate-950 text-emerald-450 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REDE & FTP */}
              {activeTab === 'ftp' && (
                <div className="space-y-6">
                  <div className="bg-blue-950/20 border border-blue-900/30 text-blue-350 rounded-xl p-4 text-xs">
                    <span className="font-bold">Conexão por FTP no MikroTik</span>
                    <p className="mt-1 text-xs text-blue-400 font-mono leading-relaxed">
                      Diferente da API MikroTik padrão (que corrompe arquivos de imagens binárias como logos e fotos), o deploy por FTP preserva os arquivos. 
                      Para funcionar, certifique-se de liberar o serviço FTP (Porta 21 por padrão) no seu roteador em <code className="bg-blue-950/50 px-1 py-0.5 rounded font-bold font-mono">IP &gt; Services</code>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Porta FTP do MikroTik</label>
                      <input 
                        type="number" 
                        value={ftpPort}
                        onChange={(e) => setFtpPort(e.target.value)}
                        placeholder="21"
                        className="retro-input w-full px-4 py-3 bg-slate-950 text-emerald-450 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Endereço de Acesso (API/Cadastro)</label>
                      <input 
                        type="text" 
                        value={systemUrl}
                        onChange={(e) => setSystemUrl(e.target.value)}
                        placeholder="Ex: http://192.168.88.254"
                        className="retro-input w-full px-4 py-3 bg-slate-950 text-emerald-450 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-450 font-mono mt-1">
                        IP local do seu servidor Node.js que o botão de cadastro vai buscar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-4">
              <button 
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="retro-btn retro-btn-dark flex-1 py-3.5 uppercase tracking-wider text-xs"
              >
                {saving ? 'Salvando...' : '💾 Apenas Salvar Rascunho'}
              </button>

              <button 
                type="button"
                onClick={handleSaveAndDeploy}
                disabled={deploying}
                className="retro-btn retro-btn-primary flex-1 py-3.5 uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                {deploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sincronizando via FTP...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Salvar e Enviar p/ MikroTik
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Real-time Phone Preview Simulator (Right - 5 Columns) */}
          <div 
            className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-6 lg:self-start z-20"
            style={{ position: 'sticky', top: '1.5rem', alignSelf: 'flex-start' }}
          >
            
            {/* Viewport & Screen Selectors */}
            <div className="flex flex-col items-center gap-2 mb-4 w-full">
              {/* Screen Selector */}
              <div className="flex bg-[#0a0a18]/40 p-1.5 rounded-xl border border-[#252542] gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <button 
                  onClick={() => setPreviewScreen('login')}
                  type="button"
                  className={`retro-btn text-xs py-1.5 px-3 ${
                    previewScreen === 'login' ? 'retro-btn-primary' : 'retro-btn-dark'
                  }`}
                >
                  📱 Portal Login (Hotspot)
                </button>
                <button 
                  onClick={() => setPreviewScreen('register')}
                  type="button"
                  className={`retro-btn text-xs py-1.5 px-3 ${
                    previewScreen === 'register' ? 'retro-btn-primary' : 'retro-btn-dark'
                  }`}
                >
                  📋 Formulário de Cadastro
                </button>
              </div>

              {/* Viewport Device Mode */}
              <div className="flex bg-[#0a0a18]/30 p-1 rounded-lg border border-[#1e1e38] gap-1">
                <button
                  type="button"
                  onClick={() => setViewportMode('mobile')}
                  className={`text-[11px] font-bold py-1 px-2.5 rounded-md transition-all ${
                    viewportMode === 'mobile'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📱 Mobile (340px)
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('tablet')}
                  className={`text-[11px] font-bold py-1 px-2.5 rounded-md transition-all ${
                    viewportMode === 'tablet'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📲 Tablet (420px)
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('desktop')}
                  className={`text-[11px] font-bold py-1 px-2.5 rounded-md transition-all ${
                    viewportMode === 'desktop'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💻 Desktop (480px)
                </button>
              </div>
            </div>

            {/* Simulated Phone / Tablet Shell */}
            <div 
              className={`transition-all duration-300 ${
                viewportMode === 'desktop' ? 'w-[480px] max-w-full' : viewportMode === 'tablet' ? 'w-[420px] max-w-full' : 'w-[340px]'
              } h-[620px] bg-slate-950 rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 overflow-hidden relative ring-4 ring-[#3d3d6b] flex flex-col`}
            >
              
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-2xl w-36 mx-auto z-40 pointer-events-none"></div>

              {/* Captive Portal Top Bar Header (Matches Screenshot) */}
              <div className="bg-slate-900 border-b border-slate-800 pt-5 pb-2.5 px-4 text-white flex items-center justify-between z-30 relative select-none shrink-0 shadow-md">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[13px] font-semibold text-slate-100 truncate tracking-tight">Fazer login em MikroTik-5B1808</div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">hotspot.wifi.local</div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
              </div>
              
              {/* Real Live Preview Iframe */}
              <iframe
                key={`${previewScreen}-${template}`}
                id="preview-iframe"
                src={previewScreen === 'register' ? `/portal/register?template=${template}&preview=1` : `/api/portal/preview?template=${template}&screen=login`}
                onLoad={broadcastLivePreview}
                className="w-full flex-1 border-none relative z-20 bg-transparent"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />

            </div>
          </div>
        </div>
      )
    ) : activeHubTab === 'leads' ? (
        /* Leads Panel */
        leadsLoading ? (
          <div className="flex h-[50vh] items-center justify-center bg-slate-950 rounded-3xl border border-slate-850 p-8 shadow-inner">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="text-slate-400 text-xs font-mono animate-pulse">CARREGANDO BASE DE DADOS...</p>
            </div>
          </div>
        ) : leadsError || !leadsData ? (
          <div className="bg-red-955/20 text-red-400 p-6 rounded-2xl border border-red-900/30 shadow-sm text-xs font-mono font-bold flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold text-red-200">FALHA DE COMUNICAÇÃO</p>
              <p className="text-[10px] text-red-400/80 mt-1">{leadsError || 'Erro ao carregar dados dos leads'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Cards stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="retro-card p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="rack-screw" />
                <div className="absolute top-2 right-2 rack-screw" />
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 z-10">Total de Cadastros</h3>
                <div className="retro-display bg-black border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-3xl font-black text-emerald-500 tracking-tight">{leadsData.total}</span>
                  <span className="text-[10px] text-emerald-700/60 uppercase font-mono tracking-widest">REG</span>
                </div>
              </div>

              <div className="retro-card p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="rack-screw" />
                <div className="absolute top-2 right-2 rack-screw" />
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 z-10">Cadastros Hoje</h3>
                <div className="retro-display bg-black border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-3xl font-black text-amber-500 tracking-tight">{leadsData.today}</span>
                  <span className="text-[10px] text-amber-700/60 uppercase font-mono tracking-widest">NEW</span>
                </div>
              </div>

              <div className="retro-card p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="rack-screw" />
                <div className="absolute top-2 right-2 rack-screw" />
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 z-10">Média de Idade</h3>
                <div className="retro-display bg-black border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-3xl font-black text-cyan-400 tracking-tight">{leadsData.averageAge}</span>
                  <span className="text-[10px] text-cyan-600/60 uppercase font-mono tracking-widest">ANOS</span>
                </div>
              </div>
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="retro-card p-6 flex flex-col relative">
                <div className="rack-screw" />
                <div className="absolute top-2 right-2 rack-screw" />
                <h3 className="text-slate-200 text-xs font-black uppercase tracking-widest mb-6">Cadastros por Mês (Últimos 6)</h3>
                <div className="h-[250px] w-full">
                  {leadsMounted && leadsData.barChart && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <BarChart data={leadsData.barChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold', fontFamily: 'var(--font-mono-retro)'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold', fontFamily: 'var(--font-mono-retro)'}} />
                        <Tooltip 
                          cursor={{fill: '#020617', opacity: 0.4}}
                          contentStyle={{borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#020617', color: '#10b981', fontSize: 11, fontFamily: 'var(--font-mono-retro)'}}
                        />
                        <Bar dataKey="cadastros" fill="#10b981" radius={[6, 6, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="retro-card p-6 flex flex-col relative">
                <div className="rack-screw" />
                <div className="absolute top-2 right-2 rack-screw" />
                <h3 className="text-slate-200 text-xs font-black uppercase tracking-widest mb-6">Distribuição Etária</h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                  {leadsMounted && leadsData.donutChart && leadsData.donutChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={leadsData.donutChart}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={false}
                        >
                          {leadsData.donutChart.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={LEADS_COLORS[index % LEADS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#020617', color: '#10b981', fontSize: 11, fontFamily: 'var(--font-mono-retro)'}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-500 text-xs font-mono italic">Dados de idade insuficientes.</p>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {leadsData.donutChart && leadsData.donutChart.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LEADS_COLORS[index % LEADS_COLORS.length] }}></div>
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Recent Table - Premium Refactored */}
            <div className="retro-card p-0 overflow-hidden relative">
              <div className="rack-screw" />
              <div className="absolute top-2 right-2 rack-screw" />

              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-slate-100 font-black text-sm uppercase tracking-widest">Cadastros Recentes</h3>
                      <span className="retro-badge retro-badge-blue">
                        {leadsData.recentLeads.length} registros
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Usuários capturados pelo portal captivo do hotspot</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={exportLeadsToCSV}
                    className="retro-btn retro-btn-success text-[10px] px-3.5 py-2 uppercase tracking-wider"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={exportLeadsToPDF}
                    className="retro-btn retro-btn-dark text-[10px] px-3.5 py-2 uppercase tracking-wider"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    PDF
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="retro-table-wrap">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850">
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Usuário</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">WhatsApp</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">E-mail</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">CPF</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Gênero</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Nascimento</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Senha</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Campo Extra</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Cadastrado</th>
                      <th className="px-5 py-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/40">
                    {leadsData.recentLeads.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center">
                              <svg className="w-7 h-7 text-slate-555" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nenhum cadastro encontrado</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Os leads do portal captivo aparecerão aqui</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      leadsData.recentLeads.map((lead: any, idx: number) => {
                        const initials = (lead.name || '?').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
                        const avatarColors = [
                          'from-blue-500 to-indigo-600',
                          'from-emerald-500 to-teal-600',
                          'from-amber-500 to-orange-600',
                          'from-rose-500 to-pink-600',
                          'from-cyan-500 to-blue-600',
                          'from-violet-500 to-purple-600',
                        ];
                        const avatarColor = avatarColors[idx % avatarColors.length];
                        const genderLabel = lead.gender === 'M' || lead.gender === 'Masculino' ? '♂ Masc.'
                          : lead.gender === 'F' || lead.gender === 'Feminino' ? '♀ Fem.'
                          : lead.gender || null;
                        const genderClass = lead.gender === 'M' || lead.gender === 'Masculino'
                          ? 'bg-blue-950/40 text-blue-400 border-blue-900/60'
                          : lead.gender === 'F' || lead.gender === 'Feminino'
                          ? 'bg-pink-950/40 text-pink-400 border-pink-900/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800';

                        return (
                          <tr key={lead.id} className="hover:bg-slate-950/40 border-b border-slate-900 transition-colors group">

                            {/* Name + Avatar */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-[11px] font-black shadow-sm shrink-0`}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-[12px] font-extrabold text-slate-200 leading-none">{lead.name}</p>
                                  {lead.customFieldValue && (
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[120px]">{lead.customFieldValue}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* WhatsApp */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] text-emerald-400">{lead.phone}</span>
                                <a
                                  href={`https://wa.me/55${lead.phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Abrir no WhatsApp"
                                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-950/50 text-emerald-500 border border-emerald-900/30 hover:bg-emerald-900/30 hover:text-emerald-400 transition-colors shrink-0"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.799-4.394 9.802-9.799.002-2.618-1.01-5.078-2.854-6.924C16.379 2.036 13.916 1.01 11.299 1.01c-5.405 0-9.801 4.393-9.806 9.799-.001 1.792.482 3.548 1.397 5.106L1.879 20.884l5.127-1.345c.001 0 .001 0 0 0zM17.483 14.39c-.33-.165-1.951-.963-2.282-1.082-.33-.12-.57-.18-.81.18-.24.36-.93 1.162-1.14 1.392-.21.23-.42.258-.75.093-1.096-.547-1.847-.98-2.585-2.242-.19-.324.19-.301.545-1.01.095-.19.047-.356-.023-.522-.069-.165-.57-1.374-.781-1.884-.206-.497-.417-.43-.571-.437-.147-.006-.316-.007-.486-.007-.17 0-.447.064-.68.314-.233.249-.89.87-.89 2.122 0 1.25.908 2.459 1.034 2.628.127.17 1.785 2.726 4.325 3.824.604.261 1.076.417 1.443.535.607.192 1.16.165 1.597.1.488-.072 1.951-.798 2.225-1.53.275-.73.275-1.355.193-1.487-.083-.13-.303-.21-.633-.375z"/>
                                  </svg>
                                </a>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-5 py-3.5">
                              {lead.email ? (
                                <span className="text-[11px] text-slate-350 font-mono truncate max-w-[140px] block">{lead.email}</span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">—</span>
                              )}
                            </td>

                            {/* CPF */}
                            <td className="px-5 py-3.5">
                              {lead.cpf ? (
                                <span className="font-mono text-[11px] text-emerald-450 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                  {lead.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">—</span>
                              )}
                            </td>

                            {/* Gender */}
                            <td className="px-5 py-3.5">
                              {genderLabel ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono font-extrabold uppercase tracking-wide ${genderClass}`}>
                                  {genderLabel}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">—</span>
                              )}
                            </td>

                            {/* Birth Date */}
                            <td className="px-5 py-3.5">
                              {lead.birthDate ? (
                                <span className="text-[11px] text-slate-350 font-mono whitespace-nowrap">
                                  {new Date(lead.birthDate).toLocaleDateString('pt-BR')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">—</span>
                              )}
                            </td>

                            {/* Password */}
                            <td className="px-5 py-3.5">
                              {lead.password ? (
                                <span className="font-mono text-[11px] text-cyan-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg tracking-wider">
                                  {lead.password}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">—</span>
                              )}
                            </td>

                            {/* Custom Field */}
                            <td className="px-5 py-3.5">
                              {lead.customFieldValue ? (
                                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[120px] block" title={lead.customFieldValue}>
                                  {lead.customFieldValue}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">—</span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-[11px] text-slate-300 font-mono">
                                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </td>

                            {/* Delete Action */}
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                disabled={deletingLeadId === lead.id}
                                title="Remover cadastro"
                                className="retro-btn retro-btn-danger w-8 h-8 inline-flex items-center justify-center rounded-xl disabled:opacity-40 cursor-pointer"
                              >
                                {deletingLeadId === lead.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              {leadsData.recentLeads.length > 0 && (
                <div className="px-6 py-3.5 border-t border-slate-850 bg-slate-950 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    Total: {leadsData.recentLeads.length} cadastro{leadsData.recentLeads.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Atualizado em {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* Provisioning Panel */
        provNotConnected ? (
          <RouterOffline title="Provisionamento Inteligente" description="Configure o Hotspot completo com um clique" />
        ) : provStage !== 'select' ? (
          <div className="space-y-8 animate-fade-in">
            <div className="retro-card p-6 max-w-2xl mx-auto relative">
              <div className="rack-screw" />
              <div className="absolute top-2 right-2 rack-screw" />

              <header className="mb-6 pb-4 border-b border-slate-850">
                <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest">Status do Provisionamento</h2>
                <p className="text-[10px] font-mono text-slate-450 mt-1">
                  LAN/Bridge: <span className="font-extrabold text-blue-400">{provSelectedWan?.name}</span>
                  {provSelectedWan?.configuredIp && <span className="text-slate-500 ml-1">({provSelectedWan.configuredIp})</span>}
                  <span className="mx-2 text-slate-700">|</span>
                  Gateway: <span className="font-extrabold text-emerald-400">{provSuggestedGateway}</span>
                </p>
              </header>

              {provStage === 'reconnecting' && (
                <div className="mb-6 bg-amber-955/20 border border-amber-900/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-slide-up">
                  <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-250 text-sm">Sincronizando com o MikroTik...</p>
                    <p className="text-amber-400 text-xs font-mono mt-1">{provReconnectStatus}</p>
                    <div className="mt-3.5 flex gap-1">
                      {Array.from({ length: Math.min(provReconnectAttempts, 30) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] led-yellow" />
                      ))}
                      {Array.from({ length: Math.max(0, 30 - provReconnectAttempts) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-950" />
                      ))}
                    </div>
                    <p className="text-[10px] text-amber-400 font-mono mt-2.5">Aplicando configurações e confirmando o acesso em <code className="bg-slate-950 border border-slate-850 px-1 py-0.5 rounded font-mono font-bold text-emerald-400">{provReconnectIp}</code>...</p>
                  </div>
                </div>
              )}

              {(provStage === 'running' || provStage === 'reconnecting' || !provIsAlreadyProvisioned) && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden mb-6">
                  <div className="p-4 border-b border-slate-850 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-350 text-xs uppercase tracking-wider">
                        {provStage === 'running'       ? 'Configurando MikroTik...' :
                         provStage === 'reconnecting'  ? 'Aguardando reconexão...' :
                         provStage === 'done'          ? '✅ Provisionamento Completo' :
                                                         '⚠️ Erro no Provisionamento'}
                      </h3>
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wide mt-1">
                        {provSteps.filter(s => s.status === 'success').length} de {provSteps.length} etapas concluídas
                      </p>
                    </div>
                    {(provStage === 'running' || provStage === 'reconnecting') && (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {provSteps.map(s => (
                      <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-850">
                        {/* Icon */}
                        {s.status === 'running' && <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />}
                        {s.status === 'success' && <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.3)]">✓</div>}
                        {s.status === 'failed' && <div className="w-5 h-5 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-red-400 text-[10px] font-bold shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.3)]">✗</div>}
                        {s.status === 'skipped' && <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-[9px] shrink-0">→</div>}
                        {s.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-800 bg-slate-950 shrink-0" />}
                        <div>
                          <p className="text-xs font-black text-slate-200">{s.label}</p>
                          {s.message && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.message}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {provStage === 'done' && provSummary && (
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-sm space-y-6 relative">
                  {provIsAlreadyProvisioned ? (
                    <div className="text-center">
                      <div className="text-4xl mb-3 animate-bounce">{provHasFailures ? '⚠️' : '🛡️'}</div>
                      <h3 className={`font-black text-sm uppercase tracking-widest ${provHasFailures ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {provHasFailures ? 'Configurações Incompletas Detectadas' : 'MikroTik Conectado & Operacional'}
                      </h3>
                      <div className="mt-2.5">
                        <span className={`retro-badge ${provHasFailures ? 'retro-badge-amber' : 'retro-badge-green'}`}>
                          {provHasFailures ? 'Integridade Parcial' : 'Assinatura MikroGestor Ativa'}
                        </span>
                      </div>
                      <p className={`text-[11px] font-mono mt-3.5 max-w-md mx-auto leading-relaxed ${provHasFailures ? 'text-amber-500/80' : 'text-emerald-500/80'}`}>
                        {provHasFailures 
                          ? 'O provisionamento foi concluído anteriormente, mas algumas regras críticas de firewall ou acesso foram desativadas externamente.'
                          : 'O provisionamento inteligente deste roteador está totalmente ativado. O hotspot está pronto para autenticar e cadastrar novos usuários de forma automatizada.'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <h3 className="font-black text-emerald-400 uppercase tracking-widest text-sm">Hotspot Provisionado!</h3>
                      <p className="text-emerald-500/85 text-[11px] font-mono mt-1">O roteador foi configurado e as regras aplicadas com sucesso.</p>
                    </div>
                  )}

                  {provIsAlreadyProvisioned && provHasFailures && provAudit && (
                    <div className="bg-amber-955/20 border border-amber-900/30 rounded-xl p-4 text-left shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">⚠️</span>
                        <div className="flex-1">
                          <h4 className="font-black text-amber-400 text-[10px] uppercase tracking-wider">Erros Detectados no MikroTik</h4>
                          <p className="text-amber-500/80 text-[10px] font-mono mt-1 leading-relaxed">
                            Identificamos pendências críticas na integridade da rede. Clique em corrigir para restabelecer os serviços de hotspot:
                          </p>
                          <ul className="mt-3.5 space-y-2 border-t border-amber-900/40 pt-3">
                            {Object.entries(provAudit)
                              .filter(([_, item]: any) => item.status === 'failed')
                              .map(([key, item]: any) => (
                                <li key={key} className="text-xs">
                                  <div className="flex items-start gap-2 font-bold text-orange-400">
                                    <span className="text-orange-500 shrink-0 mt-0.5">✗</span>
                                    <span className="flex-1 text-[11px] font-mono">{item.message}</span>
                                  </div>
                                  {key === 'apiProtected' && (
                                    <div className="mt-2 ml-4">
                                      {provFixApiRuleMsg ? (
                                        <p className="text-[11px] font-black text-emerald-400">{provFixApiRuleMsg}</p>
                                      ) : (
                                        <button
                                          onClick={handleFixApiRule}
                                          disabled={provFixingApiRule}
                                          className="retro-btn retro-btn-primary text-[10px] px-3.5 py-2 uppercase tracking-wider"
                                        >
                                          {provFixingApiRule ? 'Corrigindo...' : '🔧 Corrigir API Firewall'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(provSummary).map(([label, value]: any) => {
                      let prettyLabel = label;
                      if (label === 'wanInterface') prettyLabel = 'Interface WAN';
                      if (label === 'lanBridge') prettyLabel = 'Bridge LAN';
                      if (label === 'gatewayIp') prettyLabel = 'IP do Gateway';
                      if (label === 'dnsPortal') prettyLabel = 'Redirecionamento DNS';
                      if (label === 'hotspotServer') prettyLabel = 'Servidor Hotspot';
                      if (label === 'network') prettyLabel = 'Rede (Subrede)';
                      if (label === 'poolRanges') prettyLabel = 'Range do Pool';

                      return (
                        <div key={label} className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 shadow-inner">
                          <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">{prettyLabel}</p>
                          <p className="font-extrabold text-emerald-400 font-mono text-xs mt-1 break-all">{value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {!provIsAlreadyProvisioned && (
                    provAdminIp ? (
                      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-inner">
                        <span className="text-lg shrink-0 text-emerald-400">🔒</span>
                        <div>
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Administrador Liberado</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">IP <code className="font-mono bg-slate-955 border border-slate-850 px-1 py-0.5 rounded text-emerald-400 font-bold">{provAdminIp}</code> adicionado como <strong className="text-slate-350">bypassed</strong> no Hotspot.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-inner">
                        <span className="text-lg shrink-0 text-amber-400">⚠️</span>
                        <p className="text-[11px] text-amber-500 font-mono leading-relaxed">Adicione seu IP de gerenciamento manualmente em <strong className="text-slate-350">IP → Hotspot → IP Bindings</strong> como <code className="bg-slate-955 border border-slate-850 px-1 rounded text-amber-400 font-bold">bypassed</code> para evitar telas de login.</p>
                      </div>
                    )
                  )}

                  <div className="flex gap-4">
                    <Link href="/dashboard/users?tab=batch" className="flex-1 text-center retro-btn retro-btn-primary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center">
                      Gerar Vouchers em Lote →
                    </Link>
                    {provHasFailures ? (
                      <button
                        onClick={() => handleProvision(provDetectedWan, provDetectedGateway)}
                        className="flex-1 retro-btn retro-btn-amber py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>⚠️ Reparar Configurações</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleResetProvision} 
                        className="flex-1 retro-btn retro-btn-dark py-3.5 text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Novo Provisionamento
                      </button>
                    )}
                  </div>
                </div>
              )}

              {provStage === 'done' && provHotspotDiag && (
                <div className="mt-4 bg-slate-955 border border-amber-500/30 rounded-2xl p-5 shadow-inner space-y-4 relative">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">📦</span>
                    <div>
                      <p className="font-extrabold text-amber-400 text-sm">Instalação pendente: Pacote Hotspot</p>
                      <p className="text-slate-400 text-xs font-mono mt-1 leading-relaxed">Bridge, DHCP e NAT estão configurados. Mas o RouterOS precisa do pacote adicional "hotspot" ativado.</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 text-xs font-semibold font-mono">
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider mb-1">RouterOS Versão</p>
                        <p className="font-mono text-slate-250">{provHotspotDiag.version}</p>
                      </div>
                      {provHotspotDiag.installedPackages?.length > 0 && (
                        <div className="flex-1">
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider mb-1">Pacotes instalados</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provHotspotDiag.installedPackages.map((pkg: string) => (
                              <span key={pkg} className="bg-slate-955 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono text-[10px]">{pkg}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Como ativar o Hotspot no Mikrotik:</p>
                    <ol className="space-y-2">
                      {['Abra o Winbox e conecte ao roteador','Acesse System → Packages','Clique em Check for Updates e faça update se necessário','Instale ou habilite o pacote "hotspot"','Reinicie: System → Reboot','Volte aqui e execute o Provisionamento novamente'].map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-400 font-mono">
                          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                          <span className="flex-1 mt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {provHotspotDiag.probeError && (
                    <p className="text-amber-500/70 text-[9px] font-mono italic">Detalhe Técnico: {provHotspotDiag.probeError}</p>
                  )}
                </div>
              )}

              {provStage === 'error' && (
                <div className="bg-slate-955 border border-red-500/30 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto shadow-inner animate-slide-up">
                  <div className="text-3xl">⚠️</div>
                  <h3 className="font-black text-red-400 uppercase tracking-widest text-sm">Falha no Provisionamento</h3>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed break-words">{provErrorMsg}</p>
                  <p className="text-[10px] text-slate-500 font-mono font-extrabold uppercase">As etapas ✓ já executadas permanecem aplicadas no roteador.</p>
                  <button 
                    onClick={handleResetProvision} 
                    className="retro-btn retro-btn-danger text-xs px-6 py-2.5 uppercase tracking-wider cursor-pointer"
                  >
                    Voltar e Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '1️⃣', title: 'Escolha a LAN', text: 'Selecione a Bridge dos clientes' },
                { icon: '2️⃣', title: 'Hotspot Ativo', text: 'Pool, DHCP e Hotspot criados' },
                { icon: '3️⃣', title: 'Reconexão Smart', text: 'Sem reinicializar ou quedas' },
                { icon: '4️⃣', title: 'Pronto!', text: 'Vouchers disponíveis' },
              ].map((item, i) => (
                <div key={i} className="retro-card p-4 text-center relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-850 absolute top-1.5 left-1.5" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-850 absolute top-1.5 right-1.5" />
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="font-extrabold text-slate-200 text-xs tracking-wide">{item.title}</p>
                  <p className="text-slate-450 text-[10px] font-mono mt-1 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>

            {provFetchError && (
              <div className="p-4 bg-slate-955 border border-red-500/30 text-red-400 rounded-2xl text-xs font-mono shadow-inner">
                {provFetchError}
              </div>
            )}

            {/* Interface List */}
            <div className="retro-card p-0 overflow-hidden relative">
              <div className="rack-screw" />
              <div className="absolute top-2 right-2 rack-screw" />

              <div className="p-6 border-b border-slate-850 bg-slate-900/40">
                <h3 className="text-slate-200 font-black text-sm uppercase tracking-widest">Selecione a Interface/Bridge LAN</h3>
                <p className="text-xs text-slate-450 font-mono mt-1">Selecione a bridge principal (ex: <code className="bg-slate-955 border border-slate-850 px-1 rounded font-bold text-emerald-400">bridge</code>) ou a interface física onde os clientes conectam.</p>
              </div>

              <div className="divide-y divide-slate-850 bg-slate-900/10">
                {provLoading ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse font-mono">Carregando interfaces do roteador...</p>
                  </div>
                ) : provInterfaces.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">Nenhuma interface disponível para configuração.</div>
                ) : (
                  provInterfaces.map(i => {
                    const selectable = !i.disabled;
                    const isSelected = provSelectedWan?.name === i.name;
                    return (
                      <button
                        key={i.name}
                        onClick={() => selectable ? setProvSelectedWan(i) : undefined}
                        disabled={!selectable}
                        className={`w-full flex items-center justify-between p-5 text-left transition-all border-b border-slate-850 last:border-0 ${
                          isSelected 
                            ? 'bg-slate-955/40 shadow-inner' 
                            : 'hover:bg-slate-850/30'
                        } ${!selectable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="text-xl">{i.isBridge ? '🌉' : '🔌'}</span>
                          <div>
                            <p className="font-extrabold text-slate-200 text-sm tracking-wide">{i.name}</p>
                            <p className="text-xs text-slate-450 font-mono mt-0.5">
                              Tipo: {i.type} {i.configuredIp && (
                                <>
                                  {' '}| IP: <code className="bg-slate-955 px-1 rounded text-emerald-400 font-bold">{i.configuredIp}</code>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-[0_0_8px_rgba(16,185,129,0.15)]">✓ Selecionada</span>
                        ) : selectable ? (
                          <span className="retro-btn retro-btn-dark text-[10px] px-3.5 py-1.5 uppercase tracking-wider">Escolher</span>
                        ) : (
                          <span className="text-slate-500 text-[10px] font-mono font-extrabold uppercase tracking-wider">Desativada</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Painel de Confirmação */}
            {provSelectedWan && (
              <div className="retro-card p-6 relative max-w-2xl mx-auto border-t border-slate-800 animate-slide-up">
                <div className="rack-screw" />
                <div className="absolute top-2 right-2 rack-screw" />

                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Revisão do Provisionamento</h3>
                    <p className="text-slate-455 text-xs font-mono mt-1">O MikroGestor aplicará as seguintes configurações:</p>
                  </div>
                  <button onClick={() => setProvSelectedWan(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg retro-btn-dark w-7 h-7 flex items-center justify-center rounded-lg shadow-inner">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs font-semibold">
                  {[
                    ['Interface/Bridge LAN', provSelectedWan.name, provSelectedWan.configuredIp || 'Nenhum IP Prévio'],
                    ['Tipo de Interface', provSelectedWan.isBridge ? 'Bridge (Recomendado)' : 'Interface Física', provSelectedWan.type],
                    ['Gateway IP', provSuggestedGateway, 'IP de acesso da rede do hotspot'],
                    ['Pool de Clientes', `${provSuggestedGateway.split('.').slice(0, 3).join('.')}.10-254`, '245 endereços para clientes'],
                  ].map(([label, val, sub]) => (
                    <div key={label} className="bg-slate-955 border border-slate-850 rounded-xl p-3.5 shadow-inner">
                      <p className="text-slate-500 text-[9px] font-mono font-black uppercase tracking-wider">{label}</p>
                      <p className="font-extrabold text-emerald-400 font-mono text-sm mt-1">{val}</p>
                      {sub && <p className="text-slate-450 text-[10px] font-mono mt-1 leading-snug">{sub}</p>}
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 mb-6">
                  <div className="bg-slate-900 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                    <span className="text-lg shrink-0">ℹ️</span>
                    <p className="text-blue-400/80 text-[11px] font-mono leading-relaxed">O hotspot será ativado na interface <strong>{provSelectedWan.name}</strong>. Se ela já tiver um IP ativo (ex: {provSelectedWan.configuredIp || provSuggestedGateway}), o MikroGestor irá preservá-lo para evitar interrupções de conexão no roteador.</p>
                  </div>

                  <div className="bg-slate-900 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                    <span className="text-lg shrink-0">🔒</span>
                    <p className="text-blue-400/80 text-[11px] font-mono leading-relaxed">Seu IP administrativo atual será detectado e adicionado automaticamente na lista de **IP Bindings** como **Bypassed** (liberado sem tela de login).</p>
                  </div>
                </div>

                <button
                  onClick={() => handleProvision()}
                  className="w-full retro-btn retro-btn-primary py-4 text-xs tracking-widest uppercase cursor-pointer"
                >
                  ⚡ Iniciar Provisionamento Inteligente
                </button>
              </div>
            )}
          </div>
        )
      )}
      {/* Deploy Result Toast */}
      {deployModal && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`relative w-80 bg-slate-900 border ${deployModal.type === 'success' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]'} rounded-xl p-4 flex items-start gap-4`}>
            
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${deployModal.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {deployModal.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>

            <div className="flex-1 pt-0.5">
              <h3 className={`text-sm font-bold mb-1 ${deployModal.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deployModal.type === 'success' ? 'Sucesso!' : 'Atenção!'}
              </h3>
              <p className="text-slate-300 text-xs font-medium leading-relaxed">
                {deployModal.message}
              </p>
            </div>

            <button
              onClick={() => setDeployModal(null)}
              className="shrink-0 text-slate-500 hover:text-white transition-colors p-1 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
