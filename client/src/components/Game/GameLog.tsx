// ============================================================
// GameLog — Public game event log
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS } from '../../utils/constants';

export function GameLog() {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const entries = [...gameState.turnHistory].reverse();

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: 'var(--space-sm) var(--space-md)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h4 style={{ fontSize: '0.85rem' }}>📜 Game Log</h4>
      </div>
      <div className="game-log">
        {entries.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
            Game just started...
          </p>
        )}
        {entries.map((entry, i) => (
          <div key={i} className="game-log__entry">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              T{entry.turnNumber}
            </span>{' '}
            <span className="highlight">{entry.playerNickname}</span>
            {entry.action === 'inquire' && (
              <>
                {' '}asked{' '}
                <span className="highlight">{entry.targetNickname}</span>
                {' '}"Are you{' '}
                {entry.characterGuess && (
                  <>
                    {CHARACTER_ICONS[entry.characterGuess]}{' '}
                    {CHARACTER_NAMES[entry.characterGuess]}
                  </>
                )}
                ?"
              </>
            )}
            {entry.action === 'dance' && (
              <>
                {entry.danceAccepted
                  ? <> danced with <span className="highlight">{entry.targetNickname}</span> 💃</>
                  : <>'s dance with <span className="highlight">{entry.targetNickname}</span> was refused 🚫</>
                }
              </>
            )}
            {entry.action === 'accuse' && (
              <>
                {' '}made an accusation{' '}
                {entry.accuseSuccess ? '✅ SUCCESS' : '❌ FAILED'}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
