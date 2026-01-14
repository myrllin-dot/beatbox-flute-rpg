import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Navigation
    'nav.home': '首頁',
    'nav.village': '村莊',
    'nav.quests': '任務說明',
    'nav.progress': '進度追蹤',
    'nav.profile': '個人資料',
    
    // Home page
    'home.title': '絕技長笛 RPG',
    'home.subtitle': '任務解鎖遊戲',
    'home.description': '踏入 Beatbox Flute 的魔法世界，完成任務讓角色升級、解鎖黑笛技能！',
    'home.start': '開始冒險',
    'home.features.rpg': 'RPG式進階關卡',
    'home.features.skills': '每單元都有技能與任務',
    'home.features.practice': '鼓勵反覆修練再出發',
    
    // Story
    'story.title': '故事開始了',
    'story.intro': '傳說，黑笛的旋律擁有喚醒沉睡力量的神奇魔力。',
    'story.awakening': '在長笛森林的邊緣，你從沉睡中甦醒，發現手中正握著閃閃發光的黑笛。',
    'story.adventure': '用你的勇敢與智慧面對未知的冒險吧！',
    'story.newbie': '你剛剛誕生在「新手村」──一個所有長笛魔法師的起點村落。',
    'story.flute': '你手上的是剛覺醒的黑笛，沉睡已久的音符靈魂正等待你喚醒！',
    
    // Villages
    'village.beginner': '新手村',
    'village.trial': '試煉村',
    'village.explorer': '開拓村',
    'village.master': '領域展開',
    'village.locked': '尚未解鎖',
    'village.current': '目前位置',
    'village.completed': '已完成',
    
    // Levels
    'level.1': 'Lv.1',
    'level.2': 'Lv.2',
    'level.3': 'Lv.3',
    'level.max': 'Lv.MAX',
    
    // Quests
    'quest.beginner.title': '新手村任務',
    'quest.beginner.goal': '穩定控制氣息、音色與節奏感，初步建立音符肌肉記憶。',
    'quest.beginner.reward': '完成任務並通過審核考驗，獲得公會導師的認證即可獲得一枚「黑笛」徽章！',
    'quest.trial.title': '試煉村任務',
    'quest.trial.subtitle': '雙重聲的試煉',
    'quest.trial.goal': '雙重聲＋藍調旋律',
    'quest.trial.reward': '完成所有任務後，角色可從白笛升級為銀笛，並解鎖開拓村關卡。',
    'quest.explorer.title': '開拓村任務',
    'quest.master.title': '領域展開',
    
    // Badges
    'badge.black': '黑笛徽章',
    'badge.silver': '銀笛徽章',
    'badge.gold': '金笛徽章',
    'badge.master': '大師徽章',
    
    // Progress
    'progress.title': '冒險進度',
    'progress.level': '目前等級',
    'progress.badges': '獲得徽章',
    'progress.quests': '完成任務',
    'progress.skills': '解鎖技能',
    
    // Profile
    'profile.title': '冒險者資料',
    'profile.name': '冒險者名稱',
    'profile.joined': '加入日期',
    'profile.achievements': '成就',
    
    // Actions
    'action.start': '開始任務',
    'action.continue': '繼續',
    'action.complete': '完成',
    'action.upload': '上傳影片',
    'action.view': '查看',
    'action.back': '返回',
    
    // Status
    'status.inProgress': '進行中',
    'status.completed': '已完成',
    'status.locked': '未解鎖',
    'status.available': '可開始',
    
    // Language
    'language.switch': '切換語言',
    'language.zh': '中文',
    'language.en': 'English',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.village': 'Village',
    'nav.quests': 'Quests',
    'nav.progress': 'Progress',
    'nav.profile': 'Profile',
    
    // Home page
    'home.title': 'Beatbox Flute RPG',
    'home.subtitle': 'Quest Unlock Game',
    'home.description': 'Enter the magical world of Beatbox Flute, complete quests to level up and unlock Black Flute skills!',
    'home.start': 'Start Adventure',
    'home.features.rpg': 'RPG-style Progression',
    'home.features.skills': 'Skills & Quests in Each Unit',
    'home.features.practice': 'Practice Makes Perfect',
    
    // Story
    'story.title': 'The Story Begins',
    'story.intro': 'Legend has it that the melody of the Black Flute possesses the magical power to awaken dormant forces.',
    'story.awakening': 'At the edge of the Flute Forest, you awaken from slumber to find a glowing Black Flute in your hands.',
    'story.adventure': 'Face the unknown adventure with your courage and wisdom!',
    'story.newbie': 'You have just been born in the "Beginner Village" - the starting point for all Flute Mages.',
    'story.flute': 'The Black Flute in your hands has just awakened, and the long-dormant note spirits await your call!',
    
    // Villages
    'village.beginner': 'Beginner Village',
    'village.trial': 'Trial Village',
    'village.explorer': 'Explorer Village',
    'village.master': 'Domain Expansion',
    'village.locked': 'Locked',
    'village.current': 'Current Location',
    'village.completed': 'Completed',
    
    // Levels
    'level.1': 'Lv.1',
    'level.2': 'Lv.2',
    'level.3': 'Lv.3',
    'level.max': 'Lv.MAX',
    
    // Quests
    'quest.beginner.title': 'Beginner Village Quest',
    'quest.beginner.goal': 'Master breath control, tone quality, and rhythm to build initial muscle memory.',
    'quest.beginner.reward': 'Complete the quest and pass the review to earn a "Black Flute" badge from the Guild Master!',
    'quest.trial.title': 'Trial Village Quest',
    'quest.trial.subtitle': 'The Trial of Dual Voice',
    'quest.trial.goal': 'Dual Voice + Blues Melody',
    'quest.trial.reward': 'After completing all quests, upgrade from White Flute to Silver Flute and unlock Explorer Village.',
    'quest.explorer.title': 'Explorer Village Quest',
    'quest.master.title': 'Domain Expansion',
    
    // Badges
    'badge.black': 'Black Flute Badge',
    'badge.silver': 'Silver Flute Badge',
    'badge.gold': 'Gold Flute Badge',
    'badge.master': 'Master Badge',
    
    // Progress
    'progress.title': 'Adventure Progress',
    'progress.level': 'Current Level',
    'progress.badges': 'Badges Earned',
    'progress.quests': 'Quests Completed',
    'progress.skills': 'Skills Unlocked',
    
    // Profile
    'profile.title': 'Adventurer Profile',
    'profile.name': 'Adventurer Name',
    'profile.joined': 'Joined Date',
    'profile.achievements': 'Achievements',
    
    // Actions
    'action.start': 'Start Quest',
    'action.continue': 'Continue',
    'action.complete': 'Complete',
    'action.upload': 'Upload Video',
    'action.view': 'View',
    'action.back': 'Back',
    
    // Status
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.locked': 'Locked',
    'status.available': 'Available',
    
    // Language
    'language.switch': 'Switch Language',
    'language.zh': '中文',
    'language.en': 'English',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
