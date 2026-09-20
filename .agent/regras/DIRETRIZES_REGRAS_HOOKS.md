# 🛡️ Diretrizes para Escrita de Regras e Hooks de IA

Este documento reúne os padrões extraídos do ecossistema de guardrails para escrita de regras automáticas e preventivas:

## 1. Princípios de Regras Eficazes
- **Específica**: Deve interceptar uma ação concreta e perigosa (ex: `rm -rf`, `DROP TABLE`, commit em branch protegida).
- **Não Intrusiva**: Não deve interromper fluxos normais de trabalho do desenvolvedor ou da IA.
- **Acionável**: Sempre que disparar, forneça a alternativa segura imediata.

## 2. Tipos de Hooks
- **PreToolUse**: Intercepta comandos ou gravações antes da execução. Permite bloquear ou pedir confirmação.
- **PostToolUse**: Avalia o resultado de um comando executado para alertar sobre efeitos colaterais.
- **UserPromptSubmit**: Modifica ou injeta contexto prévio antes do agente planejar a resposta.
