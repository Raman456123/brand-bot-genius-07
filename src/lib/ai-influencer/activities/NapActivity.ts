
import { Activity, ActivityResult, NapOptions } from "../types";

/**
 * Activity for taking a "nap" to simulate resting
 */
export class NapActivity implements Activity {
  name: string = "nap";
  description: string = "Takes a short nap to simulate resting";
  energyCost: number = 0; // A nap doesn't cost energy 
  cooldown: number = 1800000; // 30 minutes in milliseconds
  requiredApiKeys: string[] = []; // No API keys required
  
  private napMinutes: number;
  
  constructor(options: NapOptions = {}) {
    this.napMinutes = options.napMinutes || 15;
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // This activity can always run
    return true;
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log(`Taking a ${this.napMinutes}-minute nap.`);
      
      // Store nap information in state
      // In a real implementation, this would update the AI's state in a more structured way
      const bodyState = state.bodyState || {};
      bodyState.napInfo = {
        lastNapDuration: this.napMinutes,
        timestamp: new Date().toISOString()
      };
      
      // We could simulate a delay here if needed
      // await new Promise(resolve => setTimeout(resolve, this.napMinutes * 60 * 1000));
      
      console.log("Nap finished. Feeling refreshed!");
      
      return {
        success: true,
        data: {
          napMinutes: this.napMinutes
        },
        error: null,
        metadata: {
          message: "Nap complete"
        }
      };
      
    } catch (error) {
      console.error("Nap failed:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
