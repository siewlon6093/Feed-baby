
import { FeedingLog, GrowthLog, BabyProfile, MilkInventoryItem } from '../types';

// This service abstracts data persistence. 
// It partitions data by User ID to simulate cloud storage.

const getStorageKey = (userId: string, key: string) => `cloud_${userId}_${key}`;

// Keys for anonymous data (before login)
const ANON_KEYS = {
    logs: 'feedingLogs',
    growth: 'growthLogs',
    timer: 'activeTimer',
    profile: 'babyProfile',
    inventory: 'milkInventory'
};

export const storageService = {
    // --- Load Data ---
    async loadUserData(userId: string) {
        // Simulate network latency
        // await new Promise(resolve => setTimeout(resolve, 500));

        const logs = localStorage.getItem(getStorageKey(userId, 'logs'));
        const growth = localStorage.getItem(getStorageKey(userId, 'growth'));
        const timer = localStorage.getItem(getStorageKey(userId, 'timer'));
        const profile = localStorage.getItem(getStorageKey(userId, 'profile'));
        const inventory = localStorage.getItem(getStorageKey(userId, 'inventory'));

        return {
            logs: logs ? JSON.parse(logs) as FeedingLog[] : [],
            growthLogs: growth ? JSON.parse(growth) as GrowthLog[] : [],
            activeTimer: timer ? JSON.parse(timer) : null,
            babyProfile: profile ? JSON.parse(profile) as BabyProfile : null,
            milkInventory: inventory ? JSON.parse(inventory) as MilkInventoryItem[] : [],
        };
    },

    // --- Save Data ---
    saveLogs(userId: string, logs: FeedingLog[]) {
        localStorage.setItem(getStorageKey(userId, 'logs'), JSON.stringify(logs));
    },

    saveGrowthLogs(userId: string, logs: GrowthLog[]) {
        localStorage.setItem(getStorageKey(userId, 'growth'), JSON.stringify(logs));
    },

    saveActiveTimer(userId: string, timer: any) {
        if (timer) {
            localStorage.setItem(getStorageKey(userId, 'timer'), JSON.stringify(timer));
        } else {
            localStorage.removeItem(getStorageKey(userId, 'timer'));
        }
    },

    saveBabyProfile(userId: string, profile: BabyProfile) {
        localStorage.setItem(getStorageKey(userId, 'profile'), JSON.stringify(profile));
    },

    saveInventory(userId: string, inventory: MilkInventoryItem[]) {
        localStorage.setItem(getStorageKey(userId, 'inventory'), JSON.stringify(inventory));
    },

    // --- Migration (Anon -> Cloud) ---
    // If a user was using the app without logging in, move that data to their new account
    migrateAnonymousData(userId: string) {
        const anonLogs = localStorage.getItem(ANON_KEYS.logs);
        const anonGrowth = localStorage.getItem(ANON_KEYS.growth);
        const anonTimer = localStorage.getItem(ANON_KEYS.timer);
        const anonProfile = localStorage.getItem(ANON_KEYS.profile);
        const anonInventory = localStorage.getItem(ANON_KEYS.inventory);

        if (anonLogs) {
            localStorage.setItem(getStorageKey(userId, 'logs'), anonLogs);
            localStorage.removeItem(ANON_KEYS.logs); // Clear local
        }
        if (anonGrowth) {
            localStorage.setItem(getStorageKey(userId, 'growth'), anonGrowth);
            localStorage.removeItem(ANON_KEYS.growth);
        }
        if (anonTimer) {
            localStorage.setItem(getStorageKey(userId, 'timer'), anonTimer);
            localStorage.removeItem(ANON_KEYS.timer);
        }
        if (anonProfile) {
            localStorage.setItem(getStorageKey(userId, 'profile'), anonProfile);
            localStorage.removeItem(ANON_KEYS.profile);
        }
        if (anonInventory) {
            localStorage.setItem(getStorageKey(userId, 'inventory'), anonInventory);
            localStorage.removeItem(ANON_KEYS.inventory);
        }
    }
};
