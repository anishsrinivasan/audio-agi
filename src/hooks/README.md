# useAudioPlayer Hook

A custom React hook for building audio players with independent pitch and speed control using the SoundTouch library.

## Features

- 🎵 Load audio files from file input
- ▶️ Play, pause, and stop controls
- 🎚️ Seek to any position in the audio
- ⚡ Speed control (0.5x - 2x) without affecting pitch
- 🎹 Pitch control (±12 semitones) without affecting speed
- 📊 Real-time playback position tracking
- ⏱️ Duration and current time formatting

## Installation

Make sure you have `soundtouchjs` installed:

```bash
npm install soundtouchjs
```

## Basic Usage

```tsx
import { useAudioPlayer } from './hooks/useAudioPlayer';

function MyAudioPlayer() {
  const audioPlayer = useAudioPlayer({
    onPlaybackEnd: () => {
      console.log('Audio finished playing');
    },
    onError: (error) => {
      console.error('Audio error:', error);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await audioPlayer.loadFile(files[0]);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      
      {audioPlayer.audioFileName && (
        <>
          <p>{audioPlayer.formatTime(audioPlayer.currentTime)} / {audioPlayer.formatTime(audioPlayer.duration)}</p>
          
          <input 
            type="range" 
            min="0" 
            max={audioPlayer.duration} 
            value={audioPlayer.currentTime} 
            onChange={(e) => audioPlayer.seek(parseFloat(e.target.value))}
          />
          
          <button onClick={audioPlayer.play} disabled={audioPlayer.isPlaying}>Play</button>
          <button onClick={audioPlayer.pause} disabled={!audioPlayer.isPlaying}>Pause</button>
          <button onClick={audioPlayer.stop}>Stop</button>
          
          <div>
            <label>
              Speed: {audioPlayer.speed}x
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={audioPlayer.speed} 
                onChange={(e) => audioPlayer.setSpeed(parseFloat(e.target.value))}
              />
            </label>
          </div>
          
          <div>
            <label>
              Pitch: {audioPlayer.pitch} semitones
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="0.5" 
                value={audioPlayer.pitch} 
                onChange={(e) => audioPlayer.setPitch(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
```

## API Reference

### Options

```typescript
interface UseAudioPlayerOptions {
  onPlaybackEnd?: () => void;  // Called when audio finishes playing
  onError?: (error: Error) => void;  // Called when an error occurs
}
```

### Return Value

```typescript
interface UseAudioPlayerReturn {
  // State
  isPlaying: boolean;           // Whether audio is currently playing
  isLoading: boolean;           // Whether audio file is loading
  currentTime: number;          // Current playback position in seconds
  duration: number;             // Total duration in seconds
  audioFileName: string | null; // Name of the loaded audio file
  speed: number;                // Current playback speed (1 = normal)
  pitch: number;                // Current pitch in semitones (0 = normal)
  
  // Controls
  loadFile: (file: File) => Promise<void>;  // Load an audio file
  play: () => void;                          // Start playback
  pause: () => void;                         // Pause playback
  stop: () => void;                          // Stop and reset to beginning
  seek: (time: number) => void;              // Seek to a specific time in seconds
  setSpeed: (speed: number) => void;         // Set playback speed (0.5 - 2.0)
  setPitch: (pitch: number) => void;         // Set pitch in semitones (-12 to +12)
  
  // Utilities
  formatTime: (seconds: number) => string;   // Format seconds as "MM:SS"
}
```

## Advanced Example

```tsx
import { useAudioPlayer } from './hooks/useAudioPlayer';

function AdvancedAudioPlayer() {
  const audioPlayer = useAudioPlayer({
    onPlaybackEnd: () => {
      // Auto-play next track or show completion message
      console.log('Playback complete!');
    },
    onError: (error) => {
      // Show user-friendly error message
      alert(`Failed to load audio: ${error.message}`);
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        audioPlayer.isPlaying ? audioPlayer.pause() : audioPlayer.play();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [audioPlayer.isPlaying]);

  // Skip forward/backward
  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(audioPlayer.duration, audioPlayer.currentTime + seconds));
    audioPlayer.seek(newTime);
  };

  return (
    <div>
      {/* ... file input ... */}
      
      <button onClick={() => skip(-10)}>⏪ -10s</button>
      <button onClick={() => skip(10)}>⏩ +10s</button>
      
      {/* Progress bar with percentage */}
      <div>
        <progress value={audioPlayer.currentTime} max={audioPlayer.duration} />
        <span>{((audioPlayer.currentTime / audioPlayer.duration) * 100).toFixed(1)}%</span>
      </div>
      
      {/* Preset speed buttons */}
      <div>
        <button onClick={() => audioPlayer.setSpeed(0.75)}>0.75x</button>
        <button onClick={() => audioPlayer.setSpeed(1)}>1x</button>
        <button onClick={() => audioPlayer.setSpeed(1.25)}>1.25x</button>
        <button onClick={() => audioPlayer.setSpeed(1.5)}>1.5x</button>
      </div>
    </div>
  );
}
```

## How It Works

The hook uses the Web Audio API with the SoundTouch library for pitch shifting:

1. **Loading**: Audio files are loaded as `ArrayBuffer`, decoded to `AudioBuffer`
2. **Pitch Shifting**: SoundTouch's `PitchShifter` processes the audio in real-time
3. **Seeking**: Works by setting the `percentagePlayed` property (0-1 range)
4. **Speed Control**: Adjusts tempo without affecting pitch
5. **Pitch Control**: Changes pitch in semitones without affecting speed

## Notes

- Pitch and speed controls work independently using advanced audio processing
- Seeking is supported and works smoothly during playback
- The hook automatically handles cleanup when components unmount
- Audio context is properly managed to avoid memory leaks

## Browser Compatibility

Requires browsers that support:
- Web Audio API
- AudioContext
- ScriptProcessorNode (or AudioWorklet in future versions)

Tested on: Chrome, Firefox, Safari, Edge (latest versions)

