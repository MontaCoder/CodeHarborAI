import {
  ArrowLeft,
  FileText,
  FolderTree,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFileSelection } from '../hooks/useFileSelection';
import {
  type PromptOptions,
  usePromptBuilder,
} from '../hooks/usePromptBuilder';
import { useStatsMetrics } from '../hooks/useStatsMetrics';
import {
  cardClasses,
  headerClasses,
  themeToggleClasses,
} from '../styles/classes';
import AdvancedOptionsPanel from './AdvancedOptionsPanel';
import FileSelector from './FileSelector';
import OutputPanel from './OutputPanel';
import StatsPanel from './StatsPanel';
import Button from './ui/Button';
import MessageDisplay from './ui/MessageDisplay';

interface MainAppProps {
  onBackToLanding: () => void;
}

const formatSize = (sizeKB: number): string =>
  sizeKB >= 1024
    ? `${(sizeKB / 1024).toFixed(1)} MB`
    : `${sizeKB.toFixed(1)} KB`;

const MainApp: React.FC<MainAppProps> = ({ onBackToLanding }) => {
  const { toggleTheme, theme } = useTheme();
  const {
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
      includeSystemContext: false,
      systemContextText: '',
      includeTaskInstructions: false,
      taskInstructionsText: '',
      removeComments: false,
      minifyOutput: false,
      includeContext7Docs: false,
      context7Docs: [],
      enableSmartOptimization: false, // Disabled by default; user preference persisted in localStorage
      maxTotalTokens: 256000,
      prioritizeDocumentation: true,
      includeStructureMap: true,
      adaptiveCompression: true,
      bodyElisionThreshold: 8,
      adaptiveBodyThreshold: false,
      preserveTypeDeclarations: true,
      preserveModuleSurface: true,
    },
    selectedFiles,
    fileHandles,
    githubFiles,
    folderHandle,
    githubRepoInfo,
    activeSource,
    totalSize,
    totalLines,
  });

  const metrics = useStatsMetrics({
    totalSize,
    totalLines,
    maxTotalTokens: options.maxTotalTokens,
    selectedFiles,
    fileHandles,
    githubFiles,
    activeSource,
    includeContext7Docs: options.includeContext7Docs,
    context7Docs: options.context7Docs,
    smartOptions: {
      enableSmartOptimization: options.enableSmartOptimization,
      adaptiveCompression: options.adaptiveCompression,
      prioritizeDocumentation: options.prioritizeDocumentation,
      includeStructureMap: options.includeStructureMap,
      bodyElisionThreshold: options.bodyElisionThreshold,
      adaptiveBodyThreshold: options.adaptiveBodyThreshold,
      preserveTypeDeclarations: options.preserveTypeDeclarations,
      preserveModuleSurface: options.preserveModuleSurface,
    },
    systemContextText: options.systemContextText,
    taskInstructionsText: options.taskInstructionsText,
    removeComments: options.removeComments,
    minifyOutput: options.minifyOutput,
  });

  const hasActiveProject =
    activeSource === 'local' ? Boolean(folderHandle) : Boolean(githubRepoInfo);

  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showOutput || !output || !outputRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    outputRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [showOutput, output]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input:not([readonly]), textarea:not([readonly]), select, [contenteditable="true"], [role="dialog"]',
        )
      ) {
        return;
      }
      onBackToLanding();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToLanding]);

  const selectedLabel =
    selectedFiles.size === 1
      ? '1 file selected'
      : `${selectedFiles.size} files selected`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className={headerClasses}>
        <div className="mx-auto flex h-14 w-full max-w-[1800px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/80 bg-white/70 text-neutral-500 shadow-sm transition-colors hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:text-neutral-100"
              title="Back to home (Esc)"
              aria-label="Back to home"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <img
              src="/codeharborai_logo.svg"
              alt=""
              className="h-7 w-7 flex-shrink-0"
            />
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
                CodeHarbor
                <span className="text-emerald-700 dark:text-emerald-400">
                  AI
                </span>
              </h1>
              <span
                aria-hidden="true"
                className="hidden h-4 w-px bg-neutral-200 sm:block dark:bg-neutral-800"
              />
              <span className="hidden text-xs font-medium text-neutral-500 sm:block dark:text-neutral-400">
                Prompt workbench
              </span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            {((activeSource === 'local' && folderHandle) ||
              (activeSource === 'github' && githubRepoInfo)) && (
              <span className="hidden max-w-[16rem] items-center gap-1.5 truncate rounded-lg border border-neutral-200/80 bg-white/70 px-2.5 py-1.5 text-xs text-neutral-600 shadow-sm md:inline-flex dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
                <FolderTree
                  aria-hidden="true"
                  className="h-3.5 w-3.5 flex-shrink-0 text-sky-500 dark:text-sky-400"
                />
                <span className="truncate">
                  {activeSource === 'local'
                    ? folderHandle?.name
                    : `${githubRepoInfo?.owner}/${githubRepoInfo?.repo}`}
                </span>
              </span>
            )}
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/70 lg:inline-flex dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Local only
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className={themeToggleClasses}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Moon aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {message && (
        <MessageDisplay
          key={message.id}
          message={message.text}
          type={message.type}
        />
      )}

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1800px] flex-1 px-4 pb-28 pt-6 sm:px-6 xl:pb-6"
      >
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
          <aside className="order-2 xl:sticky xl:top-[4.75rem] xl:order-1 xl:col-span-3">
            <div
              className={`${cardClasses} p-5 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:overscroll-contain`}
            >
              <StatsPanel
                metrics={metrics}
                totalLines={totalLines}
                smartOptions={{
                  enableSmartOptimization: options.enableSmartOptimization,
                  adaptiveCompression: options.adaptiveCompression,
                  prioritizeDocumentation: options.prioritizeDocumentation,
                  includeStructureMap: options.includeStructureMap,
                  removeComments: options.removeComments,
                  minifyOutput: options.minifyOutput,
                }}
              />
            </div>
          </aside>

          <section className="order-1 space-y-4 xl:order-2 xl:col-span-6">
            <div className={`${cardClasses} p-5 sm:p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    <FolderTree
                      aria-hidden="true"
                      className="h-4 w-4 text-sky-500 dark:text-sky-400"
                    />
                    Project files
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Open a local folder or import a public GitHub repository,
                    then pick exactly what the model should see.
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <FileSelector
                  onFolderSelected={handleFolderSelected}
                  onFilesSelected={handleFilesSelected}
                  onGitHubFilesSelected={handleGitHubFilesSelected}
                  onSelectFile={handleSelectFile}
                  onSelectAll={handleSelectAll}
                  onSourceChange={handleSourceChange}
                  sourceType={activeSource}
                  folderHandle={folderHandle}
                  fileHandles={fileHandles}
                  githubFiles={githubFiles}
                  githubRepoInfo={githubRepoInfo}
                  selectedFiles={selectedFiles}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {hasActiveProject && (
              <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] xl:sticky xl:bottom-4 xl:left-auto xl:right-auto xl:top-auto xl:z-20 xl:px-0 xl:pb-0">
                <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white/95 p-2.5 shadow-lift backdrop-blur-md xl:max-w-none xl:p-3 dark:border-neutral-700/70 dark:bg-neutral-900/90">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                      <FileText aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {selectedLabel}
                      </p>
                      <p className="hidden truncate text-xs text-neutral-500 sm:block dark:text-neutral-400">
                        {metrics.estimatedTokens.toLocaleString()} tokens ·{' '}
                        {formatSize(metrics.sizeKB)} ·{' '}
                        {totalLines.toLocaleString()} lines
                      </p>
                      <p className="truncate text-[11px] text-neutral-500 sm:hidden dark:text-neutral-400">
                        {metrics.estimatedTokens.toLocaleString()} tokens ·{' '}
                        {totalLines.toLocaleString()} lines
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCombine}
                    disabled={selectedFiles.size === 0 || isLoading}
                    variant="primary"
                    className="flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin"
                        />
                        <span className="hidden sm:inline">Generating…</span>
                        <span className="sm:hidden">Working…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles aria-hidden="true" className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Generate prompt
                        </span>
                        <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </section>

          <aside className="order-3 xl:sticky xl:top-[4.75rem] xl:col-span-3">
            <div
              className={`${cardClasses} p-5 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:overscroll-contain`}
            >
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
          </aside>
        </div>

        {showOutput && (
          <div
            ref={outputRef}
            className={`${cardClasses} mt-6 scroll-mt-20 p-5 sm:p-6`}
          >
            <OutputPanel output={output} />
          </div>
        )}
      </main>
    </div>
  );
};

export default MainApp;
