import { useCallback, useEffect, useState } from 'react';
import { Context7Service, type Context7Doc } from '../services/context7Service';
import {
  SmartContextService,
  type FileAnalysis,
  type SmartContextOptions,
} from '../services/smartContextService';
import type { GitHubFileEntry, LocalFileEntry } from './useFileSelection';

export interface PromptOptions {
  includePreamble: boolean;
  preambleText: string;
  includeGoal: boolean;
  goalText: string;
  removeComments: boolean;
  minifyOutput: boolean;
  includeContext7Docs: boolean;
  context7Docs: Context7Doc[];
  enableSmartOptimization: boolean;
  maxTotalTokens: number;
  prioritizeDocumentation: boolean;
  includeStructureMap: boolean;
  extractCodeSignatures: boolean;
  adaptiveCompression: boolean;
}

export interface PromptBuilderState {
  output: string;
  showOutput: boolean;
  isLoading: boolean;
  message: {
    text: string;
    type: 'error' | 'success';
  } | null;
}

interface UsePromptBuilderArgs {
  options: PromptOptions;
  selectedFiles: Set<string>;
  fileHandles: LocalFileEntry[];
  githubFiles: GitHubFileEntry[];
  folderHandle: FileSystemDirectoryHandle | null;
  githubRepoInfo: { owner: string; repo: string } | null;
  totalSize: number;
  totalLines: number;
}

interface UsePromptBuilderResult extends PromptBuilderState {
  handleCombine: () => Promise<void>;
  handleOptionChange: (key: keyof PromptOptions, value: PromptOptions[keyof PromptOptions]) => void;
  options: PromptOptions;
}

export const usePromptBuilder = ({
  options: initialOptions,
  selectedFiles,
  fileHandles,
  githubFiles,
  folderHandle,
  githubRepoInfo,
  totalSize,
  totalLines,
}: UsePromptBuilderArgs): UsePromptBuilderResult => {
  const [options, setOptions] = useState<PromptOptions>(initialOptions);
  const [state, setState] = useState<PromptBuilderState>({
    output: '',
    showOutput: false,
    isLoading: false,
    message: null,
  });

  const handleOptionChange = useCallback(
    (key: keyof PromptOptions, value: PromptOptions[keyof PromptOptions]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleCombine = useCallback(async () => {
    if (selectedFiles.size === 0) {
      setState((prev) => ({
        ...prev,
        message: { text: 'Please select at least one file', type: 'error' },
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      let outputText = '';

      if (options.includePreamble && options.preambleText.trim()) {
        outputText += options.preambleText.trim() + '\n\n';
      }

      if (options.includeContext7Docs && options.context7Docs.length > 0) {
        outputText += '# Referenced Documentation\n\n';
        for (const doc of options.context7Docs) {
          outputText += Context7Service.formatForPrompt(doc);
        }
        outputText += '\n';
      }

      if (options.includeGoal && options.goalText.trim()) {
        outputText += '# Task Goal\n' + options.goalText.trim() + '\n\n';
      }

      const projectName = folderHandle
        ? folderHandle.name
        : githubRepoInfo
          ? `${githubRepoInfo.owner}/${githubRepoInfo.repo}`
          : 'Project';

      outputText += '# Project Overview\n';
      outputText += `**Project:** ${projectName}\n`;
      outputText += `**Total Size:** ${(totalSize / 1024).toFixed(2)} KB\n`;
      outputText += `**Total Lines:** ${totalLines.toLocaleString()}\n`;
      outputText += `**Files Selected:** ${selectedFiles.size}\n`;

      if (options.enableSmartOptimization) {
        outputText += `**Smart Optimization:** ✅ Enabled\n`;
      }
      outputText += '\n';

      const fileAnalyses: FileAnalysis[] = [];
      const fileContents = new Map<string, string>();

      for (const filePath of selectedFiles) {
        let content = '';
        let metadata = { size: 0, lines: 0 };

        if (folderHandle) {
          const match = fileHandles.find((f) => f.path === filePath);
          if (match) {
            const file = await match.handle.getFile();
            content = await file.text();
            metadata = { size: match.size, lines: match.lines };
          }
        } else {
          const match = githubFiles.find((f) => f.path === filePath);
          if (match && match.file.download_url) {
            content = await fetch(match.file.download_url).then((r) => r.text());
            metadata = { size: match.size, lines: match.lines };
          }
        }

        if (!content) {
          continue;
        }

        if (options.removeComments) {
          content = content.replace(/\/\/.*$/gm, '');
          content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        }

        if (options.minifyOutput) {
          content = content.replace(/\s+/g, ' ').trim();
        }

        fileContents.set(filePath, content);

        if (options.enableSmartOptimization) {
          const analysis = SmartContextService.analyzeFile(filePath, content, metadata);
          fileAnalyses.push(analysis);
        }
      }

      if (
        options.enableSmartOptimization &&
        options.includeStructureMap &&
        fileAnalyses.length > 0
      ) {
        outputText += SmartContextService.generateStructureMap(fileAnalyses);
        outputText += '\n';
      }

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

        filesToInclude = optimizedAnalyses.map((analysis) => analysis.path);
      }

      outputText += '# File Contents\n\n';

      for (const filePath of filesToInclude) {
        const content = fileContents.get(filePath);
        if (!content) continue;

        if (options.enableSmartOptimization) {
          const analysis = fileAnalyses.find((analysis) => analysis.path === filePath);
          if (analysis) {
            const smartOptions: SmartContextOptions = {
              maxTotalTokens: options.maxTotalTokens,
              prioritizeDocumentation: options.prioritizeDocumentation,
              includeStructureMap: options.includeStructureMap,
              extractCodeSignatures: options.extractCodeSignatures,
              adaptiveCompression: options.adaptiveCompression,
            };
            const strategy = SmartContextService.determineStrategy(analysis, smartOptions);
            outputText += SmartContextService.formatContent(
              filePath,
              content,
              analysis,
              strategy,
            );
          } else {
            outputText += `\n═════════════════════════════════════════\n`;
            outputText += `${filePath}\n`;
            outputText += `═════════════════════════════════════════\n\n`;
            outputText += content + '\n';
          }
        } else {
          outputText += `\n═════════════════════════════════════════\n`;
          outputText += `${filePath}\n`;
          outputText += `═════════════════════════════════════════\n\n`;
          outputText += content + '\n';
        }
      }

      setState({
        output: outputText,
        showOutput: true,
        isLoading: false,
        message: {
          text: options.enableSmartOptimization
            ? '🎯 Smart context generated successfully!'
            : 'Context generated successfully!',
          type: 'success',
        },
      });
    } catch (error) {
      setState({
        output: '',
        showOutput: false,
        isLoading: false,
        message: {
          text: `Error generating context: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        },
      });
    }
  }, [
    selectedFiles,
    options,
    folderHandle,
    fileHandles,
    githubFiles,
    githubRepoInfo,
    totalSize,
    totalLines,
  ]);

  useEffect(() => {
    if (!state.message) return;

    const timeout = setTimeout(() => {
      setState((prev) => ({ ...prev, message: null }));
    }, 5000);

    return () => clearTimeout(timeout);
  }, [state.message]);

  return {
    ...state,
    handleCombine,
    handleOptionChange,
    options,
  };
};
