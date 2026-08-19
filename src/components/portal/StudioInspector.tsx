"use client";

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  LayoutGrid, 
  Sparkles, 
  Layers, 
  Square, 
  Sliders, 
  Zap, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Upload, 
  Trash2, 
  Film, 
  Image as ImageIcon, 
  Eye, 
  Check
} from 'lucide-react';

export interface StudioState {
  activeComponent: 'submit_button' | 'login_card' | 'input_fields' | 'brand_typography' | 'background_layer' | 'status_badges' | 'social_bar' | 'ad_banner';
  fontFamily: string;
  titleFontSize: number;
  titleFontWeight: string;
  titleLineHeight: number;
  titleLetterSpacing: number;
  titleAlign: 'left' | 'center' | 'right';
  titleItalic: boolean;
  titleUnderline: boolean;
  btnFontSize: number;
  btnFontWeight: string;
  btnLetterSpacing: number;
  btnHeight: number;
  btnPaddingTop: number;
  btnPaddingRight: number;
  btnPaddingBottom: number;
  btnPaddingLeft: number;
  btnRadiusTL: number;
  btnRadiusTR: number;
  btnRadiusBR: number;
  btnRadiusBL: number;
  btnBorderWidth: number;
  cardRadiusTL: number;
  cardRadiusTR: number;
  cardRadiusBR: number;
  cardRadiusBL: number;
  cardPaddingTop: number;
  cardPaddingRight: number;
  cardPaddingBottom: number;
  cardPaddingLeft: number;
  cardBorderWidth: number;
  cardBorderStyle: 'solid' | 'dashed' | 'none';
  cardGap: number;
  inputHeight: number;
  inputRadius: number;
  inputBorderWidth: number;
}

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

interface BgConfig {
  type: 'default' | 'image' | 'video';
  url: string;
}

interface StudioInspectorProps {
  template: string;
  setTemplate: (t: string) => void;
  businessName: string;
  setBusinessName: (b: string) => void;
  message: string;
  setMessage: (m: string) => void;
  colors: Colors;
  setColors: React.Dispatch<React.SetStateAction<Colors>>;
  effects: EffectsConfig;
  setEffects: React.Dispatch<React.SetStateAction<EffectsConfig>>;
  studio: StudioState;
  setStudio: React.Dispatch<React.SetStateAction<StudioState>>;
  social: SocialConfig;
  setSocial: React.Dispatch<React.SetStateAction<SocialConfig>>;
  badges: BadgesConfig;
  setBadges: React.Dispatch<React.SetStateAction<BadgesConfig>>;
  bg: BgConfig;
  setBg: React.Dispatch<React.SetStateAction<BgConfig>>;
  handleBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBgRemove?: () => void;
  bgUploadLoading: boolean;
  COLOR_PRESETS: any[];
  NICHE_EFFECTS: any[];
  hoveredTarget?: string | null;
  onCardHover?: (target: string | null) => void;
}

type StudioToolTab = 'colors' | 'typography' | 'layout' | 'background' | 'all';

export default function StudioInspector({
  template,
  setTemplate,
  businessName,
  setBusinessName,
  message,
  setMessage,
  colors,
  setColors,
  effects,
  setEffects,
  studio,
  setStudio,
  social,
  setSocial,
  badges,
  setBadges,
  bg,
  setBg,
  handleBgUpload,
  handleBgRemove,
  bgUploadLoading,
  COLOR_PRESETS,
  NICHE_EFFECTS,
  hoveredTarget,
  onCardHover
}: StudioInspectorProps) {
  const [activeTab, setActiveTab] = useState<StudioToolTab>('colors');
  const [bgCategory, setBgCategory] = useState<string>('all');

  const fontOptions = [
    { id: 'Inter', name: 'Inter', sample: 'Aa Modern Clean' },
    { id: 'Outfit', name: 'Outfit', sample: 'Aa Tech Rounded' },
    { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', sample: 'Aa Pro Luxury' },
    { id: 'Cabinet Grotesk', name: 'Cabinet Grotesk', sample: 'Aa Bold Display' },
    { id: 'Roboto Mono', name: 'Roboto Mono', sample: '01 Mono Code' },
    { id: 'Geist', name: 'Geist Sans', sample: 'Aa Minimalist' },
  ];

  const shapeOptions = [
    { 
      id: 'rounded', 
      label: 'Moderno', 
      sub: '20px Suave', 
      iconSvg: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
        </svg>
      ) 
    },
    { 
      id: 'square', 
      label: 'Quadrado', 
      sub: '2px Retrô', 
      iconSvg: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" ry="1" />
        </svg>
      ) 
    },
    { 
      id: 'pill', 
      label: 'Pílula', 
      sub: '36px Redondo', 
      iconSvg: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="7" ry="7" />
        </svg>
      ) 
    },
    { 
      id: 'scifi-cut', 
      label: 'Sci-Fi HUD', 
      sub: 'Chanfrado 45°', 
      iconSvg: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="6,3 18,3 21,6 21,18 18,21 6,21 3,18 3,6" />
        </svg>
      ) 
    },
  ] as const;

  const quickThemes = [
    {
      id: 'cyber',
      name: 'Cyber Blue',
      brand: '#06b6d4',
      blue: '#0284c7',
      cardBg: '#0f172a',
      bg: '#030712',
      bgEffect: 'matrix',
      accent: 'bg-sky-500'
    },
    {
      id: 'emerald',
      name: 'Emerald Pro',
      brand: '#10b981',
      blue: '#059669',
      cardBg: '#064e3b',
      bg: '#022c22',
      bgEffect: 'digital-ocean',
      accent: 'bg-emerald-500'
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      brand: '#f59e0b',
      blue: '#ea580c',
      cardBg: '#27272a',
      bg: '#18181b',
      bgEffect: 'aurora',
      accent: 'bg-amber-500'
    },
    {
      id: 'obsidian',
      name: 'Indigo Dark',
      brand: '#6366f1',
      blue: '#4f46e5',
      cardBg: '#18181b',
      bg: '#09090b',
      bgEffect: 'cyber-grid',
      accent: 'bg-indigo-500'
    },
  ];

  const applyShapePreset = (shape: 'rounded' | 'square' | 'pill' | 'scifi-cut') => {
    setEffects(prev => ({ ...prev, cardShape: shape }));
    if (shape === 'square') {
      setStudio(prev => ({ ...prev, cardRadiusTL: 2, cardRadiusTR: 2, cardRadiusBR: 2, cardRadiusBL: 2, btnRadiusTL: 2, btnRadiusTR: 2, btnRadiusBR: 2, btnRadiusBL: 2, inputRadius: 2 }));
    } else if (shape === 'pill') {
      setStudio(prev => ({ ...prev, cardRadiusTL: 36, cardRadiusTR: 36, cardRadiusBR: 36, cardRadiusBL: 36, btnRadiusTL: 28, btnRadiusTR: 28, btnRadiusBR: 28, btnRadiusBL: 28, inputRadius: 24 }));
    } else if (shape === 'scifi-cut') {
      setStudio(prev => ({ ...prev, cardRadiusTL: 0, cardRadiusTR: 0, cardRadiusBR: 0, cardRadiusBL: 0, btnRadiusTL: 0, btnRadiusTR: 0, btnRadiusBR: 0, btnRadiusBL: 0, inputRadius: 0 }));
    } else {
      setStudio(prev => ({ ...prev, cardRadiusTL: 20, cardRadiusTR: 20, cardRadiusBR: 20, cardRadiusBL: 20, btnRadiusTL: 12, btnRadiusTR: 12, btnRadiusBR: 12, btnRadiusBL: 12, inputRadius: 10 }));
    }
  };

  const applyQuickTheme = (theme: typeof quickThemes[0]) => {
    setColors(prev => ({
      ...prev,
      brand: theme.brand,
      blue: theme.blue,
      cardBg: theme.cardBg,
      bg: theme.bg
    }));
    setEffects(prev => ({
      ...prev,
      bgEffect: theme.bgEffect
    }));
    setBg(prev => ({ ...prev, type: 'default' }));
  };

  // Sync element click from preview to switch to the corresponding tool sub-tab
  useEffect(() => {
    const handleElementClick = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_ELEMENT_CLICK' && event.data.target) {
        const target = event.data.target;
        if (target === 'typography') {
          setActiveTab('typography');
        } else if (target === 'button' || target === 'input' || target === 'card') {
          setActiveTab('layout');
        } else if (target === 'background') {
          setActiveTab('background');
        }
      }
    };
    window.addEventListener('message', handleElementClick);
    return () => window.removeEventListener('message', handleElementClick);
  }, []);

  const shouldShowSection = (section: string) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'colors' && (section === 'colors' || section === 'appearance')) return true;
    if (activeTab === 'typography' && (section === 'properties' || section === 'typography')) return true;
    if (activeTab === 'layout' && (section === 'layout' || section === 'spacing' || section === 'radius')) return true;
    if (activeTab === 'background' && (section === 'background')) return true;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* TOP HEADER BAR: TEMPLATE SELECTOR & FAST PRESETS */}
      <div className="bg-[#121522] p-3 rounded-2xl border border-[#22283e] shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">Portal Studio Pro</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE SYNC
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Edição visual em tempo real sincronizada com o simulador</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Template:</span>
            <select 
              value={template} 
              onChange={(e) => { setTemplate(e.target.value); if(typeof window !== 'undefined') localStorage.setItem('mikrogestor_last_template', e.target.value); }} 
              className="bg-[#181c2c] text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#2e3752] outline-none focus:border-blue-400 transition-all cursor-pointer"
            >
              <option value="default">Padrão</option>
              <option value="academia">Academia (Cardio Pulse)</option>
              <option value="clinica">Clínica (Medical Vital)</option>
              <option value="futebol_copa">Futebol / Copa (Stadium Lights)</option>
              <option value="hotel">Hotel (Luxury Bubbles)</option>
              <option value="igreja">Igreja (Raios Celestiais)</option>
              <option value="pizzaria">Pizzaria (Brasas Forneria)</option>
              <option value="Digital_Ocean">Digital Ocean</option>
              <option value="Escuela">Escuela</option>
              <option value="Greenboard">Greenboard</option>
              <option value="Launcher">Launcher</option>
              <option value="LinkingNet">LinkingNet</option>
              <option value="Nougat">Nougat</option>
              <option value="Popcorn">Popcorn</option>
              <option value="Traffic-Control">Traffic Control</option>
              <option value="WiFi_Community">WiFi Community</option>
              <option value="WifiElBarrio">Wifi El Barrio</option>
              <option value="workspace">Workspace</option>
              <option value="shield">Shield</option>
              <option value="wifi_lock">WiFi Lock</option>
            </select>
          </div>
        </div>

        {/* 1-Click Fast Color Themes Swatches */}
        <div className="pt-2 border-t border-[#1e2336] flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Temas Rápidos:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {quickThemes.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => applyQuickTheme(th)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161a29] hover:bg-[#1f253a] border border-[#2b334d] hover:border-blue-400/50 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer"
                title={`Aplicar paleta ${th.name}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${th.accent}`}></span>
                <span className="font-medium">{th.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STUDIO TOOLBAR NAVIGATION TABS */}
      <div className="bg-[#0f121d] p-1.5 rounded-2xl border border-[#20263b] flex flex-wrap items-center justify-between gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#171b2b]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Cores & Vidro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'typography'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#171b2b]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Textos & Tipografia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#171b2b]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Layout & Formas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#171b2b]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Fundo & 25 Nichos</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'all' ? 'colors' : 'all')}
          className={`text-[10px] font-mono px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-slate-700 text-white border-slate-500 font-bold'
              : 'bg-[#151928] text-slate-400 hover:text-slate-200 border-[#283049]'
          }`}
          title="Ver todos os cards simultaneamente"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{activeTab === 'all' ? 'Modo Modular' : 'Ver Tudo'}</span>
        </button>
      </div>

      {/* DYNAMIC STUDIO PANELS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">

        {/* ===================================================================
            SECTION: CORES (CARD 1)
            =================================================================== */}
        {shouldShowSection('colors') && (
          <div 
            id="card-colors"
            data-focus-section="Cores"
            onClickCapture={() => onCardHover?.('button')}
            onFocusCapture={() => onCardHover?.('button')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md spotlight-card relative ${(hoveredTarget === 'card' || hoveredTarget === 'button' || hoveredTarget === 'input') ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Cores</span>
              </div>
              {(hoveredTarget === 'card' || hoveredTarget === 'button' || hoveredTarget === 'input') && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Categoria 1: Marca & Botões */}
              <div className="space-y-2">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">🎨 Marca & Botões</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Botão Conectar</div>
                      <div className="text-[10px] font-mono font-bold text-blue-400">{colors.blue || '#2563eb'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.blue || '#2563eb'} 
                      onChange={(e) => setColors(prev => ({ ...prev, blue: e.target.value }))}
                      onFocus={() => onCardHover?.('button')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Texto Botão Conectar</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.loginButtonText || '#ffffff'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.loginButtonText || '#ffffff'} 
                      onChange={(e) => setColors(prev => ({ ...prev, loginButtonText: e.target.value }))}
                      onFocus={() => onCardHover?.('button')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-emerald-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Botão Cadastro</div>
                      <div className="text-[10px] font-mono font-bold text-emerald-400">{colors.green || '#10b981'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.green || '#10b981'} 
                      onChange={(e) => setColors(prev => ({ ...prev, green: e.target.value }))}
                      onFocus={() => onCardHover?.('register_btn')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-emerald-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Texto Botão Cadastro</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.registerButtonText || '#ffffff'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.registerButtonText || '#ffffff'} 
                      onChange={(e) => setColors(prev => ({ ...prev, registerButtonText: e.target.value }))}
                      onFocus={() => onCardHover?.('register_btn')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Botão Teste Grátis</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.trialButtonBg || '#1e90ff'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.trialButtonBg || '#1e90ff'} 
                      onChange={(e) => setColors(prev => ({ ...prev, trialButtonBg: e.target.value }))}
                      onFocus={() => onCardHover?.('button')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Texto Teste Grátis</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.trialButtonText || '#ffffff'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.trialButtonText || '#ffffff'} 
                      onChange={(e) => setColors(prev => ({ ...prev, trialButtonText: e.target.value }))}
                      onFocus={() => onCardHover?.('button')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Categoria 2: Card & Tela */}
              <div className="space-y-2 pt-1 border-t border-[#1e2336]">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">🎴 Card & Tela</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Fundo Geral</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.bg || '#fafafa'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.bg || '#fafafa'} 
                      onChange={(e) => setColors(prev => ({ ...prev, bg: e.target.value }))}
                      onFocus={() => onCardHover?.('background')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Fundo do Card</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.cardBg || '#ffffff'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.cardBg || '#ffffff'} 
                      onChange={(e) => setColors(prev => ({ ...prev, cardBg: e.target.value }))}
                      onFocus={() => onCardHover?.('card')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Borda do Card</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.cardBorder || 'rgba(0,0,0,0.08)'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.cardBorder || '#e2e8f0'} 
                      onChange={(e) => setColors(prev => ({ ...prev, cardBorder: e.target.value }))}
                      onFocus={() => onCardHover?.('card')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Texto Principal</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.ink || '#0f172a'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.ink || '#0f172a'} 
                      onChange={(e) => setColors(prev => ({ ...prev, ink: e.target.value }))}
                      onFocus={() => onCardHover?.('card')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40 col-span-2">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Texto Secundário / Descrições</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.muted || '#64748b'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.muted || '#64748b'} 
                      onChange={(e) => setColors(prev => ({ ...prev, muted: e.target.value }))}
                      onFocus={() => onCardHover?.('card')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Categoria 3: Campos de Texto (Inputs) */}
              <div className="space-y-2 pt-1 border-t border-[#1e2336]">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">⌨️ Campos de Texto (Inputs)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Fundo dos Campos</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.inputBg || '#ffffff'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.inputBg || '#ffffff'} 
                      onChange={(e) => setColors(prev => ({ ...prev, inputBg: e.target.value }))}
                      onFocus={() => onCardHover?.('input')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Texto dos Campos</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.inputText || '#0f172a'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.inputText || '#0f172a'} 
                      onChange={(e) => setColors(prev => ({ ...prev, inputText: e.target.value }))}
                      onFocus={() => onCardHover?.('input')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Borda dos Campos</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.inputBorder || '#e2e8f0'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.inputBorder || '#e2e8f0'} 
                      onChange={(e) => setColors(prev => ({ ...prev, inputBorder: e.target.value }))}
                      onFocus={() => onCardHover?.('input')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="spotlight-field p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between transition-all hover:border-blue-500/40">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">Dica / Placeholder</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{colors.inputPlaceholder || '#94a3b8'}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colors.inputPlaceholder || '#94a3b8'} 
                      onChange={(e) => setColors(prev => ({ ...prev, inputPlaceholder: e.target.value }))}
                      onFocus={() => onCardHover?.('input')}
                      className="w-6.5 h-6.5 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION: VIDRO & EFEITOS (CARD 2)
            =================================================================== */}
        {shouldShowSection('appearance') && (
          <div 
            id="card-appearance"
            data-focus-section="Vidro & Efeitos"
            onClickCapture={() => onCardHover?.('card')}
            onFocusCapture={() => onCardHover?.('card')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md spotlight-card relative ${hoveredTarget === 'card' ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Vidro & Efeitos</span>
              </div>
              {hoveredTarget === 'card' && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-3.5">
              {/* Glass Blur Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Desfoque do Vidro (Blur):</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {colors.glassBlur ?? 16}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  value={colors.glassBlur ?? 16} 
                  onChange={(e) => setColors(prev => ({ ...prev, glassBlur: Number(e.target.value) }))}
                  onFocus={() => onCardHover?.('card')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>

              {/* Glass Opacity Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Opacidade do Card:</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {(() => {
                      let opVal = colors.glassOpacity ?? 85;
                      if (opVal > 0 && opVal <= 1) opVal = Math.round(opVal * 100);
                      return opVal;
                    })()}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={(() => {
                    let opVal = colors.glassOpacity ?? 85;
                    if (opVal > 0 && opVal <= 1) opVal = Math.round(opVal * 100);
                    return opVal;
                  })()}
                  onChange={(e) => setColors(prev => ({ ...prev, glassOpacity: Number(e.target.value) }))}
                  onFocus={() => onCardHover?.('card')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>

              {/* Micro-Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="spotlight-field flex items-center gap-2 p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] cursor-pointer hover:border-blue-500/40 transition-all">
                  <input 
                    type="checkbox" 
                    checked={effects.btnPulse} 
                    onChange={(e) => setEffects(prev => ({ ...prev, btnPulse: e.target.checked }))}
                    onFocus={() => onCardHover?.('button')}
                    className="accent-blue-500 w-3.5 h-3.5 rounded"
                  />
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight">Pulso Glow</div>
                    <div className="text-[8px] text-slate-500 leading-tight">Guia o clique</div>
                  </div>
                </label>

                <label className="spotlight-field flex items-center gap-2 p-2 rounded-xl bg-[#0c0e17] border border-[#252c40] cursor-pointer hover:border-blue-500/40 transition-all">
                  <input 
                    type="checkbox" 
                    checked={effects.cardGlowBorder} 
                    onChange={(e) => setEffects(prev => ({ ...prev, cardGlowBorder: e.target.checked }))}
                    onFocus={() => onCardHover?.('card')}
                    className="accent-blue-500 w-3.5 h-3.5 rounded"
                  />
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight">Borda Destacada</div>
                    <div className="text-[8px] text-slate-500 leading-tight">Contorno perimetral</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION: TEXTOS (CARD 3)
            =================================================================== */}
        {shouldShowSection('properties') && (
          <div 
            id="card-properties"
            data-focus-section="Textos"
            onClickCapture={() => onCardHover?.('typography')}
            onFocusCapture={() => onCardHover?.('typography')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md spotlight-card relative ${(hoveredTarget === 'typography' || hoveredTarget === 'card') ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Textos</span>
              </div>
              {(hoveredTarget === 'typography' || hoveredTarget === 'card') && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1">
                <label className="block text-[10px] font-mono text-slate-400">Nome do Portal / Provedor</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  onFocus={() => onCardHover?.('typography')}
                  placeholder="Ex: Hotspot Fibra 5G"
                  className="w-full bg-[#121522] text-white font-bold text-xs px-3 py-2 rounded-xl border border-[#2b334d] outline-none focus:border-blue-400 transition-all"
                />
              </div>

              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1">
                <label className="block text-[10px] font-mono text-slate-400">Mensagem de Boas-Vindas</label>
                <input 
                  type="text" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onFocus={() => onCardHover?.('typography')}
                  placeholder="Ex: Conecte-se e aproveite alta velocidade"
                  className="w-full bg-[#121522] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#2b334d] outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION: TIPOGRAFIA (CARD 4)
            =================================================================== */}
        {shouldShowSection('typography') && (
          <div 
            id="card-typography"
            data-focus-section="Tipografia"
            onClickCapture={() => onCardHover?.('typography')}
            onFocusCapture={() => onCardHover?.('typography')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md spotlight-card relative ${hoveredTarget === 'typography' ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Tipografia</span>
              </div>
              {hoveredTarget === 'typography' && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-3.5">
              {/* Font Family Visual Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {fontOptions.map((f) => {
                  const isSelected = studio.fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStudio(prev => ({ ...prev, fontFamily: f.id }))}
                      onFocus={() => onCardHover?.('typography')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-bold'
                          : 'bg-[#0c0e17] border-[#252c40] text-slate-400 hover:text-white hover:bg-[#141726]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold text-xs">{f.name}</div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">{f.sample}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Segmented Text Alignment */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold">Alinhamento:</span>
                <div className="flex bg-[#121522] rounded-xl border border-[#283049] p-0.5 gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setStudio(prev => ({ ...prev, titleAlign: align }))}
                      onFocus={() => onCardHover?.('typography')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        studio.titleAlign === align
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      <span>{align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Font Size Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Tamanho da Fonte:</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {studio.titleFontSize}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="14" 
                  max="36" 
                  value={studio.titleFontSize} 
                  onChange={(e) => setStudio(prev => ({ ...prev, titleFontSize: Number(e.target.value) }))}
                  onFocus={() => onCardHover?.('typography')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION: FORMATO DOS CANTOS (CARD 5)
            =================================================================== */}
        {shouldShowSection('layout') && (
          <div 
            id="card-radius"
            data-focus-section="Cantos"
            onClickCapture={() => onCardHover?.('card')}
            onFocusCapture={() => onCardHover?.('card')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md spotlight-card relative ${(hoveredTarget === 'card' || hoveredTarget === 'button') ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Formato dos Cantos</span>
              </div>
              {(hoveredTarget === 'card' || hoveredTarget === 'button') && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-3.5">
              {/* Shape Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {shapeOptions.map((sh) => {
                  const isSelected = effects.cardShape === sh.id;
                  return (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => applyShapePreset(sh.id)}
                      onFocus={() => onCardHover?.('card')}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                          : 'bg-[#0c0e17] border-[#252c40] text-slate-400 hover:text-white hover:bg-[#141726]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isSelected ? 'text-blue-400' : 'text-slate-400'}>{sh.iconSvg}</span>
                        <div>
                          <div className="font-bold text-xs">{sh.label}</div>
                          <div className="text-[9px] text-slate-500">{sh.sub}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Arredondamento do Card Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Raio do Card:</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {studio.cardRadiusTL}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="36" 
                  value={studio.cardRadiusTL} 
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setStudio(prev => ({ ...prev, cardRadiusTL: r, cardRadiusTR: r, cardRadiusBR: r, cardRadiusBL: r }));
                  }}
                  onFocus={() => onCardHover?.('card')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>

              {/* Arredondamento do Botão Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Raio do Botão:</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {studio.btnRadiusTL}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="28" 
                  value={studio.btnRadiusTL} 
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setStudio(prev => ({ ...prev, btnRadiusTL: r, btnRadiusTR: r, btnRadiusBR: r, btnRadiusBL: r }));
                  }}
                  onFocus={() => onCardHover?.('button')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION: ESPAÇAMENTOS (CARD 6)
            =================================================================== */}
        {shouldShowSection('layout') && (
          <div 
            id="card-spacing"
            data-focus-section="Espaçamentos"
            onClickCapture={() => onCardHover?.('button')}
            onFocusCapture={() => onCardHover?.('button')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md spotlight-card relative ${(hoveredTarget === 'card' || hoveredTarget === 'button') ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Alturas & Espaçamentos</span>
              </div>
              {(hoveredTarget === 'card' || hoveredTarget === 'button') && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-3.5">
              {/* Botão Conectar Altura Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Altura do Botão:</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {studio.btnHeight}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="36" 
                  max="68" 
                  value={studio.btnHeight} 
                  onChange={(e) => setStudio(prev => ({ ...prev, btnHeight: Number(e.target.value) }))}
                  onFocus={() => onCardHover?.('button')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>

              {/* Card Padding Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Espaçamento Interno (Padding):</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {studio.cardPaddingTop}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="44" 
                  value={studio.cardPaddingTop} 
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setStudio(prev => ({ ...prev, cardPaddingTop: p, cardPaddingRight: p, cardPaddingBottom: p, cardPaddingLeft: p }));
                  }}
                  onFocus={() => onCardHover?.('card')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>

              {/* Card Gap Slider */}
              <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Espaçamento entre Itens (Gap):</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                    {studio.cardGap}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="8" 
                  max="32" 
                  value={studio.cardGap} 
                  onChange={(e) => setStudio(prev => ({ ...prev, cardGap: Number(e.target.value) }))}
                  onFocus={() => onCardHover?.('card')}
                  className="w-full accent-blue-500 h-1.5 bg-[#1b2032] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION: FUNDO & 25 NICHOS (CARD 7)
            =================================================================== */}
        {shouldShowSection('background') && (
          <div 
            id="card-background"
            data-focus-section="Fundo & Animações"
            onClickCapture={() => onCardHover?.('background')}
            onFocusCapture={() => onCardHover?.('background')}
            className={`bg-[#141725] rounded-2xl border border-[#252c42] overflow-hidden shadow-md lg:col-span-2 spotlight-card relative ${hoveredTarget === 'background' ? 'preview-linked-card' : ''}`}
          >
            <div className="px-4 py-3 bg-[#111420] border-b border-[#22283c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Fundo & 25 Nichos
                </span>
              </div>
              {hoveredTarget === 'background' && (
                <span className="preview-linked-badge">Em Edição</span>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Todos (25)' },
                  { id: 'Tech', label: 'Tech & Cyber' },
                  { id: 'Alimentação', label: 'Gastronomia' },
                  { id: 'Saúde', label: 'Saúde & Esportes' },
                  { id: 'Hotelaria', label: 'Hotel & Luxo' },
                  { id: 'Comércio', label: 'Comércio & Serviços' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setBgCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                      bgCategory === cat.id
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#0c0e17] text-slate-400 hover:text-slate-200 border-[#252c40]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 25 Niche FX Grid - High Contrast, Clean Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {NICHE_EFFECTS.filter(fx => bgCategory === 'all' || fx.niche?.includes(bgCategory) || fx.name?.includes(bgCategory)).map((fx) => {
                  const isSelected = effects.bgEffect === fx.id;
                  return (
                    <button
                      key={fx.id}
                      type="button"
                      onClick={() => {
                        setEffects(prev => ({ ...prev, bgEffect: fx.id }));
                        setBg(prev => ({ ...prev, type: 'default' }));
                      }}
                      onFocus={() => onCardHover?.('background')}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md'
                          : 'bg-[#0c0e17] border-[#252c40] text-slate-300 hover:text-white hover:bg-[#141828]'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="font-bold truncate text-[11px] leading-tight">{fx.name}</div>
                        <div className={`text-[8px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {fx.niche}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white stroke-[2.5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Speed & Media Upload Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1e2336]">
                {/* Speed selector */}
                <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Velocidade:</span>
                  <div className="flex bg-[#121522] rounded-xl border border-[#283049] p-0.5 gap-0.5">
                    {(['slow', 'normal', 'fast'] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setEffects(prev => ({ ...prev, bgEffectSpeed: spd }))}
                        onFocus={() => onCardHover?.('background')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          effects.bgEffectSpeed === spd
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {spd === 'slow' ? 'Lento' : spd === 'normal' ? 'Normal' : 'Rápido'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media upload / Selection */}
                <div className="spotlight-field p-2.5 rounded-xl bg-[#0c0e17] border border-[#252c40] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Tipo:</span>
                      <select 
                        value={bg.type} 
                        onChange={(e) => setBg(prev => ({ ...prev, type: e.target.value as any }))}
                        onFocus={() => onCardHover?.('background')}
                        className="bg-[#121522] text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-[#2b334d] outline-none cursor-pointer"
                      >
                        <option value="default">Canvas Animado / Cor</option>
                        <option value="image">Foto Personalizada</option>
                        <option value="video">Vídeo MP4 (Fundo)</option>
                      </select>
                    </div>

                    {bg.url && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ● Ativo
                      </span>
                    )}
                  </div>

                  {/* Media Upload & Remove Action Area */}
                  {(bg.type === 'image' || bg.type === 'video') && (
                    <div className="p-2.5 rounded-xl bg-[#121522] border border-[#262e45] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {bg.type === 'video' ? <Film className="w-4 h-4 text-blue-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
                        <div>
                          <div className="text-[11px] font-bold text-white">
                            {bg.url ? (bg.type === 'video' ? 'Vídeo MP4' : 'Foto Personalizada') : 'Nenhum arquivo'}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate max-w-[180px]">
                            {bg.url ? bg.url.split('/').pop() : 'Envie seu arquivo'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{bgUploadLoading ? 'Enviando...' : (bg.url ? 'Trocar' : 'Enviar')}</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept={bg.type === 'image' ? "image/*" : "video/mp4,video/webm,video/quicktime"}
                            onChange={handleBgUpload}
                            disabled={bgUploadLoading}
                          />
                        </label>

                        {bg.url && handleBgRemove && (
                          <button
                            type="button"
                            onClick={handleBgRemove}
                            disabled={bgUploadLoading}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Remover arquivo e liberar espaço no disco"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
