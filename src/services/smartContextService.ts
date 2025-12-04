/**
 * Smart Context Optimizer Service
 * Intelligently analyzes and optimizes code context for AI prompts
 * Replaces the simple 3-level context enhancement with adaptive, file-aware optimization
 */

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

export type FileType =
  | 'source'
  | 'config'
  | 'documentation'
  | 'test'
  | 'style'
  | 'asset'
  | 'build'
  | 'other';

export type FileRole =
  | 'entry'
  | 'core'
  | 'utility'
  | 'component'
  | 'service'
  | 'model'
  | 'config'
  | 'documentation'
  | 'other';

export interface OptimizationStrategy {
  includeFullContent: boolean;
  summarize: boolean;
  extractKeyElements: boolean;
  maxTokens?: number;
  formatTemplate: 'full' | 'compact' | 'summary' | 'structured';
}

export interface SmartContextOptions {
  maxTotalTokens?: number;
  prioritizeDocumentation: boolean;
  includeStructureMap: boolean;
  extractCodeSignatures: boolean;
  adaptiveCompression: boolean;
}

export class SmartContextService {
  private static readonly FILE_TYPE_PATTERNS: Record<
    FileType,
    RegExp[]
  > = {
    source: [
      /\.(ts|tsx|js|jsx|py|java|cpp|c|go|rs|rb|php|cs|swift|kt)$/i,
    ],
    config: [
      /\.(json|yaml|yml|toml|ini|env|config)$/i,
      /(package\.json|tsconfig\.json|\.eslintrc|\.prettierrc|vite\.config|rspack\.config|webpack\.config)/i,
    ],
    documentation: [
      /\.(md|txt|rst|adoc)$/i,
      /(readme|changelog|contributing|license|docs?)/i,
    ],
    test: [/\.(test|spec)\.(ts|tsx|js|jsx|py)$/i, /__tests__/],
    style: [/\.(css|scss|sass|less|styl)$/i],
    asset: [/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i],
    build: [/\.(lock|log|cache)$/i, /(dist|build|node_modules)/],
    other: [/.*/],
  };

  private static readonly PRIORITY_KEYWORDS = [
    'index',
    'main',
    'app',
    'core',
    'api',
    'server',
    'client',
  ];

  private static readonly DOCUMENTATION_KEYWORDS = [
    'readme',
    'doc',
    'guide',
    'tutorial',
    'api',
  ];

  private static readonly HEADER_DIVIDER = '-'.repeat(60);

  /**
   * Analyzes a file and determines its characteristics
   */
  static analyzeFile(
    path: string,
    content: string,
    metadata: FileMetadata,
  ): FileAnalysis {
    const type = this.detectFileType(path);
    const role = this.detectFileRole(path, content, type);
    const relevanceScore = this.calculateRelevanceScore(path, content, type, role);
    const estimatedTokens = this.estimateTokens(content);
    const priority = this.calculatePriority(type, role, relevanceScore);

    return {
      path,
      type,
      role,
      relevanceScore,
      estimatedTokens,
      priority,
      metadata: {
        ...metadata,
        exports: this.extractExports(content, path),
        imports: this.extractImports(content, path),
        mainFunctions: this.extractMainFunctions(content, path),
        complexity: this.estimateComplexity(content),
      },
    };
  }

  /**
   * Determines optimal strategy for including a file in context
   */
  static determineStrategy(
    analysis: FileAnalysis,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: SmartContextOptions,
  ): OptimizationStrategy {
    const { type, role, estimatedTokens } = analysis;

    // Documentation always gets full content
    if (type === 'documentation') {
      return {
        includeFullContent: true,
        summarize: false,
        extractKeyElements: false,
        formatTemplate: 'full',
      };
    }

    // Config files get structured extraction
    if (type === 'config') {
      return {
        includeFullContent: estimatedTokens < 500,
        summarize: false,
        extractKeyElements: true,
        maxTokens: 500,
        formatTemplate: 'structured',
      };
    }

    // High priority source files
    if (role === 'entry' || role === 'core') {
      return {
        includeFullContent: estimatedTokens < 2000,
        summarize: estimatedTokens >= 2000,
        extractKeyElements: true,
        maxTokens: 3000,
        formatTemplate: 'structured',
      };
    }

    // Test files - summarize by default
    if (type === 'test') {
      return {
        includeFullContent: false,
        summarize: true,
        extractKeyElements: true,
        maxTokens: 800,
        formatTemplate: 'summary',
      };
    }

    // Regular source files - adaptive based on size
    if (type === 'source') {
      if (estimatedTokens < 1000) {
        return {
          includeFullContent: true,
          summarize: false,
          extractKeyElements: false,
          formatTemplate: 'full',
        };
      } else if (estimatedTokens < 2500) {
        return {
          includeFullContent: true,
          summarize: false,
          extractKeyElements: true,
          formatTemplate: 'structured',
        };
      } else {
        return {
          includeFullContent: false,
          summarize: true,
          extractKeyElements: true,
          maxTokens: 2000,
          formatTemplate: 'summary',
        };
      }
    }

    // Default: compact format
    return {
      includeFullContent: estimatedTokens < 800,
      summarize: estimatedTokens >= 800,
      extractKeyElements: true,
      maxTokens: 1000,
      formatTemplate: 'compact',
    };
  }

  /**
   * Formats file content based on optimization strategy
   */
  static formatContent(
    path: string,
    content: string,
    analysis: FileAnalysis,
    strategy: OptimizationStrategy,
  ): string {
    let output = '';

    // Header with file info
    output += this.formatHeader(path, analysis, strategy);

    // Content based on strategy
    if (strategy.includeFullContent) {
      output += content;
    } else if (strategy.summarize) {
      output += this.generateSummary(content, analysis, strategy.maxTokens);
    } else if (strategy.extractKeyElements) {
      output += this.extractKeyElements(content, analysis);
    }

    return output;
  }

  /**
   * Generates a project structure map with intelligent grouping
   */
  static generateStructureMap(analyses: FileAnalysis[]): string {
    const grouped = this.groupByType(analyses);
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

      output += `## ${this.formatTypeName(type)} (${files.length})\n`;

      // Sort by priority within group
      const sorted = files.sort((a, b) => b.priority - a.priority);
      const topFiles = sorted.slice(0, 10); // Show top 10 per category

      for (const file of topFiles) {
        const indicator = this.getPriorityIndicator(file.priority);
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
   */
  static optimizeContextBudget(
    analyses: FileAnalysis[],
    maxTokens: number,
    options: SmartContextOptions,
  ): FileAnalysis[] {
    // Sort by priority
    const sorted = [...analyses].sort((a, b) => b.priority - a.priority);

    let totalTokens = 0;
    const selected: FileAnalysis[] = [];

    for (const analysis of sorted) {
      const strategy = this.determineStrategy(analysis, options);
      const estimatedSize =
        strategy.maxTokens ?? analysis.estimatedTokens * 0.8;

      if (totalTokens + estimatedSize <= maxTokens) {
        selected.push(analysis);
        totalTokens += estimatedSize;
      } else if (
        analysis.type === 'documentation' &&
        options.prioritizeDocumentation
      ) {
        // Always include documentation even if over budget
        selected.push(analysis);
      }
    }

    return selected;
  }

  // ============== Private Helper Methods ==============

  private static detectFileType(path: string): FileType {
    for (const [type, patterns] of Object.entries(this.FILE_TYPE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(path)) {
          return type as FileType;
        }
      }
    }
    return 'other';
  }

  private static detectFileRole(
    path: string,
    content: string,
    type: FileType,
  ): FileRole {
    const lowerPath = path.toLowerCase();

    if (type === 'documentation') return 'documentation';
    if (type === 'config') return 'config';

    // Check for entry points
    if (
      lowerPath.includes('index') ||
      lowerPath.includes('main') ||
      lowerPath.includes('app.')
    ) {
      return 'entry';
    }

    // Check for components
    if (lowerPath.includes('component') || /\.tsx$/.test(lowerPath)) {
      return 'component';
    }

    // Check for services
    if (lowerPath.includes('service') || lowerPath.includes('api')) {
      return 'service';
    }

    // Check for models
    if (
      lowerPath.includes('model') ||
      lowerPath.includes('type') ||
      lowerPath.includes('interface')
    ) {
      return 'model';
    }

    // Check for utilities
    if (lowerPath.includes('util') || lowerPath.includes('helper')) {
      return 'utility';
    }

    // Check content for core indicators
    if (
      content.includes('export class') ||
      content.includes('export default') ||
      content.includes('export const')
    ) {
      return 'core';
    }

    return 'other';
  }

  private static calculateRelevanceScore(
    path: string,
    content: string,
    type: FileType,
    role: FileRole,
  ): number {
    let score = 50; // Base score

    // Type bonuses
    const typeScores: Record<FileType, number> = {
      documentation: 100,
      config: 80,
      source: 70,
      test: 40,
      style: 30,
      asset: 10,
      build: 5,
      other: 20,
    };
    score += typeScores[type] || 0;

    // Role bonuses
    const roleScores: Record<FileRole, number> = {
      entry: 100,
      core: 80,
      service: 70,
      component: 60,
      model: 60,
      utility: 40,
      config: 50,
      documentation: 90,
      other: 20,
    };
    score += roleScores[role] || 0;

    // Path-based bonuses
    const lowerPath = path.toLowerCase();
    for (const keyword of this.PRIORITY_KEYWORDS) {
      if (lowerPath.includes(keyword)) {
        score += 20;
      }
    }

    // Content-based bonuses
    if (content.includes('export default')) score += 15;
    if (content.includes('export class')) score += 10;
    if (content.includes('export interface')) score += 8;

    // Documentation content bonus
    for (const keyword of this.DOCUMENTATION_KEYWORDS) {
      if (lowerPath.includes(keyword)) {
        score += 25;
      }
    }

    return Math.min(score, 300); // Cap at 300
  }

  private static calculatePriority(
    type: FileType,
    role: FileRole,
    relevanceScore: number,
  ): number {
    // Weighted combination
    let priority = relevanceScore;

    // Critical roles get boosted
    if (role === 'entry') priority *= 1.5;
    if (role === 'core') priority *= 1.3;
    if (type === 'documentation') priority *= 1.4;

    return Math.round(priority);
  }

  private static estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token on average
    return Math.ceil(content.length / 4);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static extractExports(content: string, _path: string): string[] {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static extractImports(content: string, _path: string): string[] {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static extractMainFunctions(content: string, _path: string): string[] {
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

    let header = `\n${this.HEADER_DIVIDER}\n`;
    header += `FILE: ${path}\n`;
    header += `Type: ${type} | Role: ${role} | Priority: ${this.getPriorityIndicator(priority)}\n`;

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

    if (strategy.formatTemplate === 'summary') {
      header += 'Summary (optimized for token efficiency)\n';
    } else if (strategy.formatTemplate === 'structured') {
      header += 'Structured view (key elements extracted)\n';
    }

    header += `${this.HEADER_DIVIDER}\n\n`;

    return header;
  }

  private static generateSummary(
    content: string,
    analysis: FileAnalysis,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxTokens?: number,
  ): string {
    let summary = '## Summary\n\n';

    // Add imports section
    if (analysis.metadata.imports && analysis.metadata.imports.length > 0) {
      summary += '**Dependencies:**\n';
      summary += analysis.metadata.imports
        .slice(0, 8)
        .map((imp) => `- ${imp}`)
        .join('\n');
      summary += '\n\n';
    }

    // Add exports section
    if (analysis.metadata.exports && analysis.metadata.exports.length > 0) {
      summary += '**Exports:**\n';
      summary += analysis.metadata.exports
        .slice(0, 8)
        .map((exp) => `- ${exp}`)
        .join('\n');
      summary += '\n\n';
    }

    // Add key functions
    if (
      analysis.metadata.mainFunctions &&
      analysis.metadata.mainFunctions.length > 0
    ) {
      summary += '**Key Functions:**\n';
      summary += analysis.metadata.mainFunctions
        .slice(0, 8)
        .map((fn) => `- ${fn}()`)
        .join('\n');
      summary += '\n\n';
    }

    // Extract first comment block or docstring if present
    const docMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (docMatch) {
      summary += '**Documentation:**\n```\n' + docMatch[0] + '\n```\n\n';
    }

    summary +=
      '_Full content omitted for token efficiency. Key signatures and structure preserved._\n';

    return summary;
  }

  private static extractKeyElements(
    content: string,
    analysis: FileAnalysis,
  ): string {
    let output = '';

    // For TypeScript/JavaScript files, extract interfaces and types
    if (analysis.path.match(/\.(ts|tsx|js|jsx)$/)) {
      const interfaces = content.match(
        /export\s+interface\s+\w+\s*{[^}]+}/g,
      );
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
    const classes = content.match(
      /export\s+class\s+\w+[\s\S]*?{[\s\S]*?^}/gm,
    );
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
