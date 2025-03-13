
import { Activity, ActivityResult, DailyThoughtOptions, DailyThoughtResult } from "../types";
import { ChatActivity } from "./ChatActivity";

export class DailyThoughtActivity implements Activity {
  public name: string = "daily_thought";
  public description: string = "Generates insightful daily thoughts";
  public energyCost: number = 0.4;
  public cooldown: number = 1800; // 30 minutes in seconds
  public requiredApiKeys: string[] = ["OPENAI"];
  
  private systemPrompt: string;
  private maxTokens: number;
  private chatActivity: ChatActivity;
  
  constructor(options: DailyThoughtOptions = {}) {
    this.systemPrompt = options.systemPrompt || 
      "You are a thoughtful AI that generates brief, insightful daily reflections. Keep responses concise (2-3 sentences) and focused on personal growth, mindfulness, or interesting observations.";
    this.maxTokens = options.maxTokens || 100;
    
    // Initialize the ChatActivity to use for generating thoughts
    this.chatActivity = new ChatActivity({
      modelName: "gpt-4o-mini",
      systemPrompt: this.systemPrompt,
      maxTokens: this.maxTokens
    });
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to generate daily thought");
      return false;
    }
    
    // Check if the ChatActivity can run (requires OpenAI API key)
    return await this.chatActivity.canRun(apiKeys, state);
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Starting daily thought generation...");
      
      // Generate the thought using ChatActivity
      const response = await this.chatActivity.execute(apiKeys, state, { 
        prompt: "Generate a thoughtful reflection for today. Focus on personal growth, mindfulness, or an interesting perspective."
      });
      
      if (!response.success) {
        console.error(`Daily thought generation failed: ${response.error}`);
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      // Extract the thought and return success
      const thought = response.data.content;
      console.log(`Successfully generated daily thought: ${thought.substring(0, 50)}...`);
      
      const result: DailyThoughtResult = {
        thought,
        model: response.data.model,
        finishReason: response.data.finishReason
      };
      
      return {
        success: true,
        data: result,
        error: null,
        metadata: {
          timestamp: new Date().toISOString(),
          model: response.data.model,
          thoughtLength: thought.length
        }
      };
      
    } catch (error) {
      console.error("Error in DailyThoughtActivity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
}
