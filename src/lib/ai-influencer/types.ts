
/**
 * Represents an activity that the AI influencer can perform
 */
export interface Activity {
  name: string;
  energyCost: number;
  cooldown: number; // in seconds
  requiredSkills: string[];
  requiredApiKeys?: string[]; // API keys needed for this activity
  execute: () => Promise<ActivityResult>;
}

/**
 * Represents the result of an activity execution
 */
export interface ActivityResult {
  success: boolean;
  data: any | null;
  error: string | null;
  metadata: Record<string, any>;
  timestamp: string;
}

/**
 * Represents the current state of the AI influencer
 */
export interface AIState {
  energy: number;
  mood: string;
  personality: {
    creativity: number;
    friendliness: number;
    curiosity: number;
  };
}

/**
 * API Key management interface
 */
export interface ApiKeyManager {
  checkApiKeyExists: (activityName: string, keyName: string) => Promise<boolean>;
  getApiKey: (activityName: string, keyName: string) => Promise<string | null>;
  setApiKey: (activityName: string, keyName: string, value: string) => Promise<boolean>;
  listRequiredApiKeys: () => Record<string, string[]>;
  getAllApiKeyStatuses: () => Promise<Record<string, Record<string, boolean>>>;
}

/**
 * Integration - represents an external service integration
 */
export interface Integration {
  name: string;
  displayName: string;
  connected: boolean;
  authModes: string[];
  apiKeyDetails?: {
    fields: {
      name: string;
      displayName: string;
      description: string;
      required: boolean;
    }[];
  };
}

/**
 * Memory entry for storing activity history
 */
export interface MemoryEntry {
  timestamp: string;
  activity_type: string; 
  success: boolean;
  error: string | null;
  data: any | null;
  metadata: Record<string, any>;
}
