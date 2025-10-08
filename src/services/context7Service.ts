/**
 * Context7 Documentation Import Service
 * Fetches documentation from Context7 links and formats them for AI prompts
 */

export interface Context7Doc {
  title: string;
  content: string;
  url: string;
}

export class Context7Service {
  /**
   * Parse Context7 URL to extract documentation ID
   */
  static parseContext7Url(url: string): string | null {
    try {
      // Support various Context7 URL formats
      const patterns = [
        /context7\.ai\/docs\/([^\/\?]+)/,
        /context7\.ai\/d\/([^\/\?]+)/,
        /ctx7\.dev\/([^\/\?]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing Context7 URL:', error);
      return null;
    }
  }

  /**
   * Fetch documentation from Context7 URL
   * This is a mock implementation - adjust based on actual Context7 API
   */
  static async fetchDocumentation(url: string): Promise<Context7Doc> {
    try {
      const docId = this.parseContext7Url(url);
      if (!docId) {
        throw new Error('Invalid Context7 URL format');
      }

      // For now, we'll fetch the page and extract the content
      // In production, you'd use the Context7 API if available
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documentation: ${response.status}`);
      }

      const html = await response.text();
      
      // Extract content (basic HTML parsing - improve as needed)
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'Documentation';
      
      // Remove HTML tags and extract text content
      const content = this.extractTextFromHtml(html);

      return {
        title,
        content,
        url
      };
    } catch (error) {
      throw new Error(`Failed to fetch Context7 documentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text content from HTML
   */
  private static extractTextFromHtml(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * Format documentation for AI prompt
   */
  static formatForPrompt(doc: Context7Doc): string {
    return `
# Referenced Documentation: ${doc.title}
Source: ${doc.url}

${doc.content}

---
`;
  }

  /**
   * Validate Context7 URL
   */
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('context7.ai') || 
             parsed.hostname.includes('ctx7.dev');
    } catch {
      return false;
    }
  }
}

