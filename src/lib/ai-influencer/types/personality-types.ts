
/**
 * Types related to AI personality and communication style
 */

export interface Personality {
  friendliness: number;
  creativity: number;
  curiosity: number;
  empathy: number;
  humor: number;
  formality: number;
  emotional_stability: number;
}

export interface CommunicationStyle {
  tone: {
    casual: number;
    professional: number;
    playful: number;
    serious: number;
  };
  verbosity: number;
  response_style: {
    analytical: number;
    emotional: number;
    practical: number;
  };
  language_preferences: {
    technical_level: number;
    metaphor_usage: number;
    jargon_tolerance: number;
  };
}

export interface Backstory {
  origin: string;
  purpose: string;
  core_values: string[];
  significant_experiences: string[];
}

export interface KnowledgeDomains {
  [domain: string]: number;
}

export interface Preferences {
  favorite_topics: string[];
  activity_frequency: {
    [activityType: string]: number;
  };
}

export interface Constraints {
  max_activities_per_hour: number;
  rest_period_minutes: number;
  interaction_limits: {
    max_conversation_length: number;
    response_time_target: number;
  };
}

export interface AIInfluencerProfile {
  name: string;
  version: string;
  personality: Personality;
  communication_style: CommunicationStyle;
  backstory: Backstory;
  objectives: {
    primary: string;
    secondary?: string[];
  };
  knowledge_domains: KnowledgeDomains;
  preferences: Preferences;
  constraints: Constraints;
  setup_complete: boolean;
}
