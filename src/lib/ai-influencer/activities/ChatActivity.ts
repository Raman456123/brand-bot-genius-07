
import { Activity, ActivityResult, ChatActivityOptions, ChatMessage } from "../types";

/**
 * Chat activity that uses LLM APIs to generate responses
 */
export class ChatActivity implements Activity {
  public name: string = "chat";
  public description: string = "Communicates using LLM APIs to generate responses";
  public energyCost: number = 0.2;
  public cooldown: number = 60000; // 1 minute cooldown
  public requiredApiKeys: string[] = ["OPENAI"]; // Changed from LITELLM to OPENAI for web context
  
  private modelName: string = "gpt-4";
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
      return false;
    }
    
    // Check if API key is available
    return !!apiKeys["OPENAI"];
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
      
      const messages: ChatMessage[] = [];
      
      // Add system prompt if provided
      const sysPrompt = params.systemPrompt || this.systemPrompt;
      if (sysPrompt) {
        messages.push({ role: "system", content: sysPrompt });
      }
      
      // Add user prompt
      messages.push({ role: "user", content: params.prompt });
      
      // Call OpenAI API
      const response = await this.callOpenAI(apiKeys["OPENAI"], messages);
      
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      return {
        success: true,
        data: {
          content: response.data.content,
          model: response.data.model,
          finishReason: response.data.finishReason
        },
        error: null
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
    messages: ChatMessage[]
  ): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string 
  }> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          max_tokens: this.maxTokens,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || `API request failed with status ${response.status}`
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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during API call"
      };
    }
  }
}
