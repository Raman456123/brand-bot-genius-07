
import { Activity, ActivityResult, EvaluateActivityOptions } from "../types";
import { ChatActivity } from "./ChatActivity";

/**
 * Activity that evaluates how effective a newly generated activity might be.
 * This is purely an LLM-based guess, not guaranteed to be accurate.
 */
export class EvaluateActivity implements Activity {
  public name: string = "evaluate";
  public description: string = "Evaluates the potential effectiveness of newly generated activities";
  public energyCost: number = 0.3;
  public cooldown: number = 86400; // 1 day in seconds
  public requiredApiKeys: string[] = ["OPENAI"];
  
  private systemPrompt: string;
  private maxTokens: number;
  private chatActivity: ChatActivity;
  
  constructor(options: EvaluateActivityOptions = {}) {
    this.systemPrompt = options.systemPrompt || 
      "You are an AI that evaluates the potential effectiveness of newly generated Activities. " +
      "You consider whether the code is likely to run, fits the being's objectives, and avoids major pitfalls. " +
      "Provide a short bullet-point analysis.";
    this.maxTokens = options.maxTokens || 250;
    
    this.chatActivity = new ChatActivity({
      modelName: "gpt-4o-mini",
      systemPrompt: this.systemPrompt,
      maxTokens: this.maxTokens
    });
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient and OpenAI API key is available
    return state.energy >= this.energyCost && !!apiKeys["OPENAI"];
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Starting EvaluateActivity...");
      
      // Get recent activities to find the last created/updated code
      if (!state.memory) {
        return {
          success: false,
          error: "Memory is not available",
          data: null
        };
      }
      
      // Look for the most recent BuildOrUpdateActivity result
      const recentActivities = state.memory.getRecentActivities(10) || [];
      let codeFound = null;
      
      for (const activity of recentActivities) {
        if (activity.activity_type === "build_or_update" && activity.data) {
          if (activity.data.codeSnippet) {
            codeFound = activity.data.codeSnippet;
            break;
          }
        }
      }
      
      if (!codeFound) {
        return {
          success: false,
          error: "No newly generated code found to evaluate",
          data: null
        };
      }
      
      // Prepare the prompt to evaluate the code
      const promptText = 
        `Here is the code for a newly created activity:\n${codeFound}\n\n` +
        "Evaluate how effective or risky this might be. Provide bullet points. " +
        "Focus on alignment with objectives, potential errors, or improvements.";
      
      // Use the ChatActivity to generate an evaluation
      const response = await this.chatActivity.execute(
        apiKeys,
        state,
        { 
          prompt: promptText,
          systemPrompt: this.systemPrompt
        }
      );
      
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      return {
        success: true,
        data: {
          evaluation: response.data.content,
          model: response.data.model,
          finishReason: response.data.finishReason
        },
        error: null,
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error("Error in EvaluateActivity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
}
