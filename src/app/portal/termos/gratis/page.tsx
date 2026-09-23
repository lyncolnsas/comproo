import React from 'react';
import Link from 'next/link';

export default function TermosGratisPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-700">
        
        {/* Cabeçalho */}
        <div className="px-6 py-8 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-750">
          <div className="flex items-center justify-center mb-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 text-2xl">📋</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white text-center">Termos de Uso</h1>
          <p className="mt-2 text-center text-slate-400 text-sm">Acesso Gratuito à Rede Wi-Fi · Versão 2.0</p>
          <p className="mt-1 text-center text-slate-500 text-xs">Vigência: a partir de setembro/2024 · Baseado na LGPD e no Marco Civil da Internet</p>
        </div>
        
        <div className="px-6 py-8 space-y-6 text-slate-300 text-base leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Acesso de Cortesia — O que você recebe
            </h2>
            <p>
              Ao se cadastrar nesta rede, você recebe acesso gratuito à internet Wi-Fi como cortesia do estabelecimento. 
              O serviço é fornecido em regime de melhor esforço (<em>best effort</em>), sem garantia formal de SLA. 
              A velocidade e estabilidade podem variar conforme a demanda de outros usuários simultâneos na rede.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Uso Responsável e Lícito
            </h2>
            <p>
              Você concorda em utilizar a rede exclusivamente para fins lícitos, em conformidade com a legislação 
              brasileira vigente. São expressamente vedados: acesso a conteúdo ilegal, tentativas de invasão a sistemas 
              de terceiros, distribuição de malware e violação de direitos autorais. O sistema possui capacidade de 
              detecção e bloqueio de comportamentos abusivos, podendo interromper sua sessão sem aviso prévio.
            </p>
            <p className="mt-2 text-sm text-slate-400 italic">
              Base legal: <strong className="text-slate-300">Marco Civil da Internet — Lei 12.965/2014</strong>, art. 3°, VI (responsabilidade dos usuários)
              e art. 8° (garantia dos direitos de terceiros).
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Coleta de Dados e Privacidade
            </h2>
            <p>
              Para fornecer o serviço e cumprir as obrigações legais de registro, coletamos seus dados de cadastro 
              (nome, telefone, e-mail quando fornecidos) e dados técnicos de conexão (endereço MAC, IP, data e hora). 
              Esses dados são armazenados em banco de dados seguro, com acesso restrito, <strong>não são vendidos ou 
              compartilhados com terceiros</strong> e são utilizados exclusivamente para autenticação, controle de 
              acesso e cumprimento de obrigações regulatórias.
            </p>
            <p className="mt-2 text-sm text-slate-400 italic">
              Base legal: <strong className="text-slate-300">LGPD — Lei 13.709/2018</strong>, art. 7°, inciso V (execução de contrato); 
              <strong className="text-slate-300"> Marco Civil da Internet — Lei 12.965/2014</strong>, art. 13 (guarda de registros de conexão 
              por provedores de acesso) — obrigação mínima de 1 ano.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">4</span>
              Seus Direitos como Titular de Dados
            </h2>
            <p>
              Em conformidade com a LGPD, você tem direito a: acessar seus dados, solicitar correção, portabilidade 
              ou exclusão, e revogar o consentimento a qualquer momento. Para exercer esses direitos, entre em contato 
              com o responsável pelo estabelecimento ou administrador da rede.
            </p>
            <p className="mt-2 text-sm text-slate-400 italic">
              Base legal: <strong className="text-slate-300">LGPD — Lei 13.709/2018</strong>, art. 18 (direitos do titular).
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">5</span>
              Limitação de Responsabilidade
            </h2>
            <p>
              O provedor empreenderá seus melhores esforços para manter a rede disponível e estável. Por tratar-se 
              de um serviço gratuito de cortesia, não nos responsabilizamos por interrupções temporárias 
              decorrentes de manutenção, falhas de infraestrutura de terceiros (operadoras de fibra) ou eventos 
              de força maior. O uso desta rede pública compartilhada é de responsabilidade do usuário.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">6</span>
              Anti-Compartilhamento (Uso Individual)
            </h2>
            <p>
              O acesso é estritamente pessoal e intransferível. O sistema bloqueia automaticamente tentativas 
              de compartilhar a conexão via Ponto de Acesso Pessoal (tethering), Bluetooth ou USB. 
              O limite de dispositivos por cadastro é de <strong>1 (um) aparelho simultâneo</strong>.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold">7</span>
              Foro e Legislação Aplicável
            </h2>
            <p>
              Estes termos são regidos pela legislação brasileira. Qualquer controvérsia será dirimida 
              no foro do município de sede do estabelecimento, com renúncia a qualquer outro.
            </p>
          </section>

        </div>

        <div className="bg-slate-900/50 px-6 py-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Última atualização: Setembro/2024</p>
          <Link 
            href="/portal/register" 
            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
          >
            ✅ Li e concordo — Voltar ao Cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
