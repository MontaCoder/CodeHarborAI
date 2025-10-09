import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import FileSelector from './FileSelector';
import OutputPanel from './OutputPanel';
import AdvancedOptionsPanel from './AdvancedOptionsPanel';
import StatsPanel from './StatsPanel';
import MessageDisplay from './ui/MessageDisplay';
import Button from './ui/Button';
import { GitHubFile, GitHubRepoInfo } from '../services/githubService';
import { Context7Service, Context7Doc } from '../services/context7Service';

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
    minifyOutput: false,
    includeContext7Docs: false,
    context7Docs: [] as Context7Doc[],
    contextEnhancement: 'standard' as 'standard' | 'detailed' | 'concise',
    includeFileMetadata: true,
    includeProjectStructure: true
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

      // Add preamble based on context enhancement level
      if (options.includePreamble && options.preambleText.trim()) {
        outputText += options.preambleText.trim() + '\n\n';
      }

      // Add Context7 documentation references
      if (options.includeContext7Docs && options.context7Docs.length > 0) {
        outputText += '# Referenced Documentation\n\n';
        for (const doc of options.context7Docs) {
          outputText += Context7Service.formatForPrompt(doc);
        }
        outputText += '\n';
      }

      // Add goal
      if (options.includeGoal && options.goalText.trim()) {
        outputText += "# Task Goal\n" + options.goalText.trim() + '\n\n';
      }

      const projectName = folderHandle ? folderHandle.name : (githubRepoInfo ? `${githubRepoInfo.owner}/${githubRepoInfo.repo}` : 'Project');

      // Add project structure based on context enhancement level
      if (options.includeProjectStructure) {
        outputText += "# Project Overview\n";
        outputText += `**Project:** ${projectName}\n`;
        
        if (options.includeFileMetadata) {
          outputText += `**Total Size:** ${(totalSize / 1024).toFixed(2)} KB\n`;
          outputText += `**Total Lines:** ${totalLines.toLocaleString()}\n`;
          outputText += `**Files Included:** ${selectedFiles.size}\n`;
        }
        
        if (options.contextEnhancement === 'detailed') {
          outputText += '\n## File Structure\n';
          const sortedFiles = Array.from(selectedFiles).sort();
          sortedFiles.forEach(filePath => {
            const file = folderHandle 
              ? fileHandles.find(f => f.path === filePath)
              : githubFiles.find(f => f.path === filePath);
            if (file && options.includeFileMetadata) {
              outputText += `- ${filePath} (${(file.size / 1024).toFixed(2)} KB, ${file.lines} lines)\n`;
            } else {
              outputText += `- ${filePath}\n`;
            }
          });
        }
        outputText += '\n';
      }

      // Add file contents
      const separator = options.contextEnhancement === 'concise' ? '\n---\n' : '\n═══════════════════════════════════════\n';
      
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

          // Format based on context enhancement level
          if (options.contextEnhancement === 'detailed') {
            const file = folderHandle 
              ? fileHandles.find(f => f.path === filePath)
              : githubFiles.find(f => f.path === filePath);
            outputText += `${separator}`;
            outputText += `FILE: ${filePath}\n`;
            if (file && options.includeFileMetadata) {
              outputText += `Size: ${(file.size / 1024).toFixed(2)} KB | Lines: ${file.lines}\n`;
            }
            outputText += `${separator}\n${content}\n`;
          } else if (options.contextEnhancement === 'concise') {
            outputText += `${separator}${filePath}\n${content}\n`;
          } else {
            // Standard
            outputText += `${separator}${filePath}${separator}\n${content}\n`;
          }
        }
      }

      setOutput(outputText);
      setShowOutput(true);
      showMessage('Context generated successfully!', 'success');
    } catch (error) {
      showMessage(`Error generating context: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
      <header className="backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors duration-150"
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
            <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden md:inline-block truncate max-w-xs">
              Selected: {folderHandle ? folderHandle.name : `${githubRepoInfo?.owner}/${githubRepoInfo?.repo}`}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 transition-colors duration-150"
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
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
                className="px-8 py-3 text-base shadow-xl hover:shadow-emerald-400/50 dark:hover:shadow-emerald-600/50 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2.5">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Generate AI Context</span>
                )}
              </Button>
            </div>
            
            {showOutput && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 mt-8">
                <OutputPanel output={output} />
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
              <StatsPanel totalSize={totalSize} totalLines={totalLines} />
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
              <AdvancedOptionsPanel 
                options={options} 
                onChange={handleOptionChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;