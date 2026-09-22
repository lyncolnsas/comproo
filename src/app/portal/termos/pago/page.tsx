import React from 'react';
import Link from 'next/link';

export default function TermosPagoPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-700">
        <div className="bg-slate-750 px-6 py-8 border-b border-slate-700">
          <h1 className="text-3xl font-extrabold text-white text-center">Termos de Uso e Isenção de Responsabilidade</h1>
          <p className="mt-2 text-center text-slate-400 text-sm">Planos Pagos (Vouchers e Acesso Premium)</p>
        </div>
        
        <div className="px-6 py-8 space-y-8 text-slate-300 text-base leading-relaxed">
          
          <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Importante: Leia com Atenção</h3>
            <p className="text-sm text-blue-200">
              Ao adquirir um acesso pago à nossa rede Wi-Fi, você concorda expressamente com as condições e limitações técnicas descritas abaixo. Nossa rede é gerenciada via sistema de Hotspot, que possui comportamentos específicos de conexão.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-sm">1</span>
              Como se Reconectar Manualmente
            </h2>
            <div className="space-y-4">
              <p>
                Geralmente, o seu dispositivo se reconectará de forma automática através da validação do Cookie Seguro. No entanto, se o seu celular desativar o Wi-Fi para economizar bateria, ou se você se afastar e voltar, <strong>o aparelho pode não conectar sozinho à internet</strong>.
              </p>
              <div className="bg-slate-900 p-5 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Passo a passo caso a internet pare:</h4>
                <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
                  <li>Verifique se o ícone do Wi-Fi está conectado na nossa rede.</li>
                  <li>Abra o navegador (Chrome, Safari, etc).</li>
                  <li>Acesse o endereço de login, por exemplo: <strong className="text-white">http://portal.wifi.local</strong> ou acesse um site sem HTTPS como <strong className="text-white">http://neverssl.com</strong> para forçar a tela de login.</li>
                  <li>Se solicitado, insira suas credenciais cadastradas, ou clique no botão de conectar.</li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mr-3 text-sm">2</span>
              Perda de Conexão e Lotação do Serviço (Sem Reembolsos)
            </h2>
            <p>
              Em ambientes de grande circulação, a infraestrutura possui um limite máximo de dispositivos simultâneos. Se você adquirir um acesso, se ausentar da área de cobertura ou permanecer inativo por longos períodos (o que faz o celular desconectar), <strong>sua vaga na rede pode ser ocupada por outro usuário</strong>.
            </p>
            <div className="mt-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              <strong className="text-red-400 block mb-1">Aviso de Não-Reembolso:</strong>
              Caso o sistema esteja com capacidade máxima e você perca sua vaga por desconexão ou afastamento, não será possível conectar-se novamente até que uma nova vaga seja liberada na antena. <strong>O valor pago não será reembolsado nestas circunstâncias.</strong> Você adquire o direito ao tempo de acesso, mas a estabilidade e a retenção da vaga dependem da permanência do seu dispositivo ativo na área de cobertura.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-sm">3</span>
              Isenção de Responsabilidade
            </h2>
            <p>
              O provedor (MikroGestor ou o estabelecimento parceiro) envidará os melhores esforços para garantir uma conexão contínua e segura. Todavia, isentamo-nos de responsabilidade por:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
              <li>Lentidão motivada por picos extremos de tráfego de outros usuários.</li>
              <li>Dificuldades de conexão causadas por restrições do seu próprio aparelho (ex: endereço MAC aleatório trocado constantemente).</li>
              <li>Interrupções provocadas por quedas de energia no local ou na operadora de link de fibra óptica.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-sm">4</span>
              Anti-Compartilhamento (Tethering)
            </h2>
            <p>
              O uso do acesso é <strong>estritamente individual</strong>. Tentativas de compartilhar a internet roteando do seu celular via Ponto de Acesso (Hotspot Pessoal), USB ou Bluetooth são bloqueadas ativamente pelos nossos firewalls e podem resultar no encerramento imediato da sua sessão sem aviso prévio.
            </p>
          </section>

        </div>

        <div className="bg-slate-800/80 px-6 py-6 border-t border-slate-700 flex justify-center">
          <Link href="/portal/register" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors duration-200">
            Voltar para o Cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
