
import { Activity, ActivityResult } from "./types";

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

  constructor() {
    // Initialize the brain
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
        execute: async (): Promise<ActivityResult> => {
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
   * Select the next activity based on current state and constraints
   */
  selectNextActivity(): Activity | null {
    const availableActivities = this.getAvailableActivities();
    
    // Filter activities based on energy requirements
    const suitableActivities = availableActivities.filter(activity => 
      this.state.energy >= activity.energyCost
    );
    
    if (suitableActivities.length === 0) {
      return null;
    }
    
    // Weighted random selection based on personality
    // This is a simplified version of the Python implementation
    const weights = suitableActivities.map(activity => {
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
    
    for (let i = 0; i < suitableActivities.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        // Record the time we selected this activity
        this.lastActivityTimes[suitableActivities[i].name] = new Date();
        return suitableActivities[i];
      }
    }
    
    // Fallback to the first activity if something went wrong with the weighted selection
    this.lastActivityTimes[suitableActivities[0].name] = new Date();
    return suitableActivities[0];
  }

  /**
   * Execute the given activity
   */
  async executeActivity(activity: Activity): Promise<ActivityResult> {
    try {
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
