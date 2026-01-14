/**
 * Check-In Page
 * Daily check-in with streak bonuses and calendar view
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flame, Gift, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import Navigation from '@/components/Navigation';
import { getLoginUrl } from '@/const';

export default function CheckIn() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Fetch check-in status
  const { data: status, refetch: refetchStatus } = trpc.checkIn.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch check-in stats
  const { data: stats, refetch: refetchStats } = trpc.checkIn.stats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch check-in history
  const { data: history } = trpc.checkIn.history.useQuery(
    { days: 30 },
    { enabled: isAuthenticated }
  );

  // Check-in mutation
  const checkInMutation = trpc.checkIn.perform.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setEarnedXp(data.xpEarned);
        setShowCelebration(true);
        refetchStatus();
        refetchStats();
        setTimeout(() => setShowCelebration(false), 3000);
      }
    },
  });

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ day: null, isCheckedIn: false });
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isCheckedIn = history?.some(h => h.date === dateStr) || false;
      const isToday = day === now.getDate();
      days.push({ day, isCheckedIn, isToday, dateStr });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = language === 'zh' 
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate streak bonus preview
  const getStreakBonus = (streak: number) => {
    const baseXp = 10;
    const bonus = Math.min(streak, 10) * 5;
    return baseXp + bonus;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-20 pt-16 lg:pt-0">
          <div className="container py-12">
            <div className="max-w-md mx-auto text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h1 className="font-display text-2xl font-bold mb-4">
                {language === 'zh' ? '每日簽到' : 'Daily Check-In'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'zh' 
                  ? '登入後即可開始每日簽到，獲得經驗值獎勵！' 
                  : 'Log in to start daily check-ins and earn XP rewards!'}
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>
                  {language === 'zh' ? '立即登入' : 'Log In Now'}
                </a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-0">
        <div className="container py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"
            >
              <Flame className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-primary mb-2">
              {language === 'zh' ? '每日簽到' : 'Daily Check-In'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'zh' 
                ? '連續簽到獲得更多經驗值加成！' 
                : 'Consecutive check-ins earn bonus XP!'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
            <Card className="magic-card">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-primary">
                  {status?.currentStreak || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'zh' ? '當前連續' : 'Current Streak'}
                </div>
              </CardContent>
            </Card>

            <Card className="magic-card">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-primary">
                  {stats?.longestStreak || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'zh' ? '最長連續' : 'Longest Streak'}
                </div>
              </CardContent>
            </Card>

            <Card className="magic-card">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalCheckIns || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'zh' ? '總簽到天數' : 'Total Check-Ins'}
                </div>
              </CardContent>
            </Card>

            <Card className="magic-card">
              <CardContent className="p-4 text-center">
                <Gift className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalXpFromCheckIns || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'zh' ? '累計獲得 XP' : 'Total XP Earned'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Check-in Button */}
          <div className="max-w-md mx-auto mb-8">
            <Card className="magic-card overflow-hidden">
              <CardContent className="p-6 text-center">
                {status?.checkedInToday ? (
                  <div>
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-bold text-green-500 mb-2">
                      {language === 'zh' ? '今日已簽到！' : 'Checked In Today!'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'zh' 
                        ? '明天再來繼續保持連續簽到吧！' 
                        : 'Come back tomorrow to keep your streak!'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        {language === 'zh' ? '今日可獲得' : 'Today\'s Reward'}
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        +{getStreakBonus((status?.currentStreak || 0) + 1)} XP
                      </div>
                      {(status?.currentStreak || 0) > 0 && (
                        <div className="text-sm text-orange-500">
                          {language === 'zh' 
                            ? `包含 ${Math.min((status?.currentStreak || 0) + 1, 10) * 5} 連續加成` 
                            : `Includes ${Math.min((status?.currentStreak || 0) + 1, 10) * 5} streak bonus`}
                        </div>
                      )}
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
                      onClick={() => checkInMutation.mutate()}
                      disabled={checkInMutation.isPending}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {checkInMutation.isPending 
                        ? (language === 'zh' ? '簽到中...' : 'Checking in...')
                        : (language === 'zh' ? '立即簽到' : 'Check In Now')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Streak Bonus Info */}
          <div className="max-w-md mx-auto mb-8">
            <Card className="magic-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  {language === 'zh' ? '連續簽到獎勵' : 'Streak Bonuses'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[1, 3, 5, 7, 10].map((day) => (
                    <div 
                      key={day} 
                      className={`flex justify-between items-center p-2 rounded ${
                        (status?.currentStreak || 0) >= day 
                          ? 'bg-primary/20 text-primary' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span>
                        {language === 'zh' ? `${day} 天連續` : `${day} Day Streak`}
                      </span>
                      <span className="font-bold">
                        +{getStreakBonus(day)} XP
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="max-w-md mx-auto">
            <Card className="magic-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {language === 'zh' 
                    ? `${new Date().getFullYear()}年${new Date().getMonth() + 1}月` 
                    : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {/* Week day headers */}
                  {weekDays.map((day) => (
                    <div 
                      key={day} 
                      className="text-center text-xs text-muted-foreground py-2 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((item, index) => (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                        item.day === null
                          ? ''
                          : item.isCheckedIn
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold'
                          : item.isToday
                          ? 'border-2 border-primary text-primary font-bold'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {item.day}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 text-center text-white shadow-2xl"
            >
              <Sparkles className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">
                {language === 'zh' ? '簽到成功！' : 'Check-In Success!'}
              </h2>
              <p className="text-xl">
                +{earnedXp} XP
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
