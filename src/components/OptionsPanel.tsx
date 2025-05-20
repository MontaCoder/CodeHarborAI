import React from 'react';
import { Settings, MessageSquare, Minimize } from 'lucide-react';

interface OptionsPanelProps {
  options: {
    includePreamble: boolean;
    preambleText: string;
    includeGoal: boolean;
    goalText: string;
    removeComments: boolean;
    minifyOutput: boolean;
  };
  onChange: (key: string, value: any) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-500" />
          Output Options
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includePreamble"
              checked={options.includePreamble}
              onChange={e => onChange('includePreamble', e.target.checked)}
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700"
            />
            <label htmlFor="includePreamble" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Include Preamble
            </label>
          </div>
          
          {options.includePreamble && (
            <div className="pl-6">
              <select
                value={options.preambleText || 'custom'}
                onChange={e => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    onChange('preambleText', '');
                  } else {
                    onChange('preambleText', value);
                  }
                }}
                className="w-full mb-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="custom">Custom preamble</option>
                <option value="The following are the complete project code files for my application.">Complete project code files</option>
                <option value="Below is a comprehensive collection of the project's source files.">Comprehensive source files</option>
                <option value="Here are the selected files from my project that I need help with.">Selected files needing help</option>
              </select>
              
              {(options.preambleText === '' || options.preambleText === 'custom') && (
                <textarea
                  placeholder="Write your custom preamble here..."
                  value={options.preambleText}
                  onChange={e => onChange('preambleText', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                />
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeGoal"
              checked={options.includeGoal}
              onChange={e => onChange('includeGoal', e.target.checked)}
              className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700"
            />
            <label htmlFor="includeGoal" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Include Goal
            </label>
          </div>
          
          {options.includeGoal && (
            <div className="pl-6">
              <textarea
                placeholder="Describe what you want to achieve with these files..."
                value={options.goalText}
                onChange={e => onChange('goalText', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
              />
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Code Processing</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="removeComments"
                checked={options.removeComments}
                onChange={e => onChange('removeComments', e.target.checked)}
                className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700"
              />
              <label htmlFor="removeComments" className="ml-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <MessageSquare className="w-4 h-4 mr-1 text-gray-500" />
                Remove Code Comments
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="minifyOutput"
                checked={options.minifyOutput}
                onChange={e => onChange('minifyOutput', e.target.checked)}
                className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700"
              />
              <label htmlFor="minifyOutput" className="ml-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Minimize className="w-4 h-4 mr-1 text-gray-500" />
                Minify Code
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;