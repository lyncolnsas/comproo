export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getBrandEffectsStyles } from '@/lib/brand-effects-styles';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'default';
    const safeName = template.replace(/[^a-zA-Z0-9_-]/g, '');
    const templateDir = path.join(process.cwd(), 'hotspot', safeName);
    const loginHtmlPath = path.join(templateDir, 'login.html');
    const configJsonPath = path.join(templateDir, 'config.json');

    if (!fs.existsSync(loginHtmlPath)) {
      return new NextResponse('<h1>Template não encontrado</h1>', { status: 404, headers: { 'Content-Type': 'text/html' } });
    }

    let html = fs.readFileSync(loginHtmlPath, 'utf8');
    let initialConfig: any = {};
    if (fs.existsSync(configJsonPath)) {
      try { initialConfig = JSON.parse(fs.readFileSync(configJsonPath, 'utf8')); } catch (e) {}
    }

    // Replace MikroTik conditional blocks: show "yes" branch for trial
    html = html.replace(/\$\(if trial == 'yes'\)([\s\S]*?)\$\(endif\)/gi, '$1');
    html = html.replace(/(id="trial-container"[^>]*style="[^"]*)display:\s*none;?/gi, '$1display: flex;');

    // Replace remaining MikroTik variables with demo values
    html = html
      .replace(/\$\(username\)/g, 'demo_user')
      .replace(/\$\(error\)/g, '')
      .replace(/\$\(chap-id\)/g, '')
      .replace(/\$\(chap-challenge\)/g, '')
      .replace(/\$\(link-login-only\)/g, '#')
      .replace(/\$\(link-login-only-esc\)/g, '%23')
      .replace(/\$\(link-orig\)/g, 'http://google.com')
      .replace(/\$\(link-orig-esc\)/g, 'http%3A%2F%2Fgoogle.com')
      .replace(/\$\(mac\)/g, '9A:1E:3E:0D:8C:34')
      .replace(/\$\(mac-esc\)/g, '9A%3A1E%3A3E%3A0D%3A8C%3A34')
      .replace(/\$\(ip\)/g, '192.168.88.252')
      .replace(/\$\(trial\)/g, 'yes')
      .replace(/\$\(logged-in\)/g, '42')
      .replace(/\$\$\(if trial == 'yes'\)/g, '')
      .replace(/\$\$\(endif\)/g, '')
      .replace(/\$\$\(link-login-only\)/g, '#')
      .replace(/\$\$\(link-orig\)/g, 'http://google.com')
      .replace(/\$\([^)]*\)/g, '')
      .replace(/\$\$\([^)]*\)/g, '');

    // Replace broken or missing top-bar wifi-lock icons with self-contained crisp vector SVG
    const svgWifiIcon = `<svg style="height: 28px; width: 28px; fill: #ffffff;" viewBox="0 0 24 24"><path d="M12 3C6.95 3 2.5 5.56 0 9.42l2.36 2.36C4.12 8.44 7.78 6.5 12 6.5s7.88 1.94 9.64 5.28L24 9.42C21.5 5.56 17.05 3 12 3zm0 5c-3.31 0-6.29 1.52-8.25 3.91l2.36 2.36C7.39 12.87 9.53 12 12 12s4.61.87 5.89 2.27l2.36-2.36C18.29 9.52 15.31 8 12 8zm0 5c-1.38 0-2.5 1.12-2.5 2.5v.5H9c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-.5v-.5c0-1.38-1.12-2.5-2.5-2.5zm1 3h-2v-.5c0-.55.45-1 1-1s1 .45 1 1v.5z"/></svg>`;
    html = html.replace(/<img[^>]*wifi-lock\.png[^>]*>/gi, svgWifiIcon);

    // Sanitize onerror handlers to prevent infinite image loops
    html = html.replace(/onerror\s*=\s*["'][^"']*["']/gi, 'onerror="this.onerror=null;"');

    // 1. CRITICAL: Normalize any absolute URL pointing to uploads so the admin preview iframe loads it directly from localhost
    html = html.replace(/https?:\/\/[^\/"'\s\\]+\/uploads\//gi, '/uploads/');

    // 2. Inject live styling hooks into <head> WITHOUT stripping the compiled effects/styles from login.html
    const fontsTags = `<link href="/fonts/fonts.css" rel="stylesheet"><style id="mg-live-injected-css"></style><style id="mg-live-studio-css"></style><style id="mg-live-colors-css"></style><style id="mg-live-bg-style"></style>`;
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${fontsTags}</head>`);
    } else {
      html = fontsTags + html;
    }

    // 3. Rewrite relative asset URLs (like logo.png, fonts/fonts.css, etc.)
    html = html.replace(
      /(src|href)="(?!https?:|\/\/|data:|javascript:|\/uploads\/|\/api\/|\/fonts\/)([^"]+)"/gi,
      (match, attr, filePath) => {
        if (filePath.startsWith('/')) return match;
        return `${attr}="/api/portal/asset?template=${encodeURIComponent(safeName)}&file=${encodeURIComponent(filePath)}"`;
      }
    );

    html = html.replace(
      /this\.src\s*=\s*['"](?!https?:|\/\/|data:|javascript:|\/uploads\/|\/api\/|\/fonts\/)([^'"]+)['"]/gi,
      (match, filePath) => {
        if (filePath.startsWith('/')) return match;
        return `this.src='/api/portal/asset?template=${encodeURIComponent(safeName)}&file=${encodeURIComponent(filePath)}'`;
      }
    );

    const initialConfigJson = JSON.stringify(initialConfig || {});

    const livePreviewScript = `
<script>
  (function() {
    var activeRaf = null;
    var activeInterval = null;
    var currentConfig = ${initialConfigJson};

    function clearActiveFX() {
      if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = null; }
      if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
      var fxContainer = document.getElementById('mg-live-fx-container');
      if (fxContainer) fxContainer.innerHTML = '';
      // Remove any legacy static canvas if lingering
      var legacyCanvas = document.querySelectorAll('#mg-fx-niche, #mg-fx-canvas-particles, #mg-fx-canvas-matrix, #mg-fx-canvas-warp, #mg-fx-canvas-waves, #mg-fx-cybergrid, #mg-fx-orbs, #mg-fx-fireflies, #mg-fx-aurora');
      legacyCanvas.forEach(function(el) { el.remove(); });
    }

    function updateInjectedCss(cfg) {
      if (!cfg) return;
      var liveStyle = document.getElementById('mg-live-injected-css');
      if (!liveStyle) {
        liveStyle = document.createElement('style');
        liveStyle.id = 'mg-live-injected-css';
        document.head.appendChild(liveStyle);
      }
      var cardSelector = 'html body #box, html body .login-card, html body .login-box, html body form > div:not(.input-group):not(.actions):not(.footer)';
      var btnSelector = 'html body .btn-login, html body #btnConnect, html body #btnSubmit, html body button[type="submit"], html body input[type="submit"]';
      var btnCadSelector = 'html body .btn-cad, html body #btnSignup, html body .btn-register';
      var btnTrialSelector = 'html body .btn-trial, html body button.btn-trial, html body a.btn-trial';
      var inpSelector = 'html body input[type="text"], html body input[type="password"], html body select, html body textarea, html body .form-input';
      var titleSelector = 'html body h1, html body h2, html body .brand-title, html body #businessName, html body .title, html body legend, html body .logo-text';

      var rules = [];
      rules.push(cardSelector + ' { position: relative !important; z-index: 10 !important; }');
      rules.push('html body .container { margin-top: 15px !important; padding-top: 0 !important; }');
      
      var st = cfg.studio || {};
      var brand = (cfg.colors && (cfg.colors.blue || cfg.colors.brand)) || '#2563eb';
      var green = (cfg.colors && (cfg.colors.green || cfg.colors.btnSecondary)) || '#10b981';
      var blue = (cfg.colors && (cfg.colors.blue || cfg.colors.brand)) || '#2563eb';

      // Only apply explicit user overrides from Studio or Effects
      if (st.fontFamily && st.fontFamily !== 'Inter') {
        rules.push('body, input, button, select, textarea, h1, h2, h3, p, span { font-family: "' + st.fontFamily + '", sans-serif !important; }');
      }

      if (st.cardRadiusTL !== undefined && st.cardRadiusTR !== undefined) {
        rules.push(cardSelector + ' { border-radius: ' + st.cardRadiusTL + 'px ' + st.cardRadiusTR + 'px ' + st.cardRadiusBR + 'px ' + st.cardRadiusBL + 'px !important; clip-path: none !important; }');
      } else if (cfg.effects && cfg.effects.cardShape) {
        var shape = cfg.effects.cardShape;
        if (shape === 'square') {
          rules.push(cardSelector + ' { border-radius: 4px !important; clip-path: none !important; }');
        } else if (shape === 'pill') {
          rules.push(cardSelector + ' { border-radius: 36px !important; clip-path: none !important; }');
        } else if (shape === 'scifi-cut') {
          rules.push(cardSelector + ' { border-radius: 0 !important; clip-path: polygon(0 16px, 16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px)) !important; }');
        }
      }

      if (st.cardPaddingTop !== undefined && st.cardPaddingRight !== undefined) {
        rules.push(cardSelector + ' { padding: ' + st.cardPaddingTop + 'px ' + st.cardPaddingRight + 'px ' + st.cardPaddingBottom + 'px ' + st.cardPaddingLeft + 'px !important; }');
      }

      if (st.cardBorderWidth !== undefined && st.cardBorderWidth > 1) {
        rules.push(cardSelector + ' { border-width: ' + st.cardBorderWidth + 'px !important; border-style: ' + (st.cardBorderStyle || 'solid') + ' !important; }');
      }

      if (cfg.effects && cfg.effects.cardNoiseTexture) {
        rules.push(cardSelector + ' { background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0) !important; background-size: 8px 8px !important; }');
      }
      if (cfg.effects && cfg.effects.cardGlowBorder) {
        rules.push(cardSelector + ' { box-shadow: 0 0 25px color-mix(in srgb, ' + brand + ' 40%, transparent) !important; border-color: ' + brand + ' !important; }');
      }

      if (st.btnRadiusTL !== undefined && st.btnRadiusTR !== undefined) {
        rules.push(btnSelector + ', ' + btnCadSelector + ', ' + btnTrialSelector + ' { border-radius: ' + st.btnRadiusTL + 'px ' + st.btnRadiusTR + 'px ' + st.btnRadiusBR + 'px ' + st.btnRadiusBL + 'px !important; }');
      }
      if (st.btnHeight && st.btnHeight > 0) {
        rules.push(btnSelector + ', ' + btnCadSelector + ', ' + btnTrialSelector + ' { height: ' + st.btnHeight + 'px !important; min-height: ' + st.btnHeight + 'px !important; display: flex !important; align-items: center !important; justify-content: center !important; }');
      }
      if (st.btnFontSize) {
        rules.push(btnSelector + ', ' + btnCadSelector + ', ' + btnTrialSelector + ' { font-size: ' + st.btnFontSize + 'px !important; }');
      }
      if (st.btnFontWeight) {
        rules.push(btnSelector + ' { font-weight: ' + st.btnFontWeight + ' !important; }');
      }
      if (st.btnLetterSpacing !== undefined) {
        rules.push(btnSelector + ' { letter-spacing: ' + st.btnLetterSpacing + 'px !important; }');
      }
      if (st.btnBorderWidth !== undefined) {
        rules.push(btnSelector + ' { border-width: ' + st.btnBorderWidth + 'px !important; }');
      }

      if (st.inputHeight) {
        rules.push(inpSelector + ' { height: ' + st.inputHeight + 'px !important; min-height: ' + st.inputHeight + 'px !important; }');
      }
      if (st.inputRadius !== undefined) {
        rules.push(inpSelector + ' { border-radius: ' + st.inputRadius + 'px !important; }');
      }
      if (st.inputBorderWidth !== undefined) {
        rules.push(inpSelector + ' { border-width: ' + st.inputBorderWidth + 'px !important; }');
      }

      if (st.titleFontSize) {
        rules.push(titleSelector + ' { font-size: ' + st.titleFontSize + 'px !important; }');
      }
      if (st.titleFontWeight) {
        rules.push(titleSelector + ' { font-weight: ' + st.titleFontWeight + ' !important; }');
      }
      if (st.titleLineHeight) {
        rules.push(titleSelector + ' { line-height: ' + st.titleLineHeight + ' !important; }');
      }
      if (st.titleLetterSpacing !== undefined) {
        rules.push(titleSelector + ' { letter-spacing: ' + st.titleLetterSpacing + 'px !important; }');
      }
      if (st.titleAlign) {
        rules.push(titleSelector + ' { text-align: ' + st.titleAlign + ' !important; }');
      }
      if (st.titleItalic !== undefined) {
        rules.push(titleSelector + ' { font-style: ' + (st.titleItalic ? 'italic' : 'normal') + ' !important; }');
      }
      if (st.titleUnderline !== undefined) {
        rules.push(titleSelector + ' { text-decoration: ' + (st.titleUnderline ? 'underline' : 'none') + ' !important; }');
      }

      if (cfg.effects && cfg.effects.btnShimmer) {
        var allBtns = btnSelector + ', ' + btnCadSelector + ', ' + btnTrialSelector;
        var btnAfterSelector = 'html body .btn-login::after, html body #btnConnect::after, html body #btnSubmit::after, html body button[type="submit"]::after, html body input[type="submit"]::after, html body .btn-cad::after, html body #btnSignup::after, html body .btn-register::after, html body .btn-trial::after';
        rules.push(allBtns + ' { position: relative !important; overflow: hidden !important; } ' + btnAfterSelector + ' { content:"" !important; position:absolute !important; top:-50% !important; left:-60% !important; width:40% !important; height:200% !important; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent) !important; transform:rotate(30deg) !important; animation:mgShimmerSweep 3.5s infinite !important; pointer-events:none !important; }');
      }
      if (cfg.effects && cfg.effects.btnPulse) {
        rules.push(btnSelector + ' { animation: mgPulseGlow 2s infinite !important; }');
      }
      if (cfg.effects && cfg.effects.titleGradient) {
        rules.push(titleSelector + ' { background: linear-gradient(135deg, ' + brand + ', ' + green + ', ' + blue + ', ' + brand + ') !important; background-size: 300% 300% !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; animation: mgTitleGrad 6s ease infinite alternate !important; }');
      }

      rules.push('@keyframes mgShimmerSweep { 0% { left: -60%; } 20%, 100% { left: 160%; } }');
      rules.push('@keyframes mgPulseGlow { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { transform: scale(1.02); box-shadow: 0 0 15px 4px rgba(37,99,235,0.6); } }');
      rules.push('@keyframes mgTitleGrad { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }');
      rules.push('@keyframes mgGridMove { 0% { background-position: 0 0, 0 0, 0 0; } 100% { background-position: 0 0, 0 0, 0 80px; } }');
      rules.push('@keyframes mgAuroraFloat { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(15%, 15%) scale(1.15) rotate(20deg); } 100% { transform: translate(-10%, 25%) scale(0.9) rotate(-15deg); } }');
      rules.push('@keyframes mgAuroraPulse { 0% { transform: scale(0.8); opacity:0.3; } 100% { transform: scale(1.2); opacity:0.6; } }');
      rules.push('@keyframes mgOrbFloat1 { 0% { top: 10%; left: 10%; } 50% { top: 60%; left: 70%; } 100% { top: 10%; left: 10%; } }');
      rules.push('@keyframes mgOrbFloat2 { 0% { top: 70%; left: 20%; } 50% { top: 20%; left: 80%; } 100% { top: 70%; left: 20%; } }');
      rules.push('@keyframes mgOrbFloat3 { 0% { top: 40%; left: 80%; } 50% { top: 75%; left: 30%; } 100% { top: 40%; left: 80%; } }');

      liveStyle.innerHTML = rules.join(' ');
    }

    function applyLiveConfig(config) {
      if (!config) return;
      currentConfig = config;
      updateInjectedCss(config);
      var root = document.documentElement;
      var brand = (config.colors && config.colors.brand) || '#2563eb';
      var brandDark = (config.colors && config.colors.brandDark) || '#1d4ed8';
      var green = (config.colors && config.colors.green) || '#10b981';
      var blue = (config.colors && config.colors.blue) || '#2563eb';

      // 1. Tokens CSS e Estilos Dinâmicos Instantâneos de Cores
      if (config.colors) {
        var c = config.colors;
        var primaryBtnBg = c.blue || c.brand || '#2563eb';
        var primaryBtnText = c.loginButtonText || c.brandDark || '#ffffff';
        var secondaryBtnBg = c.green || c.btnSecondary || '#10b981';
        var secondaryBtnText = c.registerButtonText || c.btnSecondaryText || '#ffffff';
        var trialBtnBg = c.trialButtonBg || c.btnTrial || '#1E90FF';
        var trialBtnText = c.trialButtonText || c.btnTrialText || '#FFFFFF';
        var cardBgColor = c.cardBg || '#ffffff';
        var cardBorderColor = c.cardBorder || 'rgba(0,0,0,0.08)';
        var inputBgColor = c.inputBg || '#ffffff';
        var inputTextColor = c.inputText || '#0f172a';
        var inputBorderColor = c.inputBorder || '#e2e8f0';
        var inputPlaceholderColor = c.inputPlaceholder || '#94a3b8';
        var inkColor = c.ink || '#0f172a';
        var mutedColor = c.muted || '#64748b';
        var pageBgColor = c.bg || '#0f172a';
        var opVal = c.glassOpacity !== undefined ? c.glassOpacity : 100;
        var blVal = c.glassBlur !== undefined ? c.glassBlur : 0;

        root.style.setProperty('--brand', primaryBtnBg);
        root.style.setProperty('--brand-dark', primaryBtnText);
        root.style.setProperty('--bg', pageBgColor);
        root.style.setProperty('--ink', inkColor);
        root.style.setProperty('--text-muted', mutedColor);
        root.style.setProperty('--muted', mutedColor);
        root.style.setProperty('--btn-primary', primaryBtnBg);
        root.style.setProperty('--btn-primary-text', primaryBtnText);
        root.style.setProperty('--btn-secondary', secondaryBtnBg);
        root.style.setProperty('--btn-secondary-text', secondaryBtnText);
        root.style.setProperty('--trialButtonBg', trialBtnBg);
        root.style.setProperty('--trialButtonText', trialBtnText);
        root.style.setProperty('--card-bg', cardBgColor);
        root.style.setProperty('--card-border', cardBorderColor);
        root.style.setProperty('--input-bg', inputBgColor);
        root.style.setProperty('--input-text', inputTextColor);
        root.style.setProperty('--input-border', inputBorderColor);
        root.style.setProperty('--input-placeholder', inputPlaceholderColor);
        root.style.setProperty('--glass-opacity', opVal + '%');
        root.style.setProperty('--glass-blur', blVal + 'px');

        var liveColorsStyle = document.getElementById('mg-live-colors-css');
        if (!liveColorsStyle) {
          liveColorsStyle = document.createElement('style');
          liveColorsStyle.id = 'mg-live-colors-css';
          document.head.appendChild(liveColorsStyle);
        }

        var colorRules = [
          'html body #box, html body .login-card, html body .card, html body #card, html body form#login, html body .box-login, html body .login-panel { background: color-mix(in srgb, ' + cardBgColor + ' ' + opVal + '%, transparent) !important; border-color: ' + cardBorderColor + ' !important; backdrop-filter: blur(' + blVal + 'px) !important; -webkit-backdrop-filter: blur(' + blVal + 'px) !important; }',
          'html body .btn-login, html body #btnConnect, html body #btnSubmit, html body button[type="submit"]:not(.btn-trial), html body input[type="submit"], html body .btn-primary { background-color: ' + primaryBtnBg + ' !important; color: ' + primaryBtnText + ' !important; border-color: ' + primaryBtnBg + ' !important; }',
          'html body #btnSignup, html body .btn-register, html body .btn-secondary, html body .btn-cad { background-color: ' + secondaryBtnBg + ' !important; color: ' + secondaryBtnText + ' !important; border-color: ' + secondaryBtnBg + ' !important; }',
          'html body #trial-container button, html body .btn-trial, html body button.btn-trial, html body a.btn-trial { background-color: ' + trialBtnBg + ' !important; color: ' + trialBtnText + ' !important; border-color: ' + trialBtnBg + ' !important; }',
          'html body input[type="text"], html body input[type="password"], html body select, html body textarea, html body .form-input { background-color: ' + inputBgColor + ' !important; color: ' + inputTextColor + ' !important; border-color: ' + inputBorderColor + ' !important; }',
          'html body input::placeholder { color: ' + inputPlaceholderColor + ' !important; opacity: 0.8 !important; }',
          'html body #box h1, html body #box h2, html body #box h3, html body .card h1, html body .card h2, html body .card h3, html body .title, html body .brand-title, html body #businessName, html body legend { color: ' + inkColor + ' !important; }',
          'html body #box p, html body .subtitle, html body .card p, html body .instructions, html body .text-muted, html body #welcomeMessage, html body p.message { color: ' + mutedColor + ' !important; }'
        ];

        liveColorsStyle.innerHTML = colorRules.join(' ');
      }

      // 2. Fundo Estático ou Vídeo (Background Media Layer)
      var customBg = document.getElementById('custom-bg-layer');
      if (!customBg) {
        customBg = document.createElement('div');
        customBg.id = 'custom-bg-layer';
        document.body.prepend(customBg);
      }
      
      var bgUrl = (config.bg && config.bg.url) ? config.bg.url : '';
      var bgType = (config.bg && config.bg.type) ? config.bg.type : 'default';
      var effect = (config.effects && config.effects.bgEffect) || 'none';

      if ((bgUrl && bgType !== 'default') || effect !== 'none') {
        var isVideo = bgType === 'video' || bgUrl.match(/\.(mp4|webm|ogg)$/i);
        
        var cleanUrl = bgUrl;
        if (cleanUrl.startsWith('http')) {
          try { cleanUrl = new URL(cleanUrl).pathname; } catch(e) {}
        }
        if (cleanUrl.indexOf('/uploads/') !== -1) {
          // Extract direct path starting from /uploads/
          cleanUrl = cleanUrl.substring(cleanUrl.indexOf('/uploads/'));
        } else if (cleanUrl && !cleanUrl.startsWith('http') && !cleanUrl.startsWith('/')) {
          cleanUrl = '/api/portal/asset?template=' + encodeURIComponent(config.template || 'default') + '&file=' + encodeURIComponent(cleanUrl);
        }

        // Force html and body transparency so media/effects are 100% visible
        var bgStyle = document.getElementById('mg-live-bg-style');
        if (!bgStyle) {
          bgStyle = document.createElement('style');
          bgStyle.id = 'mg-live-bg-style';
          document.head.appendChild(bgStyle);
        }
        bgStyle.innerHTML = 'html, body, html body[class], body[class*="theme-"], .wrapper, .login-wrapper, .main-container, .page-container, .theme-layout, #wrapper, .bg-overlay, .background-overlay, main, .main, .content, .login-panel, .form-signin, .box-login, .container-fluid, .page-bg, .content-wrapper, section, article, .login-box, .card-body, canvas, #mg-live-canvas, #mg-fx-niche, div[class*="container"], div[class*="wrapper"], div[class*="login"], div[class*="bg"], div[class*="main"], div[class*="content"], div[class*="page"] { background: transparent !important; background-color: transparent !important; background-image: none !important; }';

        if (bgUrl && bgType !== 'default') {
          if (isVideo) {
            var existingVid = document.getElementById('mg-bg-video');
            if (existingVid) {
              var cleanBase = cleanUrl.split('?')[0];
              if (cleanBase && !existingVid.src.includes(cleanBase)) {
                existingVid.src = cleanUrl;
                existingVid.load();
              }
              existingVid.muted = true;
              existingVid.defaultMuted = true;
              existingVid.playsInline = true;
              existingVid.play().catch(function() {});
            } else {
              customBg.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-999; pointer-events:none; overflow:hidden; display:block;';
              customBg.innerHTML = '<video autoplay muted loop playsinline webkit-playsinline id="mg-bg-video" style="position:fixed; top:0; left:0; width:100vw; height:100vh; min-width:100%; min-height:100%; object-fit:cover; pointer-events:none; z-index:-999;" src="' + cleanUrl + '"></video>';
              var vidEl = document.getElementById('mg-bg-video');
              if (vidEl) {
                vidEl.muted = true;
                vidEl.defaultMuted = true;
                vidEl.playsInline = true;
                vidEl.play().catch(function() {});
              }
            }
          } else {
            var existingVid = document.getElementById('mg-bg-video');
            if (existingVid && existingVid.parentNode) existingVid.parentNode.remove();
            customBg.innerHTML = '';
            customBg.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-999; pointer-events:none; background-image: url("' + cleanUrl + '") !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important; display:block;';
          }
        } else {
          var existingVid = document.getElementById('mg-bg-video');
          if (existingVid && existingVid.parentNode) existingVid.parentNode.remove();
          customBg.innerHTML = '';
          customBg.style.cssText = 'display:none;';
        }
      } else {
        var existingVid = document.getElementById('mg-bg-video');
        if (existingVid && existingVid.parentNode) existingVid.parentNode.remove();
        customBg.innerHTML = '';
        customBg.style.cssText = 'display:none;';
      }



      // 3. Efeitos & Animações Visuais em Tempo Real
      var fxContainer = document.getElementById('mg-live-fx-container');
      if (!fxContainer) {
        fxContainer = document.createElement('div');
        fxContainer.id = 'mg-live-fx-container';
        document.body.prepend(fxContainer);
      }

      // Inject background override if image/video is active
      var bgOverride = document.getElementById('mg-fx-bg-override');
      if (bgOverride) bgOverride.remove();
      if (bgUrl && bgType !== 'default') {
        var styleEl = document.createElement('style');
        styleEl.id = 'mg-fx-bg-override';
        styleEl.innerHTML = '#mg-live-canvas, #mg-fx-niche, #mg-fx-canvas-particles, #mg-fx-canvas-matrix, #mg-fx-canvas-warp, #mg-fx-canvas-waves, #mg-fx-aurora, #mg-fx-orbs, #mg-fx-cybergrid, #mg-fx-fireflies { background: transparent !important; }';
        fxContainer.appendChild(styleEl);
      }
      
      clearActiveFX();

      var effect = (config.effects && config.effects.bgEffect) || 'none';
      var speed = (config.effects && config.effects.bgEffectSpeed) || 'normal';
      var speedSec = speed === 'slow' ? 24 : speed === 'fast' ? 7 : 14;

      if (effect !== 'none') {
        document.documentElement.style.setProperty('background', 'transparent', 'important');
        document.body.style.setProperty('background', 'transparent', 'important');
        document.querySelectorAll('.container, #main, .wrap, main').forEach(function(el) { el.style.backgroundColor = 'transparent'; });

        if (effect === 'cardio-pulse' || effect === 'academia') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#080a0c;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var sparks = []; var step = 0;
            function addSpk(px, py) { for (var i=0; i<6; i++) sparks.push({ x: px, y: py, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 1 }); }
            function loop() {
              ctx.fillStyle = 'rgba(8, 10, 12, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
              step += speed === 'fast' ? 4 : speed === 'slow' ? 1.5 : 2.5;
              var cx = (step * 3) % c.width; var cy = c.height * 0.55;
              var mod = (step * 3) % 220;
              if (mod > 60 && mod < 75) cy -= 35;
              else if (mod >= 75 && mod < 85) cy += 20;
              else if (mod >= 85 && mod < 100) { cy -= 110; if (mod === 90) addSpk(cx, cy); }
              else if (mod >= 100 && mod < 115) cy += 45;
              else if (mod >= 115 && mod < 135) cy -= 25;
              ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = brand; ctx.shadowBlur = 12; ctx.shadowColor = green; ctx.fill();
              for (var i = sparks.length - 1; i >= 0; i--) {
                var s = sparks[i]; s.x += s.vx; s.y += s.vy; s.life -= 0.03;
                if (s.life <= 0) { sparks.splice(i, 1); continue; }
                ctx.beginPath(); ctx.arc(s.x, s.y, 1.8 * s.life, 0, Math.PI * 2);
                ctx.fillStyle = green; ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'divine-rays' || effect === 'igreja') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#04060f;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var stars = []; for (var i=0; i<35; i++) stars.push({ x: Math.random()*c.width, y: Math.random()*c.height, r: Math.random()*2+0.8, vy: -(Math.random()*0.6+0.2) });
            var angle = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              angle += speed === 'fast' ? 0.006 : speed === 'slow' ? 0.001 : 0.003;
              var numRays = 7; var cx = c.width / 2;
              for (var r=0; r<numRays; r++) {
                var a = angle + (r * Math.PI / numRays) - Math.PI / 2;
                ctx.save(); ctx.beginPath(); ctx.moveTo(cx, -20);
                ctx.lineTo(cx + Math.cos(a - 0.15) * c.height * 1.5, c.height + 50);
                ctx.lineTo(cx + Math.cos(a + 0.15) * c.height * 1.5, c.height + 50);
                ctx.closePath();
                var grad = ctx.createLinearGradient(cx, 0, cx, c.height);
                grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
                grad.addColorStop(0.6, 'rgba(217, 119, 6, 0.08)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad; ctx.fill(); ctx.restore();
              }
              for (var s=0; s<stars.length; s++) {
                var st = stars[s]; st.y += st.vy; if (st.y < 0) { st.y = c.height; st.x = Math.random()*c.width; }
                ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
                ctx.fillStyle = brand; ctx.shadowBlur = 10; ctx.shadowColor = brand; ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'medical-vital' || effect === 'clinica') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#030914;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var cells = []; for (var i=0; i<20; i++) cells.push({ x: Math.random()*c.width, y: Math.random()*c.height, r: Math.random()*16+8, vx: (Math.random()-0.5)*0.4, vy: -(Math.random()*0.5+0.2) });
            function loop() {
              ctx.fillStyle = 'rgba(3, 9, 20, 0.2)'; ctx.fillRect(0, 0, c.width, c.height);
              for (var i=0; i<cells.length; i++) {
                var cl = cells[i]; cl.x += cl.vx; cl.y += cl.vy;
                if (cl.y < -30) { cl.y = c.height + 30; cl.x = Math.random()*c.width; }
                ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
                ctx.strokeStyle = brand; ctx.lineWidth = 1.2; ctx.stroke();
                var cs = cl.r * 0.45;
                ctx.beginPath(); ctx.moveTo(cl.x - cs, cl.y); ctx.lineTo(cl.x + cs, cl.y);
                ctx.moveTo(cl.x, cl.y - cs); ctx.lineTo(cl.x, cl.y + cs);
                ctx.strokeStyle = green; ctx.lineWidth = 1.5; ctx.stroke();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'woodfire-embers' || effect === 'pizzaria') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#0c0607;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var embers = []; for (var i=0; i<45; i++) embers.push({ x: Math.random()*c.width, y: Math.random()*c.height, r: Math.random()*2.8+1, vx: (Math.random()-0.5)*1.5, vy: -(Math.random()*2+1), alpha: Math.random() });
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              var grad = ctx.createRadialGradient(c.width/2, c.height+50, 10, c.width/2, c.height, c.height*0.6);
              grad.addColorStop(0, 'rgba(225, 29, 72, 0.28)'); grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
              for (var i=0; i<embers.length; i++) {
                var e = embers[i]; e.x += e.vx; e.y += e.vy; e.alpha -= 0.003;
                if (e.y < -10 || e.alpha <= 0) { e.y = c.height + 10; e.x = Math.random()*c.width; e.alpha = 1; }
                ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
                ctx.fillStyle = e.r > 2 ? brand : green; ctx.shadowBlur = 10; ctx.shadowColor = brand; ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'luxury-bubbles' || effect === 'hotel') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#030712;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var bubs = []; for (var i=0; i<35; i++) bubs.push({ x: Math.random()*c.width, y: Math.random()*c.height, r: Math.random()*3+1.2, vy: -(Math.random()*1.2+0.4) });
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              for (var i=0; i<bubs.length; i++) {
                var b = bubs[i]; b.y += b.vy;
                if (b.y < -10) { b.y = c.height + 10; b.x = Math.random()*c.width; }
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(217, 119, 6, 0.7)'; ctx.shadowBlur = 8; ctx.shadowColor = brand; ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'stadium-lights' || effect === 'futebol_copa' || effect === 'fifa-26.otf') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#04140a;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var angle = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              angle += speed === 'fast' ? 0.025 : speed === 'slow' ? 0.008 : 0.015;
              var lights = [{ x: 0, a: Math.sin(angle) * 0.5 + 0.7 }, { x: c.width, a: -Math.cos(angle) * 0.5 - 0.7 }];
              for (var l=0; l<lights.length; l++) {
                var lt = lights[l];
                ctx.save(); ctx.beginPath(); ctx.moveTo(lt.x, 0);
                var endX = lt.x + Math.cos(lt.a) * c.height * 1.8;
                ctx.lineTo(endX - 100, c.height); ctx.lineTo(endX + 100, c.height); ctx.closePath();
                var grad = ctx.createLinearGradient(lt.x, 0, endX, c.height);
                grad.addColorStop(0, 'rgba(22, 163, 74, 0.35)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad; ctx.fill(); ctx.restore();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'digital-ocean' || effect === 'Digital_Ocean') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#000612;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var t = 0;
            function loop() {
              ctx.fillStyle = 'rgba(0, 6, 18, 0.22)'; ctx.fillRect(0, 0, c.width, c.height); t += 0.02;
              for (var w=0; w<3; w++) {
                ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = w === 0 ? brand : green;
                for (var x=0; x<c.width; x+=15) {
                  var y = Math.sin(x * 0.004 + t + w) * 50 + (c.height * 0.5 + w * 40);
                  if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'traffic-radar' || effect === 'Traffic-Control') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#020508;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var angle = 0;
            function loop() {
              ctx.fillStyle = 'rgba(2, 5, 8, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
              var cx = c.width / 2; var cy = c.height / 2;
              angle += speed === 'fast' ? 0.04 : speed === 'slow' ? 0.012 : 0.025;
              ctx.strokeStyle = 'rgba(234, 88, 12, 0.15)'; ctx.lineWidth = 1;
              for (var r=60; r<=300; r+=60) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
              ctx.beginPath(); ctx.moveTo(cx, cy);
              ctx.lineTo(cx + Math.cos(angle) * 320, cy + Math.sin(angle) * 320);
              ctx.strokeStyle = brand; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = brand; ctx.stroke(); ctx.shadowBlur = 0;
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'hex-shield' || effect === 'shield') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#020710;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var scanY = 0;
            function drawHex(x, y, r) {
              ctx.beginPath();
              for (var i=0; i<6; i++) {
                var a = i * Math.PI / 3;
                var hx = x + r * Math.cos(a); var hy = y + r * Math.sin(a);
                if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
              }
              ctx.closePath(); ctx.stroke();
            }
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)'; ctx.lineWidth = 1;
              var r = 26; var w = r * 1.732; var h = r * 1.5;
              for (var y=0; y<c.height+40; y+=h) {
                for (var x=0; x<c.width+40; x+=w) {
                  var offX = (Math.floor(y/h) % 2) * (w/2);
                  drawHex(x + offX, y, r);
                }
              }
              scanY = (scanY + 3) % c.height;
              ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(c.width, scanY);
              ctx.strokeStyle = brand; ctx.lineWidth = 2; ctx.stroke();
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'fiber-optic' || effect === 'LinkingNet' || effect === 'Launcher') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#060210;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var pulses = []; for (var i=0; i<18; i++) pulses.push({ x: Math.random()*c.width, y: (i % 8)*(c.height/7), speed: Math.random()*12+8, len: Math.random()*80+40, col: i%2===0 ? brand : green });
            function loop() {
              ctx.fillStyle = 'rgba(6, 2, 16, 0.25)'; ctx.fillRect(0, 0, c.width, c.height);
              for (var i=0; i<pulses.length; i++) {
                var p = pulses[i]; p.x += p.speed;
                if (p.x - p.len > c.width) p.x = -50;
                var grad = ctx.createLinearGradient(p.x - p.len, p.y, p.x, p.y);
                grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, p.col);
                ctx.beginPath(); ctx.moveTo(p.x - p.len, p.y); ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.stroke();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'aurora') {
          fxContainer.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden;background:#05050d;pointer-events:none;"><div style="position:absolute;width:70vw;height:70vw;top:-20%;left:-10%;border-radius:50%;background:radial-gradient(circle, '+brand+' 0%, transparent 70%);filter:blur(60px);opacity:0.6;animation:mgAuroraFloat '+speedSec+'s ease-in-out infinite alternate;"></div><div style="position:absolute;width:65vw;height:65vw;bottom:-10%;right:-10%;border-radius:50%;background:radial-gradient(circle, '+green+' 0%, transparent 70%);filter:blur(60px);opacity:0.5;animation:mgAuroraFloat '+(speedSec*1.3)+'s ease-in-out infinite alternate-reverse;"></div><div style="position:absolute;width:50vw;height:50vw;top:30%;left:30%;border-radius:50%;background:radial-gradient(circle, '+blue+' 0%, transparent 70%);filter:blur(50px);opacity:0.4;animation:mgAuroraPulse '+(speedSec*0.8)+'s ease-in-out infinite alternate;"></div></div>';
        } else if (effect === 'matrix') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#020603;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var cols = Math.floor(c.width / 18) + 1;
            var ypos = Array(cols).fill(0);
            var chars = '0101MIKROGESTOR';
            activeInterval = setInterval(function() {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
              ctx.fillStyle = brand; ctx.font = '12pt monospace';
              ypos.forEach(function(y, ind) {
                var text = chars.charAt(Math.floor(Math.random() * chars.length));
                var x = ind * 18; ctx.fillText(text, x, y);
                if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                else ypos[ind] = y + (speed === 'fast' ? 24 : speed === 'slow' ? 12 : 18);
              });
            }, speed === 'fast' ? 30 : speed === 'slow' ? 70 : 50);
          }
        } else if (effect === 'cyber-grid') {
          fxContainer.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden;background:radial-gradient(circle at 50% 30%, '+brandDark+' 0%, #05050f 70%);pointer-events:none;"><div style="position:absolute;width:200%;height:100%;left:-50%;bottom:0;background:linear-gradient(rgba(0,0,0,0) 0%, #05050f 85%), linear-gradient(90deg, '+brand+'33 1px, transparent 1px), linear-gradient(0deg, '+brand+'33 1px, transparent 1px);background-size:100% 100%, 40px 40px, 40px 40px;transform:perspective(300px) rotateX(60deg);transform-origin:center bottom;animation:mgGridMove '+(speedSec*0.4)+'s linear infinite;"></div></div>';
        } else if (effect === 'floating-orbs') {
          fxContainer.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden;background:#0a0c18;pointer-events:none;"><div style="position:absolute;width:200px;height:200px;border-radius:50%;background:'+brand+';filter:blur(40px);opacity:0.5;animation:mgOrbFloat1 '+speedSec+'s ease-in-out infinite;"></div><div style="position:absolute;width:170px;height:170px;border-radius:50%;background:'+green+';filter:blur(40px);opacity:0.4;animation:mgOrbFloat2 '+(speedSec*1.2)+'s ease-in-out infinite;"></div></div>';
        } else if (effect === 'fireflies') {
          fxContainer.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden;background:#030712;pointer-events:none;"><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:'+brand+';box-shadow:0 0 15px '+brand+';animation:mgOrbFloat1 5s infinite;"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:'+green+';box-shadow:0 0 12px '+green+';animation:mgOrbFloat2 7s infinite;"></div><div style="position:absolute;width:12px;height:12px;border-radius:50%;background:'+blue+';box-shadow:0 0 18px '+blue+';animation:mgOrbFloat1 9s infinite reverse;"></div></div>';
        } else if (effect === 'warp-stars') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#030008;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var numStars = 70; var stars = [];
            for (var s=0; s<numStars; s++) stars.push({ x: Math.random()*c.width - c.width/2, y: Math.random()*c.height - c.height/2, z: Math.random()*c.width });
            var starSpeed = speed === 'fast' ? 18 : speed === 'slow' ? 4 : 9;
            function loop() {
              ctx.fillStyle = 'rgba(3, 0, 8, 0.25)'; ctx.fillRect(0, 0, c.width, c.height);
              var cx = c.width / 2; var cy = c.height / 2;
              for (var i=0; i<stars.length; i++) {
                var st = stars[i]; st.z -= starSpeed;
                if (st.z <= 0) { st.z = c.width; st.x = Math.random()*c.width - cx; st.y = Math.random()*c.height - cy; }
                var k = 128 / st.z; var px = st.x * k + cx; var py = st.y * k + cy;
                if (px >= 0 && px <= c.width && py >= 0 && py <= c.height) {
                  var size = (1 - st.z / c.width) * 3 + 0.5;
                  ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fillStyle = brand; ctx.fill();
                }
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'wave-mesh') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#050714;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var step = 0; var wvSpeed = speed === 'fast' ? 0.04 : speed === 'slow' ? 0.01 : 0.02;
            function loop() {
              ctx.fillStyle = 'rgba(5, 7, 20, 0.3)'; ctx.fillRect(0, 0, c.width, c.height); step += wvSpeed;
              for (var w=0; w<3; w++) {
                ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = w === 0 ? brand : w === 1 ? green : blue;
                ctx.globalAlpha = 0.6 - w * 0.15;
                for (var x=0; x<c.width; x+=10) {
                  var y = Math.sin(x * 0.006 + step + w) * 40 + (c.height * 0.65 + w * 30);
                  if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
              }
              ctx.globalAlpha = 1;
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'cinema-marquee' || effect === 'Popcorn') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#080404;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var frame = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height); frame += (speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1);
              var grad = ctx.createRadialGradient(c.width / 2, 0, 5, c.width / 2, c.height * 0.8, c.width * 0.7);
              grad.addColorStop(0, 'rgba(250, 204, 21, 0.2)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
              var bulbSpacing = 28;
              for (var x = 10; x < c.width - 10; x += bulbSpacing) {
                var on = (Math.floor(x / bulbSpacing) + Math.floor(frame / 6)) % 2 === 0;
                ctx.beginPath(); ctx.arc(x, 15, on ? 3.5 : 2, 0, Math.PI * 2);
                ctx.fillStyle = on ? '#facc15' : '#7f1d1d'; if (on) { ctx.shadowBlur = 8; ctx.shadowColor = '#facc15'; }
                ctx.fill(); ctx.shadowBlur = 0;
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'chalk-constellation' || effect === 'Escuela' || effect === 'Greenboard') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#06120b;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var nodes = []; 
            var spdM = speed === 'fast' ? 1.2 : speed === 'slow' ? 0.3 : 0.6;
            for (var i = 0; i < 40; i++) nodes.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - 0.5) * spdM, vy: (Math.random() - 0.5) * spdM, r: Math.random() * 2.5 + 1.2 });
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i]; n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > c.width) n.vx *= -1; if (n.y < 0 || n.y > c.height) n.vy *= -1;
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = brand; ctx.fill();
                for (var j = i + 1; j < nodes.length; j++) {
                  var n2 = nodes[j]; var d = Math.hypot(n.x - n2.x, n.y - n2.y);
                  if (d < 110) {
                    ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y);
                    ctx.strokeStyle = green; ctx.globalAlpha = 1 - d / 110; ctx.stroke(); ctx.globalAlpha = 1;
                  }
                }
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'traffic-radar' || effect === 'Traffic-Control') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#020508;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var angle = 0;
            function loop() {
              ctx.fillStyle = 'rgba(2, 5, 8, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
              var cx = c.width / 2; var cy = c.height / 2;
              angle += speed === 'fast' ? 0.04 : speed === 'slow' ? 0.012 : 0.025;
              ctx.strokeStyle = 'rgba(234, 88, 12, 0.15)'; ctx.lineWidth = 1;
              for (var r = 60; r <= 300; r += 60) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
              ctx.beginPath(); ctx.moveTo(cx, cy);
              ctx.lineTo(cx + Math.cos(angle) * 320, cy + Math.sin(angle) * 320);
              ctx.strokeStyle = brand; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = brand; ctx.stroke(); ctx.shadowBlur = 0;
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
                } else if (effect === 'lock-crypto' || effect === 'wifi_lock') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#030612;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var a1 = 0, a2 = 0, a3 = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              var cx = c.width / 2, cy = c.height / 2;
              var spdM = speed === 'fast' ? 1.5 : speed === 'slow' ? 0.5 : 1;
              a1 += 0.01 * spdM; a2 -= 0.015 * spdM; a3 += 0.008 * spdM;
              ctx.lineWidth = 2;
              ctx.beginPath(); ctx.arc(cx, cy, 140, a1, a1 + Math.PI * 1.4); ctx.strokeStyle = brand; ctx.stroke();
              ctx.beginPath(); ctx.arc(cx, cy, 200, a2, a2 + Math.PI * 1.2); ctx.strokeStyle = green; ctx.stroke();
              ctx.beginPath(); ctx.arc(cx, cy, 260, a3, a3 + Math.PI * 1.5); ctx.strokeStyle = blue; ctx.stroke();
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
} else if (effect === 'synthwave-arcade' || effect === 'UserKeys') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#06020e;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var t = 0;
            function loop() {
              ctx.fillStyle = 'rgba(6, 2, 14, 0.4)'; ctx.fillRect(0, 0, c.width, c.height); 
              t += speed === 'fast' ? 0.05 : speed === 'slow' ? 0.01 : 0.03;
              var cx = c.width / 2; var cy = c.height * 0.4;
              var grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
              grad.addColorStop(0, '#f43f5e'); grad.addColorStop(0.7, '#a855f7'); grad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'barrio-sunset' || effect === 'WifiElBarrio' || effect === 'Wifi El Barrio') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#0a050f;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var orbs = []; 
            var spdM = speed === 'fast' ? 1.2 : speed === 'slow' ? 0.3 : 0.6;
            for (var i = 0; i < 28; i++) orbs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 25 + 10, vy: -(Math.random() * spdM + 0.2), col: i % 2 === 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(168, 85, 247, 0.18)' });
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              for (var i = 0; i < orbs.length; i++) {
                var o = orbs[i]; o.y += o.vy; if (o.y < -40) { o.y = c.height + 40; o.x = Math.random() * c.width; }
                ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = o.col; ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'community-bubbles' || effect === 'WiFi_Community') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#020b14;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var bubs = []; 
            var spdM = speed === 'fast' ? 1.5 : speed === 'slow' ? 0.4 : 0.9;
            for (var i = 0; i < 35; i++) bubs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 14 + 5, vy: -(Math.random() * spdM + 0.3), vx: Math.sin(i) * 0.4 });
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              for (var i = 0; i < bubs.length; i++) {
                var b = bubs[i]; b.y += b.vy; b.x += b.vx;
                if (b.y < -20) { b.y = c.height + 20; b.x = Math.random() * c.width; }
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.strokeStyle = brand; ctx.lineWidth = 1.5; ctx.stroke();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'workspace-ribbons' || effect === 'workspace') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#070a12;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var t = 0;
            function loop() {
              ctx.fillStyle = 'rgba(7, 10, 18, 0.25)'; ctx.fillRect(0, 0, c.width, c.height); 
              t += speed === 'fast' ? 0.03 : speed === 'slow' ? 0.005 : 0.015;
              for (var i = 0; i < 4; i++) {
                ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = i % 2 === 0 ? brand : green;
                for (var x = 0; x < c.width; x += 20) {
                  var y = Math.cos(x * 0.003 + t + i * 0.8) * 60 + (c.height * 0.4 + i * 40);
                  if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'sunset-glass' || effect === 'Window-orange-login') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#0f0702;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var orbs = [{ x: window.innerWidth * 0.2, y: window.innerHeight * 0.3, r: 120, c: '#ea580c' }, { x: window.innerWidth * 0.8, y: window.innerHeight * 0.7, r: 160, c: '#d97706' }];
            var t = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height); 
              t += speed === 'fast' ? 0.04 : speed === 'slow' ? 0.008 : 0.02;
              for (var i = 0; i < orbs.length; i++) {
                var o = orbs[i];
                var ox = o.x + Math.sin(t + i) * 40; var oy = o.y + Math.cos(t + i) * 40;
                var grad = ctx.createRadialGradient(ox, oy, 10, ox, oy, o.r);
                grad.addColorStop(0, o.c); grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(ox, oy, o.r, 0, Math.PI * 2); ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'nougat-fluid' || effect === 'Nougat') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#030d07;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var t = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height); 
              t += speed === 'fast' ? 0.04 : speed === 'slow' ? 0.008 : 0.02;
              var cx = c.width / 2, cy = c.height / 2;
              for (var i = 0; i < 3; i++) {
                var gx = cx + Math.sin(t + i * 2) * 80; var gy = cy + Math.cos(t * 0.8 + i) * 80;
                var grad = ctx.createRadialGradient(gx, gy, 10, gx, gy, 140);
                grad.addColorStop(0, green); grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(gx, gy, 140, 0, Math.PI * 2); ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else if (effect === 'prisma-holo' || effect === 'Random') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#080210;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var t = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height); 
              t += speed === 'fast' ? 0.06 : speed === 'slow' ? 0.015 : 0.03;
              var colors = ['#a855f7', '#ec4899', '#06b6d4', '#eab308'];
              for (var i = 0; i < colors.length; i++) {
                var x = (c.width / 2) + Math.cos(t + i * 1.5) * (c.width * 0.35);
                var y = (c.height / 2) + Math.sin(t * 0.8 + i) * (c.height * 0.35);
                var grad = ctx.createRadialGradient(x, y, 10, x, y, 130);
                grad.addColorStop(0, colors[i]); grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, 130, 0, Math.PI * 2); ctx.fill();
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        } else {
          // Particles / General Fallback for all other node engines

          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:#080914;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var particles = []; var count = 40;
            var spdMult = speed === 'fast' ? 1.5 : speed === 'slow' ? 0.4 : 0.8;
            for (var i=0; i<count; i++) particles.push({ x: Math.random()*c.width, y: Math.random()*c.height, vx: (Math.random()-0.5)*spdMult, vy: (Math.random()-0.5)*spdMult, radius: Math.random()*2+1 });
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              for (var i=0; i<particles.length; i++) {
                var p = particles[i]; p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > c.width) p.vx *= -1; if (p.y < 0 || p.y > c.height) p.vy *= -1;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = brand; ctx.fill();
                for (var j=i+1; j<particles.length; j++) {
                  var p2 = particles[j]; var dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                  if (dist < 100) {
                    ctx.beginPath(); ctx.strokeStyle = brand; ctx.globalAlpha = 1 - dist / 100; ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); ctx.globalAlpha = 1;
                  }
                }
              }
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
        }
      }

      // 4. Live Efeitos de Card, Formas, Botões e Tipografia (Studio Inspector)
      updateInjectedCss(config);

      // 5. Injetar CSS Pro do Usuário
      var userCssEl = document.getElementById('mg-user-custom-css');
      if (!userCssEl) {
        userCssEl = document.createElement('style');
        userCssEl.id = 'mg-user-custom-css';
        document.head.appendChild(userCssEl);
      }
      userCssEl.innerHTML = (config.customCode && config.customCode.customCss) || '';

      // 5. Faixa Superior (#heading) & Header Style
      var brandCfg = config.brand || {};
      var headingEl = document.getElementById('heading') || document.querySelector('header.top-bar') || document.querySelector('.header-bar');
      if (headingEl) {
        if (brandCfg.headerStyle === 'hidden') {
          headingEl.style.setProperty('display', 'none', 'important');
        } else {
          headingEl.style.removeProperty('display');
        }
      }

      // 5.2 Logo & Tipografia da Marca
      var displayMode = brandCfg.displayMode || 'image'; // 'image' | 'text' | 'both' | 'none'
      var logoEl = document.querySelector('.logo') || document.querySelector('#logo') || document.querySelector('img.brand-logo');
      var logoContainer = document.getElementById('mg-live-brand-container');

      if (!logoContainer) {
        var targetBox = document.querySelector('#box') || document.querySelector('.card') || document.querySelector('.login-card') || document.querySelector('form') || document.body;
        if (logoEl && logoEl.parentNode) {
          logoContainer = document.createElement('div');
          logoContainer.id = 'mg-live-brand-container';
          logoContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; width: 100%; text-align: center;';
          logoEl.parentNode.insertBefore(logoContainer, logoEl);
          logoContainer.appendChild(logoEl);
        } else if (targetBox) {
          logoContainer = document.createElement('div');
          logoContainer.id = 'mg-live-brand-container';
          logoContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; width: 100%; text-align: center;';
          targetBox.prepend(logoContainer);
        }
      }

      if (logoContainer) {
        logoContainer.style.animation = 'none';
        var tAlign = brandCfg.textAlign || 'center';
        logoContainer.style.alignItems = tAlign === 'left' ? 'flex-start' : tAlign === 'right' ? 'flex-end' : 'center';
        logoContainer.style.textAlign = tAlign;

        if (logoEl) {
          if (displayMode === 'none' || displayMode === 'text') {
            logoEl.style.setProperty('display', 'none', 'important');
          } else {
            logoEl.style.setProperty('display', 'block', 'important');
            
            var currentTmpl = config.template || 'default';
            var baseLogoUrl = '/api/portal/logo?template=' + currentTmpl;
            if (!logoEl.dataset.loadedTmpl || logoEl.dataset.loadedTmpl !== currentTmpl) {
              logoEl.dataset.loadedTmpl = currentTmpl;
              logoEl.src = baseLogoUrl + '&t=' + Date.now();
            }
            
            var lSize = brandCfg.logoSize || 120;
            var lPad = brandCfg.logoPadding || 0;
            
            logoEl.style.setProperty('max-width', lSize + 'px', 'important');
            logoEl.style.setProperty('max-height', lSize + 'px', 'important');
            logoEl.style.setProperty('padding', lPad + 'px', 'important');
            logoEl.style.setProperty('object-fit', 'contain', 'important');
            logoEl.style.setProperty('background', 'transparent', 'important');
            logoEl.style.setProperty('border', 'none', 'important');
            logoEl.style.setProperty('box-shadow', 'none', 'important');
            logoEl.style.setProperty('border-radius', '0', 'important');
          }
        }
      }

      var textEl = document.getElementById('mg-live-brand-text');
      if (textEl) {
        if (displayMode === 'text' || displayMode === 'both') {
          textEl.style.setProperty('display', 'block', 'important');
        } else {
          textEl.style.setProperty('display', 'none', 'important');
        }
      }

      // 6. Botão Flutuante de WhatsApp (Live Preview)
      var waBtn = document.getElementById('mg-floating-whatsapp');
      if (config.social && config.social.whatsappEnabled) {
        if (!waBtn) {
          waBtn = document.createElement('a');
          waBtn.id = 'mg-floating-whatsapp';
          waBtn.target = '_blank';
          waBtn.style.cssText = 'position:fixed; bottom:20px; right:20px; width:52px; height:52px; border-radius:50%; background:#25d366; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(37,211,102,0.45); z-index:9999; text-decoration:none; transition:all 0.2s; cursor:pointer;';
          waBtn.innerHTML = '<svg style="width:28px;height:28px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>';
          document.body.appendChild(waBtn);
        }
        var waNum = config.social.whatsappNumber || '5511999999999';
        var msg = encodeURIComponent(config.social.whatsappMessage || 'Olá, preciso de suporte com o Wi-Fi.');
        waBtn.href = 'https://wa.me/' + waNum + '?text=' + msg;
        waBtn.style.display = 'flex';
      } else if (waBtn) {
        waBtn.style.display = 'none';
      }
      // 7. Badges de Status da Rede
      var badgeBar = document.getElementById('mg-badges-bar') || document.getElementById('mg-live-badges-bar');
      if (config.badges && (config.badges.showWifiSpeed || config.badges.showSecurityBadge || config.badges.showConnectedCount)) {
        if (!badgeBar) {
          badgeBar = document.createElement('div');
          badgeBar.id = 'mg-badges-bar';
          badgeBar.style.cssText = 'display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin-top:20px; margin-bottom:14px; width:100%;';
          var containerEl = document.querySelector('.container') || document.querySelector('#main') || document.body;
          if (containerEl) containerEl.appendChild(badgeBar);
        }
        var bHtml = '';
        if (config.badges.showWifiSpeed) {
          bHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:14px;background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);"><svg style=\"width:12px;height:12px;\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z\"></svg>' + (config.badges.wifiSpeedText || '⚡ 5G WiFi') + '</span>';
        }
        if (config.badges.showSecurityBadge) {
          bHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:14px;background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.3);"><svg style=\"width:12px;height:12px;\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z\"></svg>' + (config.badges.securityText || '🔒 WPA3') + '</span>';
        }
        if (config.badges.showConnectedCount) {
          bHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:14px;background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(245,158,11,0.3);">🟢 <span id="mg-online-count">' + (config.badges.connectedCountNumber || '42') + '</span> online</span>';
        }
        badgeBar.innerHTML = bHtml;
        badgeBar.style.display = 'flex';
      } else if (badgeBar) {
        badgeBar.style.display = 'none';
      }

      // 8. Atualizar Textos e Botões
      var actionsEl = document.querySelector('.actions');
      if (actionsEl) {
        actionsEl.style.setProperty('display', 'flex', 'important');
        actionsEl.style.setProperty('flex-direction', 'column', 'important');
        actionsEl.style.setProperty('gap', '12px', 'important');
        actionsEl.style.setProperty('margin-top', '15px', 'important');
        actionsEl.style.setProperty('width', '100%', 'important');
      }

      var btnLogin = document.querySelector('.btn-login') || document.querySelector('button[type="submit"]') || document.querySelector('#btnConnect');
      if (btnLogin) {
        btnLogin.style.setProperty('display', 'flex', 'important');
        btnLogin.style.setProperty('width', '100%', 'important');
        btnLogin.style.setProperty('align-items', 'center', 'important');
        btnLogin.style.setProperty('justify-content', 'center', 'important');
        if (config.loginButtonLabel !== undefined && config.loginButtonLabel !== '') {
          btnLogin.innerText = config.loginButtonLabel;
        } else if (!btnLogin.innerText || btnLogin.innerText.trim() === '') {
          btnLogin.innerText = 'Conectar';
        }
      }

      var btnSignup = document.getElementById('btnSignup') || document.querySelector('.btn-register') || document.querySelector('a[href*="register"]');
      if (!btnSignup && actionsEl && config.enabled !== false) {
        btnSignup = document.createElement('button');
        btnSignup.id = 'btnSignup';
        btnSignup.type = 'button';
        btnSignup.className = 'btn btn-cad';
        btnSignup.style.cssText = 'display: flex; width: 100%; border-radius: 8px; padding: 10px; cursor: pointer; font-weight: bold; border: none; font-size: 14px; background: var(--btn-secondary, #34d399); color: #fff; align-items: center; justify-content: center;';
        btnSignup.onclick = function() {
          var loader = document.getElementById('mg-instant-loader');
          if (loader) loader.style.display = 'flex';
        };
        actionsEl.appendChild(btnSignup);
      }
      if (btnSignup) {
        if (config.enabled === false) {
          btnSignup.style.setProperty('display', 'none', 'important');
        } else {
          btnSignup.style.setProperty('display', 'flex', 'important');
          btnSignup.style.setProperty('width', '100%', 'important');
          btnSignup.style.setProperty('align-items', 'center', 'important');
          btnSignup.style.setProperty('justify-content', 'center', 'important');
          btnSignup.innerText = config.registerButtonText || 'Cadastre-se aqui';
        }
      }

      var businessName = document.getElementById('businessName') || document.querySelector('.brand-title') || document.querySelector('h1');
      if (businessName && config.businessName) businessName.innerText = config.businessName;

      var welcomeMessage = document.getElementById('welcomeMessage') || document.querySelector('.welcome-msg') || document.querySelector('p.message');
      if (welcomeMessage && config.message) welcomeMessage.innerText = config.message;
      
      var trialContainer = document.getElementById('trial-container');
      if (!trialContainer && config.trialEnabled !== false) {
        var boxEl = document.querySelector('#box, .login-card, .card, form');
        if (boxEl) {
          var footerEl = boxEl.querySelector('.footer');
          trialContainer = document.createElement('div');
          trialContainer.id = 'trial-container';
          if (footerEl) {
            footerEl.prepend(trialContainer);
          } else {
            boxEl.appendChild(trialContainer);
          }
        }
      }
      if (trialContainer) {
        if (config.trialEnabled === false) {
          trialContainer.style.setProperty('display', 'none', 'important');
        } else {
          trialContainer.style.setProperty('display', 'flex', 'important');
          trialContainer.style.setProperty('flex-direction', 'column', 'important');
          trialContainer.style.setProperty('align-items', 'center', 'important');
          trialContainer.style.setProperty('width', '100%', 'important');
          trialContainer.style.setProperty('margin-top', '15px', 'important');
          
          var trialMsgDiv = trialContainer.querySelector('.trial-label, div, p');
          var trialBtn = trialContainer.querySelector('.btn-trial, button, a');

          if (!trialMsgDiv) {
            trialMsgDiv = document.createElement('div');
            trialMsgDiv.className = 'trial-label';
            trialMsgDiv.style.cssText = 'font-size:13px; color:var(--text-muted, #6b7280); margin-bottom: 6px;';
            trialContainer.prepend(trialMsgDiv);
          }
          if (!trialBtn) {
            trialBtn = document.createElement('button');
            trialBtn.type = 'button';
            trialBtn.className = 'btn btn-trial';
            trialBtn.style.cssText = 'background-color: var(--trialButtonBg, #059669); color: var(--trialButtonText, #ffffff); width: 100%; border-radius: 8px; padding: 10px; font-weight: bold; cursor: pointer; border: none; font-size: 14px;';
            trialBtn.onclick = function() {
              if (typeof window.openTrialModal === 'function') {
                window.openTrialModal();
              } else {
                var modal = document.getElementById('trialModal') || document.getElementById('trial-modal');
                if (modal) {
                  modal.classList.add('open');
                  modal.style.display = 'flex';
                }
              }
            };
            trialContainer.appendChild(trialBtn);
          }

          if (trialMsgDiv) {
            trialMsgDiv.innerText = config.trialText !== undefined ? config.trialText : 'Acesso de teste disponível, ';
          }
          if (trialBtn) {
            trialBtn.innerText = config.trialLinkText !== undefined ? config.trialLinkText : 'clique aqui';
            trialBtn.style.setProperty('display', 'flex', 'important');
            trialBtn.style.setProperty('width', '100%', 'important');
            trialBtn.style.setProperty('align-items', 'center', 'important');
            trialBtn.style.setProperty('justify-content', 'center', 'important');
          }
        }
      }

      var tTitle = document.getElementById('trialModalTitle') || document.getElementById('trial-modal-title');
      if (tTitle && config.trialModalTitle !== undefined) tTitle.innerText = config.trialModalTitle;
      var tMsg = document.getElementById('trialModalMsg') || document.getElementById('trial-modal-message');
      if (tMsg && config.trialModalMsg !== undefined) tMsg.innerText = config.trialModalMsg;
      var tCancel = document.getElementById('trialCancelBtn') || document.getElementById('trial-modal-cancel');
      if (tCancel && config.trialModalCancelText !== undefined) tCancel.innerText = config.trialModalCancelText;
      var tConfirm = document.getElementById('trialConfirmBtn') || document.getElementById('trial-modal-confirm');
      if (tConfirm && config.trialModalConfirmText !== undefined) {
        tConfirm.innerText = config.trialModalConfirmText;
        tConfirm.setAttribute('data-orig-text', config.trialModalConfirmText);
      }

      // 9. STUDIO PRO LIVE CSS ENGINE (Tipografia, Cantos, Formas, Alturas, Espaçamentos)
      if (config.studio || config.effects) {
        var st = config.studio || {};
        var ef = config.effects || {};
        var styleStudio = document.getElementById('mg-live-studio-css');
        if (!styleStudio) {
          styleStudio = document.createElement('style');
          styleStudio.id = 'mg-live-studio-css';
          document.head.appendChild(styleStudio);
        }

        var fontCss = st.fontFamily ? 'font-family: "' + st.fontFamily + '", sans-serif !important;' : '';
        var titleAlignCss = st.titleAlign ? 'text-align: ' + st.titleAlign + ' !important; justify-content: ' + (st.titleAlign === 'left' ? 'flex-start' : st.titleAlign === 'right' ? 'flex-end' : 'center') + ' !important;' : '';
        var titleSizeCss = st.titleFontSize ? 'font-size: ' + st.titleFontSize + 'px !important;' : '';
        var titleWeightCss = st.titleFontWeight ? 'font-weight: ' + st.titleFontWeight + ' !important;' : '';

        var btnHeightCss = st.btnHeight ? 'height: ' + st.btnHeight + 'px !important; min-height: ' + st.btnHeight + 'px !important; display: flex !important; align-items: center !important; justify-content: center !important;' : '';
        var btnRadiusCss = (st.btnRadiusTL !== undefined) ? 'border-radius: ' + st.btnRadiusTL + 'px ' + st.btnRadiusTR + 'px ' + st.btnRadiusBR + 'px ' + st.btnRadiusBL + 'px !important;' : '';
        var cardRadiusCss = (st.cardRadiusTL !== undefined) ? 'border-radius: ' + st.cardRadiusTL + 'px ' + st.cardRadiusTR + 'px ' + st.cardRadiusBR + 'px ' + st.cardRadiusBL + 'px !important;' : '';
        var cardPaddingCss = (st.cardPaddingTop !== undefined) ? 'padding: ' + st.cardPaddingTop + 'px ' + st.cardPaddingRight + 'px ' + st.cardPaddingBottom + 'px ' + st.cardPaddingLeft + 'px !important;' : '';
        var cardGapCss = st.cardGap ? 'gap: ' + st.cardGap + 'px !important;' : '';
        var inputRadiusCss = (st.inputRadius !== undefined) ? 'border-radius: ' + st.inputRadius + 'px !important;' : '';

        var cardShapeClip = '';
        if (ef.cardShape === 'scifi-cut') {
          cardShapeClip = 'clip-path: polygon(0 14px, 14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px)) !important;';
        }

        var cardGlowCss = ef.cardGlowBorder ? 'box-shadow: 0 0 25px rgba(6, 182, 212, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.2) !important; border-color: rgba(6, 182, 212, 0.8) !important;' : '';
        var btnPulseCss = ef.btnPulse ? 'animation: mgBtnPulse 1.8s infinite ease-in-out !important;' : '';

        var cardSelector = 'html body #box, html body .login-card, html body .login-box, html body form > div:not(.input-group):not(.actions):not(.footer)';
        var btnSelector = 'html body .btn-login, html body #btnConnect, html body #btnSubmit, html body button[type="submit"], html body .btn-cad, html body #btnSignup, html body .btn-register, html body .btn-trial';
        var inpSelector = 'html body input[type="text"], html body input[type="password"], html body select, html body textarea, html body .form-input';
        var titleSelector = 'html body h1, html body h2, html body .brand-title, html body #businessName, html body .title, html body legend, html body .logo-text';

        styleStudio.innerHTML = 
          'html body, html body button, html body input, html body select, html body textarea, ' + cardSelector + ' { ' + fontCss + ' } ' +
          titleSelector + ' { ' + titleSizeCss + ' ' + titleAlignCss + ' ' + titleWeightCss + ' } ' +
          cardSelector + ' { ' + cardRadiusCss + ' ' + cardPaddingCss + ' ' + cardShapeClip + ' ' + cardGlowCss + ' } ' +
          'html body #box .actions, html body form .actions, html body .actions { ' + cardGapCss + ' } ' +
          btnSelector + ' { ' + btnHeightCss + ' ' + btnRadiusCss + ' ' + btnPulseCss + ' } ' +
          inpSelector + ' { ' + inputRadiusCss + ' } ' +
          '@keyframes mgBtnPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); } 50% { transform: scale(1.02); box-shadow: 0 0 16px 4px rgba(6, 182, 212, 0.6); } } ' +
          '@keyframes mgMetalShine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } } ' +
          '@keyframes mgNeonFlicker { 0%, 100% { opacity: 1; filter: brightness(1); } 50% { opacity: 0.85; filter: brightness(1.25); } } ' +
          '@keyframes mgGoldSweep { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } } ' +
          '@keyframes mgGlitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } } ' +
          '@keyframes mgFirePulse { 0% { filter: drop-shadow(0 -2px 6px rgba(249,115,22,0.6)); } 100% { filter: drop-shadow(0 -4px 14px rgba(249,115,22,0.95)); } } ' +
          '@keyframes mgRainbowHolo { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } } ' +
          '@keyframes mgFadeZoom { 0% { opacity: 0; transform: scale(0.35); filter: blur(6px); } 60% { transform: scale(1.08); filter: blur(0); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } } ' +
          '@keyframes mgSlideUp3D { 0% { opacity: 0; transform: perspective(600px) translateY(50px) rotateX(30deg); filter: blur(6px); } 100% { opacity: 1; transform: perspective(600px) translateY(0) rotateX(0deg); filter: blur(0); } } ' +
          '@keyframes mgSlideDownBounce { 0% { opacity: 0; transform: translateY(-70px); } 55% { transform: translateY(14px); } 75% { transform: translateY(-6px); } 90% { transform: translateY(3px); } 100% { opacity: 1; transform: translateY(0); } } ' +
          '@keyframes mgTypewriter { 0% { opacity: 0; clip-path: inset(0 100% 0 0); filter: blur(4px); } 100% { opacity: 1; clip-path: inset(0 0 0 0); filter: blur(0); } } ' +
          '@keyframes mgGlitchCyber { 0% { opacity: 0; transform: skew(14deg); filter: drop-shadow(4px 0 #06b6d4) drop-shadow(-4px 0 #f43f5e); } 20% { opacity: 1; transform: skew(-10deg) translate(-2px, 2px); } 40% { transform: skew(6deg) translate(2px, -1px); } 60% { transform: skew(-3deg); } 80% { transform: skew(1deg); } 100% { opacity: 1; transform: none; filter: none; } } ' +
          '@keyframes mgWaveReveal { 0% { opacity: 0; transform: translateY(20px) scale(0.9); clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); } 100% { opacity: 1; transform: translateY(0) scale(1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } } ' +
          '@keyframes mgFlip3DX { 0% { opacity: 0; transform: perspective(600px) rotateX(90deg); } 65% { transform: perspective(600px) rotateX(-15deg); } 100% { opacity: 1; transform: perspective(600px) rotateX(0deg); } } ' +
          '@keyframes mgFlip3DY { 0% { opacity: 0; transform: perspective(600px) rotateY(90deg); } 65% { transform: perspective(600px) rotateY(-15deg); } 100% { opacity: 1; transform: perspective(600px) rotateY(0deg); } } ' +
          '@keyframes mgGoldShimmerSweep { 0% { opacity: 0; transform: scale(0.92); filter: brightness(3) contrast(2); } 60% { opacity: 1; filter: brightness(1.6) contrast(1.3); } 100% { opacity: 1; transform: scale(1); filter: brightness(1) contrast(1); } } ' +
          '@keyframes mgKineticStamp { 0% { opacity: 0; transform: scale(2.5) translateY(-30px); } 50% { opacity: 1; transform: scale(0.92) translateY(0); } 75% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } } ' +
          '@keyframes mgBlurFocus { 0% { opacity: 0; filter: blur(28px); transform: scale(1.15); } 100% { opacity: 1; filter: blur(0px); transform: scale(1); } } ' +
          '@keyframes mgStaggerLetter { 0% { opacity: 0; transform: translateY(30px) rotate(-6deg); } 70% { transform: translateY(-4px) rotate(2deg); } 100% { opacity: 1; transform: translateY(0) rotate(0deg); } } ' +
          '@keyframes mgMatrixDecrypt { 0% { opacity: 0; filter: hue-rotate(120deg) blur(6px); transform: scaleY(0.5); } 50% { opacity: 0.8; filter: hue-rotate(60deg) blur(2px); transform: scaleY(1.1); } 100% { opacity: 1; filter: none; transform: scaleY(1); } } ' +
          '@keyframes mgCurtainReveal { 0% { opacity: 0; clip-path: polygon(50% 0, 50% 0, 50% 100%, 50% 100%); } 100% { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } } ' +
          '@keyframes mgSpiralIn { 0% { opacity: 0; transform: rotate(-240deg) scale(0.15); filter: blur(10px); } 70% { transform: rotate(15deg) scale(1.08); filter: blur(0); } 100% { opacity: 1; transform: rotate(0deg) scale(1); filter: blur(0); } } ' +
          '@keyframes mgContinuousFloating { 0% { transform: translateY(0px); } 100% { transform: translateY(-8px); } } ' +
          '@keyframes mgContinuousNeonBreathe { 0%, 100% { filter: brightness(1) drop-shadow(0 0 6px rgba(255,255,255,0.4)); } 50% { filter: brightness(1.3) drop-shadow(0 0 18px rgba(6,182,212,0.8)); } } ' +
          '@keyframes mgContinuousShimmerLoop { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } } ' +
          '@keyframes mgContinuousRainbowCycle { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } } ' +
          '@keyframes mgContinuousJitterGlitch { 0%, 92%, 100% { transform: none; } 93% { transform: skew(4deg) translate(-2px, 1px); } 95% { transform: skew(-4deg) translate(2px, -1px); } 97% { transform: skew(2deg); } } ' +
          '@keyframes mgContinuousWobble3D { 0% { transform: perspective(500px) rotateX(0deg) rotateY(0deg); } 25% { transform: perspective(500px) rotateX(6deg) rotateY(-8deg); } 75% { transform: perspective(500px) rotateX(-6deg) rotateY(8deg); } 100% { transform: perspective(500px) rotateX(0deg) rotateY(0deg); } }';
      }

      // Pooling em tempo real para obter a quantidade real de conexões ativas do MikroTik a cada 10 segundos
      if (config.badges && config.badges.showConnectedCount) {
        function updateLiveOnlineCount() {
          var el = document.getElementById('mg-online-count');
          if (!el) return;
          fetch('/api/dashboard/stats')
            .then(function(res) { return res.json(); })
            .then(function(json) {
              if (json && json.success && json.data && json.data.activeUsersCount !== undefined) {
                el.innerText = json.data.activeUsersCount;
              }
            })
            .catch(function() {});
        }
        if (!window.mgOnlineInterval) {
          window.mgOnlineInterval = setInterval(updateLiveOnlineCount, 10000);
        }
        updateLiveOnlineCount();
      }

      // 10. Preloader Instantâneo de Cadastro ao Clicar em "Cadastre-se"
      var registerBtns = document.querySelectorAll('#btnSignup, .btn-register, a[href*="register"]');
      registerBtns.forEach(function(btn) {
        if (!btn.dataset.mgLoadAttached) {
          btn.dataset.mgLoadAttached = 'true';
          btn.addEventListener('click', function(e) {
            var loader = document.getElementById('mg-instant-loader');
            if (!loader) {
              loader = document.createElement('div');
              loader.id = 'mg-instant-loader';
              loader.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(10,12,20,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;transition:opacity 0.2s;';
              loader.innerHTML = '<div style="width:44px;height:44px;border:3px solid rgba(255,255,255,0.2);border-top-color:#2563eb;border-radius:50%;animation:mgSpin 0.7s linear infinite;"></div><div style="margin-top:14px;font-size:13px;font-weight:600;letter-spacing:0.5px;color:#f8fafc;">Abrindo Cadastro...</div><style>@keyframes mgSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>';
              document.body.appendChild(loader);
            } else {
              loader.style.display = 'flex';
            }
          });
        }
      });
    }

    // =========================================================================
    // VISUAL CLICK-TO-EDIT INSPECTOR (SELEÇÃO DIRETA WYSIWYG - SEM DESFOQUE)
    // =========================================================================
    var inspectorActive = true;
    var currentSelectedEl = null;

    var TARGET_SPECS = {
      typography: {
        id: 'typography',
        title: 'Tipografia & Título',
        cardId: 'properties',
        selector: 'h1, h2, .brand-title, #businessName, .title, legend, #welcomeMessage, .welcome-msg, p.message'
      },
      button: {
        id: 'button',
        title: 'Botão Conectar',
        cardId: 'spacing',
        selector: 'button:not(.btn-trial):not(#btnSignup), .btn-primary, .btn-login, input[type="submit"], #btnConnect, #btnSubmit'
      },
      input: {
        id: 'input',
        title: 'Campos de Entrada',
        cardId: 'spacing',
        selector: 'input[type="text"], input[type="password"], select, textarea, .retro-input'
      },
      register_btn: {
        id: 'register_btn',
        title: 'Botão Cadastre-se',
        cardId: 'fields',
        selector: '#btnSignup, .btn-register, a[href*="register"]'
      },
      trial: {
        id: 'trial',
        title: 'Acesso Grátis (Trial)',
        cardId: 'fields',
        selector: '#trial-container, .btn-trial, #trial-btn, a[href*="trial"]'
      },
      badges: {
        id: 'badges',
        title: 'Badges de Rede',
        cardId: 'social_badges',
        selector: '#mg-live-badges-bar, .badge, .status-badge'
      },
      whatsapp: {
        id: 'whatsapp',
        title: 'WhatsApp Flutuante',
        cardId: 'social_badges',
        selector: '#mg-floating-whatsapp'
      },
      card: {
        id: 'card',
        title: 'Card do Portal',
        cardId: 'spacing',
        selector: '#box, .login-card, .card, .container > div, .box, #card, .login-box, form, main'
      },
      background: {
        id: 'background',
        title: 'Fundo & FX',
        cardId: 'background',
        selector: '#custom-bg-layer, #mg-live-fx-container, canvas, body'
      }
    };

    function initVisualSelectionStyles() {
      if (document.getElementById('mg-selection-css')) return;
      var style = document.createElement('style');
      style.id = 'mg-selection-css';
      style.innerHTML = [
        '.mg-interactive-target { cursor: pointer !important; }',
        '.mg-hover-target { outline: 1.5px dashed #06b6d4 !important; outline-offset: 2px !important; transition: outline 0.1s ease !important; cursor: pointer !important; }',
        '.mg-selected-target { outline: 2.5px solid #06b6d4 !important; outline-offset: 3px !important; box-shadow: 0 0 16px rgba(6, 182, 212, 0.6) !important; transition: all 0.15s ease !important; cursor: pointer !important; }'
      ].join(' ');
      document.head.appendChild(style);
    }

    function setSelectedElement(el) {
      if (currentSelectedEl && currentSelectedEl !== el) {
        currentSelectedEl.classList.remove('mg-selected-target');
      }
      currentSelectedEl = el;
      if (el && el !== document.body) {
        el.classList.add('mg-selected-target');
      }
    }

    function clearSelection() {
      if (currentSelectedEl) {
        currentSelectedEl.classList.remove('mg-selected-target');
        currentSelectedEl = null;
      }
      document.querySelectorAll('.mg-hover-target').forEach(function(h) {
        h.classList.remove('mg-hover-target');
      });
    }

    function findMatchingSpec(el) {
      if (!el || el === document.body || el === document.documentElement) {
        return { el: document.body, spec: TARGET_SPECS.background };
      }
      
      // Order of specificity
      var keys = ['button', 'input', 'register_btn', 'trial', 'badges', 'whatsapp', 'typography', 'card'];
      for (var i = 0; i < keys.length; i++) {
        var spec = TARGET_SPECS[keys[i]];
        if (el.matches && el.matches(spec.selector)) return { el: el, spec: spec };
        var closest = el.closest && el.closest(spec.selector);
        if (closest) return { el: closest, spec: spec };
      }
      return { el: el, spec: TARGET_SPECS.card };
    }

    var lastHoverEl = null;

    function setupVisualSelectionListeners() {
      initVisualSelectionStyles();

      // Mark interactive elements with pointer cursor
      document.addEventListener('mouseover', function(e) {
        if (!inspectorActive) return;
        var hit = findMatchingSpec(e.target);
        if (hit && hit.el && hit.el !== document.body) {
          if (lastHoverEl && lastHoverEl !== hit.el) {
            lastHoverEl.classList.remove('mg-hover-target');
          }
          lastHoverEl = hit.el;
          if (!hit.el.classList.contains('mg-selected-target')) {
            hit.el.classList.add('mg-hover-target');
          }
        }
      }, { passive: true });

      document.addEventListener('mouseout', function(e) {
        if (lastHoverEl) {
          lastHoverEl.classList.remove('mg-hover-target');
          lastHoverEl = null;
        }
      }, { passive: true });

      document.addEventListener('click', function(e) {
        var hit = findMatchingSpec(e.target);
        if (hit && hit.spec) {
          e.preventDefault();
          e.stopPropagation();
          setSelectedElement(hit.el);
          try {
            window.parent.postMessage({
              type: 'PREVIEW_ELEMENT_CLICK',
              target: hit.spec.id,
              cardId: hit.spec.cardId,
              title: hit.spec.title
            }, '*');
          } catch(err) {}
        }
      }, true);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { 
        applyLiveConfig(currentConfig); 
        setupVisualSelectionListeners();
      });
    } else {
      applyLiveConfig(currentConfig);
      setupVisualSelectionListeners();
    }

    window.addEventListener('message', function(event) {
      var data = event.data;
      if (!data) return;
      if (data.type === 'LIVE_PREVIEW') {
        applyLiveConfig(data);
      } else if (data.type === 'INSPECTOR_HOVER_CARD') {
        var cardTarget = data.target;
        if (!cardTarget) {
          clearSelection();
          return;
        }
        var spec = TARGET_SPECS[cardTarget] || TARGET_SPECS.card;
        if (spec) {
          var targetEl = document.querySelector(spec.selector) || document.body;
          setSelectedElement(targetEl);
        }
      } else if (data.type === 'INSPECTOR_CLEAR') {
        clearSelection();
      } else if (data.type === 'REPLAY_ANIMATION') {
        var bWrap = document.getElementById('mg-live-brand-container');
        if (bWrap && bWrap.parentNode) {
          var clone = bWrap.cloneNode(true);
          bWrap.parentNode.replaceChild(clone, bWrap);
        }
      }
    });

    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'IFRAME_READY' }, '*'); } catch(e) {}
    }
  })();
</script>
`;

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${livePreviewScript}</body>`);
    } else {
      html += livePreviewScript;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch (error: any) {
    return new NextResponse(`<h1>Erro: ${error.message}</h1>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}
