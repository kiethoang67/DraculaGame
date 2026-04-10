import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export function Notepad() {
  const { room, playerId } = useGameStore();
  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (room && playerId) {
      const storedNote = localStorage.getItem(`dracula_note_${room.id}_${playerId}`);
      if (storedNote) {
        setNote(storedNote);
      }
    }
  }, [room, playerId]);

  // Save to local storage on change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    if (room && playerId) {
      localStorage.setItem(`dracula_note_${room.id}_${playerId}`, newNote);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-md)',
      right: 'var(--space-md)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none' // allow clicking through unless interacting
    }}>
      {isOpen && (
        <div className="glass-card" style={{
          width: '300px',
          height: '250px',
          marginBottom: 'var(--space-sm)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: 'var(--space-sm) var(--space-md)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-gold-bright)' }}>
              📝 Sổ Tay Cá Nhân
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chỉ mình bạn thấy</span>
          </div>
          <textarea
            value={note}
            onChange={handleChange}
            placeholder="Ghi chú lại ai là Ghost, ai là Trickster..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              padding: 'var(--space-md)',
              resize: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      )}

      <button
        className="btn btn--secondary"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          pointerEvents: 'auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
        }}
        title="Ghi chú"
      >
        {isOpen ? '🔽' : '📝'}
      </button>
    </div>
  );
}
