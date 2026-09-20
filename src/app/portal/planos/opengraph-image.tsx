import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Portal Wi-Fi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: 60, background: '#006eff', marginBottom: 40 }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <div style={{ fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>
          Portal Wi-Fi
        </div>
        <div style={{ fontSize: 32, color: '#94a3b8' }}>
          Acesse sua conta e gerencie seus planos
        </div>
      </div>
    ),
    { ...size }
  );
}
