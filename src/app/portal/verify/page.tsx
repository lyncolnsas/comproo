'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyRedirect() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Redireciona imediatamente para a tela oficial de cadastro do Hotspot
        const query = searchParams.toString();
        const target = query ? `/portal/register?${query}` : '/portal/register';
        window.location.replace(target);
    }, [searchParams, router]);

    return (
        <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'sans-serif' }}>
            <div style={{ 
                width: '36px', 
                height: '36px', 
                border: '3px solid rgba(255,255,255,0.1)', 
                borderTopColor: '#22c55e', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite', 
                margin: '0 auto 16px' 
            }} />
            <p style={{ fontSize: '14px', margin: 0 }}>Redirecionando para o portal de acesso...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
            <Suspense fallback={<div style={{ color: '#94a3b8' }}>Carregando...</div>}>
                <VerifyRedirect />
            </Suspense>
        </div>
    );
}
