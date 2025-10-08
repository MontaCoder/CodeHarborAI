import React, { useState, useEffect, memo } from 'react';
import { FolderOpen, RefreshCw, Filter, X, CheckSquare, ChevronDown, Github } from 'lucide-react';
import Button from './ui/Button';
import FileTree from './FileTree';
import GitHubLoader from './GitHubLoader';
import GitHubFileTree from './GitHubFileTree';
import { GitHubFile, GitHubRepoInfo } from '../services/githubService';

interface FileSelectorProps {
  onFolderSelected: (handle: FileSystemDirectoryHandle) => void;
  onFilesSelected: (files: Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>) => void;
  onGitHubFilesSelected: (files: Array<{file: GitHubFile, path: string, size: number, lines: number}>, repoInfo: GitHubRepoInfo) => void;
  onSelectFile: (path: string, selected: boolean) => void;
  onSelectAll: (paths: string[]) => void;
  selectedFiles: Set<string>;
  isLoading: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  onFolderSelected,
  onFilesSelected,
  onGitHubFilesSelected,
  onSelectFile,
  onSelectAll,
  selectedFiles,
  isLoading
}) => {
  const [sourceType, setSourceType] = useState<'local' | 'github'>('local');
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [fileHandles, setFileHandles] = useState<Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>>([]);
  const [githubFiles, setGithubFiles] = useState<Array<{file: GitHubFile, path: string, size: number, lines: number}>>([]);
  const [githubRepoInfo, setGithubRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [gitignoreStatus, setGitignoreStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [filteredPaths, setFilteredPaths] = useState<string[]>([]);
  const [githubError, setGithubError] = useState<string>('');
  
  const fileTypeFilters = {
    'JavaScript': ['.js', '.mjs', '.cjs'],
    'React': ['.jsx', '.tsx'],
    'TypeScript': ['.ts', '.tsx'],
    'JSON': ['.json'],
    'Markdown': ['.md'],
    'Python': ['.py'],
    'Go': ['.go'],
    'Java': ['.java'],
    'Ruby': ['.rb'],
    'PHP': ['.php'],
    'Rust': ['.rs'],
  };

  const isTextFile = (name: string) => {
    const textExtensions = [
      '.txt', '.md', '.csv', '.js', '.css', '.html', 
      '.json', '.xml', '.yaml', '.yml', '.ini', '.log',
      '.sh', '.bash', '.py', '.java', '.cpp', '.c', '.h',
      '.config', '.env', '.gitignore', '.sql', '.ts',
      '.tsx', '.schema', '.mjs', '.cjs', '.jsx', '.rs',
      '.go', '.php', '.rb', '.toml', '.prisma', '.bat', '.ps1',
      '.svelte', '.lock'
    ];
    const exactMatches = ['Makefile', 'Dockerfile'];

    if (exactMatches.includes(name)) {
      return true;
    }
    return textExtensions.some(ext => name.toLowerCase().endsWith(ext));
  };

  const hasGitignore = async (dirHandle: FileSystemDirectoryHandle) => {
    try {
      await dirHandle.getFileHandle('.gitignore');
      setGitignoreStatus('.gitignore found and applied');
      return true;
    } catch {
      setGitignoreStatus('Using default ignore patterns');
      return false;
    }
  };

  const getFileSizeAndLines = async (fileHandle: FileSystemFileHandle) => {
    const file = await fileHandle.getFile();
    const size = file.size;
    let lines = 0;
    
    if (isTextFile(fileHandle.name)) {
      const content = await file.text();
      lines = content.split('\n').length;
    }
    
    return { size, lines };
  };

  const shouldIgnore = (path: string) => {
    // Simple default ignore patterns
    const patterns = [
      /^\.git\//,
      /^node_modules\//,
      /^\.next\//,
      /^build\//,
      /^dist\//,
      /^coverage\//,
      /\.DS_Store$/,
      /^\.env/,
    ];
    
    return patterns.some(pattern => pattern.test(path));
  };

  const scanFolder = async (handle: FileSystemDirectoryHandle, path = '') => {
    setIsProcessing(true);
    
    const files: Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}> = [];
    
    const scanRecursive = async (dirHandle: FileSystemDirectoryHandle, currentPath = '') => {
      // @ts-expect-error File System Access API may not be fully typed in all environments
      for await (const entry of dirHandle.values()) {
        const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        
        if (shouldIgnore(entryPath)) continue;
        
        if (entry.kind === 'file') {
          if (isTextFile(entry.name)) {
            const fileHandle = entry as FileSystemFileHandle;
            const { size, lines } = await getFileSizeAndLines(fileHandle);
            files.push({ handle: fileHandle, path: entryPath, size, lines });
          }
        } else if (entry.kind === 'directory') {
          await scanRecursive(entry as FileSystemDirectoryHandle, entryPath);
        }
      }
    };
    
    await hasGitignore(handle);
    await scanRecursive(handle, path);
    
    setFileHandles(files);
    onFilesSelected(files);
    setIsProcessing(false);
    
    return files;
  };

  const handleFolderSelect = async () => {
    try {
      // @ts-expect-error File System Access API may not be fully typed in all environments
      const handle = await window.showDirectoryPicker();
      setFolderHandle(handle);
      onFolderSelected(handle);
      await scanFolder(handle);
    } catch (err) {
      console.error('Error selecting folder:', err);
      onFilesSelected([]);
    }
  };

  const handleRefresh = async () => {
    if (folderHandle) {
      await scanFolder(folderHandle);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  const handleClearFilter = () => {
    setFilterText('');
  };

  const handleSelectAll = () => {
    // If all filtered files are selected, deselect all, otherwise select all
    const allFilteredSelected = filteredPaths.every(path => selectedFiles.has(path));
    
    if (allFilteredSelected) {
      // Create a new set excluding the filtered paths
      const newSelectedFiles = new Set<string>();
      for (const path of selectedFiles) {
        if (!filteredPaths.includes(path)) {
          newSelectedFiles.add(path);
        }
      }
      onSelectAll(Array.from(newSelectedFiles));
    } else {
      // Add all filtered paths to current selection
      const newSelectedFiles = new Set(selectedFiles);
      for (const path of filteredPaths) {
        newSelectedFiles.add(path);
      }
      onSelectAll(Array.from(newSelectedFiles));
    }
  };

  const applyFileTypeFilter = (extensions: string[]) => {
    const paths = fileHandles
      .filter(file => extensions.some(ext => file.path.toLowerCase().endsWith(ext)))
      .map(file => file.path);
      
    const newSelectedFiles = new Set(selectedFiles);
    paths.forEach(path => newSelectedFiles.add(path));
    onSelectAll(Array.from(newSelectedFiles));
  };

  const handleGitHubRepositoryLoaded = (files: Array<{file: GitHubFile, path: string, size: number, lines: number}>, repoInfo: GitHubRepoInfo) => {
    setGithubFiles(files);
    setGithubRepoInfo(repoInfo);
    setGithubError('');
    onGitHubFilesSelected(files, repoInfo);
  };

  const handleGitHubError = (error: string) => {
    setGithubError(error);
  };

  const handleSourceTypeChange = (type: 'local' | 'github') => {
    setSourceType(type);
    setFilterText('');
    setGithubError('');

    if (type === 'local') {
      // Clear GitHub data
      setGithubFiles([]);
      setGithubRepoInfo(null);
      onFilesSelected([]);
    } else {
      // Clear local data
      setFileHandles([]);
      setFolderHandle(null);
      onFilesSelected([]);
    }
  };

  useEffect(() => {
    // Update filtered paths whenever filter text changes
    const currentFiles = sourceType === 'local' ? fileHandles : githubFiles;
    if (filterText.trim() === '') {
      setFilteredPaths(currentFiles.map(f => f.path));
    } else {
      const filtered = currentFiles
        .filter(f => f.path.toLowerCase().includes(filterText.toLowerCase()))
        .map(f => f.path);
      setFilteredPaths(filtered);
    }
  }, [filterText, fileHandles, githubFiles, sourceType]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Source Type Toggle */}
      <div className="flex items-center justify-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          onClick={() => handleSourceTypeChange('local')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            sourceType === 'local'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Local Folder</span>
        </button>
        <button
          onClick={() => handleSourceTypeChange('github')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            sourceType === 'github'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Github className="h-4 w-4" />
          <span>GitHub Repo</span>
        </button>
      </div>

      {/* Local Folder Section */}
      {sourceType === 'local' && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
          <Button
            icon={<FolderOpen className="h-4 w-4" />}
            onClick={handleFolderSelect}
            disabled={isProcessing || isLoading}
            primary
            className="w-full sm:w-auto text-sm px-4 py-2 shadow-md hover:shadow-lg"
          >
            Select Project Folder
          </Button>

          {folderHandle && (
            <Button
              icon={<RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isProcessing || isLoading}
              secondary
              className="w-full sm:w-auto text-sm px-4 py-2"
            >
              Refresh Folder
            </Button>
          )}

          {folderHandle && (
            <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 min-w-0 truncate">
              <strong className="font-medium text-slate-700 dark:text-slate-300">Project:</strong> {folderHandle.name}
              {gitignoreStatus && <span className="text-xs ml-1 p-1 rounded-md bg-slate-100 dark:bg-slate-700">({gitignoreStatus})</span>}
            </span>
          )}
        </div>
      )}

      {/* GitHub Section */}
      {sourceType === 'github' && (
        <div className="space-y-4">
          <GitHubLoader
            onRepositoryLoaded={handleGitHubRepositoryLoaded}
            onError={handleGitHubError}
            isLoading={isLoading}
          />
          {githubRepoInfo && (
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
              <strong className="font-medium text-slate-700 dark:text-slate-300">Repository:</strong> {githubRepoInfo.owner}/{githubRepoInfo.repo} ({githubRepoInfo.branch})
            </div>
          )}
        </div>
      )}

      {/* File Tree Section */}
      {(folderHandle || githubRepoInfo) && (
        <div className="space-y-4">
          {githubError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{githubError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Filter files (e.g., utils, .ts, /components/)"
                value={filterText}
                onChange={handleFilterChange}
                className="pl-10 pr-10 w-full py-2.5 px-4 border-0 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 rounded-lg bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-150 text-sm placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                disabled={isProcessing || isLoading}
              />
              {filterText && (
                <button
                  onClick={handleClearFilter}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  aria-label="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              icon={<CheckSquare className="h-4 w-4" />}
              onClick={handleSelectAll}
              disabled={isProcessing || isLoading || filteredPaths.length === 0}
              secondary
              className="w-full sm:w-auto text-sm px-4 py-2.5 whitespace-nowrap"
            >
              {filteredPaths.every(path => selectedFiles.has(path)) && filteredPaths.length > 0 ? 'Deselect Filtered' : 'Select Filtered'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Quick Filters:</span>
            {Object.entries(fileTypeFilters).slice(0, 5).map(([typeName, extensions]) => (
              <button
                key={typeName}
                onClick={() => applyFileTypeFilter(extensions)}
                disabled={isProcessing || isLoading}
                className="px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150
                          bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700
                          dark:bg-slate-700/80 dark:text-slate-200 dark:hover:bg-emerald-500/30 dark:hover:text-emerald-300
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {typeName}
              </button>
            ))}
            {Object.keys(fileTypeFilters).length > 5 && (
              <Button secondary className="text-xs px-3 py-1" onClick={() => { /* TODO: Implement more filters dropdown */ }}> <ChevronDown className="h-3 w-3 mr-1" /> More</Button>
            )}
          </div>

          {isProcessing ? (
            <div className="text-center py-10">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">
                {sourceType === 'local' ? 'Scanning folder...' : 'Loading repository...'}
              </p>
            </div>
          ) : sourceType === 'local' && fileHandles.length > 0 ? (
            <FileTree
              files={fileHandles}
              filterText={filterText}
              selectedFiles={selectedFiles}
              onSelectFile={onSelectFile}
              isLoading={isLoading}
              filteredPaths={filteredPaths}
            />
          ) : sourceType === 'github' && githubFiles.length > 0 ? (
            <GitHubFileTree
              files={githubFiles}
              filterText={filterText}
              selectedFiles={selectedFiles}
              onSelectFile={onSelectFile}
              isLoading={isLoading}
              filteredPaths={filteredPaths}
            />
          ) : folderHandle || githubRepoInfo ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10">
              {sourceType === 'local'
                ? 'No text files found in the selected folder or matching filters.'
                : 'No text files found in the repository or matching filters.'}
            </p>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10">
              {sourceType === 'local'
                ? 'Select a project folder to view files.'
                : 'Load a GitHub repository to view files.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(FileSelector);