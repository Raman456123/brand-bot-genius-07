
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
    
    // Check if this activity is enabled in constraints
    const activityConstraints = state.activityConstraints || {};
    const activitiesConfig = activityConstraints.activities_config || {};
    
    if (activitiesConfig.TestActivity && activitiesConfig.TestActivity.enabled === false) {
      console.log("Test activity is disabled in constraints");
      return false;
    }
    
    // Check if we meet memory requirements (if defined)
    const activityRequirements = activityConstraints.activity_requirements || {};
    const testRequirements = activityRequirements.TestActivity || {};
    
    if (testRequirements.min_memory_space && 
        state.availableMemorySpace < testRequirements.min_memory_space) {
      console.log(`Insufficient memory space for Test activity. 
        Required: ${testRequirements.min_memory_space}, 
        Available: ${state.availableMemorySpace}`);
      return false;
    }
    
    // Check if we have all required skills
    const requiredSkills = testRequirements.required_skills || [];
    const availableSkills = state.availableSkills || [];
    
    for (const skill of requiredSkills) {
      if (!availableSkills.includes(skill)) {
        console.log(`Missing required skill for Test activity: ${skill}`);
        return false;
      }
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
