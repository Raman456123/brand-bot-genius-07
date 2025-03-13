
import { Activity, ActivityResult, ChatActivityOptions, ChatMessage, SkillConfig } from "../types";

/**
 * Chat activity that uses LLM APIs to generate responses
 */
export class ChatActivity implements Activity {
  public name: string = "chat";
  public description: string = "Communicates using LLM APIs to generate responses";
  public energyCost: number = 0.2;
  public cooldown: number = 60; // 1 minute cooldown in seconds
  public requiredApiKeys: string[] = ["OPENAI"]; // Changed from LITELLM to OPENAI for web context
  
  private modelName: string = "gpt-4o-mini";
  private systemPrompt: string = "You are a helpful AI assistant.";
  private maxTokens: number = 150;
  
  constructor(options?: ChatActivityOptions) {
    if (options) {
      this.modelName = options.modelName || this.modelName;
      this.systemPrompt = options.systemPrompt || this.systemPrompt;
      this.maxTokens = options.maxTokens || this.maxTokens;
    }
  }
  
  /**
   * Determines if the activity can run based on available keys and state
   */
  public async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to run chat activity");
      return false;
    }
    
    // Check if the required skill is available and enabled
    const skillConfig = state.skillsConfig?.openai_chat as SkillConfig | undefined;
    if (skillConfig && !skillConfig.enabled) {
      console.log("OpenAI chat skill is disabled");
      return false;
    }
    
    // Check if API key is available - either directly or from skill config
    const apiKey = apiKeys["OPENAI"] || skillConfig?.api_key_mapping?.["OPENAI"] || null;
    if (!apiKey) {
      console.log("No API key available for OpenAI chat");
      return false;
    }
    
    return true;
  }
  
  /**
   * Executes the chat activity with the provided prompt
   */
  public async execute(
    apiKeys: Record<string, string>, 
    state: any, 
    params?: { prompt: string; systemPrompt?: string }
  ): Promise<ActivityResult> {
    try {
      if (!params?.prompt) {
        return {
          success: false,
          error: "No prompt provided for chat activity",
          data: null
        };
      }
      
      console.log(`Starting chat activity with prompt: ${params.prompt.substring(0, 50)}...`);
      
      const messages: ChatMessage[] = [];
      
      // Add system prompt if provided
      const sysPrompt = params.systemPrompt || this.systemPrompt;
      if (sysPrompt) {
        messages.push({ role: "system", content: sysPrompt });
      }
      
      // Add user prompt
      messages.push({ role: "user", content: params.prompt });
      
      // Get API key from skill config mapping if available
      const skillConfig = state.skillsConfig?.openai_chat as SkillConfig | undefined;
      const apiKey = apiKeys["OPENAI"] || skillConfig?.api_key_mapping?.["OPENAI"] || null;
      
      if (!apiKey) {
        return {
          success: false,
          error: "No API key available for OpenAI",
          data: null
        };
      }
      
      // Get model name from skill config if available
      let modelToUse = this.modelName;
      if (skillConfig?.model_name) {
        modelToUse = skillConfig.model_name;
      } else if (state.skillsConfig?.default_llm_skill && state.skillsConfig.lite_llm?.model_name) {
        // Use default LLM model if available
        modelToUse = state.skillsConfig.lite_llm.model_name;
      }
      
      console.log(`Using model: ${modelToUse}`);
      
      // Call OpenAI API
      const response = await this.callOpenAI(apiKey, messages, modelToUse);
      
      if (!response.success) {
        console.error(`Error in chat activity: ${response.error}`);
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      console.log(`Successfully received response from chat API`);
      
      return {
        success: true,
        data: {
          content: response.data.content,
          model: response.data.model,
          finishReason: response.data.finishReason
        },
        error: null,
        metadata: {
          timestamp: new Date().toISOString(),
          model: response.data.model,
          promptLength: params.prompt.length
        }
      };
    } catch (error) {
      console.error("Error in chat activity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  /**
   * Calls the OpenAI API to get a response
   */
  private async callOpenAI(
    apiKey: string, 
    messages: ChatMessage[],
    modelName?: string
  ): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string 
  }> {
    try {
      console.log(`Making API call to OpenAI with model ${modelName || this.modelName}`);
      
      // Use the OpenAI key provided by the user
      const openAiKey = apiKey === "DEFAULT_OPENAI_KEY" 
        ? "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"
        : apiKey;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: modelName || this.modelName,
          messages,
          max_tokens: this.maxTokens,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        console.error(`OpenAI API error: ${errorMessage}`);
        
        if (response.status === 401) {
          return {
            success: false,
            error: `Authentication Error: Invalid API key or unauthorized access. Please check your OpenAI API key.`
          };
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "No choices returned from OpenAI"
        };
      }
      
      return {
        success: true,
        data: {
          content: data.choices[0].message.content,
          finishReason: data.choices[0].finish_reason,
          model: data.model
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error during API call";
      console.error(`Error calling OpenAI API: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
