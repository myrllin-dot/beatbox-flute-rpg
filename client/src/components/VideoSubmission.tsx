/**
 * VideoSubmission Component
 * Allows students to upload practice videos for instructor review
 * Features: Video upload, view submission history, status tracking
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Video, 
  FileVideo, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

interface VideoSubmissionProps {
  questId: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function VideoSubmission({ questId }: VideoSubmissionProps) {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Fetch user's submissions for this quest
  const { data: submissions, isLoading } = trpc.submissions.mySubmissions.useQuery(
    { questId },
    { enabled: isAuthenticated }
  );

  // Upload mutation
  const uploadMutation = trpc.submissions.upload.useMutation({
    onSuccess: () => {
      utils.submissions.mySubmissions.invalidate({ questId });
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      toast.success(language === 'zh' ? '影片上傳成功！等待導師審核' : 'Video uploaded! Awaiting instructor review');
    },
    onError: (error) => {
      toast.error(error.message);
      setUploadProgress(0);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.submissions.delete.useMutation({
    onSuccess: () => {
      utils.submissions.mySubmissions.invalidate({ questId });
      toast.success(language === 'zh' ? '已刪除提交' : 'Submission deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error(language === 'zh' ? '請選擇影片檔案' : 'Please select a video file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(language === 'zh' ? '檔案大小不能超過 50MB' : 'File size cannot exceed 50MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !isAuthenticated) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(10 + (e.loaded / e.total) * 40);
        }
      };
      
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      setUploadProgress(60);

      // Upload to server
      await uploadMutation.mutateAsync({
        questId,
        title: title || undefined,
        description: description || undefined,
        videoBase64: base64,
        mimeType: selectedFile.type,
        fileName: selectedFile.name,
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (submissionId: number) => {
    if (confirm(language === 'zh' ? '確定要刪除這個提交嗎？' : 'Are you sure you want to delete this submission?')) {
      deleteMutation.mutate({ submissionId });
    }
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
            {language === 'zh' ? '審核中' : 'Pending'}
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

  if (!isAuthenticated) {
    return (
      <div className="magic-card p-6 text-center">
        <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground mb-4">
          {language === 'zh' ? '登入後即可上傳練習影片' : 'Login to upload practice videos'}
        </p>
        <Button onClick={() => window.location.href = getLoginUrl()}>
          {language === 'zh' ? '登入' : 'Login'}
        </Button>
      </div>
    );
  }

  return (
    <div className="magic-card p-6">
      <h3 className="font-display text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <FileVideo className="w-5 h-5 text-primary" />
        {language === 'zh' ? '練習影片上傳' : 'Practice Video Upload'}
      </h3>

      {/* Upload Form */}
      <div className="mb-6 p-4 border border-dashed border-border rounded-lg bg-secondary/30">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer text-center py-8"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-2">
              {language === 'zh' ? '點擊選擇影片檔案' : 'Click to select video file'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'zh' ? '支援 MP4、MOV、WebM 等格式，最大 50MB' : 'Supports MP4, MOV, WebM, max 50MB'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Video className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'zh' ? '標題（選填）' : 'Title (optional)'}
              disabled={isUploading}
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'zh' ? '描述或備註（選填）' : 'Description or notes (optional)'}
              className="min-h-[80px] resize-none"
              disabled={isUploading}
            />

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {language === 'zh' ? '上傳中...' : 'Uploading...'} {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedFile(null);
                  setTitle('');
                  setDescription('');
                }}
                disabled={isUploading}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {language === 'zh' ? '上傳' : 'Upload'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submissions History */}
      <div>
        <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {language === 'zh' ? '我的提交記錄' : 'My Submissions'}
          {submissions && submissions.length > 0 && (
            <span className="text-sm text-muted-foreground">({submissions.length})</span>
          )}
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileVideo className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{language === 'zh' ? '還沒有提交記錄' : 'No submissions yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {submissions.map((submission) => {
                const isExpanded = expandedSubmission === submission.id;
                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-4 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setExpandedSubmission(isExpanded ? null : submission.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <Video className="w-5 h-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {submission.title || (language === 'zh' ? '練習影片' : 'Practice Video')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(submission.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(submission.status)}
                          {submission.score !== null && (
                            <Badge variant="outline" className="border-primary/30">
                              <Star className="w-3 h-3 mr-1 text-primary" />
                              {submission.score}
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-border space-y-4">
                            {/* Video Preview */}
                            <video
                              src={submission.videoUrl}
                              controls
                              className="w-full rounded-lg max-h-[300px] bg-black"
                            />

                            {/* Description */}
                            {submission.description && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {language === 'zh' ? '描述' : 'Description'}
                                </p>
                                <p className="text-foreground">{submission.description}</p>
                              </div>
                            )}

                            {/* Instructor Feedback */}
                            {submission.feedback && (
                              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-primary">
                                    {language === 'zh' ? '導師回饋' : 'Instructor Feedback'}
                                  </span>
                                </div>
                                <p className="text-foreground">{submission.feedback}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(submission.id);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {language === 'zh' ? '刪除' : 'Delete'}
                              </Button>
                            </div>
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
    </div>
  );
}
