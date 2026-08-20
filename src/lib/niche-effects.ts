export function getNicheEffectMarkup(
  bgEffect: string,
  speed: string = 'normal',
  brand: string = '#2563eb',
  brandDark: string = '#1d4ed8',
  blue: string = '#2563eb',
  green: string = '#10b981'
) {
  
  let speedSec = 6;
  if (speed === 'slow') speedSec = 12;
  if (speed === 'fast') speedSec = 3;

  let bgHtml = '';
  let cssEffects = '';
  let jsEffects = '';

  switch (bgEffect) {
    case 'cardio-pulse':
    case 'academia':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#080a0c;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var sparks = []; var step = 0;
  function addSpark(px, py) {
    for (var i = 0; i < 8; i++) {
      sparks.push({ x: px, y: py, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 1 });
    }
  }
  function draw() {
    ctx.fillStyle = 'rgba(8, 10, 12, 0.08)'; ctx.fillRect(0, 0, c.width, c.height);
    step += ${speed === 'fast' ? 4 : speed === 'slow' ? 1.5 : 2.5};
    var cx = (step * 3) % c.width;
    var cy = c.height * 0.55;
    var mod = (step * 3) % 220;
    if (mod > 60 && mod < 75) cy -= 35;
    else if (mod >= 75 && mod < 85) cy += 20;
    else if (mod >= 85 && mod < 100) { cy -= 110; if (mod === 90) addSpark(cx, cy); }
    else if (mod >= 100 && mod < 115) cy += 45;
    else if (mod >= 115 && mod < 135) cy -= 25;

    ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '${brand}'; ctx.shadowBlur = 12; ctx.shadowColor = '${green}'; ctx.fill();

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
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#04060f;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var stars = []; for (var i = 0; i < 45; i++) {
    stars.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2 + 0.8, vy: -(Math.random() * 0.6 + 0.2) });
  }
  var angle = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    angle += ${speed === 'fast' ? 0.006 : speed === 'slow' ? 0.001 : 0.003};
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
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#030914;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var cells = []; for (var i = 0; i < 24; i++) {
    cells.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 16 + 8, vx: (Math.random() - 0.5) * 0.4, vy: -(Math.random() * 0.5 + 0.2) });
  }
  function draw() {
    ctx.fillStyle = 'rgba(3, 9, 20, 0.2)'; ctx.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < cells.length; i++) {
      var cl = cells[i]; cl.x += cl.vx; cl.y += cl.vy;
      if (cl.y < -30) { cl.y = c.height + 30; cl.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.strokeStyle = '${brand}'; ctx.lineWidth = 1.2; ctx.stroke();
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
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#0c0607;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var embers = []; for (var i = 0; i < 50; i++) {
    embers.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2.8 + 1, vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 1), alpha: Math.random() });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
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
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#090703;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var bubs = []; for (var i = 0; i < 55; i++) {
    bubs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 3.5 + 1.2, vy: -(Math.random() * 1.6 + 0.6) * spdM, wobble: Math.random() * Math.PI * 2, sparkle: Math.random() > 0.65 });
  }
  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); t += 0.03 * spdM;
    var grad = ctx.createLinearGradient(0, c.height * 0.4, 0, c.height);
    grad.addColorStop(0, 'rgba(217, 119, 6, 0)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0.08)');
    ctx.fillStyle = grad; ctx.fillRect(0, c.height * 0.4, c.width, c.height * 0.6);
    for (var i = 0; i < bubs.length; i++) {
      var b = bubs[i]; b.y += b.vy; b.wobble += 0.04 * spdM;
      var wx = b.x + Math.sin(b.wobble) * 2;
      if (b.y < -15) { b.y = c.height + 15; b.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)'; ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(wx - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fill();
      if (b.sparkle && (i + Math.floor(t * 3)) % 7 === 0) {
        var sz = b.r * 2.2;
        ctx.beginPath();
        ctx.moveTo(wx, b.y - sz); ctx.lineTo(wx + sz * 0.25, b.y); ctx.lineTo(wx + sz, b.y); ctx.lineTo(wx + sz * 0.25, b.y); ctx.lineTo(wx, b.y + sz); ctx.lineTo(wx - sz * 0.25, b.y); ctx.lineTo(wx - sz, b.y); ctx.lineTo(wx - sz * 0.25, b.y);
        ctx.closePath(); ctx.fillStyle = '#fef08a'; ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'stadium-lights':
    case 'futebol_copa':
    case 'fifa-26.otf':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#020d06;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var angle = 0;
  var dust = []; for (var i = 0; i < 35; i++) {
    dust.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.8 + 0.6, vx: (Math.random() - 0.5) * 0.4 * spdM, vy: (Math.random() - 0.5) * 0.4 * spdM });
  }
  var flashPos = { x: 0, y: 0, active: false, rad: 0 };
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); angle += 0.012 * spdM;
    var turfGrad = ctx.createLinearGradient(0, c.height * 0.6, 0, c.height);
    turfGrad.addColorStop(0, 'rgba(22, 163, 74, 0)'); turfGrad.addColorStop(1, 'rgba(22, 163, 74, 0.12)');
    ctx.fillStyle = turfGrad; ctx.fillRect(0, c.height * 0.6, c.width, c.height * 0.4);
    var towers = [
      { x: 0, y: 0, a: Math.sin(angle * 0.8) * 0.35 + 0.75, len: c.height * 1.8, col: 'rgba(34, 197, 94, 0.25)' },
      { x: c.width, y: 0, a: -Math.cos(angle * 0.7) * 0.35 - 0.75, len: c.height * 1.8, col: 'rgba(56, 189, 248, 0.25)' },
      { x: c.width * 0.25, y: 0, a: Math.cos(angle * 0.9) * 0.25 + Math.PI * 0.5, len: c.height * 1.5, col: 'rgba(255, 255, 255, 0.18)' },
      { x: c.width * 0.75, y: 0, a: -Math.sin(angle * 0.9) * 0.25 + Math.PI * 0.5, len: c.height * 1.5, col: 'rgba(34, 197, 94, 0.2)' }
    ];
    towers.forEach(function(t) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(t.x, t.y);
      var endX = t.x + Math.cos(t.a) * t.len; var endY = t.y + Math.sin(t.a) * t.len;
      ctx.lineTo(endX - 120, endY); ctx.lineTo(endX + 120, endY); ctx.closePath();
      var grad = ctx.createLinearGradient(t.x, t.y, endX, endY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)'); grad.addColorStop(0.2, t.col); grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad; ctx.fill(); ctx.restore();
    });
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i]; d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = c.width; if (d.x > c.width) d.x = 0;
      if (d.y < 0) d.y = c.height; if (d.y > c.height) d.y = 0;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.fill();
    }
    if (!flashPos.active && Math.random() < 0.04 * spdM) {
      flashPos = { x: Math.random() * c.width, y: c.height * (0.55 + Math.random() * 0.4), active: true, rad: 2 };
    }
    if (flashPos.active) {
      flashPos.rad += 3 * spdM;
      ctx.beginPath(); ctx.arc(flashPos.x, flashPos.y, flashPos.rad, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + Math.max(0, 1 - flashPos.rad / 25) + ')';
      ctx.lineWidth = 2; ctx.stroke();
      if (flashPos.rad > 25) flashPos.active = false;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'digital-ocean':
    case 'Digital_Ocean':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#01050e;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var beacons = []; for (var i = 0; i < 14; i++) {
    beacons.push({ x: Math.random() * c.width, y: c.height, vy: (Math.random() * 3 + 2) * spdM, len: Math.random() * 50 + 30 });
  }
  var t = 0;
  function draw() {
    ctx.fillStyle = 'rgba(1, 5, 14, 0.28)'; ctx.fillRect(0, 0, c.width, c.height); t += 0.025 * spdM;
    var horizonY = c.height * 0.42; var numGridZ = 16;
    for (var gz = 1; gz <= numGridZ; gz++) {
      var zNorm = gz / numGridZ; var yBase = horizonY + (c.height - horizonY) * (zNorm * zNorm);
      ctx.strokeStyle = 'rgba(6, 182, 212, ' + (zNorm * 0.6) + ')';
      ctx.beginPath();
      for (var gx = 0; gx <= c.width; gx += 16) {
        var wave = Math.sin(gx * 0.008 + t * 2 + gz * 0.5) * Math.cos(gx * 0.004 - t) * (18 * zNorm);
        var y = yBase + wave;
        if (gx === 0) ctx.moveTo(gx, y); else ctx.lineTo(gx, y);
      }
      ctx.stroke();
    }
    for (var b = 0; b < beacons.length; b++) {
      var bc = beacons[b]; bc.y -= bc.vy;
      if (bc.y < -60) { bc.y = c.height + 20; bc.x = Math.random() * c.width; }
      var bGrad = ctx.createLinearGradient(bc.x, bc.y + bc.len, bc.x, bc.y);
      bGrad.addColorStop(0, 'rgba(6, 182, 212, 0)'); bGrad.addColorStop(1, '#38bdf8');
      ctx.beginPath(); ctx.moveTo(bc.x, bc.y + bc.len); ctx.lineTo(bc.x, bc.y);
      ctx.strokeStyle = bGrad; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(bc.x, bc.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'cinema-marquee':
    case 'Popcorn':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#0a0405;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var frame = 0;
  var motes = []; for (var i = 0; i < 30; i++) {
    motes.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.3 * spdM, vy: (Math.random() * 0.4 + 0.2) * spdM });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); frame += spdM;
    var pApexX = c.width / 2;
    var flicker = 0.14 + Math.sin(frame * 0.15) * 0.03 + Math.random() * 0.02;
    ctx.save(); ctx.beginPath(); ctx.moveTo(pApexX, 0);
    ctx.lineTo(pApexX - c.width * 0.45, c.height); ctx.lineTo(pApexX + c.width * 0.45, c.height); ctx.closePath();
    var pGrad = ctx.createRadialGradient(pApexX, 0, 10, pApexX, c.height * 0.6, c.height * 0.8);
    pGrad.addColorStop(0, 'rgba(254, 240, 138, ' + (flicker * 1.8) + ')');
    pGrad.addColorStop(0.5, 'rgba(250, 204, 21, ' + (flicker * 0.6) + ')');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = pGrad; ctx.fill(); ctx.restore();

    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m]; mo.x += mo.vx; mo.y += mo.vy;
      if (mo.y > c.height) { mo.y = 0; mo.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(mo.x, mo.y, mo.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(254, 240, 138, 0.5)'; ctx.fill();
    }
    var bulbSpacing = 28; var bulbRadius = 3.5; var bulbPhase = Math.floor(frame / 6);
    function drawBulb(bx, by, idx) {
      var isOn = (idx + bulbPhase) % 3 === 0;
      ctx.beginPath(); ctx.arc(bx, by, bulbRadius, 0, Math.PI * 2);
      if (isOn) { ctx.fillStyle = '#fde047'; ctx.shadowBlur = 10; ctx.shadowColor = '#facc15'; } else { ctx.fillStyle = '#451a03'; ctx.shadowBlur = 0; }
      ctx.fill(); ctx.shadowBlur = 0;
    }
    var bIdx = 0;
    for (var x = 14; x < c.width - 14; x += bulbSpacing) { drawBulb(x, 14, bIdx++); drawBulb(x, c.height - 14, bIdx++); }
    for (var y = 14; y < c.height - 14; y += bulbSpacing) { drawBulb(14, y, bIdx++); drawBulb(c.width - 14, y, bIdx++); }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'chalk-constellation':
    case 'Escuela':
    case 'Greenboard':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#040d08;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var rot = 0;
  var electrons = [
    { a: 0, speed: 0.03, rx: 140, ry: 60, tilt: 0 },
    { a: 1.2, speed: -0.025, rx: 170, ry: 75, tilt: Math.PI / 3 },
    { a: 2.4, speed: 0.02, rx: 200, ry: 90, tilt: -Math.PI / 3 }
  ];
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); rot += 0.005 * spdM;
    var cx = c.width / 2; var cy = c.height / 2;
    ctx.save(); ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)'; ctx.lineWidth = 1.2;
    if (ctx.setLineDash) ctx.setLineDash([4, 6]);
    [80, 130, 190, 260].forEach(function(r) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); });
    if (ctx.setLineDash) ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.28)';
    ctx.save(); ctx.rotate(rot); ctx.beginPath();
    for (var i = 0; i < 3; i++) {
      var a = (i * Math.PI * 2) / 3; var px = Math.cos(a) * 130; var py = Math.sin(a) * 130;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
    for (var i = 0; i < 24; i++) {
      var ta = (i * Math.PI * 2) / 24; ctx.beginPath();
      ctx.moveTo(Math.cos(ta) * 185, Math.sin(ta) * 185); ctx.lineTo(Math.cos(ta) * 195, Math.sin(ta) * 195);
      ctx.stroke();
    }
    ctx.restore();
    electrons.forEach(function(el) {
      el.a += el.speed * spdM; ctx.save(); ctx.rotate(el.tilt);
      ctx.beginPath();
      if (ctx.ellipse) ctx.ellipse(0, 0, el.rx, el.ry, 0, 0, Math.PI * 2); else ctx.arc(0, 0, el.rx, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.15)'; ctx.stroke();
      var ex = Math.cos(el.a) * el.rx; var ey = Math.sin(el.a) * el.ry;
      ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#6ee7b7'; ctx.shadowBlur = 8; ctx.shadowColor = '#6ee7b7'; ctx.fill(); ctx.shadowBlur = 0;
      ctx.restore();
    });
    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'traffic-radar':
    case 'Traffic-Control':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#020608;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var angle = 0;
  var targets = [
    { dist: 90, ang: 0.8, ping: 0, label: 'NOC-SP 12ms' },
    { dist: 160, ang: 2.3, ping: 0, label: 'DNS-01 4ms' },
    { dist: 220, ang: 4.1, ping: 0, label: 'GATEWAY 99%' },
    { dist: 130, ang: 5.4, ping: 0, label: 'BGP-PEER' }
  ];
  function draw() {
    ctx.fillStyle = 'rgba(2, 6, 8, 0.12)'; ctx.fillRect(0, 0, c.width, c.height);
    var cx = c.width / 2; var cy = c.height / 2;
    angle = (angle + 0.03 * spdM) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)'; ctx.lineWidth = 1;
    [60, 120, 180, 240].forEach(function(r) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(cx - 260, cy); ctx.lineTo(cx + 260, cy); ctx.moveTo(cx, cy - 260); ctx.lineTo(cx, cy + 260); ctx.stroke();
    var sweepArc = 0.5; var grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260);
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); grad.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 260, angle - sweepArc, angle, false); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * 260, cy + Math.sin(angle) * 260);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '#22c55e'; ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
    targets.forEach(function(tgt) {
      var tx = cx + Math.cos(tgt.ang) * tgt.dist; var ty = cy + Math.sin(tgt.ang) * tgt.dist;
      var angDiff = Math.abs(angle - tgt.ang); if (angDiff < 0.05) tgt.ping = 1;
      if (tgt.ping > 0) {
        tgt.ping -= 0.015 * spdM; var ripR = (1 - tgt.ping) * 28;
        ctx.beginPath(); ctx.arc(tx, ty, ripR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 197, 94, ' + tgt.ping + ')'; ctx.stroke();
        ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.font = '9px monospace'; ctx.fillStyle = 'rgba(34, 197, 94, ' + tgt.ping + ')'; ctx.fillText(tgt.label, tx + 8, ty - 4);
      } else {
        ctx.beginPath(); ctx.arc(tx, ty, 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(34, 197, 94, 0.35)'; ctx.fill();
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'hex-shield':
    case 'shield':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#010912;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var waveR = 0;
  var r = 28; var w = r * Math.sqrt(3); var h = r * 1.5;
  function drawHex(hx, hy, intensity) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = (i * Math.PI) / 3; var px = hx + r * Math.cos(a); var py = hy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (intensity > 0.1) {
      ctx.fillStyle = 'rgba(6, 182, 212, ' + (intensity * 0.35) + ')'; ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, ' + (intensity * 0.9) + ')'; ctx.lineWidth = 1.8; ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    var cx = c.width / 2; var cy = c.height / 2;
    waveR = (waveR + 2.5 * spdM) % (Math.hypot(c.width, c.height) * 0.6);
    for (var y = -20; y < c.height + 40; y += h) {
      var row = Math.floor(y / h);
      for (var x = -20; x < c.width + 40; x += w) {
        var offX = (row % 2) * (w / 2); var hexX = x + offX; var hexY = y;
        var d = Math.hypot(hexX - cx, hexY - cy); var waveDist = Math.abs(d - waveR);
        var intensity = waveDist < 70 ? (1 - waveDist / 70) : 0;
        drawHex(hexX, hexY, intensity);
      }
    }
    ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.shadowBlur = 15; ctx.shadowColor = '#06b6d4'; ctx.stroke(); ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'lock-crypto':
    case 'wifi_lock':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#030511;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var a1 = 0, a2 = 0, a3 = 0;
  var hexChars = ['0x4F', 'AES', '9A', 'WPA3', '7C', 'SHA2', 'E1', 'KEY', '3B', '256'];
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    var cx = c.width / 2; var cy = c.height / 2;
    a1 += 0.008 * spdM; a2 -= 0.012 * spdM; a3 += 0.006 * spdM;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a1);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '9px monospace'; ctx.fillStyle = '#818cf8';
    for (var i = 0; i < 12; i++) {
      var a = (i * Math.PI * 2) / 12; ctx.save(); ctx.rotate(a); ctx.fillText(hexChars[i % hexChars.length], 205, 3); ctx.restore();
    }
    ctx.restore();

    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 1.6); ctx.stroke();
    for (var i = 0; i < 20; i++) {
      var a = (i * Math.PI * 2) / 20; ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 155, Math.sin(a) * 155); ctx.lineTo(Math.cos(a) * 165, Math.sin(a) * 165); ctx.stroke();
    }
    ctx.restore();

    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a3);
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 110, 0, Math.PI * 1.3); ctx.stroke();
    ctx.restore();

    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath(); ctx.arc(0, -10, 14, Math.PI, 0);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#6366f1'; ctx.shadowBlur = 10; ctx.shadowColor = '#6366f1';
    ctx.fillRect(-16, -4, 32, 26); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(0, 5, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.fillRect(-1.5, 6, 3, 7);
    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'fiber-optic':
    case 'LinkingNet':
    case 'Launcher':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#04020a;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var fibers = [
    { p0: { x: -50, y: 0.2 }, p1: { x: 0.3, y: 0.1 }, p2: { x: 0.7, y: 0.4 }, p3: { x: 1.1, y: 0.35 }, col: '#00f0ff' },
    { p0: { x: -50, y: 0.45 }, p1: { x: 0.4, y: 0.6 }, p2: { x: 0.6, y: 0.3 }, p3: { x: 1.1, y: 0.55 }, col: '#00ff88' },
    { p0: { x: -50, y: 0.7 }, p1: { x: 0.2, y: 0.85 }, p2: { x: 0.8, y: 0.75 }, p3: { x: 1.1, y: 0.85 }, col: '#c084fc' },
    { p0: { x: -50, y: 0.85 }, p1: { x: 0.5, y: 0.7 }, p2: { x: 0.7, y: 0.95 }, p3: { x: 1.1, y: 0.7 }, col: '#00f0ff' }
  ];
  var photons = []; for (var i = 0; i < 18; i++) {
    photons.push({ fiberIdx: Math.floor(Math.random() * fibers.length), t: Math.random(), speed: (Math.random() * 0.008 + 0.006) * spdM });
  }
  var sparks = [];
  function getBezierPt(p0, p1, p2, p3, t, w, h) {
    var cx0 = p0.x < 0 ? p0.x : p0.x * w; var cy0 = p0.y * h;
    var cx1 = p1.x * w; var cy1 = p1.y * h;
    var cx2 = p2.x * w; var cy2 = p2.y * h;
    var cx3 = p3.x * w; var cy3 = p3.y * h;
    var mt = 1 - t;
    var x = mt*mt*mt*cx0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*cx3;
    var y = mt*mt*mt*cy0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*cx3;
    return { x: x, y: y };
  }
  function draw() {
    ctx.fillStyle = 'rgba(4, 2, 10, 0.25)'; ctx.fillRect(0, 0, c.width, c.height);
    fibers.forEach(function(f) {
      ctx.beginPath();
      var p0x = f.p0.x < 0 ? f.p0.x : f.p0.x * c.width;
      ctx.moveTo(p0x, f.p0.y * c.height);
      ctx.bezierCurveTo(f.p1.x * c.width, f.p1.y * c.height, f.p2.x * c.width, f.p2.y * c.height, f.p3.x * c.width, f.p3.y * c.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'; ctx.lineWidth = 2.5; ctx.stroke();
    });
    photons.forEach(function(pt) {
      pt.t += pt.speed;
      if (pt.t >= 1) {
        pt.t = 0; var fb = fibers[pt.fiberIdx];
        for (var s = 0; s < 5; s++) sparks.push({ x: c.width, y: fb.p3.y * c.height, vx: Math.random() * 4 + 2, vy: (Math.random() - 0.5) * 4, life: 1, col: fb.col });
      }
      var fb = fibers[pt.fiberIdx];
      var pos = getBezierPt(fb.p0, fb.p1, fb.p2, fb.p3, pt.t, c.width, c.height);
      var trailPos = getBezierPt(fb.p0, fb.p1, fb.p2, fb.p3, Math.max(0, pt.t - 0.04), c.width, c.height);
      ctx.beginPath(); ctx.moveTo(trailPos.x, trailPos.y); ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = fb.col; ctx.lineWidth = 3.5; ctx.shadowBlur = 14; ctx.shadowColor = fb.col; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    });
    for (var i = sparks.length - 1; i >= 0; i--) {
      var sp = sparks[i]; sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.04;
      if (sp.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.5 * sp.life, 0, Math.PI * 2); ctx.fillStyle = sp.col; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'synthwave-arcade':
    case 'UserKeys':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#090114;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var gridOffset = 0;
  var stars = []; for (var i = 0; i < 45; i++) stars.push({ x: Math.random() * c.width, y: Math.random() * (c.height * 0.5), r: Math.random() * 1.5 + 0.5 });
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); gridOffset = (gridOffset + 2 * spdM) % 36;
    var hy = c.height * 0.52; var cx = c.width / 2;
    stars.forEach(function(st) { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fillStyle = '#fdf4ff'; ctx.fill(); });
    var sunR = Math.min(c.width * 0.26, 120); var sunY = hy - 15;
    var sunGrad = ctx.createLinearGradient(cx, sunY - sunR, cx, sunY + sunR);
    sunGrad.addColorStop(0, '#fde047'); sunGrad.addColorStop(0.5, '#f43f5e'); sunGrad.addColorStop(1, '#8b5cf6');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, sunY, sunR, 0, Math.PI * 2); ctx.fillStyle = sunGrad;
    ctx.shadowBlur = 25; ctx.shadowColor = '#f43f5e'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#090114';
    for (var i = 0; i < 7; i++) {
      var sliceY = sunY + (i * 12) + 2; var sliceH = (i + 1) * 1.8;
      ctx.fillRect(cx - sunR - 10, sliceY, (sunR + 10) * 2, sliceH);
    }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(c.width * 0.15, hy - 45); ctx.lineTo(c.width * 0.3, hy);
    ctx.lineTo(c.width * 0.7, hy); ctx.lineTo(c.width * 0.85, hy - 55); ctx.lineTo(c.width, hy);
    ctx.lineTo(c.width, c.height); ctx.lineTo(0, c.height); ctx.closePath();
    ctx.fillStyle = '#06010d'; ctx.fill(); ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)'; ctx.lineWidth = 1;
    for (var x = -c.width * 0.5; x <= c.width * 1.5; x += 48) { ctx.beginPath(); ctx.moveTo(cx, hy); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (var y = hy + gridOffset; y < c.height; y += 24) {
      var alpha = (y - hy) / (c.height - hy); ctx.strokeStyle = 'rgba(168, 85, 247, ' + (alpha * 0.7) + ')';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'barrio-sunset':
    case 'WifiElBarrio':
    case 'Wifi El Barrio':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#0c0508;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var bokehs = []; var cols = ['rgba(234, 88, 12, 0.25)', 'rgba(249, 115, 22, 0.2)', 'rgba(225, 29, 72, 0.2)', 'rgba(217, 119, 6, 0.25)'];
  for (var i = 0; i < 30; i++) {
    bokehs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 40 + 15, vy: -(Math.random() * 0.5 + 0.2) * spdM, vx: (Math.random() - 0.5) * 0.3 * spdM, col: cols[Math.floor(Math.random() * 4)], sides: Math.random() > 0.4 ? 7 : 0 });
  }
  var leakT = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); leakT += 0.015 * spdM;
    var leakX = c.width * (0.3 + Math.sin(leakT) * 0.2);
    var leakGrad = ctx.createRadialGradient(leakX, 0, 50, leakX, c.height * 0.7, c.width * 0.8);
    leakGrad.addColorStop(0, 'rgba(249, 115, 22, 0.18)'); leakGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.08)'); leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad; ctx.fillRect(0, 0, c.width, c.height);
    bokehs.forEach(function(b) {
      b.y += b.vy; b.x += b.vx;
      if (b.y < -50) { b.y = c.height + 50; b.x = Math.random() * c.width; }
      if (b.x < -50) b.x = c.width + 50; if (b.x > c.width + 50) b.x = -50;
      ctx.save(); ctx.translate(b.x, b.y); ctx.beginPath();
      if (b.sides > 0) {
        for (var i = 0; i < b.sides; i++) {
          var a = (i * Math.PI * 2) / b.sides; var px = Math.cos(a) * b.r; var py = Math.sin(a) * b.r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = b.col; ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'community-bubbles':
    case 'WiFi_Community':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#020814;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var sBubbles = []; for (var i = 0; i < 22; i++) {
    sBubbles.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 22 + 10, vx: (Math.random() - 0.5) * 1.2 * spdM, vy: -(Math.random() * 0.8 + 0.3) * spdM, wobble: Math.random() * Math.PI * 2 });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < sBubbles.length; i++) {
      for (var j = i + 1; j < sBubbles.length; j++) {
        var b1 = sBubbles[i]; var b2 = sBubbles[j]; var dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
        if (dist < 140) {
          ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y);
          ctx.strokeStyle = 'rgba(56, 189, 248, ' + ((1 - dist / 140) * 0.35) + ')'; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    sBubbles.forEach(function(b) {
      b.x += b.vx; b.y += b.vy; b.wobble += 0.03 * spdM;
      if (b.y < -40) { b.y = c.height + 40; b.x = Math.random() * c.width; }
      if (b.x < -30 || b.x > c.width + 30) b.vx *= -1;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
      var sheen = ctx.createLinearGradient(b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r);
      sheen.addColorStop(0, 'rgba(236, 72, 153, 0.15)'); sheen.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)'); sheen.addColorStop(1, 'rgba(234, 179, 8, 0.15)');
      ctx.fillStyle = sheen; ctx.fill();
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'workspace-ribbons':
    case 'workspace':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#04070d;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var t = 0;
  function draw() {
    ctx.fillStyle = 'rgba(4, 7, 13, 0.25)'; ctx.fillRect(0, 0, c.width, c.height); t += 0.015 * spdM;
    var ribbons = [
      { cy: c.height * 0.35, amp: 65, freq: 0.003, col1: '#0d9488', col2: '#2563eb', thick: 35 },
      { cy: c.height * 0.55, amp: 80, freq: 0.0025, col1: '#2563eb', col2: '#6366f1', thick: 45 },
      { cy: c.height * 0.75, amp: 55, freq: 0.0035, col1: '#0284c7', col2: '#0d9488', thick: 30 }
    ];
    ribbons.forEach(function(rb, idx) {
      ctx.beginPath();
      for (var x = 0; x <= c.width; x += 15) {
        var y = rb.cy + Math.sin(x * rb.freq + t + idx * 1.2) * rb.amp + Math.cos(x * 0.001 - t * 0.8) * 25;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (var x = c.width; x >= 0; x -= 15) {
        var y = rb.cy + Math.sin(x * rb.freq + t + idx * 1.2) * rb.amp + Math.cos(x * 0.001 - t * 0.8) * 25 + rb.thick;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      var rGrad = ctx.createLinearGradient(0, rb.cy - rb.amp, c.width, rb.cy + rb.amp);
      rGrad.addColorStop(0, rb.col1); rGrad.addColorStop(1, rb.col2);
      ctx.fillStyle = rGrad; ctx.globalAlpha = 0.22; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = rb.col1; ctx.lineWidth = 1.2; ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'sunset-glass':
    case 'Window-orange-login':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#0d0502;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var t = 0;
  var fizz = []; for (var i = 0; i < 30; i++) fizz.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2 + 0.8, vy: -(Math.random() * 0.8 + 0.4) * spdM });
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); t += 0.018 * spdM;
    var numCaustics = 5;
    for (var k = 0; k < numCaustics; k++) {
      var cx = (c.width / 2) + Math.sin(t * 0.7 + k * 1.3) * (c.width * 0.35);
      var cy = (c.height / 2) + Math.cos(t * 0.5 + k * 1.1) * (c.height * 0.3);
      var r = Math.min(c.width, c.height) * (0.35 + k * 0.08);
      var grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)'); grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.12)'); grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
    }
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)'; ctx.lineWidth = 2;
    for (var i = 0; i < 4; i++) {
      ctx.beginPath();
      for (var x = 0; x <= c.width; x += 20) {
        var y = (c.height * 0.5) + Math.sin(x * 0.005 + t * 2 + i) * 60 + Math.cos(x * 0.008 - t) * 40;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    fizz.forEach(function(fz) {
      fz.y += fz.vy; if (fz.y < -10) { fz.y = c.height + 10; fz.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(fz.x, fz.y, fz.r, 0, Math.PI * 2); ctx.fillStyle = '#fbbf24'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'nougat-fluid':
    case 'Nougat':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#020b06;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var blobColors = ['#34d399', '#22d3ee', '#a78bfa', '#fb7185'];
  var blobs = []; for (var i = 0; i < 11; i++) {
    blobs.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 45 + 30, vx: (Math.random() - 0.5) * 1.5 * spdM, vy: (Math.random() - 0.5) * 1.5 * spdM, col: blobColors[i % 4] });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    blobs.forEach(function(b) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;
    });
    for (var i = 0; i < blobs.length; i++) {
      for (var j = i + 1; j < blobs.length; j++) {
        var b1 = blobs[i]; var b2 = blobs[j]; var dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
        var maxDist = b1.r + b2.r + 55;
        if (dist < maxDist) {
          var midX = (b1.x + b2.x) / 2; var midY = (b1.y + b2.y) / 2;
          var bridgeR = ((maxDist - dist) / maxDist) * 22;
          ctx.beginPath(); ctx.arc(midX, midY, bridgeR, 0, Math.PI * 2);
          ctx.fillStyle = b1.col; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1;
        }
      }
    }
    blobs.forEach(function(b) {
      var grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
      grad.addColorStop(0, b.col); grad.addColorStop(0.8, b.col); grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'prisma-holo':
    case 'Random':
      bgHtml = `<canvas id="mg-fx-niche" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#06020c;"></canvas>`;
      jsEffects = `(function() {
  var c = document.getElementById('mg-fx-niche'); if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth || document.documentElement.clientWidth || 360; c.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var spdM = ${speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1};
  var prismAngle = 0;
  var rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height); prismAngle += 0.015 * spdM;
    var cx = c.width / 2; var cy = c.height / 2;
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, cy - 80); ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.shadowBlur = 15; ctx.shadowColor = '#ffffff'; ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
    ctx.save();
    if (ctx.globalCompositeOperation) ctx.globalCompositeOperation = 'lighter';
    rainbowColors.forEach(function(col, idx) {
      var fanAngle = 0.15 + (idx * 0.065) + Math.sin(prismAngle) * 0.05;
      var endX = cx + Math.cos(fanAngle) * c.width; var endY = cy + Math.sin(fanAngle) * c.width;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(endX, endY);
      ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.shadowBlur = 12; ctx.shadowColor = col; ctx.stroke();
    });
    ctx.restore();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(prismAngle);
    var pSize = 55; ctx.beginPath();
    for (var i = 0; i < 3; i++) {
      var a = (i * Math.PI * 2) / 3 - Math.PI / 2; var px = Math.cos(a) * pSize; var py = Math.sin(a) * pSize;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    for (var i = 0; i < 3; i++) {
      var a = (i * Math.PI * 2) / 3 - Math.PI / 2; var px = Math.cos(a) * pSize; var py = Math.sin(a) * pSize;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = rainbowColors[i * 2]; ctx.shadowBlur = 8; ctx.shadowColor = '#ffffff'; ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
})();`;
      break;

    case 'aurora':
      bgHtml = `
<div id="mg-fx-aurora" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden; pointer-events:none; background: #05050d;">
  <div class="mg-aurora-blob" style="position:absolute; width:70vw; height:70vw; top:-20%; left:-10%; border-radius:50%; background:radial-gradient(circle, ${brand} 0%, transparent 70%); filter:blur(60px); opacity:0.6; animation: mgAuroraFloat ${speedSec}s ease-in-out infinite alternate;"></div>
  <div class="mg-aurora-blob" style="position:absolute; width:65vw; height:65vw; bottom:-10%; right:-10%; border-radius:50%; background:radial-gradient(circle, ${green} 0%, transparent 70%); filter:blur(60px); opacity:0.5; animation: mgAuroraFloat ${speedSec * 1.3}s ease-in-out infinite alternate-reverse;"></div>
  <div class="mg-aurora-blob" style="position:absolute; width:50vw; height:50vw; top:30%; left:30%; border-radius:50%; background:radial-gradient(circle, ${blue} 0%, transparent 70%); filter:blur(50px); opacity:0.4; animation: mgAuroraPulse ${speedSec * 0.8}s ease-in-out infinite alternate;"></div>
</div>`;
      cssEffects += `
@keyframes mgAuroraFloat {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15%, 15%) scale(1.15) rotate(20deg); }
  100% { transform: translate(-10%, 25%) scale(0.9) rotate(-15deg); }
}
@keyframes mgAuroraPulse {
  0% { transform: scale(0.8); opacity:0.3; }
  100% { transform: scale(1.2); opacity:0.6; }
}
`;
      break;

    case 'matrix':
      bgHtml = `<canvas id="mg-fx-canvas-matrix" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#020603;"></canvas>`;
      jsEffects = `(function() {
  var canvas = document.getElementById('mg-fx-canvas-matrix');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth || document.documentElement.clientWidth || 360; canvas.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var cols = Math.floor((canvas.width || 360) / 18) + 1;
  var ypos = [];
  for (var i = 0; i < cols; i++) { ypos[i] = Math.floor(Math.random() * (canvas.height || 640)); }
  var chars = '0101010101MIKROGESTORWIFIACCESS★#@&%';
  function matrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '${brand || '#00ff66'}'; ctx.font = '13pt monospace';
    ypos.forEach(function(y, ind) {
      var text = chars.charAt(Math.floor(Math.random() * chars.length));
      var x = ind * 18; ctx.fillText(text, x, y);
      if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
      else ypos[ind] = y + ${speed === 'fast' ? '26' : speed === 'slow' ? '14' : '20'};
    });
  }
  setInterval(matrix, ${speed === 'fast' ? '20' : speed === 'slow' ? '45' : '28'});
})();`;
      break;

    case 'cyber-grid':
      bgHtml = `
<div id="mg-fx-cybergrid" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden; pointer-events:none; background: radial-gradient(circle at 50% 30%, ${brandDark} 0%, #05050f 70%);">
  <div style="position:absolute; width:200%; height:100%; left:-50%; bottom:0; background: linear-gradient(rgba(0,0,0,0) 0%, #05050f 85%), linear-gradient(90deg, ${brand}33 1px, transparent 1px), linear-gradient(0deg, ${brand}33 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px; transform: perspective(300px) rotateX(60deg); transform-origin: center bottom; animation: mgGridMove ${speedSec * 0.4}s linear infinite;"></div>
</div>`;
      cssEffects += `
@keyframes mgGridMove {
  0% { background-position: 0 0, 0 0, 0 0; }
  100% { background-position: 0 0, 0 0, 0 80px; }
}
`;
      break;

    case 'floating-orbs':
      bgHtml = `
<div id="mg-fx-orbs" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden; pointer-events:none; background:#0a0c18;">
  <div style="position:absolute; width:220px; height:220px; border-radius:50%; background:${brand}; filter:blur(45px); opacity:0.5; animation: mgOrbFloat1 ${speedSec}s ease-in-out infinite;"></div>
  <div style="position:absolute; width:180px; height:180px; border-radius:50%; background:${green}; filter:blur(40px); opacity:0.45; animation: mgOrbFloat2 ${speedSec * 1.2}s ease-in-out infinite;"></div>
  <div style="position:absolute; width:260px; height:260px; border-radius:50%; background:${blue}; filter:blur(50px); opacity:0.4; animation: mgOrbFloat3 ${speedSec * 0.9}s ease-in-out infinite;"></div>
</div>`;
      cssEffects += `
@keyframes mgOrbFloat1 { 0% { top: 10%; left: 10%; } 50% { top: 60%; left: 70%; } 100% { top: 10%; left: 10%; } }
@keyframes mgOrbFloat2 { 0% { top: 70%; left: 20%; } 50% { top: 20%; left: 80%; } 100% { top: 70%; left: 20%; } }
@keyframes mgOrbFloat3 { 0% { top: 40%; left: 80%; } 50% { top: 75%; left: 30%; } 100% { top: 40%; left: 80%; } }
`;
      break;

    case 'fireflies':
      bgHtml = `
<div id="mg-fx-fireflies" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden; pointer-events:none; background:#070810;">
  <div class="mg-firefly" style="position:absolute; width:4px; height:4px; border-radius:50%; background:${brand}; box-shadow:0 0 10px ${brand}; top:20%; left:15%; animation: mgFireflyFly 12s ease-in-out infinite alternate, mgFireflyPulse 2s ease-in-out infinite alternate;"></div>
  <div class="mg-firefly" style="position:absolute; width:3px; height:3px; border-radius:50%; background:#fef08a; box-shadow:0 0 10px #fef08a; top:50%; left:75%; animation: mgFireflyFly 15s ease-in-out infinite alternate, mgFireflyPulse 2.5s ease-in-out infinite alternate;"></div>
  <div class="mg-firefly" style="position:absolute; width:5px; height:5px; border-radius:50%; background:${green}; box-shadow:0 0 10px ${green}; top:80%; left:30%; animation: mgFireflyFly 10s ease-in-out infinite alternate, mgFireflyPulse 1.8s ease-in-out infinite alternate;"></div>
  <div class="mg-firefly" style="position:absolute; width:4px; height:4px; border-radius:50%; background:${blue}; box-shadow:0 0 10px ${blue}; top:35%; left:85%; animation: mgFireflyFly 14s ease-in-out infinite alternate, mgFireflyPulse 2.2s ease-in-out infinite alternate;"></div>
</div>`;
      cssEffects += `
@keyframes mgFireflyFly { 0% { transform: translate(0, 0); } 50% { transform: translate(30px, -25px); } 100% { transform: translate(-20px, 35px); } }
@keyframes mgFireflyPulse { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 0.9; transform: scale(1.4); } }
`;
      break;

    case 'warp-stars':
      bgHtml = `<canvas id="mg-fx-canvas-warp" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#030008;"></canvas>`;
      jsEffects = `(function() {
  var canvas = document.getElementById('mg-fx-canvas-warp'); if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth || document.documentElement.clientWidth || 360; canvas.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var numStars = 80; var stars = [];
  for (var s = 0; s < numStars; s++) {
    stars.push({ x: Math.random() * canvas.width - canvas.width / 2, y: Math.random() * canvas.height - canvas.height / 2, z: Math.random() * canvas.width });
  }
  var starSpeed = ${speed === 'fast' ? 18 : speed === 'slow' ? 4 : 9};
  function drawStars() {
    ctx.fillStyle = 'rgba(3, 0, 8, 0.25)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    var cx = canvas.width / 2, cy = canvas.height / 2;
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i]; st.z -= starSpeed;
      if (st.z <= 0) { st.z = canvas.width; st.x = Math.random() * canvas.width - cx; st.y = Math.random() * canvas.height - cy; }
      var k = 128 / st.z; var px = st.x * k + cx; var py = st.y * k + cy;
      if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
        var size = (1 - st.z / canvas.width) * 3 + 0.5;
        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fillStyle = '${brand}'; ctx.fill();
      }
    }
    requestAnimationFrame(drawStars);
  }
  drawStars();
})();`;
      break;

    case 'wave-mesh':
      bgHtml = `<canvas id="mg-fx-canvas-waves" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#050714;"></canvas>`;
      jsEffects = `(function() {
  var canvas = document.getElementById('mg-fx-canvas-waves'); if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth || document.documentElement.clientWidth || 360; canvas.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var step = 0; var wvSpeed = ${speed === 'fast' ? 0.04 : speed === 'slow' ? 0.01 : 0.02};
  function drawWaves() {
    ctx.fillStyle = 'rgba(5, 7, 20, 0.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height); step += wvSpeed;
    var colors = ['${brand}', '${green}', '${blue}'];
    for (var w = 0; w < 3; w++) {
      ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = colors[w]; ctx.globalAlpha = 0.6 - w * 0.15;
      for (var x = 0; x < canvas.width; x += 10) {
        var y = Math.sin(x * 0.006 + step + w) * 40 + (canvas.height * 0.65 + w * 30);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; requestAnimationFrame(drawWaves);
  }
  drawWaves();
})();`;
      break;

    case 'particles':
    default:
      if (bgEffect === 'none') {
        return { html: '', css: '', js: '' };
      }
      bgHtml = `<canvas id="mg-fx-canvas-particles" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; background:#080914;"></canvas>`;
      jsEffects = `(function() {
  var canvas = document.getElementById('mg-fx-canvas-particles'); if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth || document.documentElement.clientWidth || 360; canvas.height = window.innerHeight || document.documentElement.clientHeight || 640; }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();
  var count = Math.min(60, Math.floor((canvas.width || 360) / 18));
  var particles = [];
  var spdMult = ${speed === 'fast' ? '2.5' : speed === 'slow' ? '0.8' : '1.6'};
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * spdMult,
      vy: (Math.random() - 0.5) * spdMult,
      radius: Math.random() * 2.5 + 1
    });
  }
  function draw() {
    if (canvas.width <= 0 || canvas.height <= 0) resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1; if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = '${brand}'; ctx.fill();
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j]; var dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          ctx.beginPath(); ctx.strokeStyle = '${brand}'; ctx.globalAlpha = 1 - dist / 110; ctx.lineWidth = 0.6;
          ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); ctx.globalAlpha = 1;
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
