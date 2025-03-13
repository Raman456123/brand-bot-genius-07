export interface ActivityResult {
  success: boolean;
  data: any | null;
  error: string | null;
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
