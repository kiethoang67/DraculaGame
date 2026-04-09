// ============================================================
// GameOverScreen — End game reveal
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_ICONS } from '../../utils/constants';
import socket from '../../socket';

export function GameOverScreen() {
  const { gameOver, room, resetGame } = useGameStore();

  if (!gameOver || !room) return null;

  const isWinner = gameOver.winnerId === socket.id;

  const handlePlayAgain = () => {
    socket.emit('leave-room');
    resetGame();
  };

  return (
    <div className="game-over">
      <div className="game-over__content">
        <div className="game-over__title">
          {isWinner ? '🎉 Tuyệt Đỉnh Phá Đảo! 🎉' : '💀 Xong Phim Cả Làng 💀'}
        </div>

        <h2 style={{ color: 'var(--text-gold)', marginBottom: 'var(--space-sm)' }}>
          Pháp Sư {gameOver.winnerNickname} Đã Out-Trình!
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          marginBottom: 'var(--space-xl)',
        }}>
          {gameOver.reason}
        </p>

        {/* All roles revealed */}
        <h3 style={{ marginBottom: 'var(--space-md)' }}>🎭 Bóc Phốt Thành Công</h3>
        <div className="game-over__roles">
          {Object.entries(gameOver.allRoles).map(([playerId, role]) => {
            const player = room.players.find(p => p.id === playerId);
            return (
              <div key={playerId} className="character-card" style={{
                width: 140,
                padding: 'var(--space-md)',
                border: playerId === gameOver.winnerId ? '2px solid var(--color-gold-bright)' : undefined,
              }}>
                <div className="character-card__icon" style={{ fontSize: '2rem', marginBottom: 'var(--space-xs)' }}>
                  {CHARACTER_ICONS[role.characterId] || '❓'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: playerId === socket.id ? 'var(--color-gold-bright)' : 'var(--text-primary)',
                  fontWeight: 600,
                  marginBottom: 2,
                }}>
                  {player?.nickname || 'Nick Ảo'}
                </div>
                <div className="character-card__name" style={{ fontSize: '0.85rem' }}>
                  {role.characterName}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mystery Guests */}
        {gameOver.mysteryGuests && gameOver.mysteryGuests.length > 0 && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>🂠 Khách Mời Ăn Tiệc{gameOver.mysteryGuests.length > 1 ? 's' : ''}</h4>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
              {gameOver.mysteryGuests.map((mg, i) => (
                <div key={i} className="player-badge">
                  {CHARACTER_ICONS[mg.characterId]} {mg.characterName}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn--primary btn--lg"
          onClick={handlePlayAgain}
          style={{ marginTop: 'var(--space-xl)' }}
        >
          🏰 Về Sảnh Gỡ Gạc
        </button>
      </div>
    </div>
  );
}
