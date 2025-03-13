
export interface ActivityResult {
  success: boolean;
  data: any | null;
  error: string | null;
  metadata?: Record<string, any>;
}

export interface Activity {
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  requiredApiKeys?: string[];
  canRun: (apiKeys: Record<string, string>, state: any) => Promise<boolean>;
  execute: (apiKeys: Record<string, string>, state: any, params?: any) => Promise<ActivityResult>;
}

export interface AIState {
  mood: string;
  energy: number;
  lastActivity: string;
  lastActivityTimestamp?: string;
  activeGoals?: string[];
  personality?: Record<string, any>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  finishReason: string;
  model: string;
}

export interface ChatActivityOptions {
  modelName: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface ApiKeyManager {
  getApiKey: (activityName: string, keyName: string) => Promise<string | null>;
  setApiKey: (activityName: string, keyName: string, keyValue: string) => Promise<boolean>;
  getApiKeyStatuses: () => Promise<Record<string, Record<string, boolean>>>;
}

export interface Integration {
  name: string;
  displayName: string;
  description: string;
  authModes: string[];
  connected: boolean;
  logoUrl?: string;
  connect?: () => Promise<boolean>;
  disconnect?: () => Promise<boolean>;
}

export interface ImageGenerationOptions {
  size?: string;
  format?: "png" | "jpg";
  maxGenerationsPerDay?: number;
}

export interface ImageGenerationResult {
  url: string;
  width: number;
  height: number;
  format: string;
  seed: number;
  generationId: string;
  prompt: string;
}

export interface WebScrapingOptions {
  parseHtml?: boolean;
  timeout?: number;
}

export interface WebScrapingResult {
  statusCode: number;
  content: string;
  parsed?: {
    title?: string | null;
    bodyText?: string;
  };
  url: string;
}

export interface TwitterPostOptions {
  rateLimit?: number;
  cooldownPeriod?: number;
  twitterUsername?: string;
}

export interface TwitterPostResult {
  tweetId: string;
  content: string;
  tweetLink: string;
  mediaCount: number;
}

export interface TwitterMediaUploadResult {
  mediaId: string;
}

export interface AnalyzeDailyOptions {
  systemPrompt?: string;
  maxTokens?: number;
  activityLimit?: number;
}

export interface AnalyzeDailyResult {
  reflection: string;
  model: string;
  finishReason: string;
}

export interface GitHubCommitAnalysisOptions {
  githubOwner: string;
  githubRepo: string;
  githubBranch?: string;
  lookbackHours?: number;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface GitHubCommitAnalysisResult {
  analysis: string;
  newCommitCount: number;
  commitsAnalyzed: string[];
  model?: string;
  finishReason?: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

export interface BuildOrUpdateActivityOptions {
  systemPrompt?: string;
  maxTokens?: number;
  recentActivitiesLimit?: number;
}

export interface BuildOrUpdateActivityResult {
  filename: string;
  codeSnippet: string;
  message: string;
}
