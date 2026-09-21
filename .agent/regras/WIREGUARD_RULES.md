# 🛡️ Diretrizes Obrigatórias de VPN WireGuard (P0)

Estas regras são de cumprimento obrigatório por qualquer agente ao interagir com VPN, túneis remotos ou conectividade MikroTik-VPS no MikroGestor.

---

## 1. Regra de Split-Tunneling Estrito (P0)
- **O que fazer**: Configurar `allowed-address=10.8.0.0/24` no peer do MikroTik.
- **O que NUNCA fazer**: NUNCA utilize `0.0.0.0/0` nas rotas ou peers da VPN WireGuard no MikroTik. O túnel serve estritamente para o tráfego de controle e telemetria da plataforma (portas 8728, 8729).
- **Justificativa**: O roteamento geral de navegação dos usuários de Hotspot pela VPS consome banda desnecessária, causa lentidão e viola a privacidade local da rede do cliente.

---

## 2. Regra de Scripts em Linha Única para Winbox Terminal (P0)
- **O que fazer**: Todos os comandos RouterOS destinados à cópia no Winbox Terminal devem ser gerados em **linha única**.
- **O que NUNCA fazer**: NUNCA utilize barras invertidas (`\`) para quebrar linhas em scripts para o usuário colar no Winbox Terminal.
- **Justificativa**: Em sistemas Windows, o clipboard insere quebras CRLF (`\r\n`) que, combinadas com barras invertidas, causam `syntax error` silencioso no parser do RouterOS v7.

---

## 3. Validação Prévia de Chaves Públicas (P0)
- **O que fazer**: Validar `vpsPublicKey` antes de gerar qualquer script ou comando `/interface wireguard peers add`.
- **O que NUNCA fazer**: Nunca permitir a execução de script com `public-key=""` (vazia). O RouterOS v7 aborta a criação do peer se a chave não for fornecida.

---

## 4. Comunicação Docker-Host Segura (P0)
- **O que fazer**: A aplicação Next.js comunica-se com o daemon `wg-manager.py` no host através do IP da ponte Docker (`172.17.0.1:51821`) autenticado pelo cabeçalho HTTP `X-WG-Secret`.
- **O que NUNCA fazer**: NUNCA exponha a porta TCP `51821` para a internet pública no firewall (UFW). O firewall deve permitir a porta 51821 estritamente a partir da subnet Docker (`172.16.0.0/12`).

---

## 5. Criptografia Assimétrica Nativa (P0)
- **O que fazer**: A geração de pares de chaves Curve25519 (X25519) no backend deve ser realizada exclusivamente via API nativa do Node.js: `crypto.generateKeyPairSync('x25519')`.
- **O que NUNCA fazer**: Não dependa de chamadas de shell externas para geração de chaves no container.
