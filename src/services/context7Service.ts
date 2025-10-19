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
  private static readonly allowedHosts = [
    'context7.ai',
    'context7.com',
    'ctx7.dev',
  ];

  /**
   * Parse Context7 URL to extract documentation ID
   */
  static parseContext7Url(url: string): string | null {
    const parsed = Context7Service.tryParseUrl(url);
    if (!parsed || !Context7Service.isAllowedHost(parsed.hostname)) {
      return null;
    }

    return Context7Service.extractDocId(parsed.pathname);
  }

  /**
   * Fetch documentation from Context7 URL
   * This is a mock implementation - adjust based on actual Context7 API
   */
  static async fetchDocumentation(url: string): Promise<Context7Doc> {
    try {
      const docId = Context7Service.parseContext7Url(url);
      if (!docId) {
        throw new Error('Invalid Context7 URL format');
      }
      const candidates = Context7Service.buildRequestCandidates(url);
      let lastError: unknown;

      for (const requestUrl of candidates) {
        try {
          const response = await fetch(requestUrl);
          if (!response.ok) {
            lastError = new Error(
              `Failed to fetch documentation: ${response.status}`,
            );
            continue;
          }

          const contentType = (
            response.headers.get('content-type') ?? ''
          ).toLowerCase();
          const body = await response.text();

          const { title, content } = Context7Service.processResponse(
            body,
            contentType,
            docId,
          );

          return {
            title,
            content,
            url,
          };
        } catch (error) {
          lastError = error;
        }
      }

      throw new Error(
        `Failed to fetch Context7 documentation: ${
          lastError instanceof Error ? lastError.message : 'Unknown error'
        }`,
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch Context7 documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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
    const parsed = Context7Service.tryParseUrl(url);
    if (!parsed) {
      return false;
    }

    return Context7Service.isAllowedHost(parsed.hostname);
  }

  private static tryParseUrl(url: string): URL | null {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }

  private static isAllowedHost(hostname: string): boolean {
    const lowerHost = hostname.toLowerCase();
    return Context7Service.allowedHosts.some(
      (host) => lowerHost === host || lowerHost.endsWith(`.${host}`),
    );
  }

  private static extractDocId(pathname: string): string | null {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return null;
    }

    return segments.join('/');
  }

  private static buildRequestCandidates(url: string): string[] {
    const candidates = [url];
    const normalized = url.replace(/^https?:\/\//i, '');
    const protocol = url.startsWith('https://') ? 'https://' : 'http://';
    const proxyUrl = `https://r.jina.ai/${protocol}${normalized}`;

    if (proxyUrl !== url) {
      candidates.push(proxyUrl);
    }

    return candidates;
  }

  private static processResponse(
    body: string,
    contentType: string,
    fallbackTitle: string,
  ): { title: string; content: string } {
    let title = fallbackTitle;
    let content = body;

    if (contentType.includes('text/html')) {
      const titleMatch = body.match(/<title>(.*?)<\/title>/i);
      title = titleMatch ? titleMatch[1] : title;
      content = Context7Service.extractTextFromHtml(body);
    } else if (contentType.includes('application/json')) {
      try {
        const parsedJson = JSON.parse(body);
        content = JSON.stringify(parsedJson, null, 2);
      } catch {
        content = body;
      }
    } else {
      content = body.trim();
    }

    if (title.trim().length === 0) {
      title = 'Documentation';
    }

    if (content.length === 0) {
      content = 'No content available.';
    }

    return { title, content };
  }
}
