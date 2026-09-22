# Guia Oficial: Migração de Domínio, Nova VPS e Arquitetura de Segurança Hotspot

Este documento contém o guia definitivo para instalação, migração e provisionamento do **MikroGestor Hotspot** em qualquer nova VPS ou novo domínio, além do detalhamento de todas as transformações efetuadas para substituir caminhos fixos (`localhost`, `portal.wifi.local`) por uma infraestrutura inteligente e dinâmica.

---

## 1. O Sistema Inteligente de Resolução de Caminhos

Anteriormente, o sistema dependia de endereços estáticos ou padrões de desenvolvimento (`http://localhost:3000`, `portal.wifi.local`, IPs de teste). Caso a plataforma fosse movida para outro servidor ou domínio, diversos links e scripts quebravam.

Para solucionar isso em definitivo, foi implementado o motor de resolução dinâmica em `src/lib/domain.ts` e em todos os pipelines de provisionamento e deploy:

### Como Funciona a Resolução Automática:
1. **Ambiente Governa a Identidade**:
   - `PORTAL_PUBLIC_DOMAIN`: Define o domínio público principal (ex: `mikrogestor.com` ou `seunovodominio.com.br`).
   - `DEPLOYMENT_MODE`: 
     - `vps`: Força todas as rotas públicas, captive portals e webhooks a utilizarem HTTPS com o domínio configurado.
     - `local`: Utiliza IPs da rede local (LAN).
   - `VPS_PUBLIC_IP`: Define o IP público da VPS para regras estritas de firewall no MikroTik.
   - `VPN_SERVER_IP`: Define o IP do túnel WireGuard de gerência (`10.8.0.1`).
2. **Sanitização Automática no Deploy e Configuração**:
   - Quando o administrador edita ou faz o deploy do template do Hotspot (`/api/portal/config` e `/api/portal/deploy`), o sistema lê os arquivos `login.html` e `config.json` e substitui dinamicamente qualquer ocorrência de `localhost`, `portal.wifi.local`, `192.168.x.x` ou `10.x.x.x` pela URL oficial calculada (`https://${PORTAL_PUBLIC_DOMAIN}`).
   - Ao gravar no banco SQLite a chave `SYSTEM_URL`, o valor é gerado automaticamente a partir do ambiente ativo.
3. **Detecção Dinâmica de Cabeçalho `Host`**:
   - Se o roteador operar com subdomínio dedicado (ex: `unidade1.mikrogestor.com`), as rotas de API (`/api/portal/register`, `/api/portal/safari-bypass`, mensagens do bot) identificam o header `host` da requisição e respondem com a URL personalizada do roteador.

---

## 2. Tabela de Modificações: De `localhost` para URLs Inteligentes

A tabela abaixo resume cada uma das alterações realizadas no código para tornar o sistema 100% agnóstico a domínio e servidor:

| Componente / Arquivo | Comportamento Anterior (Legado) | Novo Comportamento Dinâmico | Motivo da Alteração |
| :--- | :--- | :--- | :--- |
| **Templates Hotspot (`login.html` e `config.json`)** | URLs fixas para `http://portal.wifi.local` ou IPs de LAN. | Regras de substituição no upload FTP e save que injetam `getMaskedPortalUrl()`. | Evita que clientes na rua sejam redirecionados para hostnames inexistentes. |
| **DNS Name no Hotspot Profile** | Anteriormente podia ser preenchido com o domínio público (`mikrogestor.com`). | Fixado estritamente como `hotspot.wifi` (ou subdomínio dedicado com SSL). | Se o MikroTik usar o domínio público no DNS Name, ele intercepta as conexões porta 80 para si mesmo e bloqueia o sistema na VPS. |
| **Walled Garden IP no RouterOS v7** | Regras com asterisco `*mikrogestor.com*` em `/ip/hotspot/walled-garden/ip`. | Sanitização estrita: apenas domínio exato (`mikrogestor.com`, `www.mikrogestor.com`) e `VPS_PUBLIC_IP`. | No RouterOS v7, asteriscos no Walled Garden IP tornam a regra inválida (`invalid: true`), quebrando HTTPS. |
| **Safari / iOS Captive Portal Bypass** | Redirecionamento com URLs pré-fixadas. | Rota `/api/portal/safari-bypass` gera a resposta baseada em `getMaskedPortalUrl('', request.headers.get('host'))`. | Garante que o assistente da Apple abra no navegador real independente do domínio. |
| **Mensagens e Fluxos do WhatsApp** | Links de recarga hardcoded para localhost ou IP de dev. | Disparo assíncrono injetando `${portalUrl}/portal/planos`. | Garante que o link recebido no WhatsApp do cliente sempre funcione na VPS. |

---

## 3. Arquitetura de Segurança do Hotspot

### 3.1. Lockdown Estrito do Walled Garden
Ao contrário de modelos tradicionais que liberavam dezenas de domínios externos no Walled Garden (Mercado Pago, Mercado Livre, WhatsApp, Google Fonts):
- **O cliente recebe 15 minutos de cortesia com internet 100% liberada no momento do cadastro.**
- Com esses 15 minutos, o cliente pode abrir o aplicativo de qualquer banco (Nubank, Itaú, Bradesco, Mercado Pago, etc.) e pagar o Pix diretamente.
- **Portanto, o Walled Garden foi blindado para liberar EXCLUSIVAMENTE:**
  1. O domínio público da plataforma (`PORTAL_PUBLIC_DOMAIN` e `www.${PORTAL_PUBLIC_DOMAIN}`).
  2. O subdomínio dedicado do roteador (se atribuído).
  3. O IP público da VPS (`VPS_PUBLIC_IP`).
  4. O IP VPN do Servidor (`10.8.0.1`).
- **Nenhum serviço externo de terceiros tem tráfego gratuito liberado antes do cadastro.** A rotina `cleanupAndDeduplicateWalledGarden` remove ativamente qualquer entrada externa remanescente.

---

### 3.2. Expiração Categórica dos 15 Minutos & Sistema Anti-Fraude
O sistema agora trata de forma categórica qualquer tentativa de inadimplência ou burla:
1. **Concessão Controlada**:
   - Ao se cadastrar selecionando um plano pago, o MikroTik cria o usuário com `limit-uptime: "00:15:00"`.
   - O banco de dados registra `trialGrantedAt: new Date()` no lead e armazena o `macAddress` no registro de pagamento.
2. **Bloqueio ao Expirar**:
   - A rotina de varredura (`/api/portal/check-expirations`) monitora pagamentos pendentes com mais de 15 minutos.
   - Se o Pix não for pago, o sistema:
     - Derruba a conexão ativa no MikroTik (`/ip/hotspot/active/remove`).
     - Remove o usuário do Hotspot.
     - Adiciona bloqueio de camada 2 no MikroTik: `/ip/hotspot/ip-binding add mac-address=<MAC> type=blocked comment="MG: Bloqueado falta de pagamento PIX"`.
     - Insere o registro na tabela `BlockedClient`.
     - Marca `HotspotLead.trialBlocked = true`.
3. **Prevenção Contra Burlas**:
   - **Esquecer a rede Wi-Fi**: Não adianta. O bloqueio é por MAC address na tabela de IP-Binding do MikroTik. O aparelho sequer recebe tela de login ou resolução DNS.
   - **Mudar MAC (MAC aleatório) e tentar novo cadastro**: Ao informar o mesmo CPF ou mesmo Telefone no formulário de cadastro, o sistema verifica o histórico: identifica que a carência de 15 minutos já foi utilizada sem confirmação de pagamento, **recusa o cadastro (HTTP 403)** e adiciona imediatamente o novo MAC à lista de bloqueados!
4. **Gerenciamento Administrativo**:
   - Endpoint `/api/portal/admin/blacklist`:
     - `GET`: Lista todos os clientes com bloqueio ativo.
     - `POST`: Permite ao operador bloquear manualmente um MAC, CPF ou Telefone suspeito.
     - `DELETE`: Permite ao operador desbloquear um cliente com 1 clique (removendo a regra de IP-Binding no MikroTik e limpando a restrição no banco).

---

### 3.3. Bloqueio Contra Compartilhamento de Conexão (Anti-Tethering)
Para impedir que um usuário compre 1 acesso e compartilhe a internet com várias pessoas vizinhas via **Roteador Wi-Fi (Ponto de Acesso Pessoal)**, **Bluetooth** ou **Tethering USB**:
1. **Regra de Mangle no MikroTik (RouterOS v7)**:
   ```routeros
   /ip firewall mangle add chain=postrouting out-interface=bridge action=change-ttl new-ttl=set:1 comment="MikroGestor: Anti-Tethering (Bloqueio Compartilhamento)"
   ```
2. **Como Funciona na Prática**:
   - Todos os pacotes destinados aos clientes saem da bridge do MikroTik com `TTL = 1` (Time-To-Live).
   - O smartphone do cliente recebe o pacote. Como o smartphone é o destino final, ele processa o pacote com sucesso.
   - Se o smartphone tentar rotear/repassar o pacote para outro dispositivo dependente conectado ao seu Wi-Fi pessoal, o kernel do celular é obrigado pela norma IPv4 a decrementar o TTL para 0 (`1 - 1 = 0`).
   - Ao atingir TTL 0, o celular descarta o pacote (`Time Exceeded`).
   - **Resultado**: Apenas o smartphone cadastrado navega. Nenhum aparelho dependente consegue carregar qualquer página.
3. **Restrição de Dispositivos Simultâneos**:
   - No perfil de usuário Hotspot (`/ip/hotspot/user/profile`), o parâmetro `shared-users=1` é forçado automaticamente no provisionamento.

---

## 4. Passo a Passo para Deploy em Nova VPS ou Novo Domínio

Quando você for instalar o MikroGestor em uma nova VPS ou associar um novo domínio, siga este procedimento:

### Passo 1: Apontamento DNS
No painel de DNS do seu domínio (Hostinger, Cloudflare, Registro.br):
- Entrada **A** principal: `@` ou `painel` apontando para o IP da nova VPS (`VPS_PUBLIC_IP`).
- Entrada **A** Wildcard: `*` apontando para o IP da nova VPS (`VPS_PUBLIC_IP`).
  *(O wildcard é obrigatório para suportar os subdomínios dedicados com SSL de cada roteador).*

### Passo 2: Configuração no Coolify
1. Crie a aplicação no Coolify a partir do repositório Git.
2. Na aba **Configuration → General**:
   - **Domains**: Defina o domínio completo com HTTPS (ex: `https://www.seudominio.com,https://seudominio.com`).
   - **Ports Exposes**: Defina estritamente a porta `80`.
3. Na aba **Configuration → Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=80
   DATABASE_URL="file:/app/prisma/dev.db"
   DEPLOYMENT_MODE="vps"
   PORTAL_PUBLIC_DOMAIN="seudominio.com"
   VPS_PUBLIC_IP="SEU_IP_PUBLICO"
   VPN_SERVER_IP="10.8.0.1"
   WG_MANAGER_SECRET="SUA_CHAVE_SECRETA"
   WG_DAEMON_URL="http://172.17.0.1:51821"
   HOTSPOT_WIFI_NAME="Nome da Sua Rede Wi-Fi"
   ```
4. Na aba **Configuration → Persistent Storage** (CRÍTICO):
   - **Source Path (Host)**: `/data/mikrogestor/prisma`
   - **Destination Path (Container)**: `/app/prisma`
   *(Sem esse volume, o banco de dados SQLite é reiniciado a cada novo deploy).*

### Passo 3: Firewall da VPS (UFW)
Execute no terminal da VPS:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 51820/udp
sudo ufw allow from 172.16.0.0/12 to any port 51821 proto tcp
sudo ufw reload
```

### Passo 4: Provisionamento de Roteadores
1. Acesse o painel web em `https://seudominio.com`.
2. Conecte o roteador MikroTik via túnel WireGuard (conforme instruções da aba VPN).
3. Vá em **Hotspot → Provisionar** e clique em **Iniciar Provisionamento**.
4. O sistema irá configurar automaticamente:
   - Interface Bridge e Pool de IPs.
   - Servidor DHCP e Servidor Hotspot.
   - Walled Garden Restrito (apenas seu novo domínio e IP).
   - Regra Mangle Anti-Tethering (`TTL=1`).
   - Perfil restrito a 1 usuário simultâneo.
   - Upload dos templates sanitizados via FTP.

O sistema estará 100% operacional, seguro e livre de fraudes!
