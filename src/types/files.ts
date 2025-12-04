import type { GitHubFile } from '../services/githubService';

export interface FileSummary {
  path: string;
  size: number;
  lines: number;
}

export interface LocalFileEntry extends FileSummary {
  handle: FileSystemFileHandle;
}

export interface GitHubFileEntry extends FileSummary {
  file: GitHubFile;
}
