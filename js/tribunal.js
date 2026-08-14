// Tribunal dos Amigos - Live Feed & Voting Logic
import { state } from './state.js';

export function renderTribunalFeed(containerElement) {
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
