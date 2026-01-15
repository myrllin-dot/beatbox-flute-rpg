/**
 * Learning Path Page
 * Shows personalized skill recommendations based on user progress
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, CheckCircle2, Circle, Lock, Star, 
  TrendingUp, Target, Sparkles, ChevronRight,
  Play, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';

// Define the skill tree structure
const skillTree = [
  {
    village: 'newbie',
    villageZh: '新手村',
    villageEn: 'Newbie Village',
    skills: [
      { id: '1-1', nameZh: '基礎嘴型', nameEn: 'Basic Embouchure', difficulty: 1 },
      { id: '1-2', nameZh: '氣息控制', nameEn: 'Breath Control', difficulty: 1 },
      { id: '1-3', nameZh: '舌頭位置', nameEn: 'Tongue Position', difficulty: 1 },
      { id: '1-4', nameZh: '基礎節奏', nameEn: 'Basic Rhythm', difficulty: 2 },
      { id: '1-5', nameZh: '簡單音階', nameEn: 'Simple Scales', difficulty: 2 },
    ]
  },
  {
    village: 'trial',
    villageZh: '試煉村',
    villageEn: 'Trial Village',
    skills: [
      { id: '2-1', nameZh: 'Kick Drum', nameEn: 'Kick Drum', difficulty: 2 },
      { id: '2-2', nameZh: 'Hi-Hat', nameEn: 'Hi-Hat', difficulty: 2 },
      { id: '2-3', nameZh: 'Snare', nameEn: 'Snare', difficulty: 3 },
      { id: '2-4', nameZh: '基礎組合', nameEn: 'Basic Combo', difficulty: 3 },
      { id: '2-5', nameZh: '節奏變化', nameEn: 'Rhythm Variation', difficulty: 3 },
    ]
  },
  {
    village: 'frontier',
    villageZh: '開拓村',
    villageEn: 'Frontier Village',
    skills: [
      { id: '3-1', nameZh: '進階技巧', nameEn: 'Advanced Techniques', difficulty: 4 },
      { id: '3-2', nameZh: '即興演奏', nameEn: 'Improvisation', difficulty: 4 },
      { id: '3-3', nameZh: '風格融合', nameEn: 'Style Fusion', difficulty: 4 },
      { id: '3-4', nameZh: '表演技巧', nameEn: 'Performance Skills', difficulty: 5 },
      { id: '3-5', nameZh: '創作能力', nameEn: 'Composition', difficulty: 5 },
    ]
  },
  {
    village: 'domain',
    villageZh: '領域展開',
    villageEn: 'Domain Expansion',
    skills: [
      { id: '4-1', nameZh: '大師級技巧', nameEn: 'Master Techniques', difficulty: 5 },
      { id: '4-2', nameZh: '個人風格', nameEn: 'Personal Style', difficulty: 5 },
      { id: '4-3', nameZh: '教學能力', nameEn: 'Teaching Ability', difficulty: 5 },
    ]
  }
];

export default function LearningPath() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);

  const { data: skillProgress = [] } = trpc.learningPath.myProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const getSkillMastery = (skillId: string) => {
    const progress = skillProgress.find(p => p.skillId === skillId);
    return progress?.masteryLevel || 0;
  };

  const getMasteryLabel = (level: number) => {
    const labels = {
      0: { zh: '未開始', en: 'Not Started', color: 'bg-muted text-muted-foreground' },
      1: { zh: '學習中', en: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
      2: { zh: '已完成', en: 'Completed', color: 'bg-green-500/20 text-green-400' },
      3: { zh: '已精通', en: 'Mastered', color: 'bg-primary/20 text-primary' },
    };
    return labels[level as keyof typeof labels] || labels[0];
  };

  const getMasteryIcon = (level: number) => {
    switch (level) {
      case 0: return <Circle className="w-5 h-5 text-muted-foreground" />;
      case 1: return <Play className="w-5 h-5 text-blue-400" />;
      case 2: return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 3: return <Star className="w-5 h-5 text-primary fill-primary" />;
      default: return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const calculateVillageProgress = (skills: typeof skillTree[0]['skills']) => {
    const total = skills.length;
    const completed = skills.filter(s => getSkillMastery(s.id) >= 2).length;
    return Math.round((completed / total) * 100);
  };

  const getRecommendedSkills = () => {
    const recommendations: Array<{
      skill: typeof skillTree[0]['skills'][0];
      village: typeof skillTree[0];
      reason: { zh: string; en: string };
    }> = [];

    for (const village of skillTree) {
      for (const skill of village.skills) {
        const mastery = getSkillMastery(skill.id);
        if (mastery === 0 || mastery === 1) {
          // Find skills that are not started or in progress
          const reason = mastery === 0 
            ? { zh: '建議開始學習', en: 'Recommended to start' }
            : { zh: '繼續練習', en: 'Continue practicing' };
          recommendations.push({ skill, village, reason });
          if (recommendations.length >= 3) break;
        }
      }
      if (recommendations.length >= 3) break;
    }

    return recommendations;
  };

  const recommendations = getRecommendedSkills();

  const totalSkills = skillTree.reduce((acc, v) => acc + v.skills.length, 0);
  const completedSkills = skillTree.reduce((acc, v) => 
    acc + v.skills.filter(s => getSkillMastery(s.id) >= 2).length, 0
  );
  const overallProgress = Math.round((completedSkills / totalSkills) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-0">
        <div className="container py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-gold mb-2">
              {language === 'zh' ? '學習路徑' : 'Learning Path'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'zh' 
                ? '根據您的進度，獲得個人化的學習建議' 
                : 'Get personalized recommendations based on your progress'}
            </p>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="magic-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {language === 'zh' ? '整體進度' : 'Overall Progress'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {completedSkills} / {totalSkills} {language === 'zh' ? '技能已完成' : 'skills completed'}
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </motion.div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {language === 'zh' ? '推薦學習' : 'Recommended for You'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link href={`/quests/${rec.skill.id}`}>
                      <Card className="magic-card cursor-pointer hover:border-primary/50 transition-all group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className="text-xs">
                              {language === 'zh' ? rec.village.villageZh : rec.village.villageEn}
                            </Badge>
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {language === 'zh' ? rec.skill.nameZh : rec.skill.nameEn}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {language === 'zh' ? rec.reason.zh : rec.reason.en}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rec.skill.difficulty ? 'text-primary fill-primary' : 'text-muted'}`} 
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Skill Tree */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {language === 'zh' ? '技能樹' : 'Skill Tree'}
            </h2>
            <div className="space-y-4">
              {skillTree.map((village, vIndex) => {
                const progress = calculateVillageProgress(village.skills);
                const isExpanded = selectedVillage === village.village;

                return (
                  <motion.div
                    key={village.village}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + vIndex * 0.1 }}
                    className="magic-card overflow-hidden"
                  >
                    <button
                      onClick={() => setSelectedVillage(isExpanded ? null : village.village)}
                      className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">{vIndex + 1}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {language === 'zh' ? village.villageZh : village.villageEn}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {village.skills.filter(s => getSkillMastery(s.id) >= 2).length} / {village.skills.length} {language === 'zh' ? '已完成' : 'completed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-primary">{progress}%</span>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {village.skills.map((skill) => {
                            const mastery = getSkillMastery(skill.id);
                            const masteryInfo = getMasteryLabel(mastery);

                            return (
                              <Link key={skill.id} href={`/quests/${skill.id}`}>
                                <div className="p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all cursor-pointer group">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getMasteryIcon(mastery)}
                                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                        {language === 'zh' ? skill.nameZh : skill.nameEn}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Badge className={masteryInfo.color}>
                                      {language === 'zh' ? masteryInfo.zh : masteryInfo.en}
                                    </Badge>
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3 h-3 ${i < skill.difficulty ? 'text-primary/60' : 'text-muted/30'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Login Prompt */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 magic-card p-6 text-center"
            >
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {language === 'zh' ? '登入以追蹤進度' : 'Login to Track Progress'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'zh' 
                  ? '登入後可以保存您的學習進度並獲得個人化推薦' 
                  : 'Login to save your progress and get personalized recommendations'}
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
