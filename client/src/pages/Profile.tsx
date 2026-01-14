/**
 * Profile Page
 * Design: Arcane Academy - Player profile and settings
 * Features: Avatar customization, stats overview, settings
 */

import { motion } from 'framer-motion';
import { User, Settings, LogOut, Edit2, Camera, Award, Calendar, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';

export default function Profile() {
  const { t, language, toggleLanguage } = useLanguage();

  const playerData = {
    name: language === 'zh' ? '冒險者' : 'Adventurer',
    email: 'myrllincheng@gmail.com',
    avatar: '/images/wizard-character.png',
    level: 1,
    title: t('level.apprentice'),
    joinDate: '2024-01-10',
    location: t('village.beginner'),
    totalExp: 250,
    badges: 2,
    completedQuests: 2,
    practiceHours: 5.5,
  };

  const recentActivity = [
    { id: 1, type: 'quest', textKey: 'activity.quest1', date: '2024-01-18' },
    { id: 2, type: 'badge', textKey: 'activity.badge1', date: '2024-01-18' },
    { id: 3, type: 'quest', textKey: 'activity.quest2', date: '2024-01-15' },
    { id: 4, type: 'badge', textKey: 'activity.badge2', date: '2024-01-15' },
    { id: 5, type: 'join', textKey: 'activity.join', date: '2024-01-10' },
  ];

  const handleEditProfile = () => {
    toast.info(t('toast.editProfile'));
  };

  const handleLogout = () => {
    toast.info(t('toast.logout'));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-20 lg:pt-8 pb-20">
        <div className="container max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-gold mb-4">
              {t('profile.title')}
            </h1>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="magic-card p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary glow-gold">
                  <img 
                    src={playerData.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={handleEditProfile}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  Lv.{playerData.level}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {playerData.name}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleEditProfile}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-accent font-medium mb-4">{playerData.title}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t('profile.joinedOn')} {playerData.joinDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {playerData.location}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleEditProfile}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('profile.settings')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('profile.logout')}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard label={t('profile.totalExp')} value={playerData.totalExp.toString()} />
            <StatCard label={t('progress.badges')} value={playerData.badges.toString()} />
            <StatCard label={t('progress.quests')} value={playerData.completedQuests.toString()} />
            <StatCard label={t('progress.practiceHours')} value={`${playerData.practiceHours}h`} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="magic-card p-6"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t('profile.recentActivity')}
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0
                      ${activity.type === 'badge' ? 'bg-yellow-500/20 text-yellow-400' :
                        activity.type === 'quest' ? 'bg-green-500/20 text-green-400' :
                        'bg-primary/20 text-primary'}
                    `}>
                      {activity.type === 'badge' ? <Award className="w-4 h-4" /> :
                       activity.type === 'quest' ? <User className="w-4 h-4" /> :
                       <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{t(activity.textKey)}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="magic-card p-6"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                {t('profile.quickSettings')}
              </h3>
              
              <div className="space-y-4">
                {/* Language Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{t('language.switch')}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'zh' ? '中文' : 'English'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleLanguage}
                  >
                    {language === 'zh' ? 'EN' : '中文'}
                  </Button>
                </div>

                {/* Other Settings */}
                <SettingItem 
                  label={t('settings.notifications')} 
                  description={t('settings.notificationsDesc')}
                  onClick={() => toast.info(t('toast.comingSoon'))}
                />
                <SettingItem 
                  label={t('settings.privacy')} 
                  description={t('settings.privacyDesc')}
                  onClick={() => toast.info(t('toast.comingSoon'))}
                />
                <SettingItem 
                  label={t('settings.account')} 
                  description={t('settings.accountDesc')}
                  onClick={() => toast.info(t('toast.comingSoon'))}
                />
              </div>
            </motion.div>
          </div>

          {/* Badges Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="magic-card p-6 mt-8"
          >
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {t('profile.myBadges')}
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {[...Array(playerData.badges)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center"
                >
                  <img 
                    src="/images/badge-black-flute.png"
                    alt="Badge"
                    className="w-14 h-14 object-contain"
                  />
                </motion.div>
              ))}
              
              {/* Placeholder for next badge */}
              <div className="w-20 h-20 rounded-xl bg-muted/30 border border-dashed border-muted flex items-center justify-center">
                <span className="text-2xl text-muted-foreground">?</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="magic-card p-4 text-center">
      <p className="font-display text-2xl font-bold text-primary mb-1">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

interface SettingItemProps {
  label: string;
  description: string;
  onClick: () => void;
}

function SettingItem({ label, description, onClick }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
    >
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Settings className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
