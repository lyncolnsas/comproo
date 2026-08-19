/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @next/next/no-img-element */
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
  optInCoursesEnabled: boolean;
  optInCoursesLabel: string;
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
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-10 pointer-events-none">
        <div ref={fillRef} className="h-full bg-white transition-[width] duration-75 ease-linear" style={{ width: '0%' }} />
      </div>
    </div>
  );
}

function LiveCanvasEffect({ effect, speed, brand, green, blue, brandDark }: { effect: string; speed: string; brand: string; green: string; blue: string; brandDark: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effect === 'none' || effect === 'aurora' || effect === 'cyber-grid' || effect === 'floating-orbs' || effect === 'fireflies') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let intervalId: any = null;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    if (effect === 'cardio-pulse' || effect === 'academia') {
      const sparks: any[] = [];
      let step = 0;
      const addSpk = (px: number, py: number) => {
        for (let i = 0; i < 6; i++) sparks.push({ x: px, y: py, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 1 });
      };
      const loop = () => {
        ctx.fillStyle = 'rgba(8, 10, 12, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        step += speed === 'fast' ? 4 : speed === 'slow' ? 1.5 : 2.5;
        const cx = (step * 3) % canvas.width;
        let cy = canvas.height * 0.55;
        const mod = (step * 3) % 220;
        if (mod > 60 && mod < 75) cy -= 35;
        else if (mod >= 75 && mod < 85) cy += 20;
        else if (mod >= 85 && mod < 100) { cy -= 110; if (mod === 90) addSpk(cx, cy); }
        else if (mod >= 100 && mod < 115) cy += 45;
        else if (mod >= 115 && mod < 135) cy -= 25;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = brand || '#2563eb';
        ctx.shadowBlur = 12;
        ctx.shadowColor = green || '#10b981';
        ctx.fill();
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.life -= 0.03;
          if (s.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.beginPath(); ctx.arc(s.x, s.y, 1.8 * s.life, 0, Math.PI * 2);
          ctx.fillStyle = green || '#10b981'; ctx.fill();
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'divine-rays' || effect === 'igreja') {
      const stars: any[] = [];
      for (let i = 0; i < 35; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.8, vy: -(Math.random() * 0.6 + 0.2) });
      let angle = 0;
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        angle += speed === 'fast' ? 0.006 : speed === 'slow' ? 0.001 : 0.003;
        const numRays = 7;
        const cx = canvas.width / 2;
        for (let r = 0; r < numRays; r++) {
          const a = angle + (r * Math.PI / numRays) - Math.PI / 2;
          ctx.save(); ctx.beginPath(); ctx.moveTo(cx, -20);
          ctx.lineTo(cx + Math.cos(a - 0.15) * canvas.height * 1.5, canvas.height + 50);
          ctx.lineTo(cx + Math.cos(a + 0.15) * canvas.height * 1.5, canvas.height + 50);
          ctx.closePath();
          const grad = ctx.createLinearGradient(cx, 0, cx, canvas.height);
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
          grad.addColorStop(0.6, 'rgba(217, 119, 6, 0.08)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad; ctx.fill(); ctx.restore();
        }
        for (let s = 0; s < stars.length; s++) {
          const st = stars[s]; st.y += st.vy; if (st.y < 0) { st.y = canvas.height; st.x = Math.random() * canvas.width; }
          ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fillStyle = brand || '#f59e0b'; ctx.shadowBlur = 10; ctx.shadowColor = brand || '#f59e0b'; ctx.fill();
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'medical-vital' || effect === 'clinica') {
      const cells: any[] = [];
      for (let i = 0; i < 20; i++) cells.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 16 + 8, vx: (Math.random() - 0.5) * 0.4, vy: -(Math.random() * 0.5 + 0.2) });
      const loop = () => {
        ctx.fillStyle = 'rgba(3, 9, 20, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < cells.length; i++) {
          const cl = cells[i]; cl.x += cl.vx; cl.y += cl.vy;
          if (cl.y < -30) { cl.y = canvas.height + 30; cl.x = Math.random() * canvas.width; }
          ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
          ctx.strokeStyle = brand || '#06b6d4'; ctx.lineWidth = 1.2; ctx.stroke();
          const cs = cl.r * 0.45;
          ctx.beginPath(); ctx.moveTo(cl.x - cs, cl.y); ctx.lineTo(cl.x + cs, cl.y);
          ctx.moveTo(cl.x, cl.y - cs); ctx.lineTo(cl.x, cl.y + cs);
          ctx.strokeStyle = green || '#10b981'; ctx.lineWidth = 1.5; ctx.stroke();
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'woodfire-embers' || effect === 'pizzaria') {
      const embers: any[] = [];
      for (let i = 0; i < 45; i++) embers.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2.8 + 1, vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 1), alpha: Math.random() });
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height + 50, 10, canvas.width / 2, canvas.height, canvas.height * 0.6);
        grad.addColorStop(0, 'rgba(225, 29, 72, 0.28)'); grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < embers.length; i++) {
          const e = embers[i]; e.x += e.vx; e.y += e.vy; e.alpha -= 0.003;
          if (e.y < -10 || e.alpha <= 0) { e.y = canvas.height + 10; e.x = Math.random() * canvas.width; e.alpha = 1; }
          ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fillStyle = e.r > 2 ? (brand || '#e11d48') : (green || '#f59e0b');
          ctx.shadowBlur = 10; ctx.shadowColor = brand || '#e11d48'; ctx.fill();
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'matrix') {
      const cols = Math.floor(canvas.width / 18) + 1;
      const ypos = Array(cols).fill(0);
      const chars = '0101MIKROGESTOR';
      intervalId = setInterval(() => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = brand || '#10b981'; ctx.font = '12pt monospace';
        ypos.forEach((y, ind) => {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = ind * 18; ctx.fillText(text, x, y);
          if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
          else ypos[ind] = y + (speed === 'fast' ? 24 : speed === 'slow' ? 12 : 18);
        });
      }, speed === 'fast' ? 30 : speed === 'slow' ? 70 : 50);
    } else {
      // Particles / Fallback
      const count = 40;
      const spd = speed === 'fast' ? 1.5 : speed === 'slow' ? 0.4 : 0.8;
      const particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * spd,
        vy: (Math.random() - 0.5) * spd,
        radius: Math.random() * 2 + 1
      }));
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]; p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1; if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = brand || '#2563eb'; ctx.fill();
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]; const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 100) {
              ctx.beginPath(); ctx.strokeStyle = brand || '#2563eb'; ctx.globalAlpha = 1 - dist / 100; ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); ctx.globalAlpha = 1;
            }
          }
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effect, speed, brand, green, blue, brandDark]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: '#050714' }} />;
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
  const [redirectUrl] = useState(initialConfig?.redirectUrl || '');
  const [portalEnabled] = useState(initialConfig?.enabled !== false);
  const [usernameField, setUsernameField] = useState('');
  const [optInCourses, setOptInCourses] = useState(true);

  // Refs for Autofocus transition
  const celularRef = useRef<HTMLInputElement>(null);
  const birthMonthRef = useRef<HTMLInputElement>(null);
  const birthYearRef = useRef<HTMLInputElement>(null);
  
  // Customization & Visual Tokens
  const [colors, setColors] = useState({
    brand: initialConfig?.colors?.brand || '#2563eb',
    brandDark: initialConfig?.colors?.brandDark || '#1d4ed8',
    bg: initialConfig?.colors?.bg || '#0b0f19',
    ink: initialConfig?.colors?.ink || '#f8fafc',
    muted: initialConfig?.colors?.muted || '#94a3b8',
    blue: initialConfig?.colors?.blue || '#2563eb',
    green: initialConfig?.colors?.green || '#10b981',
    cardBg: initialConfig?.colors?.cardBg || '#111827',
    cardBorder: initialConfig?.colors?.cardBorder || 'rgba(255,255,255,0.1)',
    inputBg: initialConfig?.colors?.inputBg || '#1e293b',
    inputText: initialConfig?.colors?.inputText || '#f8fafc',
    inputBorder: initialConfig?.colors?.inputBorder || '#334155',
    inputPlaceholder: initialConfig?.colors?.inputPlaceholder || '#64748b',
    registerButtonText: initialConfig?.colors?.registerButtonText || '#ffffff',
    glassOpacity: initialConfig?.colors?.glassOpacity !== undefined ? initialConfig.colors.glassOpacity : 90,
    glassBlur: initialConfig?.colors?.glassBlur !== undefined ? initialConfig.colors.glassBlur : 12,
  });

  const [bg, setBg] = useState(initialConfig?.bg || { type: 'default', url: '' });
  const [effects, setEffects] = useState(initialConfig?.effects || {
    bgEffect: 'none',
    bgEffectSpeed: 'normal',
    cardGlowBorder: false,
    cardTilt3d: false,
    btnShimmer: true,
    btnPulse: false,
    titleGradient: false,
  });

  const [studio, setStudio] = useState<any>(initialConfig?.studio || {});
  const [ad] = useState<AdConfig | null>(initialConfig?.ad || null);
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
  const [registerSubtitle, setRegisterSubtitle] = useState(initialConfig?.registerSubtitle || 'Cadastre-se abaixo para liberar seu acesso');
  const [registerSubmitText, setRegisterSubmitText] = useState(initialConfig?.registerSubmitText || 'Cadastrar e Conectar');
  const [termsText, setTermsText] = useState(initialConfig?.termsText || 'Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.');
  
  // Fields Configuration
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
    customFieldLabel: 'Descreva aqui!',
    customFieldRequired: false,
    optInCoursesEnabled: true,
    optInCoursesLabel: 'Eu aceito receber informações e novidades',
    ...(initialConfig?.fields || {})
  });

  // Live Preview Message Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      
      if (data.type === 'LIVE_PREVIEW') {
        const config = data;
        if (config.colors) setColors(prev => ({ ...prev, ...config.colors }));
        if (config.bg) setBg(config.bg);
        if (config.effects) setEffects(config.effects);
        if (config.studio) setStudio(config.studio);
        if (config.fields) setFields(config.fields);
        if (config.registerTitle !== undefined) setRegisterTitle(config.registerTitle);
        if (config.registerSubtitle !== undefined) setRegisterSubtitle(config.registerSubtitle);
        if (config.registerSubmitText !== undefined) setRegisterSubmitText(config.registerSubmitText);
        if (config.termsText !== undefined) setTermsText(config.termsText);
      } else if (data.type === 'INSPECTOR_HOVER_CARD') {
        const formEl = document.querySelector('form') || document.querySelector('.card');
        if (data.target && formEl) {
          (formEl as HTMLElement).style.outline = '2px solid #06b6d4';
          (formEl as HTMLElement).style.boxShadow = '0 0 16px rgba(6,182,212,0.5)';
        } else if (formEl) {
          (formEl as HTMLElement).style.outline = '';
          (formEl as HTMLElement).style.boxShadow = '';
        }
      } else if (data.type === 'INSPECTOR_CLEAR') {
        const formEl = document.querySelector('form') || document.querySelector('.card');
        if (formEl) {
          (formEl as HTMLElement).style.outline = '';
          (formEl as HTMLElement).style.boxShadow = '';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'IFRAME_READY' }, '*'); } catch {}
    }
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

      // Double safety net: Detect native GET form submission fallback
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
          customFieldValue: getCustomFieldValue,
          optInCourses,
          template: params.get('template') || initialConfig?.template || 'default'
        };

        setTimeout(() => {
          setLoading(true);
          setError('');
        }, 0);
        
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
      if (!usernameField || !usernameField.trim()) {
        setError('Nome de usuário é obrigatório.');
        setLoading(false);
        return;
      }

      if (!password || !password.trim()) {
        setError('Senha é obrigatória.');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }

      const combinedPhone = fields.phoneEnabled && (ddd || celular) ? `${ddd.trim()}${celular.replace(/\D/g, '').trim()}` : '';
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
        username: usernameField.trim(),
        birthDate: combinedBirthDate, 
        cpf, 
        gender, 
        password: password.trim(), 
        customFieldValue,
        optInCourses,
        template: initialConfig?.template || 'default'
      };

      const searchParamsStr = typeof window !== 'undefined' ? window.location.search : '';
      const res = await fetch(`/api/portal/register${searchParamsStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        const snippet = responseText.substring(0, 300);
        setError(`Erro do servidor (Status ${res.status}): ${snippet}...`);
        setLoading(false);
        return;
      }

      if (data.success) {
        setSuccess('Cadastro concluído! Conectando ao Wi-Fi...');
        const { username, password: createdPassword } = data.data;
        const finalDst = data.data?.redirectUrl || data.config?.redirectUrl || redirectUrl || linkOrig;
        const targetLoginUrl = linkLoginOnly || 'http://192.168.88.1/login';
        
        setTimeout(() => {
          performAutoLogin(username, createdPassword, targetLoginUrl, finalDst);
        }, 600);

      } else {
        setError(data.message || 'Erro ao cadastrar.');
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setError(`Erro de conexão com o servidor: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const isSimulator = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('preview') === '1' ||
    window.self !== window.top
  );

  const speedSec = effects.bgEffectSpeed === 'slow' ? 24 : effects.bgEffectSpeed === 'fast' ? 7 : 14;
  const isVideoBg = bg.type === 'video' || (bg.url && bg.url.match(/\.(mp4|webm|ogg)$/i));
  const isImageBg = bg.type === 'image' || (bg.url && !isVideoBg);

  const renderedStyles = (
    <style>{`
      /* Self-Contained Resilient CSS for /portal/register */
      :root {
        --mg-brand: ${colors.brand || colors.blue || '#2563eb'};
        --mg-brand-dark: ${colors.brandDark || (colors as any).loginButtonText || '#1d4ed8'};
        --mg-bg: ${colors.bg || '#0b0f19'};
        --mg-ink: ${colors.ink || '#f8fafc'};
        --mg-muted: ${colors.muted || '#94a3b8'};
        --mg-green: ${colors.green || (colors as any).btnSecondary || '#10b981'};
        --mg-card-bg: ${colors.cardBg || '#111827'};
        --mg-card-border: ${colors.cardBorder || 'rgba(255,255,255,0.1)'};
        --mg-input-bg: ${colors.inputBg || '#1e293b'};
        --mg-input-text: ${colors.inputText || '#f8fafc'};
        --mg-input-border: ${colors.inputBorder || '#334155'};
        --mg-input-placeholder: ${colors.inputPlaceholder || '#64748b'};
        --mg-glass-opacity: ${colors.glassOpacity !== undefined ? colors.glassOpacity : 90}%;
        --mg-glass-blur: ${colors.glassBlur !== undefined ? colors.glassBlur : 12}px;
        --mg-font-family: ${studio.fontFamily ? `"${studio.fontFamily}", sans-serif` : 'inherit'};
        --mg-card-radius-tl: ${studio.cardRadiusTL !== undefined ? studio.cardRadiusTL : 20}px;
        --mg-card-radius-tr: ${studio.cardRadiusTR !== undefined ? studio.cardRadiusTR : 20}px;
        --mg-card-radius-br: ${studio.cardRadiusBR !== undefined ? studio.cardRadiusBR : 20}px;
        --mg-card-radius-bl: ${studio.cardRadiusBL !== undefined ? studio.cardRadiusBL : 20}px;
        --mg-btn-radius-tl: ${studio.btnRadiusTL !== undefined ? studio.btnRadiusTL : 12}px;
        --mg-btn-radius-tr: ${studio.btnRadiusTR !== undefined ? studio.btnRadiusTR : 12}px;
        --mg-btn-radius-br: ${studio.btnRadiusBR !== undefined ? studio.btnRadiusBR : 12}px;
        --mg-btn-radius-bl: ${studio.btnRadiusBL !== undefined ? studio.btnRadiusBL : 12}px;
        --mg-btn-height: ${studio.btnHeight !== undefined ? studio.btnHeight : 46}px;
        --mg-input-radius: ${studio.inputRadius !== undefined ? studio.inputRadius : 12}px;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        margin: 0 !important;
        padding: 0 !important;
        background: ${(isVideoBg || isImageBg || effects.bgEffect !== 'none') ? 'transparent' : 'var(--mg-bg)'} !important;
        color: var(--mg-ink) !important;
        font-family: var(--mg-font-family) !important;
        min-height: 100vh !important;
        /* Reset root layout Tailwind classes that break portal layout */
        display: block !important;
        flex-direction: unset !important;
        position: static !important;
      }

      html {
        background: ${(isVideoBg || isImageBg || effects.bgEffect !== 'none') ? 'transparent' : 'var(--mg-bg)'} !important;
      }

      .mg-reg-root {
        min-height: 100vh;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 24px 16px 48px 16px;
        position: relative;
        z-index: 1;
      }

      .mg-reg-card {
        width: 100%;
        max-width: 440px;
        border-radius: var(--mg-card-radius-tl) var(--mg-card-radius-tr) var(--mg-card-radius-br) var(--mg-card-radius-bl) !important;
        padding: 28px 24px;
        background: color-mix(in srgb, var(--mg-card-bg) var(--mg-glass-opacity), transparent);
        backdrop-filter: blur(var(--mg-glass-blur));
        -webkit-backdrop-filter: blur(var(--mg-glass-blur));
        border: 1px solid var(--mg-card-border);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
        position: relative;
        z-index: 2;
      }

      .mg-reg-disabled {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        margin-top: 40px;
      }

      .mg-reg-disabled-icon {
        font-size: 2.5rem;
        margin-bottom: 4px;
      }

      .mg-reg-header {
        text-align: center;
        margin-bottom: 24px;
      }

      .mg-reg-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--mg-ink, #f8fafc);
        letter-spacing: -0.025em;
        margin-bottom: 6px;
        ${effects.titleGradient ? `
          background: linear-gradient(135deg, var(--mg-brand), var(--mg-green), var(--mg-brand));
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mgTitleGradient 6s ease infinite alternate;
        ` : ''}
      }

      .mg-reg-subtitle {
        font-size: 0.85rem;
        color: var(--mg-muted, #94a3b8);
        line-height: 1.4;
      }

      .mg-reg-form-group {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .mg-reg-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--mg-ink, #f8fafc);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .mg-reg-required {
        color: #ef4444;
      }

      .mg-reg-input, .mg-reg-select, .mg-reg-textarea {
        width: 100%;
        height: 44px;
        padding: 0 14px;
        background: var(--mg-input-bg, #1e293b);
        color: var(--mg-input-text, #f8fafc);
        border: 1px solid var(--mg-input-border, #334155);
        border-radius: var(--mg-input-radius) !important;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .mg-reg-textarea {
        height: auto;
        padding: 10px 14px;
        min-height: 70px;
        resize: vertical;
      }

      .mg-reg-input:focus, .mg-reg-select:focus, .mg-reg-textarea:focus {
        border-color: var(--mg-brand);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--mg-brand) 25%, transparent);
      }

      .mg-reg-input::placeholder, .mg-reg-textarea::placeholder {
        color: var(--mg-input-placeholder, #64748b);
        opacity: 0.8;
      }

      .mg-reg-btn {
        width: 100%;
        height: var(--mg-btn-height) !important;
        border-radius: var(--mg-btn-radius-tl) var(--mg-btn-radius-tr) var(--mg-btn-radius-br) var(--mg-btn-radius-bl) !important;
        font-weight: 800;
        font-size: 0.95rem;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
        box-shadow: 0 4px 15px color-mix(in srgb, var(--mg-green) 30%, transparent);
        position: relative;
        overflow: hidden;
      }

      .mg-reg-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.08);
      }

      .mg-reg-btn:active:not(:disabled) {
        transform: translateY(1px);
      }

      .mg-reg-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .mg-reg-alert {
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 0.82rem;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        line-height: 1.4;
      }

      .mg-reg-alert-error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
      }

      .mg-reg-alert-success {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #6ee7b7;
      }

      .mg-reg-terms {
        font-size: 0.75rem;
        color: var(--mg-muted, #94a3b8);
        text-align: center;
        margin-top: 20px;
        padding-top: 14px;
        border-top: 1px solid color-mix(in srgb, var(--mg-card-border, rgba(255,255,255,0.1)) 40%, transparent);
        line-height: 1.4;
      }

      ${effects.btnShimmer ? `
        .mg-reg-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: rotate(30deg);
          animation: mgShimmerSweep 3.5s infinite;
          pointer-events: none;
        }
        @keyframes mgShimmerSweep {
          0% { left: -60%; }
          30% { left: 140%; }
          100% { left: 140%; }
        }
      ` : ''}

      ${effects.cardGlowBorder ? `
        .mg-reg-card {
          box-shadow: 0 0 25px color-mix(in srgb, var(--mg-brand) 30%, transparent), 0 20px 45px rgba(0,0,0,0.4);
        }
        .mg-reg-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(90deg, var(--mg-brand), var(--mg-green), var(--mg-brand));
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: mgBorderBeam 4s linear infinite;
          pointer-events: none;
        }
        @keyframes mgBorderBeam {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      ` : ''}

      @keyframes mgTitleGradient {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }

      @keyframes mgAuroraFloat {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(15%, 15%) scale(1.15) rotate(20deg); }
        100% { transform: translate(-10%, 25%) scale(0.9) rotate(-15deg); }
      }
      @keyframes mgAuroraPulse {
        0% { transform: scale(0.8); opacity:0.3; }
        100% { transform: scale(1.2); opacity:0.6; }
      }
      @keyframes mgGridMove {
        0% { background-position: 0 0, 0 0, 0 0; }
        100% { background-position: 0 0, 0 0, 0 80px; }
      }
      @keyframes mgOrbFloat1 { 0% { top: 10%; left: 10%; } 50% { top: 60%; left: 70%; } 100% { top: 10%; left: 10%; } }
      @keyframes mgOrbFloat2 { 0% { top: 70%; left: 20%; } 50% { top: 20%; left: 80%; } 100% { top: 70%; left: 20%; } }
    `}</style>
  );

  if (!portalEnabled && !isSimulator) {
    return (
      <>
        {renderedStyles}
        <main className="mg-reg-root">
          <div className="mg-reg-card mg-reg-disabled">
            <div className="mg-reg-disabled-icon">⚠️</div>
            <h2 style={{ color: colors.ink || '#f8fafc', fontWeight: 'bold', fontSize: '1.25rem' }}>Auto-Cadastro Desativado</h2>
            <p style={{ color: colors.muted || '#94a3b8', fontSize: '0.875rem' }}>
              O cadastro de novos clientes está temporariamente desativado.
            </p>
            <button
              type="button"
              onClick={() => { window.location.href = linkLoginOnly; }}
              className="mg-reg-btn"
              style={{ marginTop: '1rem', background: colors.brand || '#2563eb', color: '#fff' }}
            >
              Voltar para o Login
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {renderedStyles}


      {/* Dynamic Background Layer (Video / Image / Effects) */}
      {isVideoBg && bg.url && (
        <video 
          key={bg.url}
          autoPlay 
          muted 
          loop 
          playsInline 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <source src={bg.url} />
        </video>
      )}

      {isImageBg && bg.url && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${bg.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Animated Visual Effects Layers */}
      {effects.bgEffect === 'aurora' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: '#05050d' }}>
          <div style={{ position: 'absolute', width: '70vw', height: '70vw', top: '-20%', left: '-10%', borderRadius: '50%', background: `radial-gradient(circle, ${colors.brand} 0%, transparent 70%)`, filter: 'blur(60px)', opacity: 0.6, animation: `mgAuroraFloat ${speedSec}s ease-in-out infinite alternate` }} />
          <div style={{ position: 'absolute', width: '65vw', height: '65vw', bottom: '-10%', right: '-10%', borderRadius: '50%', background: `radial-gradient(circle, ${colors.green} 0%, transparent 70%)`, filter: 'blur(60px)', opacity: 0.5, animation: `mgAuroraFloat ${speedSec * 1.3}s ease-in-out infinite alternate-reverse` }} />
          <div style={{ position: 'absolute', width: '50vw', height: '50vw', top: '30%', left: '30%', borderRadius: '50%', background: `radial-gradient(circle, ${colors.blue} 0%, transparent 70%)`, filter: 'blur(50px)', opacity: 0.4, animation: `mgAuroraPulse ${speedSec * 0.8}s ease-in-out infinite alternate` }} />
        </div>
      )}

      {effects.bgEffect === 'cyber-grid' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: `radial-gradient(circle at 50% 30%, ${colors.brandDark} 0%, #05050f 70%)` }}>
          <div style={{ position: 'absolute', width: '200%', height: '100%', left: '-50%', bottom: 0, background: `linear-gradient(rgba(0,0,0,0) 0%, #05050f 85%), linear-gradient(90deg, ${colors.brand}33 1px, transparent 1px), linear-gradient(0deg, ${colors.brand}33 1px, transparent 1px)`, backgroundSize: '100% 100%, 40px 40px, 40px 40px', transform: 'perspective(300px) rotateX(60deg)', transformOrigin: 'center bottom', animation: `mgGridMove ${speedSec * 0.4}s linear infinite` }} />
        </div>
      )}

      {effects.bgEffect === 'floating-orbs' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: '#0a0c18' }}>
          <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: colors.brand, filter: 'blur(45px)', opacity: 0.5, animation: `mgOrbFloat1 ${speedSec}s ease-in-out infinite` }} />
          <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', background: colors.green, filter: 'blur(40px)', opacity: 0.45, animation: `mgOrbFloat2 ${speedSec * 1.2}s ease-in-out infinite` }} />
        </div>
      )}

      {effects.bgEffect === 'fireflies' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: '#030712' }}>
          <div style={{ position: 'absolute', width: '10px', height: '10px', borderRadius: '50%', background: colors.brand, boxShadow: `0 0 15px ${colors.brand}`, animation: 'mgOrbFloat1 5s infinite' }} />
          <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: colors.green, boxShadow: `0 0 12px ${colors.green}`, animation: 'mgOrbFloat2 7s infinite' }} />
          <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: colors.blue, boxShadow: `0 0 18px ${colors.blue}`, animation: 'mgOrbFloat1 9s infinite reverse' }} />
        </div>
      )}

      {effects.bgEffect && effects.bgEffect !== 'none' && effects.bgEffect !== 'aurora' && effects.bgEffect !== 'cyber-grid' && effects.bgEffect !== 'floating-orbs' && effects.bgEffect !== 'fireflies' && (
        <LiveCanvasEffect
          effect={effects.bgEffect}
          speed={effects.bgEffectSpeed || 'normal'}
          brand={colors.brand || '#2563eb'}
          green={colors.green || '#10b981'}
          blue={colors.blue || '#2563eb'}
          brandDark={colors.brandDark || '#1d4ed8'}
        />
      )}

      <main className="mg-reg-root">
        <div className="mg-reg-card">
          
          {/* Header */}
          <div className="mg-reg-header">
            <h1 className="mg-reg-title">{registerTitle}</h1>
            <p className="mg-reg-subtitle">{registerSubtitle}</p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mg-reg-alert mg-reg-alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mg-reg-alert mg-reg-alert-success">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Advertisement Banner / Media */}
          {ad && ad.type !== 'none' && (ad.mediaUrl || (ad.type === 'carousel' && carouselItems.length > 0)) && (
            <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--mg-card-border)', background: '#000' }}>
              <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', zIndex: 10, textTransform: 'uppercase' }}>
                Patrocinado
              </span>
              
              {ad.type === 'image' && ad.mediaUrl && (
                ad.targetUrl ? (
                  <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    <img src={ad.mediaUrl} alt="Publicidade" style={{ width: '100%', height: 'auto', maxHeight: '160px', objectFit: 'cover' }} />
                  </a>
                ) : (
                  <img src={ad.mediaUrl} alt="Publicidade" style={{ width: '100%', height: 'auto', maxHeight: '160px', objectFit: 'cover' }} />
                )
              )}

              {ad.type === 'video' && ad.mediaUrl && (
                <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#000' }}>
                  {ad.mediaUrl.includes('youtube.com') || ad.mediaUrl.includes('youtu.be') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(ad.mediaUrl)}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <CarouselVideo
                        src={ad.mediaUrl}
                        isCurrent={true}
                        isMuted={isMuted}
                        onClick={() => ad.targetUrl && window.open(ad.targetUrl, '_blank')}
                      />
                      <button
                        type="button"
                        onClick={() => setIsMuted(prev => !prev)}
                        style={{ position: 'absolute', bottom: '8px', left: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 20 }}
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {ad.type === 'carousel' && carouselItems.length > 0 && (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000' }}>
                  {carouselItems.map((item, idx) => {
                    const isCurrent = idx === activeSlide;
                    return (
                      <div 
                        key={idx}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isCurrent ? 1 : 0, transition: 'opacity 0.5s ease', zIndex: isCurrent ? 10 : 0 }}
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
                            src={item.url} 
                            alt={`Slide ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => item.targetUrl && window.open(item.targetUrl, '_blank')}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {ad.timerEnabled && timerActive && (
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', zIndex: 20 }}>
                  Aguarde {timeLeft}s...
                </div>
              )}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} action="/api/portal/register" method="POST">
            <input type="hidden" name="link-login-only" value={linkLoginOnly} />
            <input type="hidden" name="link-orig" value={linkOrig} />
            <input type="hidden" name="template" value={initialConfig?.template || 'default'} />

            {/* Nome Completo */}
            {fields.nameEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  Nome Completo {fields.nameRequired && <span className="mg-reg-required">*</span>}
                </label>
                <input 
                  type="text" 
                  name="name"
                  required={fields.nameRequired}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="mg-reg-input"
                />
              </div>
            )}

            {/* E-mail */}
            {fields.emailEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  E-mail {fields.emailRequired && <span className="mg-reg-required">*</span>}
                </label>
                <input 
                  type="email" 
                  name="email"
                  required={fields.emailRequired}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: joao@email.com"
                  className="mg-reg-input"
                />
              </div>
            )}

            {/* DDD e Celular */}
            {fields.phoneEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  DDD e Celular <span className="mg-reg-required">*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
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
                    style={{ textAlign: 'center' }}
                    className="mg-reg-input"
                  />
                  <input 
                    type="tel" 
                    name="celular"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    placeholder="Celular"
                    value={celular}
                    onChange={handleCelularChange}
                    ref={celularRef}
                    className="mg-reg-input"
                  />
                </div>
              </div>
            )}

            {/* Usuário (Login Hotspot) */}
            <div className="mg-reg-form-group">
              <label className="mg-reg-label">
                Nome de Usuário (Login) <span className="mg-reg-required">*</span>
              </label>
              <input 
                type="text" 
                name="username"
                required
                value={usernameField}
                onChange={(e) => setUsernameField(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
                placeholder="Ex: joaodasilva"
                className="mg-reg-input"
              />
            </div>

            {/* Data de Nascimento */}
            {fields.birthDateEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  Data de Nascimento {fields.birthDateRequired && <span className="mg-reg-required">*</span>}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '8px' }}>
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
                    style={{ textAlign: 'center' }}
                    className="mg-reg-input"
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
                    style={{ textAlign: 'center' }}
                    className="mg-reg-input"
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
                    style={{ textAlign: 'center' }}
                    className="mg-reg-input"
                  />
                </div>
              </div>
            )}

            {/* CPF */}
            {fields.cpfEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  CPF {fields.cpfRequired && <span className="mg-reg-required">*</span>}
                </label>
                <input 
                  type="tel" 
                  name="cpf"
                  inputMode="numeric"
                  required={fields.cpfRequired}
                  value={cpf}
                  maxLength={14}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="mg-reg-input"
                />
              </div>
            )}

            {/* Gênero */}
            {fields.genderEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  Gênero {fields.genderRequired && <span className="mg-reg-required">*</span>}
                </label>
                <select 
                  name="gender"
                  required={fields.genderRequired}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mg-reg-select"
                >
                  <option value="" style={{ background: colors.inputBg, color: colors.inputText }}>Escolha seu Gênero</option>
                  <option value="Homem" style={{ background: colors.inputBg, color: colors.inputText }}>Homem</option>
                  <option value="Mulher" style={{ background: colors.inputBg, color: colors.inputText }}>Mulher</option>
                  <option value="Não informar" style={{ background: colors.inputBg, color: colors.inputText }}>Não informar</option>
                </select>
              </div>
            )}

            {/* Senha e Confirmação */}
            <div className="mg-reg-form-group">
              <label className="mg-reg-label">
                Crie uma Senha <span className="mg-reg-required">*</span>
              </label>
              <input 
                type="password" 
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mg-reg-input"
              />
            </div>

            <div className="mg-reg-form-group">
              <label className="mg-reg-label">
                Confirme sua Senha <span className="mg-reg-required">*</span>
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mg-reg-input"
              />
            </div>

            {/* Dynamic Custom Lead Input */}
            {fields.customFieldEnabled && (
              <div className="mg-reg-form-group">
                <label className="mg-reg-label">
                  {fields.customFieldLabel || 'Campo Personalizado'} {fields.customFieldRequired && <span className="mg-reg-required">*</span>}
                </label>
                <textarea 
                  name="customFieldValue"
                  required={fields.customFieldRequired}
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={2}
                  className="mg-reg-textarea"
                />
              </div>
            )}

            {/* Checkbox Opt-in */}
            {fields.optInCoursesEnabled && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '10px 0' }}>
                <input 
                  type="checkbox" 
                  id="optInCourses" 
                  checked={optInCourses}
                  onChange={(e) => setOptInCourses(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: colors.green, cursor: 'pointer' }}
                />
                <label htmlFor="optInCourses" style={{ fontSize: '0.78rem', color: colors.muted, lineHeight: 1.3, cursor: 'pointer' }}>
                  {fields.optInCoursesLabel || 'Eu aceito receber informações e novidades'}
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !!success || timerActive}
              className="mg-reg-btn"
              style={{
                background: `linear-gradient(135deg, ${colors.green || '#10b981'} 0%, ${colors.brand || '#2563eb'} 100%)`,
                color: colors.registerButtonText || '#ffffff'
              }}
            >
              {loading ? 'Processando...' : success ? 'Conectando...' : timerActive ? `Aguarde ${timeLeft}s...` : registerSubmitText}
            </button>
          </form>

          {/* Terms Footer */}
          <div className="mg-reg-terms">
            {termsText}
          </div>

        </div>
      </main>
    </>
  );
}
