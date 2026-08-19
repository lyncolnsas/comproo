"use client";

import { useEffect, useState } from 'react';
import RouterOffline from '@/components/RouterOffline';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      time: string;
      rx: number;
      tx: number;
    };
  }>;
}

const formatBps = (bits: number) => {
  if (bits >= 1000000) return (bits / 1000000).toFixed(2) + ' Mbps';
  if (bits >= 1000) return (bits / 1000).toFixed(2) + ' kbps';
  return bits + ' bps';
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const rxVal = payload[0]?.value ?? 0;
    const txVal = payload[1]?.value ?? 0;
    const timeLabel = payload[0]?.payload?.time ?? '';
    return (
      <div className="retro-display p-3 text-xs space-y-1.5 min-w-[150px]">
        <p className="font-bold border-b border-[#0a0a18] pb-1" style={{ color: 'var(--display-dim)' }}>{timeLabel}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>RX:</span>
          </span>
          <strong className="text-emerald-400 font-mono">{formatBps(rxVal)}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
            <span>TX:</span>
          </span>
          <strong className="text-blue-400 font-mono">{formatBps(txVal)}</strong>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrafficMonitor() {
  const [interfaces, setInterfaces] = useState<{ id?: string; name: string; type: string }[]>([]);
  const [selectedIface, setSelectedIface] = useState('');
  const [trafficData, setTrafficData] = useState<{tx: number, rx: number} | null>(null);
  const [history, setHistory] = useState<{time: string, rx: number, tx: number}[]>([]);
  const [notConnected, setNotConnected] = useState(false);
  const [peakRx, setPeakRx] = useState(0);
  const [peakTx, setPeakTx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        const res = await fetch('/api/traffic');
        if (res.status === 401) {
          setNotConnected(true);
          return;
        }
        const data = await res.json();
        if (data.success && data.type === 'interfaces') {
          setInterfaces(data.data);
          if (data.data.length > 0) setSelectedIface(data.data[0].name);
          setNotConnected(false);
        }
      } catch {
        // Ignorar erros na listagem inicial
      }
    };
    fetchInterfaces();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedIface) return;
    
    const fetchTraffic = async () => {
      try {
        const res = await fetch(`/api/traffic?interface=${encodeURIComponent(selectedIface)}`);
        const data = await res.json();
        if (data.success && data.type === 'traffic') {
          const currentRx = Number(data.rx || 0);
          const currentTx = Number(data.tx || 0);

          setTrafficData({ tx: currentTx, rx: currentRx });
          
          setPeakRx(prev => Math.max(prev, currentRx));
          setPeakTx(prev => Math.max(prev, currentTx));

          setHistory(prev => {
            const timeLabel = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const newHistory = [...prev, { time: timeLabel, rx: currentRx, tx: currentTx }];
            if (newHistory.length > 30) newHistory.shift();
            return newHistory;
          });
        }
      } catch {
        // Ignorar erros de polling
      }
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, 2000); // 2 seconds poll
    return () => clearInterval(interval);
  }, [selectedIface]);

  const formatYAxis = (tick: number) => {
    if (tick >= 1000000) return (tick / 1000000).toFixed(1) + ' M';
    if (tick >= 1000) return (tick / 1000).toFixed(0) + ' k';
    return tick + ' b';
  };

  if (notConnected) {
    return (
      <RouterOffline 
        title="Monitor de Tráfego Real-Time" 
        description="Acompanhe o consumo de banda ao vivo de qualquer interface" 
      />
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header as a Rack Module */}
      <header className="retro-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rack-screw" />
          <span className="led led-green animate-led-pulse" />
          <div>
            <div style={{ color: 'var(--led-green)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              ▶ SYSTEM // NETWORK DIAGNOSTICS
            </div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.25rem', fontWeight: 900 }}>
              Monitor de Tráfego Real-Time
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left md:text-right">
            <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              Interface Port
            </label>
            <select 
              value={selectedIface} 
              onChange={(e) => {
                const val = e.target.value;
                setSelectedIface(val);
                setPeakRx(0);
                setPeakTx(0);
                setHistory([]);
              }} 
              className="retro-input py-1.5 px-3 text-xs min-w-[180px]"
            >
              {interfaces.map((i, idx) => (
                <option key={`${i.id || i.name}-${idx}`} value={i.name} className="bg-[#0c0c18] text-[#7dd3fc]">
                  {i.name} ({i.type})
                </option>
              ))}
            </select>
          </div>
          <div className="rack-screw" />
        </div>
      </header>

      {/* Speed Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RX Card (Download) */}
        <div className="retro-card">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="rack-screw" />
            <span className="led led-green animate-led-pulse" />
            <span className="font-mono text-xs font-bold text-slate-450 uppercase tracking-wider">RX_CHANNEL_DOWNLINK</span>
            <div className="ml-auto rack-screw" />
          </div>
          <div className="p-5 space-y-4">
            <div className="retro-display p-5 text-center">
              <span className="block text-[8px] uppercase tracking-widest mb-1" style={{ color: 'var(--display-dim)' }}>CURRENT_BANDWIDTH</span>
              <p className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-400" style={{ textShadow: '0 0 10px rgba(52, 211, 153, 0.3)' }}>
                {trafficData ? formatBps(trafficData.rx) : '0.00 bps'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="retro-stat-box">
                <span className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">Peak RX</span>
                <span className="text-sm font-bold text-[#7dd3fc]">{formatBps(peakRx)}</span>
              </div>
              <div className="retro-stat-box">
                <span className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">Link State</span>
                <span className="text-xs font-bold uppercase text-emerald-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  CONNECTED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TX Card (Upload) */}
        <div className="retro-card">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
            <div className="rack-screw" />
            <span className="led led-blue animate-led-pulse" />
            <span className="font-mono text-xs font-bold text-slate-450 uppercase tracking-wider">TX_CHANNEL_UPLINK</span>
            <div className="ml-auto rack-screw" />
          </div>
          <div className="p-5 space-y-4">
            <div className="retro-display p-5 text-center">
              <span className="block text-[8px] uppercase tracking-widest mb-1" style={{ color: 'var(--display-dim)' }}>CURRENT_BANDWIDTH</span>
              <p className="text-3xl md:text-4xl font-bold tracking-tight text-blue-450" style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                {trafficData ? formatBps(trafficData.tx) : '0.00 bps'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="retro-stat-box">
                <span className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">Peak TX</span>
                <span className="text-sm font-bold text-[#7dd3fc]">{formatBps(peakTx)}</span>
              </div>
              <div className="retro-stat-box">
                <span className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">Link State</span>
                <span className="text-xs font-bold uppercase text-blue-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recharts Traffic Plot Container */}
      <div className="retro-card">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid #0a0a18', background: 'linear-gradient(180deg, #1e1e3a 0%, #16162c 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="rack-screw" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Osciloscópio de Tráfego</h3>
              <p className="text-[10px] text-slate-400 font-mono">Medição real-time // amostragem 2.0s</p>
            </div>
          </div>
          <div className="flex gap-4 text-[10px] font-bold font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              RX (Download)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              TX (Upload)
            </span>
            <div className="rack-screw" />
          </div>
        </div>

        {/* Display Plot Chassis */}
        <div className="p-5">
          <div className="retro-display p-4 h-80 w-full relative">
            {mounted && history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#101a2d" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4a70b0', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatYAxis}
                    tick={{ fill: '#4a70b0', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="rx" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRx)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tx" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTx)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : !mounted ? (
              <div className="h-full w-full" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 font-medium" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mb-3"></div>
                Aguardando leitura de canais de dados...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
