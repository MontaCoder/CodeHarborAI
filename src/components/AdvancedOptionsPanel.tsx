import {
  BookOpen,
  Brain,
  FileText,
  Link as LinkIcon,
  Loader2,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type React from 'react';
import { memo, useState } from 'react';
import { type Context7Doc, Context7Service } from '../services/context7Service';
import TemplateSelector from './TemplateSelector';
import Button from './ui/Button';

interface AdvancedOptionsPanelProps {
  options: {
    includePreamble: boolean;
    preambleText: string;
    includeGoal: boolean;
    goalText: string;
    removeComments: boolean;
    minifyOutput: boolean;
    includeContext7Docs: boolean;
    context7Docs: Context7Doc[];
    // Smart Context Optimizer options
    enableSmartOptimization: boolean;
    maxTotalTokens: number;
    prioritizeDocumentation: boolean;
    includeStructureMap: boolean;
    extractCodeSignatures: boolean;
    adaptiveCompression: boolean;
  };
  onChange: (key: string, value: string | boolean | number | Context7Doc[]) => void;
}

const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = memo(
  ({ options, onChange }) => {
    const [context7Url, setContext7Url] = useState('');
    const [isLoadingDoc, setIsLoadingDoc] = useState(false);
    const [docError, setDocError] = useState('');

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

    const handleAddContext7Doc = async () => {
      if (!context7Url.trim()) {
        setDocError('Please enter a Context7 documentation URL');
        return;
      }

      if (!Context7Service.isValidUrl(context7Url)) {
        setDocError('Invalid Context7 URL format');
        return;
      }

      setIsLoadingDoc(true);
      setDocError('');

      try {
        const doc = await Context7Service.fetchDocumentation(context7Url);
        const updatedDocs = [...options.context7Docs, doc];
        onChange('context7Docs', updatedDocs);
        onChange('includeContext7Docs', true);
        setContext7Url('');
      } catch (error) {
        setDocError(
          error instanceof Error
            ? error.message
            : 'Failed to load documentation',
        );
      } finally {
        setIsLoadingDoc(false);
      }
    };

    const handleRemoveDoc = (index: number) => {
      const updatedDocs = options.context7Docs.filter((_, i) => i !== index);
      onChange('context7Docs', updatedDocs);
      if (updatedDocs.length === 0) {
        onChange('includeContext7Docs', false);
      }
    };

    const inputBaseClasses =
      'w-full py-2 px-3.5 border-0 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-150 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 shadow-sm disabled:opacity-60';
    const checkboxBaseClasses =
      'h-4.5 w-4.5 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-neutral-700 dark:checked:bg-emerald-600 dark:checked:border-emerald-600 shadow-sm transition-all cursor-pointer';
    const labelBaseClasses =
      'text-sm font-medium text-neutral-700 dark:text-neutral-200 select-none cursor-pointer';

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2.5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              Context Engineering
            </h2>
          </div>
          <div className="flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Optimized</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Template Selector */}
          <TemplateSelector onTemplateApply={handleTemplateApply} />

          {/* Smart Context Optimizer */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 ring-1 ring-emerald-200 dark:ring-emerald-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Smart Context Optimizer
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableSmartOptimization"
                  checked={options.enableSmartOptimization}
                  onChange={(e) => onChange('enableSmartOptimization', e.target.checked)}
                  className={checkboxBaseClasses}
                />
                <label
                  htmlFor="enableSmartOptimization"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
                >
                  {options.enableSmartOptimization ? '✅ Enabled' : 'Disabled'}
                </label>
              </div>
            </div>

            {options.enableSmartOptimization && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Max Token Budget: {options.maxTotalTokens.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="2000000"
                    step="10000"
                    value={options.maxTotalTokens}
                    onChange={(e) => onChange('maxTotalTokens', parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>10k</span>
                    <span>2M</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pl-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="prioritizeDocumentation"
                      checked={options.prioritizeDocumentation}
                      onChange={(e) => onChange('prioritizeDocumentation', e.target.checked)}
                      className={checkboxBaseClasses}
                    />
                    <label htmlFor="prioritizeDocumentation" className={`ml-2.5 ${labelBaseClasses} text-xs`}>
                      📚 Prioritize documentation files
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeStructureMap"
                      checked={options.includeStructureMap}
                      onChange={(e) => onChange('includeStructureMap', e.target.checked)}
                      className={checkboxBaseClasses}
                    />
                    <label htmlFor="includeStructureMap" className={`ml-2.5 ${labelBaseClasses} text-xs`}>
                      🗺️ Generate project structure map
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="extractCodeSignatures"
                      checked={options.extractCodeSignatures}
                      onChange={(e) => onChange('extractCodeSignatures', e.target.checked)}
                      className={checkboxBaseClasses}
                    />
                    <label htmlFor="extractCodeSignatures" className={`ml-2.5 ${labelBaseClasses} text-xs`}>
                      🔍 Extract code signatures & types
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adaptiveCompression"
                      checked={options.adaptiveCompression}
                      onChange={(e) => onChange('adaptiveCompression', e.target.checked)}
                      className={checkboxBaseClasses}
                    />
                    <label htmlFor="adaptiveCompression" className={`ml-2.5 ${labelBaseClasses} text-xs`}>
                      ⚡ Adaptive compression & summarization
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {options.enableSmartOptimization
                  ? '🧠 AI analyzes each file and optimizes context intelligently based on type, role, and relevance'
                  : '💡 Enable to automatically optimize context with file-aware intelligence'}
              </p>
            </div>
          </div>

          {/* Context7 Documentation Import */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 ring-1 ring-violet-200 dark:ring-violet-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
                <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Reference Documentation
                </label>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                Context7
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://context7.ai/docs/..."
                    value={context7Url}
                    onChange={(e) => {
                      setContext7Url(e.target.value);
                      setDocError('');
                    }}
                    className={`${inputBaseClasses} pl-10`}
                    disabled={isLoadingDoc}
                  />
                </div>
                <Button
                  onClick={handleAddContext7Doc}
                  disabled={!context7Url.trim() || isLoadingDoc}
                  primary
                  className="px-4 py-2 text-sm whitespace-nowrap"
                >
                  {isLoadingDoc ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    'Add'
                  )}
                </Button>
              </div>

              {docError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {docError}
                </p>
              )}

              {options.context7Docs.length > 0 && (
                <div className="space-y-2 pt-2">
                  {options.context7Docs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-2.5 bg-white dark:bg-neutral-800 rounded-md shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                            {doc.title}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 truncate block"
                        >
                          {doc.url}
                        </a>
                      </div>
                      <button
                        onClick={() => handleRemoveDoc(index)}
                        className="ml-2 p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                💡 Add documentation links to provide additional context for AI
                analysis
              </p>
            </div>
          </div>

          {/* Preamble Section */}
          <div className="space-y-2.5 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 ring-1 ring-neutral-200 dark:ring-neutral-700/50">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includePreamble"
                checked={options.includePreamble}
                onChange={(e) => onChange('includePreamble', e.target.checked)}
                className={checkboxBaseClasses}
              />
              <label
                htmlFor="includePreamble"
                className={`ml-2.5 ${labelBaseClasses}`}
              >
                Custom Preamble
              </label>
            </div>

            {options.includePreamble && (
              <div className="pl-7 pt-1">
                <textarea
                  placeholder='Add context or instructions... e.g., "You are an expert code reviewer focusing on security..."'
                  value={options.preambleText}
                  onChange={(e) => onChange('preambleText', e.target.value)}
                  className={`${inputBaseClasses} min-h-[80px] resize-y py-2`}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Goal Section */}
          <div className="space-y-2.5 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 ring-1 ring-neutral-200 dark:ring-neutral-700/50">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeGoal"
                checked={options.includeGoal}
                onChange={(e) => onChange('includeGoal', e.target.checked)}
                className={checkboxBaseClasses}
              />
              <label
                htmlFor="includeGoal"
                className={`ml-2.5 ${labelBaseClasses}`}
              >
                Specific Task/Goal
              </label>
            </div>

            {options.includeGoal && (
              <div className="pl-7 pt-1">
                <textarea
                  placeholder='Define your objective... e.g., "Identify performance bottlenecks and suggest optimizations"'
                  value={options.goalText}
                  onChange={(e) => onChange('goalText', e.target.value)}
                  className={`${inputBaseClasses} min-h-[80px] resize-y py-2`}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Basic Transformations */}
          <div className="space-y-2.5 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 ring-1 ring-neutral-200 dark:ring-neutral-700/50">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 flex items-center mb-2">
              <Settings className="w-4 h-4 mr-2 text-neutral-500 dark:text-neutral-400" />
              Basic Transformations
            </h3>
            <div className="pl-1 space-y-2.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="removeComments"
                  checked={options.removeComments}
                  onChange={(e) => onChange('removeComments', e.target.checked)}
                  className={checkboxBaseClasses}
                />
                <label
                  htmlFor="removeComments"
                  className={`ml-2.5 ${labelBaseClasses}`}
                >
                  Strip code comments (reduce tokens)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="minifyOutput"
                  checked={options.minifyOutput}
                  onChange={(e) => onChange('minifyOutput', e.target.checked)}
                  className={checkboxBaseClasses}
                />
                <label
                  htmlFor="minifyOutput"
                  className={`ml-2.5 ${labelBaseClasses}`}
                >
                  Minify code (reduce tokens significantly)
                </label>
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              ⚠️ These apply before Smart Optimization (if enabled)
            </p>
          </div>

          {/* Tips */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="font-semibold text-blue-700 dark:text-blue-400">
              💡 Smart Optimization Tips:
            </p>
            <ul className="space-y-1 pl-4 list-disc">
              <li>Use templates as a starting point for common tasks</li>
              <li>Add Context7 docs to provide framework/library references</li>
              <li>Enable Smart Optimizer for intelligent, file-aware context</li>
              <li>Adjust token budget based on your AI model's capacity</li>
              <li>Use adaptive compression for large codebases</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
);

export default AdvancedOptionsPanel;
