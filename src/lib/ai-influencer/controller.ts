import { Activity, ActivityResult, AIState } from "./types";
import { AIInfluencerBrain } from "./brain";
import { MemoryManager } from "./memory";
import { AIBrainInterface } from './brain-interface';

/**
 * Main controller for the AI Influencer - manages the lifecycle and execution flow
 */
export class AIInfluencerController {
  private brain: AIInfluencerBrain;
  private memory: MemoryManager;
  private isRunning: boolean = false;
  private runInterval: number | null = null;
  private lastActivityTime: Date | null = null;
  private activityHistory: {
    timestamp: string;
    activityName: string;
    result: ActivityResult;
  }[] = [];
  private listeners: {
    onActivitySelected?: (activity: Activity) => void;
    onActivityCompleted?: (result: ActivityResult, activityName: string) => void;
    onStateChanged?: (state: AIState) => void;
    onLog?: (message: string) => void;
    onMemoryUpdate?: (memory: any) => void;
  } = {};

  constructor(customBrain?: AIInfluencerBrain) {
    this.brain = customBrain || new AIInfluencerBrain();
    this.memory = new MemoryManager();
    
    // Initialize the brain
    this.brain.loadActivities();
  }

  /**
   * Add event listeners
   */
  on(event: 'activitySelected' | 'activityCompleted' | 'stateChanged' | 'log' | 'memoryUpdate', 
      callback: (...args: any[]) => void) {
    switch (event) {
      case 'activitySelected':
        this.listeners.onActivitySelected = callback as (activity: Activity) => void;
        break;
      case 'activityCompleted':
        this.listeners.onActivityCompleted = callback as (result: ActivityResult, activityName: string) => void;
        break;
      case 'stateChanged':
        this.listeners.onStateChanged = callback as (state: AIState) => void;
        break;
      case 'log':
        this.listeners.onLog = callback as (message: string) => void;
        break;
      case 'memoryUpdate':
        this.listeners.onMemoryUpdate = callback as (memory: any) => void;
        break;
    }
  }

  /**
   * Log a message and notify listeners
   */
  private log(message: string) {
    console.log(`[AI Influencer] ${message}`);
    if (this.listeners.onLog) {
      this.listeners.onLog(message);
    }
  }

  /**
   * Start the AI Influencer's continuous activity cycle
   */
  start(intervalMs: number = 5000) {
    if (this.isRunning) {
      this.log("AI Influencer is already running");
      return;
    }

    this.isRunning = true;
    this.log("Starting AI Influencer activity cycle");

    // Run the first activity immediately
    this.runActivityCycle();
    
    // Set up interval for subsequent activities
    this.runInterval = window.setInterval(() => {
      this.runActivityCycle();
    }, intervalMs);
  }

  /**
   * Stop the AI Influencer's activity cycle
   */
  stop() {
    if (!this.isRunning) {
      this.log("AI Influencer is not running");
      return;
    }

    if (this.runInterval !== null) {
      window.clearInterval(this.runInterval);
      this.runInterval = null;
    }

    this.isRunning = false;
    this.log("AI Influencer activity cycle stopped");
  }

  /**
   * Run a single activity cycle (select & execute an activity)
   */
  async runActivityCycle() {
    this.log("Running activity cycle");
    
    try {
      // Select next activity
      const activity = await this.brain.selectNextActivity();
      
      if (!activity) {
        this.log("No suitable activity available at this time");
        return;
      }
      
      this.log(`Selected activity: ${activity.name}`);
      
      // Notify listeners
      if (this.listeners.onActivitySelected) {
        this.listeners.onActivitySelected(activity);
      }
      
      // Execute the activity
      this.lastActivityTime = new Date();
      const result = await this.brain.executeActivity(activity.name);
      
      // Record result in both controller and memory system
      this.activityHistory.push({
        timestamp: new Date().toISOString(),
        activityName: activity.name,
        result
      });
      
      // Store activity result in memory
      const memoryEntry = {
        timestamp: new Date().toISOString(),
        activity_type: activity.name,
        success: result.success,
        error: result.error,
        data: result.data,
        metadata: result.metadata || {}
      };
      
      this.memory.storeActivityResult(memoryEntry);
      
      // Notify about memory updates
      if (this.listeners.onMemoryUpdate) {
        this.listeners.onMemoryUpdate(this.memory.getRecentActivities());
      }
      
      // Log result
      if (result.success) {
        this.log(`Activity ${activity.name} completed successfully: ${result.data}`);
      } else {
        this.log(`Activity ${activity.name} failed: ${result.error}`);
      }
      
      // Notify listeners
      if (this.listeners.onActivityCompleted) {
        this.listeners.onActivityCompleted(result, activity.name);
      }
      
      // Notify about state changes
      if (this.listeners.onStateChanged) {
        this.listeners.onStateChanged(this.brain.getState());
      }
      
    } catch (error) {
      this.log(`Error in activity cycle: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Force execution of a specific activity
   */
  async executeActivity(activityName: string, params?: any): Promise<ActivityResult | null> {
    const activities = this.brain.getAvailableActivities();
    const activity = activities.find(a => a.name === activityName);
    
    if (!activity) {
      this.log(`Activity ${activityName} not found or not available`);
      return null;
    }
    
    this.log(`Executing activity ${activityName} on demand`);
    
    // Notify listeners
    if (this.listeners.onActivitySelected) {
      this.listeners.onActivitySelected(activity);
    }
    
    // Execute the activity
    this.lastActivityTime = new Date();
    const result = await this.brain.executeActivity(activity.name, params);
    
    // Record result in both controller and memory system
    this.activityHistory.push({
      timestamp: new Date().toISOString(),
      activityName: activity.name,
      result
    });
    
    // Store activity result in memory
    const memoryEntry = {
      timestamp: new Date().toISOString(),
      activity_type: activity.name,
      success: result.success,
      error: result.error,
      data: result.data,
      metadata: result.metadata || {}
    };
    
    this.memory.storeActivityResult(memoryEntry);
    
    // Notify about memory updates
    if (this.listeners.onMemoryUpdate) {
      this.listeners.onMemoryUpdate(this.memory.getRecentActivities());
    }
    
    // Notify listeners
    if (this.listeners.onActivityCompleted) {
      this.listeners.onActivityCompleted(result, activity.name);
    }
    
    // Notify about state changes
    if (this.listeners.onStateChanged) {
      this.listeners.onStateChanged(this.brain.getState());
    }
    
    return result;
  }

  /**
   * Get the AI Influencer's activity history
   */
  getActivityHistory() {
    return [...this.activityHistory];
  }

  /**
   * Get the AI Influencer's memory
   */
  getMemory() {
    return this.memory;
  }

  /**
   * Get the AIInfluencerBrain instance
   */
  getBrain(): AIInfluencerBrain {
    return this.brain;
  }

  /**
   * Check if the AI Influencer is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}
