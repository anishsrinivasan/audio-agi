import React from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

/**
 * Minimal Audio Player Component
 * Demonstrates basic usage of the useAudioPlayer hook
 */
export const MinimalPlayer: React.FC = () => {
  const player = useAudioPlayer();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await player.loadFile(files[0]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Minimal Player</h2>
      
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange}
        disabled={player.isLoading}
      />
      
      {player.audioFileName && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>{player.audioFileName}</strong></p>
          <p>{player.formatTime(player.currentTime)} / {player.formatTime(player.duration)}</p>
          
          <input 
            type="range" 
            min="0" 
            max={player.duration} 
            value={player.currentTime} 
            onChange={(e) => player.seek(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={player.play} disabled={player.isPlaying}>Play</button>
            <button onClick={player.pause} disabled={!player.isPlaying}>Pause</button>
            <button onClick={player.stop}>Stop</button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <label>
              Speed: {player.speed}x
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={player.speed} 
                onChange={(e) => player.setSpeed(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </label>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <label>
              Pitch: {player.pitch > 0 ? '+' : ''}{player.pitch} semitones
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="1" 
                value={player.pitch} 
                onChange={(e) => player.setPitch(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

