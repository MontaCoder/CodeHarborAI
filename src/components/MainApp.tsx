import { ArrowLeft, Moon, RefreshCw, Sun } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { type Context7Doc, Context7Service } from '../services/context7Service';
import {
  SmartContextService,
  type FileAnalysis,
  type SmartContextOptions,
} from '../services/smartContextService';
import type { GitHubFile, GitHubRepoInfo } from '../services/githubService';
import AdvancedOptionsPanel from './AdvancedOptionsPanel';
import FileSelector from './FileSelector';
import OutputPanel from './OutputPanel';
import StatsPanel from './StatsPanel';
import Button from './ui/Button';
import MessageDisplay from './ui/MessageDisplay';

const MainApp: React.FC = () => {
  const { toggleTheme, theme } = useTheme();
  const [folderHandle, setFolderHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [fileHandles, setFileHandles] = useState<
    Array<{
      handle: FileSystemFileHandle;
      path: string;
      size: number;
      lines: number;
    }>
  >([]);
  const [githubFiles, setGithubFiles] = useState<
    Array<{ file: GitHubFile; path: string; size: number; lines: number }>
  >([]);
  const [githubRepoInfo, setGithubRepoInfo] = useState<GitHubRepoInfo | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'error' | 'success';
  } | null>(null);
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
    // Smart Context Optimizer options
    enableSmartOptimization: true,
    maxTotalTokens: 100000,
    prioritizeDocumentation: true,
    includeStructureMap: true,
    extractCodeSignatures: true,
    adaptiveCompression: true,
  });

  useEffect(() => {
    const currentFiles = folderHandle ? fileHandles : githubFiles;
    const { size, lines } = currentFiles.reduce(
      (acc, file) => {
        if (selectedFiles.has(file.path)) {
          acc.size += file.size;
          acc.lines += file.lines;
        }
        return acc;
      },
      { size: 0, lines: 0 },
    );

    setTotalSize(size);
    setTotalLines(lines);
  }, [selectedFiles, fileHandles, githubFiles, folderHandle]);

  const handleFilesSelected = useCallback(
    (
      files: Array<{
        handle: FileSystemFileHandle;
        path: string;
        size: number;
        lines: number;
      }>,
    ) => {
      setFileHandles(files);
    },
    [],
  );

  const handleGitHubFilesSelected = useCallback(
    (
      files: Array<{
        file: GitHubFile;
        path: string;
        size: number;
        lines: number;
      }>,
      repoInfo: GitHubRepoInfo,
    ) => {
      setGithubFiles(files);
      setGithubRepoInfo(repoInfo);
    },
    [],
  );

  const handleFolderSelected = useCallback(
    (handle: FileSystemDirectoryHandle) => {
      setFolderHandle(handle);
    },
    [],
  );

  const handleSelectFile = useCallback((path: string, selected: boolean) => {
    setSelectedFiles((prev) => {
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

      // Add preamble
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
        outputText += '# Task Goal\n' + options.goalText.trim() + '\n\n';
      }

      const projectName = folderHandle
        ? folderHandle.name
        : githubRepoInfo
          ? `${githubRepoInfo.owner}/${githubRepoInfo.repo}`
          : 'Project';

      // Add basic project info
      outputText += '# Project Overview\n';
      outputText += `**Project:** ${projectName}\n`;
      outputText += `**Total Size:** ${(totalSize / 1024).toFixed(2)} KB\n`;
      outputText += `**Total Lines:** ${totalLines.toLocaleString()}\n`;
      outputText += `**Files Selected:** ${selectedFiles.size}\n`;

      if (options.enableSmartOptimization) {
        outputText += `**Smart Optimization:** ✅ Enabled\n`;
      }
      outputText += '\n';

      // Collect and analyze all files
      const fileAnalyses: FileAnalysis[] = [];
      const fileContents = new Map<string, string>();

      for (const filePath of selectedFiles) {
        let content = '';
        let metadata = { size: 0, lines: 0 };

        if (folderHandle) {
          const fileHandle = fileHandles.find((f) => f.path === filePath);
          if (fileHandle) {
            const file = await fileHandle.handle.getFile();
            content = await file.text();
            metadata = { size: fileHandle.size, lines: fileHandle.lines };
          }
        } else {
          const githubFile = githubFiles.find((f) => f.path === filePath);
          if (githubFile && githubFile.file.download_url) {
            content = await fetch(githubFile.file.download_url).then((r) =>
              r.text(),
            );
            metadata = { size: githubFile.size, lines: githubFile.lines };
          }
        }

        if (content) {
          // Apply basic transformations
          if (options.removeComments) {
            content = content.replace(/\/\/.*$/gm, '');
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');
          }

          if (options.minifyOutput) {
            content = content.replace(/\s+/g, ' ').trim();
          }

          fileContents.set(filePath, content);

          // Analyze file with Smart Context Service
          if (options.enableSmartOptimization) {
            const analysis = SmartContextService.analyzeFile(
              filePath,
              content,
              metadata,
            );
            fileAnalyses.push(analysis);
          }
        }
      }

      // Generate structure map if enabled
      if (options.enableSmartOptimization && options.includeStructureMap && fileAnalyses.length > 0) {
        outputText += SmartContextService.generateStructureMap(fileAnalyses);
        outputText += '\n';
      }

      // Optimize context budget if enabled
      let filesToInclude = Array.from(selectedFiles);
      if (options.enableSmartOptimization && options.adaptiveCompression) {
        const smartOptions: SmartContextOptions = {
          maxTotalTokens: options.maxTotalTokens,
          prioritizeDocumentation: options.prioritizeDocumentation,
          includeStructureMap: options.includeStructureMap,
          extractCodeSignatures: options.extractCodeSignatures,
          adaptiveCompression: options.adaptiveCompression,
        };

        const optimizedAnalyses = SmartContextService.optimizeContextBudget(
          fileAnalyses,
          options.maxTotalTokens,
          smartOptions,
        );

        if (optimizedAnalyses.length < fileAnalyses.length) {
          outputText += `**⚡ Smart Optimization:** Included ${optimizedAnalyses.length} of ${fileAnalyses.length} files based on priority and token budget\n\n`;
        }

        filesToInclude = optimizedAnalyses.map((a) => a.path);
      }

      // Add file contents with smart formatting
      outputText += '# File Contents\n\n';

      for (const filePath of filesToInclude) {
        const content = fileContents.get(filePath);
        if (!content) continue;

        if (options.enableSmartOptimization) {
          const analysis = fileAnalyses.find((a) => a.path === filePath);
          if (analysis) {
            const smartOptions: SmartContextOptions = {
              maxTotalTokens: options.maxTotalTokens,
              prioritizeDocumentation: options.prioritizeDocumentation,
              includeStructureMap: options.includeStructureMap,
              extractCodeSignatures: options.extractCodeSignatures,
              adaptiveCompression: options.adaptiveCompression,
            };
            const strategy = SmartContextService.determineStrategy(
              analysis,
              smartOptions,
            );
            outputText += SmartContextService.formatContent(
              filePath,
              content,
              analysis,
              strategy,
            );
          } else {
            // Fallback to standard format
            outputText += `\n═════════════════════════════════════════\n`;
            outputText += `${filePath}\n`;
            outputText += `═════════════════════════════════════════\n\n`;
            outputText += content + '\n';
          }
        } else {
          // Standard format without smart optimization
          outputText += `\n═════════════════════════════════════════\n`;
          outputText += `${filePath}\n`;
          outputText += `═════════════════════════════════════════\n\n`;
          outputText += content + '\n';
        }
      }

      setOutput(outputText);
      setShowOutput(true);
      showMessage(
        options.enableSmartOptimization
          ? '🎯 Smart context generated successfully!'
          : 'Context generated successfully!',
        'success',
      );
    } catch (error) {
      showMessage(
        `Error generating context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedFiles,
    fileHandles,
    githubFiles,
    folderHandle,
    githubRepoInfo,
    options,
    showMessage,
    totalSize,
    totalLines,
  ]);

  const handleOptionChange = useCallback(
    (key: string, value: string | boolean | number | Context7Doc[]) => {
      setOptions((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

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
          <img
            src="/codeharborai_logo.svg"
            alt="CodeHarborAI Logo"
            className="h-7 w-7"
          />
          <h1 className="text-xl font-bold flex items-center">
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent tracking-tight">
              CodeHarborAI
            </span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {(folderHandle || githubRepoInfo) && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden md:inline-block truncate max-w-xs">
              Selected:{' '}
              {folderHandle
                ? folderHandle.name
                : `${githubRepoInfo?.owner}/${githubRepoInfo?.repo}`}
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

      {message && <MessageDisplay message={message.text} type={message.type} />}

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
