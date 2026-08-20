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
    if (!canvas || effect === 'none') return;
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

    const speedMult = speed === 'fast' ? 2 : speed === 'slow' ? 0.5 : 1;

    if (effect === 'aurora') {
      let t = 0;
      const loop = () => {
        ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x += 10) {
            const y = canvas.height * 0.5 + Math.sin(x * 0.005 + t + i) * 100 * Math.sin(t * 0.5);
            i === 0 ? ctx.lineTo(x, y) : ctx.lineTo(x, y + i * 50);
          }
          ctx.strokeStyle = i === 0 ? brand : i === 1 ? green : blue;
          ctx.stroke();
        }
        t += 0.02 * speedMult;
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'cyber-grid') {
      let offset = 0;
      const loop = () => {
        ctx.fillStyle = '#050714'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = brand;
        const spacing = 50;
        for (let i = 0; i < canvas.width; i += spacing) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = offset % spacing; i < canvas.height; i += spacing) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }
        offset += 2 * speedMult;
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'floating-orbs') {
      const orbs = Array.from({ length: 5 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 50 + 20, vx: (Math.random() - 0.5) * 2 * speedMult, vy: (Math.random() - 0.5) * 2 * speedMult }));
      const loop = () => {
        ctx.fillStyle = 'rgba(5,7,20,0.1)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        orbs.forEach(o => {
          o.x += o.vx; o.y += o.vy;
          if (o.x < 0 || o.x > canvas.width) o.vx *= -1;
          if (o.y < 0 || o.y > canvas.height) o.vy *= -1;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
          ctx.fillStyle = brand + '22'; ctx.fill();
        });
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'fireflies') {
      const flies = Array.from({ length: 20 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 }));
      const loop = () => {
        ctx.fillStyle = 'rgba(5,7,20,0.1)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        flies.forEach(f => {
          f.x += (Math.random() - 0.5) * 2 * speedMult; f.y += (Math.random() - 0.5) * 2 * speedMult;
          ctx.fillStyle = green;
          ctx.fillRect(f.x, f.y, f.size, f.size);
        });
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'cardio-pulse' || effect === 'academia') {
      const sparks: any[] = [];
      let step = 0;
      const addSpk = (px: number, py: number) => {
        for (let i = 0; i < 6; i++) sparks.push({ x: px, y: py, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 1 });
      };
      const loop = () => {
        ctx.fillStyle = 'rgba(5,7,20,0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        step += speedMult * 2.5;
        const cx = (step * 3) % canvas.width;
        let cy = canvas.height * 0.55;
        const mod = (step * 3) % 220;
        if (mod > 60 && mod < 75) cy -= 35;
        else if (mod >= 75 && mod < 85) cy += 20;
        else if (mod >= 85 && mod < 100) { cy -= 110; if (mod === 90) addSpk(cx, cy); }
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
      for (let i = 0; i < 35; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.8, vy: -(Math.random() * 0.6 + 0.2) * speedMult });
      let angle = 0;
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        angle += 0.003 * speedMult;
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
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad; ctx.fill(); ctx.restore();
        }
        for (let s = 0; s < stars.length; s++) {
          const st = stars[s]; st.y += st.vy; if (st.y < 0) { st.y = canvas.height; st.x = Math.random() * canvas.width; }
          ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fillStyle = brand || '#f59e0b'; ctx.fill();
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'medical-vital' || effect === 'clinica') {
      const cells: any[] = [];
      for (let i = 0; i < 20; i++) cells.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 16 + 8, vx: (Math.random() - 0.5) * 0.4, vy: -(Math.random() * 0.5 + 0.2) * speedMult });
      const loop = () => {
        ctx.fillStyle = 'rgba(5, 7, 20, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      for (let i = 0; i < 45; i++) embers.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2.8 + 1, vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 1) * speedMult, alpha: Math.random() });
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < embers.length; i++) {
          const e = embers[i]; e.x += e.vx; e.y += e.vy; e.alpha -= 0.003;
          if (e.y < -10 || e.alpha <= 0) { e.y = canvas.height + 10; e.x = Math.random() * canvas.width; e.alpha = 1; }
          ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fillStyle = e.r > 2 ? (brand || '#e11d48') : (green || '#f59e0b');
          ctx.fill();
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'luxury-bubbles' || effect === 'hotel') {
      // 1. Champagne & Hotel VIP: Rising flute effervescence with golden diamond star bursts
      const bubs = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3.5 + 1.2,
        vy: -(Math.random() * 1.6 + 0.6) * speedMult,
        wobble: Math.random() * Math.PI * 2,
        sparkle: Math.random() > 0.65
      }));
      let t = 0;
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.03 * speedMult;
        const grad = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
        grad.addColorStop(0, 'rgba(217, 119, 6, 0)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);

        for (let i = 0; i < bubs.length; i++) {
          const b = bubs[i];
          b.y += b.vy;
          b.wobble += 0.04 * speedMult;
          const wx = b.x + Math.sin(b.wobble) * 2;
          if (b.y < -15) { b.y = canvas.height + 15; b.x = Math.random() * canvas.width; }
          ctx.beginPath();
          ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
          ctx.lineWidth = 1;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(wx - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();

          if (b.sparkle && (i + Math.floor(t * 3)) % 7 === 0) {
            const sz = b.r * 2.2;
            ctx.beginPath();
            ctx.moveTo(wx, b.y - sz);
            ctx.lineTo(wx + sz * 0.25, b.y);
            ctx.lineTo(wx + sz, b.y);
            ctx.lineTo(wx + sz * 0.25, b.y);
            ctx.lineTo(wx, b.y + sz);
            ctx.lineTo(wx - sz * 0.25, b.y);
            ctx.lineTo(wx - sz, b.y);
            ctx.lineTo(wx - sz * 0.25, b.y);
            ctx.closePath();
            ctx.fillStyle = '#fef08a';
            ctx.fill();
          }
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'stadium-lights' || effect === 'futebol_copa' || effect === 'fifa-26.otf') {
      // 2. Holofotes de Estádio: 4 volumetric sweeping floodlight towers + crowd flashbulbs
      let angle = 0;
      const dust = Array.from({ length: 35 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.4 * speedMult,
        vy: (Math.random() - 0.5) * 0.4 * speedMult
      }));
      let flashPos = { x: 0, y: 0, active: false, rad: 0 };
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        angle += 0.012 * speedMult;

        const turfGrad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
        turfGrad.addColorStop(0, 'rgba(22, 163, 74, 0)');
        turfGrad.addColorStop(1, 'rgba(22, 163, 74, 0.12)');
        ctx.fillStyle = turfGrad;
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

        const towers = [
          { x: 0, y: 0, a: Math.sin(angle * 0.8) * 0.35 + 0.75, len: canvas.height * 1.8, col: 'rgba(34, 197, 94, 0.25)' },
          { x: canvas.width, y: 0, a: -Math.cos(angle * 0.7) * 0.35 - 0.75, len: canvas.height * 1.8, col: 'rgba(56, 189, 248, 0.25)' },
          { x: canvas.width * 0.25, y: 0, a: Math.cos(angle * 0.9) * 0.25 + Math.PI * 0.5, len: canvas.height * 1.5, col: 'rgba(255, 255, 255, 0.18)' },
          { x: canvas.width * 0.75, y: 0, a: -Math.sin(angle * 0.9) * 0.25 + Math.PI * 0.5, len: canvas.height * 1.5, col: 'rgba(34, 197, 94, 0.2)' }
        ];

        towers.forEach(t => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          const endX = t.x + Math.cos(t.a) * t.len;
          const endY = t.y + Math.sin(t.a) * t.len;
          const spread = 120;
          ctx.lineTo(endX - spread, endY);
          ctx.lineTo(endX + spread, endY);
          ctx.closePath();
          const grad = ctx.createLinearGradient(t.x, t.y, endX, endY);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
          grad.addColorStop(0.2, t.col);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        });

        for (let i = 0; i < dust.length; i++) {
          const d = dust[i];
          d.x += d.vx; d.y += d.vy;
          if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
          if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        }

        if (!flashPos.active && Math.random() < 0.04 * speedMult) {
          flashPos = { x: Math.random() * canvas.width, y: canvas.height * (0.55 + Math.random() * 0.4), active: true, rad: 2 };
        }
        if (flashPos.active) {
          flashPos.rad += 3 * speedMult;
          ctx.beginPath();
          ctx.arc(flashPos.x, flashPos.y, flashPos.rad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - flashPos.rad / 25)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          if (flashPos.rad > 25) flashPos.active = false;
        }

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'digital-ocean' || effect === 'Digital_Ocean') {
      // 3. Ciber Oceano & Cloud: 3D perspective terrain mesh + ascending telemetry beacons
      let t = 0;
      const beacons = Array.from({ length: 14 }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height,
        vy: (Math.random() * 3 + 2) * speedMult,
        len: Math.random() * 50 + 30
      }));
      const loop = () => {
        ctx.fillStyle = 'rgba(1, 5, 14, 0.28)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        t += 0.025 * speedMult;

        const horizonY = canvas.height * 0.42;
        const numGridZ = 16;
        for (let gz = 1; gz <= numGridZ; gz++) {
          const zNorm = gz / numGridZ;
          const yBase = horizonY + (canvas.height - horizonY) * (zNorm * zNorm);
          const alpha = zNorm * 0.6;
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.beginPath();
          for (let gx = 0; gx <= canvas.width; gx += 16) {
            const wave = Math.sin(gx * 0.008 + t * 2 + gz * 0.5) * Math.cos(gx * 0.004 - t) * (18 * zNorm);
            const y = yBase + wave;
            if (gx === 0) ctx.moveTo(gx, y); else ctx.lineTo(gx, y);
          }
          ctx.stroke();
        }

        for (let b = 0; b < beacons.length; b++) {
          const bc = beacons[b];
          bc.y -= bc.vy;
          if (bc.y < -60) { bc.y = canvas.height + 20; bc.x = Math.random() * canvas.width; }
          const bGrad = ctx.createLinearGradient(bc.x, bc.y + bc.len, bc.x, bc.y);
          bGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
          bGrad.addColorStop(1, '#38bdf8');
          ctx.beginPath();
          ctx.moveTo(bc.x, bc.y + bc.len);
          ctx.lineTo(bc.x, bc.y);
          ctx.strokeStyle = bGrad;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(bc.x, bc.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'cinema-marquee' || effect === 'Popcorn') {
      // 4. Cinema & Marquee Retrô: 4-sided incandescent chasing bulbs + vintage projector beam
      let frame = 0;
      const motes = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3 * speedMult,
        vy: (Math.random() * 0.4 + 0.2) * speedMult
      }));
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame += speedMult;

        const pApexX = canvas.width / 2;
        const flicker = 0.14 + Math.sin(frame * 0.15) * 0.03 + Math.random() * 0.02;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pApexX, 0);
        ctx.lineTo(pApexX - canvas.width * 0.45, canvas.height);
        ctx.lineTo(pApexX + canvas.width * 0.45, canvas.height);
        ctx.closePath();
        const pGrad = ctx.createRadialGradient(pApexX, 0, 10, pApexX, canvas.height * 0.6, canvas.height * 0.8);
        pGrad.addColorStop(0, `rgba(254, 240, 138, ${flicker * 1.8})`);
        pGrad.addColorStop(0.5, `rgba(250, 204, 21, ${flicker * 0.6})`);
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.restore();

        for (let m = 0; m < motes.length; m++) {
          const mo = motes[m];
          mo.x += mo.vx; mo.y += mo.vy;
          if (mo.y > canvas.height) { mo.y = 0; mo.x = Math.random() * canvas.width; }
          ctx.beginPath();
          ctx.arc(mo.x, mo.y, mo.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
          ctx.fill();
        }

        const bulbSpacing = 28;
        const bulbRadius = 3.5;
        const bulbPhase = Math.floor(frame / 6);
        const drawBulb = (bx: number, by: number, idx: number) => {
          const isOn = (idx + bulbPhase) % 3 === 0;
          ctx.beginPath();
          ctx.arc(bx, by, bulbRadius, 0, Math.PI * 2);
          if (isOn) {
            ctx.fillStyle = '#fde047';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#facc15';
          } else {
            ctx.fillStyle = '#451a03';
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        };

        let bIdx = 0;
        for (let x = 14; x < canvas.width - 14; x += bulbSpacing) {
          drawBulb(x, 14, bIdx++);
          drawBulb(x, canvas.height - 14, bIdx++);
        }
        for (let y = 14; y < canvas.height - 14; y += bulbSpacing) {
          drawBulb(14, y, bIdx++);
          drawBulb(canvas.width - 14, y, bIdx++);
        }

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'chalk-constellation' || effect === 'Escuela' || effect === 'Greenboard') {
      // 5. Constelação Acadêmica: Sacred geometry astrolabe blueprint + orbiting electron paths
      let rot = 0;
      const electrons = [
        { a: 0, speed: 0.03, rx: 140, ry: 60, tilt: 0 },
        { a: 1.2, speed: -0.025, rx: 170, ry: 75, tilt: Math.PI / 3 },
        { a: 2.4, speed: 0.02, rx: 200, ry: 90, tilt: -Math.PI / 3 }
      ];
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rot += 0.005 * speedMult;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.save();
        ctx.translate(cx, cy);

        ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        [80, 130, 190, 260].forEach(r => {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.28)';
        ctx.save();
        ctx.rotate(rot);
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3;
          const px = Math.cos(a) * 130;
          const py = Math.sin(a) * 130;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        for (let i = 0; i < 24; i++) {
          const ta = (i * Math.PI * 2) / 24;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ta) * 185, Math.sin(ta) * 185);
          ctx.lineTo(Math.cos(ta) * 195, Math.sin(ta) * 195);
          ctx.stroke();
        }
        ctx.restore();

        electrons.forEach(el => {
          el.a += el.speed * speedMult;
          ctx.save();
          ctx.rotate(el.tilt);
          ctx.beginPath();
          ctx.ellipse(0, 0, el.rx, el.ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.15)';
          ctx.stroke();

          const ex = Math.cos(el.a) * el.rx;
          const ey = Math.sin(el.a) * el.ry;
          ctx.beginPath();
          ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#6ee7b7';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#6ee7b7';
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        });

        ctx.restore();
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'traffic-radar' || effect === 'Traffic-Control') {
      // 6. Radar Tático & NOC: 360° military sonar sweep + network target telemetry
      let angle = 0;
      const targets = [
        { dist: 90, ang: 0.8, ping: 0, label: 'NOC-SP 12ms' },
        { dist: 160, ang: 2.3, ping: 0, label: 'DNS-01 4ms' },
        { dist: 220, ang: 4.1, ping: 0, label: 'GATEWAY 99%' },
        { dist: 130, ang: 5.4, ping: 0, label: 'BGP-PEER' }
      ];
      const loop = () => {
        ctx.fillStyle = 'rgba(2, 6, 8, 0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        angle = (angle + 0.03 * speedMult) % (Math.PI * 2);

        ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.lineWidth = 1;
        [60, 120, 180, 240].forEach(r => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(cx - 260, cy); ctx.lineTo(cx + 260, cy);
        ctx.moveTo(cx, cy - 260); ctx.lineTo(cx, cy + 260);
        ctx.stroke();

        const sweepArc = 0.5;
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260);
        grad.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
        grad.addColorStop(1, 'rgba(34, 197, 94, 0.05)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 260, angle - sweepArc, angle, false);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 260, cy + Math.sin(angle) * 260);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#22c55e';
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        targets.forEach(tgt => {
          const tx = cx + Math.cos(tgt.ang) * tgt.dist;
          const ty = cy + Math.sin(tgt.ang) * tgt.dist;
          const angDiff = Math.abs(angle - tgt.ang);
          if (angDiff < 0.05) tgt.ping = 1;

          if (tgt.ping > 0) {
            tgt.ping -= 0.015 * speedMult;
            const ripR = (1 - tgt.ping) * 28;
            ctx.beginPath();
            ctx.arc(tx, ty, ripR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34, 197, 94, ${tgt.ping})`;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(tx, ty, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.font = '9px monospace';
            ctx.fillStyle = `rgba(34, 197, 94, ${tgt.ping})`;
            ctx.fillText(tgt.label, tx + 8, ty - 4);
          } else {
            ctx.beginPath();
            ctx.arc(tx, ty, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
            ctx.fill();
          }
        });

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'hex-shield' || effect === 'shield') {
      // 7. Escudo Hex Cibersegurança: Sci-fi honeycomb energy barrier with center shockwaves
      let waveR = 0;
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        waveR = (waveR + 2.5 * speedMult) % (Math.hypot(canvas.width, canvas.height) * 0.6);

        const r = 28;
        const w = r * Math.sqrt(3);
        const h = r * 1.5;

        const drawHex = (hx: number, hy: number, intensity: number) => {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const px = hx + r * Math.cos(a);
            const py = hy + r * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          if (intensity > 0.1) {
            ctx.fillStyle = `rgba(6, 182, 212, ${intensity * 0.35})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(56, 189, 248, ${intensity * 0.9})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          } else {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        };

        for (let y = -20; y < canvas.height + 40; y += h) {
          const row = Math.floor(y / h);
          for (let x = -20; x < canvas.width + 40; x += w) {
            const offX = (row % 2) * (w / 2);
            const hexX = x + offX;
            const hexY = y;
            const d = Math.hypot(hexX - cx, hexY - cy);
            const waveDist = Math.abs(d - waveR);
            const intensity = waveDist < 70 ? (1 - waveDist / 70) : 0;
            drawHex(hexX, hexY, intensity);
          }
        }

        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
        ctx.stroke();
        ctx.shadowBlur = 0;

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'lock-crypto' || effect === 'wifi_lock') {
      // 8. Criptografia WPA3: Counter-rotating cryptographic Enigma hash dials & central lock core
      let a1 = 0, a2 = 0, a3 = 0;
      const hexChars = ['0x4F', 'AES', '9A', 'WPA3', '7C', 'SHA2', 'E1', 'KEY', '3B', '256'];
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        a1 += 0.008 * speedMult;
        a2 -= 0.012 * speedMult;
        a3 += 0.006 * speedMult;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a1);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 220, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '9px monospace';
        ctx.fillStyle = '#818cf8';
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI * 2) / 12;
          ctx.save();
          ctx.rotate(a);
          ctx.fillText(hexChars[i % hexChars.length], 205, 3);
          ctx.restore();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 1.6);
        ctx.stroke();
        for (let i = 0; i < 20; i++) {
          const a = (i * Math.PI * 2) / 20;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 155, Math.sin(a) * 155);
          ctx.lineTo(Math.cos(a) * 165, Math.sin(a) * 165);
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a3);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 1.3);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.arc(0, -10, 14, Math.PI, 0);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#6366f1';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#6366f1';
        ctx.fillRect(-16, -4, 32, 26);
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 5, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillRect(-1.5, 6, 3, 7);
        ctx.restore();

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'fiber-optic' || effect === 'LinkingNet' || effect === 'Launcher') {
      // 9. Fótons Fibra Óptica: Curved glass fiber Bezier conduits with rocketing photon packets
      const fibers = [
        { p0: { x: -50, y: 0.2 }, p1: { x: 0.3, y: 0.1 }, p2: { x: 0.7, y: 0.4 }, p3: { x: 1.1, y: 0.35 }, col: '#00f0ff' },
        { p0: { x: -50, y: 0.45 }, p1: { x: 0.4, y: 0.6 }, p2: { x: 0.6, y: 0.3 }, p3: { x: 1.1, y: 0.55 }, col: '#00ff88' },
        { p0: { x: -50, y: 0.7 }, p1: { x: 0.2, y: 0.85 }, p2: { x: 0.8, y: 0.75 }, p3: { x: 1.1, y: 0.85 }, col: '#c084fc' },
        { p0: { x: -50, y: 0.85 }, p1: { x: 0.5, y: 0.7 }, p2: { x: 0.7, y: 0.95 }, p3: { x: 1.1, y: 0.7 }, col: '#00f0ff' }
      ];
      const photons = Array.from({ length: 18 }, () => ({
        fiberIdx: Math.floor(Math.random() * fibers.length),
        t: Math.random(),
        speed: (Math.random() * 0.008 + 0.006) * speedMult
      }));
      const sparks: any[] = [];
      const getBezierPt = (p0: any, p1: any, p2: any, p3: any, t: number, w: number, h: number) => {
        const cx0 = p0.x < 0 ? p0.x : p0.x * w; const cy0 = p0.y * h;
        const cx1 = p1.x * w; const cy1 = p1.y * h;
        const cx2 = p2.x * w; const cy2 = p2.y * h;
        const cx3 = p3.x * w; const cy3 = p3.y * h;
        const mt = 1 - t;
        const x = mt*mt*mt*cx0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*cx3;
        const y = mt*mt*mt*cy0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*cy3;
        return { x, y };
      };
      const loop = () => {
        ctx.fillStyle = 'rgba(4, 2, 10, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        fibers.forEach(f => {
          ctx.beginPath();
          const p0x = f.p0.x < 0 ? f.p0.x : f.p0.x * canvas.width;
          ctx.moveTo(p0x, f.p0.y * canvas.height);
          ctx.bezierCurveTo(
            f.p1.x * canvas.width, f.p1.y * canvas.height,
            f.p2.x * canvas.width, f.p2.y * canvas.height,
            f.p3.x * canvas.width, f.p3.y * canvas.height
          );
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        });

        photons.forEach(pt => {
          pt.t += pt.speed;
          if (pt.t >= 1) {
            pt.t = 0;
            const fb = fibers[pt.fiberIdx];
            for (let s = 0; s < 5; s++) {
              sparks.push({ x: canvas.width, y: fb.p3.y * canvas.height, vx: Math.random() * 4 + 2, vy: (Math.random() - 0.5) * 4, life: 1, col: fb.col });
            }
          }
          const fb = fibers[pt.fiberIdx];
          const pos = getBezierPt(fb.p0, fb.p1, fb.p2, fb.p3, pt.t, canvas.width, canvas.height);
          const trailPos = getBezierPt(fb.p0, fb.p1, fb.p2, fb.p3, Math.max(0, pt.t - 0.04), canvas.width, canvas.height);

          ctx.beginPath();
          ctx.moveTo(trailPos.x, trailPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = fb.col;
          ctx.lineWidth = 3.5;
          ctx.shadowBlur = 14;
          ctx.shadowColor = fb.col;
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.04;
          if (sp.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 1.5 * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = sp.col;
          ctx.fill();
        }

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'synthwave-arcade' || effect === 'UserKeys') {
      // 10. Synthwave 80s Sunset: Outrun sliced horizon sun + perspective 3D grid & mountain silhouettes
      let gridOffset = 0;
      const stars = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.5),
        r: Math.random() * 1.5 + 0.5
      }));
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gridOffset = (gridOffset + 2 * speedMult) % 36;
        const hy = canvas.height * 0.52;
        const cx = canvas.width / 2;

        stars.forEach(st => {
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fillStyle = '#fdf4ff';
          ctx.fill();
        });

        const sunR = Math.min(canvas.width * 0.26, 120);
        const sunY = hy - 15;
        const sunGrad = ctx.createLinearGradient(cx, sunY - sunR, cx, sunY + sunR);
        sunGrad.addColorStop(0, '#fde047');
        sunGrad.addColorStop(0.5, '#f43f5e');
        sunGrad.addColorStop(1, '#8b5cf6');

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, sunY, sunR, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#f43f5e';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#090114';
        for (let i = 0; i < 7; i++) {
          const sliceY = sunY + (i * 12) + 2;
          const sliceH = (i + 1) * 1.8;
          ctx.fillRect(cx - sunR - 10, sliceY, (sunR + 10) * 2, sliceH);
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(0, hy);
        ctx.lineTo(canvas.width * 0.15, hy - 45);
        ctx.lineTo(canvas.width * 0.3, hy);
        ctx.lineTo(canvas.width * 0.7, hy);
        ctx.lineTo(canvas.width * 0.85, hy - 55);
        ctx.lineTo(canvas.width, hy);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = '#06010d';
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
        ctx.lineWidth = 1;
        for (let x = -canvas.width * 0.5; x <= canvas.width * 1.5; x += 48) {
          ctx.beginPath();
          ctx.moveTo(cx, hy);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = hy + gridOffset; y < canvas.height; y += 24) {
          const alpha = (y - hy) / (canvas.height - hy);
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'barrio-sunset' || effect === 'WifiElBarrio' || effect === 'Wifi El Barrio') {
      // 11. Sunset Urbano Bokeh: Dreamy multi-layer optical lens bokeh + warm sunset light leaks
      const bokehs = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 40 + 15,
        vy: -(Math.random() * 0.5 + 0.2) * speedMult,
        vx: (Math.random() - 0.5) * 0.3 * speedMult,
        col: ['rgba(234, 88, 12, 0.25)', 'rgba(249, 115, 22, 0.2)', 'rgba(225, 29, 72, 0.2)', 'rgba(217, 119, 6, 0.25)'][Math.floor(Math.random() * 4)],
        sides: Math.random() > 0.4 ? 7 : 0
      }));
      let leakT = 0;
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        leakT += 0.015 * speedMult;

        const leakX = canvas.width * (0.3 + Math.sin(leakT) * 0.2);
        const leakGrad = ctx.createRadialGradient(leakX, 0, 50, leakX, canvas.height * 0.7, canvas.width * 0.8);
        leakGrad.addColorStop(0, 'rgba(249, 115, 22, 0.18)');
        leakGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.08)');
        leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = leakGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bokehs.forEach(b => {
          b.y += b.vy; b.x += b.vx;
          if (b.y < -50) { b.y = canvas.height + 50; b.x = Math.random() * canvas.width; }
          if (b.x < -50) b.x = canvas.width + 50; if (b.x > canvas.width + 50) b.x = -50;

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.beginPath();
          if (b.sides > 0) {
            for (let i = 0; i < b.sides; i++) {
              const a = (i * Math.PI * 2) / b.sides;
              const px = Math.cos(a) * b.r;
              const py = Math.sin(a) * b.r;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
          } else {
            ctx.arc(0, 0, b.r, 0, Math.PI * 2);
          }
          ctx.fillStyle = b.col;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        });

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'community-bubbles' || effect === 'WiFi_Community') {
      // 12. Bolhas Comunitárias: Realistic thin-film iridescent soap bubbles + social bonding arcs
      const sBubbles = Array.from({ length: 22 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 22 + 10,
        vx: (Math.random() - 0.5) * 1.2 * speedMult,
        vy: -(Math.random() * 0.8 + 0.3) * speedMult,
        wobble: Math.random() * Math.PI * 2
      }));
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < sBubbles.length; i++) {
          for (let j = i + 1; j < sBubbles.length; j++) {
            const b1 = sBubbles[i]; const b2 = sBubbles[j];
            const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
            if (dist < 140) {
              ctx.beginPath();
              ctx.moveTo(b1.x, b1.y);
              ctx.lineTo(b2.x, b2.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 140) * 0.35})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        sBubbles.forEach(b => {
          b.x += b.vx; b.y += b.vy;
          b.wobble += 0.03 * speedMult;
          if (b.y < -40) { b.y = canvas.height + 40; b.x = Math.random() * canvas.width; }
          if (b.x < -30 || b.x > canvas.width + 30) b.vx *= -1;

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const sheen = ctx.createLinearGradient(b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r);
          sheen.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
          sheen.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
          sheen.addColorStop(1, 'rgba(234, 179, 8, 0.15)');
          ctx.fillStyle = sheen;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();
        });

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'workspace-ribbons' || effect === 'workspace') {
      // 13. Fitas Minimal Coworking: Architectural 3D satin parametric ribbons
      let t = 0;
      const loop = () => {
        ctx.fillStyle = 'rgba(4, 7, 13, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        t += 0.015 * speedMult;

        const ribbons = [
          { cy: canvas.height * 0.35, amp: 65, freq: 0.003, col1: '#0d9488', col2: '#2563eb', thick: 35 },
          { cy: canvas.height * 0.55, amp: 80, freq: 0.0025, col1: '#2563eb', col2: '#6366f1', thick: 45 },
          { cy: canvas.height * 0.75, amp: 55, freq: 0.0035, col1: '#0284c7', col2: '#0d9488', thick: 30 }
        ];

        ribbons.forEach((rb, idx) => {
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 15) {
            const y = rb.cy + Math.sin(x * rb.freq + t + idx * 1.2) * rb.amp + Math.cos(x * 0.001 - t * 0.8) * 25;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          for (let x = canvas.width; x >= 0; x -= 15) {
            const y = rb.cy + Math.sin(x * rb.freq + t + idx * 1.2) * rb.amp + Math.cos(x * 0.001 - t * 0.8) * 25 + rb.thick;
            ctx.lineTo(x, y);
          }
          ctx.closePath();

          const rGrad = ctx.createLinearGradient(0, rb.cy - rb.amp, canvas.width, rb.cy + rb.amp);
          rGrad.addColorStop(0, rb.col1);
          rGrad.addColorStop(1, rb.col2);
          ctx.fillStyle = rGrad;
          ctx.globalAlpha = 0.22;
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.strokeStyle = rb.col1;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'sunset-glass' || effect === 'Window-orange-login') {
      // 14. Lounge Sunset Âmbar: Fluid whiskey caustic light patterns + effervescent cocktail fizz
      let t = 0;
      const fizz = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8,
        vy: -(Math.random() * 0.8 + 0.4) * speedMult
      }));
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.018 * speedMult;

        const numCaustics = 5;
        for (let c = 0; c < numCaustics; c++) {
          const cx = (canvas.width / 2) + Math.sin(t * 0.7 + c * 1.3) * (canvas.width * 0.35);
          const cy = (canvas.height / 2) + Math.cos(t * 0.5 + c * 1.1) * (canvas.height * 0.3);
          const r = Math.min(canvas.width, canvas.height) * (0.35 + c * 0.08);

          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
          grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.12)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 20) {
            const y = (canvas.height * 0.5) + Math.sin(x * 0.005 + t * 2 + i) * 60 + Math.cos(x * 0.008 - t) * 40;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        fizz.forEach(fz => {
          fz.y += fz.vy;
          if (fz.y < -10) { fz.y = canvas.height + 10; fz.x = Math.random() * canvas.width; }
          ctx.beginPath();
          ctx.arc(fz.x, fz.y, fz.r, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
        });

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'nougat-fluid' || effect === 'Nougat') {
      // 15. Material Flow Orgânico: Organic lava metaballs with fluid coalescence physics
      const blobs = Array.from({ length: 11 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 45 + 30,
        vx: (Math.random() - 0.5) * 1.5 * speedMult,
        vy: (Math.random() - 0.5) * 1.5 * speedMult,
        col: ['#34d399', '#22d3ee', '#a78bfa', '#fb7185'][i % 4]
      }));
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        blobs.forEach(b => {
          b.x += b.vx; b.y += b.vy;
          if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
          if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -1;
        });

        for (let i = 0; i < blobs.length; i++) {
          for (let j = i + 1; j < blobs.length; j++) {
            const b1 = blobs[i]; const b2 = blobs[j];
            const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
            const maxDist = b1.r + b2.r + 55;
            if (dist < maxDist) {
              const midX = (b1.x + b2.x) / 2;
              const midY = (b1.y + b2.y) / 2;
              const bridgeR = ((maxDist - dist) / maxDist) * 22;
              ctx.beginPath();
              ctx.arc(midX, midY, bridgeR, 0, Math.PI * 2);
              ctx.fillStyle = b1.col;
              ctx.globalAlpha = 0.35;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }

        blobs.forEach(b => {
          const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
          grad.addColorStop(0, b.col);
          grad.addColorStop(0.8, b.col);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.45;
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.beginPath();
          ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();
        });

        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'prisma-holo' || effect === 'Random') {
      // 16. Prisma Holográfico Laser: Optical crystal prism splitting white laser into Newton rainbow fan
      let prismAngle = 0;
      const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        prismAngle += 0.015 * speedMult;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, cy - 80);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        rainbowColors.forEach((col, idx) => {
          const fanAngle = 0.15 + (idx * 0.065) + Math.sin(prismAngle) * 0.05;
          const endX = cx + Math.cos(fanAngle) * canvas.width;
          const endY = cy + Math.sin(fanAngle) * canvas.width;

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = col;
          ctx.lineWidth = 3.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = col;
          ctx.stroke();
        });
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(prismAngle);
        const pSize = 55;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
          const px = Math.cos(a) * pSize;
          const py = Math.sin(a) * pSize;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
          const px = Math.cos(a) * pSize;
          const py = Math.sin(a) * pSize;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = rainbowColors[i * 2];
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();

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
          else ypos[ind] = y + (18 * speedMult);
        });
      }, 50 / speedMult);
    } else if (effect === 'warp-stars') {
      const numStars = 70; const stars: any[] = [];
      for (let s = 0; s < numStars; s++) stars.push({ x: Math.random() * canvas.width - canvas.width / 2, y: Math.random() * canvas.height - canvas.height / 2, z: Math.random() * canvas.width });
      const starSpeed = 9 * speedMult;
      const loop = () => {
        ctx.fillStyle = 'rgba(3, 0, 8, 0.25)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2; const cy = canvas.height / 2;
        for (let i = 0; i < stars.length; i++) {
          const st = stars[i]; st.z -= starSpeed;
          if (st.z <= 0) { st.z = canvas.width; st.x = Math.random() * canvas.width - cx; st.y = Math.random() * canvas.height - cy; }
          const k = 128 / st.z; const px = st.x * k + cx; const py = st.y * k + cy;
          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const size = (1 - st.z / canvas.width) * 3 + 0.5;
            ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fillStyle = brand || '#a855f7'; ctx.fill();
          }
        }
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else if (effect === 'wave-mesh') {
      let step = 0;
      const wvSpeed = 0.02 * speedMult;
      const loop = () => {
        ctx.fillStyle = 'rgba(5, 7, 20, 0.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height); step += wvSpeed;
        for (let w = 0; w < 3; w++) {
          ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = w === 0 ? brand : w === 1 ? green : blue;
          ctx.globalAlpha = 0.6 - w * 0.15;
          for (let x = 0; x < canvas.width; x += 10) {
            const y = Math.sin(x * 0.006 + step + w) * 40 + (canvas.height * 0.65 + w * 30);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(loop);
      };
      loop();
    } else {
      // Particles fallback for 'particles' and any unmapped effects
      const count = 40;
      const spd = 0.8 * speedMult;
      const particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * spd, vy: (Math.random() - 0.5) * spd, radius: Math.random() * 2 + 1
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

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: 'transparent' }} />;
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
        background: ${
          (isVideoBg || isImageBg) ? 'transparent' :
          (effects.bgEffect && effects.bgEffect !== 'none') ? (colors.bg || '#080914') :
          'var(--mg-bg)'
        } !important;
        color: var(--mg-ink) !important;
        font-family: var(--mg-font-family) !important;
        min-height: 100vh !important;
        /* Reset root layout Tailwind classes that break portal layout */
        display: block !important;
        flex-direction: unset !important;
        position: static !important;
      }

      html {
        background: ${
          (isVideoBg || isImageBg) ? 'transparent' :
          (effects.bgEffect && effects.bgEffect !== 'none') ? (colors.bg || '#080914') :
          'var(--mg-bg)'
        } !important;
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

      {/* Animated Visual Effects Layers — all rendered via LiveCanvasEffect canvas */}
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

      {effects.bgEffect && effects.bgEffect !== 'none' && (
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
