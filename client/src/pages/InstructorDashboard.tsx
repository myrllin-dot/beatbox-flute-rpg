/**
 * Instructor Dashboard Page
 * Admin-only page for reviewing student video submissions
 * Features: View submissions, approve/reject, give feedback and scores
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Star,
  MessageSquare,
  User,
  Filter,
  Loader2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { Link } from 'wouter';

export default function InstructorDashboard() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number[]>([80]);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');

  const utils = trpc.useUtils();

  // Fetch all submissions
  const { data: submissions, isLoading } = trpc.submissions.listAll.useQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Review mutation
  const reviewMutation = trpc.submissions.review.useMutation({
    onSuccess: () => {
      utils.submissions.listAll.invalidate();
      setReviewingId(null);
      setFeedback('');
      setScore([80]);
      toast.success(language === 'zh' ? '審核完成！' : 'Review submitted!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitReview = (submissionId: number) => {
    reviewMutation.mutate({
      submissionId,
      status: reviewStatus,
      score: score[0],
      feedback: feedback || undefined,
    });
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'zh' ? zhTW : enUS,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'zh' ? '待審核' : 'Pending'}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {language === 'zh' ? '已通過' : 'Approved'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {language === 'zh' ? '未通過' : 'Rejected'}
          </Badge>
        );
      case 'needs_revision':
        return (
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            {language === 'zh' ? '需修改' : 'Needs Revision'}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-20 pt-16 lg:pt-0">
          <div className="container py-12">
            <div className="max-w-md mx-auto text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                {language === 'zh' ? '導師專區' : 'Instructor Area'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'zh' 
                  ? '此頁面僅限導師使用。如果您是導師，請聯繫管理員獲取權限。' 
                  : 'This page is for instructors only. If you are an instructor, please contact admin for access.'}
              </p>
              <Link href="/">
                <Button>{language === 'zh' ? '返回首頁' : 'Back to Home'}</Button>
              </Link>
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                {language === 'zh' ? '導師審核後台' : 'Instructor Review Dashboard'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {language === 'zh' 
                ? '審核學生提交的練習影片，給予評分和回饋' 
                : 'Review student practice videos, provide scores and feedback'}
            </p>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === 'zh' ? '篩選狀態：' : 'Filter by status:'}
              </span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'zh' ? '全部' : 'All'}</SelectItem>
                <SelectItem value="pending">{language === 'zh' ? '待審核' : 'Pending'}</SelectItem>
                <SelectItem value="approved">{language === 'zh' ? '已通過' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{language === 'zh' ? '未通過' : 'Rejected'}</SelectItem>
                <SelectItem value="needs_revision">{language === 'zh' ? '需修改' : 'Needs Revision'}</SelectItem>
              </SelectContent>
            </Select>
            {submissions && (
              <span className="text-sm text-muted-foreground">
                {language === 'zh' ? `共 ${submissions.length} 個提交` : `${submissions.length} submissions`}
              </span>
            )}
          </motion.div>

          {/* Submissions List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">
                {language === 'zh' ? '沒有找到提交記錄' : 'No submissions found'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {submissions.map((submission, index) => {
                  const isExpanded = expandedSubmission === submission.id;
                  const isReviewing = reviewingId === submission.id;

                  return (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="magic-card overflow-hidden"
                    >
                      {/* Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                        onClick={() => setExpandedSubmission(isExpanded ? null : submission.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                              <User className="w-5 h-5 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">
                                  {submission.userName || (language === 'zh' ? '匿名用戶' : 'Anonymous')}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                  {language === 'zh' ? '任務' : 'Quest'} {submission.questId}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {submission.title || (language === 'zh' ? '練習影片' : 'Practice Video')}
                                {' • '}
                                {formatDate(submission.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(submission.status)}
                            {submission.score !== null && (
                              <Badge variant="outline" className="border-primary/30">
                                <Star className="w-3 h-3 mr-1 text-primary" />
                                {submission.score}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-border space-y-4">
                              {/* Video */}
                              <video
                                src={submission.videoUrl}
                                controls
                                className="w-full rounded-lg max-h-[400px] bg-black"
                              />

                              {/* Description */}
                              {submission.description && (
                                <div className="p-3 bg-secondary/30 rounded-lg">
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {language === 'zh' ? '學生備註' : 'Student Notes'}
                                  </p>
                                  <p className="text-foreground">{submission.description}</p>
                                </div>
                              )}

                              {/* Previous Feedback */}
                              {submission.feedback && (
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-primary">
                                      {language === 'zh' ? '已給予回饋' : 'Previous Feedback'}
                                    </span>
                                  </div>
                                  <p className="text-foreground">{submission.feedback}</p>
                                </div>
                              )}

                              {/* Review Form */}
                              {submission.status === 'pending' && (
                                <div className="p-4 bg-secondary/30 rounded-lg space-y-4">
                                  <h4 className="font-medium text-foreground flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-primary" />
                                    {language === 'zh' ? '審核此提交' : 'Review This Submission'}
                                  </h4>

                                  {/* Status Selection */}
                                  <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">
                                      {language === 'zh' ? '審核結果' : 'Review Result'}
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button
                                        variant={reviewStatus === 'approved' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setReviewStatus('approved')}
                                        className={reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                                      >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        {language === 'zh' ? '通過' : 'Approve'}
                                      </Button>
                                      <Button
                                        variant={reviewStatus === 'needs_revision' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setReviewStatus('needs_revision')}
                                        className={reviewStatus === 'needs_revision' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                      >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {language === 'zh' ? '需修改' : 'Needs Revision'}
                                      </Button>
                                      <Button
                                        variant={reviewStatus === 'rejected' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setReviewStatus('rejected')}
                                        className={reviewStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        {language === 'zh' ? '不通過' : 'Reject'}
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Score */}
                                  <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">
                                      {language === 'zh' ? `評分：${score[0]} 分` : `Score: ${score[0]} points`}
                                    </label>
                                    <Slider
                                      value={score}
                                      onValueChange={setScore}
                                      max={100}
                                      min={0}
                                      step={5}
                                      className="w-full"
                                    />
                                  </div>

                                  {/* Feedback */}
                                  <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">
                                      {language === 'zh' ? '回饋意見（選填）' : 'Feedback (optional)'}
                                    </label>
                                    <Textarea
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      placeholder={language === 'zh' ? '給學生的建議或鼓勵...' : 'Suggestions or encouragement for the student...'}
                                      className="min-h-[100px] resize-none"
                                    />
                                  </div>

                                  {/* Submit Button */}
                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() => handleSubmitReview(submission.id)}
                                      disabled={reviewMutation.isPending}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      {reviewMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                      )}
                                      {language === 'zh' ? '提交審核' : 'Submit Review'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
