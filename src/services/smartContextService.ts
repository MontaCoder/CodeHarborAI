/**
 * Smart Context Optimizer Service
 * Intelligently analyzes and optimizes code context for AI prompts
 * Replaces the simple 3-level context enhancement with adaptive, file-aware optimization
 */

// Simple LRU cache implementation for file analysis results
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map<K, V>();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache for file analysis results
const analysisCache = new LRUCache<string, FileAnalysis>(1000);

import {
  calculatePriority as calculateFilePriority,
  calculateRelevanceScore as calculateFileRelevanceScore,
  detectFileRole as detectFileRoleFromPath,
  detectFileType as detectFileTypeFromPath,
  type FileRole,
  type FileType,
} from '../utils/fileCategorization';
import { estimateTextTokens } from '../utils/tokenEstimator';
import {
  assembleSkeleton,
  extractClassSkeletons,
  extractFunctionSkeletons,
  extractImports as extractCodeImports,
  extractTopLevelConstants,
  extractTypeDeclarations,
  type FileSkeleton,
  type SkeletonOptions,
} from '../utils/codeSkeleton';

export type { FileRole, FileType } from '../utils/fileCategorization';

export interface FileAnalysis {
  path: string;
  type: FileType;
  role: FileRole;
  relevanceScore: number;
  estimatedTokens: number;
  priority: number;
  metadata: FileMetadata;
}

export interface FileMetadata {
  size: number;
  lines: number;
  exports?: string[];
  imports?: string[];
  mainFunctions?: string[];
  complexity?: number;
}

export interface OptimizationStrategy {
  includeFullContent: boolean;
  compressToSkeleton: boolean;
  extractKeyElements: boolean;
  maxTokens?: number;
  formatTemplate: 'full' | 'compact' | 'skeleton' | 'structured';
  applyTransformations?: TransformationOptions; // Basic transformations to apply
}

export interface SmartContextOptions {
  maxTotalTokens?: number;
  prioritizeDocumentation: boolean;
  includeStructureMap: boolean;
  adaptiveCompression: boolean;
  bodyElisionThreshold?: number;
  adaptiveBodyThreshold?: boolean;
  preserveTypeDeclarations?: boolean;
  preserveModuleSurface?: boolean;
}

export interface TransformationOptions {
  removeComments: boolean;
  minifyOutput: boolean;
}

export class SmartContextService {
  private static readonly HEADER_DIVIDER = '-'.repeat(60);

  /**
   * Strip comments from code content
   * Removes both single-line and multi-line comments
   * String-literal aware to avoid stripping "http://..." etc.
   */
  static stripComments(content: string): string {
    let result = '';
    let inString: string | null = null;
    let inComment = false;
    let commentType: '/' | '*' | null = null;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (!inComment && !inString) {
        // Start comment or string
        if (char === '/' && next === '/') { inComment = true; commentType = '/'; i++; continue; }
        if (char === '/' && next === '*') { inComment = true; commentType = '*'; i++; continue; }
        if (char === '"' || char === "'" || char === '`') { inString = char; result += char; continue; }
      } else if (inString) {
        // Inside string - check for end
        if (char === inString && content[i - 1] !== '\\') inString = null;
        result += char; continue;
      } else if (inComment) {
        // Inside comment - check for end
        if (commentType === '/' && char === '\n') { inComment = false; result += char; }
        if (commentType === '*' && char === '*' && next === '/') { inComment = false; i++; }
        continue;
      }
      result += char;
    }
    return result;
  }

  /**
   * Minify code content by removing unnecessary whitespace
   * Preserves string literals and basic code structure
   */
  static applyMinify(content: string): string {
    return content
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{};:,])\s*/g, '$1') // Remove space around punctuation
      .replace(/;\s*/g, ';') // Clean up semicolons
      .replace(/\s*{\s*/g, '{') // Clean up opening braces
      .replace(/\s*}\s*/g, '}') // Clean up closing braces
      .trim();
  }

  /**
   * Apply basic transformations (strip comments, minify) to content
   * Transformations are applied in order: comments first, then minify
   */
  static applyTransformations(
    content: string,
    options: TransformationOptions,
  ): string {
    let transformed = content;

    if (options.removeComments) {
      transformed = SmartContextService.stripComments(transformed);
    }

    if (options.minifyOutput) {
      transformed = SmartContextService.applyMinify(transformed);
    }

    return transformed;
  }

  /**
   * Analyzes a file and determines its characteristics
   * Uses LRU cache to avoid re-analyzing unchanged files
   * Optionally applies transformations before analysis for accurate token estimation
   */
  static analyzeFile(
    path: string,
    content: string,
    metadata: FileMetadata,
    transformationOptions?: TransformationOptions,
  ): FileAnalysis {
    // Apply transformations before analysis if provided
    let processedContent = content;
    if (transformationOptions) {
      processedContent = SmartContextService.applyTransformations(
        content,
        transformationOptions,
      );
    }

    // Create cache key from path, processed content length, and line count
    // This ensures cache invalidation when content or transformations change
    const cacheKey = `${path}:${processedContent.length}:${metadata.lines}:${JSON.stringify(transformationOptions ?? {})}`;
    
    // Check cache first
    const cached = analysisCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const type = detectFileTypeFromPath(path);
    const role = detectFileRoleFromPath(path, processedContent, type);
    const relevanceScore = calculateFileRelevanceScore(
      path,
      processedContent,
      type,
      role,
    );
    const estimatedTokens = SmartContextService.estimateTokens(processedContent);
    const priority = calculateFilePriority(type, role, relevanceScore);

    const result: FileAnalysis = {
      path,
      type,
      role,
      relevanceScore,
      estimatedTokens,
      priority,
      metadata: {
        ...metadata,
        exports: SmartContextService.extractExports(content),
        imports: SmartContextService.extractImports(content),
        mainFunctions: SmartContextService.extractMainFunctions(content),
        complexity: SmartContextService.estimateComplexity(content),
      },
    };

    // Cache the result
    analysisCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Clear the file analysis cache
   */
  static clearAnalysisCache(): void {
    analysisCache.clear();
  }

  /**
   * Determines optimal strategy for including a file in context
   * Optionally includes transformation options to be applied during formatting
   */
  static determineStrategy(
    analysis: FileAnalysis,
    _options: SmartContextOptions,
    _isSelected: boolean = false, // eslint-disable-line @typescript-eslint/no-unused-vars
    transformationOptions?: TransformationOptions,
  ): OptimizationStrategy {
    const { type, role, estimatedTokens } = analysis;

    // Documentation always gets full content
    if (type === 'documentation') {
      return {
        includeFullContent: true,
        compressToSkeleton: false,
        extractKeyElements: false,
        formatTemplate: 'full',
        applyTransformations: transformationOptions,
      };
    }

    // Config files get structured extraction
    if (type === 'config') {
      return {
        includeFullContent: estimatedTokens < 500,
        compressToSkeleton: false,
        extractKeyElements: true,
        maxTokens: 500,
        formatTemplate: 'structured',
        applyTransformations: transformationOptions,
      };
    }

    // High priority source files
    if (role === 'entry' || role === 'core') {
      if (estimatedTokens < 2000) {
        return {
          includeFullContent: true,
          compressToSkeleton: false,
          extractKeyElements: false,
          formatTemplate: 'full',
          applyTransformations: transformationOptions,
        };
      }
      // Large files: use skeleton compression (never summarize)
      return {
        includeFullContent: false,
        compressToSkeleton: true,
        extractKeyElements: true,
        maxTokens: 3000,
        formatTemplate: 'skeleton',
        applyTransformations: transformationOptions,
      };
    }

    // Test files - use skeleton compression (never summarize)
    if (type === 'test') {
      return {
        includeFullContent: false,
        compressToSkeleton: true,
        extractKeyElements: true,
        maxTokens: 800,
        formatTemplate: 'skeleton',
        applyTransformations: transformationOptions,
      };
    }

    // Regular source files - adaptive based on size
    if (type === 'source') {
      if (estimatedTokens < 1000) {
        return {
          includeFullContent: true,
          compressToSkeleton: false,
          extractKeyElements: false,
          formatTemplate: 'full',
          applyTransformations: transformationOptions,
        };
      } else if (estimatedTokens < 2500) {
        return {
          includeFullContent: true,
          compressToSkeleton: false,
          extractKeyElements: true,
          formatTemplate: 'structured',
          applyTransformations: transformationOptions,
        };
      } else {
        // Large files: use skeleton compression (never summarize)
        return {
          includeFullContent: false,
          compressToSkeleton: true,
          extractKeyElements: true,
          maxTokens: 2000,
          formatTemplate: 'skeleton',
          applyTransformations: transformationOptions,
        };
      }
    }

    // Default: compact format with skeleton compression for large files
    if (estimatedTokens >= 800) {
      return {
        includeFullContent: false,
        compressToSkeleton: true,
        extractKeyElements: true,
        maxTokens: 1000,
        formatTemplate: 'skeleton',
        applyTransformations: transformationOptions,
      };
    }

    return {
      includeFullContent: true,
      compressToSkeleton: false,
      extractKeyElements: false,
      formatTemplate: 'compact',
      applyTransformations: transformationOptions,
    };
  }

  /**
   * Formats file content based on optimization strategy
   * Optionally applies basic transformations (strip comments, minify) to the content
   */
  static formatContent(
    path: string,
    content: string,
    analysis: FileAnalysis,
    strategy: OptimizationStrategy,
    transformationOptions?: TransformationOptions,
  ): string {
    let processedContent = content;

    // Apply transformations if provided
    if (transformationOptions) {
      processedContent = SmartContextService.applyTransformations(
        processedContent,
        transformationOptions,
      );
    }

    let output = '';

    // Header with file info
    output += SmartContextService.formatHeader(path, analysis, strategy);

    // Content based on strategy
    if (strategy.includeFullContent) {
      output += processedContent;
    } else if (strategy.compressToSkeleton) {
      const skeletonOptions: SkeletonOptions = {
        bodyElisionThreshold: strategy.maxTokens ? 5 : 8,
        preserveJSDoc: true,
        describeElidedBodies: true,
      };
      output += SmartContextService.compressToSkeleton(processedContent, path, skeletonOptions);
    } else if (strategy.extractKeyElements) {
      output += SmartContextService.extractKeyElements(processedContent, analysis);
    }

    return output;
  }

  /**
   * Generates a project structure map with intelligent grouping
   */
  static generateStructureMap(analyses: FileAnalysis[]): string {
    const grouped = SmartContextService.groupByType(analyses);
    let output = '# Project Structure Overview\n\n';

    // Sort groups by importance
    const order: FileType[] = [
      'documentation',
      'config',
      'source',
      'test',
      'style',
      'other',
    ];

    for (const type of order) {
      const files = grouped[type];
      if (!files || files.length === 0) continue;

      output += `## ${SmartContextService.formatTypeName(type)} (${files.length})\n`;

      // Sort by priority within group
      const sorted = files.sort((a, b) => b.priority - a.priority);
      const topFiles = sorted.slice(0, 10); // Show top 10 per category

      for (const file of topFiles) {
        const indicator = SmartContextService.getPriorityIndicator(
          file.priority,
        );
        output += `${indicator} \`${file.path}\``;

        if (file.role !== 'other') {
          output += ` - ${file.role}`;
        }

        if (file.metadata.exports && file.metadata.exports.length > 0) {
          output += ` (exports: ${file.metadata.exports.slice(0, 3).join(', ')})`;
        }

        output += '\n';
      }

      if (sorted.length > 10) {
        output += `   ... and ${sorted.length - 10} more files\n`;
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Calculates total context size with smart prioritization
   * Never excludes selected files - applies compression instead
   */
  static optimizeContextBudget(
    analyses: FileAnalysis[],
    maxTokens: number,
    options: SmartContextOptions,
    selectedPaths?: Set<string>,
  ): FileAnalysis[] {
    // Sort by priority
    const sorted = [...analyses].sort((a, b) => b.priority - a.priority);

    let totalTokens = 0;
    const result: FileAnalysis[] = [];

    for (const analysis of sorted) {
      const isSelected = selectedPaths?.has(analysis.path) ?? false;
      const strategy = SmartContextService.determineStrategy(
        analysis,
        options,
        isSelected,
      );
      // Use strategy-specific cost when present, otherwise a conservative 0.8 factor.
      const estimatedSize =
        strategy.maxTokens ?? Math.ceil(analysis.estimatedTokens * 0.8);

      if (totalTokens + estimatedSize <= maxTokens) {
        result.push(analysis);
        totalTokens += estimatedSize;
        continue;
      }

      // Selected files are ALWAYS included (apply aggressive compression if needed)
      if (isSelected) {
        result.push(analysis);
        totalTokens += estimatedSize;
        continue;
      }

      // Documentation prioritized: include but still account in total
      if (
        analysis.type === 'documentation' &&
        options.prioritizeDocumentation
      ) {
        result.push(analysis);
        totalTokens += estimatedSize;
      }
    }

    return result;
  }

  private static estimateTokens(content: string): number {
    return estimateTextTokens(content);
  }

  private static extractExports(content: string): string[] {
    const exports: string[] = [];

    // Match various export patterns
    const patterns = [
      /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
      /export\s+{\s*([^}]+)\s*}/g,
      /export\s+\*\s+from/g,
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          // Split by comma for named exports
          const names = match[1].split(',').map((s) => s.trim());
          exports.push(...names);
        }
      }
    }

    return [...new Set(exports)].slice(0, 10); // Dedupe and limit
  }

  private static extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;

    const matches = content.matchAll(importRegex);
    for (const match of matches) {
      if (match[1]) {
        imports.push(match[1]);
      }
    }

    return [...new Set(imports)].slice(0, 15); // Dedupe and limit
  }

  private static extractMainFunctions(content: string): string[] {
    const functions: string[] = [];

    // Match function/method declarations
    const patterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
      /(\w+)\s*\([^)]*\)\s*{/g,
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 2) {
          functions.push(match[1]);
        }
      }
    }

    return [...new Set(functions)].slice(0, 10);
  }

  private static estimateComplexity(content: string): number {
    let complexity = 1; // Base complexity

    // Count control flow statements
    const controlFlowPatterns = [
      /\bif\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcatch\s*\(/g,
      /\?/g, // Ternary
    ];

    for (const pattern of controlFlowPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private static formatHeader(
    path: string,
    analysis: FileAnalysis,
    strategy: OptimizationStrategy,
  ): string {
    const { type, role, priority, metadata } = analysis;

    let header = `\n${SmartContextService.HEADER_DIVIDER}\n`;
    header += `FILE: ${path}\n`;
    header += `Type: ${type} | Role: ${role} | Priority: ${SmartContextService.getPriorityIndicator(priority)}\n`;

    if (metadata.size && metadata.lines) {
      header += `Size: ${(metadata.size / 1024).toFixed(2)} KB | Lines: ${metadata.lines}`;
      if (metadata.complexity) {
        header += ` | Complexity: ${metadata.complexity}`;
      }
      header += '\n';
    }

    if (metadata.exports && metadata.exports.length > 0) {
      header += `Exports: ${metadata.exports.slice(0, 5).join(', ')}`;
      if (metadata.exports.length > 5) {
        header += ` +${metadata.exports.length - 5} more`;
      }
      header += '\n';
    }

    if (strategy.formatTemplate === 'skeleton') {
      header += 'Skeleton (optimized for token efficiency)\n';
    } else if (strategy.formatTemplate === 'structured') {
      header += 'Structured view (key elements extracted)\n';
    }

    header += `${SmartContextService.HEADER_DIVIDER}\n\n`;

    return header;
  }

  /**
   * Compress file content to skeleton (structural elements only)
   */
  static compressToSkeleton(
    content: string,
    path: string,
    options: SkeletonOptions & { maxTokens?: number },
  ): string {
    const threshold = options.bodyElisionThreshold ?? 8;
    const skeleton: FileSkeleton = {
      path,
      imports: extractCodeImports(content),
      exports: [],
      types: extractTypeDeclarations(content),
      declarations: [
        ...extractFunctionSkeletons(content, threshold, options.preserveJSDoc),
        ...extractClassSkeletons(content, threshold, options.preserveJSDoc),
      ],
      constants: extractTopLevelConstants(content),
      originalLines: content.split('\n').length,
      skeletonLines: 0,
    };

    return assembleSkeleton(path, skeleton);
  }

  /**
   * Calculate adaptive threshold based on remaining budget
   */
  static calculateAdaptiveThreshold(
    remainingTokens: number,
    remainingFiles: number,
  ): number {
    const avgTokensPerFile = remainingTokens / Math.max(remainingFiles, 1);
    if (avgTokensPerFile < 500) return 3;   // Very aggressive
    if (avgTokensPerFile < 1000) return 5;  // Aggressive
    if (avgTokensPerFile < 2000) return 8;  // Default
    return 15; // Relaxed
  }

  private static extractKeyElements(
    content: string,
    analysis: FileAnalysis,
  ): string {
    let output = '';

    // For TypeScript/JavaScript files, extract interfaces and types
    if (analysis.path.match(/\.(ts|tsx|js|jsx)$/)) {
      const interfaces = content.match(/export\s+interface\s+\w+\s*{[^}]+}/g);
      if (interfaces) {
        output += '## Type Definitions\n```typescript\n';
        output += interfaces.join('\n\n');
        output += '\n```\n\n';
      }

      const types = content.match(/export\s+type\s+\w+\s*=\s*[^;]+;/g);
      if (types) {
        output += '## Type Aliases\n```typescript\n';
        output += types.join('\n');
        output += '\n```\n\n';
      }
    }

    // Extract class definitions
    const classes = content.match(/export\s+class\s+\w+[\s\S]*?{[\s\S]*?^}/gm);
    if (classes) {
      output += '## Classes\n```\n';
      output += classes.join('\n\n');
      output += '\n```\n\n';
    }

    // If nothing extracted, include first 50 lines
    if (output.length < 100) {
      const lines = content.split('\n').slice(0, 50);
      output += lines.join('\n');
      if (content.split('\n').length > 50) {
        output += '\n\n... (truncated)';
      }
    }

    return output;
  }

  private static groupByType(
    analyses: FileAnalysis[],
  ): Record<FileType, FileAnalysis[]> {
    const grouped: Record<string, FileAnalysis[]> = {};

    for (const analysis of analyses) {
      if (!grouped[analysis.type]) {
        grouped[analysis.type] = [];
      }
      grouped[analysis.type].push(analysis);
    }

    return grouped as Record<FileType, FileAnalysis[]>;
  }

  private static formatTypeName(type: FileType): string {
    const names: Record<FileType, string> = {
      source: 'Source Code',
      config: 'Configuration',
      documentation: 'Documentation',
      test: 'Tests',
      style: 'Styles',
      asset: 'Assets',
      build: 'Build',
      other: 'Other',
    };
    return names[type] || type;
  }

  private static getPriorityIndicator(priority: number): string {
    if (priority >= 250) return '!!!';
    if (priority >= 200) return '!!';
    if (priority >= 150) return '!';
    if (priority >= 100) return '~';
    return '.';
  }
}
