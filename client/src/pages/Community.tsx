/**
 * Community Page
 * Social learning community with posts, likes, and comments
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageCircle, Heart, Send, Plus, 
  Sparkles, HelpCircle, Trophy, HandHeart,
  MoreVertical, Trash2, X, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import Navigation from '@/components/Navigation';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';

const postTypeIcons = {
  experience: Sparkles,
  question: HelpCircle,
  achievement: Trophy,
  encouragement: HandHeart,
};

const postTypeLabels = {
  zh: {
    experience: '練習心得',
    question: '提問討論',
    achievement: '成就分享',
    encouragement: '互相鼓勵',
  },
  en: {
    experience: 'Experience',
    question: 'Question',
    achievement: 'Achievement',
    encouragement: 'Encouragement',
  },
};

export default function Community() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'experience' | 'question' | 'achievement' | 'encouragement'>('experience');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  // Fetch posts
  const { data: posts, refetch: refetchPosts } = trpc.community.list.useQuery({
    limit: 50,
    postType: activeTab === 'all' ? undefined : activeTab,
  });

  // Create post mutation
  const createPostMutation = trpc.community.create.useMutation({
    onSuccess: () => {
      setNewPostContent('');
      setIsCreateDialogOpen(false);
      refetchPosts();
      toast.success(language === 'zh' ? '發布成功！' : 'Posted successfully!');
    },
  });

  // Toggle like mutation
  const toggleLikeMutation = trpc.community.toggleLike.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  // Add comment mutation
  const addCommentMutation = trpc.community.addComment.useMutation({
    onSuccess: (_, variables) => {
      setCommentInputs(prev => ({ ...prev, [variables.postId]: '' }));
      refetchPosts();
    },
  });

  // Delete post mutation
  const deletePostMutation = trpc.community.delete.useMutation({
    onSuccess: () => {
      refetchPosts();
      toast.success(language === 'zh' ? '已刪除' : 'Deleted');
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate({
      content: newPostContent,
      postType: newPostType,
    });
  };

  const handleToggleLike = (postId: number) => {
    if (!isAuthenticated) {
      toast.error(language === 'zh' ? '請先登入' : 'Please log in first');
      return;
    }
    toggleLikeMutation.mutate({ postId });
  };

  const handleAddComment = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    addCommentMutation.mutate({ postId, content });
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'zh' ? '剛剛' : 'Just now';
    if (minutes < 60) return language === 'zh' ? `${minutes} 分鐘前` : `${minutes}m ago`;
    if (hours < 24) return language === 'zh' ? `${hours} 小時前` : `${hours}h ago`;
    return language === 'zh' ? `${days} 天前` : `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-16 lg:pt-0">
        <div className="container py-8 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center"
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-primary mb-2">
              {language === 'zh' ? '學習社群' : 'Learning Community'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'zh' 
                ? '分享練習心得，互相鼓勵，一起進步！' 
                : 'Share experiences, encourage each other, grow together!'}
            </p>
          </div>

          {/* Create Post Button */}
          {isAuthenticated ? (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  <Plus className="w-5 h-5 mr-2" />
                  {language === 'zh' ? '發布新貼文' : 'Create New Post'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'zh' ? '發布新貼文' : 'Create New Post'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Post Type Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['experience', 'question', 'achievement', 'encouragement'] as const).map((type) => {
                      const Icon = postTypeIcons[type];
                      return (
                        <Button
                          key={type}
                          variant={newPostType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewPostType(type)}
                          className="justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {postTypeLabels[language][type]}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Content */}
                  <Textarea
                    placeholder={language === 'zh' ? '分享你的想法...' : 'Share your thoughts...'}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />

                  {/* Submit */}
                  <Button
                    className="w-full"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || createPostMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createPostMutation.isPending 
                      ? (language === 'zh' ? '發布中...' : 'Posting...')
                      : (language === 'zh' ? '發布' : 'Post')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Card className="mb-6 magic-card">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground mb-3">
                  {language === 'zh' ? '登入後即可發布貼文和互動' : 'Log in to post and interact'}
                </p>
                <Button asChild variant="outline">
                  <a href={getLoginUrl()}>
                    {language === 'zh' ? '立即登入' : 'Log In'}
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all">
                {language === 'zh' ? '全部' : 'All'}
              </TabsTrigger>
              <TabsTrigger value="experience">
                <Sparkles className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="question">
                <HelpCircle className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="achievement">
                <Trophy className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="encouragement">
                <HandHeart className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts?.length === 0 && (
              <Card className="magic-card">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === 'zh' 
                      ? '還沒有貼文，成為第一個發布的人吧！' 
                      : 'No posts yet. Be the first to share!'}
                  </p>
                </CardContent>
              </Card>
            )}

            <AnimatePresence>
              {posts?.map((post) => {
                const PostTypeIcon = postTypeIcons[post.postType as keyof typeof postTypeIcons] || Sparkles;
                const isExpanded = expandedComments.has(post.id);
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="magic-card overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {post.userName?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {post.userName || (language === 'zh' ? '匿名用戶' : 'Anonymous')}
                                </span>
                                {post.userRole === 'admin' && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    {language === 'zh' ? '導師' : 'Instructor'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <PostTypeIcon className="w-3 h-3" />
                                <span>{postTypeLabels[language][post.postType as keyof typeof postTypeLabels['zh']]}</span>
                                <span>·</span>
                                <span>{formatTimeAgo(post.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete menu for owner/admin */}
                          {(user?.id === post.userId || user?.role === 'admin') && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deletePostMutation.mutate({ postId: post.id })}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {language === 'zh' ? '刪除' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pb-3">
                        {/* Post Content */}
                        <p className="whitespace-pre-wrap mb-4">{post.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleToggleLike(post.id)}
                          >
                            <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{post.likes}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => toggleComments(post.id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentCount}</span>
                          </Button>
                        </div>

                        {/* Comments Section */}
                        {isExpanded && (
                          <PostComments
                            postId={post.id}
                            isAuthenticated={isAuthenticated}
                            language={language}
                            commentInput={commentInputs[post.id] || ''}
                            onCommentChange={(value) => setCommentInputs(prev => ({ ...prev, [post.id]: value }))}
                            onSubmitComment={() => handleAddComment(post.id)}
                            isSubmitting={addCommentMutation.isPending}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// Separate component for comments to handle fetching
function PostComments({
  postId,
  isAuthenticated,
  language,
  commentInput,
  onCommentChange,
  onSubmitComment,
  isSubmitting,
}: {
  postId: number;
  isAuthenticated: boolean;
  language: 'zh' | 'en';
  commentInput: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  isSubmitting: boolean;
}) {
  const { data: comments } = trpc.community.comments.useQuery({ postId });

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {/* Comment Input */}
      {isAuthenticated && (
        <div className="flex gap-2 mb-4">
          <Textarea
            placeholder={language === 'zh' ? '寫下你的回覆...' : 'Write a reply...'}
            value={commentInput}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={onSubmitComment}
            disabled={!commentInput.trim() || isSubmitting}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {comment.userName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {comment.userName || (language === 'zh' ? '匿名' : 'Anonymous')}
                </span>
                {comment.userRole === 'admin' && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    {language === 'zh' ? '導師' : 'Instructor'}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            {language === 'zh' ? '還沒有留言' : 'No comments yet'}
          </p>
        )}
      </div>
    </div>
  );
}
