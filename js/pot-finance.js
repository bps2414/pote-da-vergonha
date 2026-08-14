// Pot Finance & 2-Stage Debt Settlement Engine
import { state } from './state.js';

export function calculateSettlement() {
  const members = state.room.members || [];
  const totalPot = state.getTotalPotAmount();

  // Find winners (members with minimum fails, preferably 0 fails)
  const minFails = Math.min(...members.map(m => m.totalFails || 0));
  const winners = members.filter(m => (m.totalFails || 0) === minFails);

  const prizePerWinner = winners.length > 0 ? (totalPot / winners.length) : 0;

  return {
    totalPot,
    minFails,
    winners,
    prizePerWinner
  };
}

export function renderExtratoFinanceiro(containerElement) {
  if (!containerElement) return;

  const currentUserId = state.currentUserId;
  const settlement = calculateSettlement();
  const debts = state.room.debts || [];

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
