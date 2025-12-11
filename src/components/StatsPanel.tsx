import { AlertTriangle, BarChart2, CheckSquare, FileText } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import type { GitHubFileEntry, LocalFileEntry } from '../types/files';
import type { PromptOptions } from '../hooks/usePromptBuilder';
import { useStatsMetrics } from '../hooks/useStatsMetrics';
import type { Context7Doc } from '../services/context7Service';

interface StatsPanelProps {
  totalSize: number;
  totalLines: number;
  maxTotalTokens: number;
  selectedFiles: Set<string>;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  includeContext7Docs: boolean;
  context7Docs: Context7Doc[];
  smartOptions: Pick<
    PromptOptions,
    'enableSmartOptimization' | 'adaptiveCompression' | 'prioritizeDocumentation' | 'includeStructureMap'
  >;
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
    });

    const progressBarVariants: Record<typeof metrics.budgetStatus, string> = {
      safe: 'bg-emerald-500',
      caution: 'bg-yellow-500',
      critical: 'bg-red-500',
    };

    const statusBadgeVariants: Record<typeof metrics.budgetStatus, string> = {
      safe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
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
            <div className="mt-2 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>{metrics.estimatedTokens.toLocaleString()} tokens (~{metrics.sizeKB.toFixed(0)} KB)</span>
              <span>{metrics.budgetTokens.toLocaleString()} max tokens</span>
            </div>
            <div
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeVariants[metrics.budgetStatus]}`}
            >
              {metrics.percentOfBudget.toFixed(0)}% of budget
            </div>
          </div>

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
              <p className="text-xs">{metrics.context7Included ? 'included' : 'disabled'}</p>
            </div>
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
                      <span className="text-neutral-400 dark:text-neutral-500">|</span>
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

