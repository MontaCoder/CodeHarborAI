/**
 * Advanced Code Analyzer Service
 * Provides sophisticated code analysis beyond simple pattern matching
 */

export interface CodeStructure {
  imports: ImportStatement[];
  exports: ExportStatement[];
  functions: FunctionDeclaration[];
  classes: ClassDeclaration[];
  interfaces: InterfaceDeclaration[];
  types: TypeDeclaration[];
  constants: ConstantDeclaration[];
  comments: Comment[];
}

export interface ImportStatement {
  source: string;
  items: string[];
  isDefault: boolean;
  isNamespace: boolean;
}

export interface ExportStatement {
  name: string;
  type: 'function' | 'class' | 'const' | 'type' | 'interface' | 'default';
  isReexport: boolean;
}

export interface FunctionDeclaration {
  name: string;
  params: string[];
  isAsync: boolean;
  isExported: boolean;
  lineStart: number;
  lineEnd: number;
}

export interface ClassDeclaration {
  name: string;
  extends: string | null;
  implements: string[];
  methods: string[];
  properties: string[];
  isExported: boolean;
}

export interface InterfaceDeclaration {
  name: string;
  extends: string[];
  properties: string[];
  isExported: boolean;
}

export interface TypeDeclaration {
  name: string;
  definition: string;
  isExported: boolean;
}

export interface ConstantDeclaration {
  name: string;
  type: string | null;
  isExported: boolean;
}

export interface Comment {
  type: 'single' | 'multi' | 'doc';
  content: string;
  line: number;
}

export interface LanguageConfig {
  name: string;
  extensions: string[];
  commentPatterns: {
    single?: string;
    multiStart?: string;
    multiEnd?: string;
    doc?: string;
  };
  importPatterns: RegExp[];
  exportPatterns: RegExp[];
  functionPatterns: RegExp[];
  classPatterns: RegExp[];
}

/**
 * Advanced Code Analyzer with multi-language support
 */
export class CodeAnalyzerService {
  private static readonly LANGUAGE_CONFIGS: LanguageConfig[] = [
    {
      name: 'typescript',
      extensions: ['.ts', '.tsx'],
      commentPatterns: {
        single: '//',
        multiStart: '/*',
        multiEnd: '*/',
        doc: '/**',
      },
      importPatterns: [
        /import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      ],
      exportPatterns: [
        /export\s+(?:default\s+)?(?:class|function|const|let|var|type|interface)\s+(\w+)/g,
        /export\s+{([^}]+)}/g,
        /export\s+\*\s+from/g,
      ],
      functionPatterns: [
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
        /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g,
        /(\w+)\s*:\s*\(([^)]*)\)\s*=>/g,
      ],
      classPatterns: [
        /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/g,
      ],
    },
    {
      name: 'javascript',
      extensions: ['.js', '.jsx'],
      commentPatterns: {
        single: '//',
        multiStart: '/*',
        multiEnd: '*/',
        doc: '/**',
      },
      importPatterns: [
        /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
        /require\s*\(['"]([^'"]+)['"]\)/g,
      ],
      exportPatterns: [
        /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
        /export\s+{([^}]+)}/g,
        /module\.exports\s*=\s*(\w+)/g,
      ],
      functionPatterns: [
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
        /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g,
      ],
      classPatterns: [
        /class\s+(\w+)(?:\s+extends\s+(\w+))?/g,
      ],
    },
    {
      name: 'python',
      extensions: ['.py'],
      commentPatterns: {
        single: '#',
        multiStart: '"""',
        multiEnd: '"""',
        doc: '"""',
      },
      importPatterns: [
        /from\s+([^\s]+)\s+import\s+([^\n]+)/g,
        /import\s+([^\n]+)/g,
      ],
      exportPatterns: [
        /__all__\s*=\s*\[([^\]]+)\]/g,
      ],
      functionPatterns: [
        /def\s+(\w+)\s*\(([^)]*)\)/g,
        /async\s+def\s+(\w+)\s*\(([^)]*)\)/g,
      ],
      classPatterns: [
        /class\s+(\w+)(?:\(([^)]+)\))?:/g,
      ],
    },
  ];

  /**
   * Analyze code structure comprehensively
   */
  static analyzeCode(content: string, filePath: string): CodeStructure {
    const language = this.detectLanguage(filePath);
    const config = this.getLanguageConfig(language);

    if (!config) {
      return this.getEmptyStructure();
    }

    return {
      imports: this.extractImports(content, config),
      exports: this.extractExports(content, config),
      functions: this.extractFunctions(content, config),
      classes: this.extractClasses(content, config),
      interfaces: this.extractInterfaces(content, language),
      types: this.extractTypes(content, language),
      constants: this.extractConstants(content),
      comments: this.extractComments(content, config),
    };
  }

  /**
   * Detect programming language from file extension
   */
  private static detectLanguage(filePath: string): string {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();

    for (const config of this.LANGUAGE_CONFIGS) {
      if (config.extensions.includes(ext)) {
        return config.name;
      }
    }

    return 'unknown';
  }

  /**
   * Get language configuration
   */
  private static getLanguageConfig(language: string): LanguageConfig | null {
    return (
      this.LANGUAGE_CONFIGS.find((c) => c.name === language) || null
    );
  }

  /**
   * Extract import statements
   */
  private static extractImports(
    content: string,
    config: LanguageConfig,
  ): ImportStatement[] {
    const imports: ImportStatement[] = [];

    for (const pattern of config.importPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2]) {
          // Named imports
          const items = match[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          imports.push({
            source: match[2],
            items,
            isDefault: false,
            isNamespace: false,
          });
        } else if (match[1]) {
          // Default or namespace import
          const isNamespace = match[0].includes('* as');
          imports.push({
            source: match[2] || match[1],
            items: [match[1]],
            isDefault: !isNamespace,
            isNamespace,
          });
        }
      }
    }

    return imports;
  }

  /**
   * Extract export statements
   */
  private static extractExports(
    content: string,
    config: LanguageConfig,
  ): ExportStatement[] {
    const exports: ExportStatement[] = [];

    for (const pattern of config.exportPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const type = this.inferExportType(match[0]);
          const isReexport = match[0].includes('from');

          // Handle multiple exports in braces
          if (match[1].includes(',')) {
            const names = match[1]
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            names.forEach((name) => {
              exports.push({ name, type, isReexport });
            });
          } else {
            exports.push({
              name: match[1].trim(),
              type,
              isReexport,
            });
          }
        }
      }
    }

    return exports;
  }

  /**
   * Infer export type from declaration
   */
  private static inferExportType(
    declaration: string,
  ): ExportStatement['type'] {
    if (declaration.includes('function')) return 'function';
    if (declaration.includes('class')) return 'class';
    if (declaration.includes('const') || declaration.includes('let'))
      return 'const';
    if (declaration.includes('type')) return 'type';
    if (declaration.includes('interface')) return 'interface';
    if (declaration.includes('default')) return 'default';
    return 'const';
  }

  /**
   * Extract function declarations
   */
  private static extractFunctions(
    content: string,
    config: LanguageConfig,
  ): FunctionDeclaration[] {
    const functions: FunctionDeclaration[] = [];
    const lines = content.split('\n');

    for (const pattern of config.functionPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const name = match[1];
          const params = match[2]
            ? match[2]
                .split(',')
                .map((p) => p.trim())
                .filter(Boolean)
            : [];
          const isAsync = match[0].includes('async');
          const isExported = match[0].includes('export');

          // Find line numbers
          const matchIndex = content.indexOf(match[0]);
          const lineStart =
            content.substring(0, matchIndex).split('\n').length;
          const lineEnd = this.findFunctionEnd(lines, lineStart - 1);

          functions.push({
            name,
            params,
            isAsync,
            isExported,
            lineStart,
            lineEnd,
          });
        }
      }
    }

    return functions;
  }

  /**
   * Find the ending line of a function
   */
  private static findFunctionEnd(
    lines: string[],
    startLine: number,
  ): number {
    let braceCount = 0;
    let inFunction = false;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];

      for (const char of line) {
        if (char === '{') {
          braceCount++;
          inFunction = true;
        } else if (char === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            return i + 1;
          }
        }
      }

      // Handle single-line arrow functions
      if (!inFunction && line.includes('=>') && !line.includes('{')) {
        return i + 1;
      }
    }

    return startLine + 1;
  }

  /**
   * Extract class declarations
   */
  private static extractClasses(
    content: string,
    config: LanguageConfig,
  ): ClassDeclaration[] {
    const classes: ClassDeclaration[] = [];

    for (const pattern of config.classPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const name = match[1];
          const extendsClass = match[2] || null;
          const implementsList = match[3]
            ? match[3]
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

          // Extract methods and properties (simplified)
          const classBody = this.extractClassBody(content, match[0]);
          const methods = this.extractClassMethods(classBody);
          const properties = this.extractClassProperties(classBody);

          classes.push({
            name,
            extends: extendsClass,
            implements: implementsList,
            methods,
            properties,
            isExported: content.includes(`export class ${name}`),
          });
        }
      }
    }

    return classes;
  }

  /**
   * Extract class body
   */
  private static extractClassBody(content: string, classDecl: string): string {
    const startIndex = content.indexOf(classDecl);
    if (startIndex === -1) return '';

    const fromStart = content.substring(startIndex);
    const openBrace = fromStart.indexOf('{');
    if (openBrace === -1) return '';

    let braceCount = 0;
    let endIndex = openBrace;

    for (let i = openBrace; i < fromStart.length; i++) {
      if (fromStart[i] === '{') braceCount++;
      else if (fromStart[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    return fromStart.substring(openBrace + 1, endIndex);
  }

  /**
   * Extract class methods
   */
  private static extractClassMethods(classBody: string): string[] {
    const methods: string[] = [];
    const methodPattern = /(?:async\s+)?(\w+)\s*\(/g;

    const matches = classBody.matchAll(methodPattern);
    for (const match of matches) {
      if (match[1] && match[1] !== 'constructor') {
        methods.push(match[1]);
      }
    }

    return methods;
  }

  /**
   * Extract class properties
   */
  private static extractClassProperties(classBody: string): string[] {
    const properties: string[] = [];
    const propertyPattern = /(?:private|public|protected)?\s+(\w+)(?:\s*:\s*[^;=]+)?(?:\s*=)?/g;

    const matches = classBody.matchAll(propertyPattern);
    for (const match of matches) {
      if (match[1]) {
        properties.push(match[1]);
      }
    }

    return properties;
  }

  /**
   * Extract TypeScript interfaces
   */
  private static extractInterfaces(
    content: string,
    language: string,
  ): InterfaceDeclaration[] {
    if (language !== 'typescript') return [];

    const interfaces: InterfaceDeclaration[] = [];
    const pattern =
      /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?\s*{([^}]+)}/g;

    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const name = match[1];
        const extendsList = match[2]
          ? match[2]
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        const body = match[3] || '';
        const properties = body
          .split('\n')
          .map((line) => {
            const prop = line.trim().split(':')[0]?.trim();
            return prop && !prop.startsWith('//') ? prop : null;
          })
          .filter(Boolean) as string[];

        interfaces.push({
          name,
          extends: extendsList,
          properties,
          isExported: content.includes(`export interface ${name}`),
        });
      }
    }

    return interfaces;
  }

  /**
   * Extract TypeScript type aliases
   */
  private static extractTypes(
    content: string,
    language: string,
  ): TypeDeclaration[] {
    if (language !== 'typescript') return [];

    const types: TypeDeclaration[] = [];
    const pattern = /(?:export\s+)?type\s+(\w+)\s*=\s*([^;]+);/g;

    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        types.push({
          name: match[1],
          definition: match[2]?.trim() || '',
          isExported: content.includes(`export type ${match[1]}`),
        });
      }
    }

    return types;
  }

  /**
   * Extract constant declarations
   */
  private static extractConstants(content: string): ConstantDeclaration[] {
    const constants: ConstantDeclaration[] = [];
    const pattern = /(?:export\s+)?const\s+(\w+)(?:\s*:\s*([^=]+))?\s*=/g;

    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        constants.push({
          name: match[1],
          type: match[2]?.trim() || null,
          isExported: content.includes(`export const ${match[1]}`),
        });
      }
    }

    return constants;
  }

  /**
   * Extract comments
   */
  private static extractComments(
    content: string,
    config: LanguageConfig,
  ): Comment[] {
    const comments: Comment[] = [];
    const lines = content.split('\n');

    let inMultiLine = false;
    let multiLineStart = 0;
    let multiLineContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Multi-line comment start
      if (
        config.commentPatterns.multiStart &&
        line.includes(config.commentPatterns.multiStart) &&
        !inMultiLine
      ) {
        inMultiLine = true;
        multiLineStart = i + 1;
        multiLineContent = [line];
        continue;
      }

      // Multi-line comment end
      if (
        config.commentPatterns.multiEnd &&
        line.includes(config.commentPatterns.multiEnd) &&
        inMultiLine
      ) {
        inMultiLine = false;
        multiLineContent.push(line);
        const isDoc = multiLineContent[0].includes(
          config.commentPatterns.doc || '/**',
        );
        comments.push({
          type: isDoc ? 'doc' : 'multi',
          content: multiLineContent.join('\n'),
          line: multiLineStart,
        });
        multiLineContent = [];
        continue;
      }

      // Inside multi-line comment
      if (inMultiLine) {
        multiLineContent.push(line);
        continue;
      }

      // Single-line comment
      if (
        config.commentPatterns.single &&
        line.startsWith(config.commentPatterns.single)
      ) {
        comments.push({
          type: 'single',
          content: line,
          line: i + 1,
        });
      }
    }

    return comments;
  }

  /**
   * Get empty structure
   */
  private static getEmptyStructure(): CodeStructure {
    return {
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      interfaces: [],
      types: [],
      constants: [],
      comments: [],
    };
  }

  /**
   * Generate code summary
   */
  static generateSummary(structure: CodeStructure): string {
    let summary = '';

    if (structure.exports.length > 0) {
      summary += `**Exports:** ${structure.exports.map((e) => e.name).join(', ')}\n`;
    }

    if (structure.functions.length > 0) {
      summary += `**Functions:** ${structure.functions.length}\n`;
      const exported = structure.functions.filter((f) => f.isExported);
      if (exported.length > 0) {
        summary += `  - Exported: ${exported.map((f) => `${f.name}()`).join(', ')}\n`;
      }
    }

    if (structure.classes.length > 0) {
      summary += `**Classes:** ${structure.classes.map((c) => c.name).join(', ')}\n`;
    }

    if (structure.interfaces.length > 0) {
      summary += `**Interfaces:** ${structure.interfaces.map((i) => i.name).join(', ')}\n`;
    }

    if (structure.types.length > 0) {
      summary += `**Types:** ${structure.types.map((t) => t.name).join(', ')}\n`;
    }

    return summary;
  }
}
