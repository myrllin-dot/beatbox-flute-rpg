/**
 * Booking Page
 * Allows students to book one-on-one sessions with the instructor
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Video, MessageSquare, Star,
  CheckCircle2, XCircle, AlertCircle, User,
  CalendarDays, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { format, isSameDay, addDays, startOfWeek, addWeeks } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

export default function Booking() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');

  const { data: availableSlots = [], refetch: refetchSlots } = trpc.booking.availableSlots.useQuery({});
  const { data: myAppointments = [], refetch: refetchAppointments } = trpc.booking.myAppointments.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const bookMutation = trpc.booking.book.useMutation({
    onSuccess: () => {
      toast.success(language === 'zh' ? '預約成功！' : 'Booking successful!');
      setShowBookingDialog(false);
      setSelectedSlot(null);
      setBookingTopic('');
      setBookingNotes('');
      refetchSlots();
      refetchAppointments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rateMutation = trpc.booking.rate.useMutation({
    onSuccess: () => {
      toast.success(language === 'zh' ? '評價已提交！' : 'Rating submitted!');
      refetchAppointments();
    },
  });

  const handleBook = () => {
    if (!selectedSlot) return;
    bookMutation.mutate({
      slotId: selectedSlot,
      topic: bookingTopic || undefined,
      studentNotes: bookingNotes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        zh: '待確認', 
        en: 'Pending', 
        color: 'bg-yellow-500/20 text-yellow-400',
        icon: AlertCircle 
      },
      confirmed: { 
        zh: '已確認', 
        en: 'Confirmed', 
        color: 'bg-green-500/20 text-green-400',
        icon: CheckCircle2 
      },
      completed: { 
        zh: '已完成', 
        en: 'Completed', 
        color: 'bg-blue-500/20 text-blue-400',
        icon: CheckCircle2 
      },
      cancelled: { 
        zh: '已取消', 
        en: 'Cancelled', 
        color: 'bg-red-500/20 text-red-400',
        icon: XCircle 
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {language === 'zh' ? config.zh : config.en}
      </Badge>
    );
  };

  // Get slots for the current week view
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));
  const locale = language === 'zh' ? zhTW : enUS;

  const getSlotsForDay = (date: Date) => {
    return availableSlots.filter(slot => 
      isSameDay(new Date(slot.startTime), date)
    );
  };

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
              {language === 'zh' ? '一對一預約' : 'Book a Session'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'zh' 
                ? '預約與導師的一對一線上指導課程' 
                : 'Schedule a one-on-one online session with the instructor'}
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6"
          >
            <Button
              variant={activeTab === 'available' ? 'default' : 'outline'}
              onClick={() => setActiveTab('available')}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              {language === 'zh' ? '可預約時段' : 'Available Slots'}
            </Button>
            {isAuthenticated && (
              <Button
                variant={activeTab === 'my' ? 'default' : 'outline'}
                onClick={() => setActiveTab('my')}
                className="gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                {language === 'zh' ? '我的預約' : 'My Appointments'}
                {myAppointments.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{myAppointments.length}</Badge>
                )}
              </Button>
            )}
          </motion.div>

          {activeTab === 'available' && (
            <>
              {/* Week Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="magic-card p-4 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {format(currentWeekStart, 'yyyy年 MMM', { locale })} - {format(addDays(currentWeekStart, 6), 'MMM dd', { locale })}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => {
                    const slots = getSlotsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isPast = day < new Date() && !isToday;

                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-center ${
                          isToday 
                            ? 'bg-primary/20 border border-primary' 
                            : isPast 
                              ? 'bg-muted/30 opacity-50' 
                              : 'bg-background/50 border border-border'
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {format(day, 'EEE', { locale })}
                        </div>
                        <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {format(day, 'd')}
                        </div>
                        {slots.length > 0 && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {slots.length}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Available Slots */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {availableSlots.length === 0 ? (
                  <Card className="magic-card">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {language === 'zh' ? '目前沒有可預約的時段' : 'No Available Slots'}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === 'zh' 
                          ? '導師尚未開放預約時段，請稍後再查看' 
                          : 'The instructor has not opened any slots yet. Please check back later.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSlots.map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <Card className={`magic-card cursor-pointer transition-all ${
                          selectedSlot === slot.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                        }`}
                          onClick={() => {
                            if (isAuthenticated) {
                              setSelectedSlot(slot.id);
                              setShowBookingDialog(true);
                            } else {
                              toast.error(language === 'zh' ? '請先登入' : 'Please login first');
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">
                                {format(new Date(slot.startTime), 'MM/dd EEE', { locale })}
                              </Badge>
                              {slot.price > 0 && (
                                <Badge className="bg-primary/20 text-primary">
                                  ${slot.price / 100}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-foreground">
                                {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Video className="w-4 h-4" />
                              <span>{slot.duration} {language === 'zh' ? '分鐘' : 'min'}</span>
                            </div>
                            {slot.notes && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {slot.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {activeTab === 'my' && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {myAppointments.length === 0 ? (
                <Card className="magic-card">
                  <CardContent className="p-8 text-center">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {language === 'zh' ? '還沒有預約' : 'No Appointments Yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === 'zh' 
                        ? '預約一堂一對一課程，開始您的學習之旅' 
                        : 'Book a one-on-one session to start your learning journey'}
                    </p>
                    <Button onClick={() => setActiveTab('available')}>
                      {language === 'zh' ? '查看可預約時段' : 'View Available Slots'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myAppointments.map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Card className="magic-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">
                                  {apt.startTime && format(new Date(apt.startTime), 'yyyy/MM/dd EEE', { locale })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {apt.startTime && format(new Date(apt.startTime), 'HH:mm')} - {apt.endTime && format(new Date(apt.endTime), 'HH:mm')}
                                </span>
                                <span>({apt.duration} {language === 'zh' ? '分鐘' : 'min'})</span>
                              </div>
                            </div>
                            {getStatusBadge(apt.status)}
                          </div>

                          {apt.topic && (
                            <div className="mb-3">
                              <span className="text-sm text-muted-foreground">
                                {language === 'zh' ? '主題：' : 'Topic: '}
                              </span>
                              <span className="text-foreground">{apt.topic}</span>
                            </div>
                          )}

                          {apt.meetingLink && apt.status === 'confirmed' && (
                            <a
                              href={apt.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:underline mb-3"
                            >
                              <Video className="w-4 h-4" />
                              {language === 'zh' ? '加入會議' : 'Join Meeting'}
                            </a>
                          )}

                          {apt.instructorNotes && (
                            <div className="p-3 rounded-lg bg-primary/10 mb-3">
                              <div className="flex items-center gap-2 text-sm text-primary mb-1">
                                <User className="w-4 h-4" />
                                {language === 'zh' ? '導師備註' : 'Instructor Notes'}
                              </div>
                              <p className="text-foreground text-sm">{apt.instructorNotes}</p>
                            </div>
                          )}

                          {apt.status === 'completed' && !apt.rating && (
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-sm text-muted-foreground">
                                {language === 'zh' ? '評價課程：' : 'Rate this session: '}
                              </span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => rateMutation.mutate({ appointmentId: apt.id, rating: star })}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Star className="w-5 h-5 text-primary hover:fill-primary" />
                                </button>
                              ))}
                            </div>
                          )}

                          {apt.rating && (
                            <div className="flex items-center gap-1 mt-3">
                              <span className="text-sm text-muted-foreground mr-2">
                                {language === 'zh' ? '您的評價：' : 'Your rating: '}
                              </span>
                              {[...Array(apt.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Login Prompt */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 magic-card p-6 text-center"
            >
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {language === 'zh' ? '登入以預約課程' : 'Login to Book'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'zh' 
                  ? '登入後即可預約一對一指導課程' 
                  : 'Login to book one-on-one sessions with the instructor'}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="magic-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {language === 'zh' ? '確認預約' : 'Confirm Booking'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSlot && availableSlots.find(s => s.id === selectedSlot) && (
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold">
                    {format(new Date(availableSlots.find(s => s.id === selectedSlot)!.startTime), 'yyyy/MM/dd EEE HH:mm', { locale })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{availableSlots.find(s => s.id === selectedSlot)!.duration} {language === 'zh' ? '分鐘' : 'minutes'}</span>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {language === 'zh' ? '想討論的主題（選填）' : 'Topic to discuss (optional)'}
              </label>
              <Textarea
                value={bookingTopic}
                onChange={(e) => setBookingTopic(e.target.value)}
                placeholder={language === 'zh' ? '例如：想學習進階的 Beatbox 技巧' : 'e.g., Want to learn advanced Beatbox techniques'}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {language === 'zh' ? '備註或問題（選填）' : 'Notes or questions (optional)'}
              </label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder={language === 'zh' ? '任何想讓導師事先知道的事情' : 'Anything you want the instructor to know beforehand'}
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button onClick={handleBook} disabled={bookMutation.isPending}>
              {bookMutation.isPending 
                ? (language === 'zh' ? '預約中...' : 'Booking...') 
                : (language === 'zh' ? '確認預約' : 'Confirm Booking')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
