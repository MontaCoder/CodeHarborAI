import { useMemo } from 'react';
import type { Context7Doc } from '../services/context7Service';
import { Context7Service } from '../services/context7Service';
import type { GitHubFileEntry, LocalFileEntry } from '../types/files';
import {
  estimateTextTokens,
  estimateTokensFromBytesLines,
} from '../utils/tokenEstimator';

interface SmartOptionsSnapshot {
  enableSmartOptimization: boolean;
  adaptiveCompression: boolean;
  prioritizeDocumentation: boolean;
  includeStructureMap: boolean;
  bodyElisionThreshold: number;
  adaptiveBodyThreshold: boolean;
  preserveTypeDeclarations: boolean;
  preserveModuleSurface: boolean;
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
  // Template tokens
  systemContextText: string;
  taskInstructionsText: string;
  // Basic transformations
  removeComments: boolean;
  minifyOutput: boolean;
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
  rawTokens: number;
  optimizedTokens: number;
  tokenSavings: number;
  savingsPercent: number;
  // New fields for enhanced stats
  templateTokens: number;
  context7Tokens: number;
  transformationSavings: number;
  fileTokens: number; // base file tokens after transformations
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
  systemContextText,
  taskInstructionsText,
  removeComments,
  minifyOutput,
}: UseStatsMetricsArgs): StatsMetricsResult => {
  return useMemo(() => {
    const activeFiles = fileHandles.length > 0 ? fileHandles : githubFiles;
    const selectedPaths = new Set(selectedFiles);
    const selectedCount = selectedPaths.size;
    const totalCount = activeFiles.length;

    const context7Included = includeContext7Docs && context7Docs.length > 0;
    const context7DocCount = context7Included ? context7Docs.length : 0;

    // Calculate Context7 docs tokens
    const docsText = context7Included
      ? context7Docs
          .map((doc) => Context7Service.formatForPrompt(doc))
          .join('\n')
      : '';
    const context7Tokens = context7Included ? estimateTextTokens(docsText) : 0;

    // Calculate Template tokens (system context + task instructions)
    const templateTokens =
      estimateTextTokens(systemContextText) +
      estimateTextTokens(taskInstructionsText);

    // Base file tokens (from size and lines)
    const baseFileTokens = estimateTokensFromBytesLines(totalSize, totalLines);

    // Calculate transformation savings (estimated)
    // Comments ~15% reduction, minify ~30% additional reduction
    let transformationRatio = 1.0;
    if (removeComments) {
      transformationRatio *= 0.85; // ~15% reduction
    }
    if (minifyOutput) {
      transformationRatio *= 0.70; // ~30% additional reduction
    }
    const fileTokensAfterTransformations = Math.floor(baseFileTokens * transformationRatio);
    const transformationSavings = baseFileTokens - fileTokensAfterTransformations;

    // Total raw tokens (files + templates + context7 docs, with transformations)
    const rawTokens =
      fileTokensAfterTransformations + templateTokens + context7Tokens;

    // Smart optimization compression (applied after transformations)
    const compressionRatio = smartOptions.adaptiveBodyThreshold ? 0.35 : 0.5;
    const optimizedTokens = Math.floor(rawTokens * compressionRatio);

    // Estimated tokens = what will actually be used
    const estimatedTokens = smartOptions.enableSmartOptimization
      ? optimizedTokens
      : rawTokens;

    const tokenSavings = rawTokens - optimizedTokens;
    const savingsPercent = rawTokens > 0
      ? Math.round((tokenSavings / rawTokens) * 100)
      : 0;

    const sizeKB =
      totalSize > 0 ? totalSize / 1024 : 0;

    const budgetTokens = Math.max(maxTotalTokens, 1);

    const rawPercent = estimatedTokens / budgetTokens;
    const percentOfBudget = Math.min(100, rawPercent * 100);

    let budgetStatus: 'safe' | 'caution' | 'critical' = 'safe';
    if (rawPercent >= CRITICAL_THRESHOLD) {
      budgetStatus = 'critical';
    } else if (rawPercent >= CAUTION_THRESHOLD) {
      budgetStatus = 'caution';
    }

    let budgetMessage =
      'Context size is comfortably within the configured token budget.';
    if (rawPercent >= 1) {
      budgetMessage =
        'Selection exceeds the configured token budget. Consider deselecting files or increasing the limit.';
    } else if (budgetStatus === 'critical') {
      budgetMessage =
        'Approaching the configured token budget. Review selections or enable more compression.';
    } else if (budgetStatus === 'caution') {
      budgetMessage =
        'Context size is approaching the caution range for the configured budget.';
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

    let smartSummary = '';
    const compression = smartOptions.adaptiveCompression
      ? 'Adaptive compression on.'
      : 'Adaptive compression off.';
    const structure = smartOptions.includeStructureMap
      ? 'Structure map will be generated.'
      : 'Structure map disabled.';
    const docs = smartOptions.prioritizeDocumentation
      ? 'Documentation prioritized.'
      : 'Documentation treated normally.';
    
    // Include transformation info in summary
    const transformInfo = [];
    if (removeComments) transformInfo.push('comments stripped');
    if (minifyOutput) transformInfo.push('minified');
    const transformText = transformInfo.length > 0
      ? `Transformations: ${transformInfo.join(', ')}.`
      : 'No basic transformations.';
    
    const savings = `Estimated savings: ${savingsPercent}% (${tokenSavings.toLocaleString()} tokens)`;
    smartSummary = `${compression} ${structure} ${docs}. ${transformText} ${savings}`;
    if (!smartOptions.enableSmartOptimization) {
      smartSummary += '. Enable optimizer to achieve these savings.';
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
      rawTokens,
      optimizedTokens,
      tokenSavings,
      savingsPercent,
      // New fields
      templateTokens,
      context7Tokens,
      transformationSavings,
      fileTokens: fileTokensAfterTransformations,
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
    smartOptions.adaptiveBodyThreshold,
    systemContextText,
    taskInstructionsText,
    removeComments,
    minifyOutput,
  ]);
};
