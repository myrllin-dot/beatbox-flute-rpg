/**
 * Instructor Booking Management Page
 * Allows instructors to manage their booking slots and appointments
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Plus, Trash2, Video, User,
  CheckCircle2, XCircle, AlertCircle, Edit2,
  CalendarDays, MessageSquare, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

export default function InstructorBooking() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 30,
    price: 0,
    meetingLink: '',
    notes: '',
  });

  const { data: mySlots = [], refetch: refetchSlots } = trpc.booking.mySlots.useQuery();
  const { data: appointments = [], refetch: refetchAppointments } = trpc.booking.instructorAppointments.useQuery();

  const createSlotMutation = trpc.booking.createSlot.useMutation({
    onSuccess: () => {
      toast.success(language === 'zh' ? '時段已創建！' : 'Slot created!');
      setShowCreateDialog(false);
      setNewSlot({
        date: '',
        startTime: '',
        endTime: '',
        duration: 30,
        price: 0,
        meetingLink: '',
        notes: '',
      });
      refetchSlots();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteSlotMutation = trpc.booking.deleteSlot.useMutation({
    onSuccess: () => {
      toast.success(language === 'zh' ? '時段已刪除！' : 'Slot deleted!');
      refetchSlots();
    },
  });

  const updateStatusMutation = trpc.booking.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(language === 'zh' ? '狀態已更新！' : 'Status updated!');
      refetchAppointments();
      refetchSlots();
    },
  });

  const handleCreateSlot = () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error(language === 'zh' ? '請填寫日期和時間' : 'Please fill in date and time');
      return;
    }

    const startDateTime = `${newSlot.date}T${newSlot.startTime}:00`;
    const endDateTime = `${newSlot.date}T${newSlot.endTime}:00`;

    createSlotMutation.mutate({
      startTime: startDateTime,
      endTime: endDateTime,
      duration: newSlot.duration,
      price: newSlot.price * 100, // Convert to cents
      meetingLink: newSlot.meetingLink || undefined,
      notes: newSlot.notes || undefined,
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

  const locale = language === 'zh' ? zhTW : enUS;

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const completedAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-0">
        <div className="container py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-gold mb-2">
                {language === 'zh' ? '預約管理' : 'Booking Management'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'zh' 
                  ? '管理您的可預約時段和學生預約' 
                  : 'Manage your available slots and student appointments'}
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '新增時段' : 'Add Slot'}
            </Button>
          </motion.div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="bg-background/50 border border-border">
              <TabsTrigger value="appointments" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                {language === 'zh' ? '預約請求' : 'Appointments'}
                {pendingAppointments.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{pendingAppointments.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="slots" className="gap-2">
                <Calendar className="w-4 h-4" />
                {language === 'zh' ? '時段管理' : 'Slots'}
              </TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              {/* Pending Appointments */}
              {pendingAppointments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    {language === 'zh' ? '待確認' : 'Pending'} ({pendingAppointments.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingAppointments.map((apt) => (
                      <Card key={apt.id} className="magic-card border-yellow-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">{apt.studentName || 'Student'}</div>
                                  <div className="text-sm text-muted-foreground">{apt.studentEmail}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {apt.startTime && format(new Date(apt.startTime), 'yyyy/MM/dd EEE', { locale })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {apt.startTime && format(new Date(apt.startTime), 'HH:mm')} - {apt.endTime && format(new Date(apt.endTime), 'HH:mm')}
                                </span>
                              </div>
                              {apt.topic && (
                                <div className="text-sm mb-2">
                                  <span className="text-muted-foreground">{language === 'zh' ? '主題：' : 'Topic: '}</span>
                                  <span className="text-foreground">{apt.topic}</span>
                                </div>
                              )}
                              {apt.studentNotes && (
                                <div className="p-2 rounded bg-background/50 text-sm text-muted-foreground">
                                  {apt.studentNotes}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                                onClick={() => updateStatusMutation.mutate({ 
                                  appointmentId: apt.id, 
                                  status: 'cancelled' 
                                })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                {language === 'zh' ? '拒絕' : 'Decline'}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateStatusMutation.mutate({ 
                                  appointmentId: apt.id, 
                                  status: 'confirmed' 
                                })}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                {language === 'zh' ? '確認' : 'Confirm'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Confirmed Appointments */}
              {confirmedAppointments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    {language === 'zh' ? '即將進行' : 'Upcoming'} ({confirmedAppointments.length})
                  </h2>
                  <div className="space-y-4">
                    {confirmedAppointments.map((apt) => (
                      <Card key={apt.id} className="magic-card border-green-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">{apt.studentName || 'Student'}</div>
                                  <div className="text-sm text-muted-foreground">{apt.studentEmail}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {apt.startTime && format(new Date(apt.startTime), 'yyyy/MM/dd EEE', { locale })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {apt.startTime && format(new Date(apt.startTime), 'HH:mm')} - {apt.endTime && format(new Date(apt.endTime), 'HH:mm')}
                                </span>
                              </div>
                              {apt.topic && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">{language === 'zh' ? '主題：' : 'Topic: '}</span>
                                  <span className="text-foreground">{apt.topic}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ 
                                  appointmentId: apt.id, 
                                  status: 'completed' 
                                })}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                {language === 'zh' ? '標記完成' : 'Mark Complete'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Completed Appointments */}
              {completedAppointments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                    {language === 'zh' ? '歷史記錄' : 'History'} ({completedAppointments.length})
                  </h2>
                  <div className="space-y-4">
                    {completedAppointments.slice(0, 10).map((apt) => (
                      <Card key={apt.id} className="magic-card opacity-70">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{apt.studentName || 'Student'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {apt.startTime && format(new Date(apt.startTime), 'yyyy/MM/dd HH:mm', { locale })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {apt.rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(apt.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                                  ))}
                                </div>
                              )}
                              {getStatusBadge(apt.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {appointments.length === 0 && (
                <Card className="magic-card">
                  <CardContent className="p-8 text-center">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {language === 'zh' ? '還沒有預約請求' : 'No Appointments Yet'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'zh' 
                        ? '當學生預約您的時段時，會在這裡顯示' 
                        : 'When students book your slots, they will appear here'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Slots Tab */}
            <TabsContent value="slots">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {mySlots.length === 0 ? (
                  <Card className="magic-card">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {language === 'zh' ? '還沒有開放時段' : 'No Slots Created'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {language === 'zh' 
                          ? '創建可預約時段讓學生可以預約一對一課程' 
                          : 'Create available slots so students can book sessions with you'}
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {language === 'zh' ? '創建第一個時段' : 'Create First Slot'}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mySlots.map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`magic-card ${slot.isAvailable ? '' : 'opacity-60'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant={slot.isAvailable ? 'default' : 'secondary'}>
                                {slot.isAvailable 
                                  ? (language === 'zh' ? '可預約' : 'Available')
                                  : (language === 'zh' ? '已預約' : 'Booked')}
                              </Badge>
                              {slot.isAvailable && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  onClick={() => deleteSlotMutation.mutate({ slotId: slot.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-foreground">
                                {format(new Date(slot.startTime), 'yyyy/MM/dd EEE', { locale })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{slot.duration} {language === 'zh' ? '分鐘' : 'min'}</span>
                              {slot.price > 0 && <span>${slot.price / 100}</span>}
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
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Slot Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="magic-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {language === 'zh' ? '新增可預約時段' : 'Add Available Slot'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {language === 'zh' ? '日期' : 'Date'} *
              </label>
              <Input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'zh' ? '開始時間' : 'Start Time'} *
                </label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'zh' ? '結束時間' : 'End Time'} *
                </label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'zh' ? '時長（分鐘）' : 'Duration (min)'}
                </label>
                <Input
                  type="number"
                  value={newSlot.duration}
                  onChange={(e) => setNewSlot({ ...newSlot, duration: parseInt(e.target.value) || 30 })}
                  className="bg-background/50"
                  min={15}
                  max={120}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'zh' ? '價格（$）' : 'Price ($)'}
                </label>
                <Input
                  type="number"
                  value={newSlot.price}
                  onChange={(e) => setNewSlot({ ...newSlot, price: parseInt(e.target.value) || 0 })}
                  className="bg-background/50"
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {language === 'zh' ? '會議連結（選填）' : 'Meeting Link (optional)'}
              </label>
              <Input
                value={newSlot.meetingLink}
                onChange={(e) => setNewSlot({ ...newSlot, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {language === 'zh' ? '備註（選填）' : 'Notes (optional)'}
              </label>
              <Textarea
                value={newSlot.notes}
                onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
                placeholder={language === 'zh' ? '例如：適合初學者' : 'e.g., Suitable for beginners'}
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateSlot} disabled={createSlotMutation.isPending}>
              {createSlotMutation.isPending 
                ? (language === 'zh' ? '創建中...' : 'Creating...') 
                : (language === 'zh' ? '創建時段' : 'Create Slot')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
