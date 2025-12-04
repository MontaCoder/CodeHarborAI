const TEXT_EXTENSIONS = [
  '.txt',
  '.md',
  '.csv',
  '.js',
  '.css',
  '.html',
  '.json',
  '.xml',
  '.yaml',
  '.yml',
  '.ini',
  '.log',
  '.sh',
  '.bash',
  '.py',
  '.java',
  '.cpp',
  '.c',
  '.h',
  '.config',
  '.env',
  '.gitignore',
  '.sql',
  '.ts',
  '.tsx',
  '.schema',
  '.mjs',
  '.cjs',
  '.jsx',
  '.rs',
  '.go',
  '.php',
  '.rb',
  '.toml',
  '.prisma',
  '.bat',
  '.ps1',
  '.svelte',
  '.lock',
  '.vue',
  '.dart',
  '.kt',
  '.swift',
  '.m',
];

const EXACT_TEXT_FILES = ['makefile', 'dockerfile', 'procfile', 'rakefile'];

export const DEFAULT_IGNORE_PATTERNS = [
  /^\.git\//,
  /^node_modules\//,
  /^\.next\//,
  /^build\//,
  /^dist\//,
  /^coverage\//,
  /\.DS_Store$/i,
  /^\.env/i,
];

export const isTextFileName = (name: string): boolean => {
  const lowerName = name.toLowerCase();
  if (EXACT_TEXT_FILES.includes(lowerName)) {
    return true;
  }
  return TEXT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
};

export const shouldIgnorePath = (path: string): boolean =>
  DEFAULT_IGNORE_PATTERNS.some((pattern) => pattern.test(path));
