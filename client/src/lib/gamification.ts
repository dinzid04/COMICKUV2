// XP thresholds
export const XP_PER_CHAPTER = 50;

// Level calculation: Level = Math.floor(Math.sqrt(XP / 100)) + 1
// XP = 100 * (Level - 1)^2
export const calculateLevel = (xp: number) => {
  if (xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const calculateNextLevelXp = (currentLevel: number) => {
  return 100 * Math.pow(currentLevel, 2);
};

export const calculateProgress = (xp: number, currentLevel: number) => {
  const currentLevelBaseXp = 100 * Math.pow(currentLevel - 1, 2);
  const nextLevelXp = calculateNextLevelXp(currentLevel);
  const xpInLevel = xp - currentLevelBaseXp;
  const levelSpan = nextLevelXp - currentLevelBaseXp;

  if (levelSpan <= 0) return 100; // Cap at max
  return Math.min(100, Math.max(0, (xpInLevel / levelSpan) * 100));
};


export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or image url
  condition: (user: any) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'novice_reader',
    name: 'Novice Reader',
    description: 'Read your first chapter.',
    icon: 'BookOpen',
    condition: (user) => (user.chaptersRead || 0) >= 1
  },
  {
    id: 'avid_reader',
    name: 'Avid Reader',
    description: 'Read 100 chapters.',
    icon: 'Library',
    condition: (user) => (user.chaptersRead || 0) >= 100
  },
  {
    id: 'expert_reader',
    name: 'Expert Reader',
    description: 'Read 500 chapters.',
    icon: 'Trophy',
    condition: (user) => (user.chaptersRead || 0) >= 500
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Reached Level 10.',
    icon: 'Crown',
    condition: (user) => calculateLevel(user.xp || 0) >= 10
  }
];

export const getEarnedBadges = (userData: any): Badge[] => {
  return BADGES.filter(badge => badge.condition(userData));
};
