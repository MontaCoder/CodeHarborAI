import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import FileSelector from './FileSelector';
import OutputPanel from './OutputPanel';
import OptionsPanel from './OptionsPanel';
import PresetManager from './PresetManager';
import StatsPanel from './StatsPanel';
import MessageDisplay from './ui/MessageDisplay';
import Button from './ui/Button';
import { GitHubFile, GitHubRepoInfo } from '../services/githubService';

const MainApp: React.FC = () => {
  const { toggleTheme, theme } = useTheme();
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileHandles, setFileHandles] = useState<Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>>([]);
  const [githubFiles, setGithubFiles] = useState<Array<{file: GitHubFile, path: string, size: number, lines: number}>>([]);
  const [githubRepoInfo, setGithubRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [totalLines, setTotalLines] = useState<number>(0);
  const [options, setOptions] = useState({
    includePreamble: false,
    preambleText: '',
    includeGoal: false,
    goalText: '',
    removeComments: false,
    minifyOutput: false
  });

  useEffect(() => {
    const currentFiles = folderHandle ? fileHandles : githubFiles;
    const { size, lines } = currentFiles.reduce((acc, file) => {
      if (selectedFiles.has(file.path)) {
        acc.size += file.size;
        acc.lines += file.lines;
      }
      return acc;
    }, { size: 0, lines: 0 });

    setTotalSize(size);
    setTotalLines(lines);
  }, [selectedFiles, fileHandles, githubFiles, folderHandle]);

  const handleFilesSelected = useCallback((files: Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>) => {
    setFileHandles(files);
  }, []);

  const handleGitHubFilesSelected = useCallback((files: Array<{file: GitHubFile, path: string, size: number, lines: number}>, repoInfo: GitHubRepoInfo) => {
    setGithubFiles(files);
    setGithubRepoInfo(repoInfo);
  }, []);

  const handleFolderSelected = useCallback((handle: FileSystemDirectoryHandle) => {
    setFolderHandle(handle);
  }, []);

  const handleSelectFile = useCallback((path: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(path);
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((paths: string[]) => {
    setSelectedFiles(new Set(paths));
  }, []);

  const showMessage = useCallback((text: string, type: 'error' | 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const handleCombine = useCallback(async () => {
    if (selectedFiles.size === 0) {
      showMessage('Please select at least one file', 'error');
      return;
    }

    setIsLoading(true);

    try {
      let outputText = '';

      if (options.includePreamble && options.preambleText.trim()) {
        outputText += options.preambleText.trim() + '\n\n';
      }

      if (options.includeGoal && options.goalText.trim()) {
        outputText += "Goal:\n" + options.goalText.trim() + '\n\n';
      }

      // Add project structure
      const projectName = folderHandle ? folderHandle.name : (githubRepoInfo ? `${githubRepoInfo.owner}/${githubRepoInfo.repo}` : 'Project');
      outputText += "Project Structure:\n";
      outputText += `└── ${projectName} (Size: ${(totalSize / 1024).toFixed(2)}kb; Lines: ${totalLines})\n`;

      // Add file contents
      for (const filePath of selectedFiles) {
        let content = '';

        if (folderHandle) {
          // Local file
          const fileHandle = fileHandles.find(f => f.path === filePath);
          if (fileHandle) {
            const file = await fileHandle.handle.getFile();
            content = await file.text();
          }
        } else {
          // GitHub file
          const githubFile = githubFiles.find(f => f.path === filePath);
          if (githubFile && githubFile.file.download_url) {
            content = await fetch(githubFile.file.download_url).then(r => r.text());
          }
        }

        if (content) {
          // Apply transformations if options are set
          if (options.removeComments) {
            // Remove single-line comments
            content = content.replace(/\/\/.*$/gm, '');
            // Remove multi-line comments
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');
          }

          if (options.minifyOutput) {
            // Simple minification: remove extra whitespace and newlines
            content = content.replace(/\s+/g, ' ').trim();
          }

          outputText += `\n---\n${filePath}\n---\n${content}\n`;
        }
      }

      setOutput(outputText);
      setShowOutput(true);
      showMessage('Files combined successfully!', 'success');
    } catch (error) {
      showMessage(`Error combining files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, fileHandles, githubFiles, folderHandle, githubRepoInfo, options, showMessage, totalSize, totalLines]);

  const handleOptionChange = useCallback((key: string, value: string | boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700/50 px-4 sm:px-8 py-3 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-colors duration-150"
            title="Return to landing page"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src="/codeharborai_logo.svg" alt="CodeHarborAI Logo" className="h-7 w-7" />
          <h1 className="text-xl font-bold flex items-center">
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent tracking-tight">CodeHarborAI</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {(folderHandle || githubRepoInfo) && (
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden md:inline-block truncate max-w-xs">
              Selected: {folderHandle ? folderHandle.name : `${githubRepoInfo?.owner}/${githubRepoInfo?.repo}`}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900 transition-colors duration-150"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {message && (
        <MessageDisplay message={message.text} type={message.type} />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 backdrop-blur-md">
              <FileSelector
                onFolderSelected={handleFolderSelected}
                onFilesSelected={handleFilesSelected}
                onGitHubFilesSelected={handleGitHubFilesSelected}
                onSelectFile={handleSelectFile}
                onSelectAll={handleSelectAll}
                selectedFiles={selectedFiles}
                isLoading={isLoading}
              />
            </div>
            
            <div className="sticky bottom-6 flex justify-center z-10">
              <Button
                onClick={handleCombine}
                disabled={selectedFiles.size === 0 || isLoading}
                primary
                className="px-8 py-3 text-base shadow-xl hover:shadow-emerald-400/50 dark:hover:shadow-emerald-600/50 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2.5">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Combine Selected Files</span>
                )}
              </Button>
            </div>
            
            {showOutput && (
              <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 backdrop-blur-md mt-8">
                <OutputPanel output={output} />
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 backdrop-blur-md">
              <StatsPanel totalSize={totalSize} totalLines={totalLines} />
            </div>
            <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 backdrop-blur-md">
              <OptionsPanel 
                options={options} 
                onChange={handleOptionChange}
              />
            </div>
            <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 backdrop-blur-md">
              <PresetManager
                folderHandle={folderHandle}
                selectedFiles={selectedFiles}
                options={options}
                onLoadPreset={(files, opts) => {
                  setSelectedFiles(new Set(files));
                  setOptions(opts);
                }}
                showMessage={showMessage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;