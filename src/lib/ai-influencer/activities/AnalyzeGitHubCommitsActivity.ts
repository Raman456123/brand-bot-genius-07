
import { 
  Activity, 
  ActivityResult, 
  GitHubCommitAnalysisOptions,
  GitHubCommitAnalysisResult,
  GitHubCommit
} from "../types";
import { ChatActivity } from "./ChatActivity";

/**
 * An activity that analyzes new GitHub commits from a repository
 */
export class AnalyzeGitHubCommitsActivity implements Activity {
  public name: string = "analyze_github_commits";
  public description: string = "Fetches and analyzes recent commits from a GitHub repository";
  public energyCost: number = 0.4;
  public cooldown: number = 3600000; // 1 hour in milliseconds
  public requiredApiKeys: string[] = ["GITHUB", "OPENAI"]; // Requires GitHub API access and OpenAI for analysis
  
  private githubOwner: string;
  private githubRepo: string;
  private githubBranch: string;
  private lookbackHours: number;
  private systemPrompt: string;
  private maxTokens: number;
  private chatActivity: ChatActivity;
  
  constructor(options: GitHubCommitAnalysisOptions) {
    this.githubOwner = options.githubOwner;
    this.githubRepo = options.githubRepo;
    this.githubBranch = options.githubBranch || "main";
    this.lookbackHours = options.lookbackHours || 144; // Default 6 days
    
    this.systemPrompt = options.systemPrompt || 
      "You are a code review assistant. Summarize and analyze the following commits in detail.";
    this.maxTokens = options.maxTokens || 500;
    
    // Initialize chat activity for analyzing commits
    this.chatActivity = new ChatActivity({
      modelName: "gpt-4o-mini",
      systemPrompt: this.systemPrompt,
      maxTokens: this.maxTokens
    });
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // Check if energy is sufficient
    if (state.energy < this.energyCost) {
      console.log("Not enough energy to analyze GitHub commits");
      return false;
    }
    
    // Check if required API keys are available
    const hasGitHubKey = !!apiKeys["GITHUB"];
    const canUseChat = await this.chatActivity.canRun(apiKeys, state);
    
    return hasGitHubKey && canUseChat;
  }
  
  async execute(apiKeys: Record<string, string>, state: any, params?: any): Promise<ActivityResult> {
    try {
      console.log("Starting GitHub commit analysis activity...");
      
      // Get memory manager from params or state
      const memoryManager = params?.memoryManager || state.memoryManager;
      
      if (!memoryManager) {
        return {
          success: false,
          error: "Memory manager not available",
          data: null
        };
      }
      
      // 1. Get known commit SHAs from previous analyses
      const knownCommitShas = this.getKnownCommitShas(memoryManager);
      console.log(`Found ${knownCommitShas.length} previously analyzed commits`);
      
      // 2. Fetch commits from GitHub API
      const commits = await this.fetchGitHubCommits(apiKeys["GITHUB"]);
      
      if (!commits.success) {
        return {
          success: false,
          error: commits.error || "Failed to fetch commits from GitHub",
          data: null
        };
      }
      
      console.log(`Fetched ${commits.data?.length || 0} commits from GitHub`);
      
      // 3. Filter commits by date (only include those within lookback period)
      const freshCommits = this.filterCommitsByDate(commits.data);
      console.log(`Found ${freshCommits.length} commits within the last ${this.lookbackHours} hours`);
      
      if (freshCommits.length === 0) {
        return {
          success: true,
          data: {
            message: `No commits in the last ${this.lookbackHours} hours.`,
            newCommitCount: 0,
            commitsAnalyzed: []
          },
          error: null
        };
      }
      
      // 4. Filter out already analyzed commits
      const newCommits = freshCommits.filter(commit => !knownCommitShas.includes(commit.sha));
      console.log(`Found ${newCommits.length} new commits to analyze`);
      
      if (newCommits.length === 0) {
        return {
          success: true,
          data: {
            message: "No new commits to analyze.",
            newCommitCount: 0,
            commitsAnalyzed: []
          },
          error: null
        };
      }
      
      // 5. Build prompt with all new commits
      const promptText = this.buildBatchPrompt(newCommits);
      
      // 6. Analyze commits using ChatActivity
      const analysisResponse = await this.chatActivity.execute(apiKeys, state, {
        prompt: promptText,
        systemPrompt: this.systemPrompt
      });
      
      if (!analysisResponse.success) {
        return {
          success: false,
          error: analysisResponse.error,
          data: null
        };
      }
      
      // 7. Return success with analysis results
      const analysisResult: GitHubCommitAnalysisResult = {
        analysis: analysisResponse.data.content,
        newCommitCount: newCommits.length,
        commitsAnalyzed: newCommits.map(commit => commit.sha),
        model: analysisResponse.data.model,
        finishReason: analysisResponse.data.finishReason
      };
      
      return {
        success: true,
        data: analysisResult,
        error: null,
        metadata: {
          timestamp: new Date().toISOString(),
          commitCount: newCommits.length,
          promptUsed: promptText,
          model: analysisResponse.data.model
        }
      };
      
    } catch (error) {
      console.error("Error in AnalyzeGitHubCommitsActivity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
  
  private getKnownCommitShas(memoryManager: any, limit: number = 50): string[] {
    // Get recent activities from memory
    const recentActivities = memoryManager.getRecentActivities(limit, 0);
    
    // Extract commit SHAs from previous successful commit analyses
    const knownShas = new Set<string>();
    
    recentActivities.forEach(activity => {
      if (activity.activity_type === this.name && activity.success) {
        const commitsAnalyzed = activity.data?.commitsAnalyzed || [];
        commitsAnalyzed.forEach(sha => knownShas.add(sha));
      }
    });
    
    return Array.from(knownShas);
  }
  
  private async fetchGitHubCommits(
    githubToken: string
  ): Promise<{ success: boolean; data?: GitHubCommit[]; error?: string }> {
    try {
      // GitHub API URL for the repository's commits
      const apiUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/commits?sha=${this.githubBranch}`;
      
      // Make the API request
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${githubToken}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `GitHub API error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`
        };
      }
      
      const commits = await response.json();
      return {
        success: true,
        data: commits
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private filterCommitsByDate(commits: GitHubCommit[]): GitHubCommit[] {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - this.lookbackHours * 60 * 60 * 1000);
    
    return commits.filter(commit => {
      if (!commit.commit?.author?.date) return false;
      
      const commitDate = new Date(commit.commit.author.date);
      return commitDate >= cutoffTime;
    });
  }
  
  private buildBatchPrompt(commits: GitHubCommit[]): string {
    const lines = commits.map(commit => {
      const sha = commit.sha.substring(0, 7);
      const message = commit.commit?.message || "(no message)";
      return `- SHA ${sha}: ${message}`;
    });
    
    const joinedCommits = lines.join("\n");
    
    return `Below is a list of ${commits.length} new commits:\n\n` +
      `${joinedCommits}\n\n` +
      `Please provide a concise summary of each commit's changes, any improvements needed, ` +
      `and note if there are any broader impacts across these commits. ` +
      `Be thorough but concise.`;
  }
}
