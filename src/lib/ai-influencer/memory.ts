
/**
 * Memory management system for the AI influencer
 * Inspired by Pippin's memory system with short-term and long-term storage
 */
export class MemoryManager {
  private shortTermMemory: any[] = [];
  private longTermMemory: any[] = [];
  private maxShortTermMemories: number = 100;
  private maxLongTermMemories: number = 1000;
  private storageKey: string = "ai_influencer_memory";
  private apiKeysStorageKey: string = "ai_influencer_api_keys";
  private longTermStorageKey: string = "ai_influencer_long_term_memory";
  
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
    
    // Add importance score if one doesn't exist
    if (activityResult.importance === undefined) {
      activityResult.importance = this.calculateImportance(activityResult);
    }
    
    // Add the activity result to the beginning of short-term memory
    this.shortTermMemory.unshift(activityResult);
    
    // If importance is above threshold, also add to long-term memory
    if (activityResult.importance >= 0.7) {
      this.longTermMemory.unshift(activityResult);
      
      // If we have more than maxLongTermMemories, remove the oldest ones
      if (this.longTermMemory.length > this.maxLongTermMemories) {
        this.longTermMemory = this.longTermMemory.slice(0, this.maxLongTermMemories);
      }
    }
    
    // If we have more than maxShortTermMemories, remove the oldest ones
    if (this.shortTermMemory.length > this.maxShortTermMemories) {
      this.shortTermMemory = this.shortTermMemory.slice(0, this.maxShortTermMemories);
    }
    
    // Save to localStorage
    this.saveToStorage();
  }
  
  /**
   * Calculate importance score for an activity result
   * Used to determine if an activity should be stored in long-term memory
   */
  private calculateImportance(activityResult: any): number {
    // Simple importance calculation for now
    // Can be enhanced with more sophisticated logic
    let importance = 0.5; // Default medium importance
    
    // Higher importance for successful activities
    if (activityResult.success) {
      importance += 0.2;
    }
    
    // Higher importance for activities with metadata or more data
    if (activityResult.metadata && Object.keys(activityResult.metadata).length > 0) {
      importance += 0.1;
    }
    
    // Higher importance for activities with more data
    if (activityResult.data && typeof activityResult.data === 'object' && Object.keys(activityResult.data).length > 0) {
      importance += 0.1;
    }
    
    // Higher importance for certain activity types
    const highImportanceTypes = ['chat', 'web_scrape', 'twitter_posting', 'analyze_daily'];
    if (activityResult.activity_type && highImportanceTypes.includes(activityResult.activity_type)) {
      importance += 0.1;
    }
    
    // Cap importance between 0 and 1
    return Math.max(0, Math.min(1, importance));
  }
  
  /**
   * Get recent activities from short-term memory
   */
  public getRecentActivities(limit: number = 10, offset: number = 0): any[] {
    return this.shortTermMemory.slice(offset, offset + limit);
  }
  
  /**
   * Get important activities from long-term memory
   */
  public getImportantActivities(limit: number = 10, offset: number = 0): any[] {
    return this.longTermMemory.slice(offset, offset + limit);
  }
  
  /**
   * Search memory for activities that match the query
   */
  public searchMemory(query: string): any[] {
    const queryLower = query.toLowerCase();
    
    // Search both short-term and long-term memory
    // Prioritize short-term memory results
    const shortTermResults = this.shortTermMemory.filter(activity => 
      this.activityMatchesQuery(activity, queryLower)
    );
    
    const longTermResults = this.longTermMemory.filter(activity => 
      this.activityMatchesQuery(activity, queryLower) && 
      !shortTermResults.some(a => a.timestamp === activity.timestamp) // Avoid duplicates
    );
    
    return [...shortTermResults, ...longTermResults];
  }
  
  /**
   * Check if an activity matches a search query
   */
  private activityMatchesQuery(activity: any, queryLower: string): boolean {
    // Check various fields for matches
    if (activity.activity_type && activity.activity_type.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    if (activity.data) {
      if (typeof activity.data === 'string' && activity.data.toLowerCase().includes(queryLower)) {
        return true;
      } else if (typeof activity.data === 'object') {
        // Check if any string value in the data object contains the query
        for (const key in activity.data) {
          if (typeof activity.data[key] === 'string' && 
              activity.data[key].toLowerCase().includes(queryLower)) {
            return true;
          }
        }
      }
    }
    
    if (activity.error && typeof activity.error === 'string' && 
        activity.error.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all activities of a specific type from both memories
   */
  public getActivitiesByType(activityType: string): any[] {
    const shortTermResults = this.shortTermMemory.filter(
      activity => activity.activity_type === activityType
    );
    
    const longTermResults = this.longTermMemory.filter(
      activity => activity.activity_type === activityType && 
      !shortTermResults.some(a => a.timestamp === activity.timestamp) // Avoid duplicates
    );
    
    return [...shortTermResults, ...longTermResults];
  }
  
  /**
   * Get activity count for both memories
   */
  public getActivityCount(): { shortTerm: number, longTerm: number, total: number } {
    return {
      shortTerm: this.shortTermMemory.length,
      longTerm: this.longTermMemory.length,
      total: this.shortTermMemory.length + this.longTermMemory.length
    };
  }
  
  /**
   * Add a memory directly to long-term storage
   * Useful for important information that should be remembered
   */
  public addToLongTermMemory(memory: any): void {
    // Ensure the memory has a timestamp
    if (!memory.timestamp) {
      memory.timestamp = new Date().toISOString();
    }
    
    // Ensure it has an importance score (high, since we're explicitly adding it)
    memory.importance = Math.max(memory.importance || 0, 0.8);
    
    // Add to long-term memory
    this.longTermMemory.unshift(memory);
    
    // Maintain size limit
    if (this.longTermMemory.length > this.maxLongTermMemories) {
      this.longTermMemory = this.longTermMemory.slice(0, this.maxLongTermMemories);
    }
    
    // Save to storage
    this.saveToStorage();
  }
  
  /**
   * Consolidate short-term memories into long-term memory
   * This simulates the process of memory consolidation during "sleep"
   */
  public consolidateMemories(): void {
    // Get short-term memories that aren't already in long-term memory
    const shortTermOnly = this.shortTermMemory.filter(stm => 
      !this.longTermMemory.some(ltm => ltm.timestamp === stm.timestamp)
    );
    
    // Identify important memories to move to long-term memory
    const importantMemories = shortTermOnly.filter(memory => 
      this.calculateImportance(memory) >= 0.5 // Lower threshold for consolidation
    );
    
    // Add important memories to long-term memory
    for (const memory of importantMemories) {
      this.longTermMemory.unshift(memory);
    }
    
    // Maintain size limit for long-term memory
    if (this.longTermMemory.length > this.maxLongTermMemories) {
      this.longTermMemory = this.longTermMemory.slice(0, this.maxLongTermMemories);
    }
    
    // Save to storage
    this.saveToStorage();
    
    console.log(`Consolidated ${importantMemories.length} memories from short-term to long-term memory`);
  }
  
  /**
   * Clear all activities from memory
   */
  public clearActivities(): void {
    this.shortTermMemory = [];
    this.longTermMemory = [];
    this.saveToStorage();
  }
  
  /**
   * Clear only short-term memory
   */
  public clearShortTermMemory(): void {
    this.shortTermMemory = [];
    this.saveToStorage();
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
      // Save short-term memory
      localStorage.setItem(this.storageKey, JSON.stringify(this.shortTermMemory));
      
      // Save long-term memory
      localStorage.setItem(this.longTermStorageKey, JSON.stringify(this.longTermMemory));
    } catch (error) {
      console.error("Error saving memory to storage:", error);
    }
  }
  
  /**
   * Load activities from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Load short-term memory
      const storedShortTerm = localStorage.getItem(this.storageKey);
      if (storedShortTerm) {
        this.shortTermMemory = JSON.parse(storedShortTerm);
      }
      
      // Load long-term memory
      const storedLongTerm = localStorage.getItem(this.longTermStorageKey);
      if (storedLongTerm) {
        this.longTermMemory = JSON.parse(storedLongTerm);
      }
      
      console.log(`Loaded ${this.shortTermMemory.length} short-term and ${this.longTermMemory.length} long-term memories`);
    } catch (error) {
      console.error("Error loading memory from storage:", error);
    }
  }
  
  /**
   * Get a summary of recent activities
   * This can be used to provide context for the AI
   */
  public getRecentActivitySummary(limit: number = 10): string {
    const recentActivities = this.getRecentActivities(limit);
    if (recentActivities.length === 0) {
      return "No recent activities.";
    }
    
    return recentActivities.map(activity => {
      const timestamp = new Date(activity.timestamp).toLocaleString();
      const status = activity.success ? "✅ Success" : "❌ Failed";
      const type = activity.activity_type || "unknown";
      
      let details = "";
      if (activity.data && typeof activity.data === 'object') {
        // Extract meaningful data from the activity result
        for (const key in activity.data) {
          if (typeof activity.data[key] === 'string' && activity.data[key].length < 100) {
            details += `${key}: ${activity.data[key]}; `;
          }
        }
      } else if (activity.data && typeof activity.data === 'string') {
        details = activity.data.substring(0, 100) + (activity.data.length > 100 ? "..." : "");
      }
      
      if (activity.error) {
        details = `Error: ${activity.error}`;
      }
      
      return `[${timestamp}] ${type} - ${status}${details ? ': ' + details : ''}`;
    }).join("\n");
  }
}
