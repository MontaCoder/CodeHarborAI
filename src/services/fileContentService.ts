import ignore, { type Ignore } from 'ignore';
import type { LocalFileEntry, LocalScanIgnoreInfo } from '../types/files';
import { isTextFileName, shouldIgnorePath } from '../utils/fileFilters';

const countLines = (content: string): number =>
  content === '' ? 0 : content.split(/\r?\n/).length;

export const getFileMeta = async (
  fileHandle: FileSystemFileHandle,
): Promise<{ size: number; lines: number }> => {
  const file = await fileHandle.getFile();
  const size = file.size;

  if (!isTextFileName(fileHandle.name)) {
    return { size, lines: 0 };
  }

  const text = await file.text();
  return { size, lines: countLines(text) };
};

const readRootGitignore = async (
  dirHandle: FileSystemDirectoryHandle,
): Promise<string | null> => {
  try {
    const gitignoreHandle = await dirHandle.getFileHandle('.gitignore');
    const gitignoreFile = await gitignoreHandle.getFile();
    return gitignoreFile.text();
  } catch {
    return null;
  }
};

const createIgnoreMatcher = (content: string | null): Ignore | null => {
  if (!content?.trim()) {
    return null;
  }

  return ignore().add(content);
};

const isIgnoredByRootGitignore = (
  matcher: Ignore | null,
  path: string,
  kind: 'file' | 'directory',
): boolean => {
  if (!matcher) {
    return false;
  }

  if (matcher.ignores(path)) {
    return true;
  }

  return kind === 'directory' ? matcher.ignores(`${path}/`) : false;
};

export const scanLocalDirectory = async (
  handle: FileSystemDirectoryHandle,
): Promise<{ files: LocalFileEntry[]; ignoreInfo: LocalScanIgnoreInfo }> => {
  const files: LocalFileEntry[] = [];
  const rootGitignore = await readRootGitignore(handle);
  const rootIgnoreMatcher = createIgnoreMatcher(rootGitignore);
  let ignoredCount = 0;

  const walk = async (
    dirHandle: FileSystemDirectoryHandle,
    currentPath = '',
  ): Promise<void> => {
    for await (const entry of dirHandle.values()) {
      const entryPath = currentPath
        ? `${currentPath}/${entry.name}`
        : entry.name;

      if (
        shouldIgnorePath(entryPath) ||
        isIgnoredByRootGitignore(rootIgnoreMatcher, entryPath, entry.kind)
      ) {
        ignoredCount++;
        continue;
      }

      if (entry.kind === 'file') {
        if (!isTextFileName(entry.name)) continue;

        const meta = await getFileMeta(entry as FileSystemFileHandle);
        files.push({
          handle: entry as FileSystemFileHandle,
          path: entryPath,
          size: meta.size,
          lines: meta.lines,
        });
      } else if (entry.kind === 'directory') {
        await walk(entry as FileSystemDirectoryHandle, entryPath);
      }
    }
  };

  await walk(handle);

  return {
    files,
    ignoreInfo: {
      usedRootGitignore: rootIgnoreMatcher !== null,
      ignoredCount,
    },
  };
};

export const readLocalFile = async (entry: LocalFileEntry): Promise<string> => {
  const file = await entry.handle.getFile();
  return file.text();
};

export const scanMockDirectory = async (
  filesList: File[],
  folderName: string,
): Promise<{ files: LocalFileEntry[]; ignoreInfo: LocalScanIgnoreInfo }> => {
  const prefix = `${folderName}/`;

  // Find the root .gitignore file
  const rootGitignoreFile = filesList.find((f) => {
    const relPath = f.webkitRelativePath.startsWith(prefix)
      ? f.webkitRelativePath.slice(prefix.length)
      : f.webkitRelativePath;
    return relPath === '.gitignore';
  });

  let rootGitignore: string | null = null;
  if (rootGitignoreFile) {
    rootGitignore = await rootGitignoreFile.text();
  }

  const rootIgnoreMatcher = createIgnoreMatcher(rootGitignore);
  let ignoredCount = 0;
  const files: LocalFileEntry[] = [];

  for (const file of filesList) {
    const entryPath = file.webkitRelativePath.startsWith(prefix)
      ? file.webkitRelativePath.slice(prefix.length)
      : file.webkitRelativePath;

    // Check if path is ignored (e.g., standard directories like .git or node_modules)
    if (
      shouldIgnorePath(entryPath) ||
      isIgnoredByRootGitignore(rootIgnoreMatcher, entryPath, 'file')
    ) {
      ignoredCount++;
      continue;
    }

    if (!isTextFileName(file.name)) continue;

    const size = file.size;
    const text = await file.text();
    const lines = countLines(text);

    // Mock FileSystemFileHandle
    const mockFileHandle = {
      kind: 'file' as const,
      name: file.name,
      getFile: async () => file,
    } as unknown as FileSystemFileHandle;

    files.push({
      handle: mockFileHandle,
      path: entryPath,
      size,
      lines,
    });
  }

  return {
    files,
    ignoreInfo: {
      usedRootGitignore: rootIgnoreMatcher !== null,
      ignoredCount,
    },
  };
};
