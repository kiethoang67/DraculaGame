// ============================================================
// InquiryResultModal — Hiển thị kết quả hỏi dò
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS } from '../../utils/constants';

export function InquiryResultModal() {
  const { inquiryResult, clearInquiryResult } = useGameStore();

  if (!inquiryResult) return null;

  const targetNickname = inquiryResult.targetNickname || 'Không rõ';
  const charName = CHARACTER_NAMES[inquiryResult.characterGuess] || inquiryResult.characterGuess;
  const charIcon = CHARACTER_ICONS[inquiryResult.characterGuess] || '❓';

  return (
    <div className="modal-overlay" onClick={clearInquiryResult}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>
          🔍 Kết Quả Hỏi Dò
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Bạn đã hỏi <strong style={{ color: 'var(--text-gold)' }}>{targetNickname}</strong>:
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: 'var(--space-lg)' }}>
          "Bạn có phải là {charIcon} <strong>{charName}</strong> không?"
        </p>

        <div style={{
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          background: inquiryResult.answer
            ? 'rgba(46, 125, 50, 0.15)'
            : 'rgba(196, 30, 58, 0.15)',
          border: `2px solid ${inquiryResult.answer ? '#2e7d32' : 'var(--color-blood-light)'}`,
          marginBottom: 'var(--space-lg)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>
            {inquiryResult.answer ? '✅' : '❌'}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: inquiryResult.answer ? '#4caf50' : 'var(--color-blood-light)',
          }}>
            {inquiryResult.answer ? 'CÓ' : 'KHÔNG'}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Chỉ bạn mới nhìn thấy câu trả lời này.
        </p>

        <button
          className="btn btn--primary"
          onClick={clearInquiryResult}
          style={{ width: '100%', marginTop: 'var(--space-md)' }}
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
