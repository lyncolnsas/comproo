import React from 'react';
import Link from 'next/link';

export default function TermosGratisPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-700">
        <div className="bg-slate-750 px-6 py-8 border-b border-slate-700">
          <h1 className="text-3xl font-extrabold text-white text-center">Termos de Uso</h1>
          <p className="mt-2 text-center text-slate-400 text-sm">Acesso Gratuito à Rede Wi-Fi</p>
        </div>
        
        <div className="px-6 py-8 space-y-6 text-slate-300 text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">1</span>
              Acesso de Cortesia
            </h2>
            <p>
              O acesso à internet fornecido através desta rede é oferecido como uma cortesia (uso gratuito). 
              A disponibilidade, velocidade e estabilidade da conexão podem variar de acordo com a demanda e 
              não possuem garantia de SLA (Acordo de Nível de Serviço).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">2</span>
              Uso Responsável
            </h2>
            <p>
              Ao utilizar nossa rede, você concorda em não usá-la para atividades ilícitas, downloads de 
              conteúdo protegido por direitos autorais, distribuição de malware ou qualquer outra ação que 
              viole a legislação vigente. O provedor do serviço reserva-se o direito de bloquear ou limitar 
              o acesso de dispositivos que apresentem comportamento suspeito ou abusivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">3</span>
              Coleta de Dados e Privacidade
            </h2>
            <p>
              Para o fornecimento do serviço e cumprimento do Marco Civil da Internet, armazenamos os dados de 
              registro fornecidos por você, bem como logs básicos de conexão (MAC Address, IP, data e hora). 
              Estes dados são protegidos e não serão comercializados, sendo utilizados apenas para controle de 
              segurança e autenticação no Hotspot.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">4</span>
              Isenção de Responsabilidade
            </h2>
            <p>
              O provedor não se responsabiliza por danos, perdas de dados, invasões de dispositivos ou qualquer 
              outro problema decorrente do uso desta rede pública. Recomendamos evitar transações financeiras 
              ou acesso a dados sensíveis sem o uso de tecnologias adicionais de segurança (como VPN).
            </p>
          </section>
        </div>

        <div className="bg-slate-800/80 px-6 py-6 border-t border-slate-700 flex justify-center">
          <Link href="/portal/register" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors duration-200">
            Voltar para o Cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
