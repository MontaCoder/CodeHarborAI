import type { GitHubFile } from '../services/githubService';

export interface FileSummary {
  path: string;
  size: number;
  lines: number;
}

export interface LocalScanIgnoreInfo {
  usedRootGitignore: boolean;
  ignoredCount: number;
}

export interface LocalFileEntry extends FileSummary {
  handle: FileSystemFileHandle;
}

export interface GitHubFileEntry extends FileSummary {
  file: GitHubFile;
}

export interface MockDirectoryHandle {
  name: string;
  isMock: true;
  files: File[];
}

export type FolderHandle = FileSystemDirectoryHandle | MockDirectoryHandle;

export type FileSourceType = 'local' | 'github';
