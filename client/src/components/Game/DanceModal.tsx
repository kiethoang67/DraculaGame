// ============================================================
// DanceModal — Dance invitation and response
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import socket from '../../socket';

interface DanceModalProps {
  mode: 'invite' | 'respond';
  onClose: () => void;
  preSelectedTarget?: string | null;
}

export function DanceModal({ mode, onClose, preSelectedTarget }: DanceModalProps) {
  const { room, pendingDance } = useGameStore();
  const [targetId, setTargetId] = useState<string | null>(preSelectedTarget || null);

  if (!room) return null;

  // ── Invite Mode ─────────────────────────────────────
  if (mode === 'invite') {
    const validTargets = room.players.filter(
      p => p.id !== socket.id && !p.isRevealed
    );

    const handleInvite = () => {
      if (!targetId) return;
      socket.emit('dance-offer', { targetId });
      onClose();
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            💃 Gạ Trai/Gái Đi Quẩy
          </h3>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Nếu nó gật đầu, 2 đứa sẽ tráo thẻ bài cho nhau đấy nhé.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {validTargets.map(player => (
              <button
                key={player.id}
                className={`character-option ${targetId === player.id ? 'character-option--selected' : ''}`}
                onClick={() => setTargetId(player.id)}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
              >
                <span className="player-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                  {player.nickname.charAt(0)}
                </span>
                {player.nickname}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <button className="btn btn--ghost" onClick={onClose} style={{ flex: 1 }}>
              Thôi Ngại Lắm
            </button>
            <button
              className="btn btn--primary"
              onClick={handleInvite}
              disabled={!targetId}
              style={{ flex: 1 }}
            >
              💃 Gạ Luôn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Respond Mode ────────────────────────────────────
  if (mode === 'respond' && pendingDance) {
    const handleRespond = (accepted: boolean) => {
      socket.emit('dance-response', { accepted });
      onClose();
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            💃 Có Đứa Gạ Nhảy Nè
          </h3>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: 'var(--space-lg)' }}>
            <strong style={{ color: 'var(--text-gold)' }}>{pendingDance.fromNickname}</strong>
            {' '}đang rủ rê bạn lên bar quẩy kìa!
          </p>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Nếu bật đèn xanh, hai đứa sẽ tráo thân thế cho nhau đó.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button
              className="btn btn--ghost btn--lg"
              onClick={() => handleRespond(false)}
              style={{ flex: 1 }}
            >
              ✋ Chê Không Sang
            </button>
            <button
              className="btn btn--primary btn--lg"
              onClick={() => handleRespond(true)}
              style={{ flex: 1 }}
            >
              💃 Ô Kê Lên
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Dance Result Modal ────────────────────────────────────
export function DanceResultModal() {
  const { danceResult, room, clearDanceResult } = useGameStore();

  if (!danceResult || !room) return null;

  const partner = room.players.find(p => p.id === danceResult.partnerId);

  return (
    <div className="modal-overlay" onClick={clearDanceResult}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          💃 Quẩy Đục Nước Xong!
        </h3>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Bạn vừa quẩy banh nóc với <strong style={{ color: 'var(--text-gold)' }}>{partner?.nickname}</strong>
        </p>
        <p style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          Thân phận thật sự của nó là: <strong style={{ color: 'var(--text-blood)', fontSize: '1.2rem' }}>
            {danceResult.partnerCharacterName}
          </strong>
        </p>
        <p style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          Còn thẻ mới của bạn bây giờ là: <strong style={{ color: 'var(--color-gold-bright)', fontSize: '1.2rem' }}>
            {danceResult.newCharacterName}
          </strong>
        </p>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 'var(--space-sm)', fontSize: '0.85rem' }}>
          {danceResult.newCharacterDescription}
        </p>
        <button
          className="btn btn--primary"
          onClick={clearDanceResult}
          style={{ width: '100%', marginTop: 'var(--space-lg)' }}
        >
          Đã Rõ Việc Tráo Hàng!
        </button>
      </div>
    </div>
  );
}
