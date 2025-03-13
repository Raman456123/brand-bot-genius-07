
import { Activity, ActivityResult, SuggestNewActivitiesOptions } from "../types";
import { ChatActivity } from "./ChatActivity";

/**
 * Activity that examines the AI's current objectives and constraints,
 * then asks the LLM to propose new or modified Activities which may leverage
 * any known skills.
 */
export class SuggestNewActivitiesActivity implements Activity {
  name: string = "suggest_new_activities";
  description: string = "Suggests new activities the AI could perform based on its objectives and available skills";
  energyCost: number = 0.4;
  cooldown: number = 259200000; // 3 days in milliseconds
  requiredApiKeys: string[] = ["OPENAI"];
  
  private systemPrompt: string;
  private maxTokens: number;
  
  constructor(options: SuggestNewActivitiesOptions = {}) {
    this.systemPrompt = options.systemPrompt || 
      `You are an AI that helps brainstorm new or improved activities to achieve the being's goals, 
      leveraging the skills the system has available. The user will evaluate or build these later. 
      Provide short, actionable suggestions focusing on feasibility, alignment with constraints, and creativity.
      If relevant, mention which skill(s) would be used for each suggestion.
      Do not plan on using API calls or making up URLs and rely on available skills for interacting with anything external to yourself.`;
    
    this.maxTokens = options.maxTokens || 300;
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to suggest new activities");
      return false;
    }
    
    // Check if OpenAI API key is available
    if (!apiKeys["OPENAI"]) {
      console.log("OpenAI API key not available");
      return false;
    }
    
    return true;
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Starting new activity suggestion process...");
      
      // 1. Initialize the chat activity
      const chatActivity = new ChatActivity({
        modelName: "gpt-4o",
        maxTokens: this.maxTokens
      });
      
      // 2. Gather the AI's objectives and constraints
      const objectives = state.personality?.objectives || {};
      const primaryObjective = objectives.primary || "No primary objective found.";
      const constraints = state.personality?.constraints || "None specified";
      
      // 3. Gather all known skills (activities)
      const availableActivities = this.getAvailableActivities(state);
      
      // 4. Build final prompt
      const promptText = 
        `My primary objective: ${primaryObjective}\n` +
        `Global constraints or notes: ${constraints}\n\n` +
        `Known Skills:\n${availableActivities}\n\n` +
        `Propose up to 3 new or modified Activities to help achieve my goal. ` +
        `Highlight how each might use one or more of these skills (if relevant). ` +
        `Keep suggestions short.`;
      
      // 5. LLM call
      const response = await chatActivity.execute(
        apiKeys,
        state,
        { prompt: promptText, systemPrompt: this.systemPrompt }
      );
      
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      const suggestions = response.data.content;
      
      return {
        success: true,
        data: {
          suggestions: suggestions
        },
        error: null,
        metadata: {
          model: response.data.model,
          finishReason: response.data.finishReason
        }
      };
    } catch (error) {
      console.error("Error in SuggestNewActivities:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  private getAvailableActivities(state: any): string {
    // In a real implementation, this would retrieve a list of all available activities
    // For this mock implementation, we'll return a hardcoded list
    
    const activityDescriptions = [
      "Skill: chat, enabled=true, required_api_keys=[OPENAI]",
      "Skill: image_generation, enabled=true, required_api_keys=[OPENAI]",
      "Skill: web_scraping, enabled=true, required_api_keys=[]",
      "Skill: twitter_posting, enabled=true, required_api_keys=[TWITTER_API_KEY]",
      "Skill: github_analysis, enabled=true, required_api_keys=[GITHUB_TOKEN]",
      "Skill: news_fetching, enabled=true, required_api_keys=[]"
    ];
    
    // You could also dynamically build this list from the activities in brain.ts
    
    return activityDescriptions.join("\n");
  }
}
