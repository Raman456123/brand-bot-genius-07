
import { Activity, ActivityResult, AnalyzeDailyOptions, AnalyzeDailyResult } from "../types";
import { ChatActivity } from "./ChatActivity";

export class AnalyzeDailyActivity implements Activity {
  public name: string = "analyze_daily";
  public description: string = "Reviews recent activities and produces a daily reflection or summary";
  public energyCost: number = 0.3;
  public cooldown: number = 86400000; // 24 hours in milliseconds
  public requiredApiKeys: string[] = ["OPENAI"]; // Requires OpenAI API for chat completion
  
  private systemPrompt: string;
  private maxTokens: number;
  private activityLimit: number;
  private chatActivity: ChatActivity;
  
  constructor(options: AnalyzeDailyOptions = {}) {
    this.systemPrompt = options.systemPrompt || 
      "You are an AI that helps summarize the events, successes, or challenges from the digital being's recent memory. Keep the reflection concise and highlight any patterns or potential next steps.";
    this.maxTokens = options.maxTokens || 150;
    this.activityLimit = options.activityLimit || 10;
    
    // Initialize the ChatActivity to use for generating reflections
    this.chatActivity = new ChatActivity({
      modelName: "gpt-4o-mini",
      systemPrompt: this.systemPrompt,
      maxTokens: this.maxTokens
    });
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to run daily analysis");
      return false;
    }
    
    // Check if the ChatActivity can run
    return await this.chatActivity.canRun(apiKeys, state);
  }
  
  async execute(
    apiKeys: Record<string, string>, 
    state: any, 
    params?: { memoryManager?: any }
  ): Promise<ActivityResult> {
    try {
      console.log("Starting daily analysis of memory...");
      
      // Get memory manager from params or from the state
      const memoryManager = params?.memoryManager || state.memoryManager;
      
      if (!memoryManager) {
        return {
          success: false,
          error: "Memory manager not available",
          data: null
        };
      }
      
      // Get recent activities from memory
      const recentActivities = memoryManager.getRecentActivities(this.activityLimit, 0);
      
      if (!recentActivities || recentActivities.length === 0) {
        return {
          success: false,
          error: "No recent activities found in memory",
          data: null
        };
      }
      
      // Format activities for the prompt
      const textSnippets = recentActivities.map(act => 
        `- ${act.activity_type}, success=${act.success}, data=${JSON.stringify(act.data || {})}`
      );
      
      const combinedText = textSnippets.join("\n");
      const prompt = `Here are recent logs:\n${combinedText}\n\nProduce a short daily reflection or summary.`;
      
      // Use ChatActivity to generate the reflection
      const response = await this.chatActivity.execute(apiKeys, state, { prompt });
      
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      // Extract the reflection and return success
      const reflection = response.data.content;
      
      const result: AnalyzeDailyResult = {
        reflection,
        model: response.data.model,
        finishReason: response.data.finishReason
      };
      
      return {
        success: true,
        data: result,
        error: null,
        metadata: {
          timestamp: new Date().toISOString(),
          activityCount: recentActivities.length,
          model: response.data.model
        }
      };
      
    } catch (error) {
      console.error("Error in AnalyzeDailyActivity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
}
