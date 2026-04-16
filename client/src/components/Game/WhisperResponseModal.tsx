// ============================================================
// WhisperResponseModal — Đáp lại thẻ Thì Thầm (Có/Không)
// ============================================================
// Khi có người hỏi "Bạn có phải là [nhân vật] không?", bạn sẽ
// thấy modal này và chọn đưa lại thẻ Thì Thầm (Có hoặc Không).
// Năng lực nhân vật sẽ gợi ý câu trả lời "đúng" cho bạn,
// nhưng quyết định cuối cùng vẫn thuộc về bạn.
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
          🃏 Trả Lời Thì Thầm
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
          💡 Gợi ý trả lời dựa trên năng lực nhân vật: <strong style={{
            color: pendingInquiry.suggestedAnswer ? '#4caf50' : 'var(--color-blood-light)',
          }}>
            {pendingInquiry.suggestedAnswer ? 'CÓ' : 'KHÔNG'}
          </strong>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
        }}>
          Hãy chọn thẻ Thì Thầm để trả lời:
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
            }}>KHÔNG</span>
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
            }}>CÓ</span>
          </button>
        </div>

        <p style={{
          marginTop: 'var(--space-lg)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          Chỉ người hỏi mới nhìn thấy câu trả lời của bạn.
        </p>
      </div>
    </div>
  );
}

// ── Inquiry Waiting Indicator ─────────────────────────────
// Hiển thị cho người hỏi khi chờ đối phương trả lời
export function InquiryWaitingModal() {
  const { inquiryWaiting } = useGameStore();

  if (!inquiryWaiting) return null;

  const charName = CHARACTER_NAMES[inquiryWaiting.characterGuess] || inquiryWaiting.characterGuess;
  const charIcon = CHARACTER_ICONS[inquiryWaiting.characterGuess] || '❓';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>
          🔍 Đang Chờ Phản Hồi...
        </h3>

        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Bạn đã hỏi <strong style={{ color: 'var(--text-gold)' }}>
            {inquiryWaiting.targetNickname}
          </strong>:
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: 'var(--space-lg)' }}>
          "Bạn có phải là {charIcon} <strong>{charName}</strong> không?"
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <div className="spinner"></div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
          Đang chờ đối phương đưa lại thẻ Thì Thầm...
        </p>
      </div>
    </div>
  );
}
