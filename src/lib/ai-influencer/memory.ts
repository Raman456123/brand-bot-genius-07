
/**
 * Memory management system for storing and retrieving activity history
 * This is a TypeScript adaptation of the Python Memory class
 */

export interface MemoryEntry {
  timestamp: string;
  activity_type: string;
  success: boolean;
  error: string | null;
  data: any | null;
  metadata: Record<string, any>;
}

export class MemoryManager {
  private shortTermMemory: MemoryEntry[] = [];
  private longTermMemory: Record<string, MemoryEntry[]> = {};
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize memory system
   */
  initialize(): void {
    this.loadMemory();
  }
  
  /**
   * Load memory from localStorage
   */
  private loadMemory(): void {
    try {
      const memoryData = localStorage.getItem('ai_influencer_memory');
      
      if (memoryData) {
        const data = JSON.parse(memoryData);
        
        if (typeof data === 'object') {
          this.longTermMemory = data.longTerm || {};
          this.shortTermMemory = data.shortTerm || [];
        } else {
          console.warn("Invalid memory format, resetting memory");
          this.longTermMemory = {};
          this.shortTermMemory = [];
          this.persist(); // Reset with proper format
        }
      }
    } catch (error) {
      console.error("Failed to load memory:", error);
      this.longTermMemory = {};
      this.shortTermMemory = [];
    }
  }
  
  /**
   * Store an activity result in memory
   */
  storeActivityResult(activityRecord: MemoryEntry): void {
    try {
      // Store standardized activity record
      this.shortTermMemory.push(activityRecord);
      this.consolidateMemory();
      this.persist(); // Persist after each update
      console.log(`Stored activity result for ${activityRecord.activity_type}`);
    } catch (error) {
      console.error("Failed to store activity result:", error);
    }
  }
  
  /**
   * Consolidate short-term memory into long-term memory
   */
  private consolidateMemory(): void {
    if (this.shortTermMemory.length > 100) { // Keep last 100 activities in short-term
      const olderMemories = this.shortTermMemory.slice(0, -50); // Move older ones to long-term
      this.shortTermMemory = this.shortTermMemory.slice(-50);
      
      for (const memory of olderMemories) {
        const activityType = memory.activity_type;
        if (!this.longTermMemory[activityType]) {
          this.longTermMemory[activityType] = [];
        }
        this.longTermMemory[activityType].push(memory);
      }
    }
  }
  
  /**
   * Get recent activities from memory with success/failure status
   */
  getRecentActivities(limit: number = 10, offset: number = 0): MemoryEntry[] {
    // Sort all activities by timestamp in descending order (most recent first)
    const allActivities = [...this.shortTermMemory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Apply pagination
    const paginatedActivities = allActivities.slice(offset, offset + limit);
    
    // Format timestamps for display
    return paginatedActivities.map(activity => ({
      ...activity,
      timestamp: this.formatTimestamp(activity.timestamp)
    }));
  }
  
  /**
   * Format ISO timestamp to human-readable format
   */
  private formatTimestamp(timestampStr: string): string {
    try {
      const dt = new Date(timestampStr);
      return dt.toLocaleString();
    } catch (error) {
      return timestampStr;
    }
  }
  
  /**
   * Get history of specific activity type
   */
  getActivityHistory(activityType: string): MemoryEntry[] {
    const activities = this.longTermMemory[activityType] || [];
    return activities.map(activity => ({
      ...activity,
      timestamp: this.formatTimestamp(activity.timestamp)
    }));
  }
  
  /**
   * Persist memory to localStorage
   */
  persist(): void {
    try {
      const memoryData = {
        shortTerm: this.shortTermMemory,
        longTerm: this.longTermMemory
      };
      
      localStorage.setItem('ai_influencer_memory', JSON.stringify(memoryData));
    } catch (error) {
      console.error("Failed to persist memory:", error);
    }
  }
  
  /**
   * Clear all memory
   */
  clear(): void {
    this.shortTermMemory = [];
    this.longTermMemory = {};
    this.persist();
  }
  
  /**
   * Get total number of activities in memory
   */
  getActivityCount(): number {
    return this.shortTermMemory.length + 
      Object.values(this.longTermMemory).reduce(
        (sum, activities) => sum + activities.length, 0
      );
  }
  
  /**
   * Get formatted timestamp of the last activity
   */
  getLastActivityTimestamp(): string {
    if (this.shortTermMemory.length === 0) {
      return "No activities recorded";
    }
    
    const lastActivity = this.shortTermMemory.reduce(
      (latest, current) => {
        const latestTime = new Date(latest.timestamp).getTime();
        const currentTime = new Date(current.timestamp).getTime();
        return currentTime > latestTime ? current : latest;
      },
      this.shortTermMemory[0]
    );
    
    return this.formatTimestamp(lastActivity.timestamp);
  }
}
