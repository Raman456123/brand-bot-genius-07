
import { AIState, Activity, ActivityResult, AIInfluencerProfile } from './types';

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
}
