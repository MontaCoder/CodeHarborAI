import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import FileSelector from './FileSelector';
import OutputPanel from './OutputPanel';
import OptionsPanel from './OptionsPanel';
import PresetManager from './PresetManager';
import StatsPanel from './StatsPanel';
import MessageDisplay from './ui/MessageDisplay';

const MainApp: React.FC = () => {
  const { toggleTheme, theme } = useTheme();
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileHandles, setFileHandles] = useState<Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [totalLines, setTotalLines] = useState<number>(0);
  const [options, setOptions] = useState({
    includePreamble: false,
    preambleText: '',
    includeGoal: false,
    goalText: '',
    removeComments: false,
    minifyOutput: false
  });

  useEffect(() => {
    // Calculate total size and lines whenever selected files change
    let size = 0;
    let lines = 0;
    
    fileHandles.forEach(file => {
      if (selectedFiles.has(file.path)) {
        size += file.size;
        lines += file.lines;
      }
    });
    
    setTotalSize(size);
    setTotalLines(lines);
  }, [selectedFiles, fileHandles]);

  const handleFilesSelected = (files: Array<{handle: FileSystemFileHandle, path: string, size: number, lines: number}>) => {
    setFileHandles(files);
  };

  const handleFolderSelected = (handle: FileSystemDirectoryHandle) => {
    setFolderHandle(handle);
  };

  const handleSelectFile = (path: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(path);
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  };

  const handleSelectAll = (paths: string[]) => {
    setSelectedFiles(new Set(paths));
  };

  const showMessage = (text: string, type: 'error' | 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCombine = async () => {
    if (selectedFiles.size === 0) {
      showMessage('Please select at least one file', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would contain the actual logic to combine files
      // For now we'll simulate a delay and set sample output
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let outputText = '';
      
      if (options.includePreamble && options.preambleText.trim()) {
        outputText += options.preambleText.trim() + '\n\n';
      }
      
      if (options.includeGoal && options.goalText.trim()) {
        outputText += "Goal:\n" + options.goalText.trim() + '\n\n';
      }
      
      // Add project structure
      outputText += "Project Structure:\n";
      outputText += "└── Project (Size: " + (totalSize / 1024).toFixed(2) + "kb; Lines: " + totalLines + ")\n";
      
      // Add file contents
      for (const filePath of selectedFiles) {
        const fileHandle = fileHandles.find(f => f.path === filePath);
        if (fileHandle) {
          const file = await fileHandle.handle.getFile();
          let content = await file.text();
          
          // Apply transformations if options are set
          if (options.removeComments) {
            // In a real implementation, this would properly remove comments
            content = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
          }
          
          if (options.minifyOutput) {
            // In a real implementation, this would properly minify the content
            content = content.replace(/\s+/g, ' ').trim();
          }
          
          outputText += `\n---\n${filePath}\n---\n${content}\n`;
        }
      }
      
      setOutput(outputText);
      setShowOutput(true);
      showMessage('Files combined successfully!', 'success');
    } catch (error) {
      showMessage(`Error combining files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
            title="Return to landing page"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">SourcePrompt</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {folderHandle && (
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline-block">
              Selected: {folderHandle.name}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {message && (
        <MessageDisplay message={message.text} type={message.type} />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <FileSelector 
              onFolderSelected={handleFolderSelected}
              onFilesSelected={handleFilesSelected}
              onSelectFile={handleSelectFile}
              onSelectAll={handleSelectAll}
              selectedFiles={selectedFiles}
              isLoading={isLoading}
            />
            
            <div className="sticky bottom-6 flex justify-center">
              <button
                onClick={handleCombine}
                disabled={selectedFiles.size === 0 || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Combine Selected Files</span>
                )}
              </button>
            </div>
            
            {showOutput && (
              <OutputPanel output={output} />
            )}
          </div>
          
          <div className="space-y-6">
            <StatsPanel 
              totalSize={totalSize} 
              totalLines={totalLines} 
            />
            
            <OptionsPanel 
              options={options}
              onChange={handleOptionChange}
            />
            
            <PresetManager
              folderHandle={folderHandle}
              selectedFiles={selectedFiles}
              options={options}
              onLoadPreset={(files, opts) => {
                setSelectedFiles(new Set(files));
                setOptions(opts);
              }}
              showMessage={showMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;