import React, { useState } from 'react';
import { BookTemplate, ChevronDown, Info } from 'lucide-react';
import { documentationTemplates, applyTemplate } from '../types/documentationTemplates';

interface TemplateSelectorProps {
  onTemplateApply: (templateData: {
    preambleText: string;
    goalText: string;
    includePreamble: boolean;
    includeGoal: boolean;
  }) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateApply }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = documentationTemplates.find(t => t.id === templateId);
    if (template) {
      const templateData = applyTemplate(template);
      onTemplateApply(templateData);
    }
  };

  const inputBaseClasses = "w-full py-2 px-3.5 border-0 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-150 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 shadow-sm";

  return (
    <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20 ring-1 ring-emerald-200 dark:ring-emerald-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BookTemplate className="w-5 h-5 mr-2.5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Context Templates
          </h3>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Quick presets for common tasks
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="relative">
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className={`${inputBaseClasses} appearance-none pr-10 font-medium`}
          >
            <option value="">Choose a template...</option>
            {documentationTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.icon} {template.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute right-3.5 top-1/2 -tranneutral-y-1/2 pointer-events-none" />
        </div>

        {selectedTemplate && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700">
            <button
              onClick={() => setShowDetails(showDetails === selectedTemplate ? null : selectedTemplate)}
              className="flex items-start w-full text-left group"
            >
              <Info className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {documentationTemplates.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>
            </button>
            
            {showDetails === selectedTemplate && (
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">Focus Areas:</span>
                    <p className="mt-1 whitespace-pre-line pl-2">
                      {documentationTemplates.find(t => t.id === selectedTemplate)?.goal}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 pt-1">
          <p>💡 Templates automatically configure preamble and goal settings</p>
          <p>✨ Customize the applied template in sections below</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;

