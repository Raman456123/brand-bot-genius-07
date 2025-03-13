
/**
 * Represents an activity that the AI influencer can perform
 */
export interface Activity {
  name: string;
  energyCost: number;
  cooldown: number; // in seconds
  requiredSkills: string[];
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
