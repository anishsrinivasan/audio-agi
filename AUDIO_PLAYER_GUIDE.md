# Audio Player Integration Guide

This project includes a reusable `useAudioPlayer` hook that makes it easy to add audio playback with pitch and speed control to any React component.

## Quick Start

### 1. Import the Hook

```tsx
import { useAudioPlayer } from './hooks/useAudioPlayer';
```

### 2. Use in Your Component

```tsx
function MyComponent() {
  const audioPlayer = useAudioPlayer({
    onPlaybackEnd: () => console.log('Done!'),
    onError: (error) => console.error(error),
  });

  // Load a file
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) await audioPlayer.loadFile(file);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={audioPlayer.play}>Play</button>
      <button onClick={audioPlayer.pause}>Pause</button>
    </div>
  );
}
```

## Available Properties

```tsx
const player = useAudioPlayer();

// State (read-only)
player.isPlaying      // boolean: Is audio currently playing?
player.isLoading      // boolean: Is file being loaded?
player.currentTime    // number: Current position in seconds
player.duration       // number: Total duration in seconds
player.audioFileName  // string | null: Name of loaded file
player.speed          // number: Current speed (1 = normal)
player.pitch          // number: Current pitch in semitones (0 = normal)

// Methods
player.loadFile(file)       // Load audio file (async)
player.play()               // Start playback
player.pause()              // Pause playback
player.stop()               // Stop and reset to beginning
player.seek(timeInSeconds)  // Jump to specific time
player.setSpeed(0.5 to 2)   // Change speed
player.setPitch(-12 to 12)  // Change pitch (semitones)
player.formatTime(seconds)  // Format time as "MM:SS"
```

## Examples

### Example 1: Basic Player

```tsx
function BasicPlayer() {
  const player = useAudioPlayer();
  
  return (
    <>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={(e) => e.target.files?.[0] && player.loadFile(e.target.files[0])}
      />
      
      {player.audioFileName && (
        <>
          <p>{player.formatTime(player.currentTime)} / {player.formatTime(player.duration)}</p>
          <button onClick={player.play} disabled={player.isPlaying}>▶</button>
          <button onClick={player.pause} disabled={!player.isPlaying}>⏸</button>
          <button onClick={player.stop}>⏹</button>
        </>
      )}
    </>
  );
}
```

### Example 2: With Speed Control

```tsx
function SpeedControlPlayer() {
  const player = useAudioPlayer();
  
  return (
    <>
      <input type="file" accept="audio/*" onChange={...} />
      
      {player.audioFileName && (
        <>
          <div>Speed: {player.speed}x</div>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={player.speed}
            onChange={(e) => player.setSpeed(parseFloat(e.target.value))}
          />
          
          {/* Quick presets */}
          <button onClick={() => player.setSpeed(0.75)}>0.75x</button>
          <button onClick={() => player.setSpeed(1)}>1x</button>
          <button onClick={() => player.setSpeed(1.5)}>1.5x</button>
        </>
      )}
    </>
  );
}
```

### Example 3: With Pitch Control

```tsx
function PitchControlPlayer() {
  const player = useAudioPlayer();
  
  return (
    <>
      <input type="file" accept="audio/*" onChange={...} />
      
      {player.audioFileName && (
        <>
          <div>Pitch: {player.pitch > 0 ? '+' : ''}{player.pitch} semitones</div>
          <input 
            type="range" 
            min="-12" 
            max="12" 
            step="0.5" 
            value={player.pitch}
            onChange={(e) => player.setPitch(parseFloat(e.target.value))}
          />
          
          {/* Quick presets */}
          <button onClick={() => player.setPitch(-2)}>-2</button>
          <button onClick={() => player.setPitch(0)}>Reset</button>
          <button onClick={() => player.setPitch(2)}>+2</button>
        </>
      )}
    </>
  );
}
```

### Example 4: With Seek Bar

```tsx
function PlayerWithSeek() {
  const player = useAudioPlayer();
  
  return (
    <>
      <input type="file" accept="audio/*" onChange={...} />
      
      {player.audioFileName && (
        <>
          {/* Seek bar */}
          <input 
            type="range" 
            min="0" 
            max={player.duration || 0}
            step="0.1"
            value={player.currentTime}
            onChange={(e) => player.seek(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          
          {/* Skip buttons */}
          <button onClick={() => player.seek(Math.max(0, player.currentTime - 10))}>
            ⏪ -10s
          </button>
          <button onClick={() => player.seek(Math.min(player.duration, player.currentTime + 10))}>
            ⏩ +10s
          </button>
        </>
      )}
    </>
  );
}
```

### Example 5: With Callbacks

```tsx
function CallbackPlayer() {
  const [playlist, setPlaylist] = useState(['track1.mp3', 'track2.mp3']);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const player = useAudioPlayer({
    onPlaybackEnd: () => {
      // Auto-play next track
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex(currentIndex + 1);
        // Load next track...
      }
    },
    onError: (error) => {
      alert(`Error loading audio: ${error.message}`);
    },
  });
  
  return <>{/* ... */}</>;
}
```

## Component Files

The project includes example components:

1. **`src/App.tsx`** - Full-featured player with all controls
2. **`src/components/MinimalPlayer.tsx`** - Basic example with minimal code
3. **`src/hooks/useAudioPlayer.ts`** - The reusable hook
4. **`src/hooks/README.md`** - Detailed documentation

## Integration Tips

1. **Multiple Players**: You can use the hook multiple times for different audio instances
2. **Keyboard Shortcuts**: Add event listeners to control playback with keyboard
3. **Playlist Support**: Use callbacks to implement auto-play and playlists
4. **Loading States**: Show spinners using `player.isLoading`
5. **Error Handling**: Use `onError` callback for user-friendly error messages

## How It Works

- Uses Web Audio API with SoundTouch library for pitch/speed control
- Pitch and speed are independent - change one without affecting the other
- Seeking works smoothly during playback
- Automatically cleans up resources when component unmounts

## Browser Support

Works on all modern browsers that support Web Audio API:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Dependencies

- React 16.8+ (for hooks)
- soundtouchjs (for pitch/speed processing)

