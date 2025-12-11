import { useMemo } from 'react';
import type { GitHubFileEntry, LocalFileEntry } from '../types/files';
import type { Context7Doc } from '../services/context7Service';
import { Context7Service } from '../services/context7Service';
import { estimateTextTokens, estimateTokensFromBytesLines } from '../utils/tokenEstimator';

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
  includeContext7Docs: boolean;
  context7Docs: Context7Doc[];
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
  context7DocCount: number;
  context7Included: boolean;
}

const CAUTION_THRESHOLD = 0.75;
const CRITICAL_THRESHOLD = 0.95;

export const useStatsMetrics = ({
  totalSize,
  totalLines,
  maxTotalTokens,
  selectedFiles,
  fileHandles,
  githubFiles,
  includeContext7Docs,
  context7Docs,
  smartOptions,
}: UseStatsMetricsArgs): StatsMetricsResult => {
  return useMemo(() => {
    const activeFiles = fileHandles.length > 0 ? fileHandles : githubFiles;
    const selectedPaths = new Set(selectedFiles);
    const selectedCount = selectedPaths.size;
    const totalCount = activeFiles.length;

    const context7Included = includeContext7Docs && context7Docs.length > 0;
    const context7DocCount = context7Included ? context7Docs.length : 0;

    const docsText = context7Included
      ? context7Docs.map((doc) => Context7Service.formatForPrompt(doc)).join('\n')
      : '';
    const docsBytes = docsText.length;
    const docsTokens = context7Included ? estimateTextTokens(docsText) : 0;

    const sizeKB = totalSize > 0 || docsBytes > 0 ? (totalSize + docsBytes) / 1024 : 0;
    const estimatedTokens = estimateTokensFromBytesLines(totalSize, totalLines) + docsTokens;
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
      context7DocCount,
      context7Included,
    };
  }, [
    totalSize,
    totalLines,
    maxTotalTokens,
    selectedFiles,
    fileHandles,
    githubFiles,
    includeContext7Docs,
    context7Docs,
    smartOptions.enableSmartOptimization,
    smartOptions.adaptiveCompression,
    smartOptions.prioritizeDocumentation,
    smartOptions.includeStructureMap,
  ]);
};
