// ============================================================
// GuestList — Shows participants who are observing the game
// ============================================================

import { useGameStore } from '../../stores/useGameStore';

export function GuestList() {
  const { room, gameState } = useGameStore();

  if (!room || !gameState) return null;

  const guests = room.players.filter(p => !gameState.seatOrder.includes(p.id));

  if (guests.length === 0) return null;

  return (
    <div className="guest-list">
      <div className="guest-list__header">
        👥 Đang Xem ({guests.length})
      </div>
      <div className="guest-list__names">
        {guests.map(g => (
          <span key={g.id} className="guest-list__name">
            {g.nickname}
          </span>
        ))}
      </div>
    </div>
  );
}
