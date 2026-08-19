// Master module for all 25 niche canvas engines
function getNicheEffectMarkup(bgEffect, speed, brand, brandDark, blue, green) {
  let speedSec = 14;
  if (speed === 'slow') speedSec = 24;
  if (speed === 'fast') speedSec = 7;

  let bgHtml = '';
  let cssEffects = '';
  let jsEffects = '';

  switch (bgEffect) {
    case 'cardio-pulse':
    case 'academia':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#080a0c;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var sparks = []; var x = 0; var lastY = c.height / 2; var step = 0;
  function addSpark(px, py) {
    for (var i = 0; i < 8; i++) {
      sparks.push({ x: px, y: py, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 1 });
    }
  }
  function draw() {
    ctx.fillStyle = 'rgba(8, 10, 12, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
    // Draw fitness grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)'; ctx.lineWidth = 1;
    for (var gx = 0; gx < c.width; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, c.height); ctx.stroke(); }
    for (var gy = 0; gy < c.height; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(c.width, gy); ctx.stroke(); }

    // ECG Heartbeat trace
    step += ${speed === 'fast' ? 4 : speed === 'slow' ? 1.5 : 2.5};
    var cx = (step * 3) % c.width;
    var cy = c.height * 0.55;
    var mod = (step * 3) % 220;
    if (mod > 60 && mod < 75) cy -= 35; // P wave
    else if (mod >= 75 && mod < 85) cy += 20; // Q wave
    else if (mod >= 85 && mod < 100) { cy -= 110; if (mod === 90) addSpark(cx, cy); } // R peak spike!
    else if (mod >= 100 && mod < 115) cy += 45; // S wave
    else if (mod >= 115 && mod < 135) cy -= 25; // T wave

    ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '${brand}'; ctx.shadowBlur = 12; ctx.shadowColor = '${green}'; ctx.fill();

    // Draw active sparks
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i]; s.x += s.vx; s.y += s.vy; s.life -= 0.03;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(s.x, s.y, 1.8 * s.life, 0, Math.PI * 2);
      ctx.fillStyle = '${green}'; ctx.shadowBlur = 8; ctx.shadowColor = '${green}'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'divine-rays':
    case 'igreja':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#04060f;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var stars = []; for (var i = 0; i < 45; i++) {
    stars.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2 + 0.8, vy: -(Math.random() * 0.6 + 0.2), alpha: Math.random() });
  }
  var angle = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    angle += ${speed === 'fast' ? 0.006 : speed === 'slow' ? 0.001 : 0.003};
    // Draw top volumetric divine rays
    var numRays = 7; var cx = c.width / 2;
    for (var r = 0; r < numRays; r++) {
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
    // Floating golden holy stardust
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s]; st.y += st.vy; if (st.y < 0) { st.y = c.height; st.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = '${brand}'; ctx.shadowBlur = 10; ctx.shadowColor = '${brand}'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'medical-vital':
    case 'clinica':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#030914;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var cells = []; for (var i = 0; i < 24; i++) {
    cells.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 16 + 8, vx: (Math.random() - 0.5) * 0.4, vy: - (Math.random() * 0.5 + 0.2) });
  }
  function draw() {
    ctx.fillStyle = 'rgba(3, 9, 20, 0.2)'; ctx.fillRect(0, 0, c.width, c.height);
    // Draw cellular wellness bubbles & soft medical crosses
    for (var i = 0; i < cells.length; i++) {
      var cl = cells[i]; cl.x += cl.vx; cl.y += cl.vy;
      if (cl.y < -30) { cl.y = c.height + 30; cl.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.strokeStyle = '${brand}'; ctx.lineWidth = 1.2; ctx.stroke();
      // Draw subtle cross inside
      var cs = cl.r * 0.45;
      ctx.beginPath(); ctx.moveTo(cl.x - cs, cl.y); ctx.lineTo(cl.x + cs, cl.y);
      ctx.moveTo(cl.x, cl.y - cs); ctx.lineTo(cl.x, cl.y + cs);
      ctx.strokeStyle = '${green}'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'woodfire-embers':
    case 'pizzaria':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#0c0607;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var embers = []; for (var i = 0; i < 50; i++) {
    embers.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2.8 + 1, vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 1), alpha: Math.random() });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    // Draw bottom woodfire warm glow
    var grad = ctx.createRadialGradient(c.width / 2, c.height + 50, 10, c.width / 2, c.height, c.height * 0.6);
    grad.addColorStop(0, 'rgba(225, 29, 72, 0.28)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);

    for (var i = 0; i < embers.length; i++) {
      var e = embers[i]; e.x += e.vx + Math.sin(e.y * 0.02) * 0.8; e.y += e.vy; e.alpha -= 0.003;
      if (e.y < -10 || e.alpha <= 0) { e.y = c.height + 10; e.x = Math.random() * c.width; e.alpha = 1; }
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = e.r > 2 ? '${brand}' : '${green}'; ctx.shadowBlur = 10; ctx.shadowColor = '${brand}'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'luxury-bubbles':
    case 'hotel':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#030712;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var bubbles = []; for (var i = 0; i < 40; i++) {
    bubbles.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 3 + 1.2, vy: -(Math.random() * 1.2 + 0.4), wobble: Math.random() * 10 });
  }
  function drawSparkle(x, y, size) {
    ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.3, y); ctx.lineTo(x + size, y); ctx.lineTo(x + size * 0.3, y); ctx.lineTo(x, y + size); ctx.lineTo(x - size * 0.3, y); ctx.lineTo(x - size, y); ctx.lineTo(x - size * 0.3, y); ctx.closePath();
    ctx.fillStyle = '#fef08a'; ctx.shadowBlur = 12; ctx.shadowColor = '${brand}'; ctx.fill();
  }
  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); t += 0.02;
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i]; b.y += b.vy; b.x += Math.sin(t + b.wobble) * 0.5;
      if (b.y < -10) { b.y = c.height + 10; b.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 119, 6, 0.7)'; ctx.shadowBlur = 8; ctx.shadowColor = '${brand}'; ctx.fill();
      if (i % 8 === 0) drawSparkle(b.x, b.y, 6);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'stadium-lights':
    case 'futebol_copa':
    case 'fifa-26.otf':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#04140a;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var angle = 0;
  var sparks = []; for (var i = 0; i < 35; i++) {
    sparks.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5 });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    angle += ${speed === 'fast' ? 0.025 : speed === 'slow' ? 0.008 : 0.015};
    // 2 Sweeping stadium floodlight cones
    var lights = [{ x: 0, a: Math.sin(angle) * 0.5 + 0.7 }, { x: c.width, a: -Math.cos(angle) * 0.5 - 0.7 }];
    for (var l = 0; l < lights.length; l++) {
      var lt = lights[l];
      ctx.save(); ctx.beginPath(); ctx.moveTo(lt.x, 0);
      var endX = lt.x + Math.cos(lt.a) * c.height * 1.8;
      ctx.lineTo(endX - 120, c.height); ctx.lineTo(endX + 120, c.height); ctx.closePath();
      var grad = ctx.createLinearGradient(lt.x, 0, endX, c.height);
      grad.addColorStop(0, 'rgba(22, 163, 74, 0.35)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.fill(); ctx.restore();
    }
    // Grass kinetic particles
    for (var i = 0; i < sparks.length; i++) {
      var sp = sparks[i]; sp.x += sp.vx; sp.y += sp.vy;
      if (sp.x < 0) sp.x = c.width; if (sp.x > c.width) sp.x = 0;
      if (sp.y < 0) sp.y = c.height; if (sp.y > c.height) sp.y = 0;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fillStyle = '${green}'; ctx.shadowBlur = 8; ctx.shadowColor = '${brand}'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'digital-ocean':
    case 'Digital_Ocean':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#000612;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var nodes = []; for (var i = 0; i < 30; i++) {
    nodes.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 3 + 2, vx: (Math.random() - 0.5) * 0.6, vy: - (Math.random() * 0.8 + 0.3) });
  }
  var t = 0;
  function draw() {
    ctx.fillStyle = 'rgba(0, 6, 18, 0.22)'; ctx.fillRect(0, 0, c.width, c.height); t += 0.02;
    // Oceanic deep bioluminescent sine wave
    for (var w = 0; w < 3; w++) {
      ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = w === 0 ? '${brand}' : '${green}';
      for (var x = 0; x < c.width; x += 15) {
        var y = Math.sin(x * 0.004 + t + w) * 50 + (c.height * 0.5 + w * 40);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; n.x += n.vx; n.y += n.vy;
      if (n.y < 0) { n.y = c.height; n.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = '${green}'; ctx.shadowBlur = 12; ctx.shadowColor = '${brand}'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'cinema-marquee':
    case 'Popcorn':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#080404;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var frame = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); frame++;
    // Projector light beam from top center
    var grad = ctx.createRadialGradient(c.width / 2, 0, 5, c.width / 2, c.height * 0.8, c.width * 0.7);
    grad.addColorStop(0, 'rgba(250, 204, 21, 0.2)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);

    // Chasing perimeter Broadway bulbs
    var bulbSpacing = 28;
    for (var x = 10; x < c.width - 10; x += bulbSpacing) {
      var on = (Math.floor(x / bulbSpacing) + Math.floor(frame / 6)) % 2 === 0;
      ctx.beginPath(); ctx.arc(x, 15, on ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#facc15' : '#7f1d1d'; if (on) { ctx.shadowBlur = 8; ctx.shadowColor = '#facc15'; }
      ctx.fill(); ctx.shadowBlur = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'chalk-constellation':
    case 'Escuela':
    case 'Greenboard':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#06120b;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var nodes = []; for (var i = 0; i < 40; i++) {
    nodes.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, r: Math.random() * 2.5 + 1.2 });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > c.width) n.vx *= -1; if (n.y < 0 || n.y > c.height) n.vy *= -1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = '${brand}'; ctx.fill();
      for (var j = i + 1; j < nodes.length; j++) {
        var n2 = nodes[j]; var d = Math.hypot(n.x - n2.x, n.y - n2.y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = '${green}'; ctx.globalAlpha = 1 - d / 110; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'traffic-radar':
    case 'Traffic-Control':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#020508;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var angle = 0; var pings = [{ a: 0.8, r: 120, ping: 0 }, { a: 2.3, r: 210, ping: 0 }, { a: 4.1, r: 160, ping: 0 }];
  function draw() {
    ctx.fillStyle = 'rgba(2, 5, 8, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
    var cx = c.width / 2; var cy = c.height / 2;
    angle += ${speed === 'fast' ? 0.04 : speed === 'slow' ? 0.012 : 0.025};
    // Radar concentric rings
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.15)'; ctx.lineWidth = 1;
    for (var r = 60; r <= 300; r += 60) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    // Radar sweep line
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 320, cy + Math.sin(angle) * 320);
    ctx.strokeStyle = '${brand}'; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = '${brand}'; ctx.stroke(); ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'hex-shield':
    case 'shield':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#020710;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var scanY = 0;
  function drawHex(x, y, r) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      var hx = x + r * Math.cos(a); var hy = y + r * Math.sin(a);
      if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath(); ctx.stroke();
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)'; ctx.lineWidth = 1;
    var r = 26; var w = r * 1.732; var h = r * 1.5;
    for (var y = 0; y < c.height + 40; y += h) {
      for (var x = 0; x < c.width + 40; x += w) {
        var offX = (Math.floor(y / h) % 2) * (w / 2);
        drawHex(x + offX, y, r);
      }
    }
    // Scanning laser line
    scanY = (scanY + 3) % c.height;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(c.width, scanY);
    ctx.strokeStyle = '${brand}'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '${brand}'; ctx.stroke(); ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'lock-crypto':
    case 'wifi_lock':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#030612;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var a1 = 0, a2 = 0, a3 = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    var cx = c.width / 2, cy = c.height / 2;
    a1 += 0.01; a2 -= 0.015; a3 += 0.008;
    ctx.lineWidth = 2;
    // Ring 1
    ctx.beginPath(); ctx.arc(cx, cy, 140, a1, a1 + Math.PI * 1.4); ctx.strokeStyle = '${brand}'; ctx.stroke();
    // Ring 2
    ctx.beginPath(); ctx.arc(cx, cy, 200, a2, a2 + Math.PI * 1.2); ctx.strokeStyle = '${green}'; ctx.stroke();
    // Ring 3
    ctx.beginPath(); ctx.arc(cx, cy, 260, a3, a3 + Math.PI * 1.5); ctx.strokeStyle = '${blue}'; ctx.stroke();
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'fiber-optic':
    case 'LinkingNet':
    case 'Launcher':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#060210;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var pulses = []; for (var i = 0; i < 18; i++) {
    pulses.push({ x: Math.random() * c.width, y: (i % 8) * (c.height / 7), speed: Math.random() * 12 + 8, len: Math.random() * 80 + 40, col: i % 2 === 0 ? '${brand}' : '${green}' });
  }
  function draw() {
    ctx.fillStyle = 'rgba(6, 2, 16, 0.25)'; ctx.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < pulses.length; i++) {
      var p = pulses[i]; p.x += p.speed;
      if (p.x - p.len > c.width) p.x = -50;
      var grad = ctx.createLinearGradient(p.x - p.len, p.y, p.x, p.y);
      grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, p.col);
      ctx.beginPath(); ctx.moveTo(p.x - p.len, p.y); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.shadowBlur = 8; ctx.shadowColor = p.col; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'synthwave-arcade':
    case 'UserKeys':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#06020e;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var t = 0;
  function draw() {
    ctx.fillStyle = 'rgba(6, 2, 14, 0.4)'; ctx.fillRect(0, 0, c.width, c.height); t += 0.03;
    // Synthwave 80s Sunset Orb
    var cx = c.width / 2; var cy = c.height * 0.4;
    var grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    grad.addColorStop(0, '#f43f5e'); grad.addColorStop(0.7, '#a855f7'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'barrio-sunset':
    case 'WifiElBarrio':
    case 'Wifi El Barrio':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#0a050f;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var orbs = []; for (var i = 0; i < 28; i++) {
    orbs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 25 + 10, vy: -(Math.random() * 0.6 + 0.2), col: i % 2 === 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(168, 85, 247, 0.18)' });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i]; o.y += o.vy; if (o.y < -40) { o.y = c.height + 40; o.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = o.col; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'community-bubbles':
    case 'WiFi_Community':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#020b14;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var bubs = []; for (var i = 0; i < 35; i++) {
    bubs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 14 + 5, vy: -(Math.random() * 0.9 + 0.3), vx: Math.sin(i) * 0.4 });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < bubs.length; i++) {
      var b = bubs[i]; b.y += b.vy; b.x += b.vx;
      if (b.y < -20) { b.y = c.height + 20; b.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = '${brand}'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'workspace-ribbons':
    case 'workspace':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#070a12;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var t = 0;
  function draw() {
    ctx.fillStyle = 'rgba(7, 10, 18, 0.25)'; ctx.fillRect(0, 0, c.width, c.height); t += 0.015;
    for (var i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = i % 2 === 0 ? '${brand}' : '${green}';
      for (var x = 0; x < c.width; x += 20) {
        var y = Math.cos(x * 0.003 + t + i * 0.8) * 60 + (c.height * 0.4 + i * 40);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'sunset-glass':
    case 'Window-orange-login':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#0f0702;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var orbs = [{ x: c.width * 0.2, y: c.height * 0.3, r: 120, c: '#ea580c' }, { x: c.width * 0.8, y: c.height * 0.7, r: 160, c: '#d97706' }];
  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); t += 0.02;
    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      var ox = o.x + Math.sin(t + i) * 40; var oy = o.y + Math.cos(t + i) * 40;
      var grad = ctx.createRadialGradient(ox, oy, 10, ox, oy, o.r);
      grad.addColorStop(0, o.c); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(ox, oy, o.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'nougat-fluid':
    case 'Nougat':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#030d07;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); t += 0.02;
    var cx = c.width / 2, cy = c.height / 2;
    for (var i = 0; i < 3; i++) {
      var gx = cx + Math.sin(t + i * 2) * 80; var gy = cy + Math.cos(t * 0.8 + i) * 80;
      var grad = ctx.createRadialGradient(gx, gy, 10, gx, gy, 140);
      grad.addColorStop(0, '${green}'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(gx, gy, 140, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'prisma-holo':
    case 'Random':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#080210;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); t += 0.03;
    var colors = ['#a855f7', '#ec4899', '#06b6d4', '#eab308'];
    for (var i = 0; i < colors.length; i++) {
      var x = (c.width / 2) + Math.cos(t + i * 1.5) * (c.width * 0.35);
      var y = (c.height / 2) + Math.sin(t * 0.8 + i) * (c.height * 0.35);
      var grad = ctx.createRadialGradient(x, y, 10, x, y, 130);
      grad.addColorStop(0, colors[i]); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, 130, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    default: // Global node constellation
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#060d0a;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  var pts = []; for (var i = 0; i < 40; i++) {
    pts.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, r: Math.random() * 2 + 1 });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > c.width) p.vx *= -1; if (p.y < 0 || p.y > c.height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '${brand}'; ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var p2 = pts[j]; var d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '${brand}'; ctx.globalAlpha = 1 - d / 100; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;
  }

  cssEffects += `body { background: transparent !important; }`;
  return { html: bgHtml, css: cssEffects, js: jsEffects };
}

module.exports = { getNicheEffectMarkup };
