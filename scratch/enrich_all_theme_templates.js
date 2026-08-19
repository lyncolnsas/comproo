const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, '..', 'hotspot');

const THEMES_PRESETS = {
  academia: {
    businessName: "Wi-Fi Academia Pro",
    message: "Foco, força e conexão! Insira seu voucher ou cadastre-se para liberar a internet do seu treino.",
    colors: {
      brand: "#10b981",
      brandDark: "#059669",
      bg: "#09090b",
      ink: "#f0fdf4",
      muted: "#86efac",
      blue: "#10b981",
      loginButtonText: "#09090b",
      green: "#f97316",
      registerButtonText: "#ffffff",
      trialButtonBg: "#10b981",
      trialButtonText: "#09090b",
      cardBg: "#0c1410",
      cardBorder: "#10b981",
      inputBg: "#060a08",
      inputText: "#f0fdf4",
      inputBorder: "#059669",
      inputPlaceholder: "#4ade80",
      glassOpacity: 92,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'wave-mesh',
      bgEffectSpeed: 'fast',
      cardShape: 'scifi-cut',
      cardNoiseTexture: true,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Turbo Fit',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Segura Atletas',
      showConnectedCount: true,
      connectedCountNumber: '58'
    }
  },
  igreja: {
    businessName: "Wi-Fi Conectados na Fé",
    message: "Seja bem-vindo à casa de Deus. Conecte-se para acompanhar a Bíblia online, louvores e estudos.",
    colors: {
      brand: "#d97706",
      brandDark: "#b45309",
      bg: "#030712",
      ink: "#fffbeb",
      muted: "#fde68a",
      blue: "#d97706",
      loginButtonText: "#ffffff",
      green: "#f59e0b",
      registerButtonText: "#030712",
      trialButtonBg: "#d97706",
      trialButtonText: "#ffffff",
      cardBg: "#0a0f1d",
      cardBorder: "#d97706",
      inputBg: "#050811",
      inputText: "#fffbeb",
      inputBorder: "#78350f",
      inputPlaceholder: "#fcd34d",
      glassOpacity: 88,
      glassBlur: 16
    },
    effects: {
      bgEffect: 'aurora',
      bgEffectSpeed: 'slow',
      cardShape: 'pill',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🕊️ Rede Acolhedora',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Segura',
      showConnectedCount: false,
      connectedCountNumber: '40'
    }
  },
  clinica: {
    businessName: "Wi-Fi Clínica & Saúde",
    message: "Cuidando de você com excelência. Aproveite nossa internet de alta velocidade enquanto aguarda seu atendimento.",
    colors: {
      brand: "#06b6d4",
      brandDark: "#0891b2",
      bg: "#020617",
      ink: "#ecfeff",
      muted: "#a5f3fc",
      blue: "#06b6d4",
      loginButtonText: "#020617",
      green: "#10b981",
      registerButtonText: "#ffffff",
      trialButtonBg: "#06b6d4",
      trialButtonText: "#020617",
      cardBg: "#081520",
      cardBorder: "#06b6d4",
      inputBg: "#030a10",
      inputText: "#ecfeff",
      inputBorder: "#0e7490",
      inputPlaceholder: "#67e8f9",
      glassOpacity: 90,
      glassBlur: 14
    },
    effects: {
      bgEffect: 'wave-mesh',
      bgEffectSpeed: 'normal',
      cardShape: 'pill',
      cardNoiseTexture: false,
      cardGlowBorder: false,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: false
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Alta Velocidade',
      showSecurityBadge: true,
      securityText: '🔒 Privacidade & Dados Protegidos',
      showConnectedCount: false,
      connectedCountNumber: '25'
    }
  },
  pizzaria: {
    businessName: "Wi-Fi Pizzaria & Forneria",
    message: "O autêntico sabor no seu prato! Conecte-se para ver nosso cardápio digital e fazer seus pedidos.",
    colors: {
      brand: "#e11d48",
      brandDark: "#be123c",
      bg: "#0c0a09",
      ink: "#fff1f2",
      muted: "#fda4af",
      blue: "#e11d48",
      loginButtonText: "#ffffff",
      green: "#f59e0b",
      registerButtonText: "#0c0a09",
      trialButtonBg: "#e11d48",
      trialButtonText: "#ffffff",
      cardBg: "#170c0e",
      cardBorder: "#e11d48",
      inputBg: "#0c0607",
      inputText: "#fff1f2",
      inputBorder: "#881337",
      inputPlaceholder: "#fb7185",
      glassOpacity: 90,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'fireflies',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: true,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    social: {
      whatsappEnabled: true,
      whatsappNumber: '',
      whatsappMessage: 'Olá! Gostaria de ver o cardápio e fazer um pedido.',
      instagramUrl: '',
      facebookUrl: '',
      googleMapsUrl: ''
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🍕 Wi-Fi Cardápio Digital',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Clientes',
      showConnectedCount: true,
      connectedCountNumber: '32'
    }
  },
  hotel: {
    businessName: "Wi-Fi Grand Hotel & Resort",
    message: "Desfrute de uma estadia inesquecível. Conecte-se à nossa rede de alta velocidade para hóspedes.",
    colors: {
      brand: "#d97706",
      brandDark: "#b45309",
      bg: "#020617",
      ink: "#fef3c7",
      muted: "#fde68a",
      blue: "#d97706",
      loginButtonText: "#ffffff",
      green: "#2563eb",
      registerButtonText: "#ffffff",
      trialButtonBg: "#d97706",
      trialButtonText: "#ffffff",
      cardBg: "#0f172a",
      cardBorder: "#d97706",
      inputBg: "#070b14",
      inputText: "#fef3c7",
      inputBorder: "#78350f",
      inputPlaceholder: "#fcd34d",
      glassOpacity: 92,
      glassBlur: 18
    },
    effects: {
      bgEffect: 'floating-orbs',
      bgEffectSpeed: 'slow',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⭐ Fibra Óptica Hóspede VIP',
      showSecurityBadge: true,
      securityText: '🔒 Conexão WPA3 Segura',
      showConnectedCount: false,
      connectedCountNumber: '64'
    }
  },
  futebol_copa: {
    businessName: "Wi-Fi Arena Esportes",
    message: "O jogo começou! Conecte-se à internet do estádio e compartilhe todos os lances ao vivo.",
    colors: {
      brand: "#16a34a",
      brandDark: "#15803d",
      bg: "#051c0e",
      ink: "#f0fdf4",
      muted: "#86efac",
      blue: "#16a34a",
      loginButtonText: "#051c0e",
      green: "#eab308",
      registerButtonText: "#051c0e",
      trialButtonBg: "#16a34a",
      trialButtonText: "#051c0e",
      cardBg: "#072412",
      cardBorder: "#16a34a",
      inputBg: "#031209",
      inputText: "#f0fdf4",
      inputBorder: "#14532d",
      inputPlaceholder: "#4ade80",
      glassOpacity: 90,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'warp-stars',
      bgEffectSpeed: 'fast',
      cardShape: 'scifi-cut',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Arena',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Torcedor',
      showConnectedCount: true,
      connectedCountNumber: '128'
    }
  },
  "fifa-26.otf": {
    businessName: "Wi-Fi Champions League",
    message: "Entre em campo com a melhor conexão da torcida! Conecte-se e vibre a cada jogada.",
    colors: {
      brand: "#eab308",
      brandDark: "#ca8a04",
      bg: "#051c0e",
      ink: "#fefce8",
      muted: "#fef08a",
      blue: "#eab308",
      loginButtonText: "#051c0e",
      green: "#16a34a",
      registerButtonText: "#ffffff",
      trialButtonBg: "#eab308",
      trialButtonText: "#051c0e",
      cardBg: "#072412",
      cardBorder: "#eab308",
      inputBg: "#031209",
      inputText: "#fefce8",
      inputBorder: "#713f12",
      inputPlaceholder: "#fde047",
      glassOpacity: 90,
      glassBlur: 14
    },
    effects: {
      bgEffect: 'warp-stars',
      bgEffectSpeed: 'fast',
      cardShape: 'scifi-cut',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🏆 Wi-Fi Campeões 5G',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Estádio Segura',
      showConnectedCount: true,
      connectedCountNumber: '156'
    }
  },
  Digital_Ocean: {
    businessName: "Wi-Fi Cloud & Fiber",
    message: "Infraestrutura de ponta e latência ultrabaixa. Conecte-se à rede de alto desempenho.",
    colors: {
      brand: "#0080ff",
      brandDark: "#0066cc",
      bg: "#000814",
      ink: "#e0f2fe",
      muted: "#7dd3fc",
      blue: "#0080ff",
      loginButtonText: "#ffffff",
      green: "#00f0ff",
      registerButtonText: "#000814",
      trialButtonBg: "#0080ff",
      trialButtonText: "#ffffff",
      cardBg: "#02122b",
      cardBorder: "#0080ff",
      inputBg: "#010a18",
      inputText: "#e0f2fe",
      inputBorder: "#075985",
      inputPlaceholder: "#38bdf8",
      glassOpacity: 90,
      glassBlur: 15
    },
    effects: {
      bgEffect: 'wave-mesh',
      bgEffectSpeed: 'normal',
      cardShape: 'scifi-cut',
      cardNoiseTexture: true,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🚀 Fibra Óptica 1Gbps',
      showSecurityBadge: true,
      securityText: '🔒 WPA3 Cloud Enterprise',
      showConnectedCount: true,
      connectedCountNumber: '72'
    }
  },
  Popcorn: {
    businessName: "Wi-Fi Cine Popcorn",
    message: "Luz, câmera e conexão! Pegue sua pipoca e curta a melhor internet enquanto assiste seus filmes.",
    colors: {
      brand: "#dc2626",
      brandDark: "#b91c1c",
      bg: "#0a0606",
      ink: "#fef2f2",
      muted: "#fca5a5",
      blue: "#dc2626",
      loginButtonText: "#ffffff",
      green: "#facc15",
      registerButtonText: "#0a0606",
      trialButtonBg: "#dc2626",
      trialButtonText: "#ffffff",
      cardBg: "#180808",
      cardBorder: "#dc2626",
      inputBg: "#0c0303",
      inputText: "#fef2f2",
      inputBorder: "#7f1d1d",
      inputPlaceholder: "#f87171",
      glassOpacity: 90,
      glassBlur: 10
    },
    effects: {
      bgEffect: 'floating-orbs',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🍿 Wi-Fi 4K Streaming',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Cine Pipoca',
      showConnectedCount: false,
      connectedCountNumber: '45'
    }
  },
  Escuela: {
    businessName: "Wi-Fi Campus & Saber",
    message: "Conhecimento sem fronteiras. Conecte-se para pesquisas acadêmicas, aulas e biblioteca digital.",
    colors: {
      brand: "#16a34a",
      brandDark: "#15803d",
      bg: "#0b1612",
      ink: "#f0fdf4",
      muted: "#86efac",
      blue: "#16a34a",
      loginButtonText: "#0b1612",
      green: "#f59e0b",
      registerButtonText: "#0b1612",
      trialButtonBg: "#16a34a",
      trialButtonText: "#0b1612",
      cardBg: "#10241b",
      cardBorder: "#22c55e",
      inputBg: "#06100c",
      inputText: "#f0fdf4",
      inputBorder: "#14532d",
      inputPlaceholder: "#4ade80",
      glassOpacity: 88,
      glassBlur: 10
    },
    effects: {
      bgEffect: 'particles',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: false,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: false
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Acadêmico',
      showSecurityBadge: true,
      securityText: '🎓 Rede Educacional Protegida',
      showConnectedCount: true,
      connectedCountNumber: '92'
    }
  },
  Greenboard: {
    businessName: "Wi-Fi Escola & Lousa",
    message: "Aprenda, crie e compartilhe. Acesse o portal do aluno e aproveite nossa internet.",
    colors: {
      brand: "#15803d",
      brandDark: "#166534",
      bg: "#07140d",
      ink: "#f0fdf4",
      muted: "#86efac",
      blue: "#15803d",
      loginButtonText: "#ffffff",
      green: "#eab308",
      registerButtonText: "#07140d",
      trialButtonBg: "#15803d",
      trialButtonText: "#ffffff",
      cardBg: "#0d2417",
      cardBorder: "#15803d",
      inputBg: "#05100a",
      inputText: "#f0fdf4",
      inputBorder: "#14532d",
      inputPlaceholder: "#4ade80",
      glassOpacity: 90,
      glassBlur: 8
    },
    effects: {
      bgEffect: 'particles',
      bgEffectSpeed: 'slow',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: false,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: false
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '📚 Rede de Aprendizado',
      showSecurityBadge: true,
      securityText: '🔒 Ambiente Seguro para Alunos',
      showConnectedCount: false,
      connectedCountNumber: '35'
    }
  },
  "Traffic-Control": {
    businessName: "Wi-Fi Cyber Traffic Control",
    message: "Perímetro seguro e tráfego monitorado. Insira suas credenciais de segurança para autenticar.",
    colors: {
      brand: "#ea580c",
      brandDark: "#c2410c",
      bg: "#030712",
      ink: "#fff7ed",
      muted: "#fdba74",
      blue: "#ea580c",
      loginButtonText: "#ffffff",
      green: "#06b6d4",
      registerButtonText: "#030712",
      trialButtonBg: "#ea580c",
      trialButtonText: "#ffffff",
      cardBg: "#0c0f17",
      cardBorder: "#ea580c",
      inputBg: "#05070d",
      inputText: "#fff7ed",
      inputBorder: "#7c2d12",
      inputPlaceholder: "#fb923c",
      glassOpacity: 94,
      glassBlur: 16
    },
    effects: {
      bgEffect: 'matrix',
      bgEffectSpeed: 'fast',
      cardShape: 'scifi-cut',
      cardNoiseTexture: true,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🛡️ Firewall IDS/IPS Ativo',
      showSecurityBadge: true,
      securityText: '🔒 Criptografia WPA3 Enterprise',
      showConnectedCount: true,
      connectedCountNumber: '44'
    }
  },
  shield: {
    businessName: "Wi-Fi Shield Security",
    message: "Conexão protegida com criptografia ponta a ponta e isolamento avançado de clientes.",
    colors: {
      brand: "#06b6d4",
      brandDark: "#0891b2",
      bg: "#020617",
      ink: "#ecfeff",
      muted: "#a5f3fc",
      blue: "#06b6d4",
      loginButtonText: "#020617",
      green: "#3b82f6",
      registerButtonText: "#ffffff",
      trialButtonBg: "#06b6d4",
      trialButtonText: "#020617",
      cardBg: "#071220",
      cardBorder: "#06b6d4",
      inputBg: "#030810",
      inputText: "#ecfeff",
      inputBorder: "#0e7490",
      inputPlaceholder: "#67e8f9",
      glassOpacity: 92,
      glassBlur: 16
    },
    effects: {
      bgEffect: 'cyber-grid',
      bgEffectSpeed: 'normal',
      cardShape: 'scifi-cut',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Blindado',
      showSecurityBadge: true,
      securityText: '🛡️ Shield Pro Active Defense',
      showConnectedCount: false,
      connectedCountNumber: '19'
    }
  },
  wifi_lock: {
    businessName: "Wi-Fi Lock Enterprise",
    message: "Acesso autenticado com alta segurança. Digite seu voucher para navegar com proteção.",
    colors: {
      brand: "#2563eb",
      brandDark: "#1d4ed8",
      bg: "#020617",
      ink: "#eff6ff",
      muted: "#93c5fd",
      blue: "#2563eb",
      loginButtonText: "#ffffff",
      green: "#06b6d4",
      registerButtonText: "#020617",
      trialButtonBg: "#2563eb",
      trialButtonText: "#ffffff",
      cardBg: "#091428",
      cardBorder: "#2563eb",
      inputBg: "#040914",
      inputText: "#eff6ff",
      inputBorder: "#1e40af",
      inputPlaceholder: "#60a5fa",
      glassOpacity: 92,
      glassBlur: 14
    },
    effects: {
      bgEffect: 'cyber-grid',
      bgEffectSpeed: 'normal',
      cardShape: 'scifi-cut',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Seguro',
      showSecurityBadge: true,
      securityText: '🔒 Lock WPA3 Encryption',
      showConnectedCount: true,
      connectedCountNumber: '37'
    }
  },
  LinkingNet: {
    businessName: "Wi-Fi LinkingNet Fibra",
    message: "Conexão na velocidade da luz. Insira seu voucher e navegue sem limites de banda.",
    colors: {
      brand: "#8b5cf6",
      brandDark: "#7c3aed",
      bg: "#080514",
      ink: "#f5f3ff",
      muted: "#c4b5fd",
      blue: "#8b5cf6",
      loginButtonText: "#ffffff",
      green: "#06b6d4",
      registerButtonText: "#080514",
      trialButtonBg: "#8b5cf6",
      trialButtonText: "#ffffff",
      cardBg: "#120b24",
      cardBorder: "#8b5cf6",
      inputBg: "#090514",
      inputText: "#f5f3ff",
      inputBorder: "#5b21b6",
      inputPlaceholder: "#a78bfa",
      glassOpacity: 90,
      glassBlur: 14
    },
    effects: {
      bgEffect: 'warp-stars',
      bgEffectSpeed: 'fast',
      cardShape: 'pill',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Fibra Óptica 800Mbps',
      showSecurityBadge: true,
      securityText: '🔒 LinkingNet Telecom',
      showConnectedCount: true,
      connectedCountNumber: '68'
    }
  },
  Launcher: {
    businessName: "Wi-Fi Turbo Launcher",
    message: "Conexão instantânea sem travamentos. Insira seu voucher para voar na web.",
    colors: {
      brand: "#06b6d4",
      brandDark: "#0891b2",
      bg: "#020617",
      ink: "#ecfeff",
      muted: "#a5f3fc",
      blue: "#06b6d4",
      loginButtonText: "#020617",
      green: "#10b981",
      registerButtonText: "#ffffff",
      trialButtonBg: "#06b6d4",
      trialButtonText: "#020617",
      cardBg: "#071526",
      cardBorder: "#06b6d4",
      inputBg: "#030a14",
      inputText: "#ecfeff",
      inputBorder: "#0e7490",
      inputPlaceholder: "#67e8f9",
      glassOpacity: 90,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'warp-stars',
      bgEffectSpeed: 'fast',
      cardShape: 'pill',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🚀 Turbo Launch 5G',
      showSecurityBadge: true,
      securityText: '🔒 Ultra Fast Portal',
      showConnectedCount: false,
      connectedCountNumber: '50'
    }
  },
  UserKeys: {
    businessName: "Wi-Fi Arcade & Gamer Club",
    message: "Press Start to Connect! Baixo ping e alta performance para sua melhor gameplay.",
    colors: {
      brand: "#ec4899",
      brandDark: "#db2777",
      bg: "#090514",
      ink: "#fdf2f8",
      muted: "#f472b6",
      blue: "#ec4899",
      loginButtonText: "#ffffff",
      green: "#a855f7",
      registerButtonText: "#ffffff",
      trialButtonBg: "#ec4899",
      trialButtonText: "#ffffff",
      cardBg: "#160a26",
      cardBorder: "#ec4899",
      inputBg: "#0a0412",
      inputText: "#fdf2f8",
      inputBorder: "#831843",
      inputPlaceholder: "#f472b6",
      glassOpacity: 92,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'cyber-grid',
      bgEffectSpeed: 'normal',
      cardShape: 'square',
      cardNoiseTexture: true,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🎮 Low Ping Gamer Net',
      showSecurityBadge: true,
      securityText: '🕹️ 120 FPS Arcade Fiber',
      showConnectedCount: true,
      connectedCountNumber: '89'
    }
  },
  WifiElBarrio: {
    businessName: "Wi-Fi Conecta Bairro",
    message: "Internet livre e gratuita para toda a comunidade. Conecte-se e fique por dentro do bairro.",
    colors: {
      brand: "#f97316",
      brandDark: "#ea580c",
      bg: "#0a0e17",
      ink: "#fff7ed",
      muted: "#fdba74",
      blue: "#f97316",
      loginButtonText: "#0a0e17",
      green: "#0284c7",
      registerButtonText: "#ffffff",
      trialButtonBg: "#f97316",
      trialButtonText: "#0a0e17",
      cardBg: "#101827",
      cardBorder: "#f97316",
      inputBg: "#070c14",
      inputText: "#fff7ed",
      inputBorder: "#7c2d12",
      inputPlaceholder: "#fb923c",
      glassOpacity: 88,
      glassBlur: 10
    },
    effects: {
      bgEffect: 'fireflies',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '📶 Wi-Fi Comunitário',
      showSecurityBadge: true,
      securityText: '🤝 Conexão do Bairro',
      showConnectedCount: true,
      connectedCountNumber: '84'
    }
  },
  "Wifi El Barrio": {
    businessName: "Wi-Fi El Barrio Conectado",
    message: "Internet livre e rápida para todos. Insira seu voucher e navegue à vontade.",
    colors: {
      brand: "#f97316",
      brandDark: "#ea580c",
      bg: "#0a0e17",
      ink: "#fff7ed",
      muted: "#fdba74",
      blue: "#f97316",
      loginButtonText: "#0a0e17",
      green: "#0284c7",
      registerButtonText: "#ffffff",
      trialButtonBg: "#f97316",
      trialButtonText: "#0a0e17",
      cardBg: "#101827",
      cardBorder: "#f97316",
      inputBg: "#070c14",
      inputText: "#fff7ed",
      inputBorder: "#7c2d12",
      inputPlaceholder: "#fb923c",
      glassOpacity: 88,
      glassBlur: 10
    },
    effects: {
      bgEffect: 'fireflies',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '📶 Wi-Fi Livre Comunitário',
      showSecurityBadge: true,
      securityText: '🤝 Rede Aberta do Bairro',
      showConnectedCount: true,
      connectedCountNumber: '76'
    }
  },
  WiFi_Community: {
    businessName: "Wi-Fi Community Open",
    message: "Bem-vindo à rede pública da comunidade! Conecte-se com rapidez e segurança.",
    colors: {
      brand: "#0284c7",
      brandDark: "#0369a1",
      bg: "#030712",
      ink: "#f0f9ff",
      muted: "#7dd3fc",
      blue: "#0284c7",
      loginButtonText: "#ffffff",
      green: "#10b981",
      registerButtonText: "#ffffff",
      trialButtonBg: "#0284c7",
      trialButtonText: "#ffffff",
      cardBg: "#0a1324",
      cardBorder: "#0284c7",
      inputBg: "#050a14",
      inputText: "#f0f9ff",
      inputBorder: "#075985",
      inputPlaceholder: "#38bdf8",
      glassOpacity: 90,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'aurora',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '🌐 Wi-Fi Comunitário 5G',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Segura Aberta',
      showConnectedCount: true,
      connectedCountNumber: '110'
    }
  },
  workspace: {
    businessName: "Wi-Fi Coworking Space",
    message: "Produtividade máxima, café quente e internet de altíssima estabilidade.",
    colors: {
      brand: "#3b82f6",
      brandDark: "#2563eb",
      bg: "#090d16",
      ink: "#f8fafc",
      muted: "#94a3b8",
      blue: "#3b82f6",
      loginButtonText: "#ffffff",
      green: "#10b981",
      registerButtonText: "#ffffff",
      trialButtonBg: "#3b82f6",
      trialButtonText: "#ffffff",
      cardBg: "#0f172a",
      cardBorder: "#3b82f6",
      inputBg: "#070b14",
      inputText: "#f8fafc",
      inputBorder: "#1e293b",
      inputPlaceholder: "#64748b",
      glassOpacity: 90,
      glassBlur: 14
    },
    effects: {
      bgEffect: 'wave-mesh',
      bgEffectSpeed: 'slow',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: false,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: false
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Fibra Dedicada 500Mbps',
      showSecurityBadge: true,
      securityText: '🔒 Rede Corporativa Blindada',
      showConnectedCount: true,
      connectedCountNumber: '42'
    }
  },
  "Window-orange-login": {
    businessName: "Wi-Fi Sunset Lounge",
    message: "Ambiente agradável e internet rápida. Conecte-se e aproveite o momento.",
    colors: {
      brand: "#ea580c",
      brandDark: "#c2410c",
      bg: "#0f0b08",
      ink: "#fff7ed",
      muted: "#fdba74",
      blue: "#ea580c",
      loginButtonText: "#ffffff",
      green: "#d97706",
      registerButtonText: "#ffffff",
      trialButtonBg: "#ea580c",
      trialButtonText: "#ffffff",
      cardBg: "#1c130d",
      cardBorder: "#ea580c",
      inputBg: "#0d0805",
      inputText: "#fff7ed",
      inputBorder: "#7c2d12",
      inputPlaceholder: "#fb923c",
      glassOpacity: 90,
      glassBlur: 14
    },
    effects: {
      bgEffect: 'floating-orbs',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Sunset',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Lounge Segura',
      showConnectedCount: false,
      connectedCountNumber: '28'
    }
  },
  Nougat: {
    businessName: "Wi-Fi Android Nougat",
    message: "Experiência suave e moderna com internet de alta velocidade.",
    colors: {
      brand: "#22c55e",
      brandDark: "#16a34a",
      bg: "#06110b",
      ink: "#f0fdf4",
      muted: "#86efac",
      blue: "#22c55e",
      loginButtonText: "#06110b",
      green: "#06b6d4",
      registerButtonText: "#06110b",
      trialButtonBg: "#22c55e",
      trialButtonText: "#06110b",
      cardBg: "#0c1f15",
      cardBorder: "#22c55e",
      inputBg: "#040d08",
      inputText: "#f0fdf4",
      inputBorder: "#14532d",
      inputPlaceholder: "#4ade80",
      glassOpacity: 90,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'aurora',
      bgEffectSpeed: 'normal',
      cardShape: 'pill',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi Android 5G',
      showSecurityBadge: true,
      securityText: '🔒 Proteção Nougat WPA3',
      showConnectedCount: false,
      connectedCountNumber: '30'
    }
  },
  Random: {
    businessName: "Wi-Fi Prisma Holográfico",
    message: "Conexão vibrante e dinâmica em todas as frequências.",
    colors: {
      brand: "#a855f7",
      brandDark: "#9333ea",
      bg: "#0d0717",
      ink: "#faf5ff",
      muted: "#d8b4fe",
      blue: "#a855f7",
      loginButtonText: "#ffffff",
      green: "#ec4899",
      registerButtonText: "#ffffff",
      trialButtonBg: "#a855f7",
      trialButtonText: "#ffffff",
      cardBg: "#150c26",
      cardBorder: "#a855f7",
      inputBg: "#090412",
      inputText: "#faf5ff",
      inputBorder: "#6b21a8",
      inputPlaceholder: "#c084fc",
      glassOpacity: 92,
      glassBlur: 16
    },
    effects: {
      bgEffect: 'particles',
      bgEffectSpeed: 'fast',
      cardShape: 'scifi-cut',
      cardNoiseTexture: true,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '✨ Prisma High Speed 5G',
      showSecurityBadge: true,
      securityText: '🔒 Holographic Security',
      showConnectedCount: true,
      connectedCountNumber: '60'
    }
  },
  default: {
    businessName: "Super Wi-Fi Hotspot",
    message: "Bem-vindo à nossa rede gratuita. Insira o seu voucher para navegar com máxima velocidade.",
    colors: {
      brand: "#059669",
      brandDark: "#047857",
      bg: "#060d0a",
      ink: "#f0fdf4",
      muted: "#86efac",
      blue: "#10b981",
      loginButtonText: "#060d0a",
      green: "#34d399",
      registerButtonText: "#060d0a",
      trialButtonBg: "#059669",
      trialButtonText: "#ffffff",
      cardBg: "#0c1a14",
      cardBorder: "#059669",
      inputBg: "#060d0a",
      inputText: "#f0fdf4",
      inputBorder: "#166534",
      inputPlaceholder: "#4ade80",
      glassOpacity: 90,
      glassBlur: 12
    },
    effects: {
      bgEffect: 'particles',
      bgEffectSpeed: 'normal',
      cardShape: 'rounded',
      cardNoiseTexture: false,
      cardGlowBorder: true,
      cardTilt3d: false,
      btnShimmer: true,
      btnPulse: false,
      titleGradient: true
    },
    badges: {
      showWifiSpeed: true,
      wifiSpeedText: '⚡ Wi-Fi 5G Ultra Rápido',
      showSecurityBadge: true,
      securityText: '🔒 Conexão Criptografada (WPA3)',
      showConnectedCount: true,
      connectedCountNumber: '42'
    }
  }
};

function generateEffectsMarkup(effects = {}, colors = {}, social = {}, badges = {}, customCode = {}) {
  const bgEffect = effects.bgEffect || 'none';
  const speed = effects.bgEffectSpeed || 'normal';
  const shape = effects.cardShape || 'rounded';
  const brand = colors.brand || '#2563eb';
  const brandDark = colors.brandDark || '#1d4ed8';
  const blue = colors.blue || '#2563eb';
  const green = colors.green || '#10b981';

  let speedSec = 14;
  if (speed === 'slow') speedSec = 24;
  if (speed === 'fast') speedSec = 7;

  let bgHtml = '';
  let cssEffects = '';
  let jsEffects = '';

  if (bgEffect === 'aurora') {
    bgHtml = `
<div id="mg-fx-aurora" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; overflow:hidden; pointer-events:none; background: #05050d;">
  <div class="mg-aurora-blob" style="position:absolute; width:70vw; height:70vw; top:-20%; left:-10%; border-radius:50%; background:radial-gradient(circle, ${brand} 0%, transparent 70%); filter:blur(60px); opacity:0.6; animation: mgAuroraFloat ${speedSec}s ease-in-out infinite alternate;"></div>
  <div class="mg-aurora-blob" style="position:absolute; width:65vw; height:65vw; bottom:-10%; right:-10%; border-radius:50%; background:radial-gradient(circle, ${green} 0%, transparent 70%); filter:blur(60px); opacity:0.5; animation: mgAuroraFloat ${speedSec * 1.3}s ease-in-out infinite alternate-reverse;"></div>
  <div class="mg-aurora-blob" style="position:absolute; width:50vw; height:50vw; top:30%; left:30%; border-radius:50%; background:radial-gradient(circle, ${blue} 0%, transparent 70%); filter:blur(50px); opacity:0.4; animation: mgAuroraPulse ${speedSec * 0.8}s ease-in-out infinite alternate;"></div>
</div>`;
    cssEffects += `
@keyframes mgAuroraFloat {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15%, 15%) scale(1.15) rotate(20deg); }
  100% { transform: translate(-10%, 25%) scale(0.9) rotate(-15deg); }
}
@keyframes mgAuroraPulse {
  0% { transform: scale(0.8); opacity:0.3; }
  100% { transform: scale(1.2); opacity:0.6; }
}
body { background: transparent !important; }
`;
  } else if (bgEffect === 'particles') {
    bgHtml = `
<canvas id="mg-fx-canvas-particles" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#080914;"></canvas>
`;
    jsEffects += `
(function() {
  var canvas = document.getElementById('mg-fx-canvas-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var count = window.innerWidth < 768 ? 35 : 55;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (${speed === 'fast' ? '1.5' : speed === 'slow' ? '0.4' : '0.8'}),
      vy: (Math.random() - 0.5) * (${speed === 'fast' ? '1.5' : speed === 'slow' ? '0.4' : '0.8'}),
      radius: Math.random() * 2.5 + 1,
      color: '${brand}'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx = p.x - p2.x;
        var dy = p.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '${brand}';
          ctx.globalAlpha = 1 - (dist / 90);
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
`;
    cssEffects += `body { background: transparent !important; }`;
  } else if (bgEffect === 'matrix') {
    bgHtml = `
<canvas id="mg-fx-canvas-matrix" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#020508;"></canvas>
`;
    jsEffects += `
(function() {
  var canvas = document.getElementById('mg-fx-canvas-matrix');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  var cols = Math.floor(canvas.width / 18) + 1;
  var ypos = Array(cols).fill(0);
  var chars = '0123456789ABCDEFMIKROTIKHOTSPOT';

  function step() {
    ctx.fillStyle = 'rgba(2, 5, 8, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '${green}';
    ctx.font = '13pt monospace';

    ypos.forEach(function(y, ind) {
      var text = chars.charAt(Math.floor(Math.random() * chars.length));
      var x = ind * 18;
      ctx.fillText(text, x, y);
      if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
      else ypos[ind] = y + 18;
    });
  }
  setInterval(step, ${speed === 'fast' ? '33' : speed === 'slow' ? '80' : '50'});
})();
`;
    cssEffects += `body { background: transparent !important; }`;
  } else if (bgEffect === 'cyber-grid') {
    bgHtml = `
<div id="mg-fx-grid" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; overflow:hidden; background:#050714;">
  <div class="mg-grid-plane" style="position:absolute; width:200%; height:200%; left:-50%; top:20%; background-image: linear-gradient(to right, ${brand}33 1px, transparent 1px), linear-gradient(to bottom, ${brand}33 1px, transparent 1px); background-size: 40px 40px; transform: perspective(350px) rotateX(65deg); animation: mgGridMove ${speedSec * 0.7}s linear infinite;"></div>
</div>
`;
    cssEffects += `
@keyframes mgGridMove {
  0% { transform: perspective(350px) rotateX(65deg) translateY(0); }
  100% { transform: perspective(350px) rotateX(65deg) translateY(40px); }
}
body { background: transparent !important; }
`;
  } else if (bgEffect === 'floating-orbs') {
    bgHtml = `
<div id="mg-fx-orbs" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#050811;">
  <div class="mg-orb" style="position:absolute; width:120px; height:120px; border-radius:50%; background:radial-gradient(circle at 30% 30%, ${brand}, ${brandDark}); top:15%; left:10%; filter:blur(1px); box-shadow:0 0 40px ${brand}88; animation: mgOrbFloat1 ${speedSec}s ease-in-out infinite alternate;"></div>
  <div class="mg-orb" style="position:absolute; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle at 30% 30%, ${blue}, #0f172a); bottom:20%; right:15%; filter:blur(2px); box-shadow:0 0 50px ${blue}66; animation: mgOrbFloat2 ${speedSec * 1.4}s ease-in-out infinite alternate;"></div>
  <div class="mg-orb" style="position:absolute; width:90px; height:90px; border-radius:50%; background:radial-gradient(circle at 30% 30%, ${green}, #064e3b); top:60%; left:20%; filter:blur(1px); box-shadow:0 0 30px ${green}77; animation: mgOrbFloat3 ${speedSec * 0.9}s ease-in-out infinite alternate;"></div>
</div>
`;
    cssEffects += `
@keyframes mgOrbFloat1 { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 80px); } }
@keyframes mgOrbFloat2 { 0% { transform: translate(0, 0); } 100% { transform: translate(-60px, -70px); } }
@keyframes mgOrbFloat3 { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, -50px); } }
body { background: transparent !important; }
`;
  } else if (bgEffect === 'fireflies') {
    bgHtml = `
<canvas id="mg-fx-canvas-fireflies" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#060810;"></canvas>
`;
    jsEffects += `
(function() {
  var canvas = document.getElementById('mg-fx-canvas-fireflies');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var bugs = [];
  var count = 35;
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  for (var i = 0; i < count; i++) {
    bugs.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1.2,
      alpha: Math.random(),
      alphaSpeed: (Math.random() * 0.02 + 0.01) * (${speed === 'fast' ? '1.8' : speed === 'slow' ? '0.6' : '1'})
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < bugs.length; i++) {
      var b = bugs[i];
      b.x += b.vx;
      b.y += b.vy;
      b.alpha += b.alphaSpeed;
      if (b.alpha > 1 || b.alpha < 0.1) b.alphaSpeed *= -1;
      if (b.x < 0) b.x = canvas.width;
      if (b.x > canvas.width) b.x = 0;
      if (b.y < 0) b.y = canvas.height;
      if (b.y > canvas.height) b.y = 0;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '${green}';
      ctx.globalAlpha = Math.max(0.1, Math.min(1, b.alpha));
      ctx.shadowBlur = 12;
      ctx.shadowColor = '${green}';
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
`;
    cssEffects += `body { background: transparent !important; }`;
  } else if (bgEffect === 'warp-stars') {
    bgHtml = `
<canvas id="mg-fx-canvas-warp" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#04060f;"></canvas>
`;
    jsEffects += `
(function() {
  var canvas = document.getElementById('mg-fx-canvas-warp');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [];
  var numStars = 120;
  var warpSpeed = ${speed === 'fast' ? '4' : speed === 'slow' ? '1' : '2'};
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (var i = 0; i < numStars; i++) {
    stars.push({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * canvas.width
    });
  }

  function draw() {
    ctx.fillStyle = 'rgba(4, 6, 15, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.z -= warpSpeed;
      if (s.z <= 0) {
        s.z = canvas.width;
        s.x = (Math.random() - 0.5) * canvas.width * 2;
        s.y = (Math.random() - 0.5) * canvas.height * 2;
      }
      var k = 128 / s.z;
      var px = s.x * k + cx;
      var py = s.y * k + cy;

      if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
        var size = (1 - s.z / canvas.width) * 3;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = '${brand}';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '${blue}';
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
`;
    cssEffects += `body { background: transparent !important; }`;
  } else if (bgEffect === 'wave-mesh') {
    bgHtml = `
<canvas id="mg-fx-canvas-wave" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-2; pointer-events:none; background:#050711;"></canvas>
`;
    jsEffects += `
(function() {
  var canvas = document.getElementById('mg-fx-canvas-wave');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var step = 0;
  var waveSpeed = ${speed === 'fast' ? '0.04' : speed === 'slow' ? '0.01' : '0.02'};

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    step += waveSpeed;
    
    for (var j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (var x = 0; x < canvas.width; x += 10) {
        var y = Math.sin(x * 0.005 + step + (j * 1.5)) * 60 * Math.sin(step * 0.3) + (canvas.height * (0.4 + j * 0.15));
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = j === 0 ? '${brand}' : j === 1 ? '${blue}' : '${green}';
      ctx.globalAlpha = 0.35 - (j * 0.08);
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();
`;
    cssEffects += `body { background: transparent !important; }`;
  }

  // Card Shapes
  if (shape === 'square') {
    cssEffects += `
#box, .login-card, .card {
  border-radius: 4px !important;
}
`;
  } else if (shape === 'pill') {
    cssEffects += `
#box, .login-card, .card {
  border-radius: 36px !important;
}
`;
  } else if (shape === 'scifi-cut') {
    cssEffects += `
#box, .login-card, .card {
  border-radius: 0 !important;
  clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px) !important;
}
`;
  } else {
    cssEffects += `
#box, .login-card, .card {
  border-radius: 20px !important;
}
`;
  }

  // Card Noise Texture
  if (effects.cardNoiseTexture) {
    cssEffects += `
#box, .login-card, .card {
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 0) !important;
  background-size: 12px 12px !important;
}
`;
  }

  // Glow Border
  if (effects.cardGlowBorder) {
    cssEffects += `
#box, .login-card, .card {
  box-shadow: 0 0 25px ${brand}55, 0 8px 32px rgba(0,0,0,0.5) !important;
  border-color: ${brand} !important;
}
`;
  }

  // Button Shimmer
  if (effects.btnShimmer) {
    cssEffects += `
.btn-login, input[type="submit"], button[type="submit"], .btn-primary {
  position: relative;
  overflow: hidden;
}
.btn-login::after, input[type="submit"]::after, button[type="submit"]::after, .btn-primary::after {
  content: '';
  position: absolute;
  top: -50%; left: -60%;
  width: 30%; height: 200%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
  transform: rotate(30deg);
  animation: mgShimmer 3.5s infinite;
}
@keyframes mgShimmer {
  0% { left: -60%; }
  35% { left: 140%; }
  100% { left: 140%; }
}
`;
  }

  // Title Gradient
  if (effects.titleGradient) {
    cssEffects += `
#box h1, #box h2, #box h3, .title {
  background: linear-gradient(135deg, ${brand} 0%, ${green} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
`;
  }

  // Badges
  let badgesHtml = '';
  if (badges && (badges.showWifiSpeed || badges.showSecurityBadge || badges.showConnectedCount)) {
    badgesHtml += `<div id="mg-trust-badges" style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin: 10px 0 16px; width:100%;">`;
    if (badges.showWifiSpeed) {
      badgesHtml += `<span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:3px 8px; border-radius:12px; background:${brand}22; color:${brand}; border:1px solid ${brand}55;">${badges.wifiSpeedText || '⚡ Wi-Fi 5G'}</span>`;
    }
    if (badges.showSecurityBadge) {
      badgesHtml += `<span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:3px 8px; border-radius:12px; background:${green}22; color:${green}; border:1px solid ${green}55;">${badges.securityText || '🔒 Conexão Segura'}</span>`;
    }
    if (badges.showConnectedCount) {
      badgesHtml += `<span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:3px 8px; border-radius:12px; background:#10b98122; color:#10b981; border:1px solid #10b98155;">🟢 ${badges.connectedCountNumber || '42'} online</span>`;
    }
    badgesHtml += `</div>`;
  }

  // WhatsApp Floating Button
  let socialHtml = '';
  if (social && social.whatsappEnabled && social.whatsappNumber) {
    const cleanNum = String(social.whatsappNumber).replace(/\D/g, '');
    const waUrl = `https://wa.me/55${cleanNum}?text=${encodeURIComponent(social.whatsappMessage || 'Olá!')}`;
    socialHtml += `
<a id="mg-wa-float" href="${waUrl}" target="_blank" rel="noopener" style="position:fixed; bottom:20px; right:20px; width:52px; height:52px; border-radius:50%; background:#25D366; color:#ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(37,211,102,0.4); z-index:9999; text-decoration:none; transition:transform 0.2s;">
  <svg style="width:28px; height:28px; fill:currentColor;" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.799-4.394 9.802-9.799.002-2.618-1.01-5.078-2.854-6.924C16.379 2.036 13.916 1.01 11.299 1.01c-5.405 0-9.801 4.393-9.806 9.799-.001 1.792.482 3.548 1.397 5.106L1.879 20.884l5.127-1.345c.001 0 .001 0 0 0zM17.483 14.39c-.33-.165-1.951-.963-2.282-1.082-.33-.12-.57-.18-.81.18-.24.36-.93 1.162-1.14 1.392-.21.23-.42.258-.75.093-1.096-.547-1.847-.98-2.585-2.242-.19-.324.19-.301.545-1.01.095-.19.047-.356-.023-.522-.069-.165-.57-1.374-.781-1.884-.206-.497-.417-.43-.571-.437-.147-.006-.316-.007-.486-.007-.17 0-.447.064-.68.314-.233.249-.89.87-.89 2.122 0 1.25.908 2.459 1.034 2.628.127.17 1.785 2.726 4.325 3.824.604.261 1.076.417 1.443.535.607.192 1.16.165 1.597.1.488-.072 1.951-.798 2.225-1.53.275-.73.275-1.355.193-1.487-.083-.13-.303-.21-.633-.375z"/></svg>
</a>
`;
  }

  // Custom User CSS
  if (customCode && customCode.customCss) {
    cssEffects += `\n/* User Custom CSS */\n${customCode.customCss}\n`;
  }

  return {
    html: bgHtml + (badgesHtml ? `\n<div class="mg-badges-wrap">${badgesHtml}</div>` : '') + socialHtml,
    css: cssEffects,
    js: jsEffects
  };
}

function updateTemplate(templateName) {
  const tplDir = path.join(hotspotDir, templateName);
  if (!fs.existsSync(tplDir) || !fs.statSync(tplDir).isDirectory()) return;

  const preset = THEMES_PRESETS[templateName] || THEMES_PRESETS.default;
  const configPath = path.join(tplDir, 'config.json');
  const loginHtmlPath = path.join(tplDir, 'login.html');

  let currentConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {}
  }

  const mergedConfig = {
    businessName: preset.businessName,
    message: preset.message,
    systemUrl: currentConfig.systemUrl || 'http://portal.wifi.local',
    colors: { ...preset.colors },
    effects: { ...preset.effects },
    social: preset.social ? { ...preset.social } : (currentConfig.social || {
      whatsappEnabled: false,
      whatsappNumber: '',
      whatsappMessage: 'Olá! Preciso de suporte para acessar o Wi-Fi.',
      instagramUrl: '',
      facebookUrl: '',
      googleMapsUrl: '',
    }),
    badges: { ...preset.badges },
    customCode: currentConfig.customCode || { customCss: '' },
    bg: currentConfig.bg || { type: 'default', url: '' },
    ad: currentConfig.ad || { type: 'none', mediaUrl: '', targetUrl: '', items: [], timerEnabled: false, timerDuration: 5 },
    fields: currentConfig.fields || {
      nameEnabled: true,
      nameRequired: true,
      phoneEnabled: true,
      phoneRequired: true,
      birthDateEnabled: true,
      birthDateRequired: true,
      emailEnabled: true,
      emailRequired: false,
      cpfEnabled: true,
      cpfRequired: true,
      genderEnabled: true,
      genderRequired: true,
      passwordEnabled: true,
      passwordRequired: true,
      customFieldEnabled: false,
      customFieldLabel: 'Descreva aqui!',
      customFieldRequired: false,
      optInCoursesEnabled: true,
      optInCoursesLabel: 'Eu aceito receber informações dos cursos'
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2), 'utf8');

  if (fs.existsSync(loginHtmlPath)) {
    let html = fs.readFileSync(loginHtmlPath, 'utf8');

    // 1. Injetar Cores Dinâmicas
    const colorsCss = `<!-- MIKROGESTOR COLORS -->
<style>
  :root {
    --brand: ${mergedConfig.colors.brand};
    --brand-dark: ${mergedConfig.colors.brandDark};
    --bg: ${mergedConfig.colors.bg};
    --ink: ${mergedConfig.colors.ink};
    --text-muted: ${mergedConfig.colors.muted};
    --btn-primary: ${mergedConfig.colors.blue};
    --btn-primary-text: ${mergedConfig.colors.loginButtonText || '#ffffff'};
    --btn-secondary: ${mergedConfig.colors.green};
    --btn-secondary-text: ${mergedConfig.colors.registerButtonText || '#ffffff'};
    --trialButtonBg: ${mergedConfig.colors.trialButtonBg};
    --trialButtonText: ${mergedConfig.colors.trialButtonText};
    --card-bg: ${mergedConfig.colors.cardBg || '#ffffff'};
    --card-border: ${mergedConfig.colors.cardBorder || 'rgba(0,0,0,0.08)'};
    --input-bg: ${mergedConfig.colors.inputBg || '#ffffff'};
    --input-text: ${mergedConfig.colors.inputText || '#0f172a'};
    --input-border: ${mergedConfig.colors.inputBorder || '#e2e8f0'};
    --input-placeholder: ${mergedConfig.colors.inputPlaceholder || '#94a3b8'};
    --glass-opacity: ${mergedConfig.colors.glassOpacity !== undefined ? mergedConfig.colors.glassOpacity : 100}%;
    --glass-blur: ${mergedConfig.colors.glassBlur !== undefined ? mergedConfig.colors.glassBlur : 0}px;
  }

  /* ====== UNIVERSAL THEME STYLING OVERRIDES ====== */
  #heading, header.top-bar, .header-bar {
    background-color: var(--brand) !important;
  }
  
  #box, .login-card, .card, body[class*="theme-"] #box {
    background: color-mix(in srgb, var(--card-bg) var(--glass-opacity), transparent) !important;
    border: 1px solid var(--card-border) !important;
    backdrop-filter: blur(var(--glass-blur)) !important;
    -webkit-backdrop-filter: blur(var(--glass-blur)) !important;
  }

  #box h1, #box h2, #box h3, .card h1, .card h2, .card h3, .title, body[class*="theme-"] #box h1 {
    color: var(--ink) !important;
  }

  #box p, .subtitle, .card p, .instructions, .text-muted, body[class*="theme-"] #box p {
    color: var(--text-muted) !important;
  }

  input[type="text"], input[type="password"], select, .form-input, body[class*="theme-"] input {
    background-color: var(--input-bg) !important;
    color: var(--input-text) !important;
    border-color: var(--input-border) !important;
  }

  input::placeholder {
    color: var(--input-placeholder) !important;
    opacity: 0.8 !important;
  }

  .btn-login, input[type="submit"], button[type="submit"], .btn-primary, body[class*="theme-"] .btn-login {
    background-color: var(--btn-primary) !important;
    color: var(--btn-primary-text) !important;
    border-color: var(--btn-primary) !important;
  }

  #btnSignup, .btn-register, .btn-secondary, body[class*="theme-"] #btnSignup {
    background-color: var(--btn-secondary) !important;
    color: var(--btn-secondary-text) !important;
    border-color: var(--btn-secondary) !important;
  }

  #trial-container button, .btn-trial {
    background-color: var(--trialButtonBg) !important;
    color: var(--trialButtonText) !important;
  }
</style>
<!-- END MIKROGESTOR COLORS -->`;

    const colorsRegex = /<!-- MIKROGESTOR COLORS -->[\s\S]*?<!-- END MIKROGESTOR COLORS -->/;
    if (colorsRegex.test(html)) {
      html = html.replace(colorsRegex, colorsCss);
    } else {
      html = html.replace('</head>', `${colorsCss}\n</head>`);
    }

    // 2. Injetar Efeitos Dinâmicos
    const fx = generateEffectsMarkup(mergedConfig.effects, mergedConfig.colors, mergedConfig.social, mergedConfig.badges, mergedConfig.customCode);
    const effectsBlock = `<!-- MIKROGESTOR EFFECTS -->
<style id="mg-fx-css">
${fx.css}
</style>
${fx.html}
<script id="mg-fx-js">
${fx.js}
</script>
<!-- END MIKROGESTOR EFFECTS -->`;

    const effectsRegex = /<!-- MIKROGESTOR EFFECTS -->[\s\S]*?<!-- END MIKROGESTOR EFFECTS -->/;
    if (effectsRegex.test(html)) {
      html = html.replace(effectsRegex, effectsBlock);
    } else {
      html = html.replace('</body>', `${effectsBlock}\n</body>`);
    }

    fs.writeFileSync(loginHtmlPath, html, 'utf8');
    console.log(`Recreated and compiled theme: ${templateName}`);
  }
}

const templates = fs.readdirSync(hotspotDir).filter(f => fs.statSync(path.join(hotspotDir, f)).isDirectory());
templates.forEach(t => updateTemplate(t));
console.log(`Successfully updated all ${templates.length} templates!`);
