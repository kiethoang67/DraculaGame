// ============================================================
// App.tsx — Root component with screen routing and toasts
// ============================================================

import { useEffect } from 'react';
import { useGameStore } from './stores/useGameStore';
import { useChatStore } from './stores/useChatStore';
import { LobbyScreen } from './components/Lobby/LobbyScreen';
import { RoomLobby } from './components/Lobby/RoomLobby';
import { GameBoard } from './components/Game/GameBoard';
import { RulesModal } from './components/Shared/RulesModal';

function Toasts() {
  const { toasts, removeToast } = useGameStore();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          onClick={() => removeToast(toast.id)}
          style={{ cursor: 'pointer' }}
        >
          {toast.type === 'error' && '❌ '}
          {toast.type === 'success' && '✅ '}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { screen, initSocketListeners } = useGameStore();
  const { initChatListeners } = useChatStore();

  // Initialize socket listeners once
  useEffect(() => {
    initSocketListeners();
    initChatListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button 
        className="btn btn--secondary" 
        onClick={useGameStore.getState().toggleRules}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9000,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}
        title="Luật Chơi"
      >
        📜
      </button>

      {screen === 'lobby' && <LobbyScreen />}
      {screen === 'room' && <RoomLobby />}
      {screen === 'game' && <GameBoard />}
      <Toasts />
      <RulesModal />
    </>
  );
}
