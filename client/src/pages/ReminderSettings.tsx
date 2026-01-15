/**
 * Practice Reminder Settings Page
 * Design: Arcane Academy - Magical reminder configuration
 * Features: Time picker, day selection, enable/disable toggle
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Calendar, Save, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';
import { getLoginUrl } from '@/const';

const DAYS = [
  { value: 0, labelZh: '日', labelEn: 'Sun' },
  { value: 1, labelZh: '一', labelEn: 'Mon' },
  { value: 2, labelZh: '二', labelEn: 'Tue' },
  { value: 3, labelZh: '三', labelEn: 'Wed' },
  { value: 4, labelZh: '四', labelEn: 'Thu' },
  { value: 5, labelZh: '五', labelEn: 'Fri' },
  { value: 6, labelZh: '六', labelEn: 'Sat' },
];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

export default function ReminderSettings() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [enabled, setEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: reminderData, isLoading } = trpc.reminder.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateMutation = trpc.reminder.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'zh' ? '設定已儲存！' : 'Settings saved!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error(language === 'zh' ? '儲存失敗，請重試' : 'Failed to save, please try again');
    },
  });

  useEffect(() => {
    if (reminderData) {
      setEnabled(reminderData.enabled);
      setReminderTime(reminderData.reminderTime);
      setSelectedDays(reminderData.daysOfWeek.split(',').map(Number));
    }
  }, [reminderData]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      enabled,
      reminderTime,
      daysOfWeek: selectedDays.join(','),
      timezoneOffset: new Date().getTimezoneOffset() * -1,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-20 pt-16 lg:pt-0 min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <Bell className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="font-display text-2xl font-bold text-primary mb-4">
              {language === 'zh' ? '練習提醒設定' : 'Practice Reminder Settings'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'zh' ? '登入後即可設定練習提醒' : 'Login to set up practice reminders'}
            </p>
            <a href={getLoginUrl()}>
              <Button className="bg-primary hover:bg-primary/90">
                {language === 'zh' ? '立即登入' : 'Login Now'}
              </Button>
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-8 pb-20">
        <div className="container max-w-2xl px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
                {language === 'zh' ? '練習提醒設定' : 'Practice Reminder Settings'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'zh' ? '設定每日練習提醒時間' : 'Set your daily practice reminder time'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Enable/Disable Toggle */}
              <div className="magic-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {language === 'zh' ? '啟用練習提醒' : 'Enable Practice Reminders'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'zh' ? '每天在指定時間收到練習提醒' : 'Receive daily practice reminders at your chosen time'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => {
                      setEnabled(checked);
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div className={`magic-card p-6 transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {language === 'zh' ? '提醒時間' : 'Reminder Time'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'zh' ? '選擇你希望收到提醒的時間' : 'Choose when you want to be reminded'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setReminderTime(time);
                        setHasChanges(true);
                      }}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        reminderTime === time
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selection */}
              <div className={`magic-card p-6 transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {language === 'zh' ? '提醒日期' : 'Reminder Days'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'zh' ? '選擇要收到提醒的日期' : 'Choose which days to receive reminders'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        selectedDays.includes(day.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {language === 'zh' ? day.labelZh : day.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hasChanges ? 1 : 0.5 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || updateMutation.isPending}
                  className="w-full py-6 text-lg font-display bg-primary hover:bg-primary/90"
                >
                  {updateMutation.isPending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {language === 'zh' ? '儲存設定' : 'Save Settings'}
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Info Card */}
              <div className="magic-card p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    {language === 'zh' 
                      ? '提醒通知會在你設定的時間發送到你的通知中心。記得每天練習，保持連續簽到獲得額外經驗值加成！'
                      : 'Reminders will be sent to your notification center at your chosen time. Remember to practice daily and maintain your streak for bonus XP!'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
