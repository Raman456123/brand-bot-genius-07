
import { Activity, ActivityResult, WebScrapingOptions, WebScrapingResult } from "../types";

export class WebScrapingActivity implements Activity {
  name: string = "scrape_website";
  description: string = "Scrapes content from a website URL";
  energyCost: number = 0.3;
  cooldown: number = 60000; // 1 minute
  requiredApiKeys?: string[] = []; // No API keys required
  options: WebScrapingOptions;

  constructor(options: WebScrapingOptions = {}) {
    this.options = {
      parseHtml: true,
      timeout: 10000,
      ...options
    };
  }

  async canRun(apiKeys: Record<string, string>, state: any): Promise<boolean> {
    // This activity can run as long as there's sufficient energy
    return state.energy >= this.energyCost;
  }

  async execute(apiKeys: Record<string, string>, state: any, params?: any): Promise<ActivityResult> {
    if (!params?.url) {
      return {
        success: false,
        error: "No URL provided for web scraping",
        data: null
      };
    }

    try {
      console.log(`Scraping URL: ${params.url}`);
      
      // Use fetch API to get the website content
      const response = await fetch(params.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AI-Influencer/1.0',
        },
        signal: AbortSignal.timeout(this.options.timeout || 10000)
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
          data: null
        };
      }

      const content = await response.text();
      const result: WebScrapingResult = {
        statusCode: response.status,
        content: content,
        url: params.url
      };

      // If parseHtml is enabled, parse the content
      if (this.options.parseHtml) {
        // In a browser environment, we can use DOMParser to parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        result.parsed = {
          title: doc.title || null,
          bodyText: doc.body.textContent?.substring(0, 500) || ''
        };
      }

      return {
        success: true,
        data: result,
        error: null
      };
    } catch (error) {
      console.error(`Error scraping ${params.url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
}
