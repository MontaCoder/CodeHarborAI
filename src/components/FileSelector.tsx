import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, RefreshCw, Filter, X, CheckSquare } from 'lucide-react';
import Button from './ui/Button';
import FileTree from './FileTree';

interface FileSelectorProps {
  onFolderSelected: (handle: FileSystemDirectoryHandle) => void;
  onFilesSelected: (files: Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>) => void;
  onSelectFile: (path: string, selected: boolean) => void;
  onSelectAll: (paths: string[]) => void;
  selectedFiles: Set<string>;
  isLoading: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  onFolderSelected,
  onFilesSelected,
  onSelectFile,
  onSelectAll,
  selectedFiles,
  isLoading
}) => {
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [fileHandles, setFileHandles] = useState<Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>>([]);
  const [gitignoreStatus, setGitignoreStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [filteredPaths, setFilteredPaths] = useState<string[]>([]);
  
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
      const handle = await window.showDirectoryPicker();
      setFolderHandle(handle);
      onFolderSelected(handle);
      await scanFolder(handle);
    } catch (err) {
      console.error('Error selecting folder:', err);
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

  useEffect(() => {
    // Update filtered paths whenever filter text changes
    if (filterText.trim() === '') {
      setFilteredPaths(fileHandles.map(f => f.path));
    } else {
      const filtered = fileHandles
        .filter(f => f.path.toLowerCase().includes(filterText.toLowerCase()))
        .map(f => f.path);
      setFilteredPaths(filtered);
    }
  }, [filterText, fileHandles]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <Button 
            icon={<FolderOpen className="h-4 w-4" />}
            onClick={handleFolderSelect}
            disabled={isProcessing || isLoading}
            primary
          >
            Select Folder
          </Button>
          
          {folderHandle && (
            <Button
              icon={<RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isProcessing || isLoading}
              secondary
            >
              Refresh Folder
            </Button>
          )}
          
          {folderHandle && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {folderHandle.name} {gitignoreStatus && `(${gitignoreStatus})`}
            </span>
          )}
        </div>
        
        {folderHandle && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Filter by file/folder name..."
                  value={filterText}
                  onChange={handleFilterChange}
                  className="pl-10 w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-colors duration-200"
                  disabled={isProcessing || isLoading}
                />
                {filterText && (
                  <button 
                    onClick={handleClearFilter}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                icon={<CheckSquare className="h-4 w-4" />}
                onClick={handleSelectAll}
                disabled={isProcessing || isLoading || fileHandles.length === 0}
                secondary
              >
                Toggle All
              </Button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">File Type Filters:</div>
              {Object.entries(fileTypeFilters).map(([name, extensions]) => (
                <button
                  key={name}
                  onClick={() => applyFileTypeFilter(extensions)}
                  disabled={isProcessing || isLoading}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {folderHandle && (
        <div className={`p-4 ${isProcessing ? 'opacity-50' : ''}`}>
          <FileTree
            files={fileHandles}
            selectedFiles={selectedFiles}
            onSelectFile={onSelectFile}
            filterText={filterText}
            disabled={isProcessing || isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default FileSelector;