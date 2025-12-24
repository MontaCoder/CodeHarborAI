import { useCallback, useMemo, useState } from 'react';
import type { GitHubRepoInfo } from '../services/githubService';
import type { GitHubFileEntry, LocalFileEntry } from '../types/files';

interface UseFileSelectionResult {
  folderHandle: FileSystemDirectoryHandle | null;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  githubRepoInfo: GitHubRepoInfo | null;
  selectedFiles: Set<string>;
  totalSize: number;
  totalLines: number;
  handleFilesSelected: (files: LocalFileEntry[]) => void;
  handleGitHubFilesSelected: (
    files: GitHubFileEntry[],
    repoInfo: GitHubRepoInfo,
  ) => void;
  handleFolderSelected: (handle: FileSystemDirectoryHandle | null) => void;
  handleSelectFile: (path: string, selected: boolean) => void;
  handleSelectAll: (paths: string[]) => void;
}

export const useFileSelection = (): UseFileSelectionResult => {
  const [folderHandle, setFolderHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [fileHandles, setFileHandles] = useState<LocalFileEntry[]>([]);
  const [githubFiles, setGithubFiles] = useState<GitHubFileEntry[]>([]);
  const [githubRepoInfo, setGithubRepoInfo] = useState<GitHubRepoInfo | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const { totalSize, totalLines } = useMemo(() => {
    const files = folderHandle ? fileHandles : githubFiles;
    let size = 0;
    let lines = 0;

    for (const file of files) {
      if (selectedFiles.has(file.path)) {
        size += file.size;
        lines += file.lines;
      }
    }

    return { totalSize: size, totalLines: lines };
  }, [selectedFiles, fileHandles, githubFiles, folderHandle]);

  const handleFilesSelected = useCallback((files: LocalFileEntry[]) => {
    setFileHandles(files);
    setGithubFiles([]);
    setGithubRepoInfo(null);
    setSelectedFiles(new Set());
  }, []);

  const handleGitHubFilesSelected = useCallback(
    (files: GitHubFileEntry[], repoInfo: GitHubRepoInfo) => {
      setGithubFiles(files);
      setGithubRepoInfo(repoInfo);
      setFolderHandle(null);
      setFileHandles([]);
      setSelectedFiles(new Set());
    },
    [],
  );

  const handleFolderSelected = useCallback(
    (handle: FileSystemDirectoryHandle | null) => {
      setFolderHandle(handle);
    },
    [],
  );

  const handleSelectFile = useCallback((path: string, selected: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(path);
      } else {
        next.delete(path);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((paths: string[]) => {
    setSelectedFiles(new Set(paths));
  }, []);

  return {
    folderHandle,
    fileHandles,
    githubFiles,
    githubRepoInfo,
    selectedFiles,
    totalSize,
    totalLines,
    handleFilesSelected,
    handleGitHubFilesSelected,
    handleFolderSelected,
    handleSelectFile,
    handleSelectAll,
  };
};
