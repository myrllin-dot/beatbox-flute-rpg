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
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
}

const badges: Badge[] = [
  {
    id: 'black-flute',
    name: '黑笛徽章',
    description: '完成新手村所有任務',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
  {
    id: 'first-step',
    name: '踏出第一步',
    description: '完成第一個任務',
    icon: '/images/badge-black-flute.png',
    earned: true,
    earnedDate: '2024-01-15',
  },
  {
    id: 'breath-master',
    name: '氣息大師',
    description: '完成氣息控制訓練',
    icon: '/images/badge-black-flute.png',
    earned: true,
    earnedDate: '2024-01-18',
  },
  {
    id: 'silver-flute',
    name: '銀笛徽章',
    description: '完成試煉村所有任務',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
  {
    id: 'gold-flute',
    name: '金笛徽章',
    description: '完成開拓村所有任務',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
  {
    id: 'master',
    name: '大師徽章',
    description: '達到領域展開',
    icon: '/images/badge-black-flute.png',
    earned: false,
  },
];

const skills: Skill[] = [
  { id: 'breath', name: '氣息控制', level: 3, maxLevel: 5, unlocked: true },
  { id: 'tone', name: '音色穩定', level: 2, maxLevel: 5, unlocked: true },
  { id: 'rhythm', name: '節奏感', level: 1, maxLevel: 5, unlocked: true },
  { id: 'beatbox', name: 'Beatbox 基礎', level: 0, maxLevel: 5, unlocked: true },
  { id: 'dual-voice', name: '雙重聲', level: 0, maxLevel: 5, unlocked: false },
  { id: 'blues', name: '藍調旋律', level: 0, maxLevel: 5, unlocked: false },
  { id: 'improv', name: '即興演奏', level: 0, maxLevel: 5, unlocked: false },
  { id: 'performance', name: '表演技巧', level: 0, maxLevel: 5, unlocked: false },
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
  const { t } = useLanguage();

  const expProgress = (stats.currentExp / stats.nextLevelExp) * 100;

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
              追蹤你的學習進度，收集徽章，提升技能等級
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
                    {t('level.1')} 長笛見習生
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {stats.currentExp} / {stats.nextLevelExp} EXP
                  </span>
                </div>
                <ProgressBar value={expProgress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  再獲得 {stats.nextLevelExp - stats.currentExp} 經驗值即可升級
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
              label="完成任務"
              value={`${stats.completedQuests}/${stats.totalQuests}`}
              color="text-primary"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="獲得徽章"
              value={`${stats.earnedBadges}/${stats.totalBadges}`}
              color="text-yellow-400"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="練習時數"
              value={`${stats.practiceHours}h`}
              color="text-accent"
            />
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              label="連續練習"
              value={`${stats.currentStreak} 天`}
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
                徽章收藏
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
                        alt={badge.name}
                        className={`w-full h-full object-contain ${!badge.earned && 'grayscale'}`}
                      />
                      {!badge.earned && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className={`text-sm font-semibold ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
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
                技能樹
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
                          {skill.name}
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
              連續練習 {stats.currentStreak} 天！
            </h2>
            <p className="text-muted-foreground mb-4">
              你的最長連續練習紀錄是 {stats.longestStreak} 天，繼續保持！
            </p>
            
            {/* Week Calendar */}
            <div className="flex justify-center gap-2">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                <div
                  key={day}
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
