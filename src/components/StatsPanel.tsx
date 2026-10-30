import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  FileText,
  Sparkles,
} from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import type { StatsMetricsResult } from '../hooks/useStatsMetrics';

interface StatsPanelProps {
  metrics: StatsMetricsResult;
  totalLines: number;
  smartOptions: {
    enableSmartOptimization: boolean;
    adaptiveCompression: boolean;
    prioritizeDocumentation: boolean;
    includeStructureMap: boolean;
    removeComments: boolean;
    minifyOutput: boolean;
  };
}

const formatSize = (sizeKB: number): string => {
  if (sizeKB >= 1024) return `${(sizeKB / 1024).toFixed(1)} MB`;
  return `${sizeKB.toFixed(1)} KB`;
};

const StatsPanel: React.FC<StatsPanelProps> = memo(
  ({ metrics, totalLines, smartOptions }) => {
    const progressBarVariants: Record<typeof metrics.budgetStatus, string> = {
      safe: 'bg-emerald-500',
      caution: 'bg-amber-500',
      critical: 'bg-red-500',
    };

    const statusBadgeVariants: Record<typeof metrics.budgetStatus, string> = {
      safe: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
      caution:
        'bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
      critical:
        'bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
    };

    const settingsChips = [
      smartOptions.enableSmartOptimization ? 'Optimizer on' : 'Optimizer off',
      smartOptions.enableSmartOptimization &&
        smartOptions.adaptiveCompression &&
        'Compression',
      smartOptions.enableSmartOptimization &&
        smartOptions.includeStructureMap &&
        'Structure map',
      smartOptions.enableSmartOptimization &&
        smartOptions.prioritizeDocumentation &&
        'Docs first',
      smartOptions.removeComments && 'Comments stripped',
      smartOptions.minifyOutput && 'Minified',
    ].filter(Boolean) as string[];

    const percentLabel =
      metrics.percentOfBudget > 0 && metrics.percentOfBudget < 1
        ? '<1%'
        : `${Math.round(metrics.percentOfBudget)}%`;

    return (
      <div className="animate-fade-in space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Selection summary
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Live context estimate
            </p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/70 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20">
            <BarChart3 aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>

        <div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                Estimated tokens
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-neutral-950 dark:text-white">
                {metrics.estimatedTokens.toLocaleString()}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusBadgeVariants[metrics.budgetStatus]}`}
            >
              {percentLabel}
            </span>
          </div>

          <div className="mt-3">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${progressBarVariants[metrics.budgetStatus]}`}
                style={{ width: `${metrics.percentOfBudget}%` }}
                role="progressbar"
                aria-label="Token budget usage"
                aria-valuenow={metrics.percentOfBudget}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${percentLabel} of ${metrics.budgetTokens.toLocaleString()} token budget`}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>
                {metrics.estimatedTokens.toLocaleString()} of{' '}
                {metrics.budgetTokens.toLocaleString()}
              </span>
              <span>
                {smartOptions.enableSmartOptimization ? 'optimized' : 'as-is'}
              </span>
            </div>{' '}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 px-2.5 py-2 dark:border-neutral-800 dark:bg-neutral-800/30">
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Files
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {metrics.selectedCount}
              <span className="ml-1 text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
                /{metrics.totalCount}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 px-2.5 py-2 dark:border-neutral-800 dark:bg-neutral-800/30">
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Size
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatSize(metrics.sizeKB)}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 px-2.5 py-2 dark:border-neutral-800 dark:bg-neutral-800/30">
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Lines
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {totalLines.toLocaleString()}
            </p>
          </div>
        </div>

        {metrics.budgetStatus !== 'safe' && (
          <div
            className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs leading-snug ${
              metrics.budgetStatus === 'critical'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
            }`}
          >
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 flex-shrink-0"
            />
            <span>{metrics.budgetMessage}</span>
          </div>
        )}

        <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-800/30">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <Sparkles
                aria-hidden="true"
                className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
              />
              Smart optimizer
            </p>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                smartOptions.enableSmartOptimization
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {smartOptions.enableSmartOptimization ? 'Enabled' : 'Off'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {settingsChips.map((chip) => (
              <span
                key={chip}
                className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700/80"
              >
                {chip}
              </span>
            ))}
          </div>
          {metrics.tokenSavings > 0 && (
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              {metrics.tokenSavings.toLocaleString()} tokens saved (
              {metrics.savingsPercent}%)
            </p>
          )}
        </div>

        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 [&::-webkit-details-marker]:hidden">
            Token breakdown
            <ChevronDown
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="mt-2 space-y-1.5 rounded-lg border border-neutral-200/70 bg-white px-3 py-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500 dark:text-neutral-400">
                File tokens
              </span>
              <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
                {metrics.fileTokens.toLocaleString()}
              </span>
            </div>
            {metrics.templateTokens > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Template text
                </span>
                <span className="font-medium tabular-nums text-sky-600 dark:text-sky-400">
                  +{metrics.templateTokens.toLocaleString()}
                </span>
              </div>
            )}
            {metrics.context7Tokens > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Reference docs
                </span>
                <span className="font-medium tabular-nums text-violet-600 dark:text-violet-400">
                  +{metrics.context7Tokens.toLocaleString()}
                </span>
              </div>
            )}
            {metrics.transformationSavings > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Transformations
                </span>
                <span className="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                  −{metrics.transformationSavings.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-2 border-t border-neutral-200/80 pt-1.5 font-semibold dark:border-neutral-800">
              <span className="text-neutral-700 dark:text-neutral-300">
                Total estimated
              </span>
              <span className="tabular-nums text-neutral-950 dark:text-white">
                {metrics.estimatedTokens.toLocaleString()}
              </span>
            </div>
          </div>
        </details>

        {metrics.topFiles.length > 0 && (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 [&::-webkit-details-marker]:hidden">
              Largest selected files
              <ChevronDown
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              />
            </summary>
            <ul className="mt-2 space-y-2">
              {metrics.topFiles.map((file) => {
                const relativeWidth =
                  metrics.topFiles[0].sizeKB > 0
                    ? (file.sizeKB / metrics.topFiles[0].sizeKB) * 100
                    : 0;
                return (
                  <li
                    key={file.path}
                    className="rounded-lg border border-neutral-200/70 bg-white px-2.5 py-2 dark:border-neutral-800 dark:bg-neutral-900/60"
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText
                        aria-hidden="true"
                        className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400"
                      />
                      <span
                        className="truncate font-mono text-[10.5px] text-neutral-600 dark:text-neutral-400"
                        title={file.path}
                      >
                        {file.path}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-neutral-300 dark:bg-neutral-600"
                        style={{ width: `${relativeWidth}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] tabular-nums text-neutral-500 dark:text-neutral-400">
                      {file.sizeKB.toFixed(1)} KB ·{' '}
                      {file.lines.toLocaleString()} lines
                    </p>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>
    );
  },
);

export default StatsPanel;
