/**
 * Quest Detail Page
 * Design: Arcane Academy - Immersive quest experience with video player
 * Features: Video tutorial, step-by-step guide, progress tracking, metronome, recorder
 */

import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, Clock, Music, Target, Award, Upload, MessageCircle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Metronome from '@/components/Metronome';
import AudioRecorder from '@/components/AudioRecorder';
import CommentSection from '@/components/CommentSection';
import VideoSubmission from '@/components/VideoSubmission';
import AchievementCelebration from '@/components/AchievementCelebration';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface QuestStep {
  id: number;
  titleKey: string;
  descKey: string;
  completed: boolean;
}

interface QuestData {
  titleKey: string;
  descKey: string;
  videoUrl: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: QuestStep[];
  tipKeys: string[];
  showMetronome?: boolean;
}

// Quest data with translation keys
const questData: Record<string, QuestData> = {
  '1-1': {
    titleKey: 'quest.1-1.title',
    descKey: 'quest.1-1.description',
    videoUrl: 'https://www.youtube.com/embed/SsEbqkEE92A',
    duration: 15,
    difficulty: 'easy',
    steps: [
      { id: 1, titleKey: 'quest.1-1.step1', descKey: 'quest.1-1.step1.desc', completed: true },
      { id: 2, titleKey: 'quest.1-1.step2', descKey: 'quest.1-1.step2.desc', completed: true },
      { id: 3, titleKey: 'quest.1-1.step3', descKey: 'quest.1-1.step3.desc', completed: false },
      { id: 4, titleKey: 'quest.1-1.step4', descKey: 'quest.1-1.step4.desc', completed: false },
    ],
    tipKeys: ['quest.1-1.tip1', 'quest.1-1.tip2', 'quest.1-1.tip3', 'quest.1-1.tip4'],
  },
  '1-2': {
    titleKey: 'quest.1-2.title',
    descKey: 'quest.1-2.description',
    videoUrl: 'https://www.youtube.com/embed/jfluG7Xj3KI',
    duration: 20,
    difficulty: 'easy',
    steps: [
      { id: 1, titleKey: 'quest.1-2.step1', descKey: 'quest.1-2.step1.desc', completed: true },
      { id: 2, titleKey: 'quest.1-2.step2', descKey: 'quest.1-2.step2.desc', completed: true },
      { id: 3, titleKey: 'quest.1-2.step3', descKey: 'quest.1-2.step3.desc', completed: false },
      { id: 4, titleKey: 'quest.1-2.step4', descKey: 'quest.1-2.step4.desc', completed: false },
    ],
    tipKeys: ['quest.1-2.tip1', 'quest.1-2.tip2', 'quest.1-2.tip3'],
  },
  '1-3': {
    titleKey: 'quest.1-3.title',
    descKey: 'quest.1-3.description',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: 25,
    difficulty: 'medium',
    steps: [
      { id: 1, titleKey: 'quest.1-3.step1', descKey: 'quest.1-3.step1.desc', completed: false },
      { id: 2, titleKey: 'quest.1-3.step2', descKey: 'quest.1-3.step2.desc', completed: false },
      { id: 3, titleKey: 'quest.1-3.step3', descKey: 'quest.1-3.step3.desc', completed: false },
      { id: 4, titleKey: 'quest.1-3.step4', descKey: 'quest.1-3.step4.desc', completed: false },
    ],
    tipKeys: ['quest.1-3.tip1', 'quest.1-3.tip2', 'quest.1-3.tip3'],
    showMetronome: true,
  },
};

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const questId = id || '1-1';
  const quest = questData[questId];
  const [steps, setSteps] = useState<QuestStep[]>(quest?.steps || []);
  const [activeTab, setActiveTab] = useState<string>('video');
  const [videoWatched, setVideoWatched] = useState(false);
  const [celebration, setCelebration] = useState<{
    type: 'achievement' | 'quest_complete' | 'level_up';
    titleZh: string;
    titleEn: string;
    messageZh?: string;
    messageEn?: string;
    xpEarned?: number;
  } | null>(null);

  const utils = trpc.useUtils();
  const updateProgressMutation = trpc.progress.update.useMutation({
    onSuccess: () => {
      utils.progress.myProgress.invalidate();
      utils.progress.myRank.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
  
  if (!quest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-foreground mb-4">{t('quest.notFound')}</h1>
          <Link href="/quests">
            <Button>{t('quest.backToList')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const toggleStep = (stepId: number) => {
    const newSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    setSteps(newSteps);
    
    const newCompletedSteps = newSteps.filter(s => s.completed).length;
    const newProgress = (newCompletedSteps / newSteps.length) * 100;
    const isCompleted = newProgress === 100;
    const xpEarned = isCompleted ? 50 : 0;

    // Update progress in database if authenticated
    if (isAuthenticated) {
      updateProgressMutation.mutate({
        questId,
        progress: Math.round(newProgress),
        completed: isCompleted,
        xpEarned: isCompleted ? 50 : undefined,
      });

      // Show celebration if quest completed
      if (isCompleted && newCompletedSteps > steps.filter(s => s.completed).length) {
        setCelebration({
          type: 'quest_complete',
          titleZh: '任務完成！',
          titleEn: 'Quest Completed!',
          messageZh: `恭喜你完成了「${t(quest.titleKey)}」任務！`,
          messageEn: `Congratulations on completing "${t(quest.titleKey)}"!`,
          xpEarned: 50,
        });
      }
    }
    
    toast.success(language === 'zh' ? '進度已更新！' : 'Progress updated!');
  };

  const handleUpload = () => {
    toast.info(language === 'zh' ? '影片上傳功能即將推出！' : 'Video upload coming soon!');
  };

  const getDifficultyText = (diff: string) => {
    return t(`difficulty.${diff}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-20 lg:pt-8 pb-20">
        <div className="container max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/quests">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('action.back')}
              </Button>
            </Link>
          </motion.div>

          {/* Quest Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="magic-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Quest Icon */}
              <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Target className="w-10 h-10 text-primary" />
              </div>

              {/* Quest Info */}
              <div className="flex-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {t(quest.titleKey)}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {t(quest.descKey)}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {quest.duration}{t('misc.minutes')}
                  </span>
                  <span className="flex items-center gap-1 text-accent">
                    <Music className="w-4 h-4" />
                    {getDifficultyText(quest.difficulty)}
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <Award className="w-4 h-4" />
                    {t('quest.earnExp')}
                  </span>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="text-center shrink-0">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${progress * 2.2} 220`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedSteps}/{steps.length} {t('misc.step')}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Content Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-4">
                    <TabsTrigger value="video" className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      {t('quest.video')}
                    </TabsTrigger>
                    <TabsTrigger value="metronome" className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      {t('tools.metronome')}
                    </TabsTrigger>
                    <TabsTrigger value="recorder" className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      {t('tools.recorder')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="mt-0">
                    <div className="magic-card overflow-hidden">
                      <div className="aspect-video bg-black relative">
                        <iframe
                          src={quest.videoUrl}
                          title={t(quest.titleKey)}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
  <span className="text-sm text-muted-foreground flex items-center gap-2">
    <Play className="w-4 h-4" />
    {t('quest.video')}
  </span>
  {videoWatched ? (
    <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
      <CheckCircle className="w-4 h-4" />
      {language === 'zh' ? '已觀看完畢' : 'Watched'}
    </span>
  ) : (
    <Button
      variant="outline"
      size="sm"
      className="border-primary text-primary hover:bg-primary hover:text-black"
      onClick={() => {
        setVideoWatched(true);
        const firstUncompleted = steps.find(s => !s.completed);
        if (firstUncompleted) toggleStep(firstUncompleted.id);
        toast.success(language === 'zh' ? '✅ 教學影片已完成！' : '✅ Tutorial watched!');
      }}
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      {language === 'zh' ? '我看完了' : 'Mark as watched'}
    </Button>
  )}
</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metronome" className="mt-0">
                    <Metronome defaultBpm={80} />
                  </TabsContent>

                  <TabsContent value="recorder" className="mt-0">
                    <AudioRecorder />
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="magic-card p-6"
              >
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t('quest.steps')}
                </h2>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => toggleStep(step.id)}
                      className={`
                        flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all
                        ${step.completed 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-secondary/50 hover:bg-secondary'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                        ${step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-semibold">{step.id}</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${step.completed ? 'text-green-400' : 'text-foreground'}`}>
                          {t(step.titleKey)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(step.descKey)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{t('quest.totalProgress')}</span>
                    <span className="text-primary font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="magic-card p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-accent" />
                  {t('quest.tips')}
                </h2>
                <ul className="space-y-3">
                  {quest.tipKeys.map((tipKey, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {t(tipKey)}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="magic-card p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  {t('quest.uploadSection')}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('quest.uploadDescription')}
                </p>
                <Button onClick={handleUpload} className="w-full bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  {t('action.upload')}
                </Button>
              </motion.div>

              {/* Comment Section */}
              {/* Video Submission */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <VideoSubmission questId={questId} />
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2"
              >
                <CommentSection questId={questId} />
              </motion.div>

              {/* Complete Button */}
              {progress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="magic-card p-6 text-center glow-gold"
                >
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {t('quest.congratulations')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('quest.allStepsComplete')}
                  </p>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent">
                    {t('quest.submit')}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Achievement Celebration Modal */}
      <AchievementCelebration
        celebration={celebration}
        onClose={() => setCelebration(null)}
      />
    </div>
  );
}
