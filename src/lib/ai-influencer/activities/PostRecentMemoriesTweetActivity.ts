
import { Activity, ActivityResult, PostRecentMemoriesTweetOptions } from "../types";
import { ChatActivity } from "./ChatActivity";
import { XAPIActivity } from "./XAPIActivity";

/**
 * Activity for posting tweets about recent AI memories
 */
export class PostRecentMemoriesTweetActivity implements Activity {
  name: string = "post_recent_memories_tweet";
  description: string = "Posts tweets about recent memories with the AI's personality";
  energyCost: number = 0.4;
  cooldown: number = 10000; // ~2.7 hours (for testing)
  requiredApiKeys: string[] = ["OPENAI", "TWITTER_API_KEY"];
  
  private maxLength: number = 280;
  private twitterUsername: string;
  private numActivitiesToFetch: number;
  private ignoredActivityTypes: string[];
  
  constructor(options: PostRecentMemoriesTweetOptions = {}) {
    this.twitterUsername = options.twitterUsername || "YourUsername";
    this.numActivitiesToFetch = options.numActivitiesToFetch || 10;
    this.ignoredActivityTypes = options.ignoredActivityTypes || [
      "post_recent_memories_tweet",
      "post_tweet_with_image"
    ];
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to post a memories tweet");
      return false;
    }
    
    // Check if API keys are available
    if (!apiKeys["OPENAI"]) {
      console.log("OpenAI API key not available");
      return false;
    }
    
    if (!apiKeys["TWITTER_API_KEY"]) {
      console.log("Twitter API key not available");
      return false;
    }
    
    return true;
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Starting PostRecentMemoriesTweetActivity...");
      
      // 1. Initialize dependencies
      const chatActivity = new ChatActivity({
        modelName: "gpt-4o-mini", 
        maxTokens: 200
      });
      
      const xApiActivity = new XAPIActivity({
        twitterUsername: this.twitterUsername
      });
      
      // 2. Gather personality data and objectives
      const personalityData = state.personality || {};
      const objectivesData = state.activeGoals || {};
      
      // 3. Fetch recent memories
      const recentMemories = this.getRecentMemories(state);
      if (recentMemories.length === 0) {
        console.log("No relevant memories found to tweet about");
        return {
          success: true,
          data: { message: "No recent memories to share." },
          error: null
        };
      }
      
      // 4. Find which memories were used last time (to avoid repeats)
      const usedMemoriesLastTime = this.getMemoriesUsedLastTime(state);
      console.log("Memories used last time:", usedMemoriesLastTime);
      
      // Filter out any overlap
      const newMemories = recentMemories.filter(
        memory => !usedMemoriesLastTime.includes(memory)
      );
      
      if (newMemories.length === 0) {
        console.log("All recent memories overlap with last time");
        return {
          success: true,
          data: { message: "No new memories to tweet." },
          error: null
        };
      }
      
      // 5. Build prompt referencing personality + objectives + memories
      const promptText = this.buildChatPrompt(personalityData, objectivesData, newMemories);
      
      // 6. Extract drawing URLs from memories
      const drawingUrls = this.extractDrawingUrls(newMemories);
      
      // 7. Generate tweet text with chat skill
      const systemPrompt = "You are an AI that composes tweets with the given personality and objectives. Tweet must be under 280 chars.";
      
      const chatResult = await chatActivity.execute(
        apiKeys,
        state,
        { prompt: promptText, systemPrompt }
      );
      
      if (!chatResult.success) {
        return {
          success: false,
          error: chatResult.error,
          data: null
        };
      }
      
      let tweetText = chatResult.data.content.trim();
      if (tweetText.length > this.maxLength) {
        tweetText = tweetText.substring(0, this.maxLength - 3) + "...";
      }
      
      // 8. Post the tweet
      const postResult = await xApiActivity.execute(
        apiKeys,
        state,
        { text: tweetText, mediaUrls: drawingUrls }
      );
      
      if (!postResult.success) {
        return {
          success: false,
          error: postResult.error || "Unknown error posting tweet",
          data: null
        };
      }
      
      // 9. Return success with used memories for next time
      const tweetId = postResult.data.tweetId;
      const tweetLink = `https://twitter.com/${this.twitterUsername}/status/${tweetId}`;
      
      console.log(`Successfully posted tweet about recent memories: ${tweetText.substring(0, 50)}...`);
      
      return {
        success: true,
        data: {
          tweetId,
          content: tweetText,
          tweetLink,
          recentMemoriesUsed: newMemories,
          imageCount: drawingUrls.length
        },
        error: null,
        metadata: {
          length: tweetText.length,
          model: chatResult.data.model,
          finishReason: chatResult.data.finishReason,
          promptUsed: promptText,
          imageCount: drawingUrls.length
        }
      };
    } catch (error) {
      console.error("Failed to post recent memories tweet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  private getRecentMemories(state: any): string[] {
    // In a real implementation, we would fetch from memory/database
    // For this mock implementation, we'll generate some example memories
    const mockMemories = [
      "ChatActivity => {content: 'I found that article about quantum computing fascinating!'}",
      "WebScrapingActivity => {url: 'https://example.com/ai-news', title: 'Latest AI Breakthroughs'}",
      "DrawActivity => {image_data: {url: 'https://example.com/images/123.png', prompt: 'sunset over mountains'}}",
      "FetchNewsActivity => {articles: ['AI Makes Progress in Medicine', 'New Robotics Breakthrough']}",
      "AnalyzeDailyActivity => {reflection: 'Today I learned about many interesting topics in technology'}"
    ];
    
    // Filter out ignored activity types
    return mockMemories.filter(memory => {
      const activityType = memory.split(" =>")[0];
      return !this.ignoredActivityTypes.includes(activityType);
    }).slice(0, this.numActivitiesToFetch);
  }
  
  private getMemoriesUsedLastTime(state: any): string[] {
    // In a real implementation, we would fetch from memory/database
    // For this mock implementation, let's return an empty array
    const activityHistory = state.activityHistory || [];
    
    for (const activity of activityHistory) {
      if (activity.activityName === "post_recent_memories_tweet" && activity.result.success) {
        return activity.result.data?.recentMemoriesUsed || [];
      }
    }
    
    return [];
  }
  
  private buildChatPrompt(
    personality: Record<string, any>,
    objectives: Record<string, any>,
    newMemories: string[]
  ): string {
    // Personality lines
    const traitLines = Object.entries(personality)
      .map(([trait, value]) => `${trait}: ${value}`)
      .join("\n");
    
    const personalityStr = traitLines || "(No personality traits defined)";
    
    // Objectives lines
    const objectiveLines = Object.entries(objectives)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    
    const objectivesStr = objectiveLines || "(No objectives specified)";
    
    // Memories
    const memoriesStr = newMemories.length > 0
      ? newMemories.map(memory => `- ${memory}`).join("\n")
      : "(No new memories)";
    
    return (
      `Our digital being has these personality traits:\n` +
      `${personalityStr}\n\n` +
      `It also has these objectives:\n` +
      `${objectivesStr}\n\n` +
      `Here are some new memories:\n` +
      `${memoriesStr}\n\n` +
      `Please craft a short tweet (under 280 chars) that references these memories, ` +
      `reflects the personality and objectives, and ensures it's not repetitive or dull. ` +
      `Keep it interesting, cohesive, and mindful of the overall tone.\n`
    );
  }
  
  private extractDrawingUrls(memories: string[]): string[] {
    const drawingUrls: string[] = [];
    
    for (const memory of memories) {
      if (memory.startsWith("DrawActivity =>")) {
        try {
          // Extract data after the '=>'
          const dataStr = memory.split("=>")[1].trim();
          
          // Simple regex to extract URL from the string
          const urlMatch = dataStr.match(/url:\s*'([^']+)'/);
          if (urlMatch && urlMatch[1]) {
            const url = urlMatch[1];
            
            // Basic URL validation
            if (url.startsWith('http') && (url.includes('.png') || url.includes('.jpg'))) {
              drawingUrls.push(url);
            }
          }
        } catch (error) {
          console.error("Failed to extract drawing URL:", error);
        }
      }
    }
    
    return drawingUrls;
  }
}
