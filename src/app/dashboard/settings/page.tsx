"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página foi consolidada em /dashboard/admin
// Qualquer acesso direto a /dashboard/settings é redirecionado para lá
export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin');
  }, [router]);

  return (
    <main className="p-8 flex items-center justify-center min-h-64">
      <p className="text-slate-500 text-sm">Redirecionando para Roteadores e Sistema...</p>
    </main>
  );
}
