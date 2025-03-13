
import { Activity, ActivityResult } from "../types";

/**
 * Simple test activity for the AI influencer system.
 * This is a basic activity that demonstrates the activity structure.
 */
export class TestActivity implements Activity {
  name: string = "test";
  description: string = "A simple test activity for demonstration purposes";
  energyCost: number = 0.2;
  cooldown: number = 300000; // 300 seconds (5 minutes) in milliseconds
  requiredApiKeys: string[] = [];
  
  constructor() {
    // No special initialization needed
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to run test activity");
      return false;
    }
    
    return true;
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Executing Test activity");
      // TODO: Actual logic would go here
      
      return {
        success: true,
        data: { message: "Test activity completed successfully" },
        error: null
      };
    } catch (error) {
      console.error("Error in Test activity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
}
