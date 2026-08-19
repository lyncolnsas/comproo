'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone');
    const tokenFromUrl = searchParams.get('token');
    const [token, setToken] = useState(tokenFromUrl || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [autoSubmitDone, setAutoSubmitDone] = useState(false);

    useEffect(() => {
        if (tokenFromUrl && phone && !autoSubmitDone && !success && !loading) {
            setAutoSubmitDone(true);
            handleConfirm(tokenFromUrl);
        }
    }, [tokenFromUrl, phone, autoSubmitDone, success, loading]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setToken(text.trim());
        } catch(e) {
            alert('Não foi possível colar automaticamente. Cole manualmente.');
        }
    };

    const handleConfirm = async (overrideToken?: string | any) => {
        const finalToken = typeof overrideToken === 'string' ? overrideToken : token;
        if (!finalToken) {
            alert('Por favor, insira o token.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/portal/whatsapp-flow/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, token: finalToken })
            });
            const data = await res.json();
            if (data.success) {
                alert('Sucesso! O token foi verificado.');
                setSuccess(true);
            } else {
                alert('Erro da API: ' + (data.error || 'Token inválido.'));
                setError(data.error || 'Token inválido.');
            }
        } catch(e: any) {
            alert('Erro de conexão com o servidor: ' + e.message);
            setError('Erro de conexão.');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="bg-gray-800 p-8 rounded-xl max-w-sm w-full text-center shadow-lg border border-green-500/20">
                <h2 className="text-2xl font-bold text-green-500 mb-4">✔ Número Confirmado!</h2>
                <p className="text-gray-300 mb-6">
                    O seu cadastro foi verificado com sucesso.
                </p>
                <p className="text-white font-semibold">
                    Por favor, retorne ao seu WhatsApp para finalizar a configuração da sua conta.
                </p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#1f2937', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #374151', color: 'white' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>Verificação de Segurança</h2>
            <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '20px' }}>
                Código enviado para o número <br/><span style={{ color: 'white', fontFamily: 'monospace' }}>{phone}</span>
            </p>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Código Token</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="000000"
                        style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', color: 'white', textAlign: 'center', fontSize: '24px', letterSpacing: '4px', fontFamily: 'monospace', padding: '12px', borderRadius: '8px', outline: 'none' }}
                    />
                </div>
            </div>

            {error && <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

            <button 
                onClick={handleConfirm}
                disabled={loading || !token}
                style={{ width: '100%', backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: (loading || !token) ? 'not-allowed' : 'pointer', opacity: (loading || !token) ? 0.5 : 1 }}
            >
                {loading ? 'Verificando...' : 'CONFIRMAR TOKEN'}
            </button>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', padding: '20px', fontFamily: 'sans-serif' }}>
            <Suspense fallback={<div style={{ color: 'white' }}>Carregando tela...</div>}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
