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
