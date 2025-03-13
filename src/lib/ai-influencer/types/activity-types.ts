
/**
 * Base interfaces for activities and their results
 */

export interface ActivityResult {
  success: boolean;
  data: any | null;
  error: string | null;
  metadata?: Record<string, any>;
  timestamp?: string;
  importance?: number;
  activity_type?: string;
}

export interface Activity {
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  requiredApiKeys?: string[];
  canRun: (apiKeys: Record<string, string>, state: any) => Promise<boolean>;
  execute: (apiKeys: Record<string, string>, state: any, params?: any) => Promise<ActivityResult>;
}

export interface MemoryStats {
  shortTerm: number;
  longTerm: number;
  total: number;
}

export interface MemoryManager {
  storeActivityResult: (activityResult: any) => void;
  getRecentActivities: (limit?: number, offset?: number) => any[];
  getImportantActivities: (limit?: number, offset?: number) => any[];
  searchMemory: (query: string) => any[];
  getActivitiesByType: (activityType: string) => any[];
  getActivityCount: () => MemoryStats;
  addToLongTermMemory: (memory: any) => void;
  consolidateMemories: () => void;
  clearActivities: () => void;
  clearShortTermMemory: () => void;
  saveApiKey: (activityName: string, keyName: string, keyValue: string) => void;
  getApiKey: (activityName: string, keyName: string) => string | null;
  getApiKeyStatuses: () => Record<string, Record<string, boolean>>;
  getRecentActivitySummary: (limit?: number) => string;
}
