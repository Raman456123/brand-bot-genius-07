
/**
 * Represents an activity that the AI influencer can perform
 */
export interface Activity {
  name: string;
  energyCost: number;
  cooldown: number; // in seconds
  requiredSkills: string[];
  requiredApiKeys?: string[]; // New field for required API keys
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
}
