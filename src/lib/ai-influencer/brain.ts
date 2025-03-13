import { Activity, ActivityResult, ApiKeyManager, Integration, AIState } from "./types";
import { ChatActivity } from "./activities/ChatActivity";
import { ImageGenerationActivity } from "./activities/ImageGenerationActivity";
import { WebScrapingActivity } from "./activities/WebScrapingActivity";
import { XAPIActivity } from "./activities/XAPIActivity";
import { AnalyzeDailyActivity } from "./activities/AnalyzeDailyActivity";
import { AnalyzeGitHubCommitsActivity } from "./activities/AnalyzeGitHubCommitsActivity";

/**
 * In-memory API key manager for the AI influencer
 */
class EnhancedApiKeyManager implements ApiKeyManager {
  private apiKeys: Record<string, Record<string, string>> = {};

  async getApiKey(activityName: string, keyName: string): Promise<string | null> {
    return this.apiKeys[activityName]?.[keyName] || null;
  }

  async setApiKey(activityName: string, keyName: string, keyValue: string): Promise<boolean> {
    if (!this.apiKeys[activityName]) {
      this.apiKeys[activityName] = {};
    }
    this.apiKeys[activityName][keyName] = keyValue;
    return true;
  }

  async getApiKeyStatuses(): Promise<Record<string, Record<string, boolean>>> {
    const statuses: Record<string, Record<string, boolean>> = {};
    for (const activityName in this.apiKeys) {
      statuses[activityName] = {};
      for (const keyName in this.apiKeys[activityName]) {
        statuses[activityName][keyName] = !!this.apiKeys[activityName][keyName];
      }
    }
    return statuses;
  }
}

/**
 * Brain for the AI influencer that manages state, activities, and decision making
 */
export class AIInfluencerBrain {
  private activities: Activity[] = [];
  private availableActivities: Activity[] = [];
  private apiKeyManager: ApiKeyManager;
  private state: AIState = {
    mood: "neutral",
    energy: 1.0,
    lastActivity: "none"
  };
  private storageKey = "ai_influencer_state";
  private activityCooldowns: Map<string, number> = new Map();
  private integrations: Integration[] = [];

  constructor() {
    this.apiKeyManager = new EnhancedApiKeyManager();
    this.initializeActivities();
    this.loadState();
  }

  /**
   * Initialize activities that the AI influencer can perform
   */
  private initializeActivities(): void {
    // Register the chat activity by default
    const chatActivity = new ChatActivity({
      modelName: "gpt-4o-mini",
      systemPrompt: "You are a helpful AI assistant.",
      maxTokens: 150
    });
    
    // Register the image generation activity
    const imageGenerationActivity = new ImageGenerationActivity({
      size: "1024x1024",
      format: "png",
      maxGenerationsPerDay: 5 // Limit for testing
    });
    
    // Register the web scraping activity
    const webScrapingActivity = new WebScrapingActivity({
      parseHtml: true,
      timeout: 10000
    });
    
    // Register the Twitter API activity
    const xApiActivity = new XAPIActivity({
      rateLimit: 10, // Lower for testing
      cooldownPeriod: 300,
      twitterUsername: "AIInfluencer"
    });
    
    // Register the daily analysis activity
    const analyzeDailyActivity = new AnalyzeDailyActivity({
      systemPrompt: "You are an AI that helps summarize the events and activities from recent memory. Keep the reflection concise and highlight any patterns or insights.",
      maxTokens: 200,
      activityLimit: 15
    });
    
    // Register the GitHub commits analysis activity
    const analyzeGitHubCommitsActivity = new AnalyzeGitHubCommitsActivity({
      githubOwner: "yoheinakajima",
      githubRepo: "pippin",
      githubBranch: "main",
      lookbackHours: 144,
      systemPrompt: "You are a code review assistant. Summarize and analyze the following commits in detail.",
      maxTokens: 500
    });
    
    this.activities.push(chatActivity);
    this.activities.push(imageGenerationActivity);
    this.activities.push(webScrapingActivity);
    this.activities.push(xApiActivity);
    this.activities.push(analyzeDailyActivity);
    this.activities.push(analyzeGitHubCommitsActivity);
    
    // Example activities (replace with your actual activities)
    this.activities.push({
      name: "get_trending_topics",
      description: "Fetches trending topics from social media",
      energyCost: 0.3,
      cooldown: 300000, // 5 minutes
      requiredApiKeys: ["TRENDSAPI"],
      canRun: async (apiKeys: Record<string, string>, state: any) => {
        // Check if energy is sufficient and API key is available
        return state.energy > 0.3 && !!apiKeys["TRENDSAPI"];
      },
      execute: async (apiKeys: Record<string, string>, state: any) => {
        // Placeholder for fetching trending topics
        console.log("Fetching trending topics with API key:", apiKeys["TRENDSAPI"]);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        return {
          success: true,
          data: { topics: ["Topic 1", "Topic 2", "Topic 3"] },
          error: null
        };
      }
    });

    this.activities.push({
      name: "write_tweet",
      description: "Writes a tweet about a given topic",
      energyCost: 0.2,
      cooldown: 180000, // 3 minutes
      requiredApiKeys: ["TWITTERAPI"],
      canRun: async (apiKeys: Record<string, string>, state: any) => {
        // Check if energy is sufficient and API key is available
        return state.energy > 0.2 && !!apiKeys["TWITTERAPI"];
      },
      execute: async (apiKeys: Record<string, string>, state: any, params: any) => {
        // Placeholder for writing a tweet
        if (!params?.topic) {
          return {
            success: false,
            error: "No topic provided for tweet",
            data: null
          };
        }
        console.log("Writing tweet about", params.topic, "with API key:", apiKeys["TWITTERAPI"]);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        return {
          success: true,
          data: { tweetId: "1234567890" },
          error: null
        };
      }
    });

    this.availableActivities = [...this.activities];
  }

  /**
   * Load activities from storage or initialize them
   * This method is added to fix the controller.ts error
   */
  public loadActivities(): void {
    // Activities are already initialized in the constructor
    // This method exists to satisfy the controller interface
    this.initializeActivities();
  }

  /**
   * Load state from local storage
   */
  private loadState(): void {
    try {
      const storedState = localStorage.getItem(this.storageKey);
      if (storedState) {
        this.state = JSON.parse(storedState);
      }
    } catch (error) {
      console.error("Error loading state from local storage:", error);
    }
  }

  /**
   * Save state to local storage
   */
  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error("Error saving state to local storage:", error);
    }
  }

  /**
   * Get the current state of the AI influencer
   */
  public getState(): AIState {
    return this.state;
  }

  /**
   * Get available activities
   */
  public getAvailableActivities(): Activity[] {
    return this.availableActivities;
  }

  /**
   * Get available integrations
   */
  public getAvailableIntegrations(): Integration[] {
    return this.integrations;
  }

  /**
   * Add an integration
   */
  public addIntegration(integration: Integration): void {
    this.integrations.push(integration);
  }

  /**
   * Set API key for a specific activity
   */
  public async setApiKey(activityName: string, keyName: string, keyValue: string): Promise<boolean> {
    return this.apiKeyManager.setApiKey(activityName, keyName, keyValue);
  }

  /**
   * Get API key statuses for all activities
   */
  public async getApiKeyStatuses(): Promise<Record<string, Record<string, boolean>>> {
    return this.apiKeyManager.getApiKeyStatuses();
  }

  /**
   * Select the next activity to run (fix for controller.ts error)
   */
  public selectNextActivity(): Activity | null {
    return this.selectActivity();
  }

  /**
   * Run a single activity cycle
   */
  public async runActivityCycle(): Promise<ActivityResult> {
    // Select an activity based on the current state
    const activity = this.selectActivity();

    if (!activity) {
      return {
        success: false,
        error: "No suitable activity found",
        data: null
      };
    }

    // Execute the selected activity
    return this.executeActivity(activity.name);
  }

  /**
   * Select an activity based on the current state
   */
  private selectActivity(): Activity | null {
    // Filter activities that can run and are not on cooldown
    const availableActivities = this.availableActivities.filter(activity => {
      const lastRun = this.activityCooldowns.get(activity.name);
      const isOnCooldown = lastRun && Date.now() - lastRun < activity.cooldown;
      return !isOnCooldown;
    });

    if (availableActivities.length === 0) {
      return null;
    }

    // Simple random selection for now
    const randomIndex = Math.floor(Math.random() * availableActivities.length);
    return availableActivities[randomIndex];
  }

  /**
   * Execute a specific activity by name with optional parameters
   */
  public async executeActivity(activityName: string, params?: any): Promise<ActivityResult> {
    const activity = this.activities.find(a => a.name === activityName);
    
    if (!activity) {
      return {
        success: false,
        error: `Activity ${activityName} not found`,
        data: null
      };
    }
    
    // Check if activity is on cooldown
    const lastRun = this.activityCooldowns.get(activity.name);
    if (lastRun && Date.now() - lastRun < activity.cooldown) {
      return {
        success: false,
        error: `Activity ${activityName} is on cooldown`,
        data: null
      };
    }
    
    // Get API keys for the activity
    const apiKeys: Record<string, string> = {};
    for (const keyName of activity.requiredApiKeys || []) {
      const key = await this.apiKeyManager.getApiKey(activity.name, keyName);
      if (key) {
        apiKeys[keyName] = key;
      }
    }
    
    // Check if activity can run
    const canRun = await activity.canRun(apiKeys, this.state);
    if (!canRun) {
      return {
        success: false,
        error: `Activity ${activity.name} cannot run in current state`,
        data: null
      };
    }
    
    // Execute activity
    try {
      // Consume energy
      this.state.energy = Math.max(0, this.state.energy - activity.energyCost);
      
      // Execute activity
      const result = await activity.execute(apiKeys, this.state, params);
      
      // Set cooldown
      this.activityCooldowns.set(activity.name, Date.now());
      
      // Update state
      if (result.success) {
        this.state.lastActivity = activity.name;
        this.state.lastActivityTimestamp = new Date().toISOString();
        this.saveState();
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing activity ${activity.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
}
