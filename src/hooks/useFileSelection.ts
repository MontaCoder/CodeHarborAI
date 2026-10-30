import { useCallback, useMemo, useState } from 'react';
import type { GitHubRepoInfo } from '../services/githubService';
import { GitHubService } from '../services/githubService';
import { SmartContextService } from '../services/smartContextService';
import type {
  FileSourceType,
  FolderHandle,
  GitHubFileEntry,
  LocalFileEntry,
} from '../types/files';
import { clearFileCategorizationCache } from '../utils/fileCategorization';

interface UseFileSelectionResult {
  folderHandle: FolderHandle | null;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  githubRepoInfo: GitHubRepoInfo | null;
  activeSource: FileSourceType;
  selectedFiles: Set<string>;
  totalSize: number;
  totalLines: number;
  handleFilesSelected: (files: LocalFileEntry[]) => void;
  handleGitHubFilesSelected: (
    files: GitHubFileEntry[],
    repoInfo: GitHubRepoInfo,
  ) => void;
  handleFolderSelected: (handle: FolderHandle | null) => void;
  handleSourceChange: (source: FileSourceType) => void;
  handleSelectFile: (path: string, selected: boolean) => void;
  handleSelectAll: (paths: string[]) => void;
}

type SelectionMap = Record<FileSourceType, Set<string>>;

const emptySelectionMap = (): SelectionMap => ({
  local: new Set(),
  github: new Set(),
});

const clearSourceCaches = () => {
  SmartContextService.clearAnalysisCache();
  GitHubService.clearRequestCache();
  clearFileCategorizationCache();
};

export const useFileSelection = (): UseFileSelectionResult => {
  const [folderHandle, setFolderHandle] = useState<FolderHandle | null>(null);
  const [fileHandles, setFileHandles] = useState<LocalFileEntry[]>([]);
  const [githubFiles, setGithubFiles] = useState<GitHubFileEntry[]>([]);
  const [githubRepoInfo, setGithubRepoInfo] = useState<GitHubRepoInfo | null>(
    null,
  );
  const [activeSource, setActiveSource] = useState<FileSourceType>('local');
  const [selectionBySource, setSelectionBySource] =
    useState<SelectionMap>(emptySelectionMap);

  const selectedFiles = selectionBySource[activeSource];

  const { totalSize, totalLines } = useMemo(() => {
    const files = activeSource === 'local' ? fileHandles : githubFiles;
    let size = 0;
    let lines = 0;

    for (const file of files) {
      if (selectedFiles.has(file.path)) {
        size += file.size;
        lines += file.lines;
      }
    }

    return { totalSize: size, totalLines: lines };
  }, [activeSource, selectedFiles, fileHandles, githubFiles]);

  const handleFilesSelected = useCallback((files: LocalFileEntry[]) => {
    setFileHandles(files);
    setActiveSource('local');
    setSelectionBySource((prev) => ({ ...prev, local: new Set() }));
    clearSourceCaches();
  }, []);

  const handleGitHubFilesSelected = useCallback(
    (files: GitHubFileEntry[], repoInfo: GitHubRepoInfo) => {
      setGithubFiles(files);
      setGithubRepoInfo(repoInfo);
      setActiveSource('github');
      setSelectionBySource((prev) => ({ ...prev, github: new Set() }));
      clearSourceCaches();
    },
    [],
  );

  const handleFolderSelected = useCallback((handle: FolderHandle | null) => {
    setFolderHandle(handle);
    if (handle) {
      setActiveSource('local');
      setSelectionBySource((prev) => ({ ...prev, local: new Set() }));
      clearSourceCaches();
    }
  }, []);

  const handleSourceChange = useCallback((source: FileSourceType) => {
    setActiveSource(source);
    clearSourceCaches();
  }, []);

  const handleSelectFile = useCallback(
    (path: string, selected: boolean) => {
      setSelectionBySource((prev) => {
        const next = new Set(prev[activeSource]);
        if (selected) {
          next.add(path);
        } else {
          next.delete(path);
        }
        return { ...prev, [activeSource]: next };
      });
    },
    [activeSource],
  );

  const handleSelectAll = useCallback(
    (paths: string[]) => {
      setSelectionBySource((prev) => ({
        ...prev,
        [activeSource]: new Set(paths),
      }));
    },
    [activeSource],
  );

  return {
    folderHandle,
    fileHandles,
    githubFiles,
    githubRepoInfo,
    activeSource,
    selectedFiles,
    totalSize,
    totalLines,
    handleFilesSelected,
    handleGitHubFilesSelected,
    handleFolderSelected,
    handleSourceChange,
    handleSelectFile,
    handleSelectAll,
  };
};
