import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minha Conta | Portal Wi-Fi',
  description: 'Acesse sua conta, compre vouchers e gerencie seu acesso à internet.',
  openGraph: {
    title: 'Portal Wi-Fi - Área do Cliente',
    description: 'Acesse sua conta, compre vouchers e gerencie seu acesso à internet de forma fácil e rápida.',
    type: 'website',
  }
};

export default function PlanosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
