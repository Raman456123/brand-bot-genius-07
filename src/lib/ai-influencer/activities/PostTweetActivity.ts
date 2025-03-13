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
      const communicationStyle = state.communicationStyle || {};
      const backstory = state.backstory || {};
      const objectives = state.objectives || { primary: "Share interesting content" };
      const recentTweets = this.getRecentTweets(state);
      
      // 3. Generate tweet text with chat skill
      const promptText = this.buildChatPrompt(
        personalityData, 
        communicationStyle,
        backstory,
        objectives,
        recentTweets
      );
      
      // Create a system prompt that reflects the personality
      let systemPrompt = "You are an AI that composes tweets.";
      const brain = state.brain;
      if (brain && typeof brain.getSystemMessagesWithPersonality === 'function') {
        // Use the enhanced system prompt if available
        const messages = brain.getSystemMessagesWithPersonality(systemPrompt);
        systemPrompt = messages[0].content;
      }
      
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
        imagePrompt = this.buildImagePrompt(
          tweetText, 
          personalityData,
          objectives,
          state.preferences?.favorite_topics || []
        );
        
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
  
  private buildChatPrompt(
    personality: Record<string, any>, 
    communicationStyle: Record<string, any>,
    backstory: Record<string, any>,
    objectives: { primary: string; secondary?: string[] },
    recentTweets: string[]
  ): string {
    // Create a detailed personality description
    const personalityDesc = Object.entries(personality)
      .map(([trait, value]) => {
        // Convert the trait name to a more readable format
        const readableTrait = trait.replace(/_/g, ' ');
        return `${readableTrait}: ${(value as number).toFixed(1)}`;
      })
      .join("\n");
    
    // Add communication style
    let commStyleDesc = "";
    if (communicationStyle.tone) {
      const toneStr = Object.entries(communicationStyle.tone)
        .map(([tone, value]) => `${tone}: ${(value as number).toFixed(1)}`)
        .join(", ");
      commStyleDesc += `- Tone: ${toneStr}\n`;
    }
    if (communicationStyle.verbosity) {
      commStyleDesc += `- Verbosity: ${(communicationStyle.verbosity as number).toFixed(1)}\n`;
    }
    
    // Add backstory highlights
    let backstoryDesc = "";
    if (backstory.core_values && Array.isArray(backstory.core_values)) {
      backstoryDesc = `Core values: ${backstory.core_values.join(", ")}\n`;
    }
    
    // Add objectives
    const objectivesDesc = `Primary objective: ${objectives.primary}\n`;
    
    // Recent tweets
    const lastTweetsStr = recentTweets.length > 0
      ? recentTweets.map(tweet => `- ${tweet}`).join("\n")
      : "(No recent tweets)";
    
    return (
      `Our digital being has the following personality traits:\n` +
      `${personalityDesc}\n\n` +
      `Communication style:\n${commStyleDesc}\n` +
      `${backstoryDesc}` +
      `${objectivesDesc}\n` +
      `Here are recent tweets:\n` +
      `${lastTweetsStr}\n\n` +
      `Write a new short tweet (under 280 chars), that:
      1. Reflects the personality traits above, especially the most pronounced traits
      2. Is consistent with the communication style
      3. Aligns with the core values and objectives
      4. Is fresh (not repeating old tweets)
      5. Avoids excessive hashtags
      6. Feels authentic and engaging\n`
    );
  }
  
  private buildImagePrompt(
    tweetText: string, 
    personality: Record<string, any>,
    objectives: { primary: string; secondary?: string[] },
    favoriteTopics: string[]
  ): string {
    // Select the top 3 personality traits (highest values)
    const topTraits = Object.entries(personality)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([trait, value]) => `${trait.replace(/_/g, ' ')}: ${(value as number).toFixed(1)}`)
      .join("\n");
    
    const topicsStr = favoriteTopics.length > 0 
      ? `Favorite topics: ${favoriteTopics.join(", ")}`
      : "";
    
    return (
      `Generate an image that represents the following tweet, capturing the essence and mood:\n\n` +
      `"${tweetText}"\n\n` +
      `This image should reflect these dominant personality traits:\n${topTraits}\n\n` +
      `Primary objective: ${objectives.primary}\n` +
      `${topicsStr}\n\n` +
      `The image should be visually engaging, authentic to the personality, and relate to the tweet's message.` +
      `Do not include any text in the image. Focus on imagery that complements the tweet.`
    );
  }
}
