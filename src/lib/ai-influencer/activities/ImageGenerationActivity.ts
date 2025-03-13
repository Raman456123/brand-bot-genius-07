
import { Activity, ActivityResult, ImageGenerationOptions } from "../types";

/**
 * Image Generation activity using AI image APIs
 */
export class ImageGenerationActivity implements Activity {
  public name: string = "generate_image";
  public description: string = "Generates images using AI image generation models";
  public energyCost: number = 0.5;
  public cooldown: number = 300000; // 5 minutes cooldown
  public requiredApiKeys: string[] = ["OPENAI"];
  
  private size: string = "1024x1024";
  private format: "png" | "jpg" = "png";
  private maxGenerationsPerDay: number = 50;
  private generationsCount: number = 0;
  
  constructor(options?: ImageGenerationOptions) {
    if (options) {
      this.size = options.size || this.size;
      this.format = options.format || this.format;
      this.maxGenerationsPerDay = options.maxGenerationsPerDay || this.maxGenerationsPerDay;
    }
    
    // Reset generations count on a new day
    this.checkAndResetDailyCount();
  }
  
  /**
   * Checks and resets the daily generation count if it's a new day
   */
  private checkAndResetDailyCount(): void {
    const lastResetDay = localStorage.getItem('last_image_gen_reset');
    const today = new Date().toDateString();
    
    if (lastResetDay !== today) {
      this.generationsCount = 0;
      localStorage.setItem('last_image_gen_reset', today);
    } else {
      // Retrieve current count from localStorage if available
      const savedCount = localStorage.getItem('image_gen_count');
      if (savedCount) {
        this.generationsCount = parseInt(savedCount, 10);
      }
    }
  }
  
  /**
   * Determines if the activity can run based on available keys, state, and limits
   */
  public async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      return false;
    }
    
    // Check if API key is available
    if (!apiKeys["OPENAI"]) {
      return false;
    }
    
    // Check if we've reached the daily limit
    this.checkAndResetDailyCount();
    return this.generationsCount < this.maxGenerationsPerDay;
  }
  
  /**
   * Executes the image generation activity with the provided prompt
   */
  public async execute(
    apiKeys: Record<string, string>, 
    state: any, 
    params?: { prompt: string; size?: string; format?: "png" | "jpg" }
  ): Promise<ActivityResult> {
    try {
      if (!params?.prompt) {
        return {
          success: false,
          error: "No prompt provided for image generation",
          data: null
        };
      }
      
      // Ensure we have the latest count
      this.checkAndResetDailyCount();
      
      if (this.generationsCount >= this.maxGenerationsPerDay) {
        return {
          success: false,
          error: "Daily generation limit reached",
          data: null
        };
      }
      
      const size = params.size || this.size;
      const format = params.format || this.format;
      
      // Call OpenAI API for image generation
      const response = await this.callOpenAIImageAPI(apiKeys["OPENAI"], params.prompt, size);
      
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      // Increment and save the generation count
      this.generationsCount++;
      localStorage.setItem('image_gen_count', this.generationsCount.toString());
      
      // Generate a random seed and ID for consistency with the Python version
      const seed = Math.floor(Math.random() * 9000) + 1000;
      const generationId = `gen_${this.generationsCount}`;
      
      // Extract dimensions from size string
      const [width, height] = size.split('x').map(dim => parseInt(dim, 10));
      
      const imageData = {
        width,
        height,
        format,
        seed,
        generationId,
        url: response.data.url,
      };
      
      return {
        success: true,
        data: imageData,
        error: null,
        metadata: {
          prompt: params.prompt,
          generationNumber: this.generationsCount
        }
      };
    } catch (error) {
      console.error("Error in image generation activity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  /**
   * Calls the OpenAI API to generate an image
   */
  private async callOpenAIImageAPI(
    apiKey: string, 
    prompt: string,
    size: string
  ): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string 
  }> {
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size,
          response_format: "url"
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
      
      if (!data.data || data.data.length === 0) {
        return {
          success: false,
          error: "No images returned from OpenAI"
        };
      }
      
      return {
        success: true,
        data: {
          url: data.data[0].url,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during API call"
      };
    }
  }
  
  /**
   * Reset the generation counter (for testing purposes)
   */
  public resetCounts(): void {
    this.generationsCount = 0;
    localStorage.setItem('image_gen_count', '0');
  }
}
