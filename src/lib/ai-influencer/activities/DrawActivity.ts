
import { Activity, ActivityResult, DrawActivityOptions, DrawActivityResult, SkillConfig } from "../types";
import { ImageGenerationActivity } from "./ImageGenerationActivity";

/**
 * Draw activity that generates images based on AI's current state
 */
export class DrawActivity implements Activity {
  public name: string = "draw";
  public description: string = "Generates artwork based on current mood and personality";
  public energyCost: number = 0.6;
  public cooldown: number = 3600; // 1 hour in seconds
  public requiredApiKeys: string[] = ["OPENAI"];
  
  private defaultSize: string;
  private defaultFormat: "png" | "jpg";
  private imageGenerationActivity: ImageGenerationActivity;
  
  constructor(options: DrawActivityOptions = {}) {
    this.defaultSize = options.defaultSize || "1024x1024";
    this.defaultFormat = options.defaultFormat || "png";
    
    // Initialize the ImageGenerationActivity to use for generating images
    this.imageGenerationActivity = new ImageGenerationActivity({
      size: this.defaultSize,
      format: this.defaultFormat,
      maxGenerationsPerDay: options.maxGenerationsPerDay || 50
    });
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to generate artwork");
      return false;
    }
    
    // Check if the required skill is available and enabled
    const skillConfig = state.skillsConfig?.image_generation as SkillConfig | undefined;
    if (skillConfig && !skillConfig.enabled) {
      console.log("Image generation skill is disabled");
      return false;
    }
    
    // Check if the ImageGenerationActivity can run (requires OpenAI API key)
    return await this.imageGenerationActivity.canRun(apiKeys, state);
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Starting drawing activity...");
      
      // Generate a prompt based on current state
      const prompt = this.generatePrompt(state);
      
      // Get format from skill config if available
      const skillConfig = state.skillsConfig?.image_generation as SkillConfig | undefined;
      let format = this.defaultFormat;
      
      if (skillConfig?.supported_formats && skillConfig.supported_formats.length > 0) {
        // Use the first supported format from the config
        format = skillConfig.supported_formats[0] as "png" | "jpg";
      }
      
      // Generate the image using ImageGenerationActivity
      const response = await this.imageGenerationActivity.execute(apiKeys, state, { 
        prompt: prompt,
        format: format
      });
      
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null
        };
      }
      
      // Format the result
      const result: DrawActivityResult = {
        generationId: response.data.generationId,
        prompt: prompt,
        imageUrl: response.data.url,
        width: response.data.width,
        height: response.data.height
      };
      
      return {
        success: true,
        data: result,
        error: null,
        metadata: {
          timestamp: new Date().toISOString(),
          size: this.defaultSize,
          format: format
        }
      };
      
    } catch (error) {
      console.error("Error in DrawActivity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  /**
   * Generate a drawing prompt based on current state and personality
   */
  private generatePrompt(state: any): string {
    const mood = state.mood || "neutral";
    const personality = state.personality || {};
    
    // Base prompts for different moods
    const moodPrompts: Record<string, string> = {
      "happy": "a sunny landscape with vibrant colors",
      "neutral": "a peaceful scene with balanced composition",
      "sad": "a rainy day with muted colors"
    };
    
    // Get base prompt from mood
    let basePrompt = moodPrompts[mood] || moodPrompts.neutral;
    
    // Modify based on personality
    if (personality.creativity > 0.7) {
      basePrompt += " with surreal elements";
    }
    if (personality.curiosity > 0.7) {
      basePrompt += " featuring unexpected details";
    }
    
    return `Digital artwork of ${basePrompt}, digital art style`;
  }
}
