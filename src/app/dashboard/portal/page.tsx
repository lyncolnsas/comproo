"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from '@/hooks/useHistory';
import StudioTopBar from '@/components/portal/studio/StudioTopBar';
import StudioNavRail, { StudioTab } from '@/components/portal/studio/StudioNavRail';
import StudioCanvas from '@/components/portal/studio/StudioCanvas';
import BrandingStudioPanel from '@/components/portal/studio/panels/BrandingStudioPanel';
import HotspotAuthStudioPanel from '@/components/portal/studio/panels/HotspotAuthStudioPanel';
import LeadsFieldsStudioPanel from '@/components/portal/studio/panels/LeadsFieldsStudioPanel';
import AdsStudioPanel from '@/components/portal/studio/panels/AdsStudioPanel';
import WalledGardenStudioPanel from '@/components/portal/studio/panels/WalledGardenStudioPanel';
import CssProStudioPanel from '@/components/portal/studio/panels/CssProStudioPanel';
import ProvisioningStudioPanel from '@/components/portal/studio/panels/ProvisioningStudioPanel';
import DeployStudioModal from '@/components/portal/studio/panels/DeployStudioModal';
import { BrandConfig } from '@/components/portal/DynamicLogoEditor';
import { FieldsConfig } from '@/components/portal/RegistrationInspector';

interface Colors {
  brand: string;
  brandDark: string;
  bg: string;
  ink: string;
  muted: string;
  blue: string;
  green: string;
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
  glassOpacity: number;
  glassBlur: number;
}

const COLOR_PRESETS = [
  {
    name: '🎓 FAP • Educação',
    icon: '🎓',
    desc: 'Identidade oficial FAP com azul marinho, dourado e logo A animado',
    colors: {
      brand: '#002B49',
      brandDark: '#001726',
      bg: '#001726',
      ink: '#ffffff',
      muted: '#94a3b8',
      blue: '#F39200',
      loginButtonText: '#ffffff',
      green: '#F39200',
      registerButtonText: '#ffffff',
      trialButtonBg: '#F39200',
      trialButtonText: '#001726',
      cardBg: '#002B49',
      cardBorder: '#F39200',
      inputBg: '#001726',
      inputText: '#ffffff',
      inputBorder: '#003a63',
      inputPlaceholder: '#94a3b8',
      glassOpacity: 90,
      glassBlur: 14
    }
  },
  {
    name: 'Cyber Electric',
    icon: '⚡',
    desc: 'Visual futurista escuro com ciano e azul elétrico',
    colors: {
      brand: '#0284c7',
      brandDark: '#0369a1',
      bg: '#090a0f',
      ink: '#f8fafc',
      muted: '#94a3b8',
      blue: '#0284c7',
      loginButtonText: '#ffffff',
      green: '#06b6d4',
      registerButtonText: '#090a0f',
      trialButtonBg: '#0ea5e9',
      trialButtonText: '#ffffff',
      cardBg: '#12131f',
      cardBorder: '#0284c7',
      inputBg: '#18192b',
      inputText: '#f8fafc',
      inputBorder: '#1e293b',
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
    name: 'FAP • Educação Adventista',
    icon: '🎓',
    desc: 'Visual acadêmico com azul marinho, dourado e logo animado em vetor',
    colors: {
      brand: '#002B49',
      brandDark: '#001726',
      bg: '#001726',
      ink: '#002B49',
      muted: '#4b5563',
      blue: '#F39200',
      loginButtonText: '#001726',
      green: '#002B49',
      registerButtonText: '#ffffff',
      trialButtonBg: '#10b981',
      trialButtonText: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '#F39200',
      inputBg: '#fafafa',
      inputText: '#001726',
      inputBorder: '#cbd5e1',
      inputPlaceholder: '#64748b',
      glassOpacity: 100,
      glassBlur: 0
    }
  }
];

const NICHE_EFFECTS = [
  { id: 'none', icon: '🚫', name: 'Nenhum', niche: 'Fundo Padrão' },
  { id: 'fap-adventista', icon: '🎓', name: 'Faculdade Adventista (Logo A)', niche: 'Educação & Campus' },
  { id: 'aurora', icon: '🌌', name: 'Aurora Borealis', niche: 'Geral Fluido' },
  { id: 'particles', icon: '⚡', name: 'Constelação Cyber', niche: 'Tech Geral' },
  { id: 'matrix', icon: '💻', name: 'Matrix Digital Rain', niche: 'Hacker & Dev' },
  { id: 'cyber-grid', icon: '🕹️', name: 'Grid 3D Synthwave', niche: 'Retro Gaming' },
  { id: 'floating-orbs', icon: '🔮', name: 'Orbes de Vidro', niche: 'Design Moderno' },
  { id: 'fireflies', icon: '✨', name: 'Vaga-lumes Neon', niche: 'Natureza & Parques' },
  { id: 'warp-stars', icon: '🚀', name: 'Warp Stars 3D', niche: 'Espaço & Velocidade' },
  { id: 'wave-mesh', icon: '🌊', name: 'Ondas Fluidas', niche: 'Gradiente Cromático' },
  { id: 'cardio-pulse', icon: '🏋️', name: 'Cardio Pulse & Fitness', niche: 'Academia & Crossfit' },
  { id: 'medical-vital', icon: '🏥', name: 'Vital Monitor & Saúde', niche: 'Clínicas & Consultórios' },
    { id: 'fiber-optic', icon: '💡', name: 'Fótons Fibra Óptica', niche: 'Telecom & ISP' },
];

export default function PortalEditor() {
  const [template, setTemplate] = useState('default');
  const [availableTemplates, setAvailableTemplates] = useState<string[]>(['default', 'FAP']);
  const [activeTab, setActiveTab] = useState<StudioTab>('branding');
  const [previewScreen, setPreviewScreen] = useState<'login' | 'register'>('login');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewZoom, setPreviewZoom] = useState(100);

  // Router connection state
  const [isRouterConnected, setIsRouterConnected] = useState(true);

  // Deploy Modal
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [ftpPort, setFtpPort] = useState('21');
  const [deploying, setDeploying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deployModalResult, setDeployModalResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Logo & Uploads
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('/api/portal/logo');
  const [logoUploadLoading, setLogoUploadLoading] = useState(false);
  const [bgUploadLoading, setBgUploadLoading] = useState(false);
  const [adUploadLoading, setAdUploadLoading] = useState(false);

  // Core settings states
  const [businessName, setBusinessName] = useState('Super Wi-Fi');
  const [message, setMessage] = useState('Bem-vindo à nossa rede gratuita. Insira o seu voucher para navegar.');
  const [systemUrl, setSystemUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saleMode, setSaleMode] = useState(false);
  const [systemFreeWifiMode, setSystemFreeWifiMode] = useState(true);
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

  // Ad simulation state
  const [showSimulatedAd, setShowSimulatedAd] = useState(false);

  // Color history with Undo / Redo
  const colorsHistory = useHistory<Colors>({
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

  const colors = colorsHistory.state;
  const setColors = colorsHistory.set as React.Dispatch<React.SetStateAction<Colors>>;

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

  const [bg, setBg] = useState<any>({
    type: 'default',
    url: ''
  });

  const [effects, setEffects] = useState<any>({
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

  const [social, setSocial] = useState<any>({
    whatsappEnabled: false,
    whatsappNumber: '',
    whatsappMessage: 'Olá! Preciso de suporte para acessar o Wi-Fi.',
    instagramUrl: '',
    facebookUrl: '',
    googleMapsUrl: '',
  });

  const [badges, setBadges] = useState<any>({
    showWifiSpeed: false,
    wifiSpeedText: '🚀 Turbo Launch 5G',
    showSecurityBadge: false,
    securityText: '🔒 Ultra Fast Portal',
    showConnectedCount: false,
    connectedCountNumber: '42',
  });

  const [ad, setAd] = useState<any>({
    type: 'none',
    mediaUrl: '',
    targetUrl: '',
    items: [],
    timerEnabled: false,
    timerDuration: 5
  });

  const [customCode, setCustomCode] = useState<any>({
    customCss: ''
  });

  const [fields, setFields] = useState<FieldsConfig>({
    usernameEnabled: false,
    usernameRequired: true,
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

  const [studio, setStudio] = useState<any>({
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

  // Provisioning States
  const [provInterfaces, setProvInterfaces] = useState<any[]>([]);
  const [provSuggestedGateway, setProvSuggestedGateway] = useState('10.10.10.1');
  const [provLoading, setProvLoading] = useState(false);
  const [provNotConnected, setProvNotConnected] = useState(false);
  const [provFetchError, setProvFetchError] = useState('');
  const [provSelectedWan, setProvSelectedWan] = useState<any>(null);
  const [provSteps, setProvSteps] = useState<any[]>([
    { name: 'etapa_1', label: '⚡ Etapa 1: Provisionamento dos Serviços de Hotspot', status: 'pending', message: '' },
    { name: 'etapa_2', label: '🧹 Etapa 2: Validação de Configurações de Fábrica', status: 'pending', message: '' },
    { name: 'etapa_3', label: '🛡️ Etapa 3: Validação de Regras de Firewall', status: 'pending', message: '' },
    { name: 'etapa_4', label: '🔑 Etapa 4: Configuração de Acesso à API e Assinatura', status: 'pending', message: '' },
  ]);
  const [provStage, setProvStage] = useState<'select' | 'running' | 'reconnecting' | 'done' | 'error'>('select');
  const [provSummary, setProvSummary] = useState<any>(null);
  const [provErrorMsg, setProvErrorMsg] = useState('');
  const [provReconnectStatus, setProvReconnectStatus] = useState('');
  const [provAudit, setProvAudit] = useState<any>(null);
  const [provHasFailures, setProvHasFailures] = useState(false);
  const [provFixingApiRule, setProvFixingApiRule] = useState(false);
  const [provFixApiRuleMsg, setProvFixApiRuleMsg] = useState('');

  // Carregar interfaces e auditoria de provisionamento
  const fetchInterfaces = useCallback(async () => {
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
        setProvNotConnected(false);
        setProvInterfaces(data.interfaces || []);
        if (data.suggestedGateway) {
          setProvSuggestedGateway(data.suggestedGateway);
        }
        setProvAudit(data.audit || null);
        setProvHasFailures(!!data.hasFailures);

        if (Array.isArray(data.interfaces) && data.interfaces.length > 0) {
          const autoIface =
            data.interfaces.find((i: any) => i.name === data.detectedWanInterface) ||
            data.interfaces.find((i: any) => i.isBridge || i.name.toLowerCase().includes('bridge')) ||
            data.interfaces.find((i: any) => !i.disabled) ||
            data.interfaces[0];
          setProvSelectedWan(autoIface);
        }
      } else {
        setProvFetchError(data.message || 'Erro ao carregar interfaces do roteador');
      }
    } catch {
      setProvFetchError('Falha na comunicação com o roteador MikroTik.');
    } finally {
      setProvLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'provisioning') {
      fetchInterfaces();
    }
  }, [activeTab, fetchInterfaces]);

  const handleFixApiRule = async () => {
    setProvFixingApiRule(true);
    setProvFixApiRuleMsg('');
    try {
      const res = await fetch('/api/hotspot/provision/fix-api-rule', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProvFixApiRuleMsg('✅ Regra de proteção da API aplicada com sucesso!');
        setTimeout(() => {
          setProvFixApiRuleMsg('');
          fetchInterfaces();
        }, 1200);
      } else {
        setProvFixApiRuleMsg(`❌ ${data.message || 'Falha ao aplicar regra.'}`);
      }
    } catch {
      setProvFixApiRuleMsg('❌ Erro de conexão ao tentar corrigir regra.');
    } finally {
      setProvFixingApiRule(false);
    }
  };

  const handleProvision = async () => {
    if (!provSelectedWan) return;
    setProvStage('running');
    setProvErrorMsg('');

    const initialSteps = [
      { name: 'bridge_create', label: '[ BRIDGE ] Criar/Verificar Bridge LAN', status: 'running', message: 'Configurando bridge...' },
      { name: 'admin_bypass', label: '[ ACESSO ] ARP + Bypass do Sistema Administrador', status: 'pending', message: 'Aguardando...' },
      { name: 'set_ip', label: '[ IP ] Definir IP no Gateway', status: 'pending', message: 'Aguardando...' },
      { name: 'ip_pool', label: '[ POOL ] Pool de IPs para Clientes', status: 'pending', message: 'Aguardando...' },
      { name: 'dhcp_net', label: '[ REDE ] Rede DHCP', status: 'pending', message: 'Aguardando...' },
      { name: 'dhcp_server', label: '[ CONFIG ] Servidor DHCP', status: 'pending', message: 'Aguardando...' },
      { name: 'hs_profile', label: '[ FIREWALL ] Perfil do Servidor Hotspot', status: 'pending', message: 'Aguardando...' },
      { name: 'hs_server', label: '[ HOTSPOT ] Servidor Hotspot', status: 'pending', message: 'Aguardando...' },
      { name: 'user_profile', label: '[ PERFIL ] Perfil de Usuário Padrão', status: 'pending', message: 'Aguardando...' },
      { name: 'update_media_urls', label: '[ MÍDIA ] Atualizar IP nos Templates', status: 'pending', message: 'Aguardando...' },
      { name: 'provision_signature', label: '[ LOG ] Gravar Assinatura MikroGestor', status: 'pending', message: 'Aguardando...' },
    ];
    setProvSteps(initialSteps);

    try {
      const res = await fetch('/api/hotspot/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interfaceName: provSelectedWan.name,
          gatewayIp: provSuggestedGateway,
        }),
      });

      const data = await res.json();
      if (data.steps && Array.isArray(data.steps)) {
        setProvSteps(data.steps.filter((s: any) => s.status !== 'skipped' || s.name === 'nat'));
      }

      if (data.success) {
        setProvStage('done');
        setProvSummary(data.summary || null);
        fetchInterfaces();
      } else {
        setProvStage('error');
        setProvErrorMsg(data.message || 'Falha no provisionamento.');
      }
    } catch (e: any) {
      setProvStage('error');
      setProvErrorMsg(e?.message || 'Erro de conexão com o servidor.');
    }
  };

  // Load config on mount
  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        const res = await fetch(`/api/portal/config?template=${template}`);
        const data = await res.json();
        if (data.success && data.config) {
          const c = data.config;
          if (c.businessName) setBusinessName(c.businessName);
          if (c.message) setMessage(c.message);
          if (c.systemUrl) setSystemUrl(c.systemUrl);
          if (c.colors) setColors((prev: any) => ({ ...prev, ...c.colors }));
          if (c.effects) setEffects((prev: any) => ({ ...prev, ...c.effects }));
          if (c.social) setSocial((prev: any) => ({ ...prev, ...c.social }));
          if (c.badges) setBadges((prev: any) => ({ ...prev, ...c.badges }));
          if (c.customCode) setCustomCode((prev: any) => ({ ...prev, ...c.customCode }));
          if (c.brand) setBrand((prev: any) => ({ ...prev, ...c.brand }));
          if (c.ad) setAd((prev: any) => ({ ...prev, ...c.ad }));
          if (c.bg) setBg((prev: any) => ({ ...prev, ...c.bg }));
          if (c.fields) setFields((prev: any) => ({ ...prev, ...c.fields }));
          if (c.enabled !== undefined) setEnabled(c.enabled);
          if (c.systemFreeWifiMode !== undefined) {
            setSystemFreeWifiMode(c.systemFreeWifiMode);
            if (c.systemFreeWifiMode) {
              setSaleMode(false);
            } else if (c.saleMode !== undefined) {
              setSaleMode(c.saleMode);
            }
          } else if (c.saleMode !== undefined) {
            setSaleMode(c.saleMode);
          }
          if (c.redirectUrl !== undefined) setRedirectUrl(c.redirectUrl);
          if (c.loginButtonLabel !== undefined) setLoginButtonLabel(c.loginButtonLabel);
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
        }
      } catch (err) {
        console.warn('Erro ao carregar configurações do portal:', err);
      }
    };

    loadInitialConfig();
  }, [template]);

  // Alterna o modo operacional mestre do sistema (sincroniza /api/config/system e /api/admin/whatsapp-messages)
  const handleToggleSystemMode = async (free: boolean) => {
    setSystemFreeWifiMode(free);
    if (free) {
      setSaleMode(false);
    } else {
      setSaleMode(true);
    }
    try {
      await Promise.all([
        fetch('/api/config/system', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'free_wifi_mode', value: free ? 'true' : 'false' })
        }),
        fetch('/api/admin/whatsapp-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'setActiveMode', mode: free ? 'free' : 'paid' })
        })
      ]);
      broadcastLivePreview();
    } catch (e) {
      console.error('Erro ao sincronizar modo do sistema:', e);
    }
  };

  // Carregar templates disponíveis
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/portal/templates');
        const data = await res.json();
        if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          setAvailableTemplates(data.templates);
        }
      } catch (e) {
        console.warn('Erro ao carregar lista de templates:', e);
      }
    };
    fetchTemplates();
  }, []);

  // Sync with live iframe
  const broadcastLivePreview = useCallback(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'LIVE_PREVIEW',
        template,
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
        fields,
        ad,
        saleMode: !systemFreeWifiMode && saleMode,
        registerTitle,
        registerSubtitle,
        registerSubmitText,
        termsText
      }, '*');
    }
  }, [template, colors, bg, effects, studio, brand, social, badges, customCode, enabled, loginButtonLabel, registerButtonText, businessName, message, trialEnabled, trialText, trialLinkText, trialModalTitle, trialModalMessage, fields, ad, saleMode, systemFreeWifiMode, registerTitle, registerSubtitle, registerSubmitText, termsText]);

  useEffect(() => {
    broadcastLivePreview();
  }, [broadcastLivePreview]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'IFRAME_READY') {
        broadcastLivePreview();
      } else if (event.data.type === 'PREVIEW_ELEMENT_CLICK') {
        const { target } = event.data;
        if (target === 'typography' || target === 'background' || target === 'card' || target === 'badges') {
          setActiveTab('branding');
        } else if (target === 'button' || target === 'input' || target === 'trial') {
          setActiveTab('auth_methods');
        } else if (target === 'register_btn') {
          setActiveTab('leads_form');
          setPreviewScreen('register');
        } else if (target === 'whatsapp') {
          setActiveTab('walled_garden');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [broadcastLivePreview]);

  // Handlers for Save and Deploy
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
          saleMode,
          redirectUrl,
          loginButtonLabel,
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
        })
      });
      const data = await res.json();
      if (data.success) {
        broadcastLivePreview();
        alert('✅ Configurações salvas localmente com sucesso!');
      } else {
        alert('❌ Erro ao salvar: ' + data.message);
      }
    } catch {
      alert('❌ Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setDeployModalResult(null);

    try {
      // 1. Save config first
      await fetch(`/api/portal/config?template=${template}`, {
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
          saleMode,
          redirectUrl,
          loginButtonLabel,
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
        })
      });

      // 2. Trigger FTP Deploy
      const res = await fetch('/api/portal/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ftpPort, template })
      });
      const data = await res.json();

      if (data.success) {
        setDeployModalResult({ type: 'success', message: data.message });
      } else {
        setDeployModalResult({ type: 'error', message: data.message || 'Erro no Deploy' });
      }
    } catch (err: any) {
      setDeployModalResult({ type: 'error', message: 'Falha na comunicação com o roteador.' });
    } finally {
      setDeploying(false);
    }
  };

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = `/api/portal/export?template=${template}`;
    link.download = `mikrotik-hotspot-${template}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      }
    } finally {
      setLogoUploadLoading(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.name.endsWith('.mp4') || file.type.startsWith('video/');
    setBgUploadLoading(true);

    try {
      const res = await fetch(`/api/portal/upload?type=bg&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setBg({
          type: isVideo ? 'video' : 'image',
          url: data.fileUrl + '?t=' + Date.now()
        });
      }
    } finally {
      setBgUploadLoading(false);
    }
  };

  const handleBgRemove = () => {
    setBg({ type: 'default', url: '' });
  };

  const handleFieldToggle = (key: keyof FieldsConfig) => {
    setFields(prev => ({
      ...prev,
      [key]: !prev[key] as any
    }));
  };

  const handleFieldLabelChange = (val: string) => {
    setFields(prev => ({ ...prev, customFieldLabel: val }));
  };

  const handleAdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdUploadLoading(true);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
    try {
      const res = await fetch(`/api/portal/upload?type=ad&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setAd((prev: any) => ({
          ...prev,
          mediaUrl: data.fileUrl,
          type: prev.type === 'carousel' ? 'carousel' : (isVideo ? 'video' : 'image')
        }));
      }
    } finally {
      setAdUploadLoading(false);
    }
  };

  const handleSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdUploadLoading(true);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
    try {
      const res = await fetch(`/api/portal/upload?type=ad&slot=${slot}&template=${template}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setAd((prev: any) => {
          const items = Array.isArray(prev.items) ? [...prev.items] : [];
          while (items.length < slot) items.push({ url: '', type: 'image', targetUrl: '' });
          items[slot - 1] = {
            url: data.fileUrl,
            type: isVideo ? 'video' : 'image',
            targetUrl: items[slot - 1]?.targetUrl || ''
          };
          return { ...prev, items };
        });
      }
    } finally {
      setAdUploadLoading(false);
    }
  };

  const handleSlotTargetUrlChange = (slot: number, val: string) => {
    setAd((prev: any) => {
      const items = Array.isArray(prev.items) ? [...prev.items] : [];
      while (items.length < slot) items.push({ url: '', type: 'image', targetUrl: '' });
      items[slot - 1] = { ...items[slot - 1], targetUrl: val };
      return { ...prev, items };
    });
  };

  const handleSlotClear = (slot: number) => {
    setAd((prev: any) => {
      const items = Array.isArray(prev.items) ? [...prev.items] : [];
      if (items[slot - 1]) items[slot - 1] = { url: '', type: 'image', targetUrl: '' };
      return { ...prev, items };
    });
  };

  const handleReplayAnimation = () => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'REPLAY_ANIMATION' }, '*');
    }
  };

  const handleRefreshIframe = () => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `/api/portal/preview?template=${template}&screen=${previewScreen}&t=${Date.now()}`;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden select-none">
      {/* 1. Top Bar */}
      <StudioTopBar
        businessName={businessName}
        previewScreen={previewScreen}
        setPreviewScreen={setPreviewScreen}
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
        previewZoom={previewZoom}
        setPreviewZoom={setPreviewZoom}
        canUndo={colorsHistory.canUndo}
        canRedo={colorsHistory.canRedo}
        onUndo={colorsHistory.undo}
        onRedo={colorsHistory.redo}
        onSave={handleSaveConfig}
        saving={saving}
        onDeployOpen={() => setIsDeployOpen(true)}
        deploying={deploying}
        onDownloadZip={handleDownloadZip}
        isRouterConnected={isRouterConnected}
        onReplayAnimation={handleReplayAnimation}
        template={template}
        setTemplate={setTemplate}
        availableTemplates={availableTemplates}
      />

      {/* 2. Workspace Body: Rail + Canvas + Inspector */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Rail */}
        <StudioNavRail
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasRegistrationEnabled={enabled}
        />

        {/* Center Live Canvas */}
        <StudioCanvas
          template={template}
          viewportMode={viewportMode}
          previewZoom={previewZoom}
          previewScreen={previewScreen}
          ad={ad}
          showSimulatedAd={showSimulatedAd}
          setShowSimulatedAd={setShowSimulatedAd}
          onRefreshIframe={handleRefreshIframe}
          onIframeLoad={broadcastLivePreview}
        />

        {/* Right Contextual Inspector */}
        <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-xs">
          {activeTab === 'branding' && (
            <BrandingStudioPanel
              colors={colors}
              setColors={setColors}
              brand={brand}
              setBrand={setBrand}
              bg={bg}
              setBg={setBg}
              effects={effects}
              setEffects={setEffects}
              colorPresets={COLOR_PRESETS}
              nicheEffects={NICHE_EFFECTS}
              logoPreviewUrl={logoPreviewUrl}
              onLogoUpload={handleLogoUpload}
              logoUploadLoading={logoUploadLoading}
              onBgUpload={handleBgUpload}
              bgUploadLoading={bgUploadLoading}
              onBgRemove={handleBgRemove}
              template={template}
              setTemplate={setTemplate}
              availableTemplates={availableTemplates}
            />
          )}

          {activeTab === 'auth_methods' && (
            <HotspotAuthStudioPanel
              fields={fields}
              setFields={setFields}
              enabled={enabled}
              setEnabled={setEnabled}
              saleMode={saleMode}
              setSaleMode={setSaleMode}
              systemFreeWifiMode={systemFreeWifiMode}
              onToggleSystemMode={handleToggleSystemMode}
              trialEnabled={trialEnabled}
              setTrialEnabled={setTrialEnabled}
              loginButtonLabel={loginButtonLabel}
              setLoginButtonLabel={setLoginButtonLabel}
              registerButtonText={registerButtonText}
              setRegisterButtonText={setRegisterButtonText}
              trialText={trialText}
              setTrialText={setTrialText}
              trialLinkText={trialLinkText}
              setTrialLinkText={setTrialLinkText}
              trialModalTitle={trialModalTitle}
              setTrialModalTitle={setTrialModalTitle}
              trialModalMessage={trialModalMessage}
              setTrialModalMessage={setTrialModalMessage}
            />
          )}

          {activeTab === 'leads_form' && (
            <LeadsFieldsStudioPanel
              fields={fields}
              setFields={setFields}
              handleFieldToggle={handleFieldToggle}
              handleFieldLabelChange={handleFieldLabelChange}
              enabled={enabled}
              setEnabled={setEnabled}
              registerTitle={registerTitle}
              setRegisterTitle={setRegisterTitle}
              registerSubtitle={registerSubtitle}
              setRegisterSubtitle={setRegisterSubtitle}
              registerSubmitText={registerSubmitText}
              setRegisterSubmitText={setRegisterSubmitText}
              termsText={termsText}
              setTermsText={setTermsText}
            />
          )}

          {activeTab === 'ads' && (
            <AdsStudioPanel
              ad={ad}
              setAd={setAd}
              onAdUpload={handleAdUpload}
              onSlotUpload={handleSlotUpload}
              onSlotTargetUrlChange={handleSlotTargetUrlChange}
              onSlotClear={handleSlotClear}
              adUploadLoading={adUploadLoading}
              onPreviewAd={() => setShowSimulatedAd(true)}
            />
          )}

          {activeTab === 'walled_garden' && (
            <WalledGardenStudioPanel
              bg={bg}
              social={social}
            />
          )}

          {activeTab === 'css_pro' && (
            <CssProStudioPanel
              customCode={customCode}
              setCustomCode={setCustomCode}
            />
          )}

          {activeTab === 'provisioning' && (
            <ProvisioningStudioPanel
              provStage={provStage}
              provInterfaces={provInterfaces}
              provSuggestedGateway={provSuggestedGateway}
              setProvSuggestedGateway={setProvSuggestedGateway}
              provSelectedWan={provSelectedWan}
              setProvSelectedWan={setProvSelectedWan}
              provSteps={provSteps}
              provLoading={provLoading}
              provNotConnected={provNotConnected}
              provFetchError={provFetchError}
              provSummary={provSummary}
              provErrorMsg={provErrorMsg}
              provReconnectStatus={provReconnectStatus}
              provAudit={provAudit}
              provHasFailures={provHasFailures}
              provFixingApiRule={provFixingApiRule}
              provFixApiRuleMsg={provFixApiRuleMsg}
              onFixApiRule={handleFixApiRule}
              onProvision={handleProvision}
              onResetProvision={() => setProvStage('select')}
            />
          )}
        </aside>
      </div>

      {/* 3. Deploy Dialog */}
      <DeployStudioModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        ftpPort={ftpPort}
        setFtpPort={setFtpPort}
        onDeploy={handleDeploy}
        deploying={deploying}
        deployModalResult={deployModalResult}
        onDownloadZip={handleDownloadZip}
      />
    </div>
  );
}
