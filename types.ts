
export enum FeedingType {
  BREAST_LEFT = 'BREAST_LEFT',
  BREAST_RIGHT = 'BREAST_RIGHT',
  BOTTLE = 'BOTTLE',
  SOLIDS = 'SOLIDS',
  SLEEP = 'SLEEP',
  PUMP = 'PUMP'
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  isGuest?: boolean;
  // New Fields
  role?: 'MAMA' | 'PAPA' | 'GUARDIAN' | 'NANNY' | 'OTHER';
  colorTheme?: 'rose' | 'blue' | 'indigo' | 'emerald' | 'amber';
}

export type MilkStorageType = 'ROOM' | 'FRIDGE' | 'FREEZER';

export interface MilkInventoryItem {
  id: string;
  volumeMl: number;
  timestamp: number; // When it was pumped
  expiryTime: number;
  storage: MilkStorageType;
  isConsumed: boolean;
  notes?: string;
  sourceLogId?: string; // Link back to the Pumping Log that created this item
}

export interface FeedingLog {
  id: string;
  type: FeedingType;
  startTime: number; // Timestamp
  endTime?: number; // Timestamp (for breast/sleep)
  durationSeconds?: number; // (for breast/sleep)
  amountMl?: number; // (for bottle/pump)
  notes?: string;
  foodItem?: string; // (for solids)
  
  // Pumping specific
  bagCount?: number;
  storage?: MilkStorageType;
  
  // Bottle specific (if from stash)
  inventoryItemId?: string;
}

export interface GrowthLog {
  id: string;
  date: number;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
}

export interface ChartDataPoint {
  date: string;
  totalDuration?: number;
  totalAmount?: number;
  count: number;
}

// --- BABY IDENTITY TYPES ---

export interface BabyAvatarConfig {
  colorTheme: 'rose' | 'blue' | 'green' | 'yellow' | 'neutral';
  mood: 'happy' | 'sleepy' | 'curious' | 'calm';
}

export interface BabyProfile {
  name: string;
  birthDate: string; // ISO Date string YYYY-MM-DD
  gender: 'BOY' | 'GIRL' | 'NEUTRAL';
  volumeUnit: 'ML' | 'OZ';
  weightUnit?: 'KG' | 'LB';
  heightUnit?: 'CM' | 'IN';
  age?: string;
  reminderIntervalMinutes?: number;
  remindersEnabled?: boolean;
  
  // Identity Fields
  avatarConfig?: BabyAvatarConfig;
  personalityTags?: string[]; // IDs of selected personalities
}

export interface AppState {
  logs: FeedingLog[];
  growthLogs: GrowthLog[];
  activeTimer: {
    type: FeedingType.BREAST_LEFT | FeedingType.BREAST_RIGHT | FeedingType.SLEEP;
    startTime: number;
  } | null;
  milkInventory: MilkInventoryItem[];
}
