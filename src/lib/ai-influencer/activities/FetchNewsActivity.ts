
import { Activity, ActivityResult, FetchNewsOptions, NewsArticle } from "../types";
import { WebScrapingActivity } from "./WebScrapingActivity";

/**
 * Activity for fetching news using web scraping
 */
export class FetchNewsActivity implements Activity {
  name: string = "fetch_news";
  description: string = "Fetches news articles based on selected topics";
  energyCost: number = 0.3;
  cooldown: number = 1800000; // 30 minutes in milliseconds
  requiredApiKeys: string[] = []; // No API keys required
  
  private topics: string[];
  private maxArticles: number;
  private webScrapingActivity: WebScrapingActivity;
  
  constructor(options: FetchNewsOptions = {}) {
    this.topics = options.topics || ["technology", "science", "art"];
    this.maxArticles = options.maxArticles || 5;
    this.webScrapingActivity = new WebScrapingActivity();
  }
  
  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // This activity can run as long as there's sufficient energy
    return state.energy >= this.energyCost;
  }
  
  async execute(apiKeys: Record<string, string>, state: any): Promise<ActivityResult> {
    try {
      console.log("Starting news fetch activity");
      
      // Fetch articles (simulated for now)
      const articles = await this._fetchArticles();
      
      console.log(`Successfully fetched ${articles.length} articles`);
      
      return {
        success: true,
        data: {
          articles: articles,
          count: articles.length
        },
        error: null,
        metadata: {
          topics: this.topics,
          maxArticles: this.maxArticles,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Simulate fetching articles - in a real implementation, 
   * this would use the WebScrapingActivity
   */
  private async _fetchArticles(): Promise<NewsArticle[]> {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const articles: NewsArticle[] = [];
    
    for (let i = 0; i < this.maxArticles; i++) {
      articles.push({
        title: `Simulated Article ${i+1}`,
        topic: this.topics[i % this.topics.length],
        summary: `This is a simulated news article about ${this.topics[i % this.topics.length]}`,
        url: `https://example.com/article_${i+1}`
      });
    }
    
    return articles;
  }
}
