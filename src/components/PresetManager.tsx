import React, { useState, useEffect, useRef, memo } from 'react';
import { Save, FolderOpen, Trash2, Upload, Download, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
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
  onLoadPreset: (files: string[], options: {
    includePreamble: boolean;
    preambleText: string;
    includeGoal: boolean;
    goalText: string;
    removeComments: boolean;
    minifyOutput: boolean;
  }) => void;
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

const PresetManager: React.FC<PresetManagerProps> = memo(({
  folderHandle,
  selectedFiles,
  options,
  onLoadPreset,
  showMessage
}) => {
  const [presetName, setPresetName] = useState<string>('');
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const importFileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const storedPresets = localStorage.getItem('presets');
    if (storedPresets) {
      try {
        setPresets(JSON.parse(storedPresets));
      } catch (err) {
        console.error('Error parsing stored presets:', err);
        showMessage('Error loading presets from storage.', 'error');
      }
    }
  }, [showMessage]);
  
  const savePreset = () => {
    if (!presetName.trim()) {
      showMessage('Please enter a name for the preset.', 'error');
      return;
    }
    if (!folderHandle) {
      showMessage('A folder must be selected to save a preset.', 'error');
      return;
    }
    if (selectedFiles.size === 0) {
      showMessage('Select at least one file for the preset.', 'error');
      return;
    }
    const newPreset: Preset = { files: Array.from(selectedFiles), options: { ...options } };
    const updatedPresets = { ...presets, [presetName]: newPreset };
    setPresets(updatedPresets);
    localStorage.setItem('presets', JSON.stringify(updatedPresets));
    showMessage(`Preset "${presetName}" saved.`, 'success');
    setPresetName('');
  };
  
  const loadPreset = () => {
    if (!selectedPreset) {
      showMessage('Select a preset to load.', 'error');
      return;
    }
    if (!presets[selectedPreset]) {
      showMessage('Selected preset not found.', 'error');
      return;
    }
    onLoadPreset(presets[selectedPreset].files, presets[selectedPreset].options);
    showMessage(`Preset "${selectedPreset}" loaded.`, 'success');
  };
  
  const deletePreset = () => {
    if (!selectedPreset) {
      showMessage('Select a preset to delete.', 'error');
      return;
    }
    if (!presets[selectedPreset]) {
      showMessage('Selected preset not found.', 'error');
      return;
    }
    const updatedPresets = { ...presets };
    delete updatedPresets[selectedPreset];
    setPresets(updatedPresets);
    localStorage.setItem('presets', JSON.stringify(updatedPresets));
    showMessage(`Preset "${selectedPreset}" deleted.`, 'success');
    setSelectedPreset('');
  };
  
  const exportPresets = () => {
    if (Object.keys(presets).length === 0) {
      showMessage('No presets to export.', 'error');
      return;
    }
    const dataStr = JSON.stringify(presets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CodeHarborAI-presets.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('Presets exported successfully.', 'success');
  };
  
  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };
  
  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        try {
          const imported = JSON.parse(text);
          let isValid = true;
          for (const key in imported) {
            if (typeof imported[key] !== 'object' || !imported[key].files || !imported[key].options) {
              isValid = false;
              break;
            }
          }
          if (isValid) {
            setPresets(imported);
            localStorage.setItem('presets', JSON.stringify(imported));
            showMessage('Presets imported successfully.', 'success');
          } else {
            showMessage('Invalid preset file format.', 'error');
          }
        } catch {
          showMessage('Failed to parse preset file. Ensure it is valid JSON.', 'error');
        }
      }
      if (importFileInputRef.current) importFileInputRef.current.value = '';
    };
    reader.onerror = () => {
      showMessage('Error reading file.', 'error');
      if (importFileInputRef.current) importFileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const inputBaseClasses = "w-full py-2.5 px-4 border-0 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 rounded-lg bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-150 text-sm placeholder-slate-400 dark:placeholder-slate-500 shadow-sm disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800/30";
  const labelBaseClasses = "block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center">
        <Save className="w-5 h-5 mr-2.5 text-purple-500 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Manage Presets</h2>
      </div>
      
      {!folderHandle && (
        <div className="flex items-start space-x-2.5 text-sm text-amber-700 dark:text-amber-300 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-500/40">
          <AlertTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
          <span className="leading-snug">Please select a project folder first to enable preset functionality. Presets are folder-specific.</span>
        </div>
      )}
      
      <div className={`space-y-5 ${!folderHandle ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <label htmlFor="presetNameInput" className={labelBaseClasses}>
            Save Current Configuration as Preset
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              id="presetNameInput"
              placeholder="Enter preset name (e.g., React Frontend)"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className={`${inputBaseClasses} flex-grow`}
              disabled={!folderHandle}
            />
            <Button
              onClick={savePreset}
              icon={<Save className="h-4 w-4" />}
              disabled={!folderHandle || !presetName.trim() || selectedFiles.size === 0}
              accent
              className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
            >
              Save Preset
            </Button>
          </div>
        </div>
        
        {Object.keys(presets).length > 0 && (
          <div>
            <label htmlFor="presetSelector" className={labelBaseClasses}>
              Load or Delete Existing Preset
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <select
                  id="presetSelector"
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className={`${inputBaseClasses} appearance-none pr-10`}
                  disabled={!folderHandle || Object.keys(presets).length === 0}
                >
                  <option value="" disabled>Select a preset to load...</option>
                  {Object.keys(presets).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <FolderOpen className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <Button
                onClick={loadPreset}
                icon={<Download className="h-4 w-4" />}
                disabled={!folderHandle || !selectedPreset || !presets[selectedPreset]}
                primary
                className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
              >
                Load
              </Button>
              <Button
                onClick={deletePreset}
                icon={<Trash2 className="h-4 w-4" />}
                disabled={!folderHandle || !selectedPreset || !presets[selectedPreset]}
                danger
                className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 space-y-3 sm:space-y-0 sm:flex sm:gap-3">
          <Button 
            onClick={exportPresets}
            icon={<Upload className="h-4 w-4" />} 
            secondary
            className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
            disabled={Object.keys(presets).length === 0}
          >
            Export All Presets
          </Button>
          <Button 
            onClick={handleImportClick}
            icon={<Download className="h-4 w-4" />} 
            secondary
            className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
          >
            Import Presets from File
          </Button>
          <input 
            type="file" 
            accept=".json" 
            onChange={importPresets} 
            ref={importFileInputRef} 
            className="hidden" 
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
});

export default PresetManager;