import { useState, useRef, useEffect } from 'react';

// @ts-ignore - soundtouchjs doesn't have type definitions
import { PitchShifter } from 'soundtouchjs';

// Correct typing for webkitAudioContext
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

export interface UseAudioPlayerOptions {
  onPlaybackEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface UseAudioPlayerReturn {
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  audioFileName: string | null;
  speed: number;
  pitch: number;
  
  // Controls
  loadFile: (file: File) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  setPitch: (pitch: number) => void;
  
  // Utilities
  formatTime: (seconds: number) => string;
}

export const useAudioPlayer = (options?: UseAudioPlayerOptions): UseAudioPlayerReturn => {
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const pitchShifterRef = useRef<any>(null);
  
  const [speed, setSpeedState] = useState(1);
  const [pitch, setPitchState] = useState(0); // pitch in semitones (-12 to +12)
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
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

  const loadFile = async (file: File) => {
    setIsLoading(true);
    
    try {
      // Stop any existing playback
      if (isPlaying) {
        stop();
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
      setAudioFileName(file.name);
      
      // Listen for when playback position updates
      pitchShifterRef.current.on('play', (event: any) => {
        setCurrentTime(event.timePlayed);
        if (event.percentagePlayed >= 99.9) {
          stop();
          if (options?.onPlaybackEnd) {
            options.onPlaybackEnd();
          }
        }
      });
      
    } catch (error) {
      console.error('Error loading audio file:', error);
      if (options?.onError) {
        options.onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const play = () => {
    if (pitchShifterRef.current && audioContext.current) {
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      // Ensure connected before playing
      pitchShifterRef.current.connect(audioContext.current.destination);
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (pitchShifterRef.current && audioContext.current) {
      pitchShifterRef.current.disconnect();
      audioContext.current.suspend();
      setIsPlaying(false);
    }
  };

  const stop = () => {
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

  const seek = (time: number) => {
    setCurrentTime(time);
    
    if (pitchShifterRef.current && duration > 0) {
      const percentage = time / duration;
      try {
        // Set the playback position (percentagePlayed expects 0-1, not 0-100)
        pitchShifterRef.current.percentagePlayed = percentage;
      } catch (error) {
        console.error('Error seeking:', error);
        if (options?.onError) {
          options.onError(error as Error);
        }
      }
    }
  };

  const setSpeed = (newSpeed: number) => {
    setSpeedState(newSpeed);
  };

  const setPitch = (newPitch: number) => {
    setPitchState(newPitch);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    isPlaying,
    isLoading,
    currentTime,
    duration,
    audioFileName,
    speed,
    pitch,
    
    // Controls
    loadFile,
    play,
    pause,
    stop,
    seek,
    setSpeed,
    setPitch,
    
    // Utilities
    formatTime,
  };
};

