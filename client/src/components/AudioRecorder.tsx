/**
 * Audio Recorder Component
 * Design: Arcane Academy - Record and playback practice sessions
 * Features: Recording, playback, waveform visualization, download
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

export default function AudioRecorder() {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      recordings.forEach(rec => URL.revokeObjectURL(rec.url));
    };
  }, []);

  // Visualize audio level
  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(visualizeAudio);
    }
  }, [isRecording]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording: Recording = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          timestamp: new Date(),
        };
        
        setRecordings(prev => [newRecording, ...prev].slice(0, 5)); // Keep last 5 recordings
        setRecordingTime(0);
        toast.success(t('recorder.saved'));
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start visualization
      visualizeAudio();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error(t('recorder.micError'));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setAudioLevel(0);
    }
  };

  // Play recording
  const playRecording = (recording: Recording) => {
    if (currentlyPlaying === recording.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentlyPlaying(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(recording.url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
      
      audio.play();
      setCurrentlyPlaying(recording.id);
    }
  };

  // Delete recording
  const deleteRecording = (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (recording) {
      URL.revokeObjectURL(recording.url);
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (currentlyPlaying === id) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentlyPlaying(null);
      }
      toast.success(t('recorder.deleted'));
    }
  };

  // Download recording
  const downloadRecording = (recording: Recording) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `practice-${recording.timestamp.toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(t('recorder.downloaded'));
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="magic-card p-6">
      <h3 className="font-display text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="text-2xl">🎤</span>
        {t('recorder.title')}
      </h3>

      {/* Recording Interface */}
      <div className="text-center mb-6">
        {/* Audio Level Visualization */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{
              scale: isRecording ? 1 + audioLevel * 0.5 : 1,
              opacity: isRecording ? 0.3 + audioLevel * 0.7 : 0.3,
            }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-primary/30"
            animate={{
              scale: isRecording ? 1 + audioLevel * 0.3 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`
              absolute inset-4 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isRecording 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-primary hover:bg-primary/90 glow-gold'
              }
            `}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-primary-foreground" />
            )}
          </button>
        </div>

        {/* Recording Time */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="font-display text-2xl font-bold text-destructive">
                {formatTime(recordingTime)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!isRecording && (
          <p className="text-sm text-muted-foreground">
            {t('recorder.tapToRecord')}
          </p>
        )}
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            {t('recorder.recentRecordings')} ({recordings.length})
          </h4>
          
          {recordings.map((recording, index) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all
                ${currentlyPlaying === recording.id 
                  ? 'bg-primary/20 border border-primary/30' 
                  : 'bg-secondary/50'
                }
              `}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => playRecording(recording)}
                className={currentlyPlaying === recording.id ? 'text-primary' : ''}
              >
                {currentlyPlaying === recording.id ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {t('recorder.recording')} #{recordings.length - index}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(recording.duration)} • {recording.timestamp.toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadRecording(recording)}
                  className="text-muted-foreground hover:text-accent"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRecording(recording.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border">
        <p className="text-sm text-muted-foreground">
          💡 {t('recorder.tip')}
        </p>
      </div>
    </div>
  );
}
