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
   * Fetch repository contents recursively
   */
  static async fetchRepositoryContents(
    owner: string,
    repo: string,
    branch: string = 'main',
    path: string = ''
  ): Promise<GitHubFile[]> {
    const allFiles: GitHubFile[] = [];

    try {
      const contents = await this.fetchContents(owner, repo, path, branch);

      for (const item of contents) {
        if (item.type === 'file') {
          allFiles.push(item);
        } else if (item.type === 'dir') {
          // Recursively fetch directory contents
          const subFiles = await this.fetchRepositoryContents(owner, repo, branch, item.path);
          allFiles.push(...subFiles);
        }
      }
    } catch (error) {
      console.error(`Error fetching repository contents for ${owner}/${repo}:`, error);
      throw new Error(`Failed to fetch repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return allFiles;
  }

  /**
   * Fetch contents of a specific path in the repository
   */
  private static async fetchContents(
    owner: string,
    repo: string,
    path: string = '',
    branch: string = 'main'
  ): Promise<GitHubFile[]> {
    const url = `${this.API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository or branch not found. Please check the URL and branch name.`);
        } else if (response.status === 403) {
          throw new Error(`API rate limit exceeded or access denied. Please try again later.`);
        } else {
          throw new Error(`Failed to fetch repository contents: ${response.status} ${response.statusText}`);
        }
      }

      const data: GitHubFile[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error while fetching repository contents');
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
