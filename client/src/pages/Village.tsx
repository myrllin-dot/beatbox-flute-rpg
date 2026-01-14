/**
 * Village Page
 * Design: Arcane Academy - Interactive village map with quest progression
 * Features: Village cards, level indicators, locked/unlocked states
 */

import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, MapPin, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';

interface Village {
  id: string;
  level: string;
  nameKey: string;
  descriptionKey: string;
  status: 'completed' | 'current' | 'locked';
  questCount: number;
  completedQuests: number;
}

const villages: Village[] = [
  {
    id: 'beginner',
    level: 'level.1',
    nameKey: 'village.beginner',
    descriptionKey: 'quest.beginner.goal',
    status: 'current',
    questCount: 5,
    completedQuests: 2,
  },
  {
    id: 'trial',
    level: 'level.2',
    nameKey: 'village.trial',
    descriptionKey: 'quest.trial.goal',
    status: 'locked',
    questCount: 6,
    completedQuests: 0,
  },
  {
    id: 'explorer',
    level: 'level.3',
    nameKey: 'village.explorer',
    descriptionKey: 'quest.explorer.title',
    status: 'locked',
    questCount: 8,
    completedQuests: 0,
  },
  {
    id: 'master',
    level: 'level.max',
    nameKey: 'village.master',
    descriptionKey: 'quest.master.title',
    status: 'locked',
    questCount: 10,
    completedQuests: 0,
  },
];

export default function Village() {
  const { t } = useLanguage();

  const getStatusIcon = (status: Village['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'current':
        return <MapPin className="w-5 h-5 text-primary animate-pulse" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: Village['status']) => {
    switch (status) {
      case 'completed':
        return t('village.completed');
      case 'current':
        return t('village.current');
      case 'locked':
        return t('village.locked');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-20 lg:pt-8 pb-20">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-gold mb-4">
              {t('nav.village')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              選擇你要前往的村莊，完成任務以解鎖下一個區域
            </p>
          </motion.div>

          {/* Village Map Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 rounded-2xl overflow-hidden glow-purple"
          >
            <img 
              src="/images/village-map.png" 
              alt="Village Map"
              className="w-full h-auto"
            />
          </motion.div>

          {/* Village Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {villages.map((village, index) => (
              <motion.div
                key={village.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <VillageCard village={village} t={t} getStatusIcon={getStatusIcon} getStatusText={getStatusText} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

interface VillageCardProps {
  village: Village;
  t: (key: string) => string;
  getStatusIcon: (status: Village['status']) => React.ReactNode;
  getStatusText: (status: Village['status']) => string;
}

function VillageCard({ village, t, getStatusIcon, getStatusText }: VillageCardProps) {
  const isLocked = village.status === 'locked';
  const isCurrent = village.status === 'current';
  const progress = village.questCount > 0 ? (village.completedQuests / village.questCount) * 100 : 0;

  return (
    <div
      className={`
        magic-card p-6 transition-all duration-300
        ${isLocked ? 'opacity-60' : 'hover:scale-[1.02]'}
        ${isCurrent ? 'ring-2 ring-primary animate-pulse-glow' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-2">
            {t(village.level)}
          </span>
          <h3 className="font-display text-xl font-bold text-foreground">
            {t(village.nameKey)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(village.status)}
          <span className="text-sm text-muted-foreground">
            {getStatusText(village.status)}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {t(village.descriptionKey)}
      </p>

      {/* Progress */}
      {!isLocked && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">任務進度</span>
            <span className="text-primary font-semibold">
              {village.completedQuests}/{village.questCount}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      )}

      {/* Stars for completed quests */}
      {village.completedQuests > 0 && (
        <div className="flex gap-1 mb-4">
          {[...Array(village.completedQuests)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-primary text-primary" />
          ))}
          {[...Array(village.questCount - village.completedQuests)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-muted" />
          ))}
        </div>
      )}

      {/* Action Button */}
      {isLocked ? (
        <Button disabled className="w-full" variant="secondary">
          <Lock className="w-4 h-4 mr-2" />
          {t('village.locked')}
        </Button>
      ) : (
        <Link href={`/quests?village=${village.id}`}>
          <Button className="w-full group bg-primary hover:bg-primary/90">
            {isCurrent ? t('action.continue') : t('action.view')}
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
    </div>
  );
}
