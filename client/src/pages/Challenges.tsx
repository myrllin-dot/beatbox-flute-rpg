/**
 * Challenges Page
 * Design: Arcane Academy - Limited-time learning challenges
 * Features: Active challenges, participation, progress tracking, leaderboard
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Target, Clock, Users, Star, ChevronRight, 
  Flame, CheckCircle2, Award, Zap, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { getLoginUrl } from '@/const';

const CHALLENGE_TYPE_ICONS: Record<string, React.ElementType> = {
  quest_count: Target,
  streak: Flame,
  xp_gain: Zap,
  video_submit: Award,
};

const CHALLENGE_TYPE_LABELS = {
  quest_count: { zh: '完成任務', en: 'Complete Quests' },
  streak: { zh: '連續簽到', en: 'Streak Days' },
  xp_gain: { zh: '獲得經驗值', en: 'Earn XP' },
  video_submit: { zh: '提交影片', en: 'Submit Videos' },
};

export default function Challenges() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);

  const { data: activeChallenges, isLoading: loadingActive } = trpc.challenges.active.useQuery();
  const { data: myChallenges, isLoading: loadingMy, refetch: refetchMy } = trpc.challenges.myChallenges.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const joinMutation = trpc.challenges.join.useMutation({
    onSuccess: (result) => {
      if (result.alreadyJoined) {
        toast.info(language === 'zh' ? '你已經參加了這個挑戰' : 'You already joined this challenge');
      } else {
        toast.success(language === 'zh' ? '成功加入挑戰！' : 'Successfully joined the challenge!');
        refetchMy();
      }
    },
    onError: () => {
      toast.error(language === 'zh' ? '加入失敗，請重試' : 'Failed to join, please try again');
    },
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const isJoined = (challengeId: number) => {
    return myChallenges?.some(c => c.challengeId === challengeId);
  };

  const getParticipation = (challengeId: number) => {
    return myChallenges?.find(c => c.challengeId === challengeId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-8 pb-20">
        <div className="container max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
              {language === 'zh' ? '學習挑戰' : 'Learning Challenges'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'zh' 
                ? '參加限時挑戰，獲得特殊獎勵和徽章！' 
                : 'Join time-limited challenges to earn special rewards and badges!'}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="active" className="font-medium">
                <Target className="w-4 h-4 mr-2" />
                {language === 'zh' ? '進行中' : 'Active'}
              </TabsTrigger>
              <TabsTrigger value="my" className="font-medium">
                <Star className="w-4 h-4 mr-2" />
                {language === 'zh' ? '我的挑戰' : 'My Challenges'}
              </TabsTrigger>
            </TabsList>

            {/* Active Challenges */}
            <TabsContent value="active" className="mt-6">
              {loadingActive ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : activeChallenges && activeChallenges.length > 0 ? (
                <div className="space-y-4">
                  {activeChallenges.map((challenge, index) => {
                    const Icon = CHALLENGE_TYPE_ICONS[challenge.challengeType] || Target;
                    const daysRemaining = getDaysRemaining(challenge.endDate);
                    const joined = isJoined(challenge.id);
                    const participation = getParticipation(challenge.id);
                    const progress = participation 
                      ? Math.min(100, (participation.currentProgress / challenge.targetValue) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="magic-card p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            daysRemaining <= 3 ? 'bg-red-500/20' : 'bg-primary/20'
                          }`}>
                            <Icon className={`w-7 h-7 ${daysRemaining <= 3 ? 'text-red-500' : 'text-primary'}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-display text-lg font-semibold text-foreground">
                                {language === 'zh' ? challenge.titleZh : challenge.titleEn}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {daysRemaining} {language === 'zh' ? '天' : 'days'}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {language === 'zh' ? challenge.descriptionZh : challenge.descriptionEn}
                            </p>

                            {/* Challenge Details */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <div className="flex items-center gap-1 text-sm">
                                <Target className="w-4 h-4 text-accent" />
                                <span className="text-muted-foreground">
                                  {language === 'zh' ? '目標：' : 'Goal: '}
                                  <span className="text-foreground font-medium">
                                    {challenge.targetValue} {CHALLENGE_TYPE_LABELS[challenge.challengeType as keyof typeof CHALLENGE_TYPE_LABELS]?.[language] || ''}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">
                                  {language === 'zh' ? '獎勵：' : 'Reward: '}
                                  <span className="text-primary font-medium">{challenge.xpReward} XP</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                </span>
                              </div>
                            </div>

                            {/* Progress (if joined) */}
                            {joined && participation && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">
                                    {language === 'zh' ? '進度' : 'Progress'}
                                  </span>
                                  <span className="text-foreground font-medium">
                                    {participation.currentProgress} / {challenge.targetValue}
                                  </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            )}

                            {/* Action Button */}
                            {!isAuthenticated ? (
                              <a href={getLoginUrl()}>
                                <Button className="bg-primary hover:bg-primary/90">
                                  {language === 'zh' ? '登入參加' : 'Login to Join'}
                                </Button>
                              </a>
                            ) : joined ? (
                              participation?.isCompleted ? (
                                <div className="flex items-center gap-2 text-green-500">
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span className="font-medium">
                                    {language === 'zh' ? '已完成！' : 'Completed!'}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-primary">
                                  <Star className="w-5 h-5" />
                                  <span className="font-medium">
                                    {language === 'zh' ? '已參加' : 'Joined'}
                                  </span>
                                </div>
                              )
                            ) : (
                              <Button
                                onClick={() => joinMutation.mutate({ challengeId: challenge.id })}
                                disabled={joinMutation.isPending}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {joinMutation.isPending ? (
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                  <>
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                    {language === 'zh' ? '立即參加' : 'Join Now'}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {language === 'zh' ? '目前沒有進行中的挑戰' : 'No Active Challenges'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'zh' ? '敬請期待新的挑戰活動！' : 'Stay tuned for new challenges!'}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* My Challenges */}
            <TabsContent value="my" className="mt-6">
              {!isAuthenticated ? (
                <div className="text-center py-20">
                  <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {language === 'zh' ? '登入查看你的挑戰' : 'Login to View Your Challenges'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {language === 'zh' ? '登入後即可追蹤你的挑戰進度' : 'Login to track your challenge progress'}
                  </p>
                  <a href={getLoginUrl()}>
                    <Button className="bg-primary hover:bg-primary/90">
                      {language === 'zh' ? '立即登入' : 'Login Now'}
                    </Button>
                  </a>
                </div>
              ) : loadingMy ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : myChallenges && myChallenges.length > 0 ? (
                <div className="space-y-4">
                  {myChallenges.map((challenge, index) => {
                    const Icon = CHALLENGE_TYPE_ICONS[challenge.challengeType || 'quest_count'] || Target;
                    const progress = challenge.targetValue 
                      ? Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100)
                      : 0;
                    const isCompleted = challenge.isCompleted === 1;
                    const endDate = challenge.endDate ? new Date(challenge.endDate) : null;
                    const isExpired = endDate ? endDate < new Date() : false;

                    return (
                      <motion.div
                        key={challenge.participantId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`magic-card p-6 ${isCompleted ? 'border-green-500/50' : isExpired ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isCompleted ? 'bg-green-500/20' : 'bg-primary/20'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-7 h-7 text-green-500" />
                            ) : (
                              <Icon className="w-7 h-7 text-primary" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-display text-lg font-semibold text-foreground">
                                {language === 'zh' ? challenge.titleZh : challenge.titleEn}
                              </h3>
                              {isCompleted && (
                                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                                  {language === 'zh' ? '已完成' : 'Completed'}
                                </span>
                              )}
                              {isExpired && !isCompleted && (
                                <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                                  {language === 'zh' ? '已結束' : 'Ended'}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {language === 'zh' ? challenge.descriptionZh : challenge.descriptionEn}
                            </p>

                            {/* Progress */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">
                                  {language === 'zh' ? '進度' : 'Progress'}
                                </span>
                                <span className="text-foreground font-medium">
                                  {challenge.currentProgress} / {challenge.targetValue}
                                </span>
                              </div>
                              <Progress value={progress} className={`h-2 ${isCompleted ? '[&>div]:bg-green-500' : ''}`} />
                            </div>

                            {/* Reward */}
                            <div className="flex items-center gap-1 text-sm">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">
                                {language === 'zh' ? '獎勵：' : 'Reward: '}
                                <span className="text-primary font-medium">{challenge.xpReward} XP</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {language === 'zh' ? '你還沒有參加任何挑戰' : 'You Haven\'t Joined Any Challenges'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {language === 'zh' ? '查看進行中的挑戰並開始參加！' : 'Check out active challenges and start participating!'}
                  </p>
                  <Button onClick={() => setActiveTab('active')} variant="outline">
                    {language === 'zh' ? '查看進行中的挑戰' : 'View Active Challenges'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
