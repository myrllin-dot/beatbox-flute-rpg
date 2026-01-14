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
    'nav.leaderboard': '排行榜',
    'nav.checkin': '每日簽到',
    'nav.community': '學習社群',
    
    // Home page
    'home.title': '絕技長笛 RPG',
    'home.subtitle': '任務解鎖遊戲',
    'home.description': '踏入 Beatbox Flute 的魔法世界，完成任務讓角色升級、解鎖黑笛技能！',
    'home.start': '開始冒險',
    'home.features.rpg': 'RPG式進階關卡',
    'home.features.skills': '每單元都有技能與任務',
    'home.features.practice': '鼓勵反覆修練再出發',
    'home.exploreMap': '探索村莊地圖',
    
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
    'village.description': '選擇你要前往的村莊，完成任務以解鎖下一個區域',
    'village.progress': '任務進度',
    
    // Levels
    'level.1': 'Lv.1',
    'level.2': 'Lv.2',
    'level.3': 'Lv.3',
    'level.max': 'Lv.MAX',
    'level.apprentice': '長笛見習生',
    
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
    'quest.description': '在這個頁面開始學習你的第一項技能吧！完成任務以獲得徽章和解鎖新關卡。',
    'quest.earnExp': '完成可獲得經驗值',
    'quest.steps': '任務步驟',
    'quest.totalProgress': '總進度',
    'quest.tips': '練習小提示',
    'quest.uploadSection': '上傳練習成果',
    'quest.uploadDescription': '錄製你的練習影片並上傳，導師會給予回饋和評分。',
    'quest.congratulations': '恭喜完成任務！',
    'quest.allStepsComplete': '你已完成所有步驟，可以提交任務了。',
    'quest.submit': '提交任務',
    'quest.notFound': '任務不存在',
    'quest.backToList': '返回任務列表',
    'quest.video': '教學影片',
    'quest.fullscreen': '全螢幕觀看',
    
    // Quest Details
    'quest.1-1.title': '基礎氣息控制',
    'quest.1-1.description': '學習穩定的氣息控制，這是所有長笛技巧的基礎。掌握正確的呼吸方式和氣流控制。透過本課程，你將學會如何運用腹式呼吸來產生穩定且持久的氣流。',
    'quest.1-1.step1': '觀看教學影片',
    'quest.1-1.step1.desc': '完整觀看氣息控制教學影片',
    'quest.1-1.step2': '腹式呼吸練習',
    'quest.1-1.step2.desc': '練習腹式呼吸 10 分鐘',
    'quest.1-1.step3': '長音練習',
    'quest.1-1.step3.desc': '嘗試吹奏穩定的長音 30 秒',
    'quest.1-1.step4': '上傳練習影片',
    'quest.1-1.step4.desc': '錄製並上傳你的練習成果',
    'quest.1-1.tip1': '放鬆肩膀，讓氣息自然流動',
    'quest.1-1.tip2': '想像氣息從腹部緩緩上升',
    'quest.1-1.tip3': '保持嘴型穩定，不要過度用力',
    'quest.1-1.tip4': '每天練習 15-20 分鐘效果最佳',
    
    'quest.1-2.title': '音色穩定訓練',
    'quest.1-2.description': '透過持續的長音練習，建立穩定且飽滿的音色。學習如何保持音準和音質。',
    'quest.1-2.step1': '觀看教學影片',
    'quest.1-2.step1.desc': '完整觀看音色訓練教學影片',
    'quest.1-2.step2': '音階練習',
    'quest.1-2.step2.desc': '練習基礎音階',
    'quest.1-2.step3': '長音持續練習',
    'quest.1-2.step3.desc': '每個音保持 10 秒',
    'quest.1-2.step4': '上傳練習影片',
    'quest.1-2.step4.desc': '錄製並上傳你的練習成果',
    'quest.1-2.tip1': '注意聆聽自己的音色',
    'quest.1-2.tip2': '使用調音器確認音準',
    'quest.1-2.tip3': '嘗試不同的氣息強度',
    
    'quest.1-3.title': '節奏感培養',
    'quest.1-3.description': '使用節拍器進行節奏訓練，建立穩定的內在節奏感。從簡單的四拍開始。',
    'quest.1-3.step1': '觀看教學影片',
    'quest.1-3.step1.desc': '完整觀看節奏訓練教學影片',
    'quest.1-3.step2': '節拍器練習',
    'quest.1-3.step2.desc': '跟著節拍器練習基本節奏',
    'quest.1-3.step3': '變速練習',
    'quest.1-3.step3.desc': '嘗試不同速度的節奏',
    'quest.1-3.step4': '上傳練習影片',
    'quest.1-3.step4.desc': '錄製並上傳你的練習成果',
    'quest.1-3.tip1': '從慢速開始，逐漸加快',
    'quest.1-3.tip2': '用腳打拍子幫助保持節奏',
    'quest.1-3.tip3': '專注於穩定性而非速度',
    
    'quest.1-4.title': '基礎 Beatbox 節奏',
    'quest.1-4.description': '學習第一個 Beatbox 節奏型態，結合長笛演奏創造獨特的音樂效果。',
    
    'quest.1-5.title': '新手村畢業考核',
    'quest.1-5.description': '綜合前面所學的技巧，完成畢業考核任務。通過後可獲得黑笛徽章！',
    
    'quest.2-1.title': '雙重聲入門',
    'quest.2-1.description': '學習同時發出兩種聲音的技巧，這是 Beatbox Flute 的核心技術。',
    
    'quest.2-2.title': '藍調音階練習',
    'quest.2-2.description': '掌握藍調音階的特殊音程，為即興演奏打下基礎。',
    
    'quest.2-3.title': '雙重聲 + 藍調組合',
    'quest.2-3.description': '將雙重聲技巧與藍調旋律結合，創造獨特的音樂風格。',
    
    // Difficulty
    'difficulty.easy': '簡單',
    'difficulty.medium': '中等',
    'difficulty.hard': '困難',
    
    // Skills
    'skill.breathControl': '氣息控制',
    'skill.basicTone': '基礎音色',
    'skill.toneControl': '音色控制',
    'skill.longTone': '長音練習',
    'skill.rhythm': '節奏感',
    'skill.metronome': '節拍器使用',
    'skill.beatboxBasic': 'Beatbox 基礎',
    'skill.rhythmCombo': '節奏組合',
    'skill.comprehensive': '綜合技巧',
    'skill.exam': '考核',
    'skill.dualVoice': '雙重聲',
    'skill.advanced': '進階技巧',
    'skill.bluesScale': '藍調音階',
    'skill.interval': '音程',
    'skill.combo': '組合技巧',
    'skill.improv': '即興',
    'skill.toneStability': '音色穩定',
    'skill.improvisation': '即興演奏',
    'skill.performance': '表演技巧',
    'skill.bluesMelody': '藍調旋律',
    
    // Badges
    'badge.black': '黑笛徽章',
    'badge.silver': '銀笛徽章',
    'badge.gold': '金笛徽章',
    'badge.master': '大師徽章',
    'badge.firstStep': '踏出第一步',
    'badge.breathMaster': '氣息大師',
    'badge.collection': '徽章收藏',
    'badge.myBadges': '我的徽章',
    
    // Progress
    'progress.title': '冒險進度',
    'progress.description': '追蹤你的學習進度，收集徽章，提升技能等級',
    'progress.level': '目前等級',
    'progress.badges': '獲得徽章',
    'progress.quests': '完成任務',
    'progress.skills': '解鎖技能',
    'progress.practiceHours': '練習時數',
    'progress.streak': '連續練習',
    'progress.days': '天',
    'progress.expNeeded': '再獲得 {exp} 經驗值即可升級',
    'progress.skillTree': '技能樹',
    'progress.streakTitle': '連續練習 {days} 天！',
    'progress.streakRecord': '你的最長連續練習紀錄是 {days} 天，繼續保持！',
    
    // Profile
    'profile.title': '冒險者資料',
    'profile.name': '冒險者名稱',
    'profile.joined': '加入日期',
    'profile.achievements': '成就',
    'profile.adventurer': '冒險者',
    'profile.joinedOn': '加入於',
    'profile.settings': '設定',
    'profile.logout': '登出',
    'profile.totalExp': '總經驗值',
    'profile.recentActivity': '最近活動',
    'profile.quickSettings': '快速設定',
    'profile.notifications': '通知設定',
    'profile.notificationsDesc': '管理推播通知',
    'profile.privacy': '隱私設定',
    'profile.privacyDesc': '管理個人資料可見度',
    'profile.account': '帳號設定',
    'profile.accountDesc': '修改密碼和帳號資訊',
    
    // Actions
    'action.start': '開始任務',
    'action.continue': '繼續',
    'action.complete': '完成',
    'action.upload': '上傳影片',
    'action.view': '查看',
    'action.back': '返回',
    'action.review': '複習',
    
    // Status
    'status.inProgress': '進行中',
    'status.completed': '已完成',
    'status.locked': '未解鎖',
    'status.available': '可開始',
    'status.hasVideo': '含教學影片',
    
    // Language
    'language.switch': '切換語言',
    'language.zh': '中文',
    'language.en': 'English',
    
    // Metronome
    'metronome.title': '節拍器',
    'metronome.start': '開始',
    'metronome.stop': '停止',
    'metronome.beats': '拍數',
    'metronome.bpm': 'BPM',
    
    // Recorder
    'recorder.title': '錄音練習',
    'recorder.tapToRecord': '點擊麥克風開始錄音',
    'recorder.recording': '錄音',
    'recorder.recentRecordings': '最近錄音',
    'recorder.saved': '錄音已儲存！',
    'recorder.deleted': '錄音已刪除',
    'recorder.downloaded': '錄音已下載',
    'recorder.micError': '無法存取麥克風，請檢查權限設定',
    'recorder.tip': '錄製你的練習並回放，可以幫助你發現需要改進的地方。',
    
    // Practice Tools
    'tools.title': '練習工具',
    'tools.metronome': '節拍器',
    'tools.recorder': '錄音機',
    
    // Activity
    'activity.completedQuest': '完成任務：',
    'activity.earnedBadge': '獲得徽章：',
    'activity.joined': '加入絕技長笛 RPG',
    
    // Footer
    'footer.copyright': '© 2024 Beatbox Flute RPG. All rights reserved.',
    
    // Misc
    'misc.step': '步驟',
    'misc.minutes': '分鐘',
    'misc.exp': 'EXP',
    
    // Settings
    'settings.notifications': '通知設定',
    'settings.notificationsDesc': '管理推播通知',
    'settings.privacy': '隱私設定',
    'settings.privacyDesc': '管理個人資料可見度',
    'settings.account': '帳號設定',
    'settings.accountDesc': '修改密碼和帳號資訊',
    
    // Toast messages
    'toast.editProfile': '個人資料編輯功能即將推出！',
    'toast.logout': '登出功能即將推出！',
    'toast.comingSoon': '此功能即將推出！',
    
    // Activity
    'activity.quest1': '完成任務：基礎氣息控制',
    'activity.badge1': '獲得徽章：氣息大師',
    'activity.quest2': '完成任務：音色穩定訓練',
    'activity.badge2': '獲得徽章：踏出第一步',
    'activity.join': '加入絕技長笛 RPG',
    
    // Profile additional
    'profile.myBadges': '我的徽章',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.village': 'Village',
    'nav.quests': 'Quests',
    'nav.progress': 'Progress',
    'nav.profile': 'Profile',
    'nav.leaderboard': 'Leaderboard',
    'nav.checkin': 'Check-In',
    'nav.community': 'Community',
    
    // Home page
    'home.title': 'Beatbox Flute RPG',
    'home.subtitle': 'Quest Unlock Game',
    'home.description': 'Enter the magical world of Beatbox Flute, complete quests to level up and unlock Black Flute skills!',
    'home.start': 'Start Adventure',
    'home.features.rpg': 'RPG-style Progression',
    'home.features.skills': 'Skills & Quests in Each Unit',
    'home.features.practice': 'Practice Makes Perfect',
    'home.exploreMap': 'Explore Village Map',
    
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
    'village.description': 'Choose your destination village and complete quests to unlock the next area',
    'village.progress': 'Quest Progress',
    
    // Levels
    'level.1': 'Lv.1',
    'level.2': 'Lv.2',
    'level.3': 'Lv.3',
    'level.max': 'Lv.MAX',
    'level.apprentice': 'Flute Apprentice',
    
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
    'quest.description': 'Start learning your first skill on this page! Complete quests to earn badges and unlock new levels.',
    'quest.earnExp': 'Earn experience upon completion',
    'quest.steps': 'Quest Steps',
    'quest.totalProgress': 'Total Progress',
    'quest.tips': 'Practice Tips',
    'quest.uploadSection': 'Upload Your Practice',
    'quest.uploadDescription': 'Record and upload your practice video for mentor feedback and evaluation.',
    'quest.congratulations': 'Congratulations!',
    'quest.allStepsComplete': 'You have completed all steps and can submit the quest.',
    'quest.submit': 'Submit Quest',
    'quest.notFound': 'Quest not found',
    'quest.backToList': 'Back to Quest List',
    'quest.video': 'Tutorial Video',
    'quest.fullscreen': 'Fullscreen',
    
    // Quest Details
    'quest.1-1.title': 'Basic Breath Control',
    'quest.1-1.description': 'Learn stable breath control, the foundation of all flute techniques. Master proper breathing methods and airflow control. Through this lesson, you will learn how to use diaphragmatic breathing to produce stable and sustained airflow.',
    'quest.1-1.step1': 'Watch Tutorial Video',
    'quest.1-1.step1.desc': 'Watch the complete breath control tutorial',
    'quest.1-1.step2': 'Diaphragmatic Breathing Practice',
    'quest.1-1.step2.desc': 'Practice diaphragmatic breathing for 10 minutes',
    'quest.1-1.step3': 'Long Tone Practice',
    'quest.1-1.step3.desc': 'Try to play a stable long tone for 30 seconds',
    'quest.1-1.step4': 'Upload Practice Video',
    'quest.1-1.step4.desc': 'Record and upload your practice results',
    'quest.1-1.tip1': 'Relax your shoulders and let the breath flow naturally',
    'quest.1-1.tip2': 'Imagine the breath rising slowly from your abdomen',
    'quest.1-1.tip3': 'Keep your embouchure stable without excessive force',
    'quest.1-1.tip4': 'Practice 15-20 minutes daily for best results',
    
    'quest.1-2.title': 'Tone Stability Training',
    'quest.1-2.description': 'Build a stable and full tone through continuous long tone practice. Learn how to maintain pitch and tone quality.',
    'quest.1-2.step1': 'Watch Tutorial Video',
    'quest.1-2.step1.desc': 'Watch the complete tone training tutorial',
    'quest.1-2.step2': 'Scale Practice',
    'quest.1-2.step2.desc': 'Practice basic scales',
    'quest.1-2.step3': 'Sustained Long Tone Practice',
    'quest.1-2.step3.desc': 'Hold each note for 10 seconds',
    'quest.1-2.step4': 'Upload Practice Video',
    'quest.1-2.step4.desc': 'Record and upload your practice results',
    'quest.1-2.tip1': 'Listen carefully to your own tone',
    'quest.1-2.tip2': 'Use a tuner to verify pitch accuracy',
    'quest.1-2.tip3': 'Experiment with different breath intensities',
    
    'quest.1-3.title': 'Rhythm Development',
    'quest.1-3.description': 'Use a metronome for rhythm training to build a stable internal sense of rhythm. Start with simple 4/4 time.',
    'quest.1-3.step1': 'Watch Tutorial Video',
    'quest.1-3.step1.desc': 'Watch the complete rhythm training tutorial',
    'quest.1-3.step2': 'Metronome Practice',
    'quest.1-3.step2.desc': 'Practice basic rhythms with the metronome',
    'quest.1-3.step3': 'Tempo Variation Practice',
    'quest.1-3.step3.desc': 'Try different tempos',
    'quest.1-3.step4': 'Upload Practice Video',
    'quest.1-3.step4.desc': 'Record and upload your practice results',
    'quest.1-3.tip1': 'Start slow and gradually increase speed',
    'quest.1-3.tip2': 'Tap your foot to help maintain rhythm',
    'quest.1-3.tip3': 'Focus on stability rather than speed',
    
    'quest.1-4.title': 'Basic Beatbox Rhythm',
    'quest.1-4.description': 'Learn your first Beatbox rhythm pattern and combine it with flute playing to create unique musical effects.',
    
    'quest.1-5.title': 'Beginner Village Graduation',
    'quest.1-5.description': 'Combine all the skills you have learned to complete the graduation exam. Pass to earn the Black Flute badge!',
    
    'quest.2-1.title': 'Introduction to Dual Voice',
    'quest.2-1.description': 'Learn the technique of producing two sounds simultaneously, the core skill of Beatbox Flute.',
    
    'quest.2-2.title': 'Blues Scale Practice',
    'quest.2-2.description': 'Master the special intervals of the blues scale to lay the foundation for improvisation.',
    
    'quest.2-3.title': 'Dual Voice + Blues Combo',
    'quest.2-3.description': 'Combine dual voice technique with blues melody to create a unique musical style.',
    
    // Difficulty
    'difficulty.easy': 'Easy',
    'difficulty.medium': 'Medium',
    'difficulty.hard': 'Hard',
    
    // Skills
    'skill.breathControl': 'Breath Control',
    'skill.basicTone': 'Basic Tone',
    'skill.toneControl': 'Tone Control',
    'skill.longTone': 'Long Tone Practice',
    'skill.rhythm': 'Rhythm',
    'skill.metronome': 'Metronome Use',
    'skill.beatboxBasic': 'Beatbox Basics',
    'skill.rhythmCombo': 'Rhythm Combo',
    'skill.comprehensive': 'Comprehensive Skills',
    'skill.exam': 'Exam',
    'skill.dualVoice': 'Dual Voice',
    'skill.advanced': 'Advanced Techniques',
    'skill.bluesScale': 'Blues Scale',
    'skill.interval': 'Intervals',
    'skill.combo': 'Combo Techniques',
    'skill.improv': 'Improvisation',
    'skill.toneStability': 'Tone Stability',
    'skill.improvisation': 'Improvisation',
    'skill.performance': 'Performance Skills',
    'skill.bluesMelody': 'Blues Melody',
    
    // Badges
    'badge.black': 'Black Flute Badge',
    'badge.silver': 'Silver Flute Badge',
    'badge.gold': 'Gold Flute Badge',
    'badge.master': 'Master Badge',
    'badge.firstStep': 'First Step',
    'badge.breathMaster': 'Breath Master',
    'badge.collection': 'Badge Collection',
    'badge.myBadges': 'My Badges',
    
    // Progress
    'progress.title': 'Adventure Progress',
    'progress.description': 'Track your learning progress, collect badges, and level up your skills',
    'progress.level': 'Current Level',
    'progress.badges': 'Badges Earned',
    'progress.quests': 'Quests Completed',
    'progress.skills': 'Skills Unlocked',
    'progress.practiceHours': 'Practice Hours',
    'progress.streak': 'Practice Streak',
    'progress.days': 'days',
    'progress.expNeeded': 'Earn {exp} more EXP to level up',
    'progress.skillTree': 'Skill Tree',
    'progress.streakTitle': '{days} Day Streak!',
    'progress.streakRecord': 'Your longest streak is {days} days. Keep it up!',
    
    // Profile
    'profile.title': 'Adventurer Profile',
    'profile.name': 'Adventurer Name',
    'profile.joined': 'Joined Date',
    'profile.achievements': 'Achievements',
    'profile.adventurer': 'Adventurer',
    'profile.joinedOn': 'Joined on',
    'profile.settings': 'Settings',
    'profile.logout': 'Logout',
    'profile.totalExp': 'Total EXP',
    'profile.recentActivity': 'Recent Activity',
    'profile.quickSettings': 'Quick Settings',
    'profile.notifications': 'Notifications',
    'profile.notificationsDesc': 'Manage push notifications',
    'profile.privacy': 'Privacy',
    'profile.privacyDesc': 'Manage profile visibility',
    'profile.account': 'Account',
    'profile.accountDesc': 'Change password and account info',
    
    // Actions
    'action.start': 'Start Quest',
    'action.continue': 'Continue',
    'action.complete': 'Complete',
    'action.upload': 'Upload Video',
    'action.view': 'View',
    'action.back': 'Back',
    'action.review': 'Review',
    
    // Status
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.locked': 'Locked',
    'status.available': 'Available',
    'status.hasVideo': 'Has Tutorial Video',
    
    // Language
    'language.switch': 'Switch Language',
    'language.zh': '中文',
    'language.en': 'English',
    
    // Metronome
    'metronome.title': 'Metronome',
    'metronome.start': 'Start',
    'metronome.stop': 'Stop',
    'metronome.beats': 'Beats',
    'metronome.bpm': 'BPM',
    
    // Recorder
    'recorder.title': 'Practice Recorder',
    'recorder.tapToRecord': 'Tap the microphone to start recording',
    'recorder.recording': 'Recording',
    'recorder.recentRecordings': 'Recent Recordings',
    'recorder.saved': 'Recording saved!',
    'recorder.deleted': 'Recording deleted',
    'recorder.downloaded': 'Recording downloaded',
    'recorder.micError': 'Cannot access microphone. Please check permissions.',
    'recorder.tip': 'Record your practice and play it back to identify areas for improvement.',
    
    // Practice Tools
    'tools.title': 'Practice Tools',
    'tools.metronome': 'Metronome',
    'tools.recorder': 'Recorder',
    
    // Activity
    'activity.completedQuest': 'Completed quest: ',
    'activity.earnedBadge': 'Earned badge: ',
    'activity.joined': 'Joined Beatbox Flute RPG',
    
    // Footer
    'footer.copyright': '© 2024 Beatbox Flute RPG. All rights reserved.',
    
    // Misc
    'misc.step': 'Step',
    'misc.minutes': 'min',
    'misc.exp': 'EXP',
    
    // Settings
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Manage push notifications',
    'settings.privacy': 'Privacy',
    'settings.privacyDesc': 'Manage profile visibility',
    'settings.account': 'Account',
    'settings.accountDesc': 'Change password and account info',
    
    // Toast messages
    'toast.editProfile': 'Profile editing coming soon!',
    'toast.logout': 'Logout coming soon!',
    'toast.comingSoon': 'This feature is coming soon!',
    
    // Activity
    'activity.quest1': 'Completed quest: Basic Breath Control',
    'activity.badge1': 'Earned badge: Breath Master',
    'activity.quest2': 'Completed quest: Tone Stability Training',
    'activity.badge2': 'Earned badge: First Step',
    'activity.join': 'Joined Beatbox Flute RPG',
    
    // Profile additional
    'profile.myBadges': 'My Badges',
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
