// Master Application Controller
import { state } from './state.js';
import { sound } from './audio.js';
import { CameraEngine } from './camera.js';
import { renderTribunalFeed } from './tribunal.js';
import { renderExtratoFinanceiro } from './pot-finance.js';
import { renderRanking, renderShop } from './gamification.js';

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
