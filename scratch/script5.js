
  (function() {
    var activeRaf = null;
    var activeInterval = null;
    var currentConfig = {"businessName":"Super Wi-Fi Hotspot","message":"Bem-vindo à nossa rede gratuita. Insira o seu voucher para navegar com máxima velocidade.","systemUrl":"http://portal.wifi.local","colors":{"brand":"#059669","brandDark":"#047857","bg":"#060d0a","ink":"#f0fdf4","muted":"#86efac","blue":"#10b981","green":"#34d399","trialButtonBg":"#059669","trialButtonText":"#ffffff","cardBg":"#0c1a14","cardBorder":"#059669","inputBg":"#060d0a","inputText":"#f0fdf4","inputBorder":"#166534","inputPlaceholder":"#4ade80","loginButtonText":"#060d0a","registerButtonText":"#060d0a","glassOpacity":90,"glassBlur":12},"effects":{"bgEffect":"particles","bgEffectSpeed":"normal","cardShape":"rounded","cardNoiseTexture":false,"cardGlowBorder":true,"cardTilt3d":false,"btnShimmer":true,"btnPulse":false,"titleGradient":true},"studio":{"fontFamily":"Inter","titleFontSize":24,"titleFontWeight":"700","titleLineHeight":1.2,"titleLetterSpacing":0,"titleAlign":"center","titleItalic":false,"titleUnderline":false,"btnFontSize":14,"btnFontWeight":"600","btnLetterSpacing":0.5,"btnHeight":46,"btnPaddingTop":12,"btnPaddingRight":20,"btnPaddingBottom":12,"btnPaddingLeft":20,"btnRadiusTL":12,"btnRadiusTR":12,"btnRadiusBR":12,"btnRadiusBL":12,"btnBorderWidth":0,"cardRadiusTL":20,"cardRadiusTR":20,"cardRadiusBR":20,"cardRadiusBL":20,"cardPaddingTop":24,"cardPaddingRight":24,"cardPaddingBottom":24,"cardPaddingLeft":24,"cardBorderWidth":1,"cardBorderStyle":"solid","inputHeight":44,"inputRadius":10,"inputBorderWidth":1,"activeComponent":"submit_button","cardGap":16},"social":{"whatsappEnabled":true,"whatsappNumber":"","whatsappMessage":"Olá! Preciso de ajuda para conectar ao Wi-Fi.","instagramUrl":"https://www.instagram.com/expressao.devida/","facebookUrl":"","googleMapsUrl":""},"badges":{"showWifiSpeed":true,"wifiSpeedText":"⚡ Wi-Fi 5G Ultra Rápido","showSecurityBadge":true,"securityText":"🔒 Conexão Criptografada (WPA3)","showConnectedCount":true,"connectedCountNumber":"42"},"customCode":{"customCss":"body button.btn-login.btn-login { border: 4px solid red !important; }"},"bg":{"type":"video","url":"/uploads/bg_default_1786986933917.mp4"},"ad":{"type":"none","mediaUrl":"/uploads/ad_1786943131013.png","targetUrl":"","items":[{"url":"/uploads/ad_media_1.jpeg","type":"image","targetUrl":""},{"url":"/uploads/ad_media_2.jpeg","type":"image","targetUrl":""},{"url":"/uploads/ad_media_3.JPG","type":"image","targetUrl":""},{"url":"","type":"image","targetUrl":""},{"url":"","type":"image","targetUrl":""}],"timerEnabled":false,"timerDuration":5},"fields":{"nameEnabled":false,"nameRequired":true,"phoneEnabled":false,"phoneRequired":false,"birthDateEnabled":false,"birthDateRequired":false,"emailEnabled":false,"emailRequired":false,"cpfEnabled":false,"cpfRequired":false,"genderEnabled":false,"genderRequired":true,"passwordEnabled":false,"passwordRequired":true,"customFieldEnabled":false,"customFieldLabel":"Qula curso deseja ?","customFieldRequired":false,"optInCoursesEnabled":true,"optInCoursesLabel":"Eu aceito receber informações dos cursos"},"enabled":true,"redirectUrl":"","registerButtonText":"Cadastre-se aqui","registerTitle":"Wi-Fi Grátis","registerSubtitle":"Cadastre-se abaixo para liberar o acesso à internet","registerSubmitText":"Cadastrar e Conectar","termsText":"Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.","trialEnabled":true,"trialText":"Acesso de teste disponível, ","trialLinkText":"clique aqui","trialModalTitle":"Acesso de Teste","trialModalMessage":"Tem certeza de que deseja liberar o acesso grátis por 30 minutos?","trialModalConfirmText":"Sim, Conectar","trialModalCancelText":"Não, Voltar"};

    function clearActiveFX() {
      if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = null; }
      if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
      var fxContainer = document.getElementById('mg-live-fx-container');
      if (fxContainer) fxContainer.innerHTML = '';
      // Remove any legacy static canvas if lingering
      var legacyCanvas = document.querySelectorAll('#mg-fx-niche, #mg-fx-canvas-particles, #mg-fx-canvas-matrix, #mg-fx-canvas-warp, #mg-fx-canvas-waves, #mg-fx-cybergrid, #mg-fx-orbs, #mg-fx-fireflies, #mg-fx-aurora');
      legacyCanvas.forEach(function(el) { el.remove(); });
    }

    function applyLiveConfig(config) {
      if (!config) return;
      currentConfig = config;
      var root = document.documentElement;
      var brand = (config.colors && config.colors.brand) || '#2563eb';
      var brandDark = (config.colors && config.colors.brandDark) || '#1d4ed8';
      var green = (config.colors && config.colors.green) || '#10b981';
      var blue = (config.colors && config.colors.blue) || '#2563eb';

      // 1. Tokens CSS
      if (config.colors) {
        if (config.colors.brand) root.style.setProperty('--brand', config.colors.brand);
        if (config.colors.brandDark) root.style.setProperty('--brand-dark', config.colors.brandDark);
        if (config.colors.bg) root.style.setProperty('--bg', config.colors.bg);
        if (config.colors.ink) root.style.setProperty('--ink', config.colors.ink);
        if (config.colors.muted) root.style.setProperty('--text-muted', config.colors.muted);
        if (config.colors.blue) root.style.setProperty('--btn-primary', config.colors.blue);
        if (config.colors.loginButtonText) root.style.setProperty('--btn-primary-text', config.colors.loginButtonText);
        if (config.colors.green) root.style.setProperty('--btn-secondary', config.colors.green);
        if (config.colors.registerButtonText) root.style.setProperty('--btn-secondary-text', config.colors.registerButtonText);
        if (config.colors.trialButtonBg) root.style.setProperty('--trialButtonBg', config.colors.trialButtonBg);
        if (config.colors.trialButtonText) root.style.setProperty('--trialButtonText', config.colors.trialButtonText);
        if (config.colors.cardBg) root.style.setProperty('--card-bg', config.colors.cardBg);
        if (config.colors.cardBorder) root.style.setProperty('--card-border', config.colors.cardBorder);
        if (config.colors.inputBg) root.style.setProperty('--input-bg', config.colors.inputBg);
        if (config.colors.inputText) root.style.setProperty('--input-text', config.colors.inputText);
        if (config.colors.inputBorder) root.style.setProperty('--input-border', config.colors.inputBorder);
        if (config.colors.inputPlaceholder) root.style.setProperty('--input-placeholder', config.colors.inputPlaceholder);

        var op = config.colors.glassOpacity !== undefined ? config.colors.glassOpacity : 100;
        var bl = config.colors.glassBlur !== undefined ? config.colors.glassBlur : 0;
        root.style.setProperty('--glass-opacity', op + '%');
        root.style.setProperty('--glass-blur', bl + 'px');

        var cardEls = document.querySelectorAll('#box, .card, .login-card, #card, form#login');
        cardEls.forEach(function(cardEl) {
          cardEl.style.backdropFilter = 'blur(' + bl + 'px)';
          cardEl.style.webkitBackdropFilter = 'blur(' + bl + 'px)';
          if (config.colors.cardBg) {
            cardEl.style.backgroundColor = 'color-mix(in srgb, ' + config.colors.cardBg + ' ' + op + '%, transparent)';
          }
          if (config.colors.cardBorder) {
            cardEl.style.borderColor = config.colors.cardBorder;
          }
        });
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

      if (bgUrl && bgType !== 'default') {
        var isVideo = bgType === 'video' || bgUrl.match(/.(mp4|webm|ogg)$/i);
        
        // Clean URL: if systemUrl is prepended (e.g. http://portal.wifi.local/uploads/...), convert to relative /uploads/... for local preview
        var cleanUrl = bgUrl;
        if (cleanUrl.indexOf('/uploads/') !== -1) {
          cleanUrl = '/uploads/' + cleanUrl.split('/uploads/')[1];
        }

        // Force html and body transparency so media is 100% visible
        document.documentElement.style.setProperty('background', 'transparent', 'important');
        document.documentElement.style.setProperty('background-color', 'transparent', 'important');
        document.body.style.setProperty('background', 'transparent', 'important');
        document.body.style.setProperty('background-color', 'transparent', 'important');
        document.body.style.setProperty('background-image', 'none', 'important');

        if (isVideo) {
          customBg.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-10; pointer-events:none; overflow:hidden; display:block;';
          var vidEl = customBg.querySelector('video');
          if (!vidEl) {
            customBg.innerHTML = '<video autoplay muted loop playsinline id="mg-preview-bg-video" style="position:fixed; top:0; left:0; width:100vw; height:100vh; object-fit:cover; pointer-events:none; z-index:-10;"></video>';
            vidEl = customBg.querySelector('video');
          }
          if (vidEl) {
            if (vidEl.src !== cleanUrl && !vidEl.src.endsWith(cleanUrl)) {
              vidEl.src = cleanUrl;
              vidEl.load();
            }
            vidEl.muted = true;
            vidEl.playsInline = true;
            vidEl.play().catch(function() {});
          }
        } else {
          customBg.innerHTML = '';
          customBg.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-10; pointer-events:none; background-image: url("' + cleanUrl + '") !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important; background-attachment: fixed !important; display:block;';
        }
      } else {
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
      var liveStyle = document.getElementById('mg-live-injected-css');
      if (!liveStyle) {
        liveStyle = document.createElement('style');
        liveStyle.id = 'mg-live-injected-css';
        document.head.appendChild(liveStyle);
      }

      var cardSelector = '#box, .login-card, .card, .container > div, .box, #card, .login-box, form, main';
      var customCss = cardSelector + ' { position: relative !important; z-index: 10 !important; }\n';
      
      var st = config.studio || {};

      // Font Family
      if (st.fontFamily) {
        customCss += 'body, input, button, select, textarea, h1, h2, h3, p, span { font-family: "' + st.fontFamily + '", "Inter", -apple-system, sans-serif !important; }\n';
      }

      // Card 4-Corner Radius & Shape
      if (st.cardRadiusTL !== undefined && st.cardRadiusTR !== undefined) {
        customCss += cardSelector + ' { border-radius: ' + st.cardRadiusTL + 'px ' + st.cardRadiusTR + 'px ' + st.cardRadiusBR + 'px ' + st.cardRadiusBL + 'px !important; clip-path: none !important; }\n';
      } else {
        var shape = (config.effects && config.effects.cardShape) || 'rounded';
        if (shape === 'square') {
          customCss += cardSelector + ' { border-radius: 4px !important; clip-path: none !important; }\n';
        } else if (shape === 'pill') {
          customCss += cardSelector + ' { border-radius: 36px !important; clip-path: none !important; }\n';
        } else if (shape === 'scifi-cut') {
          customCss += cardSelector + ' { border-radius: 0 !important; clip-path: polygon(0 16px, 16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px)) !important; }\n';
        } else {
          customCss += cardSelector + ' { border-radius: 20px !important; clip-path: none !important; }\n';
        }
      }

      // Card 4-Sided Padding
      if (st.cardPaddingTop !== undefined) {
        customCss += cardSelector + ' { padding: ' + st.cardPaddingTop + 'px ' + st.cardPaddingRight + 'px ' + st.cardPaddingBottom + 'px ' + st.cardPaddingLeft + 'px !important; }\n';
      }

      // Card Border Width & Style
      if (st.cardBorderWidth !== undefined) {
        customCss += cardSelector + ' { border-width: ' + st.cardBorderWidth + 'px !important; border-style: ' + (st.cardBorderStyle || 'solid') + ' !important; }\n';
      }

      // Card Noise Texture
      if (config.effects && config.effects.cardNoiseTexture) {
        customCss += cardSelector + ' { background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0) !important; background-size: 8px 8px !important; }\n';
      }
      // Card Glow Border
      if (config.effects && config.effects.cardGlowBorder) {
        customCss += cardSelector + ' { box-shadow: 0 0 25px color-mix(in srgb, ' + brand + ' 40%, transparent) !important; border-color: ' + brand + ' !important; }\n';
      }

      // Button Sizing, 4-Corner Radius, Typography
      var btnSelector = 'button, .btn, input[type="submit"], a.btn, .btn-primary, .btn-login, #btnSignup';
      if (st.btnRadiusTL !== undefined && st.btnRadiusTR !== undefined) {
        customCss += btnSelector + ' { border-radius: ' + st.btnRadiusTL + 'px ' + st.btnRadiusTR + 'px ' + st.btnRadiusBR + 'px ' + st.btnRadiusBL + 'px !important; }\n';
      }
      if (st.btnHeight) {
        customCss += btnSelector + ' { height: ' + st.btnHeight + 'px !important; min-height: ' + st.btnHeight + 'px !important; }\n';
      }
      if (st.btnPaddingTop !== undefined) {
        customCss += btnSelector + ' { padding: ' + st.btnPaddingTop + 'px ' + st.btnPaddingRight + 'px ' + st.btnPaddingBottom + 'px ' + st.btnPaddingLeft + 'px !important; }\n';
      }
      if (st.btnFontSize) {
        customCss += btnSelector + ' { font-size: ' + st.btnFontSize + 'px !important; }\n';
      }
      if (st.btnFontWeight) {
        customCss += btnSelector + ' { font-weight: ' + st.btnFontWeight + ' !important; }\n';
      }
      if (st.btnLetterSpacing !== undefined) {
        customCss += btnSelector + ' { letter-spacing: ' + st.btnLetterSpacing + 'px !important; }\n';
      }
      if (st.btnBorderWidth !== undefined) {
        customCss += btnSelector + ' { border-width: ' + st.btnBorderWidth + 'px !important; }\n';
      }

      // Input Sizing, Radius & Border
      var inpSelector = 'input[type="text"], input[type="password"], select, textarea';
      if (st.inputHeight) {
        customCss += inpSelector + ' { height: ' + st.inputHeight + 'px !important; min-height: ' + st.inputHeight + 'px !important; }\n';
      }
      if (st.inputRadius !== undefined) {
        customCss += inpSelector + ' { border-radius: ' + st.inputRadius + 'px !important; }\n';
      }
      if (st.inputBorderWidth !== undefined) {
        customCss += inpSelector + ' { border-width: ' + st.inputBorderWidth + 'px !important; }\n';
      }

      // Title Typography Matrix
      var titleSelector = 'h1, h2, .brand-title, #businessName, .title, legend';
      if (st.titleFontSize) {
        customCss += titleSelector + ' { font-size: ' + st.titleFontSize + 'px !important; }\n';
      }
      if (st.titleFontWeight) {
        customCss += titleSelector + ' { font-weight: ' + st.titleFontWeight + ' !important; }\n';
      }
      if (st.titleLineHeight) {
        customCss += titleSelector + ' { line-height: ' + st.titleLineHeight + ' !important; }\n';
      }
      if (st.titleLetterSpacing !== undefined) {
        customCss += titleSelector + ' { letter-spacing: ' + st.titleLetterSpacing + 'px !important; }\n';
      }
      if (st.titleAlign) {
        customCss += titleSelector + ' { text-align: ' + st.titleAlign + ' !important; }\n';
      }
      if (st.titleItalic !== undefined) {
        customCss += titleSelector + ' { font-style: ' + (st.titleItalic ? 'italic' : 'normal') + ' !important; }\n';
      }
      if (st.titleUnderline !== undefined) {
        customCss += titleSelector + ' { text-decoration: ' + (st.titleUnderline ? 'underline' : 'none') + ' !important; }\n';
      }

      if (config.effects && config.effects.btnShimmer) {
        customCss += ' button, .btn, input[type="submit"], a.btn { position: relative !important; overflow: hidden !important; } button::after, .btn::after, input[type="submit"]::after, a.btn::after { content:"" !important; position:absolute !important; top:-50% !important; left:-60% !important; width:40% !important; height:200% !important; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent) !important; transform:rotate(30deg) !important; animation:mgShimmerSweep 3.5s infinite !important; }\n';
      }
      if (config.effects && config.effects.btnPulse) {
        customCss += ' button, .btn, input[type="submit"], a.btn, .btn-primary { animation: mgPulseGlow 2s infinite !important; }\n';
      }
      if (config.effects && config.effects.titleGradient) {
        customCss += titleSelector + ' { background: linear-gradient(135deg, ' + brand + ', ' + green + ', ' + blue + ', ' + brand + ') !important; background-size: 300% 300% !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; animation: mgTitleGrad 6s ease infinite alternate !important; }\n';
      }

      customCss += '@keyframes mgShimmerSweep { 0% { left: -60%; } 20%, 100% { left: 160%; } }\n';
      customCss += '@keyframes mgPulseGlow { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { transform: scale(1.02); box-shadow: 0 0 15px 4px rgba(37,99,235,0.6); } }\n';
      customCss += '@keyframes mgTitleGrad { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }\n';
      customCss += '@keyframes mgGridMove { 0% { background-position: 0 0, 0 0, 0 0; } 100% { background-position: 0 0, 0 0, 0 80px; } }\n';
      customCss += '@keyframes mgAuroraFloat { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(15%, 15%) scale(1.15) rotate(20deg); } 100% { transform: translate(-10%, 25%) scale(0.9) rotate(-15deg); } }\n';
      customCss += '@keyframes mgAuroraPulse { 0% { transform: scale(0.8); opacity:0.3; } 100% { transform: scale(1.2); opacity:0.6; } }\n';
      customCss += '@keyframes mgOrbFloat1 { 0% { top: 10%; left: 10%; } 50% { top: 60%; left: 70%; } 100% { top: 10%; left: 10%; } }\n';
      customCss += '@keyframes mgOrbFloat2 { 0% { top: 70%; left: 20%; } 50% { top: 20%; left: 80%; } 100% { top: 70%; left: 20%; } }\n';
      customCss += '@keyframes mgOrbFloat3 { 0% { top: 40%; left: 80%; } 50% { top: 75%; left: 30%; } 100% { top: 40%; left: 80%; } }\n';

      liveStyle.innerHTML = customCss;

      // 5. Injetar CSS Pro do Usuário
      var userCssEl = document.getElementById('mg-user-custom-css');
      if (!userCssEl) {
        userCssEl = document.createElement('style');
        userCssEl.id = 'mg-user-custom-css';
        document.head.appendChild(userCssEl);
      }
      userCssEl.innerHTML = (config.customCode && config.customCode.customCss) || '';

      // 6. Botão Flutuante de WhatsApp
      var waBtn = document.getElementById('mg-floating-whatsapp');
      if (config.social && config.social.whatsappEnabled && config.social.whatsappNumber) {
        if (!waBtn) {
          waBtn = document.createElement('a');
          waBtn.id = 'mg-floating-whatsapp';
          waBtn.target = '_blank';
          waBtn.style.cssText = 'position:fixed; bottom:20px; right:20px; width:52px; height:52px; border-radius:50%; background:#25d366; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(37,211,102,0.45); z-index:9999; text-decoration:none; transition:all 0.2s;';
          waBtn.innerHTML = '<svg style="width:28px;height:28px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>';
          document.body.appendChild(waBtn);
        }
        var msg = encodeURIComponent(config.social.whatsappMessage || '');
        waBtn.href = 'https://wa.me/' + config.social.whatsappNumber + '?text=' + msg;
        waBtn.style.display = 'flex';
      } else if (waBtn) {
        waBtn.style.display = 'none';
      }

      // 7. Badges de Status da Rede
      var badgeBar = document.getElementById('mg-live-badges-bar');
      if (config.badges && (config.badges.showWifiSpeed || config.badges.showSecurityBadge || config.badges.showConnectedCount)) {
        if (!badgeBar) {
          badgeBar = document.createElement('div');
          badgeBar.id = 'mg-live-badges-bar';
          badgeBar.style.cssText = 'display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin-bottom:12px;';
          var formEl = document.querySelector('form') || document.querySelector('.card') || document.querySelector('#box') || document.body;
          if (formEl) formEl.prepend(badgeBar);
        }
        var bHtml = '';
        if (config.badges.showWifiSpeed) {
          bHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);">' + (config.badges.wifiSpeedText || '⚡ 5G WiFi') + '</span>';
        }
        if (config.badges.showSecurityBadge) {
          bHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.3);">' + (config.badges.securityText || '🔒 WPA3') + '</span>';
        }
        if (config.badges.showConnectedCount) {
          bHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(245,158,11,0.3);">🟢 ' + (config.badges.connectedCountNumber || '42') + ' online</span>';
        }
        badgeBar.innerHTML = bHtml;
        badgeBar.style.display = 'flex';
      } else if (badgeBar) {
        badgeBar.style.display = 'none';
      }

      // 8. Atualizar Textos
      var btnSignup = document.getElementById('btnSignup') || document.querySelector('.btn-register') || document.querySelector('a[href*="register"]');
      if (btnSignup && config.registerButtonText) {
        if (config.enabled === false) {
          btnSignup.style.display = 'none';
        } else {
          btnSignup.style.display = 'block';
          btnSignup.innerHTML = config.registerButtonText;
        }
      }

      var businessName = document.getElementById('businessName') || document.querySelector('.brand-title') || document.querySelector('h1');
      if (businessName && config.businessName) businessName.innerText = config.businessName;

      var welcomeMessage = document.getElementById('welcomeMessage') || document.querySelector('.welcome-msg') || document.querySelector('p.message');
      if (welcomeMessage && config.message) welcomeMessage.innerText = config.message;
      
      var trialContainer = document.getElementById('trial-container');
      if (trialContainer) {
        if (config.trialEnabled) {
           trialContainer.style.display = 'block';
           trialContainer.innerHTML = '<p style="color:var(--ink, #fff);font-size:12px;margin:0;">' + (config.trialText || '') + ' <a href="#" class="btn-trial" style="color:var(--brand);font-weight:bold;cursor:pointer;">' + (config.trialLinkText || '') + '</a></p>';
        } else {
           trialContainer.style.display = 'none';
        }
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

        styleStudio.innerHTML = 
          'body, button, input, select, textarea, .card, #box, .login-card { ' + fontCss + ' }
' +
          '#box h1, #box h2, #box h3, .card h1, .card h2, .card h3, .title, #businessName, .brand-title, h1 { ' + titleSizeCss + ' ' + titleAlignCss + ' ' + titleWeightCss + ' }
' +
          '#box, .card, .login-card, #card, form#login, form { ' + cardRadiusCss + ' ' + cardPaddingCss + ' ' + cardShapeClip + ' ' + cardGlowCss + ' }
' +
          '#box .actions, form .actions, .actions { ' + cardGapCss + ' }
' +
          '.btn, .btn-login, #btnConnect, #btnSubmit, button[type="submit"], input[type="submit"] { ' + btnHeightCss + ' ' + btnRadiusCss + ' ' + btnPulseCss + ' }
' +
          'input[type="text"], input[type="password"], select, .form-input, .retro-input { ' + inputRadiusCss + ' }
' +
          '@keyframes mgBtnPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); } 50% { transform: scale(1.02); box-shadow: 0 0 16px 4px rgba(6, 182, 212, 0.6); } }
';
      }
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
      ].join('\n');
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
      }
    });
  })();
