/**
 * Quests Page - 村莊地圖
 * 顯示免費版與正式版所有村莊和關卡
 * 支援序號解鎖、進度追蹤
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Play, Star, Crown, ChevronDown, ChevronRight, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getAllVillages, DIFFICULTY_CONFIG, type Village, type Quest } from '@/data/quests';
import { toast } from 'sonner';

const villages = getAllVillages();

function QuestCard({ quest, isUnlocked, progress }: {
  quest: Quest;
  isUnlocked: boolean;
  progress?: number;
}) {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const title = zh ? quest.titleZh : quest.titleEn;
  const diff = DIFFICULTY_CONFIG[quest.difficulty];
  const isCompleted = (progress ?? 0) >= 100;

  if (!isUnlocked) {
    return (
      <div className="relative flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800/50 opacity-60">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <span className={`text-xs ${diff.color}`}>{zh ? diff.labelZh : diff.labelEn}</span>
        </div>
        {quest.comingSoon && (
          <span className="text-xs text-gray-600 shrink-0">{zh ? '製作中' : 'Soon'}</span>
        )}
      </div>
    );
  }

  return (
    <Link href={`/quests/${quest.id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`
          relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
          ${isCompleted
            ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
            : 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
          }
        `}
      >
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg
          ${isCompleted ? 'bg-green-500/20' : 'bg-gray-700/80'}
        `}>
          {isCompleted ? '✅' : quest.badgeIcon || '🎵'}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${diff.color}`}>{zh ? diff.labelZh : diff.labelEn}</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-yellow-400">+{quest.xpReward} XP</span>
          </div>
          {(progress ?? 0) > 0 && !isCompleted && (
            <div className="mt-1.5 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        {isCompleted ? (
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
        )}
      </motion.div>
    </Link>
  );
}

function VillageSection({ village, userTier, progressMap }: {
  village: Village;
  userTier: 'free' | 'pro';
  progressMap: Record<string, number>;
}) {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const [expanded, setExpanded] = useState(village.tier === 'free');
  const isLocked = village.tier === 'pro' && userTier === 'free';

  const totalQuests = village.units.reduce((sum, u) => sum + u.quests.length, 0);
  const completedQuests = village.units.reduce((sum, u) =>
    sum + u.quests.filter(q => (progressMap[q.id] ?? 0) >= 100).length, 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden ${
        isLocked
          ? 'border-gray-700/50 bg-gray-900/30'
          : 'border-gray-700 bg-gray-900/60'
      }`}
    >
      {/* Village Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/30 transition-colors text-left"
      >
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
          ${isLocked ? 'bg-gray-800 grayscale' : 'bg-gray-800'}
        `}>
          {isLocked ? '🔒' : village.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-base ${isLocked ? 'text-gray-500' : 'text-white'}`}>
              {zh ? village.titleZh : village.titleEn}
            </h3>
            {village.tier === 'pro' && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-medium">
                PRO
              </span>
            )}
          </div>
          {!isLocked && (
            <p className="text-xs text-gray-400 mt-0.5">
              {completedQuests}/{totalQuests} {zh ? '任務完成' : 'quests done'}
            </p>
          )}
          {isLocked && (
            <p className="text-xs text-gray-600 mt-0.5">
              {zh ? '需要序號解鎖' : 'Requires activation code'}
            </p>
          )}
        </div>
        {!isLocked && (
          <div className="shrink-0 text-gray-500">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
      </button>

      {/* Progress bar for village */}
      {!isLocked && totalQuests > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedQuests / totalQuests) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Units & Quests */}
      <AnimatePresence>
        {expanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {village.units.map(unit => (
                <div key={unit.id}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {zh ? unit.titleZh : unit.titleEn}
                  </p>
                  <div className="space-y-2">
                    {unit.quests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        isUnlocked={!quest.comingSoon}
                        progress={progressMap[quest.id]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked preview */}
      {isLocked && (
        <div className="px-4 pb-4">
          <div className="text-sm text-gray-600 space-y-1">
            {village.units.slice(0, 2).map(unit => (
              <div key={unit.id} className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                <span className="truncate">{zh ? unit.titleZh : unit.titleEn}</span>
                <span className="text-gray-700 shrink-0">({unit.quests.length} {zh ? '任務' : 'quests'})</span>
              </div>
            ))}
            {village.units.length > 2 && (
              <p className="text-gray-700 text-xs pl-5">
                +{village.units.length - 2} {zh ? '更多單元...' : 'more units...'}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ActivationCodeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const activateMutation = trpc.auth.activateCode.useMutation({
    onSuccess: () => {
      toast.success(zh ? '🎉 序號啟用成功！正式版已解鎖！' : '🎉 Code activated! Pro version unlocked!');
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(zh ? `啟用失敗：${err.message}` : `Activation failed: ${err.message}`);
      setLoading(false);
    },
  });

  const handleActivate = () => {
    if (!code.trim()) return;
    setLoading(true);
    activateMutation.mutate({ code: code.trim().toUpperCase() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🔑</div>
          <h2 className="text-xl font-bold text-white">
            {zh ? '輸入啟用序號' : 'Enter Activation Code'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {zh ? '解鎖完整正式版課程' : 'Unlock the full Pro course'}
          </p>
        </div>

        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder={zh ? '輸入序號（例如：BFPRO-XXXX）' : 'Enter code (e.g. BFPRO-XXXX)'}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest placeholder-gray-600 focus:outline-none focus:border-yellow-500 mb-4"
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
        />

        <Button
          onClick={handleActivate}
          disabled={loading || !code.trim()}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl"
        >
          <Key className="w-4 h-4 mr-2" />
          {loading ? (zh ? '啟用中...' : 'Activating...') : (zh ? '啟用序號' : 'Activate Code')}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4">
          {zh ? '還沒有序號？' : "Don't have a code? "}
          <a
            href="https://fluteonline.myrflute.com/courses/beatbox-flute-tutorial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:underline"
          >
            {zh ? '立即購買課程' : 'Purchase the course'}
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function Quests() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const { isAuthenticated, user } = useAuth();
  const [showActivation, setShowActivation] = useState(false);

  const { data: myProgress, refetch: refetchProgress } = trpc.progress.myProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: me, refetch: refetchMe } = trpc.auth.me.useQuery();

  const progressMap: Record<string, number> = {};
  if (myProgress) {
    for (const p of myProgress) {
      progressMap[p.questId] = p.progress;
    }
  }

  const userTier: 'free' | 'pro' = (me as any)?.tier === 'pro' ? 'pro' : 'free';

  const totalXp = myProgress?.reduce((sum, p) => sum + (p.xpEarned ?? 0), 0) ?? 0;
  const completedCount = myProgress?.filter(p => p.completed === 1).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <main className="lg:ml-20 pt-20 lg:pt-8 pb-24">
        <div className="max-w-2xl mx-auto px-4">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-white">
              {zh ? '🗺️ 任務地圖' : '🗺️ Quest Map'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {zh ? '選擇村莊，開始你的絕技長笛旅程' : 'Choose a village and begin your Beatbox Flute journey'}
            </p>
          </motion.div>

          {/* Stats bar */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 mb-6"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{totalXp} XP</span>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">{completedCount} {zh ? '任務完成' : 'completed'}</span>
              </div>
              <div className="flex-1" />
              {userTier === 'free' ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-xs h-7 px-3"
                  onClick={() => isAuthenticated ? setShowActivation(true) : toast.error(zh ? '請先登入' : 'Please login first')}
                >
                  <Key className="w-3 h-3 mr-1" />
                  {zh ? '輸入序號' : 'Enter Code'}
                </Button>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-bold">PRO</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Free tier banner (not logged in) */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <Play className="w-8 h-8 text-yellow-400 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">
                  {zh ? '免費開始你的旅程' : 'Start your journey for free'}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {zh ? '4 個免費任務，感受絕技長笛的魅力' : '4 free quests to experience Beatbox Flute'}
                </p>
              </div>
              <Link href="/login" className="ml-auto shrink-0">
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs">
                  {zh ? '立即開始' : 'Start Now'}
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Village list */}
          <div className="space-y-4">
            {villages.map((village, i) => (
              <motion.div
                key={village.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <VillageSection
                  village={village}
                  userTier={userTier}
                  progressMap={progressMap}
                />
              </motion.div>
            ))}
          </div>

          {/* Pro CTA */}
          {userTier === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-5 text-center"
            >
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-bold mb-1">
                {zh ? '解鎖完整正式版課程' : 'Unlock Full Pro Course'}
              </h3>
              <p className="text-gray-400 text-xs mb-3">
                {zh
                  ? '34 個單元、10 小時課程內容，完整通關成為神殿守護者'
                  : '34 units, 10 hours of content - complete all to become a Temple Guardian'
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm"
                  onClick={() => window.open('https://fluteonline.myrflute.com/courses/beatbox-flute-tutorial', '_blank')}
                >
                  {zh ? '購買課程' : 'Purchase Course'}
                </Button>
                <Button
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-sm"
                  onClick={() => isAuthenticated ? setShowActivation(true) : toast.error(zh ? '請先登入' : 'Please login')}
                >
                  <Key className="w-3 h-3 mr-1" />
                  {zh ? '我已購買，輸入序號' : 'I bought it, enter code'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Activation Modal */}
      <AnimatePresence>
        {showActivation && (
          <ActivationCodeModal
            onClose={() => setShowActivation(false)}
            onSuccess={() => { refetchMe(); refetchProgress(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
