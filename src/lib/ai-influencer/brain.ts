
import { Activity, ActivityResult, ApiKeyManager } from "./types";

/**
 * Simple API key manager that uses localStorage
 */
class LocalStorageApiKeyManager implements ApiKeyManager {
  private getKeyId(activityName: string, keyName: string): string {
    return `ai_influencer_${activityName.toLowerCase()}_${keyName.toLowerCase()}`;
  }

  async checkApiKeyExists(activityName: string, keyName: string): Promise<boolean> {
    const keyId = this.getKeyId(activityName, keyName);
    return localStorage.getItem(keyId) !== null;
  }

  async getApiKey(activityName: string, keyName: string): Promise<string | null> {
    const keyId = this.getKeyId(activityName, keyName);
    return localStorage.getItem(keyId);
  }

  async setApiKey(activityName: string, keyName: string, value: string): Promise<boolean> {
    try {
      const keyId = this.getKeyId(activityName, keyName);
      localStorage.setItem(keyId, value);
      return true;
    } catch (error) {
      console.error("Error storing API key:", error);
      return false;
    }
  }
}

/**
 * AIInfluencerBrain - A TypeScript adaptation of Pippin's Python framework
 * This is a simplified version that demonstrates the core concepts
 */
export class AIInfluencerBrain {
  private activities: Activity[] = [];
  private lastActivityTimes: Record<string, Date> = {};
  private state = {
    energy: 1.0,
    mood: "neutral",
    personality: {
      creativity: 0.7,
      friendliness: 0.6,
      curiosity: 0.8
    }
  };
  private apiKeyManager: ApiKeyManager;

  constructor(customApiKeyManager?: ApiKeyManager) {
    // Initialize the brain
    this.apiKeyManager = customApiKeyManager || new LocalStorageApiKeyManager();
  }

  /**
   * Load available activities
   */
  loadActivities(): void {
    // In the original Python code, this would dynamically load activities
    // from Python files. Here, we'll hard-code some sample activities.
    this.activities = [
      {
        name: "CreateContent",
        energyCost: 0.3,
        cooldown: 3600, // 1 hour in seconds
        requiredSkills: ["creativity", "writing"],
        execute: async (): Promise<ActivityResult> => {
          return {
            success: true,
            data: "Created a new piece of content",
            error: null,
            metadata: {},
            timestamp: new Date().toISOString()
          };
        }
      },
      {
        name: "EngageWithFollowers",
        energyCost: 0.2,
        cooldown: 1800, // 30 minutes in seconds
        requiredSkills: ["communication"],
        execute: async (): Promise<ActivityResult> => {
          return {
            success: true,
            data: "Responded to 5 comments from followers",
            error: null,
            metadata: {},
            timestamp: new Date().toISOString()
          };
        }
      },
      {
        name: "AnalyzeTrends",
        energyCost: 0.4,
        cooldown: 7200, // 2 hours in seconds
        requiredSkills: ["analysis"],
        requiredApiKeys: ["trendsapi"],
        execute: async (): Promise<ActivityResult> => {
          // Check if we have the required API key
          const hasApiKey = await this.apiKeyManager.checkApiKeyExists("AnalyzeTrends", "trendsapi");
          if (!hasApiKey) {
            return {
              success: false,
              data: null,
              error: "Missing required API key: trendsapi",
              metadata: {},
              timestamp: new Date().toISOString()
            };
          }
          
          return {
            success: true,
            data: "Analyzed current trends and identified 3 potential content topics",
            error: null,
            metadata: {},
            timestamp: new Date().toISOString()
          };
        }
      },
      {
        name: "PlanSchedule",
        energyCost: 0.2,
        cooldown: 21600, // 6 hours in seconds
        requiredSkills: ["planning"],
        execute: async (): Promise<ActivityResult> => {
          return {
            success: true,
            data: "Planned content schedule for the next week",
            error: null,
            metadata: {},
            timestamp: new Date().toISOString()
          };
        }
      }
    ];
  }

  /**
   * Get all available activities
   */
  getAvailableActivities(): Activity[] {
    const now = new Date();
    
    return this.activities.filter(activity => {
      const lastExecutionTime = this.lastActivityTimes[activity.name];
      
      // If this activity was never executed, it's available
      if (!lastExecutionTime) {
        return true;
      }
      
      // Check if the cooldown period has passed
      const timeSinceLastExecution = (now.getTime() - lastExecutionTime.getTime()) / 1000;
      return timeSinceLastExecution >= activity.cooldown;
    });
  }

  /**
   * Check if an activity has all required API keys
   */
  async checkActivityApiKeys(activity: Activity): Promise<{hasAllKeys: boolean, missingKeys: string[]}> {
    const missingKeys: string[] = [];
    
    if (!activity.requiredApiKeys || activity.requiredApiKeys.length === 0) {
      return { hasAllKeys: true, missingKeys: [] };
    }
    
    for (const key of activity.requiredApiKeys) {
      const exists = await this.apiKeyManager.checkApiKeyExists(activity.name, key);
      if (!exists) {
        missingKeys.push(key);
      }
    }
    
    return {
      hasAllKeys: missingKeys.length === 0,
      missingKeys
    };
  }

  /**
   * Select the next activity based on current state and constraints
   */
  async selectNextActivity(): Promise<Activity | null> {
    const availableActivities = this.getAvailableActivities();
    
    // Filter activities based on energy requirements
    const suitableActivities = availableActivities.filter(activity => 
      this.state.energy >= activity.energyCost
    );
    
    if (suitableActivities.length === 0) {
      return null;
    }
    
    // Filter activities based on API key requirements
    const activitiesWithApiKeys: Activity[] = [];
    for (const activity of suitableActivities) {
      const { hasAllKeys } = await this.checkActivityApiKeys(activity);
      if (hasAllKeys) {
        activitiesWithApiKeys.push(activity);
      }
    }
    
    if (activitiesWithApiKeys.length === 0) {
      console.log("No activities have all required API keys");
      return suitableActivities[0]; // Fallback to first activity even without API keys
    }
    
    // Weighted random selection based on personality
    const weights = activitiesWithApiKeys.map(activity => {
      let weight = 1.0;
      
      // Different activities might align better with different personality traits
      if (activity.name === "CreateContent") {
        weight *= (1 + this.state.personality.creativity * 0.5);
      } else if (activity.name === "EngageWithFollowers") {
        weight *= (1 + this.state.personality.friendliness * 0.5);
      } else if (activity.name === "AnalyzeTrends") {
        weight *= (1 + this.state.personality.curiosity * 0.5);
      }
      
      return weight;
    });
    
    // Select an activity using weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (let i = 0; i < activitiesWithApiKeys.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        // Record the time we selected this activity
        this.lastActivityTimes[activitiesWithApiKeys[i].name] = new Date();
        return activitiesWithApiKeys[i];
      }
    }
    
    // Fallback to the first activity if something went wrong with the weighted selection
    this.lastActivityTimes[activitiesWithApiKeys[0].name] = new Date();
    return activitiesWithApiKeys[0];
  }

  /**
   * Set an API key for an activity
   */
  async setApiKey(activityName: string, keyName: string, value: string): Promise<boolean> {
    return this.apiKeyManager.setApiKey(activityName, keyName, value);
  }

  /**
   * Execute the given activity
   */
  async executeActivity(activity: Activity): Promise<ActivityResult> {
    try {
      // Check API key requirements
      const { hasAllKeys, missingKeys } = await this.checkActivityApiKeys(activity);
      if (!hasAllKeys) {
        return {
          success: false,
          data: null,
          error: `Missing required API keys: ${missingKeys.join(", ")}`,
          metadata: {},
          timestamp: new Date().toISOString()
        };
      }
      
      // Log the start of the activity
      console.log(`Starting activity: ${activity.name}`);
      
      // Execute the activity
      const result = await activity.execute();
      
      // Update the energy after execution
      this.state.energy = Math.max(0, this.state.energy - activity.energyCost);
      
      // Log the completion of the activity
      console.log(`Completed activity: ${activity.name}`);
      
      return result;
    } catch (error) {
      console.error(`Error in activity ${activity.name}:`, error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        metadata: {},
        timestamp: new Date().toISOString()
      };
    }
  }
}
