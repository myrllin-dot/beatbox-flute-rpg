/**
 * CommentSection Component
 * A discussion area for students to ask questions and interact under tutorial videos
 * Features: Post comments, reply to comments, like comments, delete own comments
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Reply, Trash2, Send, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

interface CommentSectionProps {
  questId: string;
}

export default function CommentSection({ questId }: CommentSectionProps) {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const utils = trpc.useUtils();

  // Fetch comments
  const { data: comments, isLoading } = trpc.comments.list.useQuery({ questId });

  // Mutations
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ questId });
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      toast.success(language === 'zh' ? '留言已發送！' : 'Comment posted!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ questId });
      toast.success(language === 'zh' ? '留言已刪除' : 'Comment deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleLike = trpc.comments.toggleLike.useMutation({
    onMutate: async ({ commentId }) => {
      // Optimistic update
      await utils.comments.list.cancel({ questId });
      const previousComments = utils.comments.list.getData({ questId });
      
      utils.comments.list.setData({ questId }, (old) => {
        if (!old) return old;
        return old.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: c.isLikedByUser ? c.likes - 1 : c.likes + 1,
              isLikedByUser: !c.isLikedByUser,
            };
          }
          return c;
        });
      });

      return { previousComments };
    },
    onError: (error, _, context) => {
      if (context?.previousComments) {
        utils.comments.list.setData({ questId }, context.previousComments);
      }
      toast.error(error.message);
    },
  });

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!newComment.trim()) return;
    createComment.mutate({ questId, content: newComment.trim() });
  };

  const handleSubmitReply = (parentId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!replyContent.trim()) return;
    createComment.mutate({ questId, content: replyContent.trim(), parentId });
  };

  const handleLike = (commentId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    toggleLike.mutate({ commentId });
  };

  const handleDelete = (commentId: number) => {
    if (confirm(language === 'zh' ? '確定要刪除這則留言嗎？' : 'Are you sure you want to delete this comment?')) {
      deleteComment.mutate({ commentId });
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Separate top-level comments and replies
  const topLevelComments = comments?.filter(c => !c.parentId) || [];
  const repliesMap = new Map<number, typeof comments>();
  comments?.forEach(c => {
    if (c.parentId) {
      const existing = repliesMap.get(c.parentId) || [];
      repliesMap.set(c.parentId, [...existing, c]);
    }
  });

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'zh' ? zhTW : enUS,
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="magic-card p-6">
      <h3 className="font-display text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        {language === 'zh' ? '討論區' : 'Discussion'}
        {comments && comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({topLevelComments.length})
          </span>
        )}
      </h3>

      {/* New Comment Form */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary">
              {isAuthenticated ? getInitials(user?.name || null) : <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuthenticated
                  ? (language === 'zh' ? '分享你的問題或心得...' : 'Share your question or thoughts...')
                  : (language === 'zh' ? '登入後即可留言' : 'Login to comment')
              }
              className="min-h-[80px] bg-secondary/50 border-border resize-none"
              disabled={!isAuthenticated}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || createComment.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createComment.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {language === 'zh' ? '發送' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{language === 'zh' ? '還沒有留言，成為第一個發言的人吧！' : 'No comments yet. Be the first to share!'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {topLevelComments.map((comment) => {
              const replies = repliesMap.get(comment.id) || [];
              const isExpanded = expandedReplies.has(comment.id);
              const canDelete = user?.id === comment.userId || user?.role === 'admin';

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-b border-border pb-4 last:border-0"
                >
                  {/* Comment */}
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {comment.userName || (language === 'zh' ? '匿名用戶' : 'Anonymous')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            comment.isLikedByUser
                              ? 'text-red-500'
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${comment.isLikedByUser ? 'fill-current' : ''}`} />
                          {comment.likes > 0 && comment.likes}
                        </button>
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              window.location.href = getLoginUrl();
                              return;
                            }
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            setReplyContent('');
                          }}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          {language === 'zh' ? '回覆' : 'Reply'}
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Reply Form */}
                      <AnimatePresence>
                        {replyingTo === comment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3"
                          >
                            <div className="flex gap-2">
                              <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={language === 'zh' ? '寫下你的回覆...' : 'Write your reply...'}
                                className="min-h-[60px] bg-secondary/50 border-border resize-none text-sm"
                                autoFocus
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(null)}
                              >
                                {language === 'zh' ? '取消' : 'Cancel'}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim() || createComment.isPending}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {createComment.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {language === 'zh' ? '回覆' : 'Reply'}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Replies Toggle */}
                      {replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1 mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {language === 'zh'
                            ? `${replies.length} 則回覆`
                            : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                        </button>
                      )}

                      {/* Replies */}
                      <AnimatePresence>
                        {isExpanded && replies.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pl-4 border-l-2 border-border space-y-3"
                          >
                            {replies.map((reply) => {
                              const canDeleteReply = user?.id === reply.userId || user?.role === 'admin';
                              return (
                                <div key={reply.id} className="flex gap-2">
                                  <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarFallback className="bg-accent/20 text-accent text-xs">
                                      {getInitials(reply.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-foreground">
                                        {reply.userName || (language === 'zh' ? '匿名用戶' : 'Anonymous')}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                                      {reply.content}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <button
                                        onClick={() => handleLike(reply.id)}
                                        className={`flex items-center gap-1 text-xs transition-colors ${
                                          reply.isLikedByUser
                                            ? 'text-red-500'
                                            : 'text-muted-foreground hover:text-red-500'
                                        }`}
                                      >
                                        <Heart className={`w-3 h-3 ${reply.isLikedByUser ? 'fill-current' : ''}`} />
                                        {reply.likes > 0 && reply.likes}
                                      </button>
                                      {canDeleteReply && (
                                        <button
                                          onClick={() => handleDelete(reply.id)}
                                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
