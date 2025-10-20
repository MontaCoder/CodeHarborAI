import { useMemo } from 'react';
import type { GitHubFileEntry, LocalFileEntry } from './useFileSelection';

interface SmartOptionsSnapshot {
  enableSmartOptimization: boolean;
  adaptiveCompression: boolean;
  prioritizeDocumentation: boolean;
  includeStructureMap: boolean;
}

interface UseStatsMetricsArgs {
  totalSize: number;
  totalLines: number;
  maxTotalTokens: number;
  selectedFiles: Set<string>;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  smartOptions: SmartOptionsSnapshot;
}

interface SelectedFileSummary {
  path: string;
  sizeKB: number;
  lines: number;
}

interface StatsMetricsResult {
  sizeKB: number;
  estimatedTokens: number;
  budgetTokens: number;
  percentOfBudget: number;
  budgetStatus: 'safe' | 'caution' | 'critical';
  budgetMessage: string;
  selectedCount: number;
  totalCount: number;
  topFiles: SelectedFileSummary[];
  smartSummary: string;
}

const TOKENS_PER_BYTE = 0.25;
const TOKENS_PER_LINE = 2.2;
const CAUTION_THRESHOLD = 0.75;
const CRITICAL_THRESHOLD = 0.95;

export const useStatsMetrics = ({
  totalSize,
  totalLines,
  maxTotalTokens,
  selectedFiles,
  fileHandles,
  githubFiles,
  smartOptions,
}: UseStatsMetricsArgs): StatsMetricsResult => {
  return useMemo(() => {
    const activeFiles = fileHandles.length > 0 ? fileHandles : githubFiles;
    const selectedPaths = new Set(selectedFiles);
    const selectedCount = selectedPaths.size;
    const totalCount = activeFiles.length;

    const sizeKB = totalSize > 0 ? totalSize / 1024 : 0;
    const tokenEstimateFromBytes = Math.ceil(totalSize * TOKENS_PER_BYTE);
    const tokenEstimateFromLines = Math.ceil(totalLines * TOKENS_PER_LINE);
    const estimatedTokens = Math.max(tokenEstimateFromBytes, tokenEstimateFromLines, 0);
    const budgetTokens = Math.max(maxTotalTokens, 1);

    const rawPercent = estimatedTokens / budgetTokens;
    const percentOfBudget = Math.min(100, rawPercent * 100);

    let budgetStatus: 'safe' | 'caution' | 'critical' = 'safe';
    if (rawPercent >= CRITICAL_THRESHOLD) {
      budgetStatus = 'critical';
    } else if (rawPercent >= CAUTION_THRESHOLD) {
      budgetStatus = 'caution';
    }

    let budgetMessage = 'Context size is comfortably within the configured token budget.';
    if (rawPercent >= 1) {
      budgetMessage = 'Selection exceeds the configured token budget. Consider deselecting files or increasing the limit.';
    } else if (budgetStatus === 'critical') {
      budgetMessage = 'Approaching the configured token budget. Review selections or enable more compression.';
    } else if (budgetStatus === 'caution') {
      budgetMessage = 'Context size is approaching the caution range for the configured budget.';
    }

    const selectedFileDetails = activeFiles
      .filter((file) => selectedPaths.has(file.path))
      .map((file) => ({
        path: file.path,
        sizeKB: file.size / 1024,
        lines: file.lines,
      }))
      .sort((a, b) => b.sizeKB - a.sizeKB)
      .slice(0, 3);

    let smartSummary = 'Smart optimization is disabled. The entire selection will be included as-is.';
    if (smartOptions.enableSmartOptimization) {
      const compression = smartOptions.adaptiveCompression ? 'Adaptive compression on.' : 'Adaptive compression off.';
      const structure = smartOptions.includeStructureMap ? 'Structure map will be generated.' : 'Structure map disabled.';
      const docs = smartOptions.prioritizeDocumentation ? 'Documentation prioritized.' : 'Documentation treated normally.';
      smartSummary = `${compression} ${structure} ${docs}`;
    }

    return {
      sizeKB,
      estimatedTokens,
      budgetTokens,
      percentOfBudget,
      budgetStatus,
      budgetMessage,
      selectedCount,
      totalCount,
      topFiles: selectedFileDetails,
      smartSummary,
    };
  }, [
    totalSize,
    totalLines,
    maxTotalTokens,
    selectedFiles,
    fileHandles,
    githubFiles,
    smartOptions.enableSmartOptimization,
    smartOptions.adaptiveCompression,
    smartOptions.prioritizeDocumentation,
    smartOptions.includeStructureMap,
  ]);
};
