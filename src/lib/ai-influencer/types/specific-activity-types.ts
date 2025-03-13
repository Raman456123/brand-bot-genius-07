
/**
 * Types for specific activities
 */

import { ChatMessage } from './api-types';

export interface ChatActivityOptions {
  modelName: string;
  systemPrompt?: string;
  maxTokens?: number;
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

export interface DailyThoughtOptions {
  systemPrompt?: string;
  maxTokens?: number;
}

export interface DailyThoughtResult {
  thought: string;
  model?: string;
  finishReason?: string;
}

export interface DrawActivityOptions {
  defaultSize?: string;
  defaultFormat?: "png" | "jpg";
  maxGenerationsPerDay?: number;
}

export interface DrawActivityResult {
  generationId: string;
  prompt: string;
  imageUrl: string;
  width: number;
  height: number;
}

export interface EvaluateActivityOptions {
  systemPrompt?: string;
  maxTokens?: number;
}

export interface EvaluateActivityResult {
  evaluation: string;
  model?: string;
  finishReason?: string;
}

export interface FetchNewsOptions {
  topics?: string[];
  maxArticles?: number;
}

export interface NewsArticle {
  title: string;
  topic: string;
  summary: string;
  url: string;
}

export interface FetchNewsResult {
  articles: NewsArticle[];
  count: number;
}

export interface NapOptions {
  napMinutes?: number;
}

export interface NapResult {
  napMinutes: number;
}

export interface PostRecentMemoriesTweetOptions {
  numActivitiesToFetch?: number;
  twitterUsername?: string;
  ignoredActivityTypes?: string[];
}

export interface PostRecentMemoriesTweetResult {
  tweetId: string;
  content: string;
  tweetLink: string;
  recentMemoriesUsed: string[];
  imageCount: number;
}

export interface SuggestNewActivitiesOptions {
  systemPrompt?: string;
  maxTokens?: number;
}

export interface SuggestNewActivitiesResult {
  suggestions: string;
  model?: string;
  finishReason?: string;
}
