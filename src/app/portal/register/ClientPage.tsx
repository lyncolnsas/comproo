"use client";

import { useState, useEffect, useRef } from 'react';

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
}

const performAutoLogin = (username: string, passwordStr: string, loginUrl: string, dstUrl: string) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = loginUrl;
  
  const userInput = document.createElement('input');
  userInput.type = 'hidden';
  userInput.name = 'username';
  userInput.value = username;
  
  const passInput = document.createElement('input');
  passInput.type = 'hidden';
  passInput.name = 'password';
  passInput.value = passwordStr;
  
  form.appendChild(userInput);
  form.appendChild(passInput);
  
  if (dstUrl) {
    const dstInput = document.createElement('input');
    dstInput.type = 'hidden';
    dstInput.name = 'dst';
    dstInput.value = dstUrl;
    form.appendChild(dstInput);
  }
  
  document.body.appendChild(form);
  form.submit();
};

interface CarouselVideoProps {
  src: string;
  isCurrent: boolean;
  isMuted: boolean;
  onClick?: () => void;
}

function CarouselVideo({ src, isCurrent, isMuted, onClick }: CarouselVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

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

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const fill = fillRef.current;
    if (video && fill) {
      const pct = (video.currentTime / (video.duration || 1)) * 100;
      fill.style.width = `${pct}%`;
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        loop
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={onClick}
        onTimeUpdate={handleTimeUpdate}
      />
      {/* Sleek top loading bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-10 pointer-events-none">
        <div ref={fillRef} className="h-full bg-white transition-[width] duration-75 ease-linear" style={{ width: '0%' }} />
      </div>
    </div>
  );
}


export default function AutoCadastro({ initialConfig }: { initialConfig: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ddd, setDdd] = useState('');
  const [celular, setCelular] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(initialConfig?.redirectUrl || '');
  const [portalEnabled, setPortalEnabled] = useState(initialConfig?.enabled !== false);
  const [usernameField, setUsernameField] = useState('');

  // Refs for Autofocus transition
  const celularRef = useRef<HTMLInputElement>(null);
  const birthMonthRef = useRef<HTMLInputElement>(null);
  const birthYearRef = useRef<HTMLInputElement>(null);
  
  // Customization States
  const [brandColor, setBrandColor] = useState(initialConfig?.colors?.brand || '#00897b');
  const [ad, setAd] = useState<AdConfig | null>(initialConfig?.ad || null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => 
    initialConfig?.ad?.timerEnabled && initialConfig?.ad?.type !== 'none' 
      ? initialConfig?.ad?.timerDuration || 15 
      : 0
  );
  const [timerActive, setTimerActive] = useState(() => 
    !!(initialConfig?.ad?.timerEnabled && initialConfig?.ad?.type !== 'none')
  );
  const [linkLoginOnly, setLinkLoginOnly] = useState('http://192.168.88.1/login');
  const [linkOrig, setLinkOrig] = useState('');
  
  const [registerTitle, setRegisterTitle] = useState(initialConfig?.registerTitle || 'Wi-Fi Grátis');
  const [registerSubtitle, setRegisterSubtitle] = useState(initialConfig?.registerSubtitle || 'Cadastre-se abaixo para liberar o acesso à internet');
  const [registerSubmitText, setRegisterSubmitText] = useState(initialConfig?.registerSubmitText || 'Cadastrar e Conectar');
  const [termsText, setTermsText] = useState(initialConfig?.termsText || 'Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.');
  
  // Fields Configuration
  const [fields, setFields] = useState<FieldsConfig>({
    nameEnabled: false,
    nameRequired: false,
    phoneEnabled: false,
    phoneRequired: false,
    birthDateEnabled: false,
    birthDateRequired: false,
    emailEnabled: false,
    emailRequired: false,
    cpfEnabled: false,
    cpfRequired: false,
    genderEnabled: false,
    genderRequired: false,
    passwordEnabled: true,
    passwordRequired: true,
    customFieldEnabled: false,
    customFieldLabel: 'Descreva aqui!',
    customFieldRequired: false,
    ...(initialConfig?.fields || {})
  });

  useEffect(() => {
    // Detect MikroTik gateway IP and redirect URL from parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const gateway = params.get('link-login-only');
      const orig = params.get('link-orig');
      setTimeout(() => {
        if (gateway) setLinkLoginOnly(gateway);
        if (orig) setLinkOrig(orig);
      }, 0);

      // DOUBLE SAFETY NET: Detect native GET form submission fallback
      const getUsername = params.get('username');
      const getPassword = params.get('password');
      const getName = params.get('name') || '';
      const getEmail = params.get('email') || '';
      const getDdd = params.get('ddd') || '';
      const getCelular = params.get('celular') || '';
      const getCpf = params.get('cpf') || '';
      const getGender = params.get('gender') || '';
      const getCustomFieldValue = params.get('customFieldValue') || '';
      
      if (getUsername && getPassword && !success && !loading) {
        console.log('[Autocadastro] Detectado envio GET fallback. Registrando usuário...');
        
        let combinedPhone = '';
        if (fields.phoneEnabled && getDdd && getCelular) {
          combinedPhone = `${getDdd.trim()}${getCelular.replace(/\D/g, '').trim()}`;
        }
        
        let combinedBirthDate = null;
        const birthDay = params.get('birthDay');
        const birthMonth = params.get('birthMonth');
        const birthYear = params.get('birthYear');
        if (fields.birthDateEnabled && birthYear && birthMonth && birthDay) {
          const mm = birthMonth.length < 2 ? `0${birthMonth}` : birthMonth;
          const ddVal = birthDay.length < 2 ? `0${birthDay}` : birthDay;
          combinedBirthDate = `${birthYear}-${mm}-${ddVal}`;
        }

        const payload = {
          name: getName,
          email: getEmail,
          phone: combinedPhone || getUsername,
          username: getUsername,
          birthDate: combinedBirthDate,
          cpf: getCpf,
          gender: getGender,
          password: getPassword,
          customFieldValue: getCustomFieldValue
        };

        setLoading(true);
        setError('');
        
        // Remove query parameters from URL so refreshing doesn't re-register
        const cleanUrl = window.location.pathname + '?' + 
          (gateway ? `link-login-only=${encodeURIComponent(gateway)}&` : '') + 
          (orig ? `link-orig=${encodeURIComponent(orig)}` : '');
        window.history.replaceState({}, document.title, cleanUrl);

        fetch('/api/portal/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSuccess('Cadastro concluído! Redirecionando...');
            const { username, password: createdPassword } = data.data;
            const finalDst = data.data?.redirectUrl || data.config?.redirectUrl || redirectUrl || orig;
            const targetLoginUrl = gateway || 'http://192.168.88.1/login';
            setTimeout(() => {
              performAutoLogin(username, createdPassword, targetLoginUrl, finalDst);
            }, 500);
          } else {
            setError(data.message || 'Erro ao cadastrar.');
          }
        })
        .catch(err => {
          console.error('[Autocadastro] Erro no registro GET fallback:', err);
          setError('Erro de conexão ao registrar.');
        })
        .finally(() => {
          setLoading(false);
        });
      }
    }
  }, [fields]);

  // Carousel Auto-play Interval Effect
  const carouselItems = ad?.type === 'carousel' && Array.isArray(ad.items)
    ? ad.items.filter(item => item && item.url)
    : [];

  useEffect(() => {
    if (carouselItems.length > 1) {
      const interval = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % carouselItems.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [carouselItems.length]);

  // Countdown Timer Effect for Advertisement
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive]);

  // Helper to extract YouTube video embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtube.com/embed/')) {
        return url;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  // Input handlers for numeric inputs, formatting masks, and autofocus shifts
  const handleDddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setDdd(val);
    if (val.length === 2 && celularRef.current) {
      celularRef.current.focus();
    }
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 9) val = val.slice(0, 9);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCelular(val);
  };

  const handleBirthDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setBirthDay(val);
    if (val.length === 2 && birthMonthRef.current) {
      birthMonthRef.current.focus();
    }
  };

  const handleBirthMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setBirthMonth(val);
    if (val.length === 2 && birthYearRef.current) {
      birthYearRef.current.focus();
    }
  };

  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setBirthYear(val);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 9) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
    } else if (val.length > 6) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)}.${val.slice(3)}`;
    }
    setCpf(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[Autocadastro] Iniciando envio do formulário...');

      if (password !== confirmPassword) {
        console.warn('[Autocadastro] Erro: as senhas não coincidem.');
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }

      const combinedPhone = fields.phoneEnabled ? `${ddd.trim()}${celular.replace(/\D/g, '').trim()}` : usernameField.trim();
      let combinedBirthDate = null;
      if (fields.birthDateEnabled && birthYear && birthMonth && birthDay) {
        const mm = birthMonth.length < 2 ? `0${birthMonth}` : birthMonth;
        const ddVal = birthDay.length < 2 ? `0${birthDay}` : birthDay;
        combinedBirthDate = `${birthYear}-${mm}-${ddVal}`;
      }

      const payload = { 
        name, 
        email, 
        phone: combinedPhone, 
        username: usernameField,
        birthDate: combinedBirthDate, 
        cpf, 
        gender, 
        password, 
        customFieldValue 
      };

      console.log('[Autocadastro] Dados a serem enviados:', { ...payload, password: password ? '***' : null });

      const res = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log(`[Autocadastro] Resposta do servidor: Status ${res.status}`);
      const responseText = await res.text();
      console.log('[Autocadastro] Dados brutos da resposta:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error('[Autocadastro] Erro ao analisar resposta como JSON:', jsonErr);
        const snippet = responseText.substring(0, 300);
        setError(`Erro do servidor (Status ${res.status}). Resposta não-JSON: ${snippet}...`);
        window.alert(`ERRO DO SERVIDOR (Status ${res.status}):\n${snippet}...`);
        setLoading(false);
        return;
      }

      if (data.success) {
        setSuccess('Cadastro concluído! Redirecionando e conectando...');
        const { username, password: createdPassword } = data.data;
        
        // Auto-login via hidden form POST
        const finalDst = data.data?.redirectUrl || data.config?.redirectUrl || redirectUrl || linkOrig;
        const targetLoginUrl = linkLoginOnly || 'http://192.168.88.1/login';
        
        console.log(`[Autocadastro] Executando auto-login no MikroTik: ${targetLoginUrl} (usuário: ${username})`);
        setTimeout(() => {
          performAutoLogin(username, createdPassword, targetLoginUrl, finalDst);
        }, 500);

      } else {
        console.warn('[Autocadastro] Cadastro rejeitado pela API:', data.message);
        setError(data.message || 'Erro ao cadastrar.');
        window.alert(`CADASTRO REJEITADO:\n${data.message || 'Erro ao cadastrar.'}`);
      }
    } catch (err: any) {
      console.error('[Autocadastro] Falha de conexão com a API:', err);
      const errMsg = err?.message || String(err);
      setError(`Tentando conexão alternativa...`);
      
      try {
        const form = e.target as HTMLFormElement;
        form.action = '/api/portal/register';
        form.method = 'POST';
        form.submit();
      } catch (submitErr: any) {
        console.error('[Autocadastro] Erro ao submeter formulário nativamente:', submitErr);
        setError(`Erro de conexão com o servidor: ${errMsg}`);
        window.alert(`ERRO DE CONEXÃO COM O SERVIDOR:\n${errMsg}\n\nVerifique se o seu dispositivo está na rede Wi-Fi correta.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!portalEnabled) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Auto-Cadastro Desativado</h2>
          <p className="text-slate-500 text-sm">
            O cadastro de novos clientes está temporariamente desativado. Por favor, entre em contato com o estabelecimento.
          </p>
          <button
            onClick={() => {
              window.location.href = linkLoginOnly;
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
          >
            Voltar para o Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col pb-8 shadow-sm">
        
        {/* Dynamic Branded Header */}
        <div 
          className="px-4 py-8 text-center text-white relative transition-colors duration-300"
          style={{ backgroundColor: brandColor }}
        >
          <h2 className="text-2xl font-bold tracking-tight pt-2">{registerTitle}</h2>
          <p className="text-xs text-white/90 mt-1 font-sans">{registerSubtitle}</p>
        </div>

        {/* Main Card */}
        <div className="mx-4 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-xs rounded-lg border border-emerald-100 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Advertisement / Sponsorship Area */}
          {ad && ad.type !== 'none' && (ad.mediaUrl || (ad.type === 'carousel' && carouselItems.length > 0)) && (
            <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-sm">
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded font-medium backdrop-blur-sm z-10 uppercase tracking-wider">
                Patrocinado
              </span>
              
              {ad.type === 'image' && ad.mediaUrl && (
                ad.targetUrl ? (
                  <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img 
                      // eslint-disable-next-line @next/next/no-img-element
                      src={ad.mediaUrl} 
                      alt="Publicidade" 
                      className="w-full h-auto object-cover max-h-40 hover:opacity-90 transition-all cursor-pointer"
                    />
                  </a>
                ) : (
                  <img 
                    // eslint-disable-next-line @next/next/no-img-element
                    src={ad.mediaUrl} 
                    alt="Publicidade" 
                    className="w-full h-auto object-cover max-h-40"
                  />
                )
              )}

              {ad.type === 'video' && ad.mediaUrl && (
                <div className="aspect-video w-full bg-black relative">
                  {ad.mediaUrl.includes('youtube.com') || ad.mediaUrl.includes('youtu.be') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(ad.mediaUrl)}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <>
                      <CarouselVideo
                        src={ad.mediaUrl}
                        isCurrent={true}
                        isMuted={isMuted}
                        onClick={() => ad.targetUrl && window.open(ad.targetUrl, '_blank')}
                      />
                      {/* Floating Sound Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setIsMuted(prev => !prev)}
                        className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm hover:bg-black/85 transition-all z-20 border border-white/10"
                        title={isMuted ? "Ativar Som" : "Mutar Som"}
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {ad.type === 'carousel' && carouselItems.length > 0 && (
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {carouselItems.map((item, idx) => {
                    const isCurrent = idx === activeSlide;
                    return (
                      <div 
                        key={idx}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-500 flex items-center justify-center ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                      >
                        {item.type === 'video' ? (
                          <CarouselVideo
                            src={item.url}
                            isCurrent={isCurrent}
                            isMuted={isMuted}
                            onClick={() => item.targetUrl && window.open(item.targetUrl, '_blank')}
                          />
                        ) : (
                          <img 
                            // eslint-disable-next-line @next/next/no-img-element
                            src={item.url} 
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => item.targetUrl && window.open(item.targetUrl, '_blank')}
                          />
                        )}
                      </div>
                    );
                  })}
                  
                  {carouselItems.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                      {carouselItems.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeSlide ? 'bg-white scale-125' : 'bg-white/45'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Floating Sound Toggle Button */}
                  {carouselItems[activeSlide]?.type === 'video' && (
                    <button
                      type="button"
                      onClick={() => setIsMuted(prev => !prev)}
                      className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm hover:bg-black/85 transition-all z-20 border border-white/10"
                      title={isMuted ? "Ativar Som" : "Mutar Som"}
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>
                  )}
                </div>
              )}

              {/* Floating Timer Badge */}
              {ad.timerEnabled && timerActive && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] px-3 py-1 rounded-full font-bold backdrop-blur-sm z-20 border border-white/10">
                  Aguarde {timeLeft}s...
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} action="/api/portal/register" method="POST" className="space-y-4">
            <input type="hidden" name="link-login-only" value={linkLoginOnly} />
            <input type="hidden" name="link-orig" value={linkOrig} />
            {/* Nome Completo */}
            {fields.nameEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  Nome Completo {fields.nameRequired && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="text" 
                  name="name"
                  required={fields.nameRequired}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                />
              </div>
            )}

            {/* E-mail */}
            {fields.emailEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  E-mail {fields.emailRequired && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="email"
                  name="email"
                  required={fields.emailRequired}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: joao@email.com"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                />
              </div>
            )}

            {/* DDD e Celular (quando habilitado) */}
            {fields.phoneEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  DDD e Celular <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <input 
                    type="tel" 
                    name="ddd"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={2}
                    placeholder="DDD"
                    value={ddd}
                    onChange={handleDddChange}
                    className="col-span-3 h-11 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                  <input 
                    type="tel" 
                    name="celular"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={10}
                    placeholder="Celular"
                    value={celular}
                    onChange={handleCelularChange}
                    ref={celularRef}
                    className="col-span-9 h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Usuário (quando telefone desabilitado) */}
            {!fields.phoneEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  Usuário <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="username"
                  required
                  value={usernameField}
                  onChange={(e) => setUsernameField(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="Ex: joaoda_silva"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                />
              </div>
            )}

            {/* Data de Nascimento */}
            {fields.birthDateEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  Data de Nascimento {fields.birthDateRequired && <span className="text-red-500">*</span>}
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <input 
                    type="tel" 
                    name="birthDay"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required={fields.birthDateRequired}
                    maxLength={2}
                    placeholder="Dia"
                    value={birthDay}
                    onChange={handleBirthDayChange}
                    className="col-span-4 h-11 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                  <input 
                    type="tel" 
                    name="birthMonth"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required={fields.birthDateRequired}
                    maxLength={2}
                    placeholder="Mês"
                    value={birthMonth}
                    onChange={handleBirthMonthChange}
                    ref={birthMonthRef}
                    className="col-span-4 h-11 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                  <input 
                    type="tel" 
                    name="birthYear"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required={fields.birthDateRequired}
                    maxLength={4}
                    placeholder="Ano"
                    value={birthYear}
                    onChange={handleBirthYearChange}
                    ref={birthYearRef}
                    className="col-span-4 h-11 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* CPF */}
            {fields.cpfEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  CPF {fields.cpfRequired && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="tel" 
                  name="cpf"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required={fields.cpfRequired}
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                />
              </div>
            )}

            {/* Escolha seu Gênero */}
            {fields.genderEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  Gênero {fields.genderRequired && <span className="text-red-500">*</span>}
                </label>
                <select 
                  name="gender"
                  required={fields.genderRequired}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%231F2937' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="" className="text-slate-500">Escolha seu Gênero</option>
                  <option value="Homem">Homem</option>
                  <option value="Mulher">Mulher</option>
                  <option value="Não informar">Não informar</option>
                </select>
              </div>
            )}

            {/* Crie uma Senha */}
            {fields.passwordEnabled && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                    Crie uma Senha {fields.passwordRequired && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    required={fields.passwordRequired}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                    Confirme sua Senha {fields.passwordRequired && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    required={fields.passwordRequired}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all placeholder-slate-400"
                  />
                </div>
              </>
            )}

            {/* Dynamic Custom Lead Input */}
            {fields.customFieldEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                  {fields.customFieldLabel || 'Campo Personalizado'} {fields.customFieldRequired && <span className="text-red-500">*</span>}
                </label>
                <textarea 
                  name="customFieldValue"
                  required={fields.customFieldRequired}
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-slate-400 transition-all resize-none placeholder-slate-400"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !!success || timerActive}
              className="w-full h-11 rounded-xl font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 text-sm mt-2 cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              {loading ? 'Processando...' : success ? 'Conectando...' : timerActive ? `Aguarde ${timeLeft}s...` : registerSubmitText}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-center text-[10px] text-slate-500 font-sans">
              {termsText}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
