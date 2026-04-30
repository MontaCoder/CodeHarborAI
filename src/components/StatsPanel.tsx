import { AlertTriangle, BarChart2, CheckSquare, FileText } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { useStatsMetrics } from '../hooks/useStatsMetrics';
import type { Context7Doc } from '../services/context7Service';
import type { GitHubFileEntry, LocalFileEntry } from '../types/files';

interface StatsPanelProps {
  totalSize: number;
  totalLines: number;
  maxTotalTokens: number;
  selectedFiles: Set<string>;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  includeContext7Docs: boolean;
  context7Docs: Context7Doc[];
  smartOptions: {
    enableSmartOptimization: boolean;
    adaptiveCompression: boolean;
    prioritizeDocumentation: boolean;
    includeStructureMap: boolean;
    bodyElisionThreshold: number;
    adaptiveBodyThreshold: boolean;
    preserveTypeDeclarations: boolean;
    preserveModuleSurface: boolean;
  };
  // New props for enhanced stats
  systemContextText: string;
  taskInstructionsText: string;
  removeComments: boolean;
  minifyOutput: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = memo(
  ({
    totalSize,
    totalLines,
    maxTotalTokens,
    selectedFiles,
    fileHandles,
    githubFiles,
    includeContext7Docs,
    context7Docs,
    smartOptions,
    systemContextText,
    taskInstructionsText,
    removeComments,
    minifyOutput,
  }) => {
    const metrics = useStatsMetrics({
      totalSize,
      totalLines,
      maxTotalTokens,
      selectedFiles,
      fileHandles,
      githubFiles,
      includeContext7Docs,
      context7Docs,
      smartOptions,
      systemContextText,
      taskInstructionsText,
      removeComments,
      minifyOutput,
    });

    const progressBarVariants: Record<typeof metrics.budgetStatus, string> = {
      safe: 'bg-emerald-500',
      caution: 'bg-yellow-500',
      critical: 'bg-red-500',
    };

    const statusBadgeVariants: Record<typeof metrics.budgetStatus, string> = {
      safe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      caution:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
      <div className="animate-fade-in space-y-5">
        <div className="flex items-center">
          <BarChart2 className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Performance Stats
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Size:
            </span>
            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {metrics.sizeKB.toFixed(2)} KB
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Lines:
            </span>
            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {totalLines.toLocaleString()}
            </span>
          </div>

          <div className="pt-1">
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${progressBarVariants[metrics.budgetStatus]}`}
                style={{ width: `${metrics.percentOfBudget}%` }}
                role="progressbar"
                aria-valuenow={metrics.percentOfBudget}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="mt-2 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Raw tokens (no optimization):</span>
                <span className="font-medium">{metrics.rawTokens.toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tokens {smartOptions.enableSmartOptimization ? '(optimized)' : '(as-is)'}:</span>
                <span className="font-medium">{metrics.estimatedTokens.toLocaleString()} tokens</span>
              </div>
              {metrics.tokenSavings > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Savings:</span>
                  <span className="font-bold">{metrics.tokenSavings.toLocaleString()} tokens ({metrics.savingsPercent}%)</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>{metrics.budgetTokens.toLocaleString()} max tokens</span>
            </div>
            <div
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeVariants[metrics.budgetStatus]}`}
            >
              {metrics.percentOfBudget.toFixed(0)}% of budget
            </div>
          </div>

          {/* Token Breakdown Section */}
          <div className="space-y-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 ring-1 ring-neutral-200 dark:ring-neutral-700/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Token Breakdown
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">File Tokens:</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {metrics.fileTokens.toLocaleString()}
                </span>
              </div>
              {metrics.templateTokens > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">+ Template Tokens:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {metrics.templateTokens.toLocaleString()}
                  </span>
                </div>
              )}
              {metrics.context7Tokens > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">+ Reference Docs:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {metrics.context7Tokens.toLocaleString()}
                  </span>
                </div>
              )}
              {metrics.transformationSavings > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">- Transformations:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    -{metrics.transformationSavings.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-700 dark:text-neutral-300">= Total Estimated:</span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {metrics.estimatedTokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            </div>
          </div>

          {metrics.tokenSavings > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Token Savings:
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.tokenSavings.toLocaleString()} tokens ({metrics.savingsPercent}%)
              </span>
            </div>
          )}

          {metrics.budgetStatus !== 'safe' && (
            <div className="mt-2 flex items-start space-x-2.5 text-sm text-red-600 dark:text-red-400 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
              <span className="leading-snug">{metrics.budgetMessage}</span>
            </div>
          )}
          {metrics.budgetStatus === 'safe' && totalSize > 0 && (
            <div className="mt-2 flex items-start space-x-2.5 text-sm text-emerald-700 dark:text-emerald-300 p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30">
              <CheckSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span className="leading-snug">{metrics.budgetMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800/40 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                Selected Files
              </p>
              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {metrics.selectedCount}
              </p>
              <p className="text-xs">of {metrics.totalCount} scanned</p>
            </div>
            <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800/40 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                Smart Optimizer
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                {metrics.smartSummary}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800/40 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                Context7 Docs
              </p>
              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {metrics.context7DocCount}
              </p>
              <p className="text-xs">
                {metrics.context7Included ? 'included' : 'disabled'}
              </p>
            </div>
            {metrics.templateTokens > 0 && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 border border-blue-200 dark:border-blue-800">
                <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Template Tokens
                </p>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {metrics.templateTokens.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  system + task
                </p>
              </div>
            )}
            {metrics.context7Tokens > 0 && (
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 px-3 py-2 border border-purple-200 dark:border-purple-800">
                <p className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Ref Docs Tokens
                </p>
                <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  {metrics.context7Tokens.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {metrics.context7DocCount} docs
                </p>
              </div>
            )}
            {metrics.transformationSavings > 0 && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Transform Saved
                </p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {metrics.transformationSavings.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  comments + minify
                </p>
              </div>
            )}
            {metrics.tokenSavings > 0 && metrics.transformationSavings === 0 && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Token Savings
                </p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {metrics.savingsPercent}%
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {metrics.tokenSavings.toLocaleString()} tokens saved
                </p>
              </div>
            )}
          </div>

          {metrics.topFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                Largest Selected Files
              </p>
              <div className="space-y-1.5">
                {metrics.topFiles.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center justify-between rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      <span className="truncate" title={file.path}>
                        {file.path}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span>{file.sizeKB.toFixed(1)} KB</span>
                      <span className="text-neutral-400 dark:text-neutral-500">
                        |
                      </span>
                      <span>{file.lines.toLocaleString()} lines</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default StatsPanel;
