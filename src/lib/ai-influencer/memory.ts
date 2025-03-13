
/**
 * Simple in-memory storage for the activity results
 */
export class MemoryManager {
  private activities: any[] = [];
  private maxActivities: number = 1000;
  private storageKey: string = "ai_influencer_memory";
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Store an activity result in memory
   */
  public storeActivityResult(activityResult: any): void {
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
