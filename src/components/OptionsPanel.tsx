import React, { memo } from 'react';
import { Settings, MessageSquare, Minimize, ChevronDown, Edit3 } from 'lucide-react';
import TemplateSelector from './TemplateSelector';

interface OptionsPanelProps {
  options: {
    includePreamble: boolean;
    preambleText: string;
    includeGoal: boolean;
    goalText: string;
    removeComments: boolean;
    minifyOutput: boolean;
  };
  onChange: (key: string, value: string | boolean) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = memo(({ options, onChange }) => {
  
  const handleTemplateApply = (templateData: {
    preambleText: string;
    goalText: string;
    includePreamble: boolean;
    includeGoal: boolean;
  }) => {
    onChange('preambleText', templateData.preambleText);
    onChange('goalText', templateData.goalText);
    onChange('includePreamble', templateData.includePreamble);
    onChange('includeGoal', templateData.includeGoal);
  };

  const inputBaseClasses = "w-full py-2 px-3.5 border-0 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 rounded-lg bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-inset focus:ring-sky-500 transition-all duration-150 text-sm placeholder-slate-400 dark:placeholder-slate-500 shadow-sm disabled:opacity-60";
  const checkboxBaseClasses = "h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 bg-white dark:bg-slate-700 dark:checked:bg-sky-600 dark:checked:border-sky-600 shadow-sm transition-all cursor-pointer";
  const labelBaseClasses = "text-sm font-medium text-slate-700 dark:text-slate-200 select-none cursor-pointer";

  const preambleOptions = [
    { value: 'custom', label: '✨ Write Custom Preamble' },
    { value: 'The following are the complete project code files for my application.', label: 'Complete project code' },
    { value: 'Below is a comprehensive collection of the project\'s source files.', label: 'Comprehensive source files' },
    { value: 'Here are the selected files from my project that I need help with.', label: 'Selected files for assistance' },
  ];

  const isCustomPreamble = !preambleOptions.slice(1).some(opt => opt.value === options.preambleText);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center">
        <Settings className="w-5 h-5 mr-2.5 text-sky-500 dark:text-sky-400" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Output Configuration</h2>
      </div>
      
      <div className="space-y-5">
        {/* Template Selector */}
        <TemplateSelector onTemplateApply={handleTemplateApply} />
        
        {/* Preamble Section */}
        <div className="space-y-2.5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 ring-1 ring-slate-200 dark:ring-slate-700/50">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includePreamble"
              checked={options.includePreamble}
              onChange={e => onChange('includePreamble', e.target.checked)}
              className={checkboxBaseClasses}
            />
            <label htmlFor="includePreamble" className={`ml-2.5 ${labelBaseClasses}`}>Include Preamble Statement</label>
          </div>
          
          {options.includePreamble && (
            <div className="pl-7 space-y-2.5 pt-1">
              <div className="relative">
                <select
                  value={isCustomPreamble ? 'custom' : options.preambleText}
                  onChange={e => {
                    const value = e.target.value;
                    onChange('preambleText', value === 'custom' ? '' : value);
                  }}
                  className={`${inputBaseClasses} appearance-none pr-10`}
                >
                  {preambleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              
              {(isCustomPreamble || options.preambleText === '') && (
                <textarea
                  placeholder='Craft your custom preamble... e.g., "Analyze this code for potential bugs."'
                  value={options.preambleText}
                  onChange={e => onChange('preambleText', e.target.value)}
                  className={`${inputBaseClasses} min-h-[70px] resize-y py-2`}
                  rows={3}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Goal Section */}
        <div className="space-y-2.5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 ring-1 ring-slate-200 dark:ring-slate-700/50">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeGoal"
              checked={options.includeGoal}
              onChange={e => onChange('includeGoal', e.target.checked)}
              className={checkboxBaseClasses}
            />
            <label htmlFor="includeGoal" className={`ml-2.5 ${labelBaseClasses}`}>Include Project Goal</label>
          </div>
          
          {options.includeGoal && (
            <div className="pl-7 pt-1">
              <textarea
                placeholder='Clearly define your objective... e.g., "Refactor the authentication module to use OAuth2."'
                value={options.goalText}
                onChange={e => onChange('goalText', e.target.value)}
                className={`${inputBaseClasses} min-h-[70px] resize-y py-2`}
                rows={3}
              />
            </div>
          )}
        </div>
        
        {/* Code Processing Section */}
        <div className="space-y-2.5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 ring-1 ring-slate-200 dark:ring-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center mb-2">
                <Edit3 className="w-4 h-4 mr-2 text-sky-500 dark:text-sky-400" />
                Code Transformations
            </h3>
            <div className="pl-1 space-y-2.5">
                <div className="flex items-center">
                <input
                    type="checkbox"
                    id="removeComments"
                    checked={options.removeComments}
                    onChange={e => onChange('removeComments', e.target.checked)}
                    className={checkboxBaseClasses}
                />
                <label htmlFor="removeComments" className={`ml-2.5 ${labelBaseClasses} flex items-center`}>
                    <MessageSquare className="w-4 h-4 mr-1.5 opacity-70" />
                    Strip Code Comments
                </label>
                </div>
                
                <div className="flex items-center">
                <input
                    type="checkbox"
                    id="minifyOutput"
                    checked={options.minifyOutput}
                    onChange={e => onChange('minifyOutput', e.target.checked)}
                    className={checkboxBaseClasses}
                />
                <label htmlFor="minifyOutput" className={`ml-2.5 ${labelBaseClasses} flex items-center`}>
                    <Minimize className="w-4 h-4 mr-1.5 opacity-70" />
                    Minify/Compact Code
                </label>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});

export default OptionsPanel;