/**
 * Progress Page
 * Design: Arcane Academy - Visual progress tracking with achievements
 * Features: Stats dashboard, badge collection, skill tree visualization
 */

import { motion } from 'framer-motion';
import { Trophy, Star, Target, Clock, Flame, Award, Lock, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Progress as ProgressBar } from '@/components/ui/progress';

interface Badge {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface Skill {
  id: string;
  nameKey: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
}

const badges: Badge[] = [
  {
    id: 'black-flute',
    nameKey: 'badge.black',
    descKey: 'quest.beginner.reward',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
  {
    id: 'first-step',
    nameKey: 'badge.firstStep',
    descKey: 'badge.firstStep',
    icon: '/images/badge-black-flute.png',
    earned: true,
    earnedDate: '2024-01-15',
  },
  {
    id: 'breath-master',
    nameKey: 'badge.breathMaster',
    descKey: 'badge.breathMaster',
    icon: '/images/badge-black-flute.png',
    earned: true,
    earnedDate: '2024-01-18',
  },
  {
    id: 'silver-flute',
    nameKey: 'badge.silver',
    descKey: 'quest.trial.reward',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
  {
    id: 'gold-flute',
    nameKey: 'badge.gold',
    descKey: 'quest.explorer.title',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
  {
    id: 'master',
    nameKey: 'badge.master',
    descKey: 'quest.master.title',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
];

const skills: Skill[] = [
  { id: 'breath', nameKey: 'skill.breathControl', level: 3, maxLevel: 5, unlocked: true },
  { id: 'tone', nameKey: 'skill.toneStability', level: 2, maxLevel: 5, unlocked: true },
  { id: 'rhythm', nameKey: 'skill.rhythm', level: 1, maxLevel: 5, unlocked: true },
  { id: 'beatbox', nameKey: 'skill.beatboxBasic', level: 0, maxLevel: 5, unlocked: true },
  { id: 'dual-voice', nameKey: 'skill.dualVoice', level: 0, maxLevel: 5, unlocked: false },
  { id: 'blues', nameKey: 'skill.bluesMelody', level: 0, maxLevel: 5, unlocked: false },
  { id: 'improv', nameKey: 'skill.improvisation', level: 0, maxLevel: 5, unlocked: false },
  { id: 'performance', nameKey: 'skill.performance', level: 0, maxLevel: 5, unlocked: false },
];

const stats = {
  totalQuests: 15,
  completedQuests: 2,
  totalBadges: 6,
  earnedBadges: 2,
  practiceHours: 5.5,
  currentStreak: 3,
  longestStreak: 7,
  currentLevel: 1,
  currentExp: 250,
  nextLevelExp: 500,
};

export default function Progress() {
  const { t, language } = useLanguage();

  const expProgress = (stats.currentExp / stats.nextLevelExp) * 100;
  const expNeeded = stats.nextLevelExp - stats.currentExp;

  const weekDays = language === 'zh' 
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
              {t('progress.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('progress.description')}
            </p>
          </motion.div>

          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="magic-card p-6 mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src="/images/wizard-character.png" 
                  alt="Character"
                  className="w-24 h-24 object-contain"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-display font-bold text-primary-foreground glow-gold">
                  {stats.currentLevel}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {t('level.1')} {t('level.apprentice')}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {stats.currentExp} / {stats.nextLevelExp} {t('misc.exp')}
                  </span>
                </div>
                <ProgressBar value={expProgress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('progress.expNeeded').replace('{exp}', expNeeded.toString())}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label={t('progress.quests')}
              value={`${stats.completedQuests}/${stats.totalQuests}`}
              color="text-primary"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label={t('progress.badges')}
              value={`${stats.earnedBadges}/${stats.totalBadges}`}
              color="text-yellow-400"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label={t('progress.practiceHours')}
              value={`${stats.practiceHours}h`}
              color="text-accent"
            />
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              label={t('progress.streak')}
              value={`${stats.currentStreak} ${t('progress.days')}`}
              color="text-orange-400"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="magic-card p-6"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                {t('badge.collection')}
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={`
                      relative p-4 rounded-xl text-center transition-all
                      ${badge.earned 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-muted/50 opacity-50'
                      }
                    `}
                  >
                    <div className="relative mx-auto w-16 h-16 mb-2">
                      <img 
                        src={badge.icon}
                        alt={t(badge.nameKey)}
                        className={`w-full h-full object-contain ${!badge.earned && 'grayscale'}`}
                      />
                      {!badge.earned && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className={`text-sm font-semibold ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t(badge.nameKey)}
                    </h3>
                    {badge.earned && badge.earnedDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {badge.earnedDate}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="magic-card p-6"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                {t('progress.skillTree')}
              </h2>
              
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={`
                      p-4 rounded-xl transition-all
                      ${skill.unlocked 
                        ? 'bg-secondary/50' 
                        : 'bg-muted/30 opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {skill.unlocked ? (
                          skill.level > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Star className="w-4 h-4 text-muted-foreground" />
                          )
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={`font-medium ${skill.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t(skill.nameKey)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Lv.{skill.level}/{skill.maxLevel}
                      </span>
                    </div>
                    
                    {/* Skill Level Stars */}
                    <div className="flex gap-1">
                      {[...Array(skill.maxLevel)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < skill.level 
                              ? 'fill-primary text-primary' 
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Practice Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="magic-card p-6 mt-8 max-w-2xl mx-auto text-center"
          >
            <Flame className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              {t('progress.streakTitle').replace('{days}', stats.currentStreak.toString())}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t('progress.streakRecord').replace('{days}', stats.longestStreak.toString())}
            </p>
            
            {/* Week Calendar */}
            <div className="flex justify-center gap-2">
              {weekDays.map((day, index) => (
                <div
                  key={day + index}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                    ${index < stats.currentStreak 
                      ? 'bg-orange-400 text-white' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {day}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="magic-card p-4 text-center">
      <div className={`${color} mb-2 flex justify-center`}>
        {icon}
      </div>
      <p className="font-display text-2xl font-bold text-foreground mb-1">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
