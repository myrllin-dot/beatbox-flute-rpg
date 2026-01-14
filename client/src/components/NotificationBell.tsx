/**
 * Notification Bell Component
 * Shows notification count and dropdown list
 * Features: Unread count badge, notification list, mark as read
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trophy, Star, Video, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

export default function NotificationBell() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  // Fetch unread count
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 30000 }
  );

  // Fetch notifications
  const { data: notifications = [] } = trpc.notifications.list.useQuery(
    { unreadOnly: false },
    { enabled: isAuthenticated && isOpen }
  );

  // Mark as read mutation
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'quest_complete':
        return <Star className="w-5 h-5 text-primary" />;
      case 'video_reviewed':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'zh' ? zhTW : enUS,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl bg-card border border-border shadow-xl z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-bold text-foreground">
                  {language === 'zh' ? '通知' : 'Notifications'}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => markAllReadMutation.mutate()}
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      {language === 'zh' ? '全部已讀' : 'Mark all read'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>{language === 'zh' ? '暫無通知' : 'No notifications'}</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`
                        flex items-start gap-3 p-4 border-b border-border last:border-0
                        hover:bg-secondary/50 transition-colors cursor-pointer
                        ${notification.isRead === 0 ? 'bg-primary/5' : ''}
                      `}
                      onClick={() => {
                        if (notification.isRead === 0) {
                          markReadMutation.mutate({ notificationId: notification.id });
                        }
                      }}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {language === 'zh' ? notification.titleZh : notification.titleEn}
                        </p>
                        {(notification.messageZh || notification.messageEn) && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {language === 'zh' ? notification.messageZh : notification.messageEn}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {notification.isRead === 0 && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
