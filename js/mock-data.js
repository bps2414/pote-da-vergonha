// Realistic Mock Friends & Initial Data
// Friends from different cities for immediate out-of-the-box demonstration

export const INITIAL_MEMBERS = [
  {
    id: 'user_me',
    name: 'Você (Capitão)',
    avatar: '😎',
    city: 'São Paulo - SP',
    schoolTime: '07:15 - 12:30',
    pixKey: 'voce@pix.com.br',
    streak: 4,
    totalCheckins: 14,
    totalFails: 1,
    currentDebt: 5.00,
    xp: 420,
    inventory: ['item_atestado'],
    isOnline: true
  },
  {
    id: 'user_jorginho',
    name: 'Jorginho Soneca',
    avatar: '😴',
    city: 'Curitiba - PR',
    schoolTime: '07:30 - 12:45',
    pixKey: 'jorginho.curitiba@email.com',
    streak: 0,
    totalCheckins: 6,
    totalFails: 5,
    currentDebt: 25.00,
    xp: 60,
    inventory: [],
    isOnline: true
  },
  {
    id: 'user_gabi',
    name: 'Gabi 100% Nerd',
    avatar: '🤓',
    city: 'Rio de Janeiro - RJ',
    schoolTime: '08:00 - 13:00',
    pixKey: 'gabi.rio@nubank.pix',
    streak: 12,
    totalCheckins: 16,
    totalFails: 0,
    currentDebt: 0.00,
    xp: 980,
    inventory: ['item_escudo', 'item_alarme'],
    isOnline: true
  },
  {
    id: 'user_matheus',
    name: 'Matheus do Grau',
    avatar: '🏍️',
    city: 'Belo Horizonte - MG',
    schoolTime: '13:30 - 18:20',
    pixKey: '31998877665',
    streak: 1,
    totalCheckins: 10,
    totalFails: 3,
    currentDebt: 15.00,
    xp: 210,
    inventory: [],
    isOnline: false
  }
];

// Sample Check-in Photos for the Live Tribunal (SVG Data URLs to guarantee instant rendering offline)
export const INITIAL_CHECKINS = [
  {
    id: 'checkin_gabi_today',
    userId: 'user_gabi',
    userName: 'Gabi 100% Nerd',
    userAvatar: '🤓',
    userCity: 'Rio de Janeiro - RJ',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%231e293b"/><text x="300" y="180" fill="%2338bdf8" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">LOUSA DA SALA 3B 📚</text><text x="300" y="240" fill="%23e2e8f0" font-family="sans-serif" font-size="20" text-anchor="middle">Matemática: Matrizes e Determinantes</text><circle cx="300" cy="340" r="40" fill="%2310b981"/><text x="300" y="348" fill="%23ffffff" font-size="24" text-anchor="middle">🤓✌️</text></svg>',
    status: 'APPROVED', // 'PENDING', 'APPROVED', 'FRAUD'
    votesValid: 3,
    votesFraud: 0,
    voters: {
      user_me: 'VALID',
      user_jorginho: 'VALID',
      user_matheus: 'VALID'
    },
    reactions: {
      clap: 4,
      laugh: 1,
      skull: 0
    }
  },
  {
    id: 'checkin_jorginho_today',
    userId: 'user_jorginho',
    userName: 'Jorginho Soneca',
    userAvatar: '😴',
    userCity: 'Curitiba - PR',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%233f2c22"/><text x="300" y="190" fill="%23f97316" font-family="sans-serif" font-size="26" font-weight="bold" text-anchor="middle">FOTO SUSPEITA NA CAMA 🛏️</text><text x="300" y="240" fill="%23cbd5e1" font-family="sans-serif" font-size="18" text-anchor="middle">"Juro que cheguei no portão"</text><circle cx="300" cy="330" r="40" fill="%23ef4444"/><text x="300" y="338" fill="%23ffffff" font-size="24" text-anchor="middle">😴💤</text></svg>',
    status: 'PENDING',
    votesValid: 0,
    votesFraud: 2,
    voters: {
      user_gabi: 'FRAUD',
      user_matheus: 'FRAUD'
    },
    reactions: {
      clap: 0,
      laugh: 5,
      skull: 3
    }
  }
];

// Initial active debts with 2-stage payment confirmation simulation
export const INITIAL_DEBTS = [
  {
    id: 'debt_jorginho_1',
    debtorId: 'user_jorginho',
    debtorName: 'Jorginho Soneca',
    creditorId: 'user_gabi',
    creditorName: 'Gabi 100% Nerd',
    creditorPix: 'gabi.rio@nubank.pix',
    amount: 15.00,
    reason: 'Falta na 2ª e 4ª feira',
    status: 'OPEN', // 'OPEN', 'PENDING_CONFIRMATION', 'PAID'
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'debt_matheus_1',
    debtorId: 'user_matheus',
    debtorName: 'Matheus do Grau',
    creditorId: 'user_me',
    creditorName: 'Você (Capitão)',
    creditorPix: 'voce@pix.com.br',
    amount: 10.00,
    reason: 'Falta na 3ª feira',
    status: 'PENDING_CONFIRMATION', // Debtor clicked "Já Paguei", waiting for creditor!
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

export const SHOP_ITEMS = [
  {
    id: 'item_atestado',
    name: 'Atestado Médico Virtual 📜',
    icon: '📜',
    priceXP: 300,
    desc: 'Anula 1 falta acumulada e remove a multa de R$ 5,00 do seu saldo devedor.',
    action: 'CANCEL_FINE'
  },
  {
    id: 'item_alarme',
    name: 'Bomba de Despertador ⏰',
    icon: '⏰',
    priceXP: 150,
    desc: 'Dispara um som de alarme estridente no aplicativo de um amigo preguiçoso.',
    action: 'SEND_ALARM'
  },
  {
    id: 'item_escudo',
    name: 'Escudo de Tolerância 🛡️',
    icon: '🛡️',
    priceXP: 200,
    desc: 'Garante +45 minutos de tolerância para você enviar a foto da sala sem tomar falta.',
    action: 'ADD_TOLERANCE'
  }
];
