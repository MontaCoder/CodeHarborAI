import React, { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen as FolderOpenIcon } from 'lucide-react';

interface TreeNode {
  name: string;
  path: string;
  children: Record<string, TreeNode>;
  type: 'file' | 'directory';
  size?: number;
  lines?: number;
  isExpanded?: boolean;
}

interface FileTreeProps {
  files: Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>;
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
  filteredPaths
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([''])); // Root is expanded by default
  const [hoveredPath, setHoveredPath] = useState<string | null>(null); // For hover effects
  
  const treeData = useMemo(() => {
    const root: TreeNode = { 
      name: '', 
      path: '', 
      children: {}, 
      type: 'directory',
      isExpanded: true
    };
    
    // Build tree structure
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      
      // Process directories in the path
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const path = parts.slice(0, i + 1).join('/');
        
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path,
            children: {},
            type: 'directory'
          };
        }
        current = current.children[part];
      }
      
      // Add the file
      const fileName = parts[parts.length - 1];
      current.children[fileName] = {
        name: fileName,
        path: file.path,
        children: {},
        type: 'file',
        size: file.size,
        lines: file.lines
      };
    });
    
    return root;
  }, [files]);
  
  // Filter the tree based on the filter text
  const filteredAndSortedTree = useMemo(() => {
    const filterNode = (node: TreeNode, currentPath: string): TreeNode | null => {
      const isVisibleDueToFilter = filterText.trim() === '' || 
                                   node.path.toLowerCase().includes(filterText.toLowerCase()) ||
                                   (node.type === 'directory' && Object.values(node.children).some(child => filteredPaths.includes(child.path)));
      
      if (node.type === 'file') {
        return isVisibleDueToFilter && filteredPaths.includes(node.path) ? node : null;
      }

      const visibleChildren: Record<string, TreeNode> = {};
      let hasVisibleChildren = false;
      Object.entries(node.children).forEach(([key, child]) => {
        const filteredChild = filterNode(child, `${currentPath}/${child.name}`);
        if (filteredChild) {
          visibleChildren[key] = filteredChild;
          hasVisibleChildren = true;
        }
      });

      if (isVisibleDueToFilter || hasVisibleChildren) {
        // Auto-expand directories if they or their children match the filter
        if (filterText.trim() !== '' && (node.name.toLowerCase().includes(filterText.toLowerCase()) || hasVisibleChildren)) {
          setExpandedDirs(prev => new Set(prev).add(node.path));
        }
        return {
          ...node,
          children: visibleChildren,
        };
      }
      return null;
    };

    return filterNode(treeData, '');
  }, [treeData, filterText, filteredPaths]);
  
  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };
  
  const getFilesInDirectory = (node: TreeNode): string[] => {
    let paths: string[] = [];
    Object.values(node.children).forEach(child => {
      if (child.type === 'file') {
        if(filteredPaths.includes(child.path)) paths.push(child.path);
      } else {
        paths = [...paths, ...getFilesInDirectory(child)];
      }
    });
    return paths;
  };
  
  const handleDirectoryCheckboxChange = (node: TreeNode, isChecked: boolean) => {
    const filesInDir = getFilesInDirectory(node);
    filesInDir.forEach(filePath => {
      onSelectFile(filePath, isChecked);
    });
  };
  
  const renderNode = (node: TreeNode, depth = 0): React.ReactElement | null => {
    if (!node || (filterText.trim() !== '' && !filteredPaths.some(p => p.startsWith(node.path)) && node.path !== '') || isLoading) {
        // If there's a filter and the node itself nor any of its children are in filteredPaths, don't render (unless it's the root)
        return null;
    }
    
    const isExpanded = expandedDirs.has(node.path);
    const isSelected = node.type === 'file' ? selectedFiles.has(node.path) : false;
    const isHover = hoveredPath === node.path;

    let dirCheckboxState: 'checked' | 'indeterminate' | 'unchecked' = 'unchecked';
    let filesInCurrentFilteredDir: string[] = [];

    if (node.type === 'directory') {
      filesInCurrentFilteredDir = getFilesInDirectory(node);
      const selectedFilesInDirCount = filesInCurrentFilteredDir.filter(p => selectedFiles.has(p)).length;

      if (filesInCurrentFilteredDir.length > 0) {
        if (selectedFilesInDirCount === filesInCurrentFilteredDir.length) {
          dirCheckboxState = 'checked';
        } else if (selectedFilesInDirCount > 0) {
          dirCheckboxState = 'indeterminate';
        }
      } else {
        // No filterable files in this dir, so checkbox is effectively disabled/unchecked
        dirCheckboxState = 'unchecked';
      }
    }

    const baseRowClasses = "flex items-center py-2 px-2.5 rounded-md transition-colors duration-100 cursor-pointer";
    const hoverClasses = "hover:bg-neutral-100 dark:hover:bg-neutral-800";
    const selectedClasses = isSelected ? "bg-emerald-50 dark:bg-emerald-500/10" : "";
    const interactionDisabledClass = isLoading ? "opacity-60 cursor-not-allowed" : "";

    return (
      <div 
        key={node.path}
        style={{ paddingLeft: `${depth * 1.5}rem` }} // Increased indent slightly
        onMouseEnter={() => setHoveredPath(node.path)}
        onMouseLeave={() => setHoveredPath(null)}
      >
        <div className={`${baseRowClasses} ${hoverClasses} ${selectedClasses} ${interactionDisabledClass}`}>
          {node.type === 'directory' ? (
            <>
              <button 
                onClick={() => !isLoading && toggleDir(node.path)}
                disabled={isLoading}
                className="mr-1.5 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-500 dark:text-neutral-400"
                aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isExpanded ? <FolderOpenIcon className="h-4 w-4 text-sky-500 dark:text-sky-400 mr-2 flex-shrink-0" /> : <Folder className="h-4 w-4 text-sky-500 dark:text-sky-400 mr-2 flex-shrink-0" />}
              
              {filesInCurrentFilteredDir.length > 0 && (
                <input
                  type="checkbox"
                  checked={dirCheckboxState === 'checked'}
                  ref={input => { // For indeterminate state
                    if (input) input.indeterminate = dirCheckboxState === 'indeterminate';
                  }}
                  onChange={(e) => !isLoading && handleDirectoryCheckboxChange(node, e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-neutral-700 dark:checked:bg-emerald-600 dark:checked:border-emerald-600 shadow-sm transition-all"
                  disabled={isLoading}
                  aria-label={`Select all files in ${node.name || 'Project Root'}`}
                />
              )}
              <span className="text-sm text-neutral-700 dark:text-neutral-200 select-none truncate" onClick={() => !isLoading && toggleDir(node.path)}>
                {node.name || 'Project Root'}
              </span>
            </>
          ) : (
            <>
              <span style={{ width: `${1.5}rem` }} className="mr-1.5 flex-shrink-0"></span> {/* Spacer for file icon alignment */}
              <FileText className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2 flex-shrink-0" />
              <input
                type="checkbox"
                checked={isSelected}
                onChange={e => !isLoading && onSelectFile(node.path, e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-neutral-700 dark:checked:bg-emerald-600 dark:checked:border-emerald-600 shadow-sm transition-all"
                disabled={isLoading}
                aria-label={`Select file ${node.name}`}
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-200 select-none truncate" onClick={() => !isLoading && onSelectFile(node.path, !isSelected)}>
                {node.name}
              </span>
              {(isHover || isSelected) && (
                <span className="ml-auto pl-2 text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap select-none">
                  ({(node.size! / 1024).toFixed(1)} KB, {node.lines} lines)
                </span>
              )}
            </>
          )}
        </div>
        
        {node.type === 'directory' && isExpanded && (
          <div className="mt-0.5">
            {Object.values(node.children)
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map(child => renderNode(child, depth + 1))
            }
          </div>
        )}
      </div>
    );
  };
  
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {filterText.trim() ? 
          'No files match your filter.' : 
          'Please select a folder to view files.'}
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg p-3 space-y-1 max-h-[500px] overflow-y-auto ring-1 ring-neutral-200 dark:ring-neutral-700/50 shadow-inner">
      {filteredAndSortedTree && Object.keys(filteredAndSortedTree.children).length > 0 ? (
        Object.values(filteredAndSortedTree.children)
          .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
          })
          .map(node => renderNode(node, 0))
      ) : (
        <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 py-8 px-4">
          {filterText ? "No files or folders match your filter." : (files.length === 0 ? "No files loaded." : "Project is empty or contains no text files.")}
        </p>
      )}
    </div>
  );
};

export default FileTree;