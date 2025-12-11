/**
 * Prompt Engineering Service
 * Advanced prompt generation with performance optimization and intelligent structuring
 */

import type {
  FileAnalysis,
  SmartContextOptions,
} from './smartContextService';
import { SmartContextService } from './smartContextService';
import type { Context7Doc } from './context7Service';
import { estimateTextTokens } from '../utils/tokenEstimator';

export interface PromptSection {
  id: string;
  title: string;
  content: string;
  priority: number;
  tokens: number;
}

export interface PromptGenerationOptions extends SmartContextOptions {
  // Prompt engineering features
  includeChainOfThought?: boolean;
  includeFewShotExamples?: boolean;
  includeConstraints?: boolean;
  outputFormat?: 'markdown' | 'xml' | 'json' | 'plain';
  
  // Performance options
  enableParallelProcessing?: boolean;
  enableStreaming?: boolean;
  cacheable?: boolean;
  
  // Override from SmartContextOptions for clarity
  enableSmartOptimization?: boolean;
}

export interface GenerationMetrics {
  totalFiles: number;
  filesProcessed: number;
  filesIncluded: number;
  totalTokens: number;
  processingTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface PromptResult {
  content: string;
  sections: PromptSection[];
  metrics: GenerationMetrics;
  warnings: string[];
}

/**
 * Advanced Prompt Engineering Service
 * Orchestrates intelligent prompt generation with performance optimization
 */
export class PromptEngineService {
  private static analysisCache = new Map<string, FileAnalysis>();
  private static contentCache = new Map<string, string>();

  /**
   * Generate optimized prompt from file selection
   */
  static async generatePrompt(
    files: Array<{ path: string; content: string; size: number; lines: number }>,
    options: PromptGenerationOptions,
    context: {
      projectName: string;
      preamble?: string;
      goal?: string;
      context7Docs?: Context7Doc[];
    },
  ): Promise<PromptResult> {
    const startTime = performance.now();
    const metrics: GenerationMetrics = {
      totalFiles: files.length,
      filesProcessed: 0,
      filesIncluded: 0,
      totalTokens: 0,
      processingTimeMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
    const warnings: string[] = [];
    const sections: PromptSection[] = [];

    try {
      // Phase 1: Parallel file analysis
      const analyses = await this.analyzeFilesParallel(
        files,
        options,
        metrics,
      );
      metrics.filesProcessed = analyses.length;

      // Phase 2: Optimize context budget
      const selectedAnalyses = this.optimizeSelection(
        analyses,
        options,
        warnings,
      );
      metrics.filesIncluded = selectedAnalyses.length;

      // Phase 3: Build prompt sections
      sections.push(
        ...this.buildPromptSections(
          selectedAnalyses,
          files,
          options,
          context,
        ),
      );

      // Phase 4: Assemble final prompt
      const content = this.assemblePrompt(sections, options);
      
      metrics.processingTimeMs = performance.now() - startTime;
      metrics.totalTokens = this.estimateTotalTokens(content);

      return {
        content,
        sections,
        metrics,
        warnings,
      };
    } catch (error) {
      throw new Error(
        `Prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Analyze files in parallel for maximum performance
   */
  private static async analyzeFilesParallel(
    files: Array<{ path: string; content: string; size: number; lines: number }>,
    options: PromptGenerationOptions,
    metrics: GenerationMetrics,
  ): Promise<FileAnalysis[]> {
    const analyses: FileAnalysis[] = [];

    if (options.enableParallelProcessing !== false) {
      // Parallel processing with batching
      const batchSize = 10;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchAnalyses = await Promise.all(
          batch.map((file) => this.analyzeFileWithCache(file, metrics)),
        );
        analyses.push(...batchAnalyses);
      }
    } else {
      // Sequential processing
      for (const file of files) {
        const analysis = await this.analyzeFileWithCache(file, metrics);
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  /**
   * Analyze file with caching support
   */
  private static async analyzeFileWithCache(
    file: { path: string; content: string; size: number; lines: number },
    metrics: GenerationMetrics,
  ): Promise<FileAnalysis> {
    const cacheKey = `${file.path}:${file.size}:${file.lines}`;

    if (this.analysisCache.has(cacheKey)) {
      metrics.cacheHits++;
      return this.analysisCache.get(cacheKey)!;
    }

    metrics.cacheMisses++;
    const analysis = SmartContextService.analyzeFile(
      file.path,
      file.content,
      { size: file.size, lines: file.lines },
    );

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  /**
   * Optimize file selection based on budget and priorities
   */
  private static optimizeSelection(
    analyses: FileAnalysis[],
    options: PromptGenerationOptions,
    warnings: string[],
  ): FileAnalysis[] {
    const maxTokens = options.maxTotalTokens || 100000;

    const selected = SmartContextService.optimizeContextBudget(
      analyses,
      maxTokens,
      options,
    );

    if (selected.length < analyses.length) {
      const excluded = analyses.length - selected.length;
      warnings.push(
        `${excluded} file(s) excluded due to token budget constraints`,
      );
    }

    return selected;
  }

  /**
   * Build structured prompt sections
   */
  private static buildPromptSections(
    analyses: FileAnalysis[],
    files: Array<{ path: string; content: string; size: number; lines: number }>,
    options: PromptGenerationOptions,
    context: {
      projectName: string;
      preamble?: string;
      goal?: string;
      context7Docs?: Context7Doc[];
    },
  ): PromptSection[] {
    const sections: PromptSection[] = [];
    let sectionPriority = 1000;

    // Section 1: System instructions (if chain-of-thought enabled)
    if (options.includeChainOfThought) {
      sections.push({
        id: 'system-instructions',
        title: 'System Instructions',
        content: this.buildSystemInstructions(),
        priority: sectionPriority--,
        tokens: 150,
      });
    }

    // Section 2: Preamble
    if (context.preamble) {
      sections.push({
        id: 'preamble',
        title: 'Context',
        content: context.preamble,
        priority: sectionPriority--,
        tokens: this.estimateTotalTokens(context.preamble),
      });
    }

    // Section 3: Context7 Documentation
    if (context.context7Docs && context.context7Docs.length > 0) {
      const docsContent = context.context7Docs
        .map((doc) => `## ${doc.title}\n${doc.content}`)
        .join('\n\n');
      sections.push({
        id: 'reference-docs',
        title: 'Referenced Documentation',
        content: docsContent,
        priority: sectionPriority--,
        tokens: this.estimateTotalTokens(docsContent),
      });
    }

    // Section 4: Project Overview
    const overviewContent = this.buildProjectOverview(
      context.projectName,
      analyses,
      options,
    );
    sections.push({
      id: 'project-overview',
      title: 'Project Overview',
      content: overviewContent,
      priority: sectionPriority--,
      tokens: this.estimateTotalTokens(overviewContent),
    });

    // Section 5: Structure Map
    if (options.includeStructureMap) {
      const structureContent = SmartContextService.generateStructureMap(analyses);
      sections.push({
        id: 'structure-map',
        title: 'Project Structure',
        content: structureContent,
        priority: sectionPriority--,
        tokens: this.estimateTotalTokens(structureContent),
      });
    }

    // Section 6: Task Goal
    if (context.goal) {
      sections.push({
        id: 'task-goal',
        title: 'Task Objective',
        content: context.goal,
        priority: sectionPriority--,
        tokens: this.estimateTotalTokens(context.goal),
      });
    }

    // Section 7: Constraints (if enabled)
    if (options.includeConstraints) {
      sections.push({
        id: 'constraints',
        title: 'Constraints',
        content: this.buildConstraints(options),
        priority: sectionPriority--,
        tokens: 100,
      });
    }

    // Section 8: File Contents
    const filesContent = this.buildFileContents(analyses, files, options);
    sections.push({
      id: 'file-contents',
      title: 'Code Files',
      content: filesContent,
      priority: sectionPriority--,
      tokens: this.estimateTotalTokens(filesContent),
    });

    return sections;
  }

  /**
   * Build system instructions for chain-of-thought
   */
  private static buildSystemInstructions(): string {
    return `You are an expert software engineer and code analyst. When analyzing the provided codebase:

1. Think step-by-step through your analysis
2. Consider the broader context and architecture
3. Identify patterns and relationships between files
4. Provide specific, actionable recommendations
5. Explain your reasoning clearly

Please analyze thoroughly and systematically.`;
  }

  /**
   * Build project overview section
   */
  private static buildProjectOverview(
    projectName: string,
    analyses: FileAnalysis[],
    options: PromptGenerationOptions,
  ): string {
    const totalSize = analyses.reduce((sum, a) => sum + a.metadata.size, 0);
    const totalLines = analyses.reduce((sum, a) => sum + a.metadata.lines, 0);

    let overview = `**Project:** ${projectName}\n`;
    overview += `**Files:** ${analyses.length}\n`;
    overview += `**Total Size:** ${(totalSize / 1024).toFixed(2)} KB\n`;
    overview += `**Total Lines:** ${totalLines.toLocaleString()}\n`;

    if (options.enableSmartOptimization) {
      overview += `**Optimization:** ✅ Smart Context Optimizer Enabled\n`;
    }

    // File type distribution
    const typeCount = new Map<string, number>();
    analyses.forEach((a) => {
      typeCount.set(a.type, (typeCount.get(a.type) || 0) + 1);
    });

    overview += `\n**File Distribution:**\n`;
    for (const [type, count] of Array.from(typeCount.entries()).sort(
      (a, b) => b[1] - a[1],
    )) {
      overview += `- ${type}: ${count}\n`;
    }

    return overview;
  }

  /**
   * Build constraints section
   */
  private static buildConstraints(options: PromptGenerationOptions): string {
    let constraints = 'Please ensure your response:\n';
    constraints += '- Is specific and actionable\n';
    constraints += '- References specific files and line numbers where applicable\n';
    constraints += '- Provides code examples when suggesting changes\n';
    constraints += '- Prioritizes high-impact improvements\n';

    if (options.maxTotalTokens) {
      constraints += `- Stays within reasonable length for ${options.maxTotalTokens} token context\n`;
    }

    return constraints;
  }

  /**
   * Build file contents section
   */
  private static buildFileContents(
    analyses: FileAnalysis[],
    files: Array<{ path: string; content: string; size: number; lines: number }>,
    options: PromptGenerationOptions,
  ): string {
    const fileMap = new Map(files.map((f) => [f.path, f.content]));
    let contents = '';

    for (const analysis of analyses) {
      const content = fileMap.get(analysis.path);
      if (!content) continue;

      const strategy = SmartContextService.determineStrategy(
        analysis,
        options,
      );

      contents += SmartContextService.formatContent(
        analysis.path,
        content,
        analysis,
        strategy,
      );
      contents += '\n';
    }

    return contents;
  }

  /**
   * Assemble final prompt from sections
   */
  private static assemblePrompt(
    sections: PromptSection[],
    options: PromptGenerationOptions,
  ): string {
    const format = options.outputFormat || 'markdown';
    const sortedSections = sections.sort((a, b) => b.priority - a.priority);

    let prompt = '';

    switch (format) {
      case 'xml':
        prompt = this.assembleXMLPrompt(sortedSections);
        break;
      case 'json':
        prompt = this.assembleJSONPrompt(sortedSections);
        break;
      case 'plain':
        prompt = sortedSections.map((s) => s.content).join('\n\n');
        break;
      case 'markdown':
      default:
        prompt = sortedSections
          .map((s) => {
            if (s.id === 'system-instructions') {
              return s.content;
            }
            return `# ${s.title}\n\n${s.content}`;
          })
          .join('\n\n');
    }

    return prompt;
  }

  /**
   * Assemble XML-formatted prompt (useful for Claude)
   */
  private static assembleXMLPrompt(sections: PromptSection[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n';

    for (const section of sections) {
      const tag = section.id.replace(/-/g, '_');
      xml += `  <${tag}>\n`;
      xml += section.content
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n');
      xml += `\n  </${tag}>\n`;
    }

    xml += '</prompt>';
    return xml;
  }

  /**
   * Assemble JSON-formatted prompt (useful for API integrations)
   */
  private static assembleJSONPrompt(sections: PromptSection[]): string {
    const promptData = {
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        tokens: s.tokens,
      })),
    };
    return JSON.stringify(promptData, null, 2);
  }

  /**
   * Estimate tokens in text
   */
  private static estimateTotalTokens(text: string): number {
    return estimateTextTokens(text);
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.analysisCache.clear();
    this.contentCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    analysisEntries: number;
    contentEntries: number;
  } {
    return {
      analysisEntries: this.analysisCache.size,
      contentEntries: this.contentCache.size,
    };
  }
}
