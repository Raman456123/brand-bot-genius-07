
/**
 * Types related to API integrations and services
 */

export interface SkillsConfig {
  image_generation?: SkillConfig;
  openai_chat?: SkillConfig;
  web_scraping?: SkillConfig;
  twitter_posting?: SkillConfig;
  default_llm_skill?: string;
  lite_llm?: SkillConfig;
  [key: string]: SkillConfig | string | undefined;
}

export interface SkillConfig {
  enabled: boolean;
  max_generations_per_day?: number;
  supported_formats?: string[];
  required_api_keys?: string[];
  api_key_mapping?: Record<string, string>;
  model_name?: string;
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

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  finishReason: string;
  model: string;
}
