// ============================================================
// WhisperResponseModal — Target responds with Yes/No Whisper card
// ============================================================
// When someone asks you "Are you [character]?", you see this modal
// and choose which Whisper card to hand back (Yes or No).
// Your character's ability suggests the "correct" answer, but
// you ultimately choose — just like in the physical board game.
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS } from '../../utils/constants';
import socket from '../../socket';

export function WhisperResponseModal() {
  const { pendingInquiry } = useGameStore();

  if (!pendingInquiry) return null;

  const charName = CHARACTER_NAMES[pendingInquiry.characterGuess] || pendingInquiry.characterGuess;
  const charIcon = CHARACTER_ICONS[pendingInquiry.characterGuess] || '❓';

  const handleRespond = (answer: boolean) => {
    socket.emit('inquire-response', { answer });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>
          🃏 Trả Lời "Thì Thầm"
        </h3>

        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
          <strong style={{ color: 'var(--text-gold)' }}>{pendingInquiry.fromNickname}</strong>
          {' '}đã hỏi bạn:
        </p>

        <p style={{
          fontSize: '1.2rem',
          marginBottom: 'var(--space-lg)',
          padding: 'var(--space-md)',
          background: 'rgba(212, 165, 116, 0.08)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-gold)',
        }}>
          "Bạn có phải là {charIcon} <strong>{charName}</strong> không?"
        </p>

        {/* Suggested answer from ability */}
        <div style={{
          padding: 'var(--space-sm) var(--space-md)',
          background: 'rgba(26, 26, 46, 0.8)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-lg)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>
          💡 Gợi ý trả lời dựa trên kỹ năng của bạn: <strong style={{
            color: pendingInquiry.suggestedAnswer ? '#4caf50' : 'var(--color-blood-light)',
          }}>
            {pendingInquiry.suggestedAnswer ? 'YES' : 'NO'}
          </strong>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
        }}>
          Đưa cho nó 1 tấm thẻ để chốt deal:
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center' }}>
          {/* NO card */}
          <button
            className="btn"
            onClick={() => handleRespond(false)}
            style={{
              flex: 1,
              maxWidth: 160,
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              background: 'rgba(196, 30, 58, 0.1)',
              border: '2px solid var(--color-blood-light)',
              color: 'var(--color-blood-light)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(196, 30, 58, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(196, 30, 58, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>❌</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 700,
            }}>NO</span>
          </button>

          {/* YES card */}
          <button
            className="btn"
            onClick={() => handleRespond(true)}
            style={{
              flex: 1,
              maxWidth: 160,
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              background: 'rgba(46, 125, 50, 0.1)',
              border: '2px solid #4caf50',
              color: '#4caf50',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(46, 125, 50, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(46, 125, 50, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>✅</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 700,
            }}>YES</span>
          </button>
        </div>

        <p style={{
          marginTop: 'var(--space-lg)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          Chỉ có đứa rảnh đi check var mới thấy câu trả lời này
        </p>
      </div>
    </div>
  );
}

// ── Inquiry Waiting Indicator ─────────────────────────────
// Shown to the asker while waiting for the target's response
export function InquiryWaitingModal() {
  const { inquiryWaiting } = useGameStore();

  if (!inquiryWaiting) return null;

  const charName = CHARACTER_NAMES[inquiryWaiting.characterGuess] || inquiryWaiting.characterGuess;
  const charIcon = CHARACTER_ICONS[inquiryWaiting.characterGuess] || '❓';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>
          🔍 Đang Chờ Ai Đó Seen...
        </h3>

        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Bạn vừa tra hỏi <strong style={{ color: 'var(--text-gold)' }}>
            {inquiryWaiting.targetNickname}
          </strong>:
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: 'var(--space-lg)' }}>
          "Ê fen có phải {charIcon} <strong>{charName}</strong> hử?"
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <div className="spinner"></div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
          Đang chờ nó đánh rơi tờ tóp tóp Whisper card...
        </p>
      </div>
    </div>
  );
}
