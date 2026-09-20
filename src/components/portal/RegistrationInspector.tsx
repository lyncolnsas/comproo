"use client";

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  ClipboardList,
  FileText,
  Zap,
  Settings,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Lock,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

export interface FieldsConfig {
  usernameEnabled?: boolean;
  usernameRequired?: boolean;
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

interface RegistrationInspectorProps {
  fields: FieldsConfig;
  setFields: React.Dispatch<React.SetStateAction<FieldsConfig>>;
  handleFieldToggle: (key: keyof FieldsConfig) => void;
  handleFieldLabelChange: (val: string) => void;
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  redirectUrl: string;
  setRedirectUrl: (val: string) => void;
  registerButtonText: string;
  setRegisterButtonText: (val: string) => void;
  registerTitle: string;
  setRegisterTitle: (val: string) => void;
  registerSubtitle: string;
  setRegisterSubtitle: (val: string) => void;
  registerSubmitText: string;
  setRegisterSubmitText: (val: string) => void;
  termsText: string;
  setTermsText: (val: string) => void;
  trialEnabled: boolean;
  setTrialEnabled: (val: boolean) => void;
  trialText: string;
  setTrialText: (val: string) => void;
  trialLinkText: string;
  setTrialLinkText: (val: string) => void;
  trialModalTitle: string;
  setTrialModalTitle: (val: string) => void;
  trialModalMessage: string;
  setTrialModalMessage: (val: string) => void;
  trialModalConfirmText: string;
  setTrialModalConfirmText: (val: string) => void;
  trialModalCancelText: string;
  setTrialModalCancelText: (val: string) => void;
  saleMode?: boolean;
  setSaleMode?: (val: boolean) => void;
}

type NavSection = 'fields' | 'texts' | 'trial' | 'settings';

export default function RegistrationInspector({
  fields,
  setFields,
  handleFieldToggle,
  handleFieldLabelChange,
  enabled,
  setEnabled,
  redirectUrl,
  setRedirectUrl,
  registerButtonText,
  setRegisterButtonText,
  registerTitle,
  setRegisterTitle,
  registerSubtitle,
  setRegisterSubtitle,
  registerSubmitText,
  setRegisterSubmitText,
  termsText,
  setTermsText,
  trialEnabled,
  setTrialEnabled,
  trialText,
  setTrialText,
  trialLinkText,
  setTrialLinkText,
  trialModalTitle,
  setTrialModalTitle,
  trialModalMessage,
  setTrialModalMessage,
  trialModalConfirmText,
  setTrialModalConfirmText,
  trialModalCancelText,
  setTrialModalCancelText,
  saleMode = false,
  setSaleMode,
}: RegistrationInspectorProps) {
  const [activeSection, setActiveSection] = useState<NavSection>('fields');

  // Count active fields (excluding opt-in)
  const activeFieldsCount = useMemo(() => {
    let count = 0;
    if (fields.usernameEnabled) count++;
    if (fields.nameEnabled) count++;
    if (fields.phoneEnabled) count++;
    if (fields.emailEnabled) count++;
    if (fields.birthDateEnabled) count++;
    if (fields.cpfEnabled) count++;
    if (fields.genderEnabled) count++;
    if (fields.passwordEnabled) count++;
    if (fields.customFieldEnabled) count++;
    return count;
  }, [fields]);

  // Count required fields
  const requiredFieldsCount = useMemo(() => {
    let count = 0;
    if (fields.usernameEnabled && fields.usernameRequired) count++;
    if (fields.nameEnabled && fields.nameRequired) count++;
    if (fields.phoneEnabled && fields.phoneRequired) count++;
    if (fields.emailEnabled && fields.emailRequired) count++;
    if (fields.birthDateEnabled && fields.birthDateRequired) count++;
    if (fields.cpfEnabled && fields.cpfRequired) count++;
    if (fields.genderEnabled && fields.genderRequired) count++;
    if (fields.passwordEnabled && fields.passwordRequired) count++;
    if (fields.customFieldEnabled && fields.customFieldRequired) count++;
    return count;
  }, [fields]);

  // Modo de cadastro adaptativo detectado
  const registrationModeInfo = useMemo(() => {
    const isPhoneOnly = fields.phoneEnabled && !fields.nameEnabled && !fields.usernameEnabled && !fields.passwordEnabled;
    const isNameAndPhone = fields.nameEnabled && fields.phoneEnabled && !fields.usernameEnabled && !fields.passwordEnabled;
    const isNoIdentifier = !fields.phoneEnabled && !fields.nameEnabled && !fields.usernameEnabled;

    if (isPhoneOnly) {
      return {
        badge: 'Modo Apenas WhatsApp',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: '📱',
        desc: 'O visitante só precisará digitar seu WhatsApp. O usuário e a senha no MikroTik serão gerados automaticamente como o número de celular (sem senhas adicionais).'
      };
    }
    if (isNameAndPhone) {
      return {
        badge: 'Modo Nome + WhatsApp',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        icon: '👤📱',
        desc: 'O visitante informará seu Nome Completo e WhatsApp. O nome é gravado no sistema e o usuário/senha no MikroTik serão o número de WhatsApp cadastrado.'
      };
    }
    if (isNoIdentifier) {
      return {
        badge: 'Requisito Mínimo: Usuário & Senha',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: '⚠️',
        desc: 'Nenhum identificador de lead (WhatsApp ou Nome) está ativo. É obrigatório solicitar no mínimo Usuário e Senha para que o login do MikroTik possa ser gerado.'
      };
    }
    return {
      badge: 'Modo Personalizado',
      color: 'bg-slate-50 border-slate-200 text-slate-800',
      icon: '⚙️',
      desc: 'Os campos selecionados abaixo serão exigidos no cadastro. Caso Senha não esteja ativada, a senha será o WhatsApp ou padrão do sistema.'
    };
  }, [fields]);

  // Conversion friction score
  const frictionScore = useMemo(() => {
    if (!enabled) return { label: 'Desativado', color: 'text-slate-500', badgeBg: 'bg-slate-800' };
    if (requiredFieldsCount <= 2 && activeFieldsCount <= 3) {
      return { label: '98% Conversão Máxima', color: 'text-emerald-400', badgeBg: 'bg-emerald-950/60 border-emerald-500/30' };
    }
    if (requiredFieldsCount <= 4 && activeFieldsCount <= 5) {
      return { label: '85% Conversão Alta', color: 'text-cyan-400', badgeBg: 'bg-cyan-950/60 border-cyan-500/30' };
    }
    if (requiredFieldsCount <= 6) {
      return { label: '65% Conversão Moderada', color: 'text-amber-400', badgeBg: 'bg-amber-950/60 border-amber-500/30' };
    }
    return { label: '45% Conversão Baixa', color: 'text-rose-400', badgeBg: 'bg-rose-950/60 border-rose-500/30' };
  }, [enabled, requiredFieldsCount, activeFieldsCount]);

  // Presets
  const applyPreset = (presetType: 'express' | 'hotspot' | 'marketing' | 'hospitality') => {
    if (presetType === 'express') {
      setFields({
        nameEnabled: true,
        nameRequired: true,
        phoneEnabled: true,
        phoneRequired: true,
        emailEnabled: false,
        emailRequired: false,
        birthDateEnabled: false,
        birthDateRequired: false,
        cpfEnabled: false,
        cpfRequired: false,
        genderEnabled: false,
        genderRequired: false,
        passwordEnabled: true,
        passwordRequired: true,
        customFieldEnabled: false,
        customFieldLabel: '',
        customFieldRequired: false,
        optInCoursesEnabled: true,
        optInCoursesLabel: 'Aceito receber novidades e avisos da rede',
      });
      setRegisterTitle('Acesso Rápido ao Wi-Fi');
      setRegisterSubtitle('Informe seu WhatsApp para conectar em segundos');
    } else if (presetType === 'hotspot') {
      setFields({
        nameEnabled: true,
        nameRequired: true,
        phoneEnabled: true,
        phoneRequired: true,
        emailEnabled: false,
        emailRequired: false,
        birthDateEnabled: false,
        birthDateRequired: false,
        cpfEnabled: true,
        cpfRequired: true,
        genderEnabled: false,
        genderRequired: false,
        passwordEnabled: true,
        passwordRequired: true,
        customFieldEnabled: false,
        customFieldLabel: '',
        customFieldRequired: false,
        optInCoursesEnabled: false,
        optInCoursesLabel: '',
      });
      setRegisterTitle('Cadastro de Acesso');
      setRegisterSubtitle('Crie seu login e senha para navegar com segurança');
    } else if (presetType === 'marketing') {
      setFields({
        nameEnabled: true,
        nameRequired: true,
        phoneEnabled: true,
        phoneRequired: true,
        emailEnabled: true,
        emailRequired: true,
        birthDateEnabled: true,
        birthDateRequired: false,
        cpfEnabled: false,
        cpfRequired: false,
        genderEnabled: false,
        genderRequired: false,
        passwordEnabled: true,
        passwordRequired: true,
        customFieldEnabled: false,
        customFieldLabel: '',
        customFieldRequired: false,
        optInCoursesEnabled: true,
        optInCoursesLabel: 'Quero receber ofertas e promoções exclusivas',
      });
      setRegisterTitle('Wi-Fi Grátis com Vantagens');
      setRegisterSubtitle('Preencha seus dados e ganhe acesso imediato');
    } else if (presetType === 'hospitality') {
      setFields({
        nameEnabled: true,
        nameRequired: true,
        phoneEnabled: true,
        phoneRequired: true,
        emailEnabled: false,
        emailRequired: false,
        birthDateEnabled: false,
        birthDateRequired: false,
        cpfEnabled: false,
        cpfRequired: false,
        genderEnabled: false,
        genderRequired: false,
        passwordEnabled: true,
        passwordRequired: true,
        customFieldEnabled: true,
        customFieldLabel: 'Número do Quarto / Mesa',
        customFieldRequired: true,
        optInCoursesEnabled: true,
        optInCoursesLabel: 'Aceito receber o cardápio e promoções no WhatsApp',
      });
      setRegisterTitle('Bem-vindo à nossa Rede');
      setRegisterSubtitle('Informe seus dados para liberar a internet');
    }
  };

  const navItems: { id: NavSection; icon: React.ReactNode; label: string; badge?: string }[] = [
    { id: 'fields', icon: <ClipboardList className="w-4 h-4" />, label: 'Campos', badge: `${activeFieldsCount}/8` },
    { id: 'texts', icon: <FileText className="w-4 h-4" />, label: 'Textos' },
    { id: 'trial', icon: <Zap className="w-4 h-4" />, label: 'Acesso Trial', badge: trialEnabled ? 'ON' : 'OFF' },
    { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Avançado' },
  ];

  return (
    <div className="flex flex-col gap-0 rounded-2xl bg-white overflow-hidden" style={{ minHeight: 560 }}>

      {/* ── TOP HEADER BAR ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-sans font-bold text-slate-800 tracking-wide uppercase">Formulário de Cadastro</h3>
              <span className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LEADS ENGINE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              {activeFieldsCount} de 8 campos ativos • {requiredFieldsCount} obrigatório(s)
            </p>
          </div>
        </div>

        {/* Quick Presets & Conversion Score */}
        <div className="flex items-center gap-2.5">
          {/* Conversion Friction Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono ${frictionScore.badgeBg} ${frictionScore.color}`}>
            <Sparkles className="w-3 h-3" />
            <span className="font-bold">{frictionScore.label}</span>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
            <span className="text-[9px] font-sans text-slate-500 px-1.5 font-bold uppercase hidden md:inline">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('express')}
              title="Apenas Nome + WhatsApp (Máxima Conversão)"
              className="text-[10px] font-sans px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold transition-all cursor-pointer shadow-xs"
            >
              🚀 Express
            </button>
            <button
              type="button"
              onClick={() => applyPreset('hotspot')}
              title="Padrão Provedor (Nome, WhatsApp, CPF e Senha)"
              className="text-[10px] font-sans px-2 py-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
            >
              🏢 Provedor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('marketing')}
              title="Marketing (Nome, WhatsApp, E-mail, Opt-In)"
              className="text-[10px] font-sans px-2 py-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-all hidden lg:inline cursor-pointer font-medium"
            >
              🎯 Marketing
            </button>
            <button
              type="button"
              onClick={() => applyPreset('hospitality')}
              title="Café / Bar / Hotel (Mesa/Quarto dinâmico)"
              className="text-[10px] font-sans px-2 py-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-all hidden xl:inline cursor-pointer font-medium"
            >
              ☕ Eventos
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY: SIDEBAR + CONTENT AREA ──────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 480 }}>

        {/* Vertical Nav Sidebar */}
        <div className="w-36 bg-slate-50/40 border-r border-slate-100 flex flex-col p-2 gap-1 shrink-0 select-none">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-xs font-sans font-medium transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate text-[11px]">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-full" />
                )}
              </button>
            );
          })}

          {/* Quick Notice Info Box at Bottom */}
          <div className="mt-auto p-2.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/50 text-[10px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dica de Conversão</span>
            </div>
            <p className="leading-tight text-[9px] text-slate-500">
              Formulários com até 2 campos possuem taxa de conexão 40% maior.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 overflow-y-auto bg-white space-y-5">

          {/* ────────────────────────────────────────────────────────────── */}
          {/* TAB 1: CAMPOS DE CAPTURA                                      */}
          {/* ────────────────────────────────────────────────────────────── */}
          {activeSection === 'fields' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider">
                    Campos de Captura de Leads
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Defina quais informações o cliente deve fornecer na tela de auto-cadastro.
                  </p>
                </div>
                <span className="text-[10px] font-sans font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                  {activeFieldsCount} / 9 Selecionados
                </span>
              </div>

              {/* Informational banner adaptativo com o modo de cadastro */}
              <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs shadow-xs transition-all ${registrationModeInfo.color}`}>
                <span className="text-base shrink-0 mt-0.5">{registrationModeInfo.icon}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-[12px]">{registrationModeInfo.badge}</strong>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {registrationModeInfo.desc}
                  </p>
                </div>
              </div>

              {/* Grid of Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                {/* 1. WhatsApp / Celular */}
                <FieldCard
                  icon={<Phone className="w-4 h-4 text-emerald-600" />}
                  title="WhatsApp / Celular"
                  desc="Número para contato, campanhas e login instantâneo"
                  enabled={fields.phoneEnabled}
                  required={fields.phoneRequired}
                  onToggleEnabled={() => handleFieldToggle('phoneEnabled')}
                  onToggleRequired={() => handleFieldToggle('phoneRequired')}
                  placeholder="(11) 99999-9999"
                  isHighlighted
                />

                {/* 2. Nome Completo */}
                <FieldCard
                  icon={<User className="w-4 h-4 text-blue-600" />}
                  title="Nome Completo"
                  desc="Solicita o nome do visitante para saudações e cadastro"
                  enabled={fields.nameEnabled}
                  required={fields.nameRequired}
                  onToggleEnabled={() => handleFieldToggle('nameEnabled')}
                  onToggleRequired={() => handleFieldToggle('nameRequired')}
                  placeholder="Ex: João da Silva"
                />

                {/* 3. Usuário (Login) */}
                <FieldCard
                  icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
                  title="Usuário (Login Próprio)"
                  desc="Permite ao visitante escolher um nome de usuário para login"
                  enabled={Boolean(fields.usernameEnabled)}
                  required={Boolean(fields.usernameRequired)}
                  onToggleEnabled={() => handleFieldToggle('usernameEnabled' as any)}
                  onToggleRequired={() => handleFieldToggle('usernameRequired' as any)}
                  placeholder="Ex: joaodasilva"
                />

                {/* 3. E-mail */}
                <FieldCard
                  icon={<Mail className="w-4 h-4 text-blue-500" />}
                  title="E-mail"
                  desc="Endereço de e-mail para newsletter e marketing"
                  enabled={fields.emailEnabled}
                  required={fields.emailRequired}
                  onToggleEnabled={() => handleFieldToggle('emailEnabled')}
                  onToggleRequired={() => handleFieldToggle('emailRequired')}
                  placeholder="cliente@exemplo.com"
                />

                {/* 4. CPF */}
                <FieldCard
                  icon={<CreditCard className="w-4 h-4 text-amber-600" />}
                  title="CPF"
                  desc="Documento oficial para identificação conforme Marco Civil"
                  enabled={fields.cpfEnabled}
                  required={fields.cpfRequired}
                  onToggleEnabled={() => handleFieldToggle('cpfEnabled')}
                  onToggleRequired={() => handleFieldToggle('cpfRequired')}
                  placeholder="000.000.000-00"
                />

                {/* 5. Data de Nascimento */}
                <FieldCard
                  icon={<Calendar className="w-4 h-4 text-cyan-600" />}
                  title="Data de Nascimento"
                  desc="Útil para promoções de aniversário ou senha padrão"
                  enabled={fields.birthDateEnabled}
                  required={fields.birthDateRequired}
                  onToggleEnabled={() => handleFieldToggle('birthDateEnabled')}
                  onToggleRequired={() => handleFieldToggle('birthDateRequired')}
                  placeholder="DD/MM/AAAA"
                />

                {/* 6. Gênero */}
                <FieldCard
                  icon={<UserPlus className="w-4 h-4 text-pink-600" />}
                  title="Gênero"
                  desc="Seleção Masculino / Feminino para segmentação"
                  enabled={fields.genderEnabled}
                  required={fields.genderRequired}
                  onToggleEnabled={() => handleFieldToggle('genderEnabled')}
                  onToggleRequired={() => handleFieldToggle('genderRequired')}
                  placeholder="Selecione: Masculino / Feminino"
                />

                {/* 7. Senha e Confirmação */}
                <FieldCard
                  icon={<Lock className="w-4 h-4 text-teal-600" />}
                  title="Senha e Confirmação"
                  desc="Sempre 2 campos (Criação e Confirmação) com visualização e validação ao vivo"
                  enabled={fields.passwordEnabled}
                  required={fields.passwordRequired}
                  onToggleEnabled={() => handleFieldToggle('passwordEnabled')}
                  onToggleRequired={() => handleFieldToggle('passwordRequired')}
                  placeholder="•••••••• (2 Campos de Senha)"
                />

                {/* 8. Campo Livre Personalizado */}
                <div className={`rounded-xl px-3 py-2.5 flex flex-col gap-2 transition-all md:col-span-2 ${
                  fields.customFieldEnabled
                    ? 'bg-slate-50/70 ring-1 ring-slate-200/80 shadow-2xs'
                    : 'bg-slate-50/30 ring-1 ring-slate-200/40 opacity-60'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        fields.customFieldEnabled ? 'bg-blue-50 ring-1 ring-blue-200 text-blue-600' : 'bg-slate-200 ring-1 ring-slate-300 text-slate-500'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`font-sans text-xs font-semibold block truncate ${fields.customFieldEnabled ? 'text-slate-800' : 'text-slate-500'}`}>
                          Pergunta Livre (Personalizada)
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans block truncate">
                          {fields.customFieldLabel || 'Ex: Número da Mesa, Quarto ou Pergunta aberta'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {fields.customFieldEnabled ? (
                        <button
                          type="button"
                          onClick={() => handleFieldToggle('customFieldRequired')}
                          title={fields.customFieldRequired ? 'Campo obrigatório (clique para tornar opcional)' : 'Campo opcional (clique para tornar obrigatório)'}
                          className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            fields.customFieldRequired
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 shadow-2xs'
                              : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800'
                          }`}
                        >
                          {fields.customFieldRequired ? '★ OBRIGATÓRIO' : 'OPCIONAL'}
                        </button>
                      ) : (
                        <span className="text-[9px] font-sans text-slate-400 px-1">
                          INATIVO
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleFieldToggle('customFieldEnabled')}
                        title={fields.customFieldEnabled ? 'Desativar campo' : 'Ativar campo'}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none relative flex items-center cursor-pointer ${
                          fields.customFieldEnabled ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                            fields.customFieldEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {fields.customFieldEnabled && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2 animate-fade-in">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={fields.customFieldLabel}
                          onChange={e => handleFieldLabelChange(e.target.value)}
                          placeholder="Digite a pergunta (Ex: Número da Mesa / Quarto):"
                          className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-1.5 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xs"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-sans text-slate-400">Sugestões:</span>
                        {['Mesa / Quarto', 'Como nos conheceu?', 'CPF da Nota'].map(sug => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleFieldLabelChange(sug)}
                            className="text-[9px] font-sans text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-md ring-1 ring-slate-200/60 cursor-pointer transition-all"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* TAB 2: TEXTOS & MENSAGENS                                     */}
          {/* ────────────────────────────────────────────────────────────── */}
          {activeSection === 'texts' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider">
                  Textos da Tela de Cadastro
                </h4>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Personalize títulos, subtítulos, botões de envio e termos de uso.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Título Principal */}
                <div className="bg-slate-50/60 ring-1 ring-slate-200/70 rounded-xl p-3 space-y-1.5 transition-all hover:ring-slate-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans text-slate-700 font-semibold">Título da Tela</label>
                    <span className="text-[10px] text-slate-400 font-sans">Topo do formulário</span>
                  </div>
                  <input
                    type="text"
                    value={registerTitle}
                    onChange={e => setRegisterTitle(e.target.value)}
                    placeholder="Ex: Wi-Fi Grátis"
                    className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xs"
                  />
                </div>

                {/* Subtítulo */}
                <div className="bg-slate-50/60 ring-1 ring-slate-200/70 rounded-xl p-3 space-y-1.5 transition-all hover:ring-slate-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans text-slate-700 font-semibold">Subtítulo Explicativo</label>
                    <span className="text-[10px] text-slate-400 font-sans">Instrução inicial</span>
                  </div>
                  <input
                    type="text"
                    value={registerSubtitle}
                    onChange={e => setRegisterSubtitle(e.target.value)}
                    placeholder="Ex: Preencha os campos abaixo para liberar seu acesso"
                    className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xs"
                  />
                </div>

                {/* Texto do Botão no Login */}
                <div className="bg-slate-50/60 ring-1 ring-slate-200/70 rounded-xl p-3 space-y-1.5 transition-all hover:ring-slate-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans text-slate-700 font-semibold">Botão de Cadastro (Login)</label>
                    <span className="text-[10px] text-slate-400 font-sans">Acesso ao formulário</span>
                  </div>
                  <input
                    type="text"
                    value={registerButtonText}
                    onChange={e => setRegisterButtonText(e.target.value)}
                    placeholder="Ex: Cadastre-se aqui"
                    className="w-full bg-white text-blue-700 font-sans font-semibold text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xs"
                  />
                </div>

                {/* Botão de Envio (Submit) */}
                <div className="bg-slate-50/60 ring-1 ring-slate-200/70 rounded-xl p-3 space-y-1.5 transition-all hover:ring-slate-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans text-slate-700 font-semibold">Texto do Botão de Conectar</label>
                    <span className="text-[10px] text-slate-400 font-sans">Ação de liberação</span>
                  </div>
                  <input
                    type="text"
                    value={registerSubmitText}
                    onChange={e => setRegisterSubmitText(e.target.value)}
                    placeholder="Ex: Cadastrar e Conectar"
                    className="w-full bg-white text-slate-800 font-sans font-semibold text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xs"
                  />
                </div>

                {/* Termos de Uso (LGPD) */}
                <div className="bg-slate-50/60 ring-1 ring-slate-200/70 rounded-xl p-3 space-y-1.5 md:col-span-2 transition-all hover:ring-slate-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans text-slate-700 font-semibold">Termos de Uso & Privacidade (LGPD)</label>
                    <span className="text-[10px] text-slate-400 font-sans">Rodapé de conformidade</span>
                  </div>
                  <textarea
                    rows={2}
                    value={termsText}
                    onChange={e => setTermsText(e.target.value)}
                    placeholder="Ex: Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade."
                    className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* TAB 3: ACESSO TRIAL / DEGUSTAÇÃO                             */}
          {/* ────────────────────────────────────────────────────────────── */}
          {activeSection === 'trial' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider">
                    Acesso Grátis / Degustação (Trial)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Permite ao cliente testar a internet por tempo limitado (ex: 15/30 min) antes de se cadastrar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrialEnabled(!trialEnabled)}
                  className={`text-xs font-sans font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    trialEnabled
                      ? 'bg-amber-50 ring-1 ring-amber-300 text-amber-800 shadow-2xs'
                      : 'bg-slate-100 ring-1 ring-slate-200/70 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {trialEnabled ? '✓ Trial Ativado' : '✕ Trial Desativado'}
                </button>
              </div>

              {trialEnabled ? (
                <div className="space-y-3.5 pt-1">
                  {/* Link no Rodapé do Login */}
                  <div className="p-3.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/70 space-y-2.5">
                    <span className="block text-xs font-sans font-semibold text-amber-800 uppercase tracking-wide">
                      1. Botão / Link no Rodapé da Tela de Login
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-sans text-slate-500 font-medium mb-1">Texto Introdutório</label>
                        <input
                          type="text"
                          value={trialText}
                          onChange={e => setTrialText(e.target.value)}
                          placeholder="Ex: Acesso de teste disponível, "
                          className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-sans text-slate-500 font-medium mb-1">Rótulo do Link Clicável</label>
                        <input
                          type="text"
                          value={trialLinkText}
                          onChange={e => setTrialLinkText(e.target.value)}
                          placeholder="Ex: clique aqui"
                          className="w-full bg-white text-amber-700 font-sans font-bold text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal de Confirmação */}
                  <div className="p-3.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/70 space-y-2.5">
                    <span className="block text-xs font-sans font-semibold text-amber-800 uppercase tracking-wide">
                      2. Modal de Confirmação do Acesso Grátis
                    </span>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-sans text-slate-500 font-medium mb-1">Título do Modal</label>
                        <input
                          type="text"
                          value={trialModalTitle}
                          onChange={e => setTrialModalTitle(e.target.value)}
                          placeholder="Ex: Acesso de Teste"
                          className="w-full bg-white text-slate-800 font-sans font-semibold text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-sans text-slate-500 font-medium mb-1">Mensagem de Alerta</label>
                        <textarea
                          rows={2}
                          value={trialModalMessage}
                          onChange={e => setTrialModalMessage(e.target.value)}
                          placeholder="Ex: Tem certeza de que deseja liberar o acesso grátis por 30 minutos?"
                          className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-amber-500/40 resize-none shadow-2xs"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-sans text-slate-500 font-medium mb-1">Botão Confirmar</label>
                          <input
                            type="text"
                            value={trialModalConfirmText}
                            onChange={e => setTrialModalConfirmText(e.target.value)}
                            placeholder="Ex: Sim, Conectar"
                            className="w-full bg-white text-emerald-700 font-sans font-bold text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-sans text-slate-500 font-medium mb-1">Botão Cancelar</label>
                          <input
                            type="text"
                            value={trialModalCancelText}
                            onChange={e => setTrialModalCancelText(e.target.value)}
                            placeholder="Ex: Não, Voltar"
                            className="w-full bg-white text-rose-700 font-sans font-bold text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-50/40 ring-1 ring-dashed ring-slate-200 text-center space-y-2">
                  <Zap className="w-8 h-8 text-slate-400 mx-auto" />
                  <h5 className="text-xs font-sans font-bold text-slate-700">O Acesso Trial está desativado</h5>
                  <p className="text-[11px] text-slate-500 font-sans max-w-md mx-auto">
                    Quando ativado, os clientes podem navegar por um período de teste sem precisar preencher o cadastro de imediato.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTrialEnabled(true)}
                    className="mt-2 text-xs font-sans font-bold px-4 py-2 rounded-lg bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all shadow-xs cursor-pointer"
                  >
                    Ativar Acesso Trial
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* TAB 4: AVANÇADO / REDIRECIONAMENTO & LGPD                    */}
          {/* ────────────────────────────────────────────────────────────── */}
          {activeSection === 'settings' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider">
                  Configurações Globais & Redirecionamento
                </h4>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Controle a visibilidade do botão de cadastro, links pós-login e consentimentos.
                </p>
              </div>

              {/* Habilitar Auto-Cadastro Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/70 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="block text-xs font-sans font-semibold text-slate-800">Habilitar Auto-Cadastro Global</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Exibe ou oculta o botão de cadastro na tela inicial de login do Hotspot
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`text-xs font-sans font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    enabled
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {enabled ? '✓ Habilitado' : '✕ Oculto'}
                </button>
              </div>

              {/* Redirecionamento Pós-Login */}
              <div className="p-3.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/70 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-sans font-semibold text-slate-800">Link de Redirecionamento Pós-Login</span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      Página que abre automaticamente após o usuário conectar (Site, Instagram ou WhatsApp)
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRedirectUrl('https://wa.me/55')}
                      className="text-[10px] font-sans px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200 font-medium transition-all cursor-pointer"
                    >
                      + WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedirectUrl('https://instagram.com/')}
                      className="text-[10px] font-sans px-2.5 py-1 rounded-md bg-pink-50 text-pink-700 hover:bg-pink-100 ring-1 ring-pink-200 font-medium transition-all cursor-pointer"
                    >
                      + Instagram
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={redirectUrl}
                  onChange={e => setRedirectUrl(e.target.value)}
                  placeholder="Ex: https://wa.me/5511999999999 ou https://seusite.com.br"
                  className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 shadow-2xs"
                />
              </div>

              {/* Opt-In de Cursos / Ofertas */}
              <div className="p-3.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/70 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-sans font-semibold text-slate-800">Opt-In de Campanhas & Ofertas</span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      Checkbox de consentimento para envio de avisos e promoções
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldToggle('optInCoursesEnabled')}
                    className={`text-[10px] font-sans font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      fields.optInCoursesEnabled
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {fields.optInCoursesEnabled ? '✓ Ativado' : '✕ Desativado'}
                  </button>
                </div>

                {fields.optInCoursesEnabled && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5 animate-fade-in">
                    <label className="block text-[10px] font-sans text-slate-500 font-medium">Texto do Checkbox de Consentimento:</label>
                    <input
                      type="text"
                      value={fields.optInCoursesLabel}
                      onChange={e => setFields(prev => ({ ...prev, optInCoursesLabel: e.target.value }))}
                      placeholder="Ex: Eu aceito receber novidades e avisos no meu WhatsApp"
                      className="w-full bg-white text-slate-800 font-sans text-xs px-3 py-2 rounded-lg ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-blue-500/40 shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Modo Venda de Planos (PIX / Hotspot Grace Period) */}
              <div className="p-4 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/70 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="block text-xs font-sans font-bold text-slate-800">Modo Venda de Planos no Cadastro</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">PIX MERCADO PAGO</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans block max-w-lg leading-relaxed">
                      Quando ativo, o cliente seleciona um plano pago no cadastro e ganha <strong>15 minutos de tolerância</strong> para pagar o Pix recebido na tela e via WhatsApp. A velocidade e o tempo são atualizados via Webhook <strong>sem derrubar a conexão</strong>.
                    </span>
                  </div>
                  {setSaleMode && (
                    <button
                      type="button"
                      onClick={() => setSaleMode(!saleMode)}
                      className={`text-xs font-sans font-bold py-1.5 px-3.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                        saleMode
                          ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                          : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {saleMode ? '✓ Ativado' : '✕ Desativado'}
                    </button>
                  )}
                </div>

                {saleMode && (
                  <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-[11px] text-blue-900 font-medium">
                        Os planos e valores são cadastrados no módulo de Planos Hotspot.
                      </span>
                    </div>
                    <a
                      href="/dashboard/whatsapp-plans"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-sans font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                    >
                      Gerenciar Planos & Preços →
                    </a>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: FieldCard ─────────────────────────────────────────────────
interface FieldCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  enabled: boolean;
  required: boolean;
  onToggleEnabled: () => void;
  onToggleRequired: () => void;
  placeholder?: string;
  isHighlighted?: boolean;
}

function FieldCard({
  icon,
  title,
  desc,
  enabled,
  required,
  onToggleEnabled,
  onToggleRequired,
  placeholder,
  isHighlighted,
}: FieldCardProps) {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 flex items-center justify-between gap-2.5 transition-all ${
        enabled
          ? isHighlighted
            ? 'bg-blue-50/70 ring-1 ring-blue-300/80 shadow-2xs'
            : 'bg-slate-50/60 hover:bg-slate-50 ring-1 ring-slate-200/70 hover:ring-slate-300 shadow-2xs'
          : 'bg-slate-50/20 ring-1 ring-slate-200/40 opacity-50 hover:opacity-75'
      }`}
    >
      {/* Left info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          enabled ? 'bg-white ring-1 ring-slate-200/80 shadow-2xs' : 'bg-slate-100 ring-1 ring-slate-200/50 text-slate-400'
        }`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span className={`font-sans text-xs font-semibold block truncate ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>
            {title}
          </span>
          <span className="text-[10px] text-slate-400 font-sans block truncate">
            {placeholder || desc}
          </span>
        </div>
      </div>

      {/* Right Controls: Pill Obrigatório + Switch */}
      <div className="flex items-center gap-2 shrink-0">
        {enabled ? (
          <button
            type="button"
            onClick={onToggleRequired}
            title={required ? 'Campo obrigatório (clique para tornar opcional)' : 'Campo opcional (clique para tornar obrigatório)'}
            className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              required
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 shadow-2xs'
                : 'bg-white text-slate-400 ring-1 ring-slate-200/70 hover:text-slate-700'
            }`}
          >
            {required ? '★ OBRIGATÓRIO' : 'OPCIONAL'}
          </button>
        ) : (
          <span className="text-[9px] font-sans text-slate-400 px-1">
            INATIVO
          </span>
        )}

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={onToggleEnabled}
          title={enabled ? 'Desativar campo' : 'Ativar campo'}
          className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none relative flex items-center cursor-pointer ${
            enabled ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

