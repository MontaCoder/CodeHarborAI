import {
  ArrowUpDown,
  CheckSquare,
  FileWarning,
  FolderOpen,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  scanLocalDirectory,
  scanMockDirectory,
} from '../services/fileContentService';
import type { GitHubRepoInfo } from '../services/githubService';
import type {
  FileSourceType,
  FolderHandle,
  GitHubFileEntry,
  LocalFileEntry,
  LocalScanIgnoreInfo,
} from '../types/files';
import { prioritizeFiles } from '../utils/filePrioritization';
import FileTree from './FileTree';
import GitHubLoader from './GitHubLoader';
import { GitHubIcon } from './icons/BrandIcons';
import Button from './ui/Button';

const FILE_TYPE_FILTERS: Record<string, string[]> = {
  JavaScript: ['.js', '.mjs', '.cjs'],
  TypeScript: ['.ts'],
  React: ['.jsx', '.tsx'],
  JSON: ['.json'],
  Markdown: ['.md'],
  Python: ['.py'],
  Go: ['.go'],
  Java: ['.java'],
  Ruby: ['.rb'],
  PHP: ['.php'],
  Rust: ['.rs'],
};

const sortByPriority = <T extends { path: string }>(
  files: T[],
  enabled: boolean,
): T[] => {
  if (!enabled) return files;
  const prioritized = prioritizeFiles(files.map((f) => f.path));
  const order = new Map(prioritized.map((p, i) => [p.path, i]));
  return [...files].sort(
    (a, b) =>
      (order.get(a.path) ?? Number.POSITIVE_INFINITY) -
      (order.get(b.path) ?? Number.POSITIVE_INFINITY),
  );
};

const formatIgnoreStatus = (ignoreInfo: LocalScanIgnoreInfo): string => {
  const mode = ignoreInfo.usedRootGitignore
    ? 'Defaults + .gitignore'
    : 'Defaults only';
  return `${mode} · ${ignoreInfo.ignoredCount} skipped`;
};

interface FileSelectorProps {
  onFolderSelected: (handle: FolderHandle | null) => void;
  onFilesSelected: (files: LocalFileEntry[]) => void;
  onGitHubFilesSelected: (
    files: GitHubFileEntry[],
    repoInfo: GitHubRepoInfo,
  ) => void;
  onSelectFile: (path: string, selected: boolean) => void;
  onSelectAll: (paths: string[]) => void;
  onSourceChange: (source: FileSourceType) => void;
  sourceType: FileSourceType;
  folderHandle: FolderHandle | null;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  githubRepoInfo: GitHubRepoInfo | null;
  selectedFiles: Set<string>;
  isLoading: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  onFolderSelected,
  onFilesSelected,
  onGitHubFilesSelected,
  onSelectFile,
  onSelectAll,
  onSourceChange,
  sourceType,
  folderHandle,
  fileHandles,
  githubFiles,
  githubRepoInfo,
  selectedFiles,
  isLoading,
}) => {
  const [filterText, setFilterText] = useState<string>('');
  const [ignoreInfo, setIgnoreInfo] = useState<LocalScanIgnoreInfo | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string>('');
  const [isPrioritized, setIsPrioritized] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanFolder = async (handle: FolderHandle) => {
    setIsProcessing(true);

    try {
      let files: LocalFileEntry[];
      let nextIgnoreInfo: LocalScanIgnoreInfo;

      if (handle && 'isMock' in handle) {
        const scanned = await scanMockDirectory(handle.files, handle.name);
        files = scanned.files;
        nextIgnoreInfo = scanned.ignoreInfo;
      } else {
        const scanned = await scanLocalDirectory(
          handle as FileSystemDirectoryHandle,
        );
        files = scanned.files;
        nextIgnoreInfo = scanned.ignoreInfo;
      }

      setIgnoreInfo(nextIgnoreInfo);
      onFilesSelected(files);
      return files;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFolderSelect = async () => {
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        // @ts-expect-error File System Access API may not be fully typed in all environments
        const handle = await window.showDirectoryPicker();
        onFolderSelected(handle);
        await scanFolder(handle);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Error selecting folder:', err);
        setIgnoreInfo(null);
        onFilesSelected([]);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const files = Array.from(filesList);
    const firstFile = files.find((f) => f.webkitRelativePath);
    const folderName = firstFile
      ? firstFile.webkitRelativePath.split('/')[0]
      : 'Selected Folder';

    const mockHandle: FolderHandle = {
      name: folderName,
      isMock: true,
      files,
    };

    onFolderSelected(mockHandle);
    await scanFolder(mockHandle);
  };

  const handleRefresh = async () => {
    if (folderHandle) {
      if ('isMock' in folderHandle) {
        fileInputRef.current?.click();
      } else {
        await scanFolder(folderHandle);
      }
    }
  };

  const handleSelectAll = () => {
    const filteredSet = new Set(filteredPaths);
    const allFilteredSelected = filteredPaths.every((path) =>
      selectedFiles.has(path),
    );

    if (allFilteredSelected) {
      const newSelectedFiles = new Set<string>();
      for (const path of selectedFiles) {
        if (!filteredSet.has(path)) {
          newSelectedFiles.add(path);
        }
      }
      onSelectAll(Array.from(newSelectedFiles));
    } else {
      const newSelectedFiles = new Set(selectedFiles);
      for (const path of filteredPaths) {
        newSelectedFiles.add(path);
      }
      onSelectAll(Array.from(newSelectedFiles));
    }
  };

  const applyFileTypeFilter = (extensions: string[]) => {
    const activeFiles = sourceType === 'local' ? fileHandles : githubFiles;
    const paths = activeFiles
      .filter((file) =>
        extensions.some((ext) => file.path.toLowerCase().endsWith(ext)),
      )
      .map((file) => file.path);

    const newSelectedFiles = new Set(selectedFiles);
    for (const path of paths) {
      newSelectedFiles.add(path);
    }
    onSelectAll(Array.from(newSelectedFiles));
  };

  const handleGitHubRepositoryLoaded = (
    files: GitHubFileEntry[],
    repoInfo: GitHubRepoInfo,
  ) => {
    setGithubError('');
    setIgnoreInfo(null);
    onGitHubFilesSelected(files, repoInfo);
  };

  const handleGitHubError = (error: string) => {
    setGithubError(error);
  };

  const handleSourceTypeChange = useCallback(
    (type: FileSourceType) => {
      if (type === sourceType) return;
      onSourceChange(type);
      setFilterText('');
      setGithubError('');
    },
    [onSourceChange, sourceType],
  );

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const nextSource: FileSourceType =
      sourceType === 'local' ? 'github' : 'local';
    handleSourceTypeChange(nextSource);
    document.getElementById(`source-tab-${nextSource}`)?.focus();
  };

  const sortedFileHandles = useMemo(
    () => sortByPriority(fileHandles, isPrioritized),
    [fileHandles, isPrioritized],
  );

  const sortedGithubFiles = useMemo(
    () => sortByPriority(githubFiles, isPrioritized),
    [githubFiles, isPrioritized],
  );

  const currentFiles = sourceType === 'local' ? fileHandles : githubFiles;
  const filterQuery = filterText.trim().toLowerCase();
  const filteredPaths = filterQuery
    ? currentFiles
        .filter((file) => file.path.toLowerCase().includes(filterQuery))
        .map((file) => file.path)
    : currentFiles.map((file) => file.path);

  const allFilteredSelected =
    filteredPaths.length > 0 &&
    filteredPaths.every((path) => selectedFiles.has(path));

  const hasSource =
    sourceType === 'local' ? Boolean(folderHandle) : Boolean(githubRepoInfo);

  return (
    <div className="animate-fade-in space-y-4">
      <div
        role="tablist"
        aria-label="Choose a file source"
        className="grid grid-cols-2 gap-1 rounded-xl border border-neutral-200/80 bg-neutral-100/70 p-1 dark:border-neutral-800 dark:bg-neutral-800/50"
      >
        <button
          id="source-tab-local"
          type="button"
          role="tab"
          aria-selected={sourceType === 'local'}
          aria-controls="source-panel"
          tabIndex={sourceType === 'local' ? 0 : -1}
          onClick={() => handleSourceTypeChange('local')}
          onKeyDown={handleTabKeyDown}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
            sourceType === 'local'
              ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:text-white dark:ring-neutral-700/70'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <FolderOpen aria-hidden="true" className="h-4 w-4" />
          Local folder
        </button>
        <button
          id="source-tab-github"
          type="button"
          role="tab"
          aria-selected={sourceType === 'github'}
          aria-controls="source-panel"
          tabIndex={sourceType === 'github' ? 0 : -1}
          onClick={() => handleSourceTypeChange('github')}
          onKeyDown={handleTabKeyDown}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
            sourceType === 'github'
              ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:text-white dark:ring-neutral-700/70'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <GitHubIcon aria-hidden="true" className="h-4 w-4" />
          GitHub repo
        </button>
      </div>

      <div
        id="source-panel"
        role="tabpanel"
        aria-labelledby={`source-tab-${sourceType}`}
        className="space-y-4"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          // @ts-expect-error webkitdirectory is a non-standard attribute but widely supported
          webkitdirectory=""
          directory=""
          multiple
        />

        {sourceType === 'local' && !folderHandle && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900/30">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:text-sky-400 dark:ring-neutral-800">
              <FolderOpen aria-hidden="true" className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Open your project folder
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Files are scanned and filtered locally. Build output,
              dependencies, and anything in the root .gitignore are skipped
              automatically.
            </p>
            <Button
              icon={<FolderOpen aria-hidden="true" className="h-4 w-4" />}
              onClick={handleFolderSelect}
              disabled={isProcessing || isLoading}
              variant="primary"
              className="mt-5"
            >
              {isProcessing ? 'Scanning…' : 'Choose folder'}
            </Button>
            <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
              No uploads · Works with Chrome, Edge, and Brave
            </p>
          </div>
        )}

        {sourceType === 'local' && folderHandle && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <FolderOpen
                aria-hidden="true"
                className="h-3.5 w-3.5 flex-shrink-0 text-sky-500 dark:text-sky-400"
              />
              <span className="truncate">{folderHandle.name}</span>
            </span>
            {ignoreInfo && (
              <span
                className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700"
                title="Scan rules applied to this folder"
              >
                {formatIgnoreStatus(ignoreInfo)}
              </span>
            )}
            <Button
              icon={
                <RefreshCw
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`}
                />
              }
              onClick={handleRefresh}
              disabled={isProcessing || isLoading}
              variant="default"
              className="ml-auto px-2.5 py-1.5 text-xs"
              title="Rescan this folder"
            >
              Refresh
            </Button>
          </div>
        )}

        {sourceType === 'github' && (
          <div className="space-y-4">
            <GitHubLoader
              onRepositoryLoaded={handleGitHubRepositoryLoaded}
              onError={handleGitHubError}
              isLoading={isLoading}
            />
            {githubRepoInfo && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40">
                <GitHubIcon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 flex-shrink-0 text-neutral-600 dark:text-neutral-300"
                />
                <span className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {githubRepoInfo.owner}/{githubRepoInfo.repo}
                </span>
                <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700">
                  {githubRepoInfo.branch}
                </span>
                <span className="ml-auto text-[10px] text-neutral-500 dark:text-neutral-400">
                  {githubFiles.length.toLocaleString()} files cached
                </span>
              </div>
            )}
          </div>
        )}

        {githubError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {githubError}
          </div>
        )}

        {hasSource && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="file-filter" className="sr-only">
                  Filter files
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                />
                <input
                  id="file-filter"
                  type="text"
                  placeholder="Filter by path or extension…"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                  disabled={isProcessing || isLoading}
                />
                {filterText && (
                  <button
                    type="button"
                    onClick={() => setFilterText('')}
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    aria-label="Clear filter"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  icon={<CheckSquare aria-hidden="true" className="h-4 w-4" />}
                  onClick={handleSelectAll}
                  disabled={
                    isProcessing || isLoading || filteredPaths.length === 0
                  }
                  variant="secondary"
                  className="flex-1 whitespace-nowrap px-3 py-2 text-xs sm:flex-none"
                  title="Select or deselect all files matching the current filter"
                >
                  {allFilteredSelected ? 'Deselect' : 'Select all'}
                </Button>
                <Button
                  icon={<ArrowUpDown aria-hidden="true" className="h-4 w-4" />}
                  onClick={() => setIsPrioritized(!isPrioritized)}
                  disabled={isProcessing || isLoading}
                  variant="default"
                  className={`flex-1 whitespace-nowrap px-3 py-2 text-xs sm:flex-none ${
                    isPrioritized
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : ''
                  }`}
                  aria-pressed={isPrioritized}
                  title={
                    isPrioritized
                      ? 'Sorted by importance'
                      : 'Sorted alphabetically'
                  }
                >
                  {isPrioritized ? 'Smart sort' : 'A–Z'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Select by type
              </span>
              {Object.entries(FILE_TYPE_FILTERS).map(
                ([typeName, extensions]) => (
                  <button
                    key={typeName}
                    type="button"
                    onClick={() => applyFileTypeFilter(extensions)}
                    disabled={isProcessing || isLoading}
                    className="rounded-full border border-neutral-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                  >
                    {typeName}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 py-14 dark:border-neutral-800 dark:bg-neutral-900/30">
            <RefreshCw
              aria-hidden="true"
              className="h-6 w-6 animate-spin text-emerald-500"
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Scanning folder…
            </p>
          </div>
        ) : sourceType === 'local' && fileHandles.length > 0 ? (
          <FileTree
            files={sortedFileHandles}
            filterText={filterText}
            selectedFiles={selectedFiles}
            onSelectFile={onSelectFile}
            isLoading={isLoading}
            filteredPaths={filteredPaths}
          />
        ) : sourceType === 'github' && githubFiles.length > 0 ? (
          <FileTree
            files={sortedGithubFiles}
            filterText={filterText}
            selectedFiles={selectedFiles}
            onSelectFile={onSelectFile}
            isLoading={isLoading}
            filteredPaths={filteredPaths}
          />
        ) : hasSource ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-neutral-500 shadow-sm ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-800">
              <FileWarning aria-hidden="true" className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              No readable text files found
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {sourceType === 'local'
                ? 'Try another folder or check that it contains text files.'
                : 'This repository may only contain binary or unsupported files.'}
            </p>
            {sourceType === 'local' && (
              <Button
                onClick={handleFolderSelect}
                variant="secondary"
                className="mt-4"
                disabled={isProcessing || isLoading}
              >
                Choose another folder
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default memo(FileSelector);
