"use client";

import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Send, 
  ZoomIn, 
  ZoomOut, 
  Wifi, 
  ExternalLink,
  Lock,
  UserCheck,
  Radio,
  LayoutTemplate
} from 'lucide-react';

interface StudioTopBarProps {
  businessName: string;
  previewScreen: 'login' | 'register';
  setPreviewScreen: (s: 'login' | 'register') => void;
  viewportMode: 'mobile' | 'tablet' | 'desktop';
  setViewportMode: (v: 'mobile' | 'tablet' | 'desktop') => void;
  previewZoom: number;
  setPreviewZoom: React.Dispatch<React.SetStateAction<number>>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  saving: boolean;
  onDeployOpen: () => void;
  deploying: boolean;
  onDownloadZip: () => void;
  isRouterConnected: boolean;
  onReplayAnimation: () => void;
  template?: string;
  setTemplate?: (t: string) => void;
  availableTemplates?: string[];
}

export default function StudioTopBar({
  businessName,
  previewScreen,
  setPreviewScreen,
  viewportMode,
  setViewportMode,
  previewZoom,
  setPreviewZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  saving,
  onDeployOpen,
  deploying,
  onDownloadZip,
  isRouterConnected,
  onReplayAnimation,
  template = 'default',
  setTemplate,
  availableTemplates = ['default', 'FAP'],
}: StudioTopBarProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-xs select-none min-w-0">
      {/* Left: Brand & Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                {businessName || 'Hotspot Portal'}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                isRouterConnected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRouterConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="hidden sm:inline">{isRouterConnected ? 'MikroTik Conectado' : 'Offline / Local'}</span>
                <span className="sm:hidden">{isRouterConnected ? 'Online' : 'Local'}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate hidden 2xl:block">
              MikroStudio 2.0 • Editor de Hotspot RouterOS
            </p>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center border-l border-slate-200 dark:border-slate-800 pl-2 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onReplayAnimation}
            title="Repetir Animações"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer ml-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Preset Selector + Screen Switcher & Viewport Controls */}
      <div className="flex items-center gap-1.5 shrink min-w-0">
        {/* Preset / Template Selector com destaque */}
        {setTemplate && availableTemplates && availableTemplates.length > 0 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs shrink-0">
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 hidden md:inline">
              Preset:
            </span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 rounded-lg px-2 py-1 border border-blue-200 dark:border-blue-700 outline-none cursor-pointer hover:border-blue-400 transition-all shadow-xs max-w-[170px] sm:max-w-none"
            >
              {availableTemplates.map(t => (
                <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold">
                  {t === 'default' ? '⚡ Padrão (Modern Pro)' : t === 'FAP' ? '🎓 FAP (Adventista)' : t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Screen Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setPreviewScreen('login')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              previewScreen === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewScreen('register')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              previewScreen === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cadastro / Leads</span>
          </button>
        </div>

        {/* Viewport switch */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            title="Visualização Mobile (390px)"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewportMode === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            title="Visualização Tablet (560px)"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewportMode === 'tablet'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            title="Visualização Desktop / Widescreen"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewportMode === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <button
            type="button"
            onClick={() => setPreviewZoom(prev => Math.max(60, prev - 10))}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 w-9 text-center">
            {previewZoom}%
          </span>
          <button
            type="button"
            onClick={() => setPreviewZoom(prev => Math.min(130, prev + 10))}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Primary Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onDownloadZip}
          title="Baixar pacote ZIP com todos os arquivos HTML, imagens e estilos do Hotspot"
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden xl:inline">Baixar ZIP</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
          <span>{saving ? 'Salvando...' : 'Salvar'}</span>
        </button>

        <button
          type="button"
          onClick={onDeployOpen}
          disabled={deploying}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Send className={`w-3.5 h-3.5 ${deploying ? 'animate-spin' : ''}`} />
          <span>{deploying ? 'Enviando...' : 'Deploy no Roteador'}</span>
        </button>
      </div>
    </header>
  );
}
