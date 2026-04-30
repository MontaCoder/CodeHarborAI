export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  download_url: string | null;
  url: string;
  sha: string;
}

interface GitHubTreeItem {
  path: string;
  type: string;
  size?: number;
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
  private static readonly REQUEST_CACHE = new Map<string, Promise<unknown>>();
  private static readonly REQUEST_CACHE_TTL = 30000; // 30 seconds for request dedup

  /**
   * Parse GitHub repository URL to extract owner, repo, and branch
   */
  static parseGitHubUrl(url: string): GitHubRepoInfo | null {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/,
        /github\.com\/([^/]+)\/([^/]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const [, owner, repo, branch] = match;
          return {
            owner,
            repo,
            branch: branch || 'main', // Default to main branch
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
    branch: string = 'main',
  ): Promise<GitHubFile[]> {
    try {
      // Check cache first
      const cacheKey = `${GitHubService.CACHE_PREFIX}${owner}_${repo}_${branch}`;
      const cached = GitHubService.getFromCache(cacheKey);
      if (cached) {
        console.log('Using cached repository data');
        return cached;
      }

      // Use Git Tree API for fast, single-request fetch
      const treeUrl = `${GitHubService.API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const response = await fetch(treeUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Repository or branch not found. Please check the URL and branch name.`,
          );
        } else if (response.status === 403) {
          throw new Error(
            `API rate limit exceeded or access denied. Please try again later.`,
          );
        } else {
          throw new Error(
            `Failed to fetch repository contents: ${response.status} ${response.statusText}`,
          );
        }
      }

      const data = await response.json();

      // Transform tree items to GitHubFile format
      const files: GitHubFile[] = data.tree
        .filter((item: GitHubTreeItem) => item.type === 'blob') // Only files, not trees
        .map((item: GitHubTreeItem) => ({
          name: item.path.split('/').pop() || item.path,
          path: item.path,
          type: 'file' as const,
          size: item.size || 0,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
          url: item.url,
          sha: item.sha,
        }));

      // Cache the results
      GitHubService.saveToCache(cacheKey, files);

      return files;
    } catch (error) {
      console.error(
        `Error fetching repository contents for ${owner}/${repo}:`,
        error,
      );
      throw new Error(
        `Failed to fetch repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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

      if (now - timestamp > GitHubService.CACHE_EXPIRY) {
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
        timestamp: Date.now(),
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
      keys.forEach((key) => {
        if (key.startsWith(GitHubService.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear request deduplication cache
   */
  static clearRequestCache(): void {
    GitHubService.REQUEST_CACHE.clear();
  }

  /**
   * Clear all caches (localStorage + request cache)
   */
  static clearAllCaches(): void {
    GitHubService.clearCache();
    GitHubService.clearRequestCache();
  }

  /**
   * Download file content from GitHub with request deduplication
   * Prevents duplicate simultaneous requests for the same URL
   */
  static async downloadFileContent(downloadUrl: string): Promise<string> {
    // Check if there's already a pending request for this URL
    const cacheKey = `req_${downloadUrl}`;
    const cachedPromise = GitHubService.REQUEST_CACHE.get(cacheKey);

    if (cachedPromise) {
      return cachedPromise as Promise<string>;
    }

    const downloadPromise = (async () => {
      try {
        const response = await fetch(downloadUrl);

        if (!response.ok) {
          throw new Error(
            `Failed to download file: ${response.status} ${response.statusText}`,
          );
        }

        return await response.text();
      } catch (error) {
        // Clean up from request cache on error immediately
        GitHubService.REQUEST_CACHE.delete(cacheKey);
        console.error('Error downloading file content:', error);
        throw new Error(
          `Failed to download file content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })();

    // Store the promise in cache
    GitHubService.REQUEST_CACHE.set(cacheKey, downloadPromise);

    // Clean up from request cache after TTL (only on success)
    void downloadPromise.then(
      () => {
        setTimeout(() => {
          GitHubService.REQUEST_CACHE.delete(cacheKey);
        }, GitHubService.REQUEST_CACHE_TTL);
      },
      () => {
        // Already cleaned up in catch block
      },
    );

    return downloadPromise;
  }

  /**
   * Get file size and line count for a GitHub file
   * Uses GitHub's size field and estimates lines to avoid downloading content
   */
  static async getFileSizeAndLines(
    file: GitHubFile,
  ): Promise<{ size: number; lines: number }> {
    // Use GitHub's size field (already available from Tree API)
    // Estimate lines from size: average ~50 bytes per line for code files
    // This avoids downloading the entire file just for line counting
    const estimatedLines = Math.ceil(file.size / 50);
    return { size: file.size, lines: estimatedLines };
  }

  /**
   * Batch process files with progress tracking and concurrency control
   * Increased default concurrency for better performance with large repos
   */
  static async batchProcessFiles<T>(
    files: GitHubFile[],
    processor: (file: GitHubFile) => Promise<T>,
    onProgress?: (current: number, total: number, currentFile: string) => void,
    concurrency: number = 30,
  ): Promise<T[]> {
    const results: T[] = [];
    const total = files.length;
    let completed = 0;

    // Process files in batches with concurrency control
    // Increased default concurrency to 30 for faster metadata fetching
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
        }),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check if repository exists and get default branch
   */
  static async getRepositoryInfo(
    owner: string,
    repo: string,
  ): Promise<{ defaultBranch: string; exists: boolean }> {
    try {
      const response = await fetch(
        `${GitHubService.API_BASE}/repos/${owner}/${repo}`,
      );

      if (!response.ok) {
        return { defaultBranch: 'main', exists: false };
      }

      const data = await response.json();
      return {
        defaultBranch: data.default_branch || 'main',
        exists: true,
      };
    } catch (error) {
      console.error('Error checking repository info:', error);
      return { defaultBranch: 'main', exists: false };
    }
  }
}
