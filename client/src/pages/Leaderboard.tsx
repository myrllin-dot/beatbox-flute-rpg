/**
 * Leaderboard Page
 * Shows student rankings by XP and completed quests
 * Features: Top players list, user's own rank, animated entries
 */

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown,
  User,
  TrendingUp,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import Navigation from '@/components/Navigation';

export default function Leaderboard() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.leaderboard.top.useQuery({ limit: 20 });
  
  // Fetch user's own rank
  const { data: myRank, isLoading: rankLoading } = trpc.progress.myRank.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="font-bold text-lg text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/30';
      default:
        return 'bg-secondary/50 border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-0">
        <div className="container py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 glow-gold">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              {language === 'zh' ? '學習排行榜' : 'Leaderboard'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === 'zh' 
                ? '看看誰是最勤奮的長笛學習者！' 
                : 'See who are the most dedicated flute learners!'}
            </p>
          </motion.div>

          {/* User's Own Rank Card */}
          {isAuthenticated && myRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="magic-card p-6 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'zh' ? '你的排名' : 'Your Rank'}
                    </p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {myRank.rank ? `#${myRank.rank}` : (language === 'zh' ? '尚未上榜' : 'Not ranked')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {language === 'zh' ? '總經驗值' : 'Total XP'}
                  </p>
                  <p className="font-display text-2xl font-bold text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {myRank.totalXp || 0}
                  </p>
                </div>
              </div>
              {myRank.totalUsers > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'zh' 
                      ? `共 ${myRank.totalUsers} 位學習者參與排名` 
                      : `${myRank.totalUsers} learners in the ranking`}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Leaderboard List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {language === 'zh' ? '前 20 名' : 'Top 20'}
              </h2>
            </div>

            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">
                  {language === 'zh' 
                    ? '還沒有人上榜，成為第一個吧！' 
                    : 'No one on the leaderboard yet. Be the first!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user && entry.userId === user.id;

                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border transition-all
                        ${getRankBgClass(rank)}
                        ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                      `}
                    >
                      {/* Rank */}
                      <div className="w-10 h-10 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {entry.userName || (language === 'zh' ? '匿名學習者' : 'Anonymous Learner')}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary">
                              ({language === 'zh' ? '你' : 'You'})
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'zh' 
                            ? `完成 ${entry.completedQuests || 0} 個任務` 
                            : `${entry.completedQuests || 0} quests completed`}
                        </p>
                      </div>

                      {/* XP */}
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="font-bold text-foreground">
                          {entry.totalXp || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">XP</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
