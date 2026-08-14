// Gamification, Shame Badges, Ranking and XP Card Shop
import { state } from './state.js';

export function getMemberTitle(member, allMembers) {
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

export function renderRanking(containerElement) {
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

export function renderShop(containerElement) {
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
