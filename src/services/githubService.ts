export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  download_url: string | null;
  url: string;
  sha: string;
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
}

export class GitHubService {
  private static readonly API_BASE = 'https://api.github.com';
  private static readonly CACHE_PREFIX = 'gh_cache_';
  private static readonly CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

  /**
   * Parse GitHub repository URL to extract owner, repo, and branch
   */
  static parseGitHubUrl(url: string): GitHubRepoInfo | null {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
        /github\.com\/([^\/]+)\/([^\/]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const [, owner, repo, branch] = match;
          return {
            owner,
            repo,
            branch: branch || 'main' // Default to main branch
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  }

  /**
   * Fetch repository contents using Git Tree API (much faster - single request)
   */
  static async fetchRepositoryContents(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<GitHubFile[]> {
    try {
      // Check cache first
      const cacheKey = `${this.CACHE_PREFIX}${owner}_${repo}_${branch}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Using cached repository data');
        return cached;
      }

      // Use Git Tree API for fast, single-request fetch
      const treeUrl = `${this.API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const response = await fetch(treeUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository or branch not found. Please check the URL and branch name.`);
        } else if (response.status === 403) {
          throw new Error(`API rate limit exceeded or access denied. Please try again later.`);
        } else {
          throw new Error(`Failed to fetch repository contents: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      // Transform tree items to GitHubFile format
      const files: GitHubFile[] = data.tree
        .filter((item: any) => item.type === 'blob') // Only files, not trees
        .map((item: any) => ({
          name: item.path.split('/').pop() || item.path,
          path: item.path,
          type: 'file' as const,
          size: item.size || 0,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
          url: item.url,
          sha: item.sha
        }));

      // Cache the results
      this.saveToCache(cacheKey, files);

      return files;
    } catch (error) {
      console.error(`Error fetching repository contents for ${owner}/${repo}:`, error);
      throw new Error(`Failed to fetch repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cache management
   */
  private static getFromCache(key: string): GitHubFile[] | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private static saveToCache(key: string, data: GitHubFile[]): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache repository data:', error);
    }
  }

  /**
   * Clear all GitHub cache
   */
  static clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Download file content from GitHub
   */
  static async downloadFileContent(downloadUrl: string): Promise<string> {
    try {
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error downloading file content:', error);
      throw new Error(`Failed to download file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file size and line count for a GitHub file
   */
  static async getFileSizeAndLines(file: GitHubFile): Promise<{ size: number; lines: number }> {
    if (!file.download_url) {
      return { size: file.size, lines: 0 };
    }

    try {
      const content = await this.downloadFileContent(file.download_url);
      const lines = content.split('\n').length;
      return { size: file.size, lines };
    } catch (error) {
      console.warn(`Failed to get content for ${file.path}, using basic size info:`, error);
      return { size: file.size, lines: 0 };
    }
  }

  /**
   * Batch process files with progress tracking and concurrency control
   */
  static async batchProcessFiles<T>(
    files: GitHubFile[],
    processor: (file: GitHubFile) => Promise<T>,
    onProgress?: (current: number, total: number, currentFile: string) => void,
    concurrency: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    const total = files.length;
    let completed = 0;

    // Process files in batches with concurrency control
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          const result = await processor(file);
          completed++;
          if (onProgress) {
            onProgress(completed, total, file.path);
          }
          return result;
        })
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check if repository exists and get default branch
   */
  static async getRepositoryInfo(owner: string, repo: string): Promise<{ defaultBranch: string; exists: boolean }> {
    try {
      const response = await fetch(`${this.API_BASE}/repos/${owner}/${repo}`);

      if (!response.ok) {
        return { defaultBranch: 'main', exists: false };
      }

      const data = await response.json();
      return {
        defaultBranch: data.default_branch || 'main',
        exists: true
      };
    } catch (error) {
      console.error('Error checking repository info:', error);
      return { defaultBranch: 'main', exists: false };
    }
  }
}
