// ============================================================
// MusicToggle — Background music player with toggle button
// ============================================================

import { useState, useRef, useEffect } from 'react';

// Using a royalty-free gothic/dark ambient music from a CDN
const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/10/25/audio_032a0fcc78.mp3';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked, just ignore
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-toggle">
      <button
        className="music-toggle__btn"
        onClick={toggleMusic}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        title={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
      {showVolume && (
        <div
          className="music-toggle__volume"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: 'var(--color-blood-light)' }}
          />
        </div>
      )}
    </div>
  );
}
