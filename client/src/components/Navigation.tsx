/**
 * Navigation Component
 * Design: Arcane Academy - Dark magical theme with gold accents
 * Features: Responsive sidebar navigation with magical glow effects
 */

import { Link, useLocation } from 'wouter';
import { Home, Map, Scroll, TrendingUp, User, Globe, Menu, X, GraduationCap, Trophy, Flame, Users, Target, BookOpen, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/village', icon: Map, labelKey: 'nav.village' },
  { path: '/quests', icon: Scroll, labelKey: 'nav.quests' },
  { path: '/progress', icon: TrendingUp, labelKey: 'nav.progress' },
  { path: '/leaderboard', icon: Trophy, labelKey: 'nav.leaderboard' },
  { path: '/checkin', icon: Flame, labelKey: 'nav.checkin' },
  { path: '/community', icon: Users, labelKey: 'nav.community' },
  { path: '/challenges', icon: Target, labelKey: 'nav.challenges' },
  { path: '/learning-path', icon: BookOpen, labelKey: 'nav.learningPath' },
  { path: '/booking', icon: Calendar, labelKey: 'nav.booking' },
  { path: '/profile', icon: User, labelKey: 'nav.profile' },
];

export default function Navigation() {
  const [location] = useLocation();
  const { t, language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 z-50 bg-sidebar/80 backdrop-blur-xl border-r border-border">
        {/* Logo */}
        <Link href="/" className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-gold">
            <img 
              src="/images/badge-black-flute.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
        </Link>

        {/* Nav Items */}
        <div className="flex flex-col gap-4 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300 group
                    ${isActive 
                      ? 'bg-primary text-primary-foreground glow-gold' 
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-popover text-popover-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    {t(item.labelKey)}
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Instructor Dashboard - Admin Only */}
          {isAdmin && (
            <Link href="/instructor">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative w-12 h-12 rounded-xl flex items-center justify-center
                  transition-all duration-300 group
                  ${location === '/instructor'
                    ? 'bg-primary text-primary-foreground glow-gold' 
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <GraduationCap className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-popover text-popover-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  {language === 'zh' ? '導師後台' : 'Instructor Dashboard'}
                </div>
                
                {/* Active indicator */}
                {location === '/instructor' && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"
                  />
                )}
              </motion.div>
            </Link>
          )}
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="w-12 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <Globe className="w-5 h-5" />
        </Button>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <img 
                src="/images/badge-black-flute.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-display text-lg font-semibold text-primary">
              {t('home.title')}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground"
            >
              <Globe className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Instructor Dashboard - Admin Only */}
              {isAdmin && (
                <Link 
                  href="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${location === '/instructor'
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-secondary text-foreground'
                      }
                    `}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">{language === 'zh' ? '導師後台' : 'Instructor Dashboard'}</span>
                  </div>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language indicator */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <span className="px-2 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
          {language === 'zh' ? '中文' : 'EN'}
        </span>
      </div>
    </>
  );
}
