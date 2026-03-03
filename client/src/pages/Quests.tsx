/**
 * Quests Page
 * Design: Arcane Academy - Quest list with magical scroll aesthetic
 * Features: Quest cards, status indicators, video tutorials
 */

import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Lock, Clock, ChevronRight, Music, Video, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Quest {
  id: string;
  titleKey: string;
  descKey: string;
  videoUrl?: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'completed' | 'inProgress' | 'available' | 'locked';
  skillKeys: string[];
}

const beginnerQuests: Quest[] = [
  {
    id: '1-1',
    titleKey: 'quest.1-1.title',
    descKey: 'quest.1-1.description',
    videoUrl: 'https://youtu.be/SsEbqkEE92A',
    duration: 15,
    difficulty: 'easy',
    status: 'completed',
    skillKeys: ['skill.breathControl', 'skill.basicTone'],
  },
  {
    id: '1-2',
    titleKey: 'quest.1-2.title',
    descKey: 'quest.1-2.description',
    videoUrl: 'https://youtu.be/SsEbqkEE92A',
    duration: 20,
    difficulty: 'easy',
    status: 'completed',
    skillKeys: ['skill.toneControl', 'skill.longTone'],
  },
  {
    id: '1-3',
    titleKey: 'quest.1-3.title',
    descKey: 'quest.1-3.description',
    videoUrl: 'https://youtu.be/0x6H2uOW6nI',
    duration: 25,
    difficulty: 'medium',
    status: 'inProgress',
    skillKeys: ['skill.rhythm', 'skill.metronome'],
  },
  {
    id: '1-4',
    titleKey: 'quest.1-4.title',
    descKey: 'quest.1-4.description',
    videoUrl: 'https://youtu.be/pTPm4DUrkzY',
    duration: 30,
    difficulty: 'medium',
    status: 'available',
    skillKeys: ['skill.beatboxBasic', 'skill.rhythmCombo'],
  },
  {
    id: '1-5',
    titleKey: 'quest.1-5.title',
    descKey: 'quest.1-5.description',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: 45,
    difficulty: 'hard',
    status: 'locked',
    skillKeys: ['skill.comprehensive', 'skill.exam'],
  },
];

const trialQuests: Quest[] = [
  {
    id: '2-1',
    titleKey: 'quest.2-1.title',
    descKey: 'quest.2-1.description',
    duration: 30,
    difficulty: 'hard',
    status: 'locked',
    skillKeys: ['skill.dualVoice', 'skill.advanced'],
  },
  {
    id: '2-2',
    titleKey: 'quest.2-2.title',
    descKey: 'quest.2-2.description',
    duration: 25,
    difficulty: 'medium',
    status: 'locked',
    skillKeys: ['skill.bluesScale', 'skill.interval'],
  },
  {
    id: '2-3',
    titleKey: 'quest.2-3.title',
    descKey: 'quest.2-3.description',
    duration: 40,
    difficulty: 'hard',
    status: 'locked',
    skillKeys: ['skill.combo', 'skill.improv'],
  },
];

export default function Quests() {
  const { t } = useLanguage();

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
              {t('nav.quests')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('quest.description')}
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="beginner" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="beginner" className="font-display">
                {t('level.1')} {t('village.beginner')}
              </TabsTrigger>
              <TabsTrigger value="trial" className="font-display">
                {t('level.2')} {t('village.trial')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beginner">
              <QuestList quests={beginnerQuests} t={t} />
            </TabsContent>

            <TabsContent value="trial">
              <QuestList quests={trialQuests} t={t} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

interface QuestListProps {
  quests: Quest[];
  t: (key: string) => string;
}

function QuestList({ quests, t }: QuestListProps) {
  return (
    <div className="space-y-4">
      {quests.map((quest, index) => (
        <motion.div
          key={quest.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <QuestCard quest={quest} t={t} />
        </motion.div>
      ))}
    </div>
  );
}

interface QuestCardProps {
  quest: Quest;
  t: (key: string) => string;
}

function QuestCard({ quest, t }: QuestCardProps) {
  const isLocked = quest.status === 'locked';
  const isCompleted = quest.status === 'completed';
  const isInProgress = quest.status === 'inProgress';

  const getStatusBadge = () => {
    switch (quest.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            {t('status.completed')}
          </span>
        );
      case 'inProgress':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium animate-pulse">
            <Clock className="w-3 h-3" />
            {t('status.inProgress')}
          </span>
        );
      case 'available':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
            <Play className="w-3 h-3" />
            {t('status.available')}
          </span>
        );
      case 'locked':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            <Lock className="w-3 h-3" />
            {t('status.locked')}
          </span>
        );
    }
  };

  const getDifficultyColor = () => {
    switch (quest.difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
    }
  };

  const getActionText = () => {
    if (isCompleted) return t('action.review');
    if (isInProgress) return t('action.continue');
    return t('action.start');
  };

  return (
    <div
      className={`
        magic-card p-6 transition-all duration-300
        ${isLocked ? 'opacity-50' : 'hover:scale-[1.01]'}
        ${isInProgress ? 'ring-2 ring-primary' : ''}
      `}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Quest Icon */}
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center shrink-0
          ${isCompleted ? 'bg-green-500/20' : isLocked ? 'bg-muted' : 'bg-primary/20'}
        `}>
          {isCompleted ? (
            <CheckCircle className="w-8 h-8 text-green-400" />
          ) : isLocked ? (
            <Lock className="w-8 h-8 text-muted-foreground" />
          ) : (
            <BookOpen className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Quest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-display text-lg font-semibold ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
              {t(quest.titleKey)}
            </h3>
            {getStatusBadge()}
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {t(quest.descKey)}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {quest.duration}{t('misc.minutes')}
            </span>
            <span className={`flex items-center gap-1 ${getDifficultyColor()}`}>
              <Music className="w-4 h-4" />
              {t(`difficulty.${quest.difficulty}`)}
            </span>
            {quest.videoUrl && (
              <span className="flex items-center gap-1 text-accent">
                <Video className="w-4 h-4" />
                {t('status.hasVideo')}
              </span>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quest.skillKeys.map((skillKey) => (
              <span 
                key={skillKey}
                className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
              >
                {t(skillKey)}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {isLocked ? (
            <Button disabled variant="secondary" size="sm">
              <Lock className="w-4 h-4 mr-1" />
              {t('status.locked')}
            </Button>
          ) : (
            <Link href={`/quests/${quest.id}`}>
              <Button 
                size="sm" 
                className={isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}
              >
                {getActionText()}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
