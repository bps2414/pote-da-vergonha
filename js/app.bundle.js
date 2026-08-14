
// Universal Production Bundle for Quem Falta Se Ferra
(function() {
  'use strict';
  
  // 1. Audio Engine
  // Web Audio API Procedural Sound Synthesizer
// Generates funny, arcade and feedback sound effects without external audio assets

class SoundEffectsEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (type) {
        case 'pot_add':
        case 'coin':
          this._playCoin(now);
          break;
        case 'fraud_buzzer':
        case 'buzzer':
          this._playBuzzer(now);
          break;
        case 'camera_shutter':
          this._playShutter(now);
          break;
        case 'applause':
        case 'cheer':
          this._playSuccessChord(now);
          break;
        case 'laugh':
        case 'deboche':
          this._playLaugh(now);
          break;
        case 'paid_success':
          this._playPaymentChime(now);
          break;
        case 'alarm':
          this._playAlarm(now);
          break;
        case 'card_buy':
          this._playMagicChime(now);
          break;
        default:
          this._playPop(now);
          break;
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  _playCoin(t) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.frequency.setValueAtTime(1318.51, t);
    osc2.frequency.setValueAtTime(1760.00, t + 0.08); // A6

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.5);
    osc2.stop(t + 0.5);
  }

  _playBuzzer(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.4);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  _playShutter(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  _playSuccessChord(t) {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.2, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.6);
    });
  }

  _playLaugh(t) {
    const pitches = [400, 320, 420, 300, 440];
    pitches.forEach((p, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(p, t + i * 0.08);

      gain.gain.setValueAtTime(0.25, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.07);
    });
  }

  _playPaymentChime(t) {
    [659.25, 880, 1174.66, 1760].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);

      gain.gain.setValueAtTime(0.28, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.8);
    });
  }

  _playAlarm(t) {
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, t + i * 0.15);

      gain.gain.setValueAtTime(0.2, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.1);
    }
  }

  _playMagicChime(t) {
    [440, 554.37, 659.25, 830.61, 987.77].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + idx * 0.05);

      gain.gain.setValueAtTime(0.18, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.5);
    });
  }

  _playPop(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }
}
const sound = new SoundEffectsEngine();

  
  // 2. Camera Engine
  // Camera Capture & BeReal-style Watermark Canvas Engine
class CameraEngine {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.stream = null;
    this.facingMode = 'environment'; // default rear camera
  }

  async startStream() {
    this.stopStream();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });
      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
        return true;
      }
    } catch (err) {
      console.warn('Camera access not available or denied:', err);
      return false;
    }
  }

  toggleFacingMode() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    return this.startStream();
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  captureFrame(userName, userCity) {
    if (!this.video || !this.canvas) return null;

    const width = this.video.videoWidth || 640;
    const height = this.video.videoHeight || 480;

    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');

    // Draw camera image
    ctx.drawImage(this.video, 0, 0, width, height);

    // Apply Watermark Overlay
    this._applyWatermark(ctx, width, height, userName, userCity);

    return this.canvas.toDataURL('image/jpeg', 0.88);
  }

  processUploadedImage(imgElement, userName, userCity) {
    if (!this.canvas) return null;

    const width = imgElement.naturalWidth || 640;
    const height = imgElement.naturalHeight || 480;

    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');

    ctx.drawImage(imgElement, 0, 0, width, height);
    this._applyWatermark(ctx, width, height, userName, userCity);

    return this.canvas.toDataURL('image/jpeg', 0.88);
  }

  _applyWatermark(ctx, width, height, userName, userCity) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('pt-BR');

    // Semi-transparent bottom bar
    const barHeight = Math.max(50, Math.floor(height * 0.12));
    ctx.fillStyle = 'rgba(10, 13, 20, 0.82)';
    ctx.fillRect(0, height - barHeight, width, barHeight);

    // Accent line
    ctx.fillStyle = '#ff2a5f';
    ctx.fillRect(0, height - barHeight, width, 3);

    // Watermark text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(barHeight * 0.35)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(`📍 ${userCity} • ${userName}`, 16, height - barHeight * 0.52);

    ctx.fillStyle = '#ffb703';
    ctx.font = `bold ${Math.floor(barHeight * 0.32)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`🕒 ${dateStr} ${timeStr}`, width - 16, height - barHeight * 0.52);

    // Top Stamp
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.font = `bold ${Math.floor(barHeight * 0.28)}px sans-serif`;
    ctx.fillText('🔴 AO VIVO • BATE-PONTO ESCOLAR', 16, 28);
  }
}

  
  // 3. Storage Layer
  // Storage & API Sync Layer
// Handles offline-first LocalStorage and Vercel Serverless Sync

const STORAGE_KEY = 'pote_da_vergonha_state_v1';
const storage = {
  loadLocalState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load local state:', e);
      return null;
    }
  },

  saveLocalState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save local state:', e);
    }
  },

  async syncWithServer(roomCode, roomState) {
    if (!roomCode) return roomState;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC',
          code: roomCode,
          room: roomState
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.room || roomState;
      }
    } catch (e) {
      console.warn('Network sync offline fallback:', e);
    }
    return roomState;
  },

  async fetchRoom(roomCode) {
    try {
      const res = await fetch(`/api/rooms?code=${encodeURIComponent(roomCode)}`);
      if (res.ok) {
        const data = await res.json();
        return data.room;
      }
    } catch (e) {
      console.warn('Could not fetch room from server:', e);
    }
    return null;
  }
};

  
  // 4. State Management
  // Central Reactive State Store



class StateStore {
  constructor() {
    this.listeners = [];
    this.room = null;
    this.currentUserId = null;
    this.init();
  }

  init() {
    const saved = storage.loadLocalState();
    if (saved && saved.room && saved.currentUserId && saved.room.members && saved.room.members.length > 0) {
      this.currentUserId = saved.currentUserId;
      this.room = saved.room;
    } else {
      this.currentUserId = null;
      this.room = null;
    }
  }

  isConfigured() {
    return !!(this.room && this.currentUserId && this.room.members && this.room.members.length > 0);
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
    if (!this.room || !this.room.members || this.room.members.length === 0) return null;
    return this.room.members.find(m => m.id === this.currentUserId) || this.room.members[0] || null;
  }

  switchActiveUser(userId) {
    if (!this.room || !this.room.members) return;
    const target = this.room.members.find(m => m.id === userId);
    if (target) {
      this.currentUserId = userId;
      this.notify('USER_SWITCHED', target);
    }
  }

  getTotalPotAmount() {
    if (!this.room || !this.room.members) return 0;
    return this.room.members.reduce((acc, m) => acc + (Number(m.currentDebt) || 0), 0);
  }

  getTopSponsor() {
    if (!this.room || !this.room.members || this.room.members.length === 0) return null;
    const sorted = [...this.room.members].sort((a, b) => (b.currentDebt || 0) - (a.currentDebt || 0));
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
const state = new StateStore();

  
  // 5. Tribunal Module
  // Tribunal dos Amigos - Live Feed & Voting Logic
function renderTribunalFeed(containerElement) {
  if (!containerElement) return;

  const checkins = state.room.checkins || [];
  const currentUserId = state.currentUserId;

  if (checkins.length === 0) {
    containerElement.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <div style="font-size: 40px; margin-bottom: 10px;">📸</div>
        <p style="font-weight: 700;">Nenhum check-in enviado hoje ainda.</p>
        <p style="font-size: 12px; margin-top: 4px;">Seja o primeiro a bater ponto na sala de aula!</p>
      </div>
    `;
    return;
  }

  containerElement.innerHTML = checkins.map(checkin => {
    const totalVotes = (checkin.votesValid || 0) + (checkin.votesFraud || 0);
    const validPct = totalVotes > 0 ? Math.round((checkin.votesValid / totalVotes) * 100) : 50;
    const fraudPct = 100 - validPct;

    const userVote = checkin.voters ? checkin.voters[currentUserId] : null;
    const isApproved = checkin.status === 'APPROVED';
    const isFraud = checkin.status === 'FRAUD';

    const reactions = checkin.reactions || { clap: 0, laugh: 0, skull: 0 };

    return `
      <div class="tribunal-card ${isFraud ? 'fraudulent' : ''} ${isApproved ? 'approved' : ''}" data-checkin-id="${checkin.id}">
        <!-- Header -->
        <div class="tribunal-card-header">
          <div class="user-meta-group">
            <div class="user-avatar-badge">${checkin.userAvatar || '🎓'}</div>
            <div class="user-text-info">
              <span class="user-full-name">${escapeHtml(checkin.userName)}</span>
              <span class="user-location-time">📍 ${escapeHtml(checkin.userCity)} • ${formatRelativeTime(checkin.timestamp)}</span>
            </div>
          </div>
          ${isFraud ? `<span class="photo-status-stamp stamp-fraud stamp-slam">🚨 FRAUDE</span>` : ''}
          ${isApproved && totalVotes >= 2 ? `<span class="photo-status-stamp stamp-valid stamp-slam">✅ VÁLIDO</span>` : ''}
        </div>

        <!-- Photo -->
        <div class="tribunal-photo-container">
          <img src="${checkin.photoUrl}" alt="Foto de presença" class="tribunal-photo-img" loading="lazy" />
        </div>

        <!-- Approval Meter -->
        <div class="approval-meter-wrap">
          <div class="approval-meta">
            <span style="color: var(--emerald-presence);">👍 ${checkin.votesValid || 0} Válido (${validPct}%)</span>
            <span style="color: var(--crimson-penalty);">🚨 ${checkin.votesFraud || 0} Fraude (${fraudPct}%)</span>
          </div>
          <div class="approval-progress-track">
            <div class="approval-fill-valid" style="width: ${validPct}%;"></div>
            <div class="approval-fill-fraud" style="width: ${fraudPct}%;"></div>
          </div>
        </div>

        <!-- Voting Actions -->
        <div class="tribunal-vote-actions">
          <button class="btn-vote btn-vote-valid ${userVote === 'VALID' ? 'active' : ''}" onclick="window.__vote('${checkin.id}', 'VALID')">
            👍 VÁLIDO ${userVote === 'VALID' ? '✓' : ''}
          </button>
          <button class="btn-vote btn-vote-fraud ${userVote === 'FRAUD' ? 'active' : ''}" onclick="window.__vote('${checkin.id}', 'FRAUD')">
            🚨 É GOLPE/FRAUDE ${userVote === 'FRAUD' ? '✓' : ''}
          </button>
        </div>

        <!-- Live Reaction Sounds Bar -->
        <div class="reaction-sound-bar">
          <button class="reaction-btn" onclick="window.__react('${checkin.id}', 'laugh', event)">
            😂 Deboche <span style="font-weight:800; color:var(--text-primary);">${reactions.laugh || 0}</span>
          </button>
          <button class="reaction-btn" onclick="window.__react('${checkin.id}', 'clap', event)">
            👏 Palmas <span style="font-weight:800; color:var(--text-primary);">${reactions.clap || 0}</span>
          </button>
          <button class="reaction-btn" onclick="window.__react('${checkin.id}', 'skull', event)">
            💀 Morte <span style="font-weight:800; color:var(--text-primary);">${reactions.skull || 0}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora mesmo';
  if (mins < 60) return `Há ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `Há ${hours}h`;
}

  
  // 6. Finance & Settlement Module
  // Pot Finance & 2-Stage Debt Settlement Engine
function calculateSettlement() {
  const members = (state.room && state.room.members) ? state.room.members : [];
  const totalPot = state.getTotalPotAmount ? state.getTotalPotAmount() : 0;

  if (members.length === 0) {
    return {
      totalPot: 0,
      minFails: 0,
      winners: [],
      prizePerWinner: 0
    };
  }

  const minFails = Math.min(...members.map(m => m.totalFails || 0));
  const winners = members.filter(m => (m.totalFails || 0) === minFails);
  const prizePerWinner = winners.length > 0 ? (totalPot / winners.length) : 0;

  return {
    totalPot,
    minFails: isFinite(minFails) ? minFails : 0,
    winners,
    prizePerWinner
  };
}
function renderExtratoFinanceiro(containerElement) {
  if (!containerElement) return;

  const currentUserId = state.currentUserId;
  const settlement = calculateSettlement();
  const debts = (state.room && state.room.debts) ? state.room.debts : [];

  containerElement.innerHTML = `
    <!-- Settlement & Prize Distribution Banner -->
    <div class="settlement-summary-box">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; font-weight:800; color:var(--amber-pot); text-transform:uppercase; letter-spacing:0.05em;">
          🏆 Divisão do Pote Mensal
        </span>
        <span style="font-family:var(--font-mono); font-size:14px; font-weight:800; color:var(--amber-pot);">
          Total: R$ ${settlement.totalPot.toFixed(2)}
        </span>
      </div>

      <div style="font-size:13px; color:var(--text-secondary);">
        ${settlement.winners.length > 0 
          ? `Quem teve apenas <b>${settlement.minFails} faltas</b> divide o cofre:` 
          : 'Nenhum membro registrado.'}
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${settlement.winners.map(w => `
          <div class="settlement-winner-row">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${w.avatar}</span>
              <span style="font-weight:700; color:var(--text-primary);">${escapeHtml(w.name)}</span>
              <span style="font-size:10px; color:var(--emerald-presence); font-weight:800;">(100% Nerd)</span>
            </div>
            <span style="font-family:var(--font-mono); font-weight:800; color:var(--emerald-presence);">
              + R$ ${settlement.prizePerWinner.toFixed(2)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Active Debts & 2-Step Settlement List -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
      <h3 style="font-family:var(--font-display); font-size:16px; font-weight:800;">
        💸 Cobranças & Confirmações (Anti-Calote)
      </h3>
      <span style="font-size:11px; color:var(--text-muted);">${debts.length} pendências</span>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px;">
      ${debts.length === 0 ? `
        <div style="text-align:center; padding:30px; color:var(--text-muted);">
          <div style="font-size:32px; margin-bottom:8px;">🕊️</div>
          <p>Nenhuma dívida registrada. Todo mundo em dia!</p>
        </div>
      ` : debts.map(debt => renderDebtCard(debt, currentUserId)).join('')}
    </div>
  `;
}

function renderDebtCard(debt, currentUserId) {
  const isDebtor = debt.debtorId === currentUserId;
  const isCreditor = debt.creditorId === currentUserId;

  let statusHtml = '';
  if (debt.status === 'OPEN') {
    statusHtml = `<span class="debt-status-pill open">⏳ EM ABERTO</span>`;
  } else if (debt.status === 'PENDING_CONFIRMATION') {
    statusHtml = `<span class="debt-status-pill pending_confirmation">⚠️ AGUARDANDO CONFIRMAÇÃO DO CREDOR</span>`;
  } else if (debt.status === 'PAID') {
    statusHtml = `<span class="debt-status-pill paid">✅ QUITADO / PAGO</span>`;
  }

  // Zap billing link
  const zapMessage = encodeURIComponent(
    `🚨 *COBRANÇA: QUEM FALTA SE FERRA* 🚨\n\n` +
    `Fala ${debt.debtorName}, você faltou na aula (${debt.reason}) e deve *R$ ${debt.amount.toFixed(2)}* pro cofre!\n\n` +
    `🔑 Chave PIX: ${debt.creditorPix || 'combinar no privado'}\n\n` +
    `Paga aí e depois clica em "Já Paguei" no aplicativo para eu confirmar! 🚀`
  );
  const zapLink = `https://api.whatsapp.com/send?text=${zapMessage}`;

  return `
    <div class="debt-item-card" data-debt-id="${debt.id}">
      <div class="debt-card-header">
        <div>
          <div style="font-size:13px; font-weight:700; color:var(--text-primary);">
            <b>${escapeHtml(debt.debtorName)}</b> deve para <b>${escapeHtml(debt.creditorName)}</b>
          </div>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
            Motivo: ${escapeHtml(debt.reason)}
          </div>
        </div>
        <div style="text-align:right;">
          <div class="debt-amount-big">R$ ${debt.amount.toFixed(2)}</div>
          <div style="margin-top:4px;">${statusHtml}</div>
        </div>
      </div>

      <!-- PIX Key Box -->
      <div class="pix-key-box">
        <span>🔑 PIX: <b style="color:var(--text-primary);">${escapeHtml(debt.creditorPix || 'Não informada')}</b></span>
        <button class="copy-pix-btn" onclick="window.__copyPix('${escapeHtml(debt.creditorPix)}')">
          📋 Copiar PIX
        </button>
      </div>

      <!-- Actions based on role and status -->
      <div class="debt-actions-row">
        <!-- Anyone can trigger Zap reminder -->
        <a href="${zapLink}" target="_blank" class="btn-whatsapp-cobrar" style="text-decoration:none;">
          📢 Cobrar no Zap
        </a>

        ${debt.status === 'OPEN' ? `
          <button class="btn-ja-paguei" onclick="window.__markAsPaid('${debt.id}')">
            💸 Já Paguei (Mandar Comprovante)
          </button>
        ` : ''}

        ${debt.status === 'PENDING_CONFIRMATION' ? `
          <button class="btn-confirmar-recebimento" onclick="window.__confirmReceipt('${debt.id}', true)">
            ✅ Confirmar Recebimento
          </button>
          <button class="btn-recusar-pagamento" onclick="window.__confirmReceipt('${debt.id}', false)">
            ❌ Não Caiu
          </button>
        ` : ''}

        ${debt.status === 'PAID' ? `
          <div style="font-size:12px; font-weight:700; color:var(--emerald-presence); display:flex; align-items:center; gap:6px;">
            ✨ Dívida quitada com sucesso!
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

  
  // 7. Gamification & Ranking Module
  // Gamification, Shame Badges, Ranking and XP Card Shop
function getMemberTitle(member, allMembers) {
  const sortedByDebt = [...allMembers].sort((a, b) => (b.currentDebt || 0) - (a.currentDebt || 0));
  const sortedByStreak = [...allMembers].sort((a, b) => (b.streak || 0) - (a.streak || 0));
  const sortedByFails = [...allMembers].sort((a, b) => (b.totalFails || 0) - (a.totalFails || 0));

  if (member.currentDebt > 0 && member.id === sortedByDebt[0]?.id) {
    return { title: '💸 Patrocinador do Bonde', type: 'shame' };
  }
  if (member.totalFails >= 4 && member.id === sortedByFails[0]?.id) {
    return { title: '👻 Aluno Fantasma', type: 'shame' };
  }
  if (member.streak >= 10 || member.id === sortedByStreak[0]?.id) {
    return { title: '🤓 Nerd Supremo (100%)', type: 'glory' };
  }
  if (member.streak >= 5) {
    return { title: '⏰ Mestre do Alarme', type: 'glory' };
  }
  return { title: '🎒 Estudante em Treinamento', type: 'neutral' };
}
function renderRanking(containerElement) {
  if (!containerElement) return;

  const members = (state.room && state.room.members) ? state.room.members : [];
  if (members.length === 0) {
    containerElement.innerHTML = `
      <div style="text-align:center; padding:30px 20px; color:var(--text-muted);">
        <div style="font-size:32px; margin-bottom:8px;">👥</div>
        <p style="font-weight:700;">Nenhum membro na sala ainda.</p>
        <p style="font-size:12px; margin-top:4px;">Convide seus amigos para competir no placar!</p>
      </div>
    `;
    return;
  }

  // Sort primarily by highest streak / lowest fails
  const sorted = [...members].sort((a, b) => {
    if ((b.streak || 0) !== (a.streak || 0)) {
      return (b.streak || 0) - (a.streak || 0);
    }
    return (a.totalFails || 0) - (b.totalFails || 0);
  });

  containerElement.innerHTML = sorted.map((member, index) => {
    const isFirst = index === 0;
    const isLast = index === sorted.length - 1 && member.totalFails > 0;
    const titleObj = getMemberTitle(member, members);

    return `
      <div class="ranking-card ${isFirst ? 'rank-1' : ''} ${isLast ? 'rank-last' : ''}">
        <div class="rank-position">#${index + 1}</div>
        <div class="rank-user-info">
          <div class="user-avatar-badge">${member.avatar || '🎓'}</div>
          <div>
            <div style="font-weight:700; font-size:14px; color:var(--text-primary);">
              ${escapeHtml(member.name)} ${member.id === state.currentUserId ? '<span style="font-size:10px; color:var(--amber-pot);">(Você)</span>' : ''}
            </div>
            <div style="font-size:11px; color:var(--text-secondary);">📍 ${escapeHtml(member.city)}</div>
            <span class="rank-shame-title ${titleObj.type}">${titleObj.title}</span>
          </div>
        </div>
        <div class="rank-stats-group">
          <div class="rank-streak-val">🔥 ${member.streak || 0} dias</div>
          <div class="rank-debt-val">
            ${member.currentDebt > 0 ? `🚨 Deve R$ ${member.currentDebt.toFixed(2)}` : '✨ Sem Dívidas'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}
function renderShop(containerElement) {
  if (!containerElement) return;

  const user = state.getCurrentUser();
  const items = state.room.items || [];
  const inventory = user.inventory || [];

  containerElement.innerHTML = `
    <!-- XP Header -->
    <div class="xp-header-box">
      <div>
        <div style="font-size:11px; font-weight:800; color:#c084fc; text-transform:uppercase; letter-spacing:0.04em;">
          ✨ Seu Saldo de Presença
        </div>
        <div class="xp-balance-display">
          <span class="xp-value">${user.xp || 0}</span>
          <span style="font-size:13px; font-weight:700; color:var(--text-secondary);">XP</span>
        </div>
      </div>
      <div style="font-size:11px; color:var(--text-secondary); text-align:right;">
        Ganhe +50 XP a cada<br/>dia que for na aula!
      </div>
    </div>

    <!-- Inventory Section -->
    <div>
      <h3 style="font-family:var(--font-display); font-size:15px; font-weight:800; margin-bottom:8px;">
        🎒 Sua Mochila de Cartas (${inventory.length})
      </h3>
      ${inventory.length === 0 ? `
        <div style="background:var(--bg-surface-raised); border:1px dashed var(--border-subtle); border-radius:var(--radius-md); padding:14px; text-align:center; font-size:12px; color:var(--text-muted);">
          Sua mochila está vazia. Compre cartas abaixo com seu XP de presença!
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${inventory.map(itemId => {
            const it = items.find(i => i.id === itemId);
            if (!it) return '';
            return `
              <div style="background:var(--bg-surface-raised); border:1px solid var(--purple-magic); border-radius:var(--radius-md); padding:10px 14px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:20px;">${it.icon}</span>
                  <div>
                    <div style="font-weight:700; font-size:13px;">${escapeHtml(it.name)}</div>
                    <div style="font-size:10px; color:var(--text-secondary);">${escapeHtml(it.desc)}</div>
                  </div>
                </div>
                <button class="shop-buy-btn" style="background:#059669;" onclick="window.__useItem('${it.id}')">
                  ⚡ Usar
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <!-- Shop Catalog -->
    <div style="margin-top:8px;">
      <h3 style="font-family:var(--font-display); font-size:15px; font-weight:800; margin-bottom:8px;">
        🛒 Loja de Vantagens
      </h3>
      <div class="shop-cards-grid">
        ${items.map(item => {
          const canAfford = (user.xp || 0) >= item.priceXP;
          return `
            <div class="shop-item-card">
              <div class="shop-item-header">
                <span class="shop-item-icon">${item.icon}</span>
                <span style="font-family:var(--font-mono); font-size:13px; font-weight:800; color:#c084fc;">
                  ${item.priceXP} XP
                </span>
              </div>
              <div>
                <div class="shop-item-title">${escapeHtml(item.name)}</div>
                <div class="shop-item-desc">${escapeHtml(item.desc)}</div>
              </div>
              <button class="shop-buy-btn" ${canAfford ? '' : 'disabled'} onclick="window.__buyItem('${item.id}')">
                ${canAfford ? '✨ Comprar com XP' : '🔒 XP Insuficiente'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

  
  // 8. Master App Controller
  // Master Application Controller






class AppController {
  constructor() {
    window.__APP__ = this;
    this.currentTab = 'tab-hoje';
    this.cameraEngine = null;
    this.init();
  }

  init() {
    this.initGlobalHandlers();
    this.setupGlobalDelegation();
    this.bindDOM();
    this.initCamera();
    this.registerPWA();

    // Check if user is in a room or needs onboarding
    if (!state.isConfigured()) {
      this.checkUrlAndOpenOnboarding();
    } else {
      this.updateUI();
      // Start Real-Time Background Sync with server
      state.startAutoSync(3000);
    }

    // Subscribe to central state changes
    state.subscribe((s, event, data) => {
      this.updateUI(event, data);
    });

    console.log('🚀 Quem Falta Se Ferra App inicializado com sucesso!');
  }

  setupGlobalDelegation() {
    document.addEventListener('click', (e) => {
      // 1. Tab Navigation Clicks
      const navBtn = e.target.closest('.nav-item');
      if (navBtn) {
        const targetTab = navBtn.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
          return;
        }
      }

      // 2. Modal Close Buttons
      const closeBtn = e.target.closest('.modal-close-btn') || e.target.closest('[data-close-modal]');
      if (closeBtn) {
        const modal = closeBtn.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
          if (modal.id === 'modal-camera' && this.cameraEngine) {
            this.cameraEngine.stopStream();
          }
        }
        return;
      }

      // 3. Modal Overlay Background Click
      if (e.target.classList.contains('modal-overlay')) {
        // Don't close onboarding if room is not configured yet
        if (e.target.id === 'modal-onboarding' && !state.isConfigured()) {
          return;
        }
        e.target.classList.remove('active');
        if (e.target.id === 'modal-camera' && this.cameraEngine) {
          this.cameraEngine.stopStream();
        }
      }
    });
  }

  bindDOM() {
    // Camera Modal Triggers
    const btnOpenCam = document.getElementById('btn-open-camera');
    if (btnOpenCam) {
      btnOpenCam.addEventListener('click', () => this.openCameraModal());
    }

    const btnCloseCam = document.getElementById('btn-close-camera');
    if (btnCloseCam) {
      btnCloseCam.addEventListener('click', () => this.closeCameraModal());
    }

    const btnShutter = document.getElementById('btn-camera-shutter');
    if (btnShutter) {
      btnShutter.addEventListener('click', () => this.captureAndSubmit());
    }

    const btnFlipCam = document.getElementById('btn-camera-flip');
    if (btnFlipCam) {
      btnFlipCam.addEventListener('click', () => {
        if (this.cameraEngine) this.cameraEngine.toggleFacingMode();
      });
    }

    // Photo File Upload Fallback
    const fileInput = document.getElementById('camera-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Room Share Button (Top bar)
    const btnShare = document.getElementById('btn-share-room');
    if (btnShare) {
      btnShare.addEventListener('click', () => this.openShareModal());
    }

    // Copy Invite Link Button
    const btnCopyInvite = document.getElementById('btn-copy-invite-link');
    if (btnCopyInvite) {
      btnCopyInvite.addEventListener('click', () => {
        if (!state.room) return;
        const url = `${window.location.origin}${window.location.pathname}?room=${state.room.code}`;
        navigator.clipboard.writeText(url).then(() => {
          sound.play('coin');
          this.showToast('📋 Link de convite copiado com sucesso!', 'pot');
        });
      });
    }

    // Onboarding Tabs (Criar vs Entrar)
    const tabCreateBtn = document.getElementById('onboarding-tab-create-btn');
    const tabJoinBtn = document.getElementById('onboarding-tab-join-btn');
    const formCreate = document.getElementById('form-onboarding-create');
    const formJoin = document.getElementById('form-onboarding-join');

    if (tabCreateBtn && tabJoinBtn && formCreate && formJoin) {
      tabCreateBtn.addEventListener('click', () => {
        tabCreateBtn.classList.add('active');
        tabCreateBtn.style.background = 'var(--emerald-subtle)';
        tabCreateBtn.style.color = 'var(--emerald-presence)';
        tabJoinBtn.classList.remove('active');
        tabJoinBtn.style.background = 'transparent';
        tabJoinBtn.style.color = 'var(--text-secondary)';
        formCreate.style.display = 'flex';
        formJoin.style.display = 'none';
      });

      tabJoinBtn.addEventListener('click', () => {
        tabJoinBtn.classList.add('active');
        tabJoinBtn.style.background = 'var(--amber-subtle)';
        tabJoinBtn.style.color = 'var(--amber-pot)';
        tabCreateBtn.classList.remove('active');
        tabCreateBtn.style.background = 'transparent';
        tabCreateBtn.style.color = 'var(--text-secondary)';
        formJoin.style.display = 'flex';
        formCreate.style.display = 'none';
      });
    }

    // Onboarding: Form Create Room
    if (formCreate) {
      formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomName = document.getElementById('onboard-room-name').value;
        const fine = document.getElementById('onboard-fine-amount').value;
        const name = document.getElementById('onboard-admin-name').value;
        const city = document.getElementById('onboard-admin-city').value;
        const time = document.getElementById('onboard-admin-time').value;
        const pix = document.getElementById('onboard-admin-pix').value;

        const newRoom = state.createNewRoom(roomName, fine, name, city, time, pix);
        document.getElementById('modal-onboarding')?.classList.remove('active');
        this.showToast(`🎉 Sala "${newRoom.name}" criada com sucesso!`, 'success');
        this.updateUI();
        state.startAutoSync(3000);
        this.openShareModal();
      });
    }

    // Onboarding: Form Join Room
    if (formJoin) {
      formJoin.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('onboard-join-code').value;
        const name = document.getElementById('onboard-join-name').value;
        const city = document.getElementById('onboard-join-city').value;
        const time = document.getElementById('onboard-join-time').value;
        const pix = document.getElementById('onboard-join-pix').value;

        const newUser = state.joinRoom(code, name, city, time, pix);
        document.getElementById('modal-onboarding')?.classList.remove('active');
        this.showToast(`🎉 Bem-vindo ao bonde, ${newUser.name}!`, 'success');
        this.updateUI();
        state.startAutoSync(3000);
      });
    }

    // Settings Modal Create Room Form
    const createRoomForm = document.getElementById('form-create-new-room');
    if (createRoomForm) {
      createRoomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomName = document.getElementById('input-new-room-name').value;
        const fine = document.getElementById('input-new-fine-amount').value;
        const name = document.getElementById('input-new-admin-name').value;
        const city = document.getElementById('input-new-admin-city').value;
        const time = document.getElementById('input-new-admin-time').value;
        const pix = document.getElementById('input-new-admin-pix').value;

        const newRoom = state.createNewRoom(roomName, fine, name, city, time, pix);
        document.getElementById('modal-create-room')?.classList.remove('active');
        this.showToast(`🎉 Sala "${newRoom.name}" criada!`, 'success');
        this.updateUI();
        this.openShareModal();
      });
    }

    // Settings Modal Join Room Form
    const joinRoomForm = document.getElementById('form-join-existing-room');
    if (joinRoomForm) {
      joinRoomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('input-join-room-code').value;
        const name = document.getElementById('input-join-user-name').value;
        const city = document.getElementById('input-join-user-city').value;
        const time = document.getElementById('input-join-user-time').value;
        const pix = document.getElementById('input-join-user-pix').value;

        const newUser = state.joinRoom(code, name, city, time, pix);
        document.getElementById('modal-join-room')?.classList.remove('active');
        this.showToast(`🎉 Bem-vindo ao bonde, ${newUser.name}!`, 'success');
        this.updateUI();
      });
    }

    // User Switcher Modal Trigger
    const btnUserSwitch = document.getElementById('btn-user-switch');
    if (btnUserSwitch) {
      btnUserSwitch.addEventListener('click', () => this.openUserSwitchModal());
    }

    // Room Settings Form
    const settingsForm = document.getElementById('form-room-settings');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fineVal = parseFloat(document.getElementById('input-fine-amount').value) || 5.0;
        const myCity = document.getElementById('input-my-city').value;
        const myTime = document.getElementById('input-my-time').value;
        const myPix = document.getElementById('input-my-pix').value;

        if (state.room) state.room.fineAmount = fineVal;
        state.updateProfile({ city: myCity, schoolTime: myTime, pixKey: myPix });
        this.showToast('Configurações salvas com sucesso!', 'success');
      });
    }

    // Add Friend Form
    const addFriendForm = document.getElementById('form-add-friend');
    if (addFriendForm) {
      addFriendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-friend-name').value;
        const city = document.getElementById('input-friend-city').value;
        const time = document.getElementById('input-friend-time').value;
        const pix = document.getElementById('input-friend-pix').value;

        if (name) {
          state.addNewMember(name, city, time, pix);
          addFriendForm.reset();
          this.showToast(`Amigo ${name} adicionado à sala!`, 'success');
        }
      });
    }
  }

  checkUrlAndOpenOnboarding() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    const modal = document.getElementById('modal-onboarding');
    if (!modal) return;

    if (roomParam) {
      // User arrived via invite link! Auto switch to Join tab
      const tabJoinBtn = document.getElementById('onboarding-tab-join-btn');
      const inputJoinCode = document.getElementById('onboard-join-code');
      if (inputJoinCode) inputJoinCode.value = roomParam.toUpperCase();
      if (tabJoinBtn) tabJoinBtn.click();
    }

    modal.classList.add('active');
  }

  initCamera() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    if (video && canvas) {
      this.cameraEngine = new CameraEngine(video, canvas);
    }
  }

  async openCameraModal() {
    const modal = document.getElementById('modal-camera');
    if (modal) {
      modal.classList.add('active');
      if (this.cameraEngine) {
        const streamOk = await this.cameraEngine.startStream();
        if (!streamOk) {
          this.showToast('Câmera indisponível. Você pode enviar uma foto pelo arquivo!', 'error');
        }
      }
    }
  }

  closeCameraModal() {
    const modal = document.getElementById('modal-camera');
    if (modal) {
      modal.classList.remove('active');
      if (this.cameraEngine) {
        this.cameraEngine.stopStream();
      }
    }
  }

  captureAndSubmit() {
    const user = state.getCurrentUser() || { name: 'Eu', city: 'Minha Cidade' };
    sound.play('camera_shutter');

    let photoData = null;
    if (this.cameraEngine) {
      photoData = this.cameraEngine.captureFrame(user.name, user.city);
    }

    if (!photoData) {
      photoData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%230f172a"/><text x="300" y="200" fill="%2310b981" font-family="sans-serif" font-size="26" font-weight="bold" text-anchor="middle">SALA DE AULA VERIFICADA 📸</text><text x="300" y="250" fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">Check-in de ${user.name} em ${user.city}</text></svg>`;
    }

    state.submitCheckin(photoData, user.city);
    this.closeCameraModal();
    this.showToast('🎉 Foto enviada! Check-in realizado com sucesso (+50 XP)', 'success');
  }

  handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const user = state.getCurrentUser() || { name: 'Eu', city: 'Minha Cidade' };
        const photoData = this.cameraEngine ? this.cameraEngine.processUploadedImage(img, user.name, user.city) : e.target.result;
        state.submitCheckin(photoData, user.city);
        this.closeCameraModal();
        this.showToast('🎉 Foto enviada com sucesso! (+50 XP)', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Bottom Nav UI
    document.querySelectorAll('.nav-item').forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
    });

    // Update Tab Panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      const isActive = pane.id === tabId;
      pane.classList.toggle('active', isActive);
      pane.style.display = isActive ? 'flex' : 'none';
    });

    this.renderCurrentTab();
  }

  renderCurrentTab() {
    if (this.currentTab === 'tab-tribunal') {
      renderTribunalFeed(document.getElementById('tribunal-feed-container'));
    } else if (this.currentTab === 'tab-ranking') {
      renderRanking(document.getElementById('ranking-list-container'));
    } else if (this.currentTab === 'tab-shop') {
      renderShop(document.getElementById('shop-container'));
    } else if (this.currentTab === 'tab-extrato') {
      renderExtratoFinanceiro(document.getElementById('extrato-container'));
    }
  }

  updateUI(event, data) {
    if (!state.isConfigured()) {
      return;
    }

    const user = state.getCurrentUser() || { avatar: '😎', name: 'Estudante', city: '', schoolTime: '' };
    const totalPot = state.getTotalPotAmount();
    const topSponsor = state.getTopSponsor();
    const membersCount = state.room.members ? state.room.members.length : 0;

    // 1. Update Header
    const userAvatarEl = document.getElementById('header-user-avatar');
    if (userAvatarEl) userAvatarEl.textContent = user.avatar || '😎';

    const roomCodeEl = document.getElementById('header-room-code');
    if (roomCodeEl) roomCodeEl.textContent = state.room.code;

    // 2. Update Pot Card
    const potValEl = document.getElementById('pot-value-number');
    if (potValEl) {
      potValEl.textContent = totalPot.toFixed(2);
      if (event === 'CHECKIN_SUBMITTED' || event === 'DEBT_STATUS_UPDATED') {
        potValEl.classList.remove('pot-value-surge');
        void potValEl.offsetWidth;
        potValEl.classList.add('pot-value-surge');
      }
    }

    const potMembersEl = document.getElementById('pot-members-count');
    if (potMembersEl) {
      potMembersEl.textContent = `${membersCount} amigo${membersCount !== 1 ? 's' : ''} no bonde`;
    }

    // Toggle Onboarding Banner if alone in room
    const onboardingBanner = document.getElementById('home-onboarding-banner');
    if (onboardingBanner) {
      onboardingBanner.style.display = membersCount <= 1 ? 'flex' : 'none';
    }

    // Top Sponsor Banner
    const sponsorWrap = document.getElementById('pot-sponsor-banner');
    if (sponsorWrap) {
      if (topSponsor && topSponsor.currentDebt > 0) {
        sponsorWrap.style.display = 'flex';
        document.getElementById('sponsor-avatar').textContent = topSponsor.avatar || '😴';
        document.getElementById('sponsor-name').textContent = topSponsor.name;
        document.getElementById('sponsor-debt-amount').textContent = `R$ ${topSponsor.currentDebt.toFixed(2)}`;
      } else {
        sponsorWrap.style.display = 'none';
      }
    }

    // 3. Update Today Status
    const todayCheckin = (state.room.checkins || []).find(c => c.userId === user.id);
    const todayBadge = document.getElementById('today-status-badge');
    const btnAction = document.getElementById('btn-open-camera');

    if (todayCheckin) {
      if (todayBadge) {
        todayBadge.className = 'today-status-badge verified';
        todayBadge.innerHTML = '✅ PONTO BATIDO HOJE';
      }
      if (btnAction) {
        btnAction.className = 'btn-primary-action verified';
        btnAction.innerHTML = '✨ Presença Confirmada (+50 XP)';
      }
    } else {
      if (todayBadge) {
        todayBadge.className = 'today-status-badge pending';
        todayBadge.innerHTML = '⏳ PENDENTE - NÃO FALTE!';
      }
      if (btnAction) {
        btnAction.className = 'btn-primary-action';
        btnAction.innerHTML = '📸 BATER PONTO (Tirar Foto da Sala)';
      }
    }

    // 4. Update Pending Badges in Nav
    const pendingDebts = (state.room.debts || []).filter(d => d.creditorId === user.id && d.status === 'PENDING_CONFIRMATION').length;
    const badgeExtrato = document.getElementById('badge-count-extrato');
    if (badgeExtrato) {
      badgeExtrato.style.display = pendingDebts > 0 ? 'flex' : 'none';
      badgeExtrato.textContent = pendingDebts;
    }

    // 5. Populate Settings inputs with current user
    const inputCity = document.getElementById('input-my-city');
    const inputTime = document.getElementById('input-my-time');
    const inputPix = document.getElementById('input-my-pix');
    const inputFine = document.getElementById('input-fine-amount');

    if (inputCity && !inputCity.matches(':focus')) inputCity.value = user.city || '';
    if (inputTime && !inputTime.matches(':focus')) inputTime.value = user.schoolTime || '';
    if (inputPix && !inputPix.matches(':focus')) inputPix.value = user.pixKey || '';
    if (inputFine && !inputFine.matches(':focus')) inputFine.value = state.room.fineAmount || 5.0;

    // 6. Refresh Activity Logs on Dashboard
    const logsContainer = document.getElementById('activity-logs-container');
    if (logsContainer) {
      const logs = (state.room.logs || []).slice(0, 5);
      logsContainer.innerHTML = logs.map(l => `
        <div style="font-size:12px; padding:6px 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; gap:10px;">
          <span style="color:var(--text-primary);">${l.text}</span>
          <span style="color:var(--text-muted); font-size:10px; white-space:nowrap;">${l.time}</span>
        </div>
      `).join('');
    }

    // Re-render currently active tab
    this.renderCurrentTab();
  }

  openUserSwitchModal() {
    const modal = document.getElementById('modal-user-switch');
    const list = document.getElementById('user-switch-list');
    if (!modal || !list || !state.room) return;

    list.innerHTML = (state.room.members || []).map(m => `
      <div style="background:var(--bg-surface-raised); border:1px solid ${m.id === state.currentUserId ? 'var(--emerald-presence)' : 'var(--border-strong)'}; border-radius:var(--radius-md); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="window.__selectUser('${m.id}')">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:22px;">${m.avatar}</span>
          <div>
            <div style="font-weight:700; font-size:14px;">${m.name}</div>
            <div style="font-size:11px; color:var(--text-secondary);">📍 ${m.city} • ⏰ ${m.schoolTime}</div>
          </div>
        </div>
        ${m.id === state.currentUserId ? '<span style="font-size:12px; font-weight:800; color:var(--emerald-presence);">ATIVO</span>' : '<span style="font-size:11px; color:var(--text-muted);">Trocar ➔</span>'}
      </div>
    `).join('');

    modal.classList.add('active');
  }

  openShareModal() {
    const modal = document.getElementById('modal-share-room');
    const codeDisplay = document.getElementById('modal-display-room-code');
    const zapBtn = document.getElementById('btn-whatsapp-invite');
    if (!modal || !state.room) return;

    const code = state.room.code;
    const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
    
    if (codeDisplay) codeDisplay.textContent = code;

    if (zapBtn) {
      const msg = encodeURIComponent(
        `🚨 *CONVITE: QUEM FALTA SE FERRA* 🚨\n\n` +
        `Entra aí no nosso bonde da escola pra gente não faltar na aula!\n` +
        `Quem falta paga multa no cofre! 💰\n\n` +
        `👉 Clica no link para entrar na minha sala:\n${url}\n\n` +
        `Código da sala: *${code}*`
      );
      zapBtn.href = `https://api.whatsapp.com/send?text=${msg}`;
    }

    modal.classList.add('active');
  }

  openCreateRoomModal() {
    const modal = document.getElementById('modal-create-room');
    if (modal) modal.classList.add('active');
  }

  openJoinRoomModal(prefilledCode = '') {
    const modal = document.getElementById('modal-join-room');
    const inputCode = document.getElementById('input-join-room-code');
    if (inputCode && prefilledCode) {
      inputCode.value = prefilledCode;
    }
    if (modal) modal.classList.add('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '🚨' : '✨'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  initGlobalHandlers() {
    window.__APP__ = this;

    window.__vote = (checkinId, type) => {
      state.voteCheckin(checkinId, type);
      this.showToast(type === 'VALID' ? 'Voto VÁLIDO registrado!' : '🚨 Voto de FRAUDE registrado!', type === 'VALID' ? 'success' : 'error');
    };

    window.__react = (checkinId, type, event) => {
      state.reactCheckin(checkinId, type);
      const emojis = { laugh: '😂', clap: '👏', skull: '💀' };
      const el = document.createElement('div');
      el.className = 'floating-reaction';
      el.textContent = emojis[type] || '✨';
      el.style.left = `${(event && event.clientX) ? event.clientX : window.innerWidth / 2}px`;
      el.style.top = `${(event && event.clientY) ? event.clientY : window.innerHeight / 2}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1400);
    };

    window.__markAsPaid = (debtId) => {
      state.markDebtAsPaidByDebtor(debtId);
      this.showToast('💸 Marcado como pago! O credor foi notificado para confirmar.', 'pot');
    };

    window.__confirmReceipt = (debtId, isConfirmed) => {
      state.confirmDebtReceipt(debtId, isConfirmed);
      if (isConfirmed) {
        this.showToast('✅ Recebimento confirmado! Dívida quitada com sucesso.', 'success');
      } else {
        this.showToast('❌ Pagamento recusado! A dívida continua aberta.', 'error');
      }
    };

    window.__copyPix = (pixKey) => {
      if (!pixKey || pixKey === 'Não informada') {
        this.showToast('Chave PIX não cadastrada pelo credor.', 'error');
        return;
      }
      navigator.clipboard.writeText(pixKey).then(() => {
        sound.play('coin');
        this.showToast('🔑 Chave PIX copiada com sucesso!', 'success');
      });
    };

    window.__buyItem = (itemId) => {
      const res = state.buyItem(itemId);
      if (res.success) {
        this.showToast(`🎉 "${res.item.name}" adicionado à sua mochila!`, 'success');
      } else {
        this.showToast(res.msg, 'error');
      }
    };

    window.__useItem = (itemId) => {
      const res = state.useItem(itemId);
      if (res.success) {
        this.showToast(res.msg || 'Item utilizado!', 'success');
      } else {
        this.showToast(res.msg, 'error');
      }
    };

    window.__selectUser = (userId) => {
      state.switchActiveUser(userId);
      document.getElementById('modal-user-switch')?.classList.remove('active');
      const cur = state.getCurrentUser();
      if (cur) this.showToast(`Agora você está controlando: ${cur.name}`, 'pot');
    };
  }

  registerPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    }
  }
}

// Immediate robust boot
function boot() {
  if (!window.__APP__) {
    window.__APP__ = new AppController();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
