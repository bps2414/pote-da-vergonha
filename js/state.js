// Central Reactive State Store
import { INITIAL_MEMBERS, INITIAL_CHECKINS, INITIAL_DEBTS, SHOP_ITEMS } from './mock-data.js';
import { storage } from './storage.js';
import { sound } from './audio.js';

class StateStore {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');

    const saved = storage.loadLocalState();
    if (saved && saved.room && saved.room.members && saved.room.members.length > 0) {
      this.currentUserId = saved.currentUserId || 'user_me';
      this.room = saved.room;
    } else {
      this.currentUserId = 'user_me';
      this.room = {
        code: roomParam ? roomParam.toUpperCase() : 'BONDE1',
        name: 'Bonde dos Presentes 🔥',
        fineAmount: 5.00,
        createdAt: new Date().toISOString(),
        members: JSON.parse(JSON.stringify(INITIAL_MEMBERS)),
        checkins: JSON.parse(JSON.stringify(INITIAL_CHECKINS)),
        debts: JSON.parse(JSON.stringify(INITIAL_DEBTS)),
        items: JSON.parse(JSON.stringify(SHOP_ITEMS)),
        logs: [
          { text: 'Jorginho tomou falta e deve R$ 5,00 para o pote.', time: 'Há 2 horas' },
          { text: 'Gabi bateu ponto na aula de Matemática!', time: 'Há 45 min' }
        ]
      };
      this.persist();
    }
  }

  createNewRoom(roomName, fineAmount, adminName, adminCity, adminTime, adminPix) {
    const newCode = 'BONDE-' + Math.floor(1000 + Math.random() * 9000);
    const adminId = 'user_' + Date.now();
    const adminUser = {
      id: adminId,
      name: adminName || 'Capitão da Sala',
      avatar: '👑',
      city: adminCity || 'Minha Cidade',
      schoolTime: adminTime || '07:30 - 12:30',
      pixKey: adminPix || '',
      streak: 0,
      totalCheckins: 0,
      totalFails: 0,
      currentDebt: 0.00,
      xp: 100,
      inventory: [],
      isOnline: true
    };

    this.currentUserId = adminId;
    this.room = {
      code: newCode,
      name: roomName || 'Bonde Anti-Falta 🚀',
      fineAmount: Number(fineAmount) || 5.00,
      createdAt: new Date().toISOString(),
      members: [adminUser],
      checkins: [],
      debts: [],
      items: JSON.parse(JSON.stringify(SHOP_ITEMS)),
      logs: [
        { text: `Sala "${roomName}" criada! Convide seus amigos para entrar.`, time: 'Agora' }
      ]
    };

    // Update browser URL without reload
    const newUrl = window.location.pathname + `?room=${newCode}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    this.persist();
    sound.play('applause');
    this.notify('ROOM_CREATED', this.room);
    return this.room;
  }

  joinRoom(roomCode, userName, userCity, userTime, userPix) {
    const targetCode = roomCode.toUpperCase().trim();
    const newId = 'user_' + Date.now();
    const newUser = {
      id: newId,
      name: userName || 'Novo Amigo',
      avatar: ['🤠', '🦊', '🚀', '⚡', '🏆', '🎯', '😎', '🤓'][Math.floor(Math.random() * 8)],
      city: userCity || 'Minha Cidade',
      schoolTime: userTime || '07:30 - 12:30',
      pixKey: userPix || '',
      streak: 0,
      totalCheckins: 0,
      totalFails: 0,
      currentDebt: 0.00,
      xp: 100,
      inventory: [],
      isOnline: true
    };

    // If already in this room, just add user
    if (this.room.code === targetCode) {
      this.currentUserId = newId;
      this.room.members.push(newUser);
      this.room.logs.unshift({
        text: `👋 ${newUser.name} de ${newUser.city} entrou na sala!`,
        time: 'Agora'
      });
    } else {
      // Switch room context
      this.currentUserId = newId;
      this.room = {
        code: targetCode,
        name: `Sala ${targetCode} 🔥`,
        fineAmount: 5.00,
        createdAt: new Date().toISOString(),
        members: [newUser],
        checkins: [],
        debts: [],
        items: JSON.parse(JSON.stringify(SHOP_ITEMS)),
        logs: [
          { text: `👋 ${newUser.name} entrou na sala!`, time: 'Agora' }
        ]
      };
    }

    const newUrl = window.location.pathname + `?room=${targetCode}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    this.persist();
    sound.play('applause');
    this.notify('ROOM_JOINED', { room: this.room, user: newUser });
    return newUser;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, data) {
    this.persist();
    this.listeners.forEach(listener => {
      try {
        listener(this, event, data);
      } catch (e) {
        console.error('Listener notification error:', e);
      }
    });
  }

  persist() {
    storage.saveLocalState({
      currentUserId: this.currentUserId,
      room: this.room
    });
    // Async background sync with Vercel API
    storage.syncWithServer(this.room.code, this.room);
  }

  startAutoSync(intervalMs = 3000) {
    if (this._syncInterval) clearInterval(this._syncInterval);
    
    // Initial fetch from server
    this.pullServerUpdates();

    this._syncInterval = setInterval(() => {
      this.pullServerUpdates();
    }, intervalMs);
  }

  async pullServerUpdates() {
    if (!this.room || !this.room.code) return;
    try {
      const serverRoom = await storage.fetchRoom(this.room.code);
      if (serverRoom && serverRoom.members) {
        let hasChanges = false;

        // Check if members changed
        if (serverRoom.members.length !== this.room.members.length) {
          hasChanges = true;
        }

        // Check if checkins changed
        if ((serverRoom.checkins || []).length !== (this.room.checkins || []).length) {
          hasChanges = true;
        }

        // Check if debts changed
        if ((serverRoom.debts || []).length !== (this.room.debts || []).length) {
          hasChanges = true;
        }

        // Compare timestamps
        if (serverRoom.updatedAt && (!this.room.updatedAt || new Date(serverRoom.updatedAt) > new Date(this.room.updatedAt))) {
          hasChanges = true;
        }

        if (hasChanges) {
          // Merge safely preserving active user
          this.room = {
            ...this.room,
            ...serverRoom
          };
          storage.saveLocalState({
            currentUserId: this.currentUserId,
            room: this.room
          });
          this.notify('SERVER_SYNC', { room: this.room });
        }
      }
    } catch (e) {
      // offline / quiet
    }
  }

  getCurrentUser() {
    return this.room.members.find(m => m.id === this.currentUserId) || this.room.members[0];
  }

  switchActiveUser(userId) {
    const target = this.room.members.find(m => m.id === userId);
    if (target) {
      this.currentUserId = userId;
      this.notify('USER_SWITCHED', target);
    }
  }

  getTotalPotAmount() {
    return this.room.members.reduce((acc, m) => acc + (Number(m.currentDebt) || 0), 0);
  }

  getTopSponsor() {
    const sorted = [...this.room.members].sort((a, b) => b.currentDebt - a.currentDebt);
    return sorted[0] && sorted[0].currentDebt > 0 ? sorted[0] : null;
  }

  // --- ACTIONS ---

  submitCheckin(photoDataUrl, customCity) {
    const user = this.getCurrentUser();
    const newCheckin = {
      id: 'checkin_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userCity: customCity || user.city,
      timestamp: new Date().toISOString(),
      photoUrl: photoDataUrl,
      status: 'APPROVED', // Auto verified or put to vote
      votesValid: 1,
      votesFraud: 0,
      voters: { [user.id]: 'VALID' },
      reactions: { clap: 1, laugh: 0, skull: 0 }
    };

    // Update user stats
    user.streak = (user.streak || 0) + 1;
    user.totalCheckins = (user.totalCheckins || 0) + 1;
    user.xp = (user.xp || 0) + 50;

    this.room.checkins.unshift(newCheckin);
    this.room.logs.unshift({
      text: `${user.name} bateu ponto com foto na sala! (+50 XP)`,
      time: 'Agora'
    });

    sound.play('applause');
    this.notify('CHECKIN_SUBMITTED', newCheckin);
  }

  voteCheckin(checkinId, voteType) {
    const checkin = this.room.checkins.find(c => c.id === checkinId);
    const user = this.getCurrentUser();
    if (!checkin) return;

    if (!checkin.voters) checkin.voters = {};
    const prevVote = checkin.voters[user.id];

    if (prevVote === voteType) return; // already voted

    // Revert previous vote count
    if (prevVote === 'VALID') checkin.votesValid = Math.max(0, (checkin.votesValid || 1) - 1);
    if (prevVote === 'FRAUD') checkin.votesFraud = Math.max(0, (checkin.votesFraud || 1) - 1);

    // Apply new vote
    checkin.voters[user.id] = voteType;
    if (voteType === 'VALID') {
      checkin.votesValid = (checkin.votesValid || 0) + 1;
      sound.play('applause');
    } else {
      checkin.votesFraud = (checkin.votesFraud || 0) + 1;
      sound.play('fraud_buzzer');
    }

    // Consensus rule: If fraud votes exceed valid votes
    const totalVotes = (checkin.votesValid || 0) + (checkin.votesFraud || 0);
    if (totalVotes >= 2) {
      if (checkin.votesFraud > checkin.votesValid) {
        checkin.status = 'FRAUD';
        // Apply penalty to author if not already fined
        const author = this.room.members.find(m => m.id === checkin.userId);
        if (author && !checkin.fineApplied) {
          checkin.fineApplied = true;
          author.currentDebt = (author.currentDebt || 0) + this.room.fineAmount;
          author.totalFails = (author.totalFails || 0) + 1;
          author.streak = 0;
          this.room.logs.unshift({
            text: `🚨 ${author.name} teve o check-in reprovado no Tribunal! Multa de R$ ${this.room.fineAmount.toFixed(2)} aplicada!`,
            time: 'Agora'
          });
        }
      } else {
        checkin.status = 'APPROVED';
      }
    }

    this.notify('VOTE_CAST', { checkin, voteType });
  }

  reactCheckin(checkinId, reactionType) {
    const checkin = this.room.checkins.find(c => c.id === checkinId);
    if (!checkin) return;
    if (!checkin.reactions) checkin.reactions = { clap: 0, laugh: 0, skull: 0 };
    checkin.reactions[reactionType] = (checkin.reactions[reactionType] || 0) + 1;

    if (reactionType === 'laugh') sound.play('laugh');
    else if (reactionType === 'clap') sound.play('applause');
    else if (reactionType === 'skull') sound.play('fraud_buzzer');

    this.notify('REACTION_ADDED', { checkinId, reactionType });
  }

  // --- 2-STEP DEBT PAYMENT SYSTEM ---
  
  // Step 1: Debtor clicks "Já Paguei"
  markDebtAsPaidByDebtor(debtId) {
    const debt = this.room.debts.find(d => d.id === debtId);
    if (!debt) return;

    debt.status = 'PENDING_CONFIRMATION';
    debt.paidAt = new Date().toISOString();

    this.room.logs.unshift({
      text: `💸 ${debt.debtorName} marcou dívida de R$ ${debt.amount.toFixed(2)} como paga. Aguardando confirmação de ${debt.creditorName}.`,
      time: 'Agora'
    });

    sound.play('coin');
    this.notify('DEBT_PAYMENT_REQUESTED', debt);
  }

  // Step 2: Creditor confirms or rejects
  confirmDebtReceipt(debtId, isConfirmed) {
    const debt = this.room.debts.find(d => d.id === debtId);
    if (!debt) return;

    if (isConfirmed) {
      debt.status = 'PAID';
      debt.confirmedAt = new Date().toISOString();

      // Deduct debt from debtor's account
      const debtor = this.room.members.find(m => m.id === debt.debtorId);
      if (debtor) {
        debtor.currentDebt = Math.max(0, (debtor.currentDebt || 0) - debt.amount);
      }

      this.room.logs.unshift({
        text: `✅ ${debt.creditorName} confirmou o recebimento de R$ ${debt.amount.toFixed(2)} de ${debt.debtorName}! Dívida quitada.`,
        time: 'Agora'
      });

      sound.play('paid_success');
    } else {
      debt.status = 'OPEN';
      delete debt.paidAt;

      this.room.logs.unshift({
        text: `❌ ${debt.creditorName} informou que o PIX de R$ ${debt.amount.toFixed(2)} NÃO CAIU. Dívida segue aberta!`,
        time: 'Agora'
      });

      sound.play('fraud_buzzer');
    }

    this.notify('DEBT_STATUS_UPDATED', debt);
  }

  // --- SHOP & GAMIFICATION ---

  buyItem(itemId) {
    const user = this.getCurrentUser();
    const item = this.room.items.find(i => i.id === itemId);
    if (!item) return { success: false, msg: 'Item não encontrado' };

    if ((user.xp || 0) < item.priceXP) {
      return { success: false, msg: `XP insuficiente! Você precisa de ${item.priceXP} XP.` };
    }

    user.xp -= item.priceXP;
    if (!user.inventory) user.inventory = [];
    user.inventory.push(itemId);

    this.room.logs.unshift({
      text: `🛒 ${user.name} comprou "${item.name}" na Lojinha!`,
      time: 'Agora'
    });

    sound.play('card_buy');
    this.notify('ITEM_BOUGHT', item);
    return { success: true, item };
  }

  useItem(itemId, targetUserId) {
    const user = this.getCurrentUser();
    if (!user.inventory || !user.inventory.includes(itemId)) {
      return { success: false, msg: 'Você não possui este item.' };
    }

    const item = this.room.items.find(i => i.id === itemId);
    if (!item) return { success: false, msg: 'Item inválido.' };

    // Remove 1 instance from inventory
    const index = user.inventory.indexOf(itemId);
    user.inventory.splice(index, 1);

    if (item.action === 'CANCEL_FINE') {
      if (user.currentDebt > 0) {
        user.currentDebt = Math.max(0, user.currentDebt - this.room.fineAmount);
        this.room.logs.unshift({
          text: `📜 ${user.name} usou um Atestado Médico e anulou R$ ${this.room.fineAmount.toFixed(2)} de multa!`,
          time: 'Agora'
        });
        sound.play('applause');
        this.notify('ITEM_USED', { item, user });
        return { success: true, msg: 'Atestado usado com sucesso! Multa anulada.' };
      } else {
        // Return item
        user.inventory.push(itemId);
        return { success: false, msg: 'Você não tem multas pendentes para anular!' };
      }
    }

    if (item.action === 'SEND_ALARM') {
      const target = this.room.members.find(m => m.id === targetUserId);
      const targetName = target ? target.name : 'um amigo';
      this.room.logs.unshift({
        text: `⏰ ${user.name} ativou a Bomba de Despertador para acordar ${targetName}!`,
        time: 'Agora'
      });
      sound.play('alarm');
      this.notify('ITEM_USED', { item, target });
      return { success: true, msg: `Alarme disparado para ${targetName}!` };
    }

    if (item.action === 'ADD_TOLERANCE') {
      this.room.logs.unshift({
        text: `🛡️ ${user.name} ativou o Escudo de Tolerância (+45 min)!`,
        time: 'Agora'
      });
      sound.play('card_buy');
      this.notify('ITEM_USED', { item });
      return { success: true, msg: 'Escudo ativado! Você ganhou tolerância extra.' };
    }

    this.notify('ITEM_USED', { item });
    return { success: true };
  }

  updateProfile(data) {
    const user = this.getCurrentUser();
    Object.assign(user, data);
    this.notify('PROFILE_UPDATED', user);
  }

  addNewMember(name, city, time, pix) {
    const newId = 'user_' + Date.now();
    const newMember = {
      id: newId,
      name: name || 'Novo Amigo',
      avatar: ['🤠', '🦊', '🚀', '⚡', '🏆', '🎯'][Math.floor(Math.random() * 6)],
      city: city || 'São Paulo - SP',
      schoolTime: time || '07:30 - 12:30',
      pixKey: pix || 'amigo@pix.com',
      streak: 0,
      totalCheckins: 0,
      totalFails: 0,
      currentDebt: 0.00,
      xp: 100,
      inventory: [],
      isOnline: true
    };
    this.room.members.push(newMember);
    this.notify('MEMBER_ADDED', newMember);
    return newMember;
  }

  resetMockData() {
    this.room.members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    this.room.checkins = JSON.parse(JSON.stringify(INITIAL_CHECKINS));
    this.room.debts = JSON.parse(JSON.stringify(INITIAL_DEBTS));
    this.persist();
    this.notify('DATA_RESET', null);
  }
}

export const state = new StateStore();
