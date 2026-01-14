/**
 * Metronome Component
 * Design: Arcane Academy - Interactive metronome tool for rhythm practice
 * Features: Adjustable BPM, visual beat indicator, sound feedback
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

interface MetronomeProps {
  defaultBpm?: number;
  minBpm?: number;
  maxBpm?: number;
}

export default function Metronome({ 
  defaultBpm = 80, 
  minBpm = 40, 
  maxBpm = 200 
}: MetronomeProps) {
  const { t } = useLanguage();
  const [bpm, setBpm] = useState(defaultBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);

  // Create audio context on first interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a click sound
  const playClick = useCallback((isAccent: boolean) => {
    if (isMuted) return;
    
    const audioContext = initAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Higher pitch for accent beat (first beat of measure)
    oscillator.frequency.value = isAccent ? 1000 : 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [isMuted, initAudioContext]);

  // Start/stop metronome
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Stop
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
      currentBeatRef.current = 0;
    } else {
      // Start
      initAudioContext();
      setIsPlaying(true);
      currentBeatRef.current = 0;
      setCurrentBeat(0);
      
      const intervalMs = (60 / bpm) * 1000;
      
      // Play first beat immediately
      playClick(true);
      setCurrentBeat(1);
      currentBeatRef.current = 1;
      
      intervalRef.current = setInterval(() => {
        currentBeatRef.current = (currentBeatRef.current % beatsPerMeasure) + 1;
        setCurrentBeat(currentBeatRef.current);
        playClick(currentBeatRef.current === 1);
      }, intervalMs);
    }
  }, [isPlaying, bpm, beatsPerMeasure, playClick, initAudioContext]);

  // Update interval when BPM changes during playback
  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const intervalMs = (60 / bpm) * 1000;
      intervalRef.current = setInterval(() => {
        currentBeatRef.current = (currentBeatRef.current % beatsPerMeasure) + 1;
        setCurrentBeat(currentBeatRef.current);
        playClick(currentBeatRef.current === 1);
      }, intervalMs);
    }
  }, [bpm, beatsPerMeasure, isPlaying, playClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const adjustBpm = (delta: number) => {
    setBpm(prev => Math.max(minBpm, Math.min(maxBpm, prev + delta)));
  };

  const tempoLabel = bpm < 60 ? 'Largo' : 
                     bpm < 80 ? 'Adagio' : 
                     bpm < 100 ? 'Andante' : 
                     bpm < 120 ? 'Moderato' : 
                     bpm < 140 ? 'Allegro' : 
                     bpm < 170 ? 'Vivace' : 'Presto';

  return (
    <div className="magic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          {t('metronome.title')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      {/* Beat Indicators */}
      <div className="flex justify-center gap-3 mb-6">
        {[...Array(beatsPerMeasure)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: currentBeat === i + 1 ? 1.3 : 1,
              backgroundColor: currentBeat === i + 1 
                ? i === 0 ? 'oklch(0.75 0.15 85)' : 'oklch(0.65 0.18 160)'
                : 'oklch(0.22 0.03 280)',
            }}
            transition={{ duration: 0.1 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              boxShadow: currentBeat === i + 1 
                ? '0 0 20px oklch(0.75 0.15 85 / 0.5)' 
                : 'none'
            }}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      {/* BPM Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustBpm(-5)}
            disabled={bpm <= minBpm}
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="min-w-[120px]">
            <motion.div
              key={bpm}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-5xl font-bold text-primary text-glow-gold"
            >
              {bpm}
            </motion.div>
            <p className="text-sm text-muted-foreground">BPM</p>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustBpm(5)}
            disabled={bpm >= maxBpm}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-accent font-medium mt-2">{tempoLabel}</p>
      </div>

      {/* BPM Slider */}
      <div className="mb-6 px-2">
        <Slider
          value={[bpm]}
          onValueChange={([value]) => setBpm(value)}
          min={minBpm}
          max={maxBpm}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{minBpm}</span>
          <span>{maxBpm}</span>
        </div>
      </div>

      {/* Time Signature */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">{t('metronome.beats')}:</span>
        {[2, 3, 4, 6].map((beats) => (
          <Button
            key={beats}
            variant={beatsPerMeasure === beats ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBeatsPerMeasure(beats)}
            className="w-10"
          >
            {beats}
          </Button>
        ))}
      </div>

      {/* Play/Pause Button */}
      <Button
        onClick={togglePlay}
        size="lg"
        className={`w-full font-display text-lg ${
          isPlaying 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-primary hover:bg-primary/90 glow-gold'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-5 h-5 mr-2" />
            {t('metronome.stop')}
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            {t('metronome.start')}
          </>
        )}
      </Button>

      {/* Quick Tempo Presets */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          { label: 'Slow', bpm: 60 },
          { label: 'Medium', bpm: 90 },
          { label: 'Fast', bpm: 120 },
          { label: 'Very Fast', bpm: 150 },
        ].map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            onClick={() => setBpm(preset.bpm)}
            className="text-xs"
          >
            {preset.label} ({preset.bpm})
          </Button>
        ))}
      </div>
    </div>
  );
}
