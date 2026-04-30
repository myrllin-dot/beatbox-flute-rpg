// client/src/data/quests.ts
// 所有關卡資料 - 整合免費版與正式版課程

export type Difficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type Tier = 'free' | 'pro';
export type QuestStatus = 'locked' | 'available' | 'completed';

export interface QuestStep {
  id: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
}

export interface Quest {
  id: string;
  tier: Tier;
  villageId: string;
  unitId: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  videoUrl: string;       // YouTube embed URL，之後替換
  duration: number;       // 分鐘
  difficulty: Difficulty;
  xpReward: number;
  steps: QuestStep[];
  tipsZh: string[];
  tipsEn: string[];
  badgeIcon?: string;     // emoji
  comingSoon?: boolean;
}

export interface Unit {
  id: string;
  villageId: string;
  titleZh: string;
  titleEn: string;
  tier: Tier;
  quests: Quest[];
}

export interface Village {
  id: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  tier: Tier;
  levelRequired: number;
  icon: string;           // emoji
  units: Unit[];
}

// ═══════════════════════════════════════════════════════
// 免費版關卡：新手入口（Lv.1-1 ~ 1-4）
// ═══════════════════════════════════════════════════════

export const FREE_QUESTS: Village = {
  id: 'intro',
  titleZh: '🆓 新手入口村',
  titleEn: 'Intro Village (Free)',
  descZh: '踏入絕技長笛的世界，完成四道入門任務，開啟你的傳說之旅。',
  descEn: 'Enter the world of Beatbox Flute. Complete four intro quests to begin your legend.',
  tier: 'free',
  levelRequired: 0,
  icon: '🏕️',
  units: [
    {
      id: 'intro-unit',
      villageId: 'intro',
      titleZh: '入門四任務',
      titleEn: 'Four Intro Quests',
      tier: 'free',
      quests: [
        {
          id: '1-1',
          tier: 'free',
          villageId: 'intro',
          unitId: 'intro-unit',
          titleZh: 'Lv.1-1 口技甦醒',
          titleEn: 'Lv.1-1 Beatbox Awakening',
          descZh: '認識口技的基本原理，感受嘴唇與氣息的共鳴，喚醒你沉睡的聲音能力。',
          descEn: 'Learn the basics of beatbox. Feel the resonance between your lips and breath, awakening your dormant vocal power.',
          videoUrl: 'https://www.youtube.com/embed/SsEbqkEE92A',
          duration: 10,
          difficulty: 'easy',
          xpReward: 50,
          badgeIcon: '👄',
          steps: [
            { id: 1, titleZh: '觀看教學影片', titleEn: 'Watch Tutorial', descZh: '完整觀看本任務的教學影片', descEn: 'Watch the full tutorial video' },
            { id: 2, titleZh: '練習基本摩擦音', titleEn: 'Practice Basic Friction Sound', descZh: '用嘴唇製造出基本的摩擦聲響', descEn: 'Create basic friction sounds with your lips' },
            { id: 3, titleZh: '感受氣息流動', titleEn: 'Feel the Breath Flow', descZh: '在不用長笛的情況下練習氣息控制', descEn: 'Practice breath control without the flute' },
            { id: 4, titleZh: '完成練習紀錄', titleEn: 'Complete Practice Record', descZh: '記錄今日的練習心得', descEn: 'Record your practice notes for today' },
          ],
          tipsZh: ['放鬆你的嘴唇，不要用力', '每天花5分鐘練習就有效果', '先從慢速開始，不要急'],
          tipsEn: ['Relax your lips, don\'t force it', '5 minutes daily practice makes a difference', 'Start slow, don\'t rush'],
        },
        {
          id: '1-2',
          tier: 'free',
          villageId: 'intro',
          unitId: 'intro-unit',
          titleZh: 'Lv.1-2 音符召喚',
          titleEn: 'Lv.1-2 Note Summoning',
          descZh: '將口技與長笛音符結合，召喚出第一道雙重聲響，感受兩者融合的魔力。',
          descEn: 'Combine beatbox with flute notes. Summon your first dual sound and feel the magic of fusion.',
          videoUrl: 'https://www.youtube.com/embed/jfluG7Xj3KI',
          duration: 15,
          difficulty: 'easy',
          xpReward: 75,
          badgeIcon: '🎵',
          steps: [
            { id: 1, titleZh: '觀看教學影片', titleEn: 'Watch Tutorial', descZh: '完整觀看本任務的教學影片', descEn: 'Watch the full tutorial video' },
            { id: 2, titleZh: '單獨練習口技節奏', titleEn: 'Practice Beatbox Rhythm Alone', descZh: '不拿長笛，先把節奏練熟', descEn: 'Practice the rhythm without the flute first' },
            { id: 3, titleZh: '加入長笛音符', titleEn: 'Add Flute Notes', descZh: '試著在口技節奏中加入長笛音符', descEn: 'Try adding flute notes into the beatbox rhythm' },
            { id: 4, titleZh: '完成練習紀錄', titleEn: 'Complete Practice Record', descZh: '記錄今日的練習心得', descEn: 'Record your practice notes for today' },
          ],
          tipsZh: ['先把口技練熟再加長笛', '不要同時想太多事情', '慢慢來，融合需要時間'],
          tipsEn: ['Master beatbox before adding flute', 'Don\'t think of too many things at once', 'Take it slow, fusion takes time'],
        },
        {
          id: '1-3',
          tier: 'free',
          villageId: 'intro',
          unitId: 'intro-unit',
          titleZh: 'Lv.1-3 怪物模仿',
          titleEn: 'Lv.1-3 Monster Imitation',
          descZh: '學習模仿各種聲音，用你的嘴巴創造出意想不到的音效，感受聲音的無限可能。',
          descEn: 'Learn to imitate various sounds. Create unexpected sound effects with your mouth and feel the infinite possibilities of sound.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: 15,
          difficulty: 'medium',
          xpReward: 100,
          badgeIcon: '👾',
          steps: [
            { id: 1, titleZh: '觀看教學影片', titleEn: 'Watch Tutorial', descZh: '完整觀看本任務的教學影片', descEn: 'Watch the full tutorial video' },
            { id: 2, titleZh: '練習三種摩擦音', titleEn: 'Practice Three Friction Sounds', descZh: '分別練習三種不同的口技摩擦音', descEn: 'Practice three different beatbox friction sounds' },
            { id: 3, titleZh: '嘗試聲音模仿', titleEn: 'Try Sound Imitation', descZh: '挑戰模仿日常生活中的一種聲音', descEn: 'Challenge yourself to imitate a sound from daily life' },
            { id: 4, titleZh: '完成練習紀錄', titleEn: 'Complete Practice Record', descZh: '記錄今日的練習心得', descEn: 'Record your practice notes for today' },
          ],
          tipsZh: ['觀察聲音的構成方式', '誇張一點沒關係，這是學習過程', '多聽多模仿'],
          tipsEn: ['Observe how sounds are constructed', 'It\'s okay to exaggerate - it\'s part of learning', 'Listen and imitate more'],
        },
        {
          id: '1-4',
          tier: 'free',
          villageId: 'intro',
          unitId: 'intro-unit',
          titleZh: 'Lv.1-4 魔力召喚',
          titleEn: 'Lv.1-4 Magic Summoning',
          descZh: '整合前三課所學，完成第一個完整的 Beatbox Flute 片段，見證你的魔力誕生。',
          descEn: 'Integrate everything from the first three lessons. Complete your first full Beatbox Flute segment and witness your magic being born.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: 20,
          difficulty: 'medium',
          xpReward: 150,
          badgeIcon: '✨',
          steps: [
            { id: 1, titleZh: '觀看教學影片', titleEn: 'Watch Tutorial', descZh: '完整觀看本任務的教學影片', descEn: 'Watch the full tutorial video' },
            { id: 2, titleZh: '複習前三課重點', titleEn: 'Review Key Points from First 3 Lessons', descZh: '快速複習 Lv.1-1 到 1-3 的核心技巧', descEn: 'Quickly review core skills from Lv.1-1 to 1-3' },
            { id: 3, titleZh: '完整片段練習', titleEn: 'Full Segment Practice', descZh: '練習一個完整的 Beatbox Flute 片段', descEn: 'Practice a complete Beatbox Flute segment' },
            { id: 4, titleZh: '完成入門徽章解鎖', titleEn: 'Unlock Intro Badge', descZh: '完成四道入門任務，獲得入門徽章！', descEn: 'Complete all four intro quests and earn the Intro Badge!' },
          ],
          tipsZh: ['不要追求完美，先完成再說', '錄下自己的練習，聽聽看進步了多少', '恭喜！你已經踏入絕技長笛的世界'],
          tipsEn: ['Don\'t chase perfection, just complete it first', 'Record your practice and hear your progress', 'Congrats! You\'ve entered the Beatbox Flute world'],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// 正式版關卡
// ═══════════════════════════════════════════════════════

export const PRO_VILLAGES: Village[] = [
  // ─── LEVEL 1 新手村 ───────────────────────────────
  {
    id: 'village-1',
    titleZh: 'LEVEL 1 新手村',
    titleEn: 'LEVEL 1 Beginner Village',
    descZh: '建立基礎知識、即興能力，並深入掌握口技的核心技巧。',
    descEn: 'Build foundational knowledge, improvisation ability, and deep mastery of core beatbox techniques.',
    tier: 'pro',
    levelRequired: 1,
    icon: '🌱',
    units: [
      {
        id: 'A1',
        villageId: 'village-1',
        titleZh: 'Unit A1 知識建立與即興',
        titleEn: 'Unit A1 Knowledge & Improvisation',
        tier: 'pro',
        quests: [
          {
            id: 'A1-1',
            tier: 'pro',
            villageId: 'village-1',
            unitId: 'A1',
            titleZh: 'A1-1 課程總覽與樂器選擇',
            titleEn: 'A1-1 Course Overview & Instrument Selection',
            descZh: '了解整個課程架構，學習如何選擇適合自己的長笛，建立正確的學習心態。',
            descEn: 'Understand the full course structure, learn how to choose the right flute, and build the correct learning mindset.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 15,
            difficulty: 'easy',
            xpReward: 80,
            badgeIcon: '📚',
            steps: [
              { id: 1, titleZh: '觀看課程介紹影片', titleEn: 'Watch Course Intro', descZh: '了解整個學習路線圖', descEn: 'Understand the full learning roadmap' },
              { id: 2, titleZh: '了解樂器選擇原則', titleEn: 'Learn Instrument Selection', descZh: '學習如何挑選適合的長笛型號', descEn: 'Learn how to choose the right flute model' },
              { id: 3, titleZh: '認識絕技長笛先驅', titleEn: 'Meet Beatbox Flute Pioneers', descZh: '欣賞世界頂尖的 Beatbox Flute 演奏家', descEn: 'Appreciate world-class Beatbox Flute performers' },
            ],
            tipsZh: ['開放心態最重要', '長笛型號不影響學習，有一把就夠了', '先看完再開始練習'],
            tipsEn: ['An open mindset is most important', 'Flute model doesn\'t matter - any flute will do', 'Watch everything before you start practicing'],
            comingSoon: false,
          },
          {
            id: 'A1-2',
            tier: 'pro',
            villageId: 'village-1',
            unitId: 'A1',
            titleZh: 'A1-2 採譜、聆聽與即興訓練',
            titleEn: 'A1-2 Transcription, Listening & Improvisation',
            descZh: '每天5分鐘的採譜練習，學習藍調音階與五度圈，掌握即興演奏的核心工具。',
            descEn: '5 minutes of daily transcription practice. Learn the blues scale and circle of fifths - the core tools of improvisation.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 20,
            difficulty: 'easy',
            xpReward: 100,
            badgeIcon: '🎼',
            steps: [
              { id: 1, titleZh: '觀看採譜教學', titleEn: 'Watch Transcription Tutorial', descZh: '學習如何用耳朵記錄音樂', descEn: 'Learn how to record music by ear' },
              { id: 2, titleZh: '練習藍調音階', titleEn: 'Practice Blues Scale', descZh: '在長笛上找出並演奏藍調音階', descEn: 'Find and play the blues scale on your flute' },
              { id: 3, titleZh: '認識五度圈', titleEn: 'Understand Circle of Fifths', descZh: '了解五度圈的概念與應用', descEn: 'Understand the concept and application of the circle of fifths' },
            ],
            tipsZh: ['每天只要5分鐘採譜', '藍調音階是即興的最佳起點', '不需要完整記下整首曲子，片段即可'],
            tipsEn: ['Just 5 minutes of transcription per day', 'Blues scale is the best starting point for improv', 'You don\'t need to transcribe entire songs, just fragments'],
            comingSoon: false,
          },
        ],
      },
      {
        id: 'A3',
        villageId: 'village-1',
        titleZh: 'Unit A3 口技深度訓練',
        titleEn: 'Unit A3 Deep Beatbox Training',
        tier: 'pro',
        quests: [
          {
            id: 'A3-1',
            tier: 'pro',
            villageId: 'village-1',
            unitId: 'A3',
            titleZh: 'A3-1 口技基礎與三音節奏',
            titleEn: 'A3-1 Beatbox Basics & Three-Sound Rhythm',
            descZh: '深入了解口技的本質，掌握三種摩擦音和基本三音節奏套組，打下紮實的節奏基礎。',
            descEn: 'Deeply understand the essence of beatbox. Master three friction sounds and basic three-sound rhythm sets to build a solid rhythmic foundation.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 30,
            difficulty: 'medium',
            xpReward: 150,
            badgeIcon: '🥁',
            steps: [
              { id: 1, titleZh: '了解口技的三種摩擦音', titleEn: 'Understand Three Friction Sounds', descZh: '分辨並練習三種基本摩擦音的音色差異', descEn: 'Distinguish and practice the tonal differences of three basic friction sounds' },
              { id: 2, titleZh: '音色細節練習', titleEn: 'Tone Detail Practice', descZh: '針對每個摩擦音進行深度音色訓練', descEn: 'Deep tonal training for each friction sound' },
              { id: 3, titleZh: '基本三音節奏套組', titleEn: 'Basic Three-Sound Rhythm Set', descZh: '將三音組合成最基礎的節奏樣式', descEn: 'Combine three sounds into the most basic rhythm pattern' },
            ],
            tipsZh: ['每個音要練到清晰才往下一步', '節奏要穩，不要急著加速', '錄音聽自己的聲音是最好的練習方式'],
            tipsEn: ['Each sound must be clear before moving on', 'Keep the rhythm steady, don\'t rush to speed up', 'Recording and listening to yourself is the best practice method'],
          },
          {
            id: 'A3-2',
            tier: 'pro',
            villageId: 'village-1',
            unitId: 'A3',
            titleZh: 'A3-2 呼吸技巧與細碎呼吸',
            titleEn: 'A3-2 Breathing Techniques & Fine Breathing',
            descZh: '深化呼吸技巧，掌握細碎呼吸的精髓，學習在口技中靈活運用吸氣音，大幅提升演奏流暢度。',
            descEn: 'Deepen breathing techniques, master fine breathing, and learn to use inhale sounds in beatbox to greatly improve performance fluency.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 25,
            difficulty: 'medium',
            xpReward: 150,
            badgeIcon: '💨',
            steps: [
              { id: 1, titleZh: '深化呼吸技巧', titleEn: 'Deepen Breathing Techniques', descZh: '了解氣息如何支撐口技表現', descEn: 'Understand how breath supports beatbox performance' },
              { id: 2, titleZh: '練習細碎呼吸', titleEn: 'Practice Fine Breathing', descZh: '學習快速且不中斷演奏的呼吸方式', descEn: 'Learn breathing methods that don\'t interrupt performance' },
              { id: 3, titleZh: '口技吸氣音的音樂性使用', titleEn: 'Musical Use of Inhale Sounds', descZh: '將吸氣聲轉化成音樂元素', descEn: 'Transform inhale sounds into musical elements' },
            ],
            tipsZh: ['呼吸是一切技巧的根本', '細碎呼吸要練到自動化', '吸氣音是口技的秘密武器'],
            tipsEn: ['Breathing is the foundation of all techniques', 'Fine breathing must become automatic', 'Inhale sounds are the secret weapon of beatbox'],
          },
          {
            id: 'A3-3',
            tier: 'pro',
            villageId: 'village-1',
            unitId: 'A3',
            titleZh: 'A3-3 節奏訓練、口技吟唱與記譜',
            titleEn: 'A3-3 Rhythm Training, Beatbox Singing & Notation',
            descZh: '全面整合節奏訓練與口技吟唱，學習口技專用的記譜方式，為進入試煉村做準備。',
            descEn: 'Comprehensively integrate rhythm training and beatbox singing. Learn beatbox-specific notation to prepare for the Trial Village.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 30,
            difficulty: 'medium',
            xpReward: 200,
            badgeIcon: '🎤',
            steps: [
              { id: 1, titleZh: '節奏訓練實戰', titleEn: 'Rhythm Training in Action', descZh: '用節拍器配合進行系統性節奏訓練', descEn: 'Systematic rhythm training with a metronome' },
              { id: 2, titleZh: '口技吟唱練習', titleEn: 'Beatbox Singing Practice', descZh: '結合旋律與口技的吟唱練習', descEn: 'Singing practice combining melody and beatbox' },
              { id: 3, titleZh: '學習口技記譜法', titleEn: 'Learn Beatbox Notation', descZh: '用文字和符號記錄口技節奏的方式', descEn: 'Use text and symbols to record beatbox rhythms' },
            ],
            tipsZh: ['節拍器是你最好的朋友', '記譜是為了讓練習更有系統', '吟唱可以幫助你記住節奏'],
            tipsEn: ['The metronome is your best friend', 'Notation makes your practice more systematic', 'Singing helps you memorize rhythms'],
          },
        ],
      },
    ],
  },

  // ─── LEVEL 2 試煉村 ───────────────────────────────
  {
    id: 'village-2',
    titleZh: 'LEVEL 2 試煉村',
    titleEn: 'LEVEL 2 Trial Village',
    descZh: '長笛的雙重聲響、Beatbox Flute 音色整合，挑戰自我的技術極限。',
    descEn: 'Dual flute sounds, Beatbox Flute tonal integration - challenge the limits of your technique.',
    tier: 'pro',
    levelRequired: 5,
    icon: '⚔️',
    units: [
      {
        id: 'B1',
        villageId: 'village-2',
        titleZh: 'Unit B1 長笛的雙重聲',
        titleEn: 'Unit B1 Dual Voice of the Flute',
        tier: 'pro',
        quests: [
          {
            id: 'B1-1',
            tier: 'pro',
            villageId: 'village-2',
            unitId: 'B1',
            titleZh: 'B1-1 長笛雙重聲的原理與入門',
            titleEn: 'B1-1 Dual Voice Principles & Introduction',
            descZh: '理解長笛雙重聲的物理原理，學習讓長笛同時發出兩種聲音的基礎技術。',
            descEn: 'Understand the physics of dual flute voice. Learn the basic technique of making the flute produce two sounds simultaneously.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 25,
            difficulty: 'hard',
            xpReward: 200,
            badgeIcon: '🎭',
            comingSoon: false,
            steps: [
              { id: 1, titleZh: '觀看雙重聲原理教學', titleEn: 'Watch Dual Voice Principles', descZh: '了解雙重聲的物理原理', descEn: 'Understand the physics behind dual voice' },
              { id: 2, titleZh: '練習喉音技巧', titleEn: 'Practice Throat Tone Technique', descZh: '用喉嚨發出低音配合長笛', descEn: 'Use throat to produce bass sounds with flute' },
              { id: 3, titleZh: '嘗試同時演奏', titleEn: 'Try Playing Simultaneously', descZh: '第一次嘗試雙重聲演奏', descEn: 'First attempt at dual voice playing' },
            ],
            tipsZh: ['這個技術需要大量練習，不要急', '喉嚨要放鬆才能發出低音', '循序漸進，一步一步來'],
            tipsEn: ['This technique requires lots of practice - don\'t rush', 'Relax your throat to produce low tones', 'Step by step, one at a time'],
          },
          {
            id: 'B1-2',
            tier: 'pro',
            villageId: 'village-2',
            unitId: 'B1',
            titleZh: 'B1-2 雙重聲的音色控制',
            titleEn: 'B1-2 Dual Voice Tonal Control',
            descZh: '深化雙重聲的音色控制能力，學習如何在演奏中靈活切換和運用雙重聲效果。',
            descEn: 'Deepen dual voice tonal control. Learn how to flexibly switch and use dual voice effects in performance.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 30,
            difficulty: 'hard',
            xpReward: 250,
            badgeIcon: '🎭',
            comingSoon: false,
            steps: [
              { id: 1, titleZh: '練習音色的動態控制', titleEn: 'Practice Dynamic Tonal Control', descZh: '控制雙重聲的強弱變化', descEn: 'Control the dynamic range of dual voice' },
              { id: 2, titleZh: '練習快速切換', titleEn: 'Practice Quick Switching', descZh: '在雙重聲與一般演奏之間快速切換', descEn: 'Quickly switch between dual voice and normal playing' },
              { id: 3, titleZh: '整合到音樂片段中', titleEn: 'Integrate into Musical Segments', descZh: '將雙重聲融入實際的音樂片段', descEn: 'Integrate dual voice into actual musical segments' },
            ],
            tipsZh: ['音色控制比速度更重要', '先練習慢速切換', '每次練習都要有意識地聆聽'],
            tipsEn: ['Tonal control is more important than speed', 'Practice slow switching first', 'Listen consciously during every practice session'],
          },
        ],
      },
      {
        id: 'B2',
        villageId: 'village-2',
        titleZh: 'Unit B2 Beatbox Flute 音色整合',
        titleEn: 'Unit B2 Beatbox Flute Tonal Integration',
        tier: 'pro',
        quests: [
          {
            id: 'B2-1',
            tier: 'pro',
            villageId: 'village-2',
            unitId: 'B2',
            titleZh: 'B2-1 三種靈魂音色',
            titleEn: 'B2-1 Three Soul Tones',
            descZh: '掌握古典、爵士、搖滾三種靈魂音色，了解每種音色的氣息、嘴型與共鳴位置差異。',
            descEn: 'Master classical, jazz, and rock - three soul tones. Understand the breath, embouchure, and resonance differences of each.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 35,
            difficulty: 'hard',
            xpReward: 300,
            badgeIcon: '🎨',
            comingSoon: false,
            steps: [
              { id: 1, titleZh: '古典音色訓練', titleEn: 'Classical Tone Training', descZh: '練習清新透明的古典長笛音色', descEn: 'Practice the clear, transparent classical flute tone' },
              { id: 2, titleZh: '爵士音色訓練', titleEn: 'Jazz Tone Training', descZh: '練習靈動慵懶的爵士音色', descEn: 'Practice the dynamic, lazy jazz tone' },
              { id: 3, titleZh: '搖滾音色訓練', titleEn: 'Rock Tone Training', descZh: '練習爆發衝撞的搖滾音色', descEn: 'Practice the explosive, powerful rock tone' },
            ],
            tipsZh: ['三種音色代表不同的氣息位置', '先聽懂差別再開始練', '不同音色需要不同的身體狀態'],
            tipsEn: ['Three tones represent different breath positions', 'Understand the difference before practicing', 'Different tones require different physical states'],
          },
          {
            id: 'B2-2',
            tier: 'pro',
            villageId: 'village-2',
            unitId: 'B2',
            titleZh: 'B2-2 Beatbox Flute 完整整合',
            titleEn: 'B2-2 Complete Beatbox Flute Integration',
            descZh: '將口技節奏、雙重聲、三種音色完整整合，演奏出真正意義上的 Beatbox Flute。',
            descEn: 'Fully integrate beatbox rhythm, dual voice, and three tones to perform true Beatbox Flute.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 40,
            difficulty: 'hard',
            xpReward: 400,
            badgeIcon: '🏆',
            comingSoon: false,
            steps: [
              { id: 1, titleZh: '整合練習計畫', titleEn: 'Integration Practice Plan', descZh: '設計一個整合所有技巧的練習流程', descEn: 'Design a practice flow integrating all techniques' },
              { id: 2, titleZh: '完整片段演奏', titleEn: 'Complete Segment Performance', descZh: '演奏一個完整的 Beatbox Flute 音樂片段', descEn: 'Perform a complete Beatbox Flute musical segment' },
              { id: 3, titleZh: '自我評估與調整', titleEn: 'Self-Assessment & Adjustment', descZh: '錄音聆聽並找出需要改進的地方', descEn: 'Record, listen, and identify areas for improvement' },
            ],
            tipsZh: ['整合是最困難也是最有成就感的步驟', '給自己多一點時間', '完成比完美更重要'],
            tipsEn: ['Integration is the hardest but most rewarding step', 'Give yourself more time', 'Done is better than perfect'],
          },
        ],
      },
      {
        id: 'B3',
        villageId: 'village-2',
        titleZh: 'Unit B3 技術之外的事',
        titleEn: 'Unit B3 Beyond Technique',
        tier: 'pro',
        quests: [
          {
            id: 'B3-1',
            tier: 'pro',
            villageId: 'village-2',
            unitId: 'B3',
            titleZh: 'B3-1 舞台心理與表演心態',
            titleEn: 'B3-1 Stage Psychology & Performance Mindset',
            descZh: '了解技術之外的表演藝術，學習如何建立舞台自信，找到屬於自己的表演語言。',
            descEn: 'Understand the performance art beyond technique. Learn to build stage confidence and find your own performance language.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 20,
            difficulty: 'medium',
            xpReward: 200,
            badgeIcon: '🎭',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '觀看舞台心理教學', titleEn: 'Watch Stage Psychology Tutorial', descZh: '學習如何管理表演緊張感', descEn: 'Learn how to manage performance anxiety' },
              { id: 2, titleZh: '建立個人表演語言', titleEn: 'Build Personal Performance Language', descZh: '找到屬於自己的舞台風格', descEn: 'Find your own stage style' },
              { id: 3, titleZh: '模擬表演練習', titleEn: 'Simulated Performance Practice', descZh: '模擬真實表演場景進行練習', descEn: 'Practice in simulated real performance scenarios' },
            ],
            tipsZh: ['技術到位後心態就是關鍵', '接受緊張，它是能量的來源', '每一次表演都是學習機會'],
            tipsEn: ['Once technique is there, mindset is key', 'Accept nervousness - it\'s a source of energy', 'Every performance is a learning opportunity'],
          },
        ],
      },
    ],
  },

  // ─── LEVEL 3 開拓村 ───────────────────────────────
  {
    id: 'village-3',
    titleZh: 'LEVEL 3 開拓村',
    titleEn: 'LEVEL 3 Pioneer Village',
    descZh: '節奏訓練、曲目開發與熟練演奏，從學習者蛻變為表演者。',
    descEn: 'Rhythm training, repertoire development, and performance mastery. Transform from learner to performer.',
    tier: 'pro',
    levelRequired: 10,
    icon: '🗺️',
    units: [
      {
        id: 'C1',
        villageId: 'village-3',
        titleZh: 'Unit C1 節奏訓練',
        titleEn: 'Unit C1 Rhythm Training',
        tier: 'pro',
        quests: [
          {
            id: 'C1-1',
            tier: 'pro',
            villageId: 'village-3',
            unitId: 'C1',
            titleZh: 'C1-1 進階節奏系統',
            titleEn: 'C1-1 Advanced Rhythm System',
            descZh: '建立進階節奏訓練系統，提升節奏的精準度與多樣性。',
            descEn: 'Build an advanced rhythm training system to improve rhythmic precision and variety.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 30,
            difficulty: 'hard',
            xpReward: 300,
            badgeIcon: '⚡',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '進階節奏練習', titleEn: 'Advanced Rhythm Practice', descZh: '學習更複雜的節奏型態', descEn: 'Learn more complex rhythm patterns' },
              { id: 2, titleZh: '多元節奏整合', titleEn: 'Diverse Rhythm Integration', descZh: '將不同節奏型態整合到演奏中', descEn: 'Integrate different rhythm patterns into playing' },
              { id: 3, titleZh: '節奏即興練習', titleEn: 'Rhythm Improvisation Practice', descZh: '在即興演奏中靈活運用節奏', descEn: 'Flexibly use rhythms in improvisation' },
            ],
            tipsZh: ['節奏訓練製作中，敬請期待', '持續練習基礎節奏', '保持期待！'],
            tipsEn: ['Rhythm training content coming soon', 'Keep practicing basic rhythms', 'Stay tuned!'],
          },
        ],
      },
      {
        id: 'C2',
        villageId: 'village-3',
        titleZh: 'Unit C2-C4 曲目開發與演奏',
        titleEn: 'Unit C2-C4 Repertoire Development & Performance',
        tier: 'pro',
        quests: [
          {
            id: 'C2-1',
            tier: 'pro',
            villageId: 'village-3',
            unitId: 'C2',
            titleZh: 'C2-1 開發你的第一首曲目',
            titleEn: 'C2-1 Develop Your First Piece',
            descZh: '從零開始開發一首屬於你的簡單 Beatbox Flute 曲目，體驗創作的樂趣。',
            descEn: 'Develop your own simple Beatbox Flute piece from scratch and experience the joy of creation.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 45,
            difficulty: 'hard',
            xpReward: 400,
            badgeIcon: '🎸',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '選擇曲目主題', titleEn: 'Choose Piece Theme', descZh: '決定你的曲目風格和主題', descEn: 'Decide the style and theme of your piece' },
              { id: 2, titleZh: '建立基本架構', titleEn: 'Build Basic Structure', descZh: '設計曲目的基本段落結構', descEn: 'Design the basic section structure of your piece' },
              { id: 3, titleZh: '完整排練', titleEn: 'Full Rehearsal', descZh: '將整首曲目排練至流暢', descEn: 'Rehearse the entire piece until it flows smoothly' },
            ],
            tipsZh: ['製作中，敬請期待', '先把基礎技術練好', '創作是最好的學習方式'],
            tipsEn: ['Content coming soon', 'Master the basics first', 'Creation is the best way to learn'],
          },
          {
            id: 'C3-1',
            tier: 'pro',
            villageId: 'village-3',
            unitId: 'C2',
            titleZh: 'C3-1 熟練表演曲目',
            titleEn: 'C3-1 Performance Repertoire Mastery',
            descZh: '將已學會的曲目磨練到表演水準，學習如何在台上完美呈現。',
            descEn: 'Polish learned repertoire to performance standard and learn how to present perfectly on stage.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 40,
            difficulty: 'legendary',
            xpReward: 500,
            badgeIcon: '🌟',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '精煉演奏細節', titleEn: 'Refine Performance Details', descZh: '精細調整每個演奏細節', descEn: 'Fine-tune every performance detail' },
              { id: 2, titleZh: '建立穩定性', titleEn: 'Build Consistency', descZh: '確保每次演奏都能穩定呈現', descEn: 'Ensure consistent performance every time' },
              { id: 3, titleZh: '嘗試新創曲目', titleEn: 'Attempt New Original Pieces', descZh: '挑戰創作更複雜的個人曲目', descEn: 'Challenge yourself to create more complex original pieces' },
            ],
            tipsZh: ['製作中，敬請期待', '繼續精進你的技術', '傳說正在等待你'],
            tipsEn: ['Content coming soon', 'Keep improving your skills', 'The legend awaits you'],
          },
        ],
      },
    ],
  },

  // ─── LEVEL 4 領域展開 ─────────────────────────────
  {
    id: 'village-4',
    titleZh: 'LEVEL 4 領域展開',
    titleEn: 'LEVEL 4 Domain Expansion',
    descZh: '社群媒體應用、創意與軟體整合，成為絕技長笛的傳說。',
    descEn: 'Social media application, creativity and software integration - become the legend of Beatbox Flute.',
    tier: 'pro',
    levelRequired: 18,
    icon: '🌟',
    units: [
      {
        id: 'D1',
        villageId: 'village-4',
        titleZh: 'Unit D1-D2 社群媒體與創意軟體',
        titleEn: 'Unit D1-D2 Social Media & Creative Software',
        tier: 'pro',
        quests: [
          {
            id: 'D1-1',
            tier: 'pro',
            villageId: 'village-4',
            unitId: 'D1',
            titleZh: 'D1-1 社群媒體實戰應用',
            titleEn: 'D1-1 Social Media Practical Application',
            descZh: '學習如何將 Beatbox Flute 演奏發布到社群媒體，建立個人品牌與粉絲群。',
            descEn: 'Learn how to publish Beatbox Flute performances on social media and build a personal brand and fan base.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 30,
            difficulty: 'hard',
            xpReward: 500,
            badgeIcon: '📱',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '學習拍攝技巧', titleEn: 'Learn Filming Techniques', descZh: '用手機拍出高質感的演奏影片', descEn: 'Shoot high-quality performance videos with a phone' },
              { id: 2, titleZh: '建立個人品牌', titleEn: 'Build Personal Brand', descZh: '設計你的社群媒體形象', descEn: 'Design your social media image' },
              { id: 3, titleZh: '發布第一支影片', titleEn: 'Publish First Video', descZh: '正式發布你的第一支 Beatbox Flute 影片', descEn: 'Officially publish your first Beatbox Flute video' },
            ],
            tipsZh: ['製作中，敬請期待', '先專注在音樂本身', '傳說就快來了'],
            tipsEn: ['Content coming soon', 'Focus on the music first', 'The legend is almost here'],
          },
          {
            id: 'D2-1',
            tier: 'pro',
            villageId: 'village-4',
            unitId: 'D1',
            titleZh: 'D2-1 創意與軟體整合',
            titleEn: 'D2-1 Creativity & Software Integration',
            descZh: '結合數位音樂軟體與 Beatbox Flute，探索更廣闊的音樂創作可能性。',
            descEn: 'Combine digital music software with Beatbox Flute to explore broader music creation possibilities.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 35,
            difficulty: 'legendary',
            xpReward: 600,
            badgeIcon: '💻',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '認識音樂製作軟體', titleEn: 'Introduction to Music Production Software', descZh: '了解常用的 DAW 與錄音軟體', descEn: 'Learn about common DAWs and recording software' },
              { id: 2, titleZh: '錄製 Beatbox Flute', titleEn: 'Record Beatbox Flute', descZh: '在軟體中錄製並編輯你的演奏', descEn: 'Record and edit your performance in software' },
              { id: 3, titleZh: '完成個人作品', titleEn: 'Complete Personal Work', descZh: '製作一首完整的個人音樂作品', descEn: 'Create a complete personal musical work' },
            ],
            tipsZh: ['製作中，敬請期待', '你已經走到這一步了！', '繼續堅持'],
            tipsEn: ['Content coming soon', 'You\'ve come this far!', 'Keep going'],
          },
        ],
      },
    ],
  },

  // ─── LEVEL MAX 神殿守護者 ─────────────────────────
  {
    id: 'village-max',
    titleZh: 'LEVEL MAX 神殿守護者',
    titleEn: 'LEVEL MAX Temple Guardian',
    descZh: '成為絕技長笛的傳說，守護長笛神殿，傳承這門獨特的藝術。',
    descEn: 'Become the legend of Beatbox Flute, guard the Flute Temple, and pass on this unique art.',
    tier: 'pro',
    levelRequired: 25,
    icon: '⛩️',
    units: [
      {
        id: 'MAX',
        villageId: 'village-max',
        titleZh: 'Unit MAX 神殿守護者',
        titleEn: 'Unit MAX Temple Guardian',
        tier: 'pro',
        quests: [
          {
            id: 'MAX-1',
            tier: 'pro',
            villageId: 'village-max',
            unitId: 'MAX',
            titleZh: 'MAX-1 成為傳說',
            titleEn: 'MAX-1 Become the Legend',
            descZh: '完成所有課程，成為絕技長笛的傳說守護者。這不是終點，而是另一段旅程的開始。',
            descEn: 'Complete all courses and become a legendary Beatbox Flute guardian. This is not the end - it\'s the beginning of another journey.',
            videoUrl: 'https://www.youtube.com/embed/coming-soon',
            duration: 60,
            difficulty: 'legendary',
            xpReward: 9999,
            badgeIcon: '👑',
            comingSoon: true,
            steps: [
              { id: 1, titleZh: '回顧整個旅程', titleEn: 'Reflect on the Entire Journey', descZh: '從 Lv.1-1 到這裡，你走了多遠', descEn: 'From Lv.1-1 to here - how far you\'ve come' },
              { id: 2, titleZh: '完成最終表演', titleEn: 'Complete Final Performance', descZh: '錄製並分享你的最終表演作品', descEn: 'Record and share your final performance piece' },
              { id: 3, titleZh: '獲得神殿守護者稱號', titleEn: 'Earn Temple Guardian Title', descZh: '正式成為絕技長笛的傳說！', descEn: 'Officially become the Beatbox Flute legend!' },
            ],
            tipsZh: ['製作中，我們在等待你的到來', '繼續你的旅程', '傳說終將誕生'],
            tipsEn: ['Content coming soon - we\'re waiting for you', 'Continue your journey', 'The legend will be born'],
          },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════

export function getAllVillages(): Village[] {
  return [FREE_QUESTS, ...PRO_VILLAGES];
}

export function getQuestById(questId: string): Quest | undefined {
  for (const village of getAllVillages()) {
    for (const unit of village.units) {
      const quest = unit.quests.find(q => q.id === questId);
      if (quest) return quest;
    }
  }
  return undefined;
}

export function getVillageByQuestId(questId: string): Village | undefined {
  for (const village of getAllVillages()) {
    for (const unit of village.units) {
      if (unit.quests.find(q => q.id === questId)) return village;
    }
  }
  return undefined;
}

export const DIFFICULTY_CONFIG = {
  easy:      { labelZh: '入門',   labelEn: 'Beginner', color: 'text-green-400',  bg: 'bg-green-500/20' },
  medium:    { labelZh: '進階',   labelEn: 'Advanced', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  hard:      { labelZh: '高難度', labelEn: 'Hard',     color: 'text-orange-400', bg: 'bg-orange-500/20' },
  legendary: { labelZh: '傳說',   labelEn: 'Legendary',color: 'text-purple-400', bg: 'bg-purple-500/20' },
};
