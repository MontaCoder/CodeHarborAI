import {
  calculatePriority,
  calculateRelevanceScore,
  detectFileRole,
  detectFileType,
  type FileType,
} from './fileCategorization';

export interface PrioritizedFile {
  path: string;
  priority: number;
  category: 'documentation' | 'config' | 'source' | 'test' | 'other';
}

const typeToCategory = (type: FileType): PrioritizedFile['category'] => {
  const map: Record<FileType, PrioritizedFile['category']> = {
    documentation: 'documentation',
    config: 'config',
    source: 'source',
    test: 'test',
    style: 'source',
    build: 'other',
    asset: 'other',
    other: 'other',
  };
  return map[type];
};

/**
 * Prioritize files for better context engineering.
 * Delegates to the unified classification system in fileCategorization.ts.
 * Higher priority = more important for AI context.
 */
export function prioritizeFiles(filePaths: string[]): PrioritizedFile[] {
  return filePaths
    .map((path) => {
      const type = detectFileType(path);
      const role = detectFileRole(path, '', type);
      const relevance = calculateRelevanceScore(path, '', type, role);
      const priority = calculatePriority(type, role, relevance);

      return {
        path,
        priority,
        category: typeToCategory(type),
      };
    })
    .sort((a, b) => b.priority - a.priority);
}
