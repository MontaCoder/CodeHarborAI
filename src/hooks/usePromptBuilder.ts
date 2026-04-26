import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Context7Doc, Context7Service } from '../services/context7Service';
import { readLocalFile } from '../services/fileContentService';
import type { GitHubRepoInfo } from '../services/githubService';
import { GitHubService } from '../services/githubService';
import {
  type FileAnalysis,
  type SmartContextOptions,
  SmartContextService,
} from '../services/smartContextService';
import type { GitHubFileEntry, LocalFileEntry } from '../types/files';
import { clearFileCategorizationCache } from '../utils/fileCategorization';

export interface PromptOptions {
  includeSystemContext: boolean;
  systemContextText: string;
  includeTaskInstructions: boolean;
  taskInstructionsText: string;
  removeComments: boolean;
  minifyOutput: boolean;
  includeContext7Docs: boolean;
  context7Docs: Context7Doc[];
  enableSmartOptimization: boolean;
  maxTotalTokens: number;
  prioritizeDocumentation: boolean;
  includeStructureMap: boolean;
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
  githubRepoInfo: GitHubRepoInfo | null;
  totalSize: number;
  totalLines: number;
}

interface UsePromptBuilderResult extends PromptBuilderState {
  handleCombine: () => Promise<void>;
  handleOptionChange: (
    key: keyof PromptOptions,
    value: PromptOptions[keyof PromptOptions],
  ) => void;
  options: PromptOptions;
}

const SEPARATOR = '-'.repeat(60);

const buildSmartOptions = (options: PromptOptions): SmartContextOptions => ({
  maxTotalTokens: options.maxTotalTokens,
  prioritizeDocumentation: options.prioritizeDocumentation,
  includeStructureMap: options.includeStructureMap,
  adaptiveCompression: options.adaptiveCompression,
});

const stripComments = (content: string): string =>
  content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

const applyMinify = (content: string): string =>
  content.replace(/\s+/g, ' ').trim();

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

  const smartOptions = useMemo(() => buildSmartOptions(options), [options]);
  const fileHandleMap = useMemo(
    () => new Map(fileHandles.map((file) => [file.path, file])),
    [fileHandles],
  );
  const githubFileMap = useMemo(
    () => new Map(githubFiles.map((file) => [file.path, file])),
    [githubFiles],
  );

  // Clear analysis cache when files change to avoid stale data
  useEffect(() => {
    SmartContextService.clearAnalysisCache();
    GitHubService.clearRequestCache();
    clearFileCategorizationCache();
  }, [fileHandles, githubFiles]);

  const handleOptionChange = useCallback(
    (key: keyof PromptOptions, value: PromptOptions[keyof PromptOptions]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const loadContent = useCallback(
    async (filePath: string): Promise<string> => {
      if (folderHandle) {
        const entry = fileHandleMap.get(filePath);
        return entry ? readLocalFile(entry) : '';
      }

      const entry = githubFileMap.get(filePath);
      if (!entry?.file.download_url) return '';
      return GitHubService.downloadFileContent(entry.file.download_url);
    },
    [fileHandleMap, folderHandle, githubFileMap],
  );

  const buildOverview = useCallback(
    (projectName: string): string => {
      const overviewLines = [
        '# Project Overview',
        `**Project:** ${projectName}`,
        `**Total Size:** ${(totalSize / 1024).toFixed(2)} KB`,
        `**Total Lines:** ${totalLines.toLocaleString()}`,
        `**Files Selected:** ${selectedFiles.size}`,
        `**Smart Optimization:** ${options.enableSmartOptimization ? 'Enabled' : 'Disabled'}`,
      ];

      return overviewLines.join('\n') + '\n';
    },
    [
      options.enableSmartOptimization,
      selectedFiles.size,
      totalLines,
      totalSize,
    ],
  );

  const handleCombine = useCallback(async () => {
    if (selectedFiles.size === 0) {
      setState((prev) => ({
        ...prev,
        message: { text: 'Please select at least one file', type: 'error' },
      }));
      return;
    }

    const startTime = performance.now();
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const sections: string[] = [];
      const fileAnalyses: FileAnalysis[] = [];
      const fileContents = new Map<string, string>();

      if (options.includeSystemContext && options.systemContextText.trim()) {
        sections.push(options.systemContextText.trim());
      }

      if (options.includeContext7Docs && options.context7Docs.length > 0) {
        const docs = options.context7Docs
          .map((doc) => Context7Service.formatForPrompt(doc))
          .join('\n');
        sections.push(`# Referenced Documentation\n\n${docs}`);
      }

      if (options.includeTaskInstructions && options.taskInstructionsText.trim()) {
        sections.push(`# Task Instructions\n${options.taskInstructionsText.trim()}`);
      }

      const projectName = folderHandle
        ? folderHandle.name
        : githubRepoInfo
          ? `${githubRepoInfo.owner}/${githubRepoInfo.repo}`
          : 'Project';

      sections.push(buildOverview(projectName));

      // Batch file reads with concurrency control
      // Increased to 10 for better performance with large repos
      const CONCURRENCY = Math.min(10, Math.max(5, (navigator.hardwareConcurrency || 4) * 2));
      const filePaths = Array.from(selectedFiles);
      const results = new Map<string, string>();

      const loadStart = performance.now();
      for (let i = 0; i < filePaths.length; i += CONCURRENCY) {
        const batch = filePaths.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(
          batch.map(async (filePath) => {
            const rawContent = await loadContent(filePath);
            return { filePath, content: rawContent };
          }),
        );
        for (const { filePath, content } of batchResults) {
          if (content) results.set(filePath, content);
        }
      }
      const loadTime = performance.now() - loadStart;
      
      console.log(`[Performance] Loaded ${results.size} files in ${loadTime.toFixed(0)}ms (${CONCURRENCY} concurrent)`);

       // Transform content (strip comments, minify)
      for (const [filePath, rawContent] of results) {
        let content = options.removeComments
          ? stripComments(rawContent)
          : rawContent;
        content = options.minifyOutput ? applyMinify(content) : content;
        fileContents.set(filePath, content);

        if (options.enableSmartOptimization) {
          const sourceMeta = folderHandle
            ? fileHandleMap.get(filePath)
            : githubFileMap.get(filePath);
          const metadata = {
            size: sourceMeta?.size ?? content.length,
            lines: sourceMeta?.lines ?? content.split('\n').length,
          };
          const analysis = SmartContextService.analyzeFile(
            filePath,
            content,
            metadata,
          );
          fileAnalyses.push(analysis);
        }
      }

      const analysisTime = performance.now() - loadStart - loadTime;
      if (options.enableSmartOptimization) {
        console.log(`[Performance] Analyzed ${fileAnalyses.length} files in ${analysisTime.toFixed(0)}ms`);
      }

      if (
        options.enableSmartOptimization &&
        options.includeStructureMap &&
        fileAnalyses.length > 0
      ) {
        sections.push(SmartContextService.generateStructureMap(fileAnalyses));
      }

      let filesToInclude = Array.from(selectedFiles);
      let analysesToRender = fileAnalyses;
      if (options.enableSmartOptimization && options.adaptiveCompression) {
        const optimizeStart = performance.now();
        analysesToRender = SmartContextService.optimizeContextBudget(
          fileAnalyses,
          options.maxTotalTokens,
          smartOptions,
        );
        const optimizeTime = performance.now() - optimizeStart;

        if (analysesToRender.length < fileAnalyses.length) {
          sections.push(
            `**Smart Optimization:** Included ${analysesToRender.length} of ${fileAnalyses.length} files based on priority and token budget.`,
          );
          console.log(`[Performance] Optimized context: ${analysesToRender.length}/${fileAnalyses.length} files in ${optimizeTime.toFixed(0)}ms`);
        }

        filesToInclude = analysesToRender.map((analysis) => analysis.path);
      }

      const fileOutput: string[] = ['# File Contents'];

      for (const filePath of filesToInclude) {
        const content = fileContents.get(filePath);
        if (!content) continue;

        if (options.enableSmartOptimization) {
          const analysis = analysesToRender.find(
            (item) => item.path === filePath,
          );
          if (analysis) {
            const strategy = SmartContextService.determineStrategy(
              analysis,
              smartOptions,
            );
            fileOutput.push(
              SmartContextService.formatContent(
                filePath,
                content,
                analysis,
                strategy,
              ),
            );
            continue;
          }
        }

        fileOutput.push(
          [SEPARATOR, filePath, SEPARATOR, '', content].join('\n'),
        );
      }

      sections.push(fileOutput.join('\n\n'));

      const totalTime = performance.now() - startTime;
      console.log(`[Performance] Total context generation: ${totalTime.toFixed(0)}ms for ${selectedFiles.size} files`);

      setState({
        output: sections.join('\n\n'),
        showOutput: true,
        isLoading: false,
        message: {
          text: options.enableSmartOptimization
            ? 'Smart context generated successfully.'
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
    githubRepoInfo,
    loadContent,
    fileHandleMap,
    githubFileMap,
    smartOptions,
    buildOverview,
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
