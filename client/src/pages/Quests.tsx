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
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'completed' | 'inProgress' | 'available' | 'locked';
  skills: string[];
}

const beginnerQuests: Quest[] = [
  {
    id: '1-1',
    title: '基礎氣息控制',
    description: '學習穩定的氣息控制，這是所有長笛技巧的基礎。掌握正確的呼吸方式和氣流控制。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15分鐘',
    difficulty: 'easy',
    status: 'completed',
    skills: ['氣息控制', '基礎音色'],
  },
  {
    id: '1-2',
    title: '音色穩定訓練',
    description: '透過持續的長音練習，建立穩定且飽滿的音色。學習如何保持音準和音質。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '20分鐘',
    difficulty: 'easy',
    status: 'completed',
    skills: ['音色控制', '長音練習'],
  },
  {
    id: '1-3',
    title: '節奏感培養',
    description: '使用節拍器進行節奏訓練，建立穩定的內在節奏感。從簡單的四拍開始。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '25分鐘',
    difficulty: 'medium',
    status: 'inProgress',
    skills: ['節奏感', '節拍器使用'],
  },
  {
    id: '1-4',
    title: '基礎 Beatbox 節奏',
    description: '學習第一個 Beatbox 節奏型態，結合長笛演奏創造獨特的音樂效果。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '30分鐘',
    difficulty: 'medium',
    status: 'available',
    skills: ['Beatbox 基礎', '節奏組合'],
  },
  {
    id: '1-5',
    title: '新手村畢業考核',
    description: '綜合前面所學的技巧，完成畢業考核任務。通過後可獲得黑笛徽章！',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '45分鐘',
    difficulty: 'hard',
    status: 'locked',
    skills: ['綜合技巧', '考核'],
  },
];

const trialQuests: Quest[] = [
  {
    id: '2-1',
    title: '雙重聲入門',
    description: '學習同時發出兩種聲音的技巧，這是 Beatbox Flute 的核心技術。',
    duration: '30分鐘',
    difficulty: 'hard',
    status: 'locked',
    skills: ['雙重聲', '進階技巧'],
  },
  {
    id: '2-2',
    title: '藍調音階練習',
    description: '掌握藍調音階的特殊音程，為即興演奏打下基礎。',
    duration: '25分鐘',
    difficulty: 'medium',
    status: 'locked',
    skills: ['藍調音階', '音程'],
  },
  {
    id: '2-3',
    title: '雙重聲 + 藍調組合',
    description: '將雙重聲技巧與藍調旋律結合，創造獨特的音樂風格。',
    duration: '40分鐘',
    difficulty: 'hard',
    status: 'locked',
    skills: ['組合技巧', '即興'],
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
              在這個頁面開始學習你的第一項技能吧！完成任務以獲得徽章和解鎖新關卡。
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
              {quest.title}
            </h3>
            {getStatusBadge()}
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {quest.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {quest.duration}
            </span>
            <span className={`flex items-center gap-1 ${getDifficultyColor()}`}>
              <Music className="w-4 h-4" />
              {quest.difficulty === 'easy' ? '簡單' : quest.difficulty === 'medium' ? '中等' : '困難'}
            </span>
            {quest.videoUrl && (
              <span className="flex items-center gap-1 text-accent">
                <Video className="w-4 h-4" />
                含教學影片
              </span>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quest.skills.map((skill) => (
              <span 
                key={skill}
                className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {isLocked ? (
            <Button disabled variant="secondary" size="sm">
              <Lock className="w-4 h-4 mr-1" />
              未解鎖
            </Button>
          ) : (
            <Link href={`/quests/${quest.id}`}>
              <Button 
                size="sm" 
                className={isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}
              >
                {isCompleted ? '複習' : isInProgress ? '繼續' : '開始'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
