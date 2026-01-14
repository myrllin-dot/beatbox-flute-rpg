/**
 * Quest Detail Page
 * Design: Arcane Academy - Immersive quest experience with video player
 * Features: Video tutorial, step-by-step guide, progress tracking
 */

import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, Clock, Music, Target, Award, Upload, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { toast } from 'sonner';

interface QuestStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// Mock quest data
const questData: Record<string, {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  difficulty: string;
  steps: QuestStep[];
  tips: string[];
}> = {
  '1-1': {
    title: '基礎氣息控制',
    description: '學習穩定的氣息控制，這是所有長笛技巧的基礎。掌握正確的呼吸方式和氣流控制。透過本課程，你將學會如何運用腹式呼吸來產生穩定且持久的氣流。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15分鐘',
    difficulty: '簡單',
    steps: [
      { id: 1, title: '觀看教學影片', description: '完整觀看氣息控制教學影片', completed: true },
      { id: 2, title: '腹式呼吸練習', description: '練習腹式呼吸 10 分鐘', completed: true },
      { id: 3, title: '長音練習', description: '嘗試吹奏穩定的長音 30 秒', completed: false },
      { id: 4, title: '上傳練習影片', description: '錄製並上傳你的練習成果', completed: false },
    ],
    tips: [
      '放鬆肩膀，讓氣息自然流動',
      '想像氣息從腹部緩緩上升',
      '保持嘴型穩定，不要過度用力',
      '每天練習 15-20 分鐘效果最佳',
    ],
  },
  '1-2': {
    title: '音色穩定訓練',
    description: '透過持續的長音練習，建立穩定且飽滿的音色。學習如何保持音準和音質。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '20分鐘',
    difficulty: '簡單',
    steps: [
      { id: 1, title: '觀看教學影片', description: '完整觀看音色訓練教學影片', completed: true },
      { id: 2, title: '音階練習', description: '練習基礎音階', completed: true },
      { id: 3, title: '長音持續練習', description: '每個音保持 10 秒', completed: false },
      { id: 4, title: '上傳練習影片', description: '錄製並上傳你的練習成果', completed: false },
    ],
    tips: [
      '注意聆聽自己的音色',
      '使用調音器確認音準',
      '嘗試不同的氣息強度',
    ],
  },
  '1-3': {
    title: '節奏感培養',
    description: '使用節拍器進行節奏訓練，建立穩定的內在節奏感。從簡單的四拍開始。',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '25分鐘',
    difficulty: '中等',
    steps: [
      { id: 1, title: '觀看教學影片', description: '完整觀看節奏訓練教學影片', completed: false },
      { id: 2, title: '節拍器練習', description: '跟著節拍器練習基本節奏', completed: false },
      { id: 3, title: '變速練習', description: '嘗試不同速度的節奏', completed: false },
      { id: 4, title: '上傳練習影片', description: '錄製並上傳你的練習成果', completed: false },
    ],
    tips: [
      '從慢速開始，逐漸加快',
      '用腳打拍子幫助保持節奏',
      '專注於穩定性而非速度',
    ],
  },
};

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [steps, setSteps] = useState<QuestStep[]>(questData[id || '1-1']?.steps || []);
  
  const quest = questData[id || '1-1'];
  
  if (!quest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-foreground mb-4">任務不存在</h1>
          <Link href="/quests">
            <Button>返回任務列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const toggleStep = (stepId: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
    toast.success('進度已更新！');
  };

  const handleUpload = () => {
    toast.info('影片上傳功能即將推出！');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-20 pt-20 lg:pt-8 pb-20">
        <div className="container max-w-5xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/quests">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('action.back')}
              </Button>
            </Link>
          </motion.div>

          {/* Quest Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="magic-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Quest Icon */}
              <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Target className="w-10 h-10 text-primary" />
              </div>

              {/* Quest Info */}
              <div className="flex-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {quest.title}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {quest.description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {quest.duration}
                  </span>
                  <span className="flex items-center gap-1 text-accent">
                    <Music className="w-4 h-4" />
                    {quest.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <Award className="w-4 h-4" />
                    完成可獲得經驗值
                  </span>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="text-center shrink-0">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${progress * 2.2} 220`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedSteps}/{steps.length} 步驟
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="magic-card overflow-hidden"
              >
                <div className="aspect-video bg-black relative">
                  <iframe
                    src={quest.videoUrl}
                    title={quest.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    教學影片
                  </span>
                  <Button variant="outline" size="sm">
                    全螢幕觀看
                  </Button>
                </div>
              </motion.div>

              {/* Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="magic-card p-6"
              >
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  任務步驟
                </h2>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => toggleStep(step.id)}
                      className={`
                        flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all
                        ${step.completed 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-secondary/50 hover:bg-secondary'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                        ${step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-semibold">{step.id}</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${step.completed ? 'text-green-400' : 'text-foreground'}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">總進度</span>
                    <span className="text-primary font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="magic-card p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-accent" />
                  練習小提示
                </h2>
                <ul className="space-y-3">
                  {quest.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="magic-card p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  上傳練習成果
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  錄製你的練習影片並上傳，導師會給予回饋和評分。
                </p>
                <Button onClick={handleUpload} className="w-full bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  上傳影片
                </Button>
              </motion.div>

              {/* Complete Button */}
              {progress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="magic-card p-6 text-center glow-gold"
                >
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    恭喜完成任務！
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    你已完成所有步驟，可以提交任務了。
                  </p>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent">
                    提交任務
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
