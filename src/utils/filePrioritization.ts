export interface PrioritizedFile {
  path: string;
  priority: number;
  category: 'documentation' | 'config' | 'source' | 'test' | 'other';
}

/**
 * Prioritize files for better context engineering
 * Higher priority = more important for AI context
 */
export function prioritizeFiles(filePaths: string[]): PrioritizedFile[] {
  const prioritized = filePaths.map((path) => {
    const fileName = path.toLowerCase();
    let priority = 0;
    let category: PrioritizedFile['category'] = 'other';

    // Documentation files (highest priority)
    if (
      fileName === 'readme.md' ||
      fileName === 'readme.txt' ||
      fileName === 'readme'
    ) {
      priority = 100;
      category = 'documentation';
    } else if (
      fileName.includes('contributing') ||
      fileName.includes('changelog') ||
      fileName.includes('architecture') ||
      fileName.includes('api.md') ||
      fileName.includes('docs.md') ||
      fileName.endsWith('.md')
    ) {
      priority = 90;
      category = 'documentation';
    }
    // Configuration files (high priority)
    else if (
      fileName === 'package.json' ||
      fileName === 'tsconfig.json' ||
      fileName === 'webpack.config.js' ||
      fileName === 'vite.config.ts' ||
      fileName === 'next.config.js' ||
      fileName === '.env.example' ||
      fileName === 'docker-compose.yml' ||
      fileName === 'dockerfile'
    ) {
      priority = 80;
      category = 'config';
    }
    // Entry points and main files
    else if (
      fileName === 'index.ts' ||
      fileName === 'index.tsx' ||
      fileName === 'index.js' ||
      fileName === 'main.ts' ||
      fileName === 'main.tsx' ||
      fileName === 'app.ts' ||
      fileName === 'app.tsx' ||
      fileName.includes('app.component')
    ) {
      priority = 70;
      category = 'source';
    }
    // Routes and API files
    else if (
      fileName.includes('/routes/') ||
      fileName.includes('/api/') ||
      fileName.includes('/controllers/') ||
      fileName.includes('/endpoints/')
    ) {
      priority = 65;
      category = 'source';
    }
    // Core business logic
    else if (
      fileName.includes('/services/') ||
      fileName.includes('/models/') ||
      fileName.includes('/lib/') ||
      fileName.includes('/core/') ||
      fileName.includes('/domain/')
    ) {
      priority = 60;
      category = 'source';
    }
    // Components and UI
    else if (
      fileName.includes('/components/') ||
      fileName.includes('/views/') ||
      fileName.includes('/pages/') ||
      fileName.includes('/screens/')
    ) {
      priority = 55;
      category = 'source';
    }
    // Utilities and helpers
    else if (
      fileName.includes('/utils/') ||
      fileName.includes('/helpers/') ||
      fileName.includes('/shared/') ||
      fileName.includes('/common/')
    ) {
      priority = 50;
      category = 'source';
    }
    // Types and interfaces
    else if (
      fileName.includes('/types/') ||
      fileName.includes('/interfaces/') ||
      fileName.includes('.d.ts')
    ) {
      priority = 45;
      category = 'source';
    }
    // Test files (lower priority for most contexts)
    else if (
      fileName.includes('.test.') ||
      fileName.includes('.spec.') ||
      fileName.includes('/__tests__/') ||
      fileName.includes('/tests/')
    ) {
      priority = 30;
      category = 'test';
    }
    // Source files
    else if (
      fileName.endsWith('.ts') ||
      fileName.endsWith('.tsx') ||
      fileName.endsWith('.js') ||
      fileName.endsWith('.jsx') ||
      fileName.endsWith('.py') ||
      fileName.endsWith('.java') ||
      fileName.endsWith('.go') ||
      fileName.endsWith('.rs')
    ) {
      priority = 40;
      category = 'source';
    }
    // Build and generated files (lowest priority)
    else if (
      fileName.includes('/dist/') ||
      fileName.includes('/build/') ||
      fileName.includes('.min.') ||
      fileName.includes('.map')
    ) {
      priority = 10;
      category = 'other';
    }

    return {
      path,
      priority,
      category,
    };
  });

  // Sort by priority (highest first)
  return prioritized.sort((a, b) => b.priority - a.priority);
}

/**
 * Group files by category for better organization
 */
export function groupFilesByCategory(
  files: PrioritizedFile[],
): Record<string, PrioritizedFile[]> {
  return files.reduce(
    (acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = [];
      }
      acc[file.category].push(file);
      return acc;
    },
    {} as Record<string, PrioritizedFile[]>,
  );
}

/**
 * Filter files based on template patterns
 */
export function filterFilesByPatterns(
  filePaths: string[],
  includePatterns?: string[],
  excludePatterns?: string[],
): string[] {
  let filtered = [...filePaths];

  // Apply exclude patterns first
  if (excludePatterns && excludePatterns.length > 0) {
    filtered = filtered.filter((path) => {
      return !excludePatterns.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(path);
      });
    });
  }

  // Apply include patterns
  if (includePatterns && includePatterns.length > 0) {
    filtered = filtered.filter((path) => {
      return includePatterns.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(path);
      });
    });
  }

  return filtered;
}

/**
 * Get suggested files for a specific context/template
 */
export function getSuggestedFiles(
  allFiles: string[],
  templatePriorities?: string[],
  includePatterns?: string[],
  excludePatterns?: string[],
): string[] {
  // Filter by patterns first
  const filtered = filterFilesByPatterns(
    allFiles,
    includePatterns,
    excludePatterns,
  );

  // Prioritize files
  const prioritized = prioritizeFiles(filtered);

  // If template has specific priorities, boost those files
  if (templatePriorities && templatePriorities.length > 0) {
    prioritized.forEach((file) => {
      for (const pattern of templatePriorities) {
        if (file.path.includes(pattern)) {
          file.priority += 20;
        }
      }
    });
    // Re-sort after boosting
    prioritized.sort((a, b) => b.priority - a.priority);
  }

  return prioritized.map((f) => f.path);
}
