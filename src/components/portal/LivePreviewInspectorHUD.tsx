"use client";

import React from 'react';

export interface InspectedElementInfo {
  target: string;
  cardId: string;
  title: string;
  editableProps: string[];
}

interface LivePreviewInspectorHUDProps {
  inspectedElement: InspectedElementInfo | null;
  onFocusField?: (fieldLabel: string) => void;
}

export default function LivePreviewInspectorHUD({
  inspectedElement,
  onFocusField
}: LivePreviewInspectorHUDProps) {
  return (
    <div className="w-full mb-3 animate-fade-in">
      <div className="preview-inspector-hud rounded-2xl p-3 border transition-all duration-200">
        <div className="flex items-center justify-between gap-2 border-b border-cyan-900/40 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
            </span>
            <span className="text-[11px] font-mono font-black text-cyan-300 uppercase tracking-wider">
              {inspectedElement ? 'INSPETOR AO VIVO // RAIO-X' : 'SIMULADOR DE TELAS'}
            </span>
          </div>

          {inspectedElement ? (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 animate-pulse">
              ● ATIVO EM TEMPO REAL
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-400">
              Passe o mouse p/ inspecionar
            </span>
          )}
        </div>

        {inspectedElement ? (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs">🎯</span>
                <span className="text-xs font-bold text-white truncate">
                  {inspectedElement.title}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded shrink-0">
                Card: {inspectedElement.cardId}
              </span>
            </div>

            <div>
              <span className="block text-[9px] font-mono text-slate-400 mb-1 uppercase tracking-wide">
                Propriedades editáveis em tempo real:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {inspectedElement.editableProps.map((prop, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFocusField?.(prop)}
                    className="text-[10px] font-semibold text-slate-200 bg-slate-900/90 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/80 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="text-cyan-400 text-[9px]">✏️</span>
                    <span>{prop}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-slate-400 text-[11px] py-0.5">
            <span className="text-sm">👆</span>
            <p className="leading-snug text-slate-350">
              Passe o mouse em <strong>qualquer elemento no celular</strong> ou nos <strong>cards do editor</strong> para destacar e ver o que pode ser editado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
