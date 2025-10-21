import React from 'react';
import './App.css';
import { useAudioPlayer } from './hooks/useAudioPlayer';

function App() {
  const audioPlayer = useAudioPlayer({
    onPlaybackEnd: () => {
      console.log('Playback ended');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await audioPlayer.loadFile(files[0]);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    audioPlayer.seek(newTime);
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    audioPlayer.setSpeed(newSpeed);
  };

  const handlePitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(event.target.value);
    audioPlayer.setPitch(newPitch);
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Simple Audio Player</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Independent pitch and speed control using SoundTouch library
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileChange}
          disabled={audioPlayer.isLoading}
        />
        {audioPlayer.isLoading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
      </div>

      {audioPlayer.audioFileName && (
        <>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>{audioPlayer.audioFileName}</div>
            
            <div style={{ marginBottom: '10px' }}>
              <span>{audioPlayer.formatTime(audioPlayer.currentTime)} / {audioPlayer.formatTime(audioPlayer.duration)}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input 
                type="range" 
                min="0" 
                max={audioPlayer.duration || 0} 
                step="0.1" 
                value={audioPlayer.currentTime} 
                onChange={handleSeek}
                style={{ 
                  width: '100%', 
                  height: '8px',
                  cursor: 'pointer',
                  accentColor: '#4CAF50'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button 
                onClick={audioPlayer.play} 
                disabled={audioPlayer.isPlaying}
                style={{ 
                  padding: '10px 20px', 
                  cursor: audioPlayer.isPlaying ? 'not-allowed' : 'pointer',
                  backgroundColor: audioPlayer.isPlaying ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                ▶ Play
              </button>
              <button 
                onClick={audioPlayer.pause} 
                disabled={!audioPlayer.isPlaying}
                style={{ 
                  padding: '10px 20px', 
                  cursor: !audioPlayer.isPlaying ? 'not-allowed' : 'pointer',
                  backgroundColor: !audioPlayer.isPlaying ? '#ccc' : '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                ⏸ Pause
              </button>
              <button 
                onClick={audioPlayer.stop}
                style={{ 
                  padding: '10px 20px', 
                  cursor: 'pointer',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                ⏹ Stop
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Speed: {audioPlayer.speed.toFixed(2)}x</strong>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={audioPlayer.speed} 
                onChange={handleSpeedChange}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Pitch: {audioPlayer.pitch > 0 ? '+' : ''}{audioPlayer.pitch.toFixed(1)} semitones</strong>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="0.5" 
                value={audioPlayer.pitch} 
                onChange={handlePitchChange}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </label>
          </div>

          <div style={{ fontSize: '12px', color: '#999', marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ margin: '5px 0' }}>✓ Speed control adjusts playback tempo without changing pitch</p>
            <p style={{ margin: '5px 0' }}>✓ Pitch control changes the key without affecting tempo</p>
            <p style={{ margin: '5px 0' }}>✓ Both controls work independently</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
