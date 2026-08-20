/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { prisma } from '@/lib/prisma';
import { getNicheEffectMarkup } from '@/lib/niche-effects';
import { getBrandEffectsStyles } from '@/lib/brand-effects-styles';
import { getTemplatePaths } from '@/lib/portal-template-utils';

const DEFAULT_HOTSPOT_DIR = path.join(process.cwd(), 'hotspot', 'default');

function getPaths(templateName?: string | null) {
  return getTemplatePaths(templateName);
}

function getLocalLanIp() {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = '';

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          if (alias.address.startsWith('192.168.') || alias.address.startsWith('10.')) {
            localIp = alias.address;
            break;
          } else if (!localIp) {
            localIp = alias.address;
          }
        }
      }
      if (localIp && (localIp.startsWith('192.168.') || localIp.startsWith('10.'))) {
        break;
      }
    }
    return localIp || '192.168.88.254';
  } catch (e) {
    return '192.168.88.254';
  }
}

const DEFAULT_CONFIG = {
  enabled: true,
  redirectUrl: '',
  businessName: 'Super Wi-Fi',
  registerButtonText: 'Cadastre-se aqui',
  registerTitle: 'Wi-Fi Grátis',
  registerSubtitle: 'Cadastre-se abaixo para liberar o acesso à internet',
  registerSubmitText: 'Cadastrar e Conectar',
  termsText: 'Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.',
  trialEnabled: true,
  trialText: 'Acesso de teste disponível, ',
  trialLinkText: 'clique aqui',
  trialModalTitle: 'Acesso de Teste',
  trialModalMessage: 'Tem certeza de que deseja liberar o acesso grátis por 30 minutos?',
  trialModalConfirmText: 'Sim, Conectar',
  trialModalCancelText: 'Não, Voltar',
  colors: {
    brand: '#00897b',
    brandDark: '#00796b',
    bg: '#fafafa',
    ink: '#0b1220',
    muted: '#6b7280',
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
  },
  effects: {
    bgEffect: 'none', // 'none' | 'aurora' | 'particles' | 'matrix' | 'cyber-grid' | 'floating-orbs' | 'fireflies' | 'warp-stars' | 'wave-mesh'
    bgEffectSpeed: 'normal', // 'slow' | 'normal' | 'fast'
    cardShape: 'rounded', // 'rounded' | 'square' | 'pill' | 'scifi-cut'
    cardNoiseTexture: false,
    cardGlowBorder: false,
    cardTilt3d: false,
    btnShimmer: true,
    btnPulse: false,
    titleGradient: false,
  },
  social: {
    whatsappEnabled: false,
    whatsappNumber: '',
    whatsappMessage: 'Olá! Preciso de suporte para acessar o Wi-Fi.',
    instagramUrl: '',
    facebookUrl: '',
    googleMapsUrl: '',
  },
  badges: {
    showWifiSpeed: false,
    wifiSpeedText: '⚡ Wi-Fi 5G Ultra Rápido',
    showSecurityBadge: false,
    securityText: '🔒 Conexão Criptografada',
    showConnectedCount: false,
    connectedCountNumber: '42',
  },
  brand: {
    headerStyle: 'hidden', // 'hidden' | 'transparent' | 'floating' | 'solid'
    displayMode: 'image', // 'image' | 'text' | 'both' | 'none'
    logoBg: 'none', // 'none' | 'glass' | 'white' | 'dark' | 'brand' | 'glow' | 'custom'
    logoBgCustomColor: '#ffffff',
    logoShape: 'rounded', // 'circle' | 'rounded' | 'square' | 'pill'
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
  },
  studio: {
    fontFamily: 'Inter',
    titleFontSize: 24,
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
    inputHeight: 44,
    inputRadius: 10,
    inputBorderWidth: 1
  },
  customCode: {
    customCss: '',
  },
  message: 'Bem-vindo à nossa rede gratuita. Insira o seu voucher para navegar.',
  systemUrl: `http://${getLocalLanIp()}`,
  bg: {
    type: 'default',
    url: ''
  },
  ad: {
    type: 'none',
    mediaUrl: '',
    targetUrl: '',
    items: [] as any[],
    timerEnabled: false,
    timerDuration: 5
  },
  fields: {
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
    optInCoursesLabel: 'Eu aceito receber informações dos cursos'
  }
};

function generateAdMarkup(ad: any, systemUrl?: string) {
  if (!ad || ad.type === 'none') {
    return { css: '', html: '', js: '' };
  }

  let items = [];
  if (ad.type === 'image' && ad.mediaUrl) {
    items.push({ url: ad.mediaUrl, type: 'image', targetUrl: ad.targetUrl });
  } else if (ad.type === 'video' && ad.mediaUrl) {
    items.push({ url: ad.mediaUrl, type: 'video', targetUrl: ad.targetUrl });
  } else if (ad.type === 'carousel' && Array.isArray(ad.items)) {
    items = ad.items.filter((item: any) => item && item.url);
  }

  if (items.length === 0) {
    return { css: '', html: '', js: '' };
  }

  const css = `
    /* ====== NOVO POPUP DE VÍDEO TELA CHEIA ====== */
    .ad-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 100000 !important; /* Bloqueia tudo abaixo */
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .ad-modal-content-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 600px;
      max-height: 1000px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ad-carousel-container {
      width: 100%;
      height: 100%;
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    .ad-carousel-container::-webkit-scrollbar {
      display: none;
    }

    .ad-carousel-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      scroll-snap-align: start;
      position: relative;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ad-carousel-slide img, .ad-carousel-slide video {
      width: 100%;
      height: 100%;
      object-fit: contain; /* Mantém a proporção exata da imagem/vídeo sem cortes */
      cursor: pointer;
    }

    .ad-patrocinado {
      position: absolute;
      top: max(20px, env(safe-area-inset-top)); /* Respeita o notch do iPhone */
      left: 20px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 6px;
      z-index: 99999 !important;
      text-transform: uppercase;
      letter-spacing: 1px;
      pointer-events: none;
    }

    .ad-modal-close {
      position: absolute;
      top: max(20px, env(safe-area-inset-top));
      right: 20px;
      background: #eb24a2;
      color: #fff;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      z-index: 99999 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      transition: background 0.2s, transform 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .ad-modal-close:hover {
      filter: brightness(0.9);
    }
    .ad-modal-close:active {
      transform: scale(0.95);
    }

    .ad-modal-timer {
      position: absolute;
      bottom: max(30px, env(safe-area-inset-bottom));
      right: 20px;
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      padding: 8px 18px;
      font-size: 14px;
      border-radius: 30px;
      z-index: 99999 !important;
      font-weight: bold;
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(5px);
    }

    /* Instagram Stories Style Top Progress Bar */
    .ad-stories-progress-container {
      position: absolute;
      top: max(20px, env(safe-area-inset-top));
      left: 20px;
      right: 20px;
      display: flex;
      gap: 6px;
      z-index: 99999 !important;
      pointer-events: none;
    }
    /* Adjust top of other elements if progress container exists */
    .ad-stories-progress-container ~ .ad-patrocinado {
      top: calc(max(20px, env(safe-area-inset-top)) + 12px);
    }
    .ad-stories-progress-container ~ .ad-modal-close {
      top: calc(max(20px, env(safe-area-inset-top)) + 12px);
    }

    .ad-progress-bar {
      height: 3px;
      flex: 1;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 9999px;
      overflow: hidden;
    }
    .ad-progress-fill {
      height: 100%;
      background: #ffffff;
      width: 0%;
      transition: width 0.1s linear;
    }

    /* Invisible Tap/Navigation Overlays */
    .ad-nav-area-left {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 35%;
      z-index: 90;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ad-nav-area-right {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 35%;
      z-index: 90;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    /* Floating Mute/Unmute Audio Button */
    .ad-audio-toggle {
      position: absolute;
      bottom: max(30px, env(safe-area-inset-bottom));
      left: 20px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: none; /* Exibido apenas quando há vídeos rodando */
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      z-index: 99999 !important;
      transition: background 0.2s, transform 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .ad-audio-toggle:hover {
      background: rgba(0, 0, 0, 0.85);
    }
    .ad-audio-toggle:active {
      transform: scale(0.95);
    }

    .ad-video-progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      z-index: 99999 !important;
      pointer-events: none;
    }
    .ad-video-progress-fill {
      height: 100%;
      width: 0%;
      background: #ffffff;
      transition: width 0.05s linear;
    }
  `;

  let slidesHTML = '';
  items.forEach((item: any, idx: number) => {
    let src = item.url;
    if (src.includes('/uploads/')) {
      const baseUrl = systemUrl ? systemUrl.replace(/\/$/, '') : '';
      const fileName = src.split('/uploads/').pop();
      src = `${baseUrl}/uploads/${fileName}`;
    } else if (src.startsWith('/api/')) {
      const baseUrl = systemUrl ? systemUrl.replace(/\/$/, '') : '';
      src = `${baseUrl}${src}`;
    } else if (!src.startsWith('http') && !src.startsWith('.')) {
      const baseUrl = systemUrl ? systemUrl.replace(/\/$/, '') : '';
      const cleanPath = src.startsWith('/') ? src : `/${src}`;
      src = `${baseUrl}${cleanPath}`;
    }
    
    const clickHandler = item.targetUrl ? `onclick="window.open('${item.targetUrl}', '_blank')"` : '';
    
    if (item.type === 'video') {
      slidesHTML += `<div class="ad-carousel-slide"><video id="adVideo" src="${src}" autoplay muted loop playsinline ${clickHandler}></video><div class="ad-video-progress-bar"><div class="ad-video-progress-fill"></div></div></div>\n`;
    } else {
      slidesHTML += `<div class="ad-carousel-slide"><img src="${src}" ${clickHandler} /></div>\n`;
    }
  });

  let progressHTML = '';
  let navHTML = '';
  if (items.length > 1) {
    progressHTML += '<div class="ad-stories-progress-container">\n';
    items.forEach((_: any, idx: number) => {
      progressHTML += `  <div class="ad-progress-bar"><div class="ad-progress-fill" id="adProgressFill-${idx}"></div></div>\n`;
    });
    progressHTML += '</div>\n';

    navHTML += '      <!-- Touch Navigation Areas -->\n';
    navHTML += '      <div class="ad-nav-area-left" onclick="navigateAdCarousel(-1)"></div>\n';
    navHTML += '      <div class="ad-nav-area-right" onclick="navigateAdCarousel(1)"></div>\n';
  }

  const timerBadgeDisplay = ad.timerEnabled ? 'block' : 'none';
  const closeBtnDisplay = ad.timerEnabled ? 'none' : 'flex';

  const html = `
  <!-- Publicidade Overlay Modal -->
  <div id="adModal" class="ad-modal-overlay">
    <div class="ad-modal-content-wrapper">
      <div class="ad-carousel-container" id="adCarousel">
        ${slidesHTML}
      </div>

      ${progressHTML}
      ${navHTML}

      <span class="ad-patrocinado">Patrocinado</span>
      
      <button id="adCloseBtn" type="button" class="ad-modal-close" style="display: ${closeBtnDisplay}" onclick="closeAdModal()">✕</button>

      <!-- Floating Mute/Unmute Audio Button -->
      <button id="adAudioBtn" type="button" class="ad-audio-toggle" style="display: none" onclick="toggleAdAudio()">🔇</button>
      
      <div id="adTimerBadge" class="ad-modal-timer" style="display: ${timerBadgeDisplay}">Aguarde...</div>
    </div>
  </div>
  `;

  let js = `
    window.closeAdModal = function() {
      const modal = document.getElementById('adModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Unlock scroll
      }
      const videos = document.querySelectorAll('#adModal video');
      videos.forEach(v => {
        try { v.pause(); } catch(e) {}
      });
    };

    window.toggleAdAudio = function() {
      const videos = document.querySelectorAll('#adModal video');
      const audioBtn = document.getElementById('adAudioBtn');
      if (videos.length > 0 && audioBtn) {
        const isMuted = videos[0].muted;
        videos.forEach(v => { v.muted = !isMuted; });
        audioBtn.innerHTML = !isMuted ? '🔇' : '🔊';
      }
    };
    
    function initAdModalSetup() {
      const adModal = document.getElementById('adModal');
      if (adModal) {
        document.body.appendChild(adModal);
        document.body.style.overflow = 'hidden'; // Lock scroll
      }

      // Se houver vídeo no modal, exibe o botão de controle de áudio (apenas se for vídeo único, carrossel gerencia dinamicamente)
      const videos = document.querySelectorAll('#adModal video');
      const audioBtn = document.getElementById('adAudioBtn');
      if (videos.length > 0 && audioBtn) {
        const carousel = document.getElementById('adCarousel');
        if (!carousel || carousel.children.length <= 1) {
          audioBtn.style.display = 'flex';
        }
      }

      // Vincular barra de progresso estilo Facebook
      videos.forEach(function(video) {
        video.addEventListener('timeupdate', function() {
          const percent = (video.currentTime / (video.duration || 1)) * 100;
          const fill = video.parentNode.querySelector('.ad-video-progress-fill');
          if (fill) fill.style.width = percent + '%';
        });
      });
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initAdModalSetup);
    } else {
      initAdModalSetup();
    }
  `;

  if (items.length > 1) {
    js += `
      let currentAdIndex = 0;
      const adCount = ${items.length};
      let adAutoplayTimer = null;
      let progressInterval = null;
      let progressMs = 0;
      const slideDuration = 4000;
      
      function updateAdAudioButton() {
        const carouselEl = document.getElementById('adCarousel');
        const audioBtn = document.getElementById('adAudioBtn');
        if (carouselEl && audioBtn) {
          const currentSlide = carouselEl.children[currentAdIndex];
          if (currentSlide && currentSlide.querySelector('video')) {
            audioBtn.style.display = 'flex';
          } else {
            audioBtn.style.display = 'none';
          }
        }
      }

      function updateAdVideos() {
        const carouselEl = document.getElementById('adCarousel');
        if (!carouselEl) return;
        const slides = carouselEl.children;
        for (let i = 0; i < slides.length; i++) {
          const video = slides[i].querySelector('video');
          if (video) {
            if (i === currentAdIndex) {
              try {
                video.play().catch(function() {});
              } catch(e) {}
            } else {
              try {
                video.pause();
                video.currentTime = 0;
              } catch(e) {}
            }
          }
        }
      }

      function updateAdProgress() {
        const fills = [];
        for (let i = 0; i < adCount; i++) {
          fills.push(document.getElementById('adProgressFill-' + i));
        }
        
        for (let i = 0; i < adCount; i++) {
          if (fills[i]) {
            if (i < currentAdIndex) fills[i].style.width = '100%';
            else if (i > currentAdIndex) fills[i].style.width = '0%';
          }
        }
        
        clearInterval(progressInterval);
        progressMs = 0;
        const activeFill = fills[currentAdIndex];
        if (activeFill) {
          progressInterval = setInterval(() => {
            progressMs += 100;
            const pct = Math.min(100, (progressMs / slideDuration) * 100);
            activeFill.style.width = pct + '%';
            if (progressMs >= slideDuration) {
              clearInterval(progressInterval);
            }
          }, 100);
        }
      }
      
      function showAdSlide(idx) {
        currentAdIndex = (idx + adCount) % adCount;
        const carousel = document.getElementById('adCarousel');
        if (carousel) {
          const width = carousel.offsetWidth;
          carousel.scrollTo({ left: currentAdIndex * width, behavior: 'smooth' });
        }
        updateAdProgress();
        updateAdVideos();
        updateAdAudioButton();
      }
      
      function navigateAdCarousel(direction) {
        resetAdAutoplay();
        showAdSlide(currentAdIndex + direction);
      }
      
      function startAdAutoplay() {
        updateAdProgress();
        adAutoplayTimer = setInterval(() => {
          showAdSlide(currentAdIndex + 1);
        }, slideDuration);
      }
      
      function resetAdAutoplay() {
        clearInterval(adAutoplayTimer);
        clearInterval(progressInterval);
        startAdAutoplay();
      }
      
      function initAdCarouselFeatures() {
        const carousel = document.getElementById('adCarousel');
        if (carousel && adCount > 1) {
          startAdAutoplay();
          updateAdVideos();
          updateAdAudioButton();
          
          carousel.addEventListener('scroll', () => {
            const scrollPos = carousel.scrollLeft;
            const width = carousel.offsetWidth || 1;
            const newIdx = Math.round(scrollPos / width);
            if (newIdx !== currentAdIndex && newIdx < adCount) {
              currentAdIndex = newIdx;
              updateAdProgress();
              updateAdVideos();
              updateAdAudioButton();
            }
          });

          window.addEventListener('resize', () => {
            const width = carousel.offsetWidth;
            carousel.scrollTo({ left: currentAdIndex * width, behavior: 'auto' });
          });
        }
      }

      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initAdCarouselFeatures);
      } else {
        initAdCarouselFeatures();
      }
    `;
  }

  if (ad.timerEnabled) {
    const duration = ad.timerDuration || 15;
    js += `
      let _adTimerStarted = false;
      function initAdTimerSetup() {
        const video = document.querySelector('#adModal video');
        if (video) {
          if (video.duration) {
            _adTimerStarted = true;
            startAdTimer(Math.ceil(video.duration));
          } else {
            video.addEventListener('loadedmetadata', function() {
              if (!_adTimerStarted) {
                _adTimerStarted = true;
                startAdTimer(Math.ceil(video.duration));
              }
            });
            setTimeout(function() {
              if (!_adTimerStarted) {
                _adTimerStarted = true;
                startAdTimer(${duration});
              }
            }, 3000);
          }
        } else {
          _adTimerStarted = true;
          startAdTimer(${duration});
        }
      }

      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initAdTimerSetup);
      } else {
        initAdTimerSetup();
      }
      
      function startAdTimer(duration) {
        if (duration <= 0) return;
        const closeBtn = document.getElementById('adCloseBtn');
        const timerBadge = document.getElementById('adTimerBadge');
        
        if (closeBtn) closeBtn.style.display = 'none';
        if (timerBadge) {
          timerBadge.style.display = 'block';
          timerBadge.innerHTML = 'Aguarde ' + duration + 's...';
        }

        let count = duration;
        const timer = setInterval(() => {
          count--;
          if (timerBadge) {
            timerBadge.innerHTML = 'Aguarde ' + count + 's...';
          }
          if (count <= 0) {
            clearInterval(timer);
            if (timerBadge) timerBadge.style.display = 'none';
            if (closeBtn) closeBtn.style.display = 'flex';
          }
        }, 1000);
      }
    `;
  } else {
    js += `
      function initNoTimerSetup() {
        const closeBtn = document.getElementById('adCloseBtn');
        const timerBadge = document.getElementById('adTimerBadge');
        if (closeBtn) closeBtn.style.display = 'flex';
        if (timerBadge) timerBadge.style.display = 'none';
      }

      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initNoTimerSetup);
      } else {
        initNoTimerSetup();
      }
    `;
  }

  return { css, html, js };
}

function generateEffectsMarkup(effects: any = {}, colors: any = {}, social: any = {}, badges: any = {}, customCode: any = {}, bg: any = {}) {
  const bgEffect = effects.bgEffect || 'none';
  const speed = effects.bgEffectSpeed || 'normal';
  const shape = effects.cardShape || 'rounded';
  const brand = colors.brand || '#2563eb';
  const brandDark = colors.brandDark || '#1d4ed8';
  const blue = colors.blue || '#2563eb';
  const green = colors.green || '#10b981';

  let bgHtml = '';
  let cssEffects = '';
  let jsEffects = '';

  if (bgEffect && bgEffect !== 'none') {
    const fx = getNicheEffectMarkup(bgEffect, speed, brand, brandDark, blue, green);
    bgHtml = fx.html;
    cssEffects += fx.css;
    jsEffects += fx.js;
    // Adicionar transparência apenas para o body e overlays para que o efeito do nicho seja visível por trás do card
    cssEffects += `\nhtml body, html body[class], body.theme-default, body[class*="theme-"], html, body, .theme-layout, #wrapper, .bg-overlay, .background-overlay { background: transparent !important; background-color: transparent !important; background-image: none !important; }\n#mg-app-root, form, .container, main, .main, .content { position: relative !important; z-index: 1 !important; }\n`;
    if (bg && bg.url) {
      cssEffects += `\n#mg-fx-niche, #mg-fx-canvas-particles, #mg-fx-canvas-matrix, #mg-fx-canvas-warp, #mg-fx-canvas-waves, #mg-fx-cybergrid, #mg-fx-orbs, #mg-fx-fireflies, #mg-fx-aurora { background: transparent !important; }\n`;
    }
  }

  // Card Shapes
  if (shape === 'square') {
    cssEffects += `#box, .login-card, .card { border-radius: 4px !important; clip-path: none !important; }\n`;
  } else if (shape === 'pill') {
    cssEffects += `#box, .login-card, .card { border-radius: 36px !important; clip-path: none !important; }\n`;
  } else if (shape === 'scifi-cut') {
    cssEffects += `#box, .login-card, .card { border-radius: 0 !important; clip-path: polygon(0 16px, 16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px)) !important; }\n`;
  } else {
    cssEffects += `#box, .login-card, .card { border-radius: 20px !important; clip-path: none !important; }\n`;
  }

  // Card Noise Texture
  if (effects.cardNoiseTexture) {
    cssEffects += `#box, .login-card, .card { background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0) !important; background-size: 8px 8px !important; }\n`;
  }

  if (effects.cardGlowBorder) {
    cssEffects += `
#box, .login-card, .card {
  position: relative !important;
  box-shadow: 0 0 25px ${brand}40, inset 0 0 15px ${brand}20 !important;
}
#box::before, .login-card::before, .card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(90deg, ${brand}, ${green}, ${blue}, ${brand});
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
`;
  }

  if (effects.cardTilt3d) {
    jsEffects += `
(function() {
  var card = document.getElementById('box') || document.querySelector('.login-card') || document.querySelector('.card');
  if (!card) return;
  card.style.transition = 'transform 0.15s ease-out';
  card.style.transformStyle = 'preserve-3d';

  function handleMove(e) {
    var rect = card.getBoundingClientRect();
    var clientX = e.clientX || (e.touches && e.touches[0].clientX);
    var clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientX || !clientY) return;
    var x = clientX - rect.left - rect.width / 2;
    var y = clientY - rect.top - rect.height / 2;
    var maxTilt = 8;
    var tiltX = -(y / (rect.height / 2)) * maxTilt;
    var tiltY = (x / (rect.width / 2)) * maxTilt;
    card.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) scale3d(1.01, 1.01, 1.01)';
  }

  function handleLeave() {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('touchmove', handleMove);
  window.addEventListener('mouseleave', handleLeave);
  window.addEventListener('touchend', handleLeave);
})();
`;
  }

  if (effects.btnShimmer) {
    cssEffects += `
.btn-login, #btnSignup, button[type="submit"], input[type="submit"] {
  position: relative !important;
  overflow: hidden !important;
}
.btn-login::after, #btnSignup::after, button[type="submit"]::after {
  content: '' !important;
  position: absolute !important;
  top: -50% !important;
  left: -60% !important;
  width: 40% !important;
  height: 200% !important;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent) !important;
  transform: rotate(30deg) !important;
  animation: mgShimmerSweep 3.5s infinite !important;
  pointer-events: none !important;
}
@keyframes mgShimmerSweep {
  0% { left: -60%; }
  30% { left: 140%; }
  100% { left: 140%; }
}
`;
  }

  if (effects.btnPulse) {
    cssEffects += `
.btn-login, button[type="submit"], input[type="submit"] {
  animation: mgPulseGlow 2s infinite alternate !important;
}
@keyframes mgPulseGlow {
  0% { box-shadow: 0 0 5px ${blue}40; transform: scale(1); }
  100% { box-shadow: 0 0 20px ${blue}90; transform: scale(1.02); }
}
`;
  }

  if (effects.titleGradient) {
    cssEffects += `
#box h1, .card h1, #heading h1, .title {
  background: linear-gradient(135deg, ${brand}, ${green}, ${blue}, ${brand}) !important;
  background-size: 300% 300% !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  animation: mgTitleGradient 6s ease infinite alternate !important;
}
@keyframes mgTitleGradient {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`;
  }

  // Floating WhatsApp Support
  let socialHtml = '';
  if (social && social.whatsappEnabled && social.whatsappNumber) {
    const waMsg = encodeURIComponent(social.whatsappMessage || '');
    socialHtml += `
<a id="mg-floating-whatsapp" href="https://wa.me/${social.whatsappNumber}?text=${waMsg}" target="_blank" style="position:fixed; bottom:20px; right:20px; width:52px; height:52px; border-radius:50%; background:#25d366; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(37,211,102,0.45); z-index:9999; text-decoration:none;">
  <svg style="width:28px;height:28px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
</a>
`;
  }

  // Network Badges
  let badgesHtml = '';
  if (badges && (badges.showWifiSpeed || badges.showSecurityBadge || badges.showConnectedCount)) {
    let bInner = '';
    if (badges.showWifiSpeed) {
      bInner += `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);">${badges.wifiSpeedText || '⚡ 5G WiFi'}</span>`;
    }
    if (badges.showSecurityBadge) {
      bInner += `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.3);">${badges.securityText || '🔒 WPA3'}</span>`;
    }
    if (badges.showConnectedCount) {
      bInner += `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(245,158,11,0.3);">🟢 $(logged-in) online</span>`;
    }
    badgesHtml = `
<div id="mg-badges-bar" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:12px;">
  ${bInner}
</div>
`;
  }

  // Custom User CSS
  if (customCode && customCode.customCss) {
    cssEffects += `\n/* ====== USER CUSTOM CSS ====== */\n${customCode.customCss}\n`;
  }

  return `<!-- MIKROGESTOR EFFECTS -->
<link href="fonts/fonts.css" rel="stylesheet">
${bgHtml}
${socialHtml}
${badgesHtml}
<style>
${cssEffects}
</style>
<script>
${jsEffects}
</script>
<!-- END MIKROGESTOR EFFECTS -->`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');
    const { CONFIG_PATH } = getPaths(template);

    const lanIp = getLocalLanIp();
    let config = {
      ...DEFAULT_CONFIG,
      systemUrl: `http://${lanIp}`
    };

    if (fs.existsSync(CONFIG_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
      const savedConfig = JSON.parse(fileContent);
      
      // If the saved URL is empty, contains localhost or default fallback, update it dynamically
      if (!savedConfig.systemUrl || savedConfig.systemUrl.includes('192.168.88.254') || savedConfig.systemUrl.includes('localhost')) {
        savedConfig.systemUrl = `http://${lanIp}`;
      }

      // Merge new schema fields in configuration properties
      savedConfig.enabled = savedConfig.enabled !== undefined ? savedConfig.enabled : true;
      savedConfig.redirectUrl = savedConfig.redirectUrl !== undefined ? savedConfig.redirectUrl : '';
      savedConfig.registerButtonText = savedConfig.registerButtonText !== undefined ? savedConfig.registerButtonText : 'Cadastre-se aqui';
      savedConfig.registerTitle = savedConfig.registerTitle !== undefined ? savedConfig.registerTitle : 'Wi-Fi Grátis';
      savedConfig.registerSubtitle = savedConfig.registerSubtitle !== undefined ? savedConfig.registerSubtitle : 'Cadastre-se abaixo para liberar o acesso à internet';
      savedConfig.registerSubmitText = savedConfig.registerSubmitText !== undefined ? savedConfig.registerSubmitText : 'Cadastrar e Conectar';
      savedConfig.termsText = savedConfig.termsText !== undefined ? savedConfig.termsText : 'Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.';
      savedConfig.trialEnabled = savedConfig.trialEnabled !== undefined ? savedConfig.trialEnabled : true;
      savedConfig.trialText = savedConfig.trialText !== undefined ? savedConfig.trialText : 'Acesso de teste disponível, ';
      savedConfig.trialLinkText = savedConfig.trialLinkText !== undefined ? savedConfig.trialLinkText : 'clique aqui';
      savedConfig.trialModalTitle = savedConfig.trialModalTitle !== undefined ? savedConfig.trialModalTitle : 'Acesso de Teste';
      savedConfig.trialModalMessage = savedConfig.trialModalMessage !== undefined ? savedConfig.trialModalMessage : 'Tem certeza de que deseja liberar o acesso grátis por 30 minutos?';
      savedConfig.trialModalConfirmText = savedConfig.trialModalConfirmText !== undefined ? savedConfig.trialModalConfirmText : 'Sim, Conectar';
      savedConfig.fields = { ...DEFAULT_CONFIG.fields, ...savedConfig.fields };
      savedConfig.effects = { ...DEFAULT_CONFIG.effects, ...savedConfig.effects };
      savedConfig.social = { ...DEFAULT_CONFIG.social, ...savedConfig.social };
      savedConfig.badges = { ...DEFAULT_CONFIG.badges, ...savedConfig.badges };
      savedConfig.customCode = { ...DEFAULT_CONFIG.customCode, ...savedConfig.customCode };
      savedConfig.studio = { ...DEFAULT_CONFIG.studio, ...savedConfig.studio };
      savedConfig.bg = { ...DEFAULT_CONFIG.bg, ...savedConfig.bg };
      savedConfig.ad = { ...DEFAULT_CONFIG.ad, ...savedConfig.ad };

      // Save updated configuration back to disk
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(savedConfig, null, 2), 'utf8');
      config = savedConfig;
    } else {
      // Create default config file if it does not exist
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    }
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Error fetching portal config:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');
    const { HOTSPOT_DIR, CONFIG_PATH, LOGIN_HTML_PATH } = getPaths(template);

    const newConfig = await request.json();
    const safeName = (template || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Save configuration
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf8');

    // Clean unused ad uploads dynamically to prevent file pollution
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(uploadDir)) {
        const activeUrls = new Set<string>();
        
        // Add current config (since it may not be fully saved/synced yet)
        // Helper to safely extract absolute path from any url variant
        const getSafePath = (urlStr: string) => {
          if (!urlStr) return '';
          let u = urlStr.split('?')[0];
          if (u.startsWith('http')) {
            try { u = new URL(u).pathname; } catch (e) {}
          }
          return u;
        };

        if (newConfig.ad) {
          if (newConfig.ad.mediaUrl) {
            const sp = getSafePath(newConfig.ad.mediaUrl);
            if (sp) activeUrls.add(sp);
          }
          if (Array.isArray(newConfig.ad.items)) {
            newConfig.ad.items.forEach((item: any) => {
              if (item && item.url) {
                const sp = getSafePath(item.url);
                if (sp) activeUrls.add(sp);
              }
            });
          }
        }
        if (newConfig.bg && newConfig.bg.url) {
          const sp = getSafePath(newConfig.bg.url);
          if (sp) activeUrls.add(sp);
        }
        
        // Gather ALL active urls from ALL OTHER templates to prevent cross-template deletion
        const hotspotDir = path.join(process.cwd(), 'hotspot');
        if (fs.existsSync(hotspotDir)) {
          const templates = fs.readdirSync(hotspotDir);
          templates.forEach(tpl => {
            const cfgPath = path.join(hotspotDir, tpl, 'config.json');
            if (fs.existsSync(cfgPath)) {
              try {
                const tplConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
                if (tplConfig.ad) {
                  if (tplConfig.ad.mediaUrl) {
                    const sp = getSafePath(tplConfig.ad.mediaUrl);
                    if (sp) activeUrls.add(sp);
                  }
                  if (Array.isArray(tplConfig.ad.items)) {
                    tplConfig.ad.items.forEach((item: any) => {
                      if (item && item.url) {
                        const sp = getSafePath(item.url);
                        if (sp) activeUrls.add(sp);
                      }
                    });
                  }
                }
                if (tplConfig.bg && tplConfig.bg.url) {
                  const sp = getSafePath(tplConfig.bg.url);
                  if (sp) activeUrls.add(sp);
                }
              } catch (e) {}
            }
          });
        }
        
        const files = fs.readdirSync(uploadDir);
        files.forEach(file => {
          if (file.startsWith('ad_') || file.startsWith('bg_')) {
            const fileUrl = `/uploads/${file}`;
            if (!activeUrls.has(fileUrl)) {
              try {
                fs.unlinkSync(path.join(uploadDir, file));
                console.log(`Auto-cleaned unused upload file: ${file}`);
              } catch (err) {}
            }
          }
        });
      }
    } catch (cleanupErr) {
      console.error('Failed to auto-clean unused ad ad uploads:', cleanupErr);
    }

    // If login.html exists, update its CSS variables and redirect URL
    if (fs.existsSync(LOGIN_HTML_PATH)) {
      let html = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
      html = html.replace(/onerror\s*=\s*["'][^"']*["']/gi, 'onerror="this.onerror=null;"');

      // Strip any stale debug overlay scripts injected by older compiled versions
      html = html.replace(/<div[^>]*id="mg-debug-overlay"[^>]*>[\s\S]*?<\/div>/gi, '');
      html = html.replace(/var debugOverlay[\s\S]*?debugOverlay\.innerText\s*=\s*[^;]+;/g, '');
      // Strip any accidentally compiled livePreviewScript blocks
      html = html.replace(/<!-- MG_LIVE_PREVIEW_SCRIPT -->[\s\S]*?<!-- END_MG_LIVE_PREVIEW_SCRIPT -->/gi, '');

      // ═══════════════════════════════════════════════════════════════
      // THEME CSS COMPILATION (MIKROGESTOR_THEME_LINK)
      // ═══════════════════════════════════════════════════════════════
      const c = newConfig.colors || {};
      const studio = newConfig.studio || {};
      const brand = newConfig.brand || {};
      
      const brandColor = c.brand || '#f3d078';
      const brandDarkColor = c.brandDark || '#c49d3b';
      const bgColor = c.bg || '#141418';
      const inkColor = c.ink || '#ffffff';
      const mutedColor = c.muted || '#9a9aa8';
      const blueColor = c.blue || brandColor || '#f3d078';
      const greenColor = c.green || '#e5c158';
      const fontFamily = studio.fontFamily || 'Outfit';
      const rawGlass = c.glassOpacity !== undefined ? c.glassOpacity : 90;
      let opVal = (rawGlass <= 1 && rawGlass > 0) ? Math.round(rawGlass * 100) : rawGlass;
      if (opVal < 30) opVal = 85;
      const glassOpacity = (opVal / 100).toFixed(2);
      const glassBlur = c.glassBlur !== undefined ? `${c.glassBlur}px` : '12px';
      const borderRadius = studio.cardRadiusTL !== undefined ? `${studio.cardRadiusTL}px` : '16px';
      
      function hexToRgb(hex: string) {
        if (!hex) return '255, 255, 255';
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
        if (hex.length !== 6) return '255, 255, 255';
        const num = parseInt(hex, 16);
        return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
      }
      const cardBgRgb = hexToRgb(c.cardBg || '#ffffff');

      const themeCss = `
/* ==============================================
   MIKROGESTOR PORTAL CSS — GERADO DINAMICAMENTE
   ============================================== */
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Inter:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Outfit:wght@400;600;700&family=Poppins:wght@400;600;700&family=Roboto+Mono:wght@400;600;700&display=swap');

:root {
  --brand: ${brandColor};
  --brand-dark: ${brandDarkColor};
  --bg: ${bgColor};
  --ink: ${inkColor};
  --muted: ${mutedColor};
  --blue: ${blueColor};
  --green: ${greenColor};
  --font-family: '${fontFamily}', 'Outfit', 'Segoe UI', Roboto, Arial, sans-serif;
  --glass-opacity: ${glassOpacity};
  --glass-blur: ${glassBlur};
  --border-radius: ${borderRadius};
  --card-bg-rgb: ${cardBgRgb};
  --glow-color: transparent;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  min-width: 300px;
  font-family: var(--font-family);
  background: var(--bg);
  min-height: 100vh;
  color: var(--ink);
}

  /* Background Video & Image full cover responsive without borders */
  #mg-bg-video {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    min-width: 100%;
    min-height: 100%;
    z-index: -2;
    object-fit: cover !important;
    object-position: center center !important;
    background-color: #000;
    pointer-events: none;
  }

  #mg-bg-image {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    min-width: 100%;
    min-height: 100%;
    z-index: -2;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    pointer-events: none;
  }

#mg-app-root, form, .container, main, .main, .content {
  position: relative !important;
  z-index: 1 !important;
}

#box {
  position: relative;
  z-index: 10 !important;
  background: rgba(var(--card-bg-rgb), var(--glass-opacity)) !important;
  backdrop-filter: blur(var(--glass-blur)) !important; -webkit-backdrop-filter: blur(var(--glass-blur)) !important;
  border-radius: var(--border-radius) !important; border: 1px solid rgba(255,255,255,0.25) !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important;
  padding: 20px; margin: 40px auto 24px; max-width: 420px; width: calc(100% - 32px); padding-bottom: 24px;
}
.mg-message { text-align: center; font-size: 12px; color: var(--muted); margin-bottom: 16px; }
#user, #pass {
  border: 1px solid #e2e8f0; color: #111827; background: rgba(248,250,252,0.9); height: 40px; font-size: 14px;
  font-family: var(--font-family); display: block; width: 100%; border-radius: 8px; padding: 0 12px; margin: 12px 0;
  -webkit-appearance: none; appearance: none; outline: none; transition: border-color 0.2s;
}
#user:focus, #pass:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
#user::placeholder, #pass::placeholder { color: var(--muted); }
.actions { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 12px !important; margin-top: 16px !important; }
.btn {
  -webkit-appearance: none; appearance: none; border: 0; height: 40px; border-radius: 8px; cursor: pointer; font-weight: 700;
  font-size: 13px; font-family: var(--font-family); width: 100%; display: flex !important; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08); transition: filter 0.2s ease, transform 0.1s; touch-action: manipulation; text-decoration: none; opacity: 0.95;
}
.btn:active { transform: translateY(1px); }
.btn-login { background: var(--blue) !important; color: #fff !important; }
.btn-login:hover { filter: brightness(0.92); }
.btn-cad { background: var(--green) !important; color: #fff !important; }
.btn-cad:hover { filter: brightness(0.92); }
.footer { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.07); font-size: 9px; color: var(--muted); }
.footer a { text-decoration: none; color: var(--blue); }
.err {
  background: #1f2937; border: 1px solid #7f1d1d; color: #fecaca; padding: 8px 12px; border-radius: 10px; margin: 16px auto 0;
  max-width: 420px; width: calc(100% - 32px); text-align: center; font-size: 13px;
}
@media (max-width: 480px) {
  #box { padding: 16px; }
  .actions { grid-template-columns: 1fr !important; gap: 8px !important; }
}
`;

      const colorsRegex = /(<!--\s*MIKROGESTOR_THEME_LINK\s*-->|<!--\s*MIKROGESTOR COLORS\s*-->)[\s\S]*?(<!--\s*END_MIKROGESTOR_THEME_LINK\s*-->|<!--\s*END MIKROGESTOR COLORS\s*-->)/i;
      const themeHtml = `<!-- MIKROGESTOR_THEME_LINK -->\n  <style id="mg-theme-css-inline">${themeCss}  </style>\n  <!-- END_MIKROGESTOR_THEME_LINK -->`;

      if (colorsRegex.test(html)) {
         html = html.replace(colorsRegex, themeHtml);
      } else if (html.includes('</head>')) {
         html = html.replace('</head>', `${themeHtml}\n</head>`);
      } else {
         html = `${themeHtml}\n` + html;
      }

      // Update Business Name in #business-name if present
      const bName = newConfig.brand?.titleText || newConfig.businessName;
      if (bName) {
        html = html.replace(/(<h2[^>]*id="business-name"[^>]*>)[^<]*(<\/h2>)/i, `$1${bName}$2`);
        html = html.replace(/(<title>)[^<]*(<\/title>)/i, `$1Hotspot - ${bName}$2`);
      }

      // ═══════════════════════════════════════════════════════════════
      // BACKGROUND INJECTION (MIKROGESTOR_BG_SCRIPT)
      // ═══════════════════════════════════════════════════════════════
      const dbSystemUrl = await prisma.systemConfig.findUnique({ where: { key: 'SYSTEM_URL' } });
      const systemUrl = newConfig.systemUrl || dbSystemUrl?.value || `http://${getLocalLanIp()}`;
      const MG_SERVER_BASE = systemUrl.replace(/\/$/, '');

      const bgBlockRegex = /(<!--\s*MIKROGESTOR_BG_SCRIPT\s*-->|<!--\s*MIKROGESTOR BG\s*-->)[\s\S]*?(<!--\s*END_MIKROGESTOR_BG_SCRIPT\s*-->|<!--\s*END MIKROGESTOR BG\s*-->)/i;
      let bgHtml = '<!-- MIKROGESTOR_BG_SCRIPT -->\n';

      if (newConfig.bg && newConfig.bg.url && String(newConfig.bg.url).trim() !== '') {
        const cleanBgUrl = newConfig.bg.url.split('?')[0];
        const isVideo = newConfig.bg.type === 'video' || cleanBgUrl.match(/\.(mp4|webm|ogg)$/i);
        const directAssetUrl = cleanBgUrl.startsWith('http') ? cleanBgUrl : (cleanBgUrl.startsWith('/') ? `${MG_SERVER_BASE}${cleanBgUrl}` : `${MG_SERVER_BASE}/${cleanBgUrl}`);

        if (isVideo) {
          bgHtml += `<video id="mg-bg-video" autoplay loop muted playsinline webkit-playsinline x5-playsinline preload="auto" poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" style="position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;min-width:100%;min-height:100%;object-fit:cover !important;object-position:center center !important;z-index:-2;background-color:#000;pointer-events:none;" disablepictureinpicture controlslist="nodownload no-fullscreen noremoteplayback">
  <source src="${directAssetUrl}" type="video/mp4">
</video>
<script>
  (function() {
    function mgInitVideo() {
      var v = document.getElementById('mg-bg-video');
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('poster', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E');
      if (v.paused) {
        var p = v.play();
        if (p && typeof p.catch === 'function') {
          p.catch(function() {
            var unlock = function() {
              v.play().catch(function(){});
              document.removeEventListener('click', unlock);
              document.removeEventListener('touchstart', unlock);
            };
            document.addEventListener('click', unlock, { once: true });
            document.addEventListener('touchstart', unlock, { once: true });
          });
        }
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mgInitVideo);
    } else {
      mgInitVideo();
    }
    window.addEventListener('load', mgInitVideo);
  })();
</script>
`;
        } else {
          bgHtml += `<div id="mg-bg-image" style="position:fixed;right:0;bottom:0;min-width:100%;min-height:100%;width:100vw;height:100vh;z-index:-2;background-image:url('${directAssetUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;pointer-events:none;"></div>
`;
        }
      }
      bgHtml += '<!-- END_MIKROGESTOR_BG_SCRIPT -->';

      if (bgBlockRegex.test(html)) {
        html = html.replace(bgBlockRegex, bgHtml);
      } else {
        html = html.replace(/(<body[^>]*>)/i, `$1\n  ${bgHtml}\n`);
      }

      // ═══════════════════════════════════════════════════════════════
      // EFFECTS & VISUAL NICHES INJECTION (MIKROGESTOR_EFFECTS)
      // ═══════════════════════════════════════════════════════════════
      const effectsMarkup = generateEffectsMarkup(
        newConfig.effects,
        newConfig.colors,
        newConfig.social,
        newConfig.badges,
        newConfig.customCode,
        newConfig.bg
      );

      const effectsBlockRegex = /<!--\s*MIKROGESTOR[_\s]EFFECTS\s*-->[\s\S]*?<!--\s*END[_\s]MIKROGESTOR[_\s]EFFECTS\s*-->/i;
      if (effectsBlockRegex.test(html)) {
        html = html.replace(effectsBlockRegex, effectsMarkup);
      } else {
        html = html.replace(/(<body[^>]*>)/i, `$1\n  ${effectsMarkup}\n`);
      }

      // ═══════════════════════════════════════════════════════════════
      // REGISTER BUTTON INJECTION (MIKROGESTOR_REGISTER_BTN)
      // ═══════════════════════════════════════════════════════════════
      const btnRegex = /(<!--\s*MIKROGESTOR_REGISTER_BTN\s*-->)[\s\S]*?(<!--\s*END_MIKROGESTOR_REGISTER_BTN\s*-->)/i;
      const displayStyle = newConfig.enabled !== false ? 'flex' : 'none';
      const btnText = newConfig.registerButtonText || 'ACESSAR REDE VIP';
      const registerButtonHTML = `<!-- MIKROGESTOR_REGISTER_BTN -->\n<a id="btnSignup" class="btn btn-cad" href="${MG_SERVER_BASE}/portal/register?link-login-only=$$(link-login-only-esc)&link-orig=$$(link-orig-esc)" style="display: ${displayStyle};">${btnText}</a>\n<!-- END_MIKROGESTOR_REGISTER_BTN -->`;

      if (btnRegex.test(html)) {
         html = html.replace(btnRegex, registerButtonHTML);
      } else {
         const oldBtnRegex = /(<a[^>]*id="btnSignup"[^>]*>|<button[^>]*id="btnSignup"[^>]*>)[\s\S]*?(<\/a>|<\/button>)/i;
         if (oldBtnRegex.test(html)) {
            html = html.replace(oldBtnRegex, registerButtonHTML);
         }
      }

      // ═══════════════════════════════════════════════════════════════
      // TRIAL BLOCK INJECTION (MIKROGESTOR_TRIAL_BLOCK)
      // ═══════════════════════════════════════════════════════════════
      const trialDisplay = newConfig.trialEnabled !== false ? 'block' : 'none';
      const trialText = newConfig.trialText !== undefined ? newConfig.trialText : 'Acesso de teste disponível, ';
      const trialLinkText = newConfig.trialLinkText || 'clique aqui';
      const trialConfirmMsg = newConfig.trialModalMessage || 'Confirmar acesso de teste?';

      const trialContainerRegex = /(<!--\s*MIKROGESTOR_TRIAL_BLOCK\s*-->)[\s\S]*?(<!--\s*END_MIKROGESTOR_TRIAL_BLOCK\s*-->)/i;
      const trialHtml = `<!-- MIKROGESTOR_TRIAL_BLOCK -->\n<div id="trial-container" style="display: ${trialDisplay}; text-align: center; font-size: 11px; margin-top: 12px; color: var(--muted);">\n$$(if trial == 'yes')\n${trialText}<a href="javascript:void(0)" onclick="if(confirm('${trialConfirmMsg}')) confirmTrialLogin()" style="color: var(--blue); text-decoration: underline; font-weight: 600;">${trialLinkText}</a>.\n$$(endif)\n</div>\n<!-- END_MIKROGESTOR_TRIAL_BLOCK -->`;

      if (trialContainerRegex.test(html)) {
         html = html.replace(trialContainerRegex, trialHtml);
      } else {
         const oldTrialRegex = /<(span|div)\s+id="trial-container"[\s\S]*?<\/div>/i;
         if (oldTrialRegex.test(html)) {
             html = html.replace(oldTrialRegex, trialHtml);
         } else if (html.includes('<div class="footer">')) {
             html = html.replace('<div class="footer">', `<div class="footer">\n        ${trialHtml}`);
         } else {
             html = html.replace(/<\/form>/i, `\n\n${trialHtml}\n\n$&`);
         }
      }

      // Update trial modal texts based on configuration
      const tmTitle = newConfig.trialModalTitle || 'Acesso de Teste';
      const tmMsg = newConfig.trialModalMessage || 'Tem certeza de que deseja liberar o acesso grátis por 30 minutos?';
      const tmConfirm = newConfig.trialModalConfirmText || 'Sim, Conectar';
      const tmCancel = newConfig.trialModalCancelText || 'Não, Voltar';

      // Update comment-wrapped trial modal (legacy format)
      const tmRegex = /<!-- Trial Modal -->[\s\S]*?<!-- End Trial Modal -->/i;
      if (tmRegex.test(html)) {
        html = html.replace(
          tmRegex,
          `<!-- Trial Modal -->
  <div id="trial-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); justify-content: center; align-items: center; z-index: 9999; padding: 15px;">
    <div style="background: #fff; color: var(--ink); border-radius: 12px; max-width: 380px; width: 100%; padding: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
      <h3 id="trial-modal-title" style="margin-top: 0; font-size: 18px; font-weight: bold; color: var(--brand);">${tmTitle}</h3>
      <p id="trial-modal-message" style="font-size: 13px; color: var(--muted); margin: 15px 0;">${tmMsg}</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
        <button id="trial-modal-cancel" type="button" class="btn" style="background: #e5e7eb; color: #374151; font-size: 13px;" onclick="closeTrialModal()">${tmCancel}</button>
        <button id="trial-modal-confirm" type="button" class="btn btn-login" style="font-size: 13px;" onclick="confirmTrialLogin()">${tmConfirm}</button>
      </div>
    </div>
  </div>
  <!-- End Trial Modal -->`
        );
      } else {
        // Update id-based trial modal (new template format) - just update the text nodes
        html = html.replace(/(<h3[^>]*id="trialModalTitle"[^>]*>)[^<]*/i, `$1${tmTitle}`);
        html = html.replace(/(<p[^>]*id="trialModalMsg"[^>]*>)[^<]*/i,   `$1${tmMsg}`);
        html = html.replace(/(<button[^>]*id="trialCancelBtn"[^>]*>)[^<]*/i,  `$1${tmCancel}`);
        html = html.replace(/(<button[^>]*id="trialConfirmBtn"[^>]*>)[^<]*/i, `$1${tmConfirm}`);
      }


      // Compile and inject Ad Carousel & Timer dynamic elements
      const { css: adCSS, html: adHTML, js: adJS } = generateAdMarkup(newConfig.ad, newConfig.systemUrl);
      
      const cssRegex = /(\/\*\s*AdCarouselStyles\s*\*\/)[\s\S]*?(\/\*\s*EndAdCarouselStyles\s*\*\/)/i;
      if (cssRegex.test(html)) {
        html = html.replace(cssRegex, (match, p1, p2) => `${p1}\n${adCSS}\n${p2}`);
      } else if (adCSS) {
        if (/<\/style>/i.test(html)) {
           html = html.replace(/(<\/style>)/i, `/* AdCarouselStyles */\n${adCSS}\n/* EndAdCarouselStyles */\n$1`);
        } else if (/<\/head>/i.test(html)) {
           html = html.replace(/(<\/head>)/i, `<style>\n/* AdCarouselStyles */\n${adCSS}\n/* EndAdCarouselStyles */\n</style>\n$1`);
        }
      }
      
      const htmlRegex = /(<!--\s*AdCarouselBlock\s*-->)[\s\S]*?(<!--\s*EndAdCarouselBlock\s*-->)/i;
      if (htmlRegex.test(html)) {
        html = html.replace(htmlRegex, (match, p1, p2) => `${p1}\n${adHTML}\n${p2}`);
      } else if (adHTML) {
        if (/<body[^>]*>/i.test(html)) {
           html = html.replace(/(<body[^>]*>)/i, `$1\n<!-- AdCarouselBlock -->\n${adHTML}\n<!-- EndAdCarouselBlock -->\n`);
        } else {
           html = `<!-- AdCarouselBlock -->\n${adHTML}\n<!-- EndAdCarouselBlock -->\n` + html;
        }
      }
      
      const jsRegex = /(\/\*\s*AdCarouselScript\s*\*\/)[\s\S]*?(\/\*\s*EndAdCarouselScript\s*\*\/)/i;
      if (jsRegex.test(html)) {
        html = html.replace(jsRegex, (match, p1, p2) => `${p1}\n${adJS}\n${p2}`);
      } else if (adJS) {
        if (/<\/body>/i.test(html)) {
           html = html.replace(/(<\/body>)/i, `<script>\n/* AdCarouselScript */\n${adJS}\n/* EndAdCarouselScript */\n</script>\n$1`);
        } else {
           html += `\n<script>\n/* AdCarouselScript */\n${adJS}\n/* EndAdCarouselScript */\n</script>\n`;
        }
      }

      // Write changes back to login.html
      fs.writeFileSync(LOGIN_HTML_PATH, html, 'utf8');
    }

    return NextResponse.json({ success: true, message: 'Configurações salvas e aplicadas localmente.' });
  } catch (error: any) {
    console.error('Error updating portal config:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
