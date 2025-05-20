import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Upload, Download } from 'lucide-react';
import Button from './ui/Button';

interface PresetManagerProps {
  folderHandle: FileSystemDirectoryHandle | null;
  selectedFiles: Set<string>;
  options: {
    includePreamble: boolean;
    preambleText: string;
    includeGoal: boolean;
    goalText: string;
    removeComments: boolean;
    minifyOutput: boolean;
  };
  onLoadPreset: (files: string[], options: any) => void;
  showMessage: (message: string, type: 'error' | 'success') => void;
}

interface Preset {
  files: string[];
  options: {
    includePreamble: boolean;
    preambleText: string;
    includeGoal: boolean;
    goalText: string;
    removeComments: boolean;
    minifyOutput: boolean;
  };
}

const PresetManager: React.FC<PresetManagerProps> = ({
  folderHandle,
  selectedFiles,
  options,
  onLoadPreset,
  showMessage
}) => {
  const [presetName, setPresetName] = useState<string>('');
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  
  useEffect(() => {
    // Load presets from localStorage
    const storedPresets = localStorage.getItem('presets');
    if (storedPresets) {
      try {
        setPresets(JSON.parse(storedPresets));
      } catch (err) {
        console.error('Error parsing stored presets:', err);
      }
    }
  }, []);
  
  const savePreset = () => {
    if (!presetName.trim()) {
      showMessage('Please enter a preset name', 'error');
      return;
    }
    
    if (!folderHandle) {
      showMessage('Please select a folder before saving a preset', 'error');
      return;
    }
    
    if (selectedFiles.size === 0) {
      showMessage('Please select at least one file to include in the preset', 'error');
      return;
    }
    
    const preset: Preset = {
      files: Array.from(selectedFiles),
      options: { ...options }
    };
    
    const updatedPresets = {
      ...presets,
      [presetName]: preset
    };
    
    setPresets(updatedPresets);
    localStorage.setItem('presets', JSON.stringify(updatedPresets));
    
    showMessage(`Preset "${presetName}" saved successfully!`, 'success');
    setPresetName('');
  };
  
  const loadPreset = () => {
    if (!selectedPreset) {
      showMessage('Please select a preset to load', 'error');
      return;
    }
    
    if (!folderHandle) {
      showMessage('Please select a folder before loading a preset', 'error');
      return;
    }
    
    const preset = presets[selectedPreset];
    if (!preset) {
      showMessage('Selected preset not found', 'error');
      return;
    }
    
    onLoadPreset(preset.files, preset.options);
    showMessage(`Preset "${selectedPreset}" loaded successfully!`, 'success');
  };
  
  const deletePreset = () => {
    if (!selectedPreset) {
      showMessage('Please select a preset to delete', 'error');
      return;
    }
    
    const updatedPresets = { ...presets };
    delete updatedPresets[selectedPreset];
    
    setPresets(updatedPresets);
    localStorage.setItem('presets', JSON.stringify(updatedPresets));
    
    showMessage(`Preset "${selectedPreset}" deleted successfully!`, 'success');
    setSelectedPreset('');
  };
  
  const exportPresets = () => {
    if (Object.keys(presets).length === 0) {
      showMessage('No presets to export', 'error');
      return;
    }
    
    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sourceprompt-presets.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage('Presets exported successfully!', 'success');
  };
  
  const importPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const importedPresets = JSON.parse(result);
          
          // Validate format
          let valid = true;
          for (const [key, preset] of Object.entries(importedPresets)) {
            const p = preset as any;
            if (!p.files || !Array.isArray(p.files) || !p.options) {
              valid = false;
              break;
            }
          }
          
          if (!valid) {
            showMessage('Invalid preset format in the imported file', 'error');
          } else {
            setPresets(importedPresets);
            localStorage.setItem('presets', JSON.stringify(importedPresets));
            showMessage('Presets imported successfully!', 'success');
          }
        }
      } catch (err) {
        showMessage('Error importing presets: Invalid JSON file', 'error');
      }
      
      // Clear the input
      e.target.value = '';
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Save className="w-5 h-5 mr-2 text-purple-500" />
          Presets
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        {!folderHandle && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-sm">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Please select a folder first to use presets.</span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label htmlFor="presetName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Save Current Selection
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="presetName"
                placeholder="Enter preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!folderHandle}
              />
              <Button
                onClick={savePreset}
                icon={<Save className="h-4 w-4" />}
                disabled={!folderHandle || !presetName.trim() || selectedFiles.size === 0}
                accent
              >
                Save
              </Button>
            </div>
          </div>
          
          <div>
            <label htmlFor="presetSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Load Preset
            </label>
            <div className="flex space-x-3">
              <select
                id="presetSelect"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!folderHandle || Object.keys(presets).length === 0}
              >
                <option value="">Select a preset</option>
                {Object.keys(presets).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <Button
                onClick={loadPreset}
                icon={<FolderOpen className="h-4 w-4" />}
                disabled={!folderHandle || !selectedPreset}
                accent
              >
                Load
              </Button>
              <Button
                onClick={deletePreset}
                icon={<Trash2 className="h-4 w-4" />}
                disabled={!selectedPreset}
                danger
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={exportPresets}
              icon={<Download className="h-4 w-4" />}
              disabled={Object.keys(presets).length === 0}
              secondary
              className="flex-1"
            >
              Export Presets
            </Button>
            
            <div className="flex-1 relative">
              <Button
                icon={<Upload className="h-4 w-4" />}
                secondary
                className="w-full"
                onClick={() => document.getElementById('importPresetsInput')?.click()}
              >
                Import Presets
              </Button>
              <input
                type="file"
                id="importPresetsInput"
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                accept=".json"
                onChange={importPresets}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// This is needed to avoid TypeScript error for the AlertTriangle component
const AlertTriangle = ({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    {...props}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default PresetManager;