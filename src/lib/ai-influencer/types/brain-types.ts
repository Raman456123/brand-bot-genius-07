
/**
 * Types related to the AI brain and state management
 */

import { Personality, CommunicationStyle, Backstory, KnowledgeDomains, Preferences, Constraints, AIInfluencerProfile } from './personality-types';
import { Activity, ActivityResult } from './activity-types';
import { SkillsConfig, ChatMessage } from './api-types';

export interface AIState {
  mood: string;
  energy: number;
  lastActivity: string;
  lastActivityTimestamp?: string;
  activeGoals?: string[];
  personality?: Personality;
  communicationStyle?: CommunicationStyle;
  backstory?: Backstory;
  objectives?: {
    primary: string;
    secondary?: string[];
  };
  knowledgeDomains?: KnowledgeDomains;
  preferences?: Preferences;
  constraints?: Constraints;
  profile?: AIInfluencerProfile;
  activityConstraints?: {
    activities_config?: Record<string, { enabled: boolean }>;
    activity_requirements?: Record<string, {
      required_skills?: string[];
      min_memory_space?: number;
    }>;
  };
  availableSkills?: string[];
  availableMemorySpace?: number;
  skillsConfig?: SkillsConfig;
}

export interface AIBrainInterface {
  loadState(): Promise<void>;
  saveState(): Promise<void>;
  getState(): AIState;
  
  // Core functionality
  selectNextActivity(): Promise<Activity | null>;
  executeActivity(activityName: string, params?: any): Promise<ActivityResult>;
  
  // Activity management
  getAvailableActivities(): Activity[];
  loadActivities(): void;
  
  // Configuration management
  loadProfile(profile: AIInfluencerProfile): void;
  
  // API key management
  setApiKey(activityName: string, keyName: string, keyValue: string): Promise<boolean>;
  getApiKeyStatuses(): Promise<Record<string, Record<string, boolean>>>;
  
  // Personality integration methods
  getPersonalityPrompt(): string;
  getCommunicationStylePrompt(): string;
  enhancePromptWithPersonality(basePrompt: string): string;
  getSystemMessagesWithPersonality(baseSystemMessage: string): ChatMessage[];
}
