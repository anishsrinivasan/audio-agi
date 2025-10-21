import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// @ts-ignore - soundtouchjs doesn't have type definitions
import { PitchShifter } from 'soundtouchjs';

// Correct typing for webkitAudioContext
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

function App() {
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const pitchShifterRef = useRef<any>(null);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0); // pitch in semitones (-12 to +12)
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update speed (tempo)
  useEffect(() => {
    if (pitchShifterRef.current) {
      pitchShifterRef.current.tempo = speed;
    }
  }, [speed]);

  // Update pitch
  useEffect(() => {
    if (pitchShifterRef.current) {
      pitchShifterRef.current.pitchSemitones = pitch;
    }
  }, [pitch]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      const file = files[0];
      
      try {
        // Stop any existing playback
        if (isPlaying) {
          handleStop();
        }
        
        // Clean up previous resources
        if (audioContext.current) {
          await audioContext.current.close();
        }
        
        // Create new audio context
        audioContext.current = new AudioContextClass();
        
        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Decode audio data
        audioBuffer.current = await audioContext.current.decodeAudioData(arrayBuffer);
        
        // Create pitch shifter with the audio buffer
        pitchShifterRef.current = new PitchShifter(
          audioContext.current,
          audioBuffer.current,
          1024
        );
        
        // Set initial values
        pitchShifterRef.current.tempo = speed;
        pitchShifterRef.current.pitchSemitones = pitch;
        
        // Connect to destination
        pitchShifterRef.current.connect(audioContext.current.destination);
        
        // Set duration
        setDuration(audioBuffer.current.duration);
        setCurrentTime(0);
        setAudioFile(file.name);
        
        // Listen for when playback position updates
        pitchShifterRef.current.on('play', (event: any) => {
          setCurrentTime(event.timePlayed);
          if (event.percentagePlayed >= 99.9) {
            handleStop();
          }
        });
        
      } catch (error) {
        console.error('Error loading audio file:', error);
        alert('Error loading audio file. Please try another file.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  const handlePitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(event.target.value);
    setPitch(newPitch);
  };

  const handlePlay = () => {
    if (pitchShifterRef.current && audioContext.current) {
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      // Ensure connected before playing
      pitchShifterRef.current.connect(audioContext.current.destination);
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (pitchShifterRef.current && audioContext.current) {
      pitchShifterRef.current.disconnect();
      audioContext.current.suspend();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (pitchShifterRef.current) {
      pitchShifterRef.current.disconnect();
      pitchShifterRef.current.percentagePlayed = 0;
    }
    if (audioContext.current) {
      audioContext.current.suspend();
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
  };

  const handleSeekEnd = (event: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const newTime = parseFloat(target.value);
    setCurrentTime(newTime);
    
    if (pitchShifterRef.current && duration > 0) {
      const percentage = newTime / duration;
      try {
        // Set the playback position (percentagePlayed expects 0-1, not 0-100)
        pitchShifterRef.current.percentagePlayed = percentage;
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          disabled={isLoading}
        />
        {isLoading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
      </div>

      {audioFile && (
        <>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>{audioFile}</div>
            
            <div style={{ marginBottom: '10px' }}>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                step="0.1" 
                value={currentTime} 
                onChange={handleSeek}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
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
                onClick={handlePlay} 
                disabled={isPlaying}
                style={{ 
                  padding: '10px 20px', 
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  backgroundColor: isPlaying ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                ▶ Play
              </button>
              <button 
                onClick={handlePause} 
                disabled={!isPlaying}
                style={{ 
                  padding: '10px 20px', 
                  cursor: !isPlaying ? 'not-allowed' : 'pointer',
                  backgroundColor: !isPlaying ? '#ccc' : '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                ⏸ Pause
              </button>
              <button 
                onClick={handleStop}
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
              <strong>Speed: {speed.toFixed(2)}x</strong>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={speed} 
                onChange={handleSpeedChange}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Pitch: {pitch > 0 ? '+' : ''}{pitch.toFixed(1)} semitones</strong>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="0.5" 
                value={pitch} 
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
