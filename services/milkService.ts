
import { MilkInventoryItem, MilkStorageType } from '../types';

// Storage Guidelines (in milliseconds)
// Room: 4 hours
// Fridge: 4 days
// Freezer: 6 months
const DURATIONS = {
  ROOM: 4 * 60 * 60 * 1000,
  FRIDGE: 4 * 24 * 60 * 60 * 1000,
  FREEZER: 6 * 30 * 24 * 60 * 60 * 1000, 
};

export const milkService = {
  calculateExpiry: (timestamp: number, storage: MilkStorageType): number => {
    return timestamp + DURATIONS[storage];
  },

  getStatus: (expiryTime: number): 'FRESH' | 'SOON' | 'EXPIRED' => {
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff < 0) return 'EXPIRED';
    if (diff < 24 * 60 * 60 * 1000) return 'SOON'; // Less than 24h left
    return 'FRESH';
  },

  getTimeRemaining: (expiryTime: number): string => {
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 60) return `${Math.floor(days / 30)} months`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return '< 1 hour';
  },

  createItemsFromPump: (
    totalVolumeMl: number, 
    bagCount: number, 
    storage: MilkStorageType, 
    timestamp: number,
    sourceLogId?: string
  ): MilkInventoryItem[] => {
    const items: MilkInventoryItem[] = [];
    const volumePerBag = totalVolumeMl / bagCount;
    const expiryTime = timestamp + DURATIONS[storage];

    for (let i = 0; i < bagCount; i++) {
      items.push({
        id: crypto.randomUUID(),
        volumeMl: volumePerBag,
        timestamp,
        expiryTime,
        storage,
        isConsumed: false,
        sourceLogId
      });
    }
    return items;
  }
};
