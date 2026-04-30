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

// Pre-compiled regex patterns for file type detection
// Organized for early exit on common cases
const FILE_TYPE_PATTERNS: Record<FileType, RegExp[]> = {
  source: [/\.(ts|tsx|js|jsx|py|java|cpp|c|go|rs|rb|php|cs|swift|kt)$/i],
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

// Fast lookup for common file extensions (avoids regex for most cases)
// Note: For compound extensions like .test.ts, the detectFileType function
// checks for .test/.spec before the last extension
const COMMON_EXTENSIONS: Record<string, FileType> = {
  // Source files
  '.ts': 'source', '.tsx': 'source', '.js': 'source', '.jsx': 'source',
  '.py': 'source', '.java': 'source', '.cpp': 'source', '.c': 'source',
  '.go': 'source', '.rs': 'source', '.rb': 'source', '.php': 'source',
  '.cs': 'source', '.swift': 'source', '.kt': 'source',
  // Config files
  '.json': 'config', '.yaml': 'config', '.yml': 'config',
  '.toml': 'config', '.ini': 'config', '.env': 'config',
  // Documentation
  '.md': 'documentation', '.txt': 'documentation',
  '.rst': 'documentation', '.adoc': 'documentation',
  // Tests (compound extensions handled in detectFileType)
  '.test.ts': 'test', '.test.tsx': 'test', '.test.js': 'test',
  '.test.jsx': 'test', '.test.py': 'test',
  '.spec.ts': 'test', '.spec.tsx': 'test', '.spec.js': 'test',
  '.spec.jsx': 'test', '.spec.py': 'test',
  // Styles
  '.css': 'style', '.scss': 'style', '.sass': 'style',
  '.less': 'style', '.styl': 'style',
  // Assets
  '.png': 'asset', '.jpg': 'asset', '.jpeg': 'asset',
  '.gif': 'asset', '.svg': 'asset', '.ico': 'asset',
  '.woff': 'asset', '.woff2': 'asset', '.ttf': 'asset',
  '.eot': 'asset',
  // Build
  '.lock': 'build', '.log': 'build', '.cache': 'build',
};

const PRIORITY_KEYWORDS = [
  'index',
  'main',
  'app',
  'core',
  'api',
  'server',
  'client',
];

const DOCUMENTATION_KEYWORDS = ['readme', 'doc', 'guide', 'tutorial', 'api'];

// Cache for file type detection results
const fileTypeCache = new Map<string, FileType>();
const fileRoleCache = new Map<string, FileRole>();

export const detectFileType = (path: string): FileType => {
  // Check cache first
  const cached = fileTypeCache.get(path);
  if (cached !== undefined) {
    return cached;
  }

  const lowerPath = path.toLowerCase();

  // Fast path: check common extensions first (O(1) lookup)
  // First check for compound extensions like .test.ts, .spec.jsx
  const lastDot = lowerPath.lastIndexOf('.');
  if (lastDot > 0) {
    const ext = lowerPath.slice(lastDot); // e.g., '.ts'
    const beforeExt = lowerPath.slice(0, lastDot);
    const testDot = beforeExt.lastIndexOf('.');

    if (testDot > 0) {
      const testExt = beforeExt.slice(testDot); // e.g., '.test' or '.spec'
      if (testExt === '.test' || testExt === '.spec') {
        const compoundExt = testExt + ext; // e.g., '.test.ts'
        const compoundType = COMMON_EXTENSIONS[compoundExt];
        if (compoundType) {
          fileTypeCache.set(path, compoundType);
          return compoundType;
        }
      }
    }

    // Check single extension
    const commonType = COMMON_EXTENSIONS[ext];
    if (commonType) {
      fileTypeCache.set(path, commonType);
      return commonType;
    }
  }

  // Check for config filename patterns
  if (lowerPath.includes('package.json') || lowerPath.includes('tsconfig.json') ||
      lowerPath.includes('.eslintrc') || lowerPath.includes('.prettierrc') ||
      lowerPath.includes('vite.config') || lowerPath.includes('rspack.config') ||
      lowerPath.includes('webpack.config')) {
    fileTypeCache.set(path, 'config');
    return 'config';
  }

  // Check for documentation filename patterns
  if (lowerPath.includes('readme') || lowerPath.includes('changelog') ||
      lowerPath.includes('contributing') || lowerPath.includes('license') ||
      lowerPath.includes('docs')) {
    fileTypeCache.set(path, 'documentation');
    return 'documentation';
  }

  // Check for __tests__ directory
  if (lowerPath.includes('__tests__')) {
    fileTypeCache.set(path, 'test');
    return 'test';
  }

  // Check for dist/build/node_modules
  if (lowerPath.includes('/dist/') || lowerPath.includes('/build/') ||
      lowerPath.includes('/node_modules/') || lowerPath.includes('\\dist\\') ||
      lowerPath.includes('\\build\\') || lowerPath.includes('\\node_modules\\')) {
    fileTypeCache.set(path, 'build');
    return 'build';
  }

  // Fallback to regex patterns
  for (const [type, patterns] of Object.entries(FILE_TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(path)) {
        fileTypeCache.set(path, type as FileType);
        return type as FileType;
      }
    }
  }

  fileTypeCache.set(path, 'other');
  return 'other';
};

export const detectFileRole = (
  path: string,
  content: string,
  type: FileType,
): FileRole => {
  const lowerPath = path.toLowerCase();

  if (type === 'documentation') return 'documentation';
  if (type === 'config') return 'config';

  if (
    lowerPath.includes('index') ||
    lowerPath.includes('main') ||
    lowerPath.includes('app.')
  ) {
    return 'entry';
  }

  if (lowerPath.includes('component') || /\.tsx$/.test(lowerPath)) {
    return 'component';
  }

  if (lowerPath.includes('service') || lowerPath.includes('api')) {
    return 'service';
  }

  if (
    lowerPath.includes('model') ||
    lowerPath.includes('type') ||
    lowerPath.includes('interface')
  ) {
    return 'model';
  }

  if (lowerPath.includes('util') || lowerPath.includes('helper')) {
    return 'utility';
  }

  if (
    content.includes('export class') ||
    content.includes('export default') ||
    content.includes('export const')
  ) {
    return 'core';
  }

  return 'other';
};

export const calculateRelevanceScore = (
  path: string,
  content: string,
  type: FileType,
  role: FileRole,
): number => {
  let score = 50;

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

  const lowerPath = path.toLowerCase();
  for (const keyword of PRIORITY_KEYWORDS) {
    if (lowerPath.includes(keyword)) {
      score += 20;
    }
  }

  if (content.includes('export default')) score += 15;
  if (content.includes('export class')) score += 10;
  if (content.includes('export interface')) score += 8;

  for (const keyword of DOCUMENTATION_KEYWORDS) {
    if (lowerPath.includes(keyword)) {
      score += 25;
    }
  }

  return Math.min(score, 300);
};

export const calculatePriority = (
  type: FileType,
  role: FileRole,
  relevanceScore: number,
): number => {
  let priority = relevanceScore;

  if (role === 'entry') priority *= 1.5;
  if (role === 'core') priority *= 1.3;
  if (type === 'documentation') priority *= 1.4;

  return Math.round(priority);
};

/**
 * Clear all file categorization caches
 */
export const clearFileCategorizationCache = (): void => {
  fileTypeCache.clear();
  fileRoleCache.clear();
};