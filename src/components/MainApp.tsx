import { ArrowLeft, Moon, RefreshCw, Sun } from 'lucide-react';
import type React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFileSelection } from '../hooks/useFileSelection';
import {
  type PromptOptions,
  usePromptBuilder,
} from '../hooks/usePromptBuilder';
import AdvancedOptionsPanel from './AdvancedOptionsPanel';
import FileSelector from './FileSelector';
import OutputPanel from './OutputPanel';
import StatsPanel from './StatsPanel';
import Button from './ui/Button';
import MessageDisplay from './ui/MessageDisplay';

const MainApp: React.FC = () => {
  const { toggleTheme, theme } = useTheme();
  const {
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
  } = useFileSelection();

  const {
    output,
    showOutput,
    isLoading,
    message,
    handleCombine,
    handleOptionChange,
    options,
  } = usePromptBuilder({
    options: {
      includePreamble: false,
      preambleText: '',
      includeGoal: false,
      goalText: '',
      removeComments: false,
      minifyOutput: false,
      includeContext7Docs: false,
      context7Docs: [],
      enableSmartOptimization: true,
      maxTotalTokens: 200000,
      prioritizeDocumentation: true,
      includeStructureMap: true,
      extractCodeSignatures: true,
      adaptiveCompression: true,
    },
    selectedFiles,
    fileHandles,
    githubFiles,
    folderHandle,
    githubRepoInfo,
    totalSize,
    totalLines,
  });

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
                folderHandle={folderHandle}
                fileHandles={fileHandles}
                githubFiles={githubFiles}
                githubRepoInfo={githubRepoInfo}
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
              <StatsPanel
                totalSize={totalSize}
                totalLines={totalLines}
                maxTotalTokens={options.maxTotalTokens}
                selectedFiles={selectedFiles}
                fileHandles={fileHandles}
                githubFiles={githubFiles}
                includeContext7Docs={options.includeContext7Docs}
                context7Docs={options.context7Docs}
                smartOptions={{
                  enableSmartOptimization: options.enableSmartOptimization,
                  adaptiveCompression: options.adaptiveCompression,
                  prioritizeDocumentation: options.prioritizeDocumentation,
                  includeStructureMap: options.includeStructureMap,
                }}
              />
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
              <AdvancedOptionsPanel
                options={options}
                onChange={(key, value) =>
                  handleOptionChange(
                    key as keyof PromptOptions,
                    value as PromptOptions[keyof PromptOptions],
                  )
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;
