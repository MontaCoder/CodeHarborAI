import React, { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';

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
  disabled: boolean;
}

const FileTree: React.FC<FileTreeProps> = ({ 
  files, 
  selectedFiles, 
  onSelectFile, 
  filterText,
  disabled
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([''])); // Root is expanded by default
  
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
  const filteredTree = useMemo(() => {
    if (!filterText.trim()) return treeData;
    
    const shouldInclude = (node: TreeNode): boolean => {
      // Include if node name matches filter
      if (node.name.toLowerCase().includes(filterText.toLowerCase())) return true;
      
      // For directories, check if any children match
      if (node.type === 'directory') {
        return Object.values(node.children).some(child => shouldInclude(child));
      }
      
      return false;
    };
    
    const filterNode = (node: TreeNode): TreeNode | null => {
      if (node.type === 'file') {
        return shouldInclude(node) ? node : null;
      }
      
      // Filter children
      const filteredChildren: Record<string, TreeNode> = {};
      let hasChildren = false;
      
      Object.entries(node.children).forEach(([key, child]) => {
        const filteredChild = filterNode(child);
        if (filteredChild) {
          filteredChildren[key] = filteredChild;
          hasChildren = true;
          
          // Auto-expand directories that have matching children
          if (child.type === 'directory') {
            setExpandedDirs(prev => {
              const newSet = new Set(prev);
              newSet.add(child.path);
              return newSet;
            });
          }
        }
      });
      
      // Include directory if it matches the filter or has matching children
      if (shouldInclude(node) || hasChildren) {
        return {
          ...node,
          children: filteredChildren
        };
      }
      
      return null;
    };
    
    const filtered = filterNode(treeData);
    return filtered || { name: '', path: '', children: {}, type: 'directory' };
  }, [treeData, filterText]);
  
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
  
  const toggleDirSelection = (node: TreeNode, selected: boolean) => {
    // Select all files in this directory and subdirectories
    const selectFilesInDir = (dirNode: TreeNode) => {
      Object.values(dirNode.children).forEach(child => {
        if (child.type === 'file') {
          onSelectFile(child.path, selected);
        } else {
          selectFilesInDir(child);
        }
      });
    };
    
    selectFilesInDir(node);
  };
  
  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    const nodeHasFiles = node.type === 'directory' && Object.values(node.children).some(child => child.type === 'file');
    
    // For directories, check if all files are selected
    const dirAllSelected = 
      node.type === 'directory' && 
      nodeHasFiles && 
      Object.values(node.children).every(child => {
        if (child.type === 'file') return selectedFiles.has(child.path);
        // Recursively check subdirectories
        const allFilesInDir = (dirNode: TreeNode): string[] => {
          let files: string[] = [];
          Object.values(dirNode.children).forEach(child => {
            if (child.type === 'file') files.push(child.path);
            else files = [...files, ...allFilesInDir(child)];
          });
          return files;
        };
        
        const files = allFilesInDir(child);
        return files.length > 0 && files.every(f => selectedFiles.has(f));
      });
    
    return (
      <div 
        key={node.path} 
        className={`py-1 ${node.type === 'directory' ? 'font-medium' : ''}`}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        <div className="flex items-center">
          {node.type === 'directory' ? (
            <>
              <button 
                onClick={() => toggleDir(node.path)}
                disabled={disabled}
                className="mr-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              <Folder className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
              
              {nodeHasFiles && (
                <input
                  type="checkbox"
                  checked={dirAllSelected}
                  onChange={e => toggleDirSelection(node, e.target.checked)}
                  className="mr-2 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:checked:bg-emerald-500"
                  disabled={disabled}
                />
              )}
              
              <span className="text-gray-700 dark:text-gray-300">{node.name || 'Project Root'}</span>
            </>
          ) : (
            <>
              <div className="w-4"></div>
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              
              <input
                type="checkbox"
                checked={selectedFiles.has(node.path)}
                onChange={e => onSelectFile(node.path, e.target.checked)}
                className="mr-2 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:checked:bg-emerald-500"
                disabled={disabled}
              />
              
              <span className="text-gray-700 dark:text-gray-300">
                {node.name} 
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  ({(node.size! / 1024).toFixed(2)} KB | {node.lines} lines)
                </span>
              </span>
            </>
          )}
        </div>
        
        {node.type === 'directory' && isExpanded && (
          <div>
            {Object.values(node.children)
              .sort((a, b) => {
                // Sort directories first, then files
                if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                // Then alphabetically
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
    <div className="max-h-96 overflow-y-auto font-mono text-sm">
      {renderNode(filteredTree)}
    </div>
  );
};

export default FileTree;