import {
  ChevronDown,
  ChevronRight,
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

const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFiles,
  onSelectFile,
  filterText,
  isLoading,
  filteredPaths,
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']));
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

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
      if (node.type === 'directory') {
        const hasMatchingDescendant = Object.values(node.children).some(
          (child) =>
            child.path.toLowerCase().includes(filterText.toLowerCase()) ||
            (child.type === 'directory' &&
              Object.values(child.children).some((gc) =>
                gc.path.toLowerCase().includes(filterText.toLowerCase()),
              )),
        );
        if (hasMatchingDescendant) {
          expanded.add(node.path);
        }
        Object.values(node.children).forEach(collectExpanded);
      }
    };
    collectExpanded(treeData);
    return expanded;
  }, [treeData, filterText]);

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

  // Build flat list of visible nodes for optimized rendering
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
          .forEach((child) => addNode(child, depth + 1));
      }
    };

    if (filteredAndSortedTree) {
      Object.values(filteredAndSortedTree.children)
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .forEach((node) => addNode(node, 0));
    }

    return nodes;
  }, [filteredAndSortedTree, filterText, filteredPaths, effectiveExpandedDirs]);

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {filterText.trim()
          ? 'No files match your filter.'
          : 'Please select a folder to view files.'}
      </div>
    );
  }

  if (!filteredAndSortedTree || visibleNodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {filterText
          ? 'No files or folders match your filter.'
          : 'Project is empty or contains no text files.'}
      </div>
    );
  }

  return (
    <div className="bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg p-3 space-y-1 max-h-[500px] overflow-y-auto ring-1 ring-neutral-200 dark:ring-neutral-700/50 shadow-inner">
      {visibleNodes.map((node) => {
        const isExpanded = effectiveExpandedDirs.has(node.path);
        const isSelected =
          node.type === 'file' ? selectedFiles.has(node.path) : false;
        const isHover = hoveredPath === node.path;

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

        const baseRowClasses =
          'flex items-center py-2 px-2.5 rounded-md transition-colors duration-100 cursor-pointer';
        const hoverClasses =
          'hover:bg-neutral-100 dark:hover:bg-neutral-800';
        const selectedClasses = isSelected
          ? 'bg-emerald-50 dark:bg-emerald-500/10'
          : '';
        const interactionDisabledClass = isLoading
          ? 'opacity-60 cursor-not-allowed'
          : '';

        return (
          <div
            key={node.path}
            style={{
              paddingLeft: `${node.depth * 1.5}rem`,
            }}
            onMouseEnter={() => setHoveredPath(node.path)}
            onMouseLeave={() => setHoveredPath(null)}
          >
            <div
              className={`${baseRowClasses} ${hoverClasses} ${selectedClasses} ${interactionDisabledClass}`}
            >
              {node.type === 'directory' ? (
                <>
                  <button
                    onClick={() => !isLoading && toggleDir(node.path)}
                    disabled={isLoading}
                    className="mr-1.5 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-500 dark:text-neutral-400"
                    aria-label={
                      isExpanded ? 'Collapse folder' : 'Expand folder'
                    }
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded ? (
                    <FolderOpenIcon className="h-4 w-4 text-sky-500 dark:text-sky-400 mr-2 flex-shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 text-sky-500 dark:text-sky-400 mr-2 flex-shrink-0" />
                  )}

                  {filesInCurrentFilteredDir.length > 0 && (
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
                        handleDirectoryCheckboxChange(
                          node,
                          e.target.checked,
                        )
                      }
                      className="mr-2 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-neutral-700 dark:checked:bg-emerald-600 dark:checked:border-emerald-600 shadow-sm transition-all"
                      disabled={isLoading}
                      aria-label={`Select all files in ${
                        node.name || 'Project Root'
                      }`}
                    />
                  )}
                  <span
                    className="text-sm text-neutral-700 dark:text-neutral-200 select-none truncate"
                    onClick={() => !isLoading && toggleDir(node.path)}
                  >
                    {node.name || 'Project Root'}
                  </span>
                </>
              ) : (
                <>
                  <span
                    style={{ width: `${1.5}rem` }}
                    className="mr-1.5 flex-shrink-0"
                  />
                  <FileText className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      !isLoading && onSelectFile(node.path, e.target.checked)
                    }
                    className="mr-2 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-neutral-700 dark:checked:bg-emerald-600 dark:checked:border-emerald-600 shadow-sm transition-all"
                    disabled={isLoading}
                    aria-label={`Select file ${node.name}`}
                  />
                  <span
                    className="text-sm text-neutral-700 dark:text-neutral-200 select-none truncate"
                    onClick={() =>
                      !isLoading && onSelectFile(node.path, !isSelected)
                    }
                  >
                    {node.name}
                  </span>
                  {(isHover || isSelected) && (
                    <span className="ml-auto pl-2 text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap select-none">
                      {(
                        (node.size! / 1024).toFixed(1) +
                        ' KB, ' +
                        node.lines +
                        ' lines'
                      ).replace(/\.0(?= KB)/, '')}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileTree;
