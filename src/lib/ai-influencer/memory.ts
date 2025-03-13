
/**
 * Simple in-memory storage for the activity results
 */
export class MemoryManager {
  private activities: any[] = [];
  private maxActivities: number = 1000;
  private storageKey: string = "ai_influencer_memory";
  private apiKeysStorageKey: string = "ai_influencer_api_keys";
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Store an activity result in memory
   */
  public storeActivityResult(activityResult: any): void {
    // Add a timestamp if one doesn't exist
    if (!activityResult.timestamp) {
      activityResult.timestamp = new Date().toISOString();
    }
    
    // Add the activity result to the beginning of the array
    this.activities.unshift(activityResult);
    
    // If we have more than maxActivities, remove the oldest ones
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }
    
    // Save to localStorage
    this.saveToStorage();
  }
  
  /**
   * Get recent activities from memory
   */
  public getRecentActivities(limit: number = 10, offset: number = 0): any[] {
    return this.activities.slice(offset, offset + limit);
  }
  
  /**
   * Get all activities of a specific type
   */
  public getActivitiesByType(activityType: string): any[] {
    return this.activities.filter(activity => activity.activity_type === activityType);
  }
  
  /**
   * Clear all activities from memory
   */
  public clearActivities(): void {
    this.activities = [];
    this.saveToStorage();
  }
  
  /**
   * Get activity count
   */
  public getActivityCount(): number {
    return this.activities.length;
  }
  
  /**
   * Save API key to localStorage
   */
  public saveApiKey(activityName: string, keyName: string, keyValue: string): void {
    try {
      // Get existing API keys or initialize if none exist
      const apiKeysJson = localStorage.getItem(this.apiKeysStorageKey);
      const apiKeys = apiKeysJson ? JSON.parse(apiKeysJson) : {};
      
      // Initialize activity if it doesn't exist
      if (!apiKeys[activityName]) {
        apiKeys[activityName] = {};
      }
      
      // Set the API key
      apiKeys[activityName][keyName] = keyValue;
      
      // Save back to localStorage
      localStorage.setItem(this.apiKeysStorageKey, JSON.stringify(apiKeys));
    } catch (error) {
      console.error("Error saving API key to storage:", error);
    }
  }
  
  /**
   * Get API key from localStorage
   */
  public getApiKey(activityName: string, keyName: string): string | null {
    try {
      const apiKeysJson = localStorage.getItem(this.apiKeysStorageKey);
      if (!apiKeysJson) return null;
      
      const apiKeys = JSON.parse(apiKeysJson);
      return apiKeys[activityName]?.[keyName] || null;
    } catch (error) {
      console.error("Error getting API key from storage:", error);
      return null;
    }
  }
  
  /**
   * Get all API key statuses
   */
  public getApiKeyStatuses(): Record<string, Record<string, boolean>> {
    try {
      const apiKeysJson = localStorage.getItem(this.apiKeysStorageKey);
      if (!apiKeysJson) return {};
      
      const apiKeys = JSON.parse(apiKeysJson);
      const statuses: Record<string, Record<string, boolean>> = {};
      
      for (const activityName in apiKeys) {
        statuses[activityName] = {};
        for (const keyName in apiKeys[activityName]) {
          statuses[activityName][keyName] = !!apiKeys[activityName][keyName];
        }
      }
      
      return statuses;
    } catch (error) {
      console.error("Error getting API key statuses:", error);
      return {};
    }
  }
  
  /**
   * Save activities to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.activities));
    } catch (error) {
      console.error("Error saving memory to storage:", error);
    }
  }
  
  /**
   * Load activities from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedActivities = localStorage.getItem(this.storageKey);
      if (storedActivities) {
        this.activities = JSON.parse(storedActivities);
      }
    } catch (error) {
      console.error("Error loading memory from storage:", error);
    }
  }
}
