import {
  ChevronDown,
  ChevronRight,
  File,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen as FolderOpenIcon,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { FileSummary } from '../types/files';

interface TreeNode {
  name: string;
  path: string;
  children: Record<string, TreeNode>;
  type: 'file' | 'directory';
  size?: number;
  lines?: number;
  depth?: number;
}

interface FileTreeProps {
  files: FileSummary[];
  selectedFiles: Set<string>;
  onSelectFile: (path: string, selected: boolean) => void;
  filterText: string;
  isLoading: boolean;
  filteredPaths: string[];
}

const getFileVisual = (
  fileName: string,
): { Icon: typeof File; className: string } => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'ts' || extension === 'tsx') {
    return { Icon: FileCode2, className: 'text-sky-500 dark:text-sky-400' };
  }
  if (['js', 'jsx', 'mjs', 'cjs'].includes(extension)) {
    return { Icon: FileCode2, className: 'text-amber-500 dark:text-amber-400' };
  }
  if (extension === 'json') {
    return {
      Icon: FileJson,
      className: 'text-violet-500 dark:text-violet-400',
    };
  }
  if (['md', 'mdx', 'txt'].includes(extension)) {
    return {
      Icon: FileText,
      className: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  return { Icon: File, className: 'text-neutral-500 dark:text-neutral-400' };
};

const formatFileMeta = (node: TreeNode): string => {
  const lines = node.lines ?? 0;
  if (node.size === undefined) return `${lines.toLocaleString()} lines`;
  const size =
    node.size < 1024
      ? `${node.size} B`
      : node.size >= 1024 * 1024
        ? `${(node.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(node.size / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  return `${size} · ${lines.toLocaleString()} lines`;
};

const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFiles,
  onSelectFile,
  filterText,
  isLoading,
  filteredPaths,
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']));

  const treeData = useMemo(() => {
    const root: TreeNode = {
      name: '',
      path: '',
      children: {},
      type: 'directory',
    };

    files.forEach((file) => {
      const parts = file.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const path = parts.slice(0, i + 1).join('/');

        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path,
            children: {},
            type: 'directory',
          };
        }
        current = current.children[part];
      }

      const fileName = parts[parts.length - 1];
      current.children[fileName] = {
        name: fileName,
        path: file.path,
        children: {},
        type: 'file',
        size: file.size,
        lines: file.lines,
      };
    });

    return root;
  }, [files]);

  const autoExpandedDirs = useMemo(() => {
    if (filterText.trim() === '') return new Set(['']);

    const expanded = new Set<string>(['']);
    const collectExpanded = (node: TreeNode) => {
      if (node.type !== 'directory') return;
      if (
        node.path === '' ||
        filteredPaths.some((path) => path.startsWith(`${node.path}/`))
      ) {
        expanded.add(node.path);
      }
      Object.values(node.children).forEach(collectExpanded);
    };

    collectExpanded(treeData);
    return expanded;
  }, [treeData, filterText, filteredPaths]);

  const effectiveExpandedDirs = useMemo(() => {
    if (filterText.trim() === '') {
      return expandedDirs;
    }
    return new Set([...expandedDirs, ...autoExpandedDirs]);
  }, [autoExpandedDirs, expandedDirs, filterText]);

  const filteredAndSortedTree = useMemo(() => {
    const filterNode = (node: TreeNode): TreeNode | null => {
      const isVisibleDueToFilter =
        filterText.trim() === '' ||
        node.path.toLowerCase().includes(filterText.toLowerCase()) ||
        (node.type === 'directory' &&
          Object.values(node.children).some((child) =>
            filteredPaths.includes(child.path),
          ));

      if (node.type === 'file') {
        return isVisibleDueToFilter && filteredPaths.includes(node.path)
          ? node
          : null;
      }

      const visibleChildren: Record<string, TreeNode> = {};
      let hasVisibleChildren = false;
      Object.entries(node.children).forEach(([key, child]) => {
        const filteredChild = filterNode(child);
        if (filteredChild) {
          visibleChildren[key] = filteredChild;
          hasVisibleChildren = true;
        }
      });

      if (isVisibleDueToFilter || hasVisibleChildren) {
        return {
          ...node,
          children: visibleChildren,
        };
      }
      return null;
    };

    return filterNode(treeData);
  }, [treeData, filterText, filteredPaths]);

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const dirFileMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const build = (node: TreeNode) => {
      if (node.type === 'directory') {
        const files: string[] = [];
        Object.values(node.children).forEach((child) => {
          if (child.type === 'file') {
            if (filteredPaths.includes(child.path)) files.push(child.path);
          } else {
            build(child);
            const childFiles = map.get(child.path) ?? [];
            files.push(...childFiles);
          }
        });
        map.set(node.path, files);
      }
    };
    build(treeData);
    return map;
  }, [treeData, filteredPaths]);

  const getFilesInDirectory = (node: TreeNode): string[] =>
    dirFileMap.get(node.path) ?? [];

  const handleDirectoryCheckboxChange = (
    node: TreeNode,
    isChecked: boolean,
  ) => {
    const filesInDir = getFilesInDirectory(node);
    filesInDir.forEach((filePath) => {
      onSelectFile(filePath, isChecked);
    });
  };

  const visibleNodes = useMemo(() => {
    const nodes: (TreeNode & { depth: number })[] = [];
    const addNode = (node: TreeNode, depth = 0) => {
      if (
        !node ||
        (filterText.trim() !== '' &&
          !filteredPaths.some((p) => p.startsWith(node.path)) &&
          node.path !== '')
      ) {
        return;
      }

      nodes.push({ ...node, depth });

      if (
        node.type === 'directory' &&
        effectiveExpandedDirs.has(node.path) &&
        Object.keys(node.children).length > 0
      ) {
        Object.values(node.children)
          .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
          })
          .forEach((child) => {
            addNode(child, depth + 1);
          });
      }
    };

    if (filteredAndSortedTree) {
      Object.values(filteredAndSortedTree.children)
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .forEach((node) => {
          addNode(node, 0);
        });
    }

    return nodes;
  }, [filteredAndSortedTree, filterText, filteredPaths, effectiveExpandedDirs]);

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 px-6 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {filterText.trim()
          ? 'No files match your filter.'
          : 'Please select a folder to view files.'}
      </div>
    );
  }

  if (!filteredAndSortedTree || visibleNodes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 px-6 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {filterText
          ? 'No files or folders match your filter.'
          : 'Project is empty or contains no text files.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/40 dark:border-neutral-800 dark:bg-neutral-900/30">
      <div className="flex items-center justify-between border-b border-neutral-200/80 bg-white/60 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/50">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Files
        </span>
        <span className="text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400">
          {selectedFiles.size.toLocaleString()} selected
        </span>
      </div>

      <div className="max-h-[clamp(18rem,46vh,34rem)] space-y-0.5 overflow-y-auto p-1.5">
        {visibleNodes.map((node) => {
          const isExpanded = effectiveExpandedDirs.has(node.path);
          const isSelected =
            node.type === 'file' ? selectedFiles.has(node.path) : false;

          let dirCheckboxState: 'checked' | 'indeterminate' | 'unchecked' =
            'unchecked';
          let filesInCurrentFilteredDir: string[] = [];

          if (node.type === 'directory') {
            filesInCurrentFilteredDir = getFilesInDirectory(node);
            const selectedFilesInDirCount = filesInCurrentFilteredDir.filter(
              (p) => selectedFiles.has(p),
            ).length;

            if (filesInCurrentFilteredDir.length > 0) {
              if (
                selectedFilesInDirCount === filesInCurrentFilteredDir.length
              ) {
                dirCheckboxState = 'checked';
              } else if (selectedFilesInDirCount > 0) {
                dirCheckboxState = 'indeterminate';
              }
            }
          }

          const interactionDisabledClass = isLoading
            ? 'cursor-not-allowed opacity-60'
            : '';
          const selectedClasses = isSelected
            ? 'bg-emerald-50/80 dark:bg-emerald-500/10'
            : 'hover:bg-white/80 dark:hover:bg-neutral-800/60';
          const FileIcon =
            node.type === 'file' ? getFileVisual(node.name) : undefined;

          return (
            <div
              key={node.path}
              style={{ paddingLeft: `${node.depth * 1.1}rem` }}
            >
              <div
                className={`group flex items-center rounded-lg px-2 py-1.5 transition-colors duration-100 ${interactionDisabledClass} ${selectedClasses}`}
              >
                {node.type === 'directory' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => !isLoading && toggleDir(node.path)}
                      disabled={isLoading}
                      className="mr-1 flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700 disabled:cursor-not-allowed dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                      aria-label={
                        isExpanded ? 'Collapse folder' : 'Expand folder'
                      }
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronDown
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                      ) : (
                        <ChevronRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                      )}
                    </button>
                    {isExpanded ? (
                      <FolderOpenIcon
                        aria-hidden="true"
                        className="mr-1.5 h-4 w-4 flex-shrink-0 text-sky-500 dark:text-sky-400"
                      />
                    ) : (
                      <Folder
                        aria-hidden="true"
                        className="mr-1.5 h-4 w-4 flex-shrink-0 text-sky-500 dark:text-sky-400"
                      />
                    )}
                    <input
                      type="checkbox"
                      checked={dirCheckboxState === 'checked'}
                      ref={(input) => {
                        if (input)
                          input.indeterminate =
                            dirCheckboxState === 'indeterminate';
                      }}
                      onChange={(e) =>
                        !isLoading &&
                        handleDirectoryCheckboxChange(node, e.target.checked)
                      }
                      className="mr-2 h-4 w-4 cursor-pointer rounded border-neutral-300 focus:ring-emerald-500 focus:ring-offset-0 dark:border-neutral-600"
                      disabled={isLoading}
                      aria-label={`Select all files in ${
                        node.name || 'Project Root'
                      }`}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-neutral-700 select-none disabled:cursor-not-allowed dark:text-neutral-200"
                      onClick={() => !isLoading && toggleDir(node.path)}
                      disabled={isLoading}
                    >
                      {node.name}
                    </button>
                    <span className="ml-auto hidden pl-2 text-[10px] whitespace-nowrap text-neutral-600 group-hover:inline dark:text-neutral-400">
                      {filesInCurrentFilteredDir.length.toLocaleString()} files
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-1 h-5 w-5 flex-shrink-0" />
                    {FileIcon && (
                      <FileIcon.Icon
                        aria-hidden="true"
                        className={`mr-1.5 h-4 w-4 flex-shrink-0 ${FileIcon.className}`}
                      />
                    )}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        !isLoading && onSelectFile(node.path, e.target.checked)
                      }
                      className="mr-2 h-4 w-4 cursor-pointer rounded border-neutral-300 focus:ring-emerald-500 focus:ring-offset-0 dark:border-neutral-600"
                      disabled={isLoading}
                      aria-label={`Select file ${node.name}`}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-neutral-700 select-none disabled:cursor-not-allowed dark:text-neutral-200"
                      onClick={() =>
                        !isLoading && onSelectFile(node.path, !isSelected)
                      }
                      disabled={isLoading}
                    >
                      {node.name}
                    </button>
                    <span className="ml-auto hidden pl-2 text-[10px] whitespace-nowrap text-neutral-600 sm:inline dark:text-neutral-400">
                      {formatFileMeta(node)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileTree;
