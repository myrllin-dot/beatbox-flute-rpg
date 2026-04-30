/**
 * Quest Detail Page
 * 整合新的 quest 資料結構，支援免費版/正式版
 * 包含：影片、步驟、留言（正式版）、YouTube 分享（正式版）
 */

import { Link, useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Play, CheckCircle, Clock, Target, Award,
  MessageCircle, Wrench, Music, Lock, ExternalLink, Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Metronome from '@/components/Metronome';
import AudioRecorder from '@/components/AudioRecorder';
import CommentSection from '@/components/CommentSection';
import AchievementCelebration from '@/components/AchievementCelebration';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getQuestById, DIFFICULTY_CONFIG } from '@/data/quests';

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const zh = language === 'zh';
  const questId = id || '1-1';
  const quest = getQuestById(questId);

  const { data: me } = trpc.auth.me.useQuery();
  const userTier: 'free' | 'pro' = (me as any)?.tier === 'pro' ? 'pro' : 'free';
  const canInteract = userTier === 'pro';

  const [steps, setSteps] = useState(
    quest?.steps.map(s => ({ ...s, completed: false })) || []
  );
  const [activeTab, setActiveTab] = useState<string>('video');
  const [videoWatched, setVideoWatched] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [celebration, setCelebration] = useState<{
    type: 'achievement' | 'quest_complete' | 'level_up';
    titleZh: string; titleEn: string;
    messageZh?: string; messageEn?: string;
    xpEarned?: number;
  } | null>(null);

  const utils = trpc.useUtils();

  const { data: savedProgress } = trpc.progress.getQuestProgress.useQuery(
    { questId },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (savedProgress && !progressLoaded && quest) {
      const savedStepIds: number[] = savedProgress.completedStepIds ?? [];
      setSteps(quest.steps.map(s => ({ ...s, completed: savedStepIds.includes(s.id) })));
      if (savedProgress.videoWatched) setVideoWatched(true);
      setProgressLoaded(true);
    }
  }, [savedProgress, progressLoaded, quest]);

  const updateProgressMutation = trpc.progress.update.useMutation({
    onSuccess: () => {
      utils.progress.myProgress.invalidate();
      utils.progress.myRank.invalidate();
      utils.progress.getQuestProgress.invalidate({ questId });
      utils.notifications.unreadCount.invalidate();
    },
  });

  if (!quest) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">😕</p>
          <h1 className="text-xl text-white mb-4">{zh ? '找不到任務' : 'Quest not found'}</h1>
          <Link href="/quests"><Button>{zh ? '回到任務地圖' : 'Back to Quest Map'}</Button></Link>
        </div>
      </div>
    );
  }

  // 正式版任務需要 pro 才能進入
  if (quest.tier === 'pro' && userTier === 'free') {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <main className="lg:ml-20 pt-20 lg:pt-8 pb-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto px-4 text-center"
          >
            <Lock className="w-16 h-16 text-yellow-500/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {zh ? '正式版限定內容' : 'Pro Exclusive Content'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {zh
                ? '此任務需要正式版序號解鎖。購買課程後輸入序號即可開啟全部內容。'
                : 'This quest requires a Pro activation code. Purchase the course and enter your code to unlock all content.'
              }
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                onClick={() => window.open('https://fluteonline.myrflute.com/courses/beatbox-flute-tutorial', '_blank')}
              >
                {zh ? '購買正式版課程' : 'Purchase Pro Course'}
              </Button>
              <Link href="/quests">
                <Button variant="outline" className="w-full border-gray-700 text-gray-300">
                  {zh ? '回到任務地圖' : 'Back to Quest Map'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (quest.comingSoon) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <main className="lg:ml-20 pt-20 lg:pt-8 pb-24 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-white mb-2">
              {zh ? '製作中，敬請期待！' : 'Coming Soon!'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {zh ? '此任務正在製作中，上線後將立即通知你。' : 'This quest is being created. You\'ll be notified when it\'s ready.'}
            </p>
            <Link href="/quests">
              <Button variant="outline" className="border-gray-700 text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {zh ? '回到任務地圖' : 'Back to Quest Map'}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const diff = DIFFICULTY_CONFIG[quest.difficulty];

  const toggleStep = (stepId: number) => {
    const newSteps = steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
    setSteps(newSteps);
    const newCompleted = newSteps.filter(s => s.completed).length;
    const newProgress = steps.length > 0 ? (newCompleted / steps.length) * 100 : 0;
    const isCompleted = newProgress === 100;
    const completedStepIds = newSteps.filter(s => s.completed).map(s => s.id);

    if (isAuthenticated) {
      updateProgressMutation.mutate({
        questId,
        progress: Math.round(newProgress),
        completed: isCompleted,
        xpEarned: isCompleted ? quest.xpReward : undefined,
        completedStepIds,
        videoWatched,
      });
      if (isCompleted && newCompleted > completedSteps) {
        setCelebration({
          type: 'quest_complete',
          titleZh: '任務完成！',
          titleEn: 'Quest Completed!',
          messageZh: `恭喜完成「${quest.titleZh}」！獲得 ${quest.xpReward} XP！`,
          messageEn: `Congrats on completing "${quest.titleEn}"! Earned ${quest.xpReward} XP!`,
          xpEarned: quest.xpReward,
        });
      }
    }
    toast.success(zh ? '進度已更新！' : 'Progress updated!');
  };

  const handleVideoWatched = () => {
    setVideoWatched(true);
    const firstUncompleted = steps.find(s => !s.completed);
    if (firstUncompleted) toggleStep(firstUncompleted.id);
    toast.success(zh ? '✅ 教學影片已完成！' : '✅ Tutorial watched!');
  };

  const handleShareYoutube = () => {
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      toast.error(zh ? '請輸入有效的 YouTube 連結' : 'Please enter a valid YouTube URL');
      return;
    }
    toast.success(zh ? '🎵 影片已分享！' : '🎵 Video shared!');
    setShowYoutubeInput(false);
    setYoutubeUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <main className="lg:ml-20 pt-20 lg:pt-8 pb-24">
        <div className="max-w-4xl mx-auto px-4">

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
            <Link href="/quests">
              <Button variant="ghost" className="text-gray-400 hover:text-white -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {zh ? '任務地圖' : 'Quest Map'}
              </Button>
            </Link>
          </motion.div>

          {/* Quest Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-3xl shrink-0">
                {quest.badgeIcon || '🎵'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">
                  {zh ? quest.titleZh : quest.titleEn}
                </h1>
                <p className="text-gray-400 text-sm mb-3">
                  {zh ? quest.descZh : quest.descEn}
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    {quest.duration}{zh ? ' 分鐘' : ' min'}
                  </span>
                  <span className={`flex items-center gap-1 ${diff.color}`}>
                    <Target className="w-3 h-3" />
                    {zh ? diff.labelZh : diff.labelEn}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Award className="w-3 h-3" />
                    +{quest.xpReward} XP
                  </span>
                </div>
              </div>
              {/* Progress circle */}
              <div className="text-center shrink-0">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-800" />
                    <circle cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="4" fill="none"
                      strokeDasharray={`${progress * 1.445} 144.5`}
                      className="text-yellow-400 transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-yellow-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{completedSteps}/{steps.length}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tabs */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-3 bg-gray-900/60 border border-gray-800 mb-4">
                    <TabsTrigger value="video" className="text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      {zh ? '影片' : 'Video'}
                    </TabsTrigger>
                    <TabsTrigger value="metronome" className="text-xs">
                      <Music className="w-3 h-3 mr-1" />
                      {zh ? '節拍器' : 'Metronome'}
                    </TabsTrigger>
                    <TabsTrigger value="recorder" className="text-xs">
                      <Wrench className="w-3 h-3 mr-1" />
                      {zh ? '錄音' : 'Recorder'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="aspect-video bg-black relative">
                        {quest.videoUrl.includes('coming-soon') ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl mb-3">🎬</div>
                            <p className="text-gray-400 text-sm">{zh ? '影片即將上線' : 'Video coming soon'}</p>
                          </div>
                        ) : (
                          <iframe
                            src={quest.videoUrl}
                            title={zh ? quest.titleZh : quest.titleEn}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {zh ? '教學影片' : 'Tutorial Video'}
                        </span>
                        {videoWatched ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            {zh ? '已看完' : 'Watched'}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-xs h-7 px-3"
                            onClick={handleVideoWatched}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {zh ? '我看完了' : 'Mark watched'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metronome">
                    <Metronome defaultBpm={80} />
                  </TabsContent>

                  <TabsContent value="recorder">
                    <AudioRecorder />
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Steps */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5"
              >
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  {zh ? '任務步驟' : 'Quest Steps'}
                </h2>
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      onClick={() => toggleStep(step.id)}
                      className={`
                        flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all
                        ${step.completed
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                        }
                      `}
                    >
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                        ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}
                      `}>
                        {step.completed ? <CheckCircle className="w-4 h-4" /> : step.id}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${step.completed ? 'text-green-400' : 'text-white'}`}>
                          {zh ? step.titleZh : step.titleEn}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {zh ? step.descZh : step.descEn}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{zh ? '整體進度' : 'Overall Progress'}</span>
                    <span className="text-yellow-400 font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </motion.div>

              {/* Comments - Pro only */}
              {canInteract && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <CommentSection questId={questId} />
                </motion.div>
              )}

              {!canInteract && isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 text-center"
                >
                  <Lock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {zh ? '互動功能僅正式版用戶可使用' : 'Interactive features are for Pro users only'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4"
              >
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-yellow-400" />
                  {zh ? '老師小提示' : 'Teacher Tips'}
                </h3>
                <ul className="space-y-2">
                  {(zh ? quest.tipsZh : quest.tipsEn).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* YouTube Share - Pro only */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4"
              >
                <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
                  <Youtube className="w-4 h-4 text-red-400" />
                  {zh ? '分享你的練習' : 'Share Your Practice'}
                </h3>
                {canInteract ? (
                  showYoutubeInput ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={e => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleShareYoutube} className="flex-1 bg-red-500 hover:bg-red-400 text-white text-xs h-7">
                          {zh ? '分享' : 'Share'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowYoutubeInput(false)} className="flex-1 border-gray-700 text-gray-400 text-xs h-7">
                          {zh ? '取消' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:border-red-500/50 hover:text-red-400 text-xs"
                      onClick={() => setShowYoutubeInput(true)}
                    >
                      <Youtube className="w-3 h-3 mr-2" />
                      {zh ? '貼上 YouTube 連結' : 'Paste YouTube Link'}
                    </Button>
                  )
                ) : (
                  <div className="text-center py-2">
                    <Lock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">{zh ? '正式版功能' : 'Pro feature'}</p>
                  </div>
                )}
              </motion.div>

              {/* Complete badge */}
              {progress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-2xl p-4 text-center"
                >
                  <div className="text-4xl mb-2">{quest.badgeIcon || '🏆'}</div>
                  <h3 className="font-bold text-yellow-400 mb-1 text-sm">
                    {zh ? '任務完成！' : 'Quest Complete!'}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    +{quest.xpReward} XP {zh ? '已獲得' : 'earned'}
                  </p>
                  <Link href="/quests">
                    <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs">
                      {zh ? '繼續下一關' : 'Next Quest'}
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Course link */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4"
              >
                <p className="text-xs text-gray-500 mb-2">
                  {zh ? '想要更深入的學習？' : 'Want to learn more?'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-700 text-gray-300 hover:border-yellow-500/50 hover:text-yellow-400 text-xs"
                  onClick={() => window.open('https://fluteonline.myrflute.com', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  {zh ? '前往線上課程平台' : 'Go to Online Course Platform'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <AchievementCelebration celebration={celebration} onClose={() => setCelebration(null)} />
    </div>
  );
}
