/**
 * Achievement Celebration Component
 * Displays a celebration animation when user earns an achievement or completes a quest
 * Features: Confetti effect, glowing badge, animated text
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface CelebrationData {
  type: 'achievement' | 'quest_complete' | 'level_up';
  titleZh: string;
  titleEn: string;
  messageZh?: string;
  messageEn?: string;
  xpEarned?: number;
}

interface AchievementCelebrationProps {
  celebration: CelebrationData | null;
  onClose: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#22C55E', '#F97316'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ 
        backgroundColor: color,
        left: `${x}%`,
        top: '-10px',
      }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ 
        y: 600, 
        opacity: 0, 
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{ 
        duration: 2 + Math.random() * 2,
        delay: delay,
        ease: 'easeOut',
      }}
    />
  );
};

export default function AchievementCelebration({ celebration, onClose }: AchievementCelebrationProps) {
  const { language } = useLanguage();
  const [confetti, setConfetti] = useState<{ id: number; delay: number; x: number }[]>([]);

  useEffect(() => {
    if (celebration) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        x: Math.random() * 100,
      }));
      setConfetti(particles);

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [celebration, onClose]);

  const getIcon = () => {
    switch (celebration?.type) {
      case 'achievement':
        return <Trophy className="w-16 h-16 text-yellow-400" />;
      case 'quest_complete':
        return <Star className="w-16 h-16 text-primary" />;
      case 'level_up':
        return <Sparkles className="w-16 h-16 text-purple-400" />;
      default:
        return <Trophy className="w-16 h-16 text-yellow-400" />;
    }
  };

  const getTitle = () => {
    if (!celebration) return '';
    return language === 'zh' ? celebration.titleZh : celebration.titleEn;
  };

  const getMessage = () => {
    if (!celebration) return '';
    return language === 'zh' ? celebration.messageZh : celebration.messageEn;
  };

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <ConfettiParticle key={particle.id} delay={particle.delay} x={particle.x} />
            ))}
          </div>

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="relative magic-card p-8 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Glowing icon */}
            <motion.div
              className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center glow-gold"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                  '0 0 40px rgba(255, 215, 0, 0.8)',
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {getIcon()}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-2xl font-bold text-primary text-glow-gold mb-4"
            >
              {getTitle()}
            </motion.h2>

            {/* Message */}
            {getMessage() && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-foreground/80 mb-4"
              >
                {getMessage()}
              </motion.p>
            )}

            {/* XP Earned */}
            {celebration.xpEarned && celebration.xpEarned > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-bold"
              >
                <Sparkles className="w-5 h-5" />
                +{celebration.xpEarned} XP
              </motion.div>
            )}

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-display"
              >
                {language === 'zh' ? '繼續冒險' : 'Continue'}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
