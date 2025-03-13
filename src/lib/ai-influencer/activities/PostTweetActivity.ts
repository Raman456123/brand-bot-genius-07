
import { Activity, ActivityResult, TwitterPostOptions } from "../types";
import { ChatActivity } from "./ChatActivity";
import { ImageGenerationActivity } from "./ImageGenerationActivity";
import { XAPIActivity } from "./XAPIActivity";

/**
 * Activity for posting tweets to Twitter/X with optional image generation
 */
export class PostTweetActivity implements Activity {
  name: string = "post_tweet_with_image";
  description: string = "Generates and posts tweets to X (Twitter) with optional images";
  energyCost: number = 0.6; // Higher cost since it combines multiple activities
  cooldown: number = 3600000; // 1 hour in milliseconds
  requiredApiKeys: string[] = ["OPENAI", "TWITTER_API_KEY"];
  
  private maxLength: number = 280;
  private twitterUsername: string;
  private imageGenerationEnabled: boolean;
  private defaultSize: string;
  private defaultFormat: "png" | "jpg";
  
  constructor(options: {
    twitterUsername?: string;
    imageGenerationEnabled?: boolean;
    defaultSize?: string;
    defaultFormat?: "png" | "jpg";
  } = {}) {
    this.twitterUsername = options.twitterUsername || "YourUsername";
    this.imageGenerationEnabled = options.imageGenerationEnabled ?? false;
    this.defaultSize = options.defaultSize || "1024x1024";
    this.defaultFormat = options.defaultFormat || "png";
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to post a tweet with image");
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
      console.log("Starting tweet posting activity...");
      
      // 1. Initialize dependencies
      const chatActivity = new ChatActivity({
        modelName: "gpt-4o-mini", 
        maxTokens: 100
      });
      
      const xApiActivity = new XAPIActivity({
        twitterUsername: this.twitterUsername
      });
      
      const imageGenActivity = this.imageGenerationEnabled 
        ? new ImageGenerationActivity({
            size: this.defaultSize,
            format: this.defaultFormat
          })
        : null;
      
      // 2. Gather personality data and recent tweets
      const personalityData = state.personality || {};
      const recentTweets = this.getRecentTweets(state);
      
      // 3. Generate tweet text with chat skill
      const promptText = this.buildChatPrompt(personalityData, recentTweets);
      const systemPrompt = "You are an AI that composes tweets with the given personality.";
      
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
      
      // 4. Generate image if enabled
      let imagePrompt = null;
      let mediaUrls: string[] = [];
      
      if (this.imageGenerationEnabled && imageGenActivity) {
        console.log("Generating image for tweet");
        imagePrompt = this.buildImagePrompt(tweetText, personalityData);
        
        const imageResult = await imageGenActivity.execute(
          apiKeys,
          state,
          { prompt: imagePrompt }
        );
        
        if (imageResult.success && imageResult.data?.url) {
          mediaUrls.push(imageResult.data.url);
        } else {
          console.warn("Image generation failed, proceeding with text-only tweet");
        }
      }
      
      // 5. Post the tweet
      const postResult = await xApiActivity.execute(
        apiKeys,
        state,
        { text: tweetText, mediaUrls }
      );
      
      if (!postResult.success) {
        return {
          success: false,
          error: postResult.error || "Unknown error posting tweet",
          data: null
        };
      }
      
      // 6. Return success
      console.log(`Successfully posted tweet: ${tweetText.substring(0, 50)}...`);
      
      return {
        success: true,
        data: postResult.data,
        error: null,
        metadata: {
          length: tweetText.length,
          model: chatResult.data.model,
          finishReason: chatResult.data.finishReason,
          promptUsed: promptText,
          imagePromptUsed: imagePrompt,
          imageCount: mediaUrls.length
        }
      };
      
    } catch (error) {
      console.error("Failed to post tweet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  private getRecentTweets(state: any): string[] {
    // In a real implementation, we would fetch from memory/database
    // For this mock implementation, we'll check if there's a tweetHistory in state
    const tweetHistory = state.tweetHistory || [];
    return tweetHistory.slice(0, 10);
  }
  
  private buildChatPrompt(personality: Record<string, any>, recentTweets: string[]): string {
    const traitLines = Object.entries(personality)
      .map(([trait, value]) => `${trait}: ${value}`)
      .join("\n");
    
    const personalityStr = traitLines || "(No personality traits defined)";
    
    const lastTweetsStr = recentTweets.length > 0
      ? recentTweets.map(tweet => `- ${tweet}`).join("\n")
      : "(No recent tweets)";
    
    return (
      `Our digital being has these personality traits:\n` +
      `${personalityStr}\n\n` +
      `Here are recent tweets:\n` +
      `${lastTweetsStr}\n\n` +
      `Write a new short tweet (under 280 chars), consistent with the above, ` +
      `but not repeating old tweets. Avoid hashtags or repeated phrases.\n`
    );
  }
  
  private buildImagePrompt(tweetText: string, personality: Record<string, any>): string {
    const personalityStr = Object.entries(personality)
      .map(([trait, value]) => `${trait}: ${value}`)
      .join("\n");
    
    return (
      `Our digital being has these personality traits:\n` +
      `${personalityStr}\n\n` +
      `And is creating a tweet with the text: ${tweetText}\n\n` +
      `Generate an image that represents the story of the tweet and reflects the personality traits. Do not include the tweet text in the image.`
    );
  }
}
