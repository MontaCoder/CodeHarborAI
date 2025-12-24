import type { LocalFileEntry } from '../types/files';
import { isTextFileName, shouldIgnorePath } from '../utils/fileFilters';

const countLines = (content: string): number => content.split(/\r?\n/).length;

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

const hasGitignoreFile = async (
  dirHandle: FileSystemDirectoryHandle,
): Promise<boolean> => {
  try {
    await dirHandle.getFileHandle('.gitignore');
    return true;
  } catch {
    return false;
  }
};

export const scanLocalDirectory = async (
  handle: FileSystemDirectoryHandle,
): Promise<{ files: LocalFileEntry[]; hasGitignore: boolean }> => {
  const files: LocalFileEntry[] = [];
  const hasGitignore = await hasGitignoreFile(handle);

  const walk = async (
    dirHandle: FileSystemDirectoryHandle,
    currentPath = '',
  ): Promise<void> => {
    // @ts-expect-error File System Access API may not be fully typed in all environments
    for await (const entry of dirHandle.values()) {
      const entryPath = currentPath
        ? `${currentPath}/${entry.name}`
        : entry.name;

      if (shouldIgnorePath(entryPath)) continue;

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

  return { files, hasGitignore };
};

export const readLocalFile = async (entry: LocalFileEntry): Promise<string> => {
  const file = await entry.handle.getFile();
  return file.text();
};
