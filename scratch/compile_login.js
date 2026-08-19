const fs = require('fs');
const path = require('path');
const os = require('os');

const HOTSPOT_DIR = path.join(process.cwd(), 'hotspot');
const CONFIG_PATH = path.join(HOTSPOT_DIR, 'config.json');
const LOGIN_HTML_PATH = path.join(HOTSPOT_DIR, 'login.html');

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

function generateAdMarkup(ad, systemUrl) {
  if (!ad || ad.type === 'none') {
    return { css: '', html: '', js: '' };
  }

  let items = [];
  if (ad.type === 'image' && ad.mediaUrl) {
    items.push({ url: ad.mediaUrl, type: 'image', targetUrl: ad.targetUrl });
  } else if (ad.type === 'video' && ad.mediaUrl) {
    items.push({ url: ad.mediaUrl, type: 'video', targetUrl: ad.targetUrl });
  } else if (ad.type === 'carousel' && Array.isArray(ad.items)) {
    items = ad.items.filter(item => item && item.url);
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
  items.forEach((item, idx) => {
    let src = item.url;
    if (src.startsWith('/uploads/') || (!src.startsWith('http') && !src.startsWith('.'))) {
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
    items.forEach((_, idx) => {
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
      const adCount = \${items.length};
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
      function initAdTimerSetup() {
        startAdTimer(${duration});
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

function compile() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('config.json not found!');
    return;
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const lanIp = getLocalLanIp();
  const systemUrl = config.systemUrl || `http://${lanIp}`;

  if (!fs.existsSync(LOGIN_HTML_PATH)) {
    console.error('login.html not found!');
    return;
  }

  let html = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');

  // Update colors in :root
  if (config.colors) {
    const c = config.colors;
    if (c.brand) html = html.replace(/--brand:\s*#[0-9a-fA-F]{3,8}/, `--brand: ${c.brand}`);
    if (c.brandDark) html = html.replace(/--brand-dark:\s*#[0-9a-fA-F]{3,8}/, `--brand-dark: ${c.brandDark}`);
    if (c.bg) html = html.replace(/--bg:\s*#[0-9a-fA-F]{3,8}/, `--bg: ${c.bg}`);
    if (c.ink) html = html.replace(/--ink:\s*#[0-9a-fA-F]{3,8}/, `--ink: ${c.ink}`);
    if (c.muted) html = html.replace(/--muted:\s*#[0-9a-fA-F]{3,8}/, `--muted: ${c.muted}`);
    if (c.blue) html = html.replace(/--blue:\s*#[0-9a-fA-F]{3,8}/, `--blue: ${c.blue}`);
    if (c.green) html = html.replace(/--green:\s*#[0-9a-fA-F]{3,8}/, `--green: ${c.green}`);
  }

  // Update register button visibility, redirect URL and text based on configuration
  const btnDisplay = config.enabled !== false ? 'flex' : 'none';
  const btnText = config.registerButtonText || 'Cadastre-se aqui';
  const systemUrlTarget = systemUrl || '';

  const btnRegex = /<button\s+id="btnSignup"[\s\S]*?>([\s\S]*?)<\/button>/i;
  if (btnRegex.test(html)) {
    html = html.replace(
      btnRegex,
      `<button id="btnSignup" class="btn btn-cad" type="button" style="display: ${btnDisplay}" onclick="window.location.href='${systemUrlTarget}/portal/register?link-login-only=$$(link-login-only)&link-orig=$$(link-orig)&t=' + new Date().getTime()">${btnText}</button>`
    );
  }

  // Update trial accessibility, text and link text based on configuration
  const trialDisplay = config.trialEnabled !== false ? 'inline' : 'none';
  const trialText = config.trialText !== undefined ? config.trialText : 'Acesso de teste disponível, ';
  const trialLinkText = config.trialLinkText || 'clique aqui';

  const trialRegex = /<span\s+id="trial-container"[\s\S]*?>([\s\S]*?)<\/span>/i;
  if (trialRegex.test(html)) {
    html = html.replace(
      trialRegex,
      `<span id="trial-container" style="display: ${trialDisplay}">$$(if trial == 'yes')${trialText}<a href="javascript:void(0)" onclick="openTrialModal()">${trialLinkText}</a>.$$(endif)</span>`
    );
  }

  // Update trial modal texts based on configuration
  const tmTitle = config.trialModalTitle || 'Acesso de Teste';
  const tmMsg = config.trialModalMessage || 'Tem certeza de que deseja liberar o acesso grátis por 30 minutos?';
  const tmConfirm = config.trialModalConfirmText || 'Sim, Conectar';
  const tmCancel = config.trialModalCancelText || 'Não, Voltar';

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
  }

  // Compile and inject Ad Carousel & Timer dynamic elements
  const { css: adCSS, html: adHTML, js: adJS } = generateAdMarkup(config.ad, systemUrl);
  
  const cssRegex = /(\/\*\s*AdCarouselStyles\s*\*\/)[\s\S]*?(\/\*\s*EndAdCarouselStyles\s*\*\/)/i;
  if (cssRegex.test(html)) {
    html = html.replace(cssRegex, (match, p1, p2) => `${p1}\n${adCSS}\n${p2}`);
  }
  
  const htmlRegex = /(<!--\s*AdCarouselBlock\s*-->)[\s\S]*?(<!--\s*EndAdCarouselBlock\s*-->)/i;
  if (htmlRegex.test(html)) {
    html = html.replace(htmlRegex, (match, p1, p2) => `${p1}\n${adHTML}\n${p2}`);
  }
  
  const jsRegex = /(\/\*\s*AdCarouselScript\s*\*\/)[\s\S]*?(\/\*\s*EndAdCarouselScript\s*\*\/)/i;
  if (jsRegex.test(html)) {
    html = html.replace(jsRegex, (match, p1, p2) => `${p1}\n${adJS}\n${p2}`);
  }

  fs.writeFileSync(LOGIN_HTML_PATH, html, 'utf8');
  console.log('Successfully compiled and injected current configuration into login.html.');
}

compile();
