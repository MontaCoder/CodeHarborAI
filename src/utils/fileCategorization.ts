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

const FILE_TYPE_PATTERNS: Record<FileType, RegExp[]> = {
  source: [/\.(ts|tsx|js|jsx|py|java|cpp|c|go|rs|rb|php|cs|swift|kt)$/i],
  config: [
    /\.(json|yaml|yml|toml|ini|env|config)$/i,
    /(package\.json|tsconfig\.json|\.eslintrc|\.prettierrc|vite\.config|rspack\.config|webpack\.config)/i,
  ],
  documentation: [/\.(md|txt|rst|adoc)$/i, /(readme|changelog|contributing|license|docs?)/i],
  test: [/\.(test|spec)\.(ts|tsx|js|jsx|py)$/i, /__tests__/],
  style: [/\.(css|scss|sass|less|styl)$/i],
  asset: [/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i],
  build: [/\.(lock|log|cache)$/i, /(dist|build|node_modules)/],
  other: [/.*/],
};

const PRIORITY_KEYWORDS = ['index', 'main', 'app', 'core', 'api', 'server', 'client'];

const DOCUMENTATION_KEYWORDS = ['readme', 'doc', 'guide', 'tutorial', 'api'];

export const detectFileType = (path: string): FileType => {
  for (const [type, patterns] of Object.entries(FILE_TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(path)) {
        return type as FileType;
      }
    }
  }

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