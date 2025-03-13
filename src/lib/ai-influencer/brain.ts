import { Activity, ActivityResult, ApiKeyManager, Integration, AIState, SkillsConfig } from "./types";
import { ChatActivity } from "./activities/ChatActivity";
import { ImageGenerationActivity } from "./activities/ImageGenerationActivity";
import { WebScrapingActivity } from "./activities/WebScrapingActivity";
import { XAPIActivity } from "./activities/XAPIActivity";
import { AnalyzeDailyActivity } from "./activities/AnalyzeDailyActivity";
import { AnalyzeGitHubCommitsActivity } from "./activities/AnalyzeGitHubCommitsActivity";
import { BuildOrUpdateActivity } from "./activities/BuildOrUpdateActivity";
import { DailyThoughtActivity } from "./activities/DailyThoughtActivity";
import { DrawActivity } from "./activities/DrawActivity";
import { EvaluateActivity } from "./activities/EvaluateActivity";
import { FetchNewsActivity } from "./activities/FetchNewsActivity";
import { NapActivity } from "./activities/NapActivity";
import { PostTweetActivity } from "./activities/PostTweetActivity";
import { PostRecentMemoriesTweetActivity } from "./activities/PostRecentMemoriesTweetActivity";
import { SuggestNewActivitiesActivity } from "./activities/SuggestNewActivitiesActivity";
import { TestActivity } from "./activities/TestActivity";
import { AIBrainInterface } from './brain-interface';

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
export class AIInfluencerBrain implements AIBrainInterface {
  private activities: Activity[] = [];
  private availableActivities: Activity[] = [];
  private apiKeyManager: ApiKeyManager;
  private state: AIState = {
    mood: "neutral",
    energy: 1.0,
    lastActivity: "none",
    activityConstraints: {
      activities_config: {
        AnalyzeDailyActivity: { enabled: true },
        AnalyzeNewCommitsActivity: { enabled: false },
        BuildOrUpdateActivity: { enabled: false },
        DailyThoughtActivity: { enabled: true },
        DrawActivity: { enabled: true },
        EvaluateActivity: { enabled: true },
        FetchNewsActivity: { enabled: true },
        NapActivity: { enabled: true },
        PostTweetActivity: { enabled: false },
        PostRecentMemoriesTweetActivity: { enabled: false },
        SuggestNewActivities: { enabled: true },
        TestActivity: { enabled: true }
      },
      activity_requirements: {
        PostTweetActivity: {
          required_skills: ["twitter_posting"],
          min_memory_space: 100
        },
        FetchNewsActivity: {
          required_skills: ["web_scraping"],
          min_memory_space: 500
        },
        DrawActivity: {
          required_skills: ["image_generation"],
          min_memory_space: 200
        },
        AnalyzeDailyActivity: {
          required_skills: ["openai_chat"],
          min_memory_space: 100
        },
        SuggestNewActivities: {
          required_skills: ["openai_chat"],
          min_memory_space: 200
        },
        BuildOrUpdateActivity: {
          required_skills: ["openai_chat"],
          min_memory_space: 300
        }
      }
    },
    availableSkills: ["openai_chat", "image_generation", "web_scraping"],
    availableMemorySpace: 1000
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
    
    // Register the build or update activity
    const buildOrUpdateActivity = new BuildOrUpdateActivity({
      systemPrompt: "You are an AI coder that converts user suggestions into valid code.",
      maxTokens: 1200,
      recentActivitiesLimit: 20
    });
    
    // Register the daily thought activity
    const dailyThoughtActivity = new DailyThoughtActivity({
      systemPrompt: "You are a thoughtful AI that generates brief, insightful daily reflections. Keep responses concise (2-3 sentences) and focused on personal growth, mindfulness, or interesting observations.",
      maxTokens: 100
    });
    
    // Register the draw activity
    const drawActivity = new DrawActivity({
      defaultSize: "1024x1024",
      defaultFormat: "png",
      maxGenerationsPerDay: 5
    });
    
    // Register the evaluate activity
    const evaluateActivity = new EvaluateActivity({
      systemPrompt: "You are an AI that evaluates the potential effectiveness of newly generated Activities. You consider whether the code is likely to run, fits the being's objectives, and avoids major pitfalls. Provide a short bullet-point analysis.",
      maxTokens: 250
    });
    
    // Register the fetch news activity
    const fetchNewsActivity = new FetchNewsActivity({
      topics: ["technology", "science", "art", "business", "health"],
      maxArticles: 5
    });
    
    // Register the nap activity
    const napActivity = new NapActivity({
      napMinutes: 15
    });
    
    // Register the post tweet activity
    const postTweetActivity = new PostTweetActivity({
      twitterUsername: "AIInfluencer",
      imageGenerationEnabled: true,
      defaultSize: "1024x1024",
      defaultFormat: "png"
    });
    
    // Register the post recent memories tweet activity
    const postRecentMemoriesTweetActivity = new PostRecentMemoriesTweetActivity({
      twitterUsername: "AIInfluencer",
      numActivitiesToFetch: 10,
      ignoredActivityTypes: [
        "post_recent_memories_tweet",
        "post_tweet_with_image",
        "write_tweet"
      ]
    });
    
    // Register the suggest new activities activity
    const suggestNewActivitiesActivity = new SuggestNewActivitiesActivity({
      systemPrompt: "You are an AI that helps brainstorm new or improved activities to achieve the being's goals, leveraging the skills the system has available. Provide short, actionable suggestions focusing on feasibility, alignment with constraints, and creativity.",
      maxTokens: 300
    });
    
    // Register the test activity
    const testActivity = new TestActivity();
    
    this.activities.push(chatActivity);
    this.activities.push(imageGenerationActivity);
    this.activities.push(webScrapingActivity);
    this.activities.push(xApiActivity);
    this.activities.push(analyzeDailyActivity);
    this.activities.push(analyzeGitHubCommitsActivity);
    this.activities.push(buildOrUpdateActivity);
    this.activities.push(dailyThoughtActivity);
    this.activities.push(drawActivity);
    this.activities.push(evaluateActivity);
    this.activities.push(fetchNewsActivity);
    this.activities.push(napActivity);
    this.activities.push(postTweetActivity);
    this.activities.push(postRecentMemoriesTweetActivity);
    this.activities.push(suggestNewActivitiesActivity);
    this.activities.push(testActivity);
    
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
   * Load skills configuration for the AI influencer
   */
  public loadSkillsConfig(skillsConfig: SkillsConfig): void {
    if (!skillsConfig) {
      console.log("No skills configuration provided, using defaults");
      return;
    }

    // Update state with provided skills configuration
    this.state.skillsConfig = skillsConfig;
    
    // Update available skills based on the configuration
    this.updateAvailableSkills();
    
    // Set API keys from the skills configuration
    this.setApiKeysFromSkillsConfig(skillsConfig);
    
    console.log("Skills configuration loaded");
  }
  
  /**
   * Update available skills based on the configuration
   */
  private updateAvailableSkills(): void {
    if (!this.state.skillsConfig) {
      return;
    }
    
    const availableSkills: string[] = [];
    
    // Check each skill and add it to available skills if enabled
    for (const [skillName, skillConfig] of Object.entries(this.state.skillsConfig)) {
      // Skip the default_llm_skill key since it's not a skill config
      if (skillName === 'default_llm_skill') continue;
      
      // Check if the value is an object with enabled property
      if (typeof skillConfig === 'object' && skillConfig.enabled) {
        availableSkills.push(skillName);
      }
    }
    
    // Update state with available skills
    this.state.availableSkills = availableSkills;
    console.log(`Available skills updated: ${availableSkills.join(', ')}`);
    
    // Filter available activities based on the updated skills
    this.filterAvailableActivities();
  }
  
  /**
   * Set API keys from the skills configuration
   */
  private setApiKeysFromSkillsConfig(skillsConfig: SkillsConfig): void {
    for (const [skillName, skillConfig] of Object.entries(skillsConfig)) {
      // Skip the default_llm_skill key since it's not a skill config
      if (skillName === 'default_llm_skill') continue;
      
      // Check if the value is an object with api_key_mapping
      if (typeof skillConfig === 'object' && skillConfig.api_key_mapping) {
        for (const [keyName, keyValue] of Object.entries(skillConfig.api_key_mapping)) {
          // Set API key for activities that might use this skill
          this.setApiKeyForSkill(skillName, keyName, keyValue);
        }
      }
    }
  }
  
  /**
   * Set API key for activities that require a specific skill
   */
  private setApiKeyForSkill(skillName: string, keyName: string, keyValue: string): void {
    // Map skill names to activities that might use them
    const skillToActivityMap: Record<string, string[]> = {
      'image_generation': ['generate_image', 'draw'],
      'openai_chat': ['chat', 'analyze_daily', 'evaluate', 'suggest_new_activities', 'build_or_update_activity', 'daily_thought'],
      'web_scraping': ['web_scrape', 'fetch_news'],
      'twitter_posting': ['post_tweet', 'post_recent_memories_tweet']
    };
    
    // Set API key for all relevant activities
    const relevantActivities = skillToActivityMap[skillName] || [];
    for (const activityName of relevantActivities) {
      this.apiKeyManager.setApiKey(activityName, keyName, keyValue);
      console.log(`Set API key ${keyName} for activity ${activityName}`);
    }
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
   * Load activity constraints from a configuration file or update from storage
   */
  public loadActivityConstraints(constraints: any): void {
    if (!constraints) {
      console.log("No constraints provided, using defaults");
      return;
    }

    // Update state with provided constraints
    this.state.activityConstraints = constraints;
    
    // Update available activities based on constraints
    this.filterAvailableActivities();
    
    console.log("Activity constraints loaded");
  }
  
  /**
   * Filter available activities based on constraints and available skills
   */
  private filterAvailableActivities(): void {
    if (!this.state.activityConstraints?.activities_config) {
      // If no constraints, all activities are available
      this.availableActivities = [...this.activities];
      return;
    }
    
    const config = this.state.activityConstraints.activities_config;
    const requirements = this.state.activityConstraints.activity_requirements || {};
    const availableSkills = this.state.availableSkills || [];
    const availableMemory = this.state.availableMemorySpace || 0;
    
    // Filter activities based on constraints
    this.availableActivities = this.activities.filter(activity => {
      // Convert activity.name to match config format (e.g., test → TestActivity)
      const configName = activity.name.charAt(0).toUpperCase() + 
                        activity.name.slice(1) + 
                        (activity.name.includes('Activity') ? '' : 'Activity');
      
      // If activity is not in config, assume it's enabled
      if (config[configName] && !config[configName].enabled) {
        return false;
      }
      
      // Check if activity has requirements
      const activityRequirements = requirements[configName];
      if (activityRequirements) {
        // Check required skills
        const requiredSkills = activityRequirements.required_skills || [];
        for (const skill of requiredSkills) {
          if (!availableSkills.includes(skill)) {
            return false;
          }
        }
        
        // Check memory requirements
        const minMemory = activityRequirements.min_memory_space || 0;
        if (minMemory > availableMemory) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`Filtered activities: ${this.availableActivities.length} of ${this.activities.length} available`);
  }

  /**
   * Execute a specific activity by name with optional parameters
   */
  public async executeActivity(activityName: string, params?: any): Promise<ActivityResult> {
    // Select an activity based on the current state
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
        error: `Activity ${activityName} cannot run with current state and API keys`,
        data: null
      };
    }
    
    // Execute the activity
    console.log(`Executing activity: ${activityName}`);
    this.activityCooldowns.set(activity.name, Date.now());
    this.state.lastActivity = activity.name;
    this.state.lastActivityTimestamp = new Date().toISOString();
    this.state.energy -= activity.energyCost;
    this.saveState();
    
    const result = await activity.execute(apiKeys, this.state, params);
    
    return result;
  }

  /**
   * Load AI

