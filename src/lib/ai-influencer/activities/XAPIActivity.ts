
import { Activity, ActivityResult, TwitterPostOptions, TwitterPostResult } from "../types";

export class XAPIActivity implements Activity {
  name: string = "post_tweet";
  description: string = "Posts a tweet to X (Twitter) with optional media attachments";
  energyCost: number = 0.5;
  cooldown: number = 300000; // 5 minutes
  requiredApiKeys: string[] = ["TWITTER_API_KEY"];
  
  private rateLimit: number;
  private cooldownPeriod: number;
  private postsCount: number = 0;
  private twitterUsername: string;
  
  constructor(options: TwitterPostOptions = {}) {
    this.rateLimit = options.rateLimit || 100;
    this.cooldownPeriod = options.cooldownPeriod || 300; // seconds
    this.twitterUsername = options.twitterUsername || "YourUsername";
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient and API key is available
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to post a tweet");
      return false;
    }
    
    if (!apiKeys["TWITTER_API_KEY"]) {
      console.log("Twitter API key not available");
      return false;
    }
    
    // Check rate limits
    if (this.postsCount >= this.rateLimit) {
      console.log("Twitter post rate limit exceeded");
      return false;
    }
    
    return true;
  }
  
  async uploadMedia(mediaUrl: string, apiKey: string): Promise<string | null> {
    try {
      console.log(`Uploading media from URL: ${mediaUrl}`);
      
      // In a real implementation, we would:
      // 1. Download the image from mediaUrl
      // 2. Upload it to Twitter's media endpoint
      // 3. Return the media_id
      
      // For this mock implementation, we'll just return a simulated media ID
      const simulatedMediaId = `media_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      console.log(`Media uploaded successfully, ID: ${simulatedMediaId}`);
      return simulatedMediaId;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  }
  
  async execute(
    apiKeys: Record<string, string>, 
    state: any, 
    params?: { text: string; mediaUrls?: string[] }
  ): Promise<ActivityResult> {
    if (!params?.text) {
      return {
        success: false,
        error: "No tweet text provided",
        data: null
      };
    }
    
    try {
      console.log(`Preparing to post tweet: "${params.text.substring(0, 50)}..."`);
      
      // First handle media uploads if any
      const mediaIds: string[] = [];
      if (params.mediaUrls && params.mediaUrls.length > 0) {
        for (const url of params.mediaUrls) {
          const mediaId = await this.uploadMedia(url, apiKeys["TWITTER_API_KEY"]);
          if (mediaId) {
            mediaIds.push(mediaId);
          }
        }
      }
      
      // In a real implementation, we would call Twitter's API here
      // For this mock implementation, we'll simulate success
      
      // Simulate posting the tweet
      const tweetId = `tweet_${Date.now()}`;
      const tweetLink = `https://twitter.com/${this.twitterUsername}/status/${tweetId}`;
      
      // Increment post counter on successful post
      this.postsCount++;
      
      // Prepare the result data
      const tweetData: TwitterPostResult = {
        tweetId,
        content: params.text,
        tweetLink,
        mediaCount: mediaIds.length
      };
      
      console.log(`Tweet posted successfully! ID: ${tweetId}, Link: ${tweetLink}`);
      
      return {
        success: true,
        data: tweetData,
        error: null,
        metadata: {
          mediaIds,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error posting tweet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  resetCounts(): void {
    this.postsCount = 0;
  }
}
