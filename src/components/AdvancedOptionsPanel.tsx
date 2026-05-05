import {
  BookOpen,
  Brain,
  FileText,
  Link as LinkIcon,
  Loader2,
  Settings2,
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
    includeSystemContext: boolean;
    systemContextText: string;
    includeTaskInstructions: boolean;
    taskInstructionsText: string;
    removeComments: boolean;
    minifyOutput: boolean;
    includeContext7Docs: boolean;
    context7Docs: Context7Doc[];
    enableSmartOptimization: boolean;
    maxTotalTokens: number;
    prioritizeDocumentation: boolean;
    includeStructureMap: boolean;
    adaptiveCompression: boolean;
    bodyElisionThreshold: number;
    adaptiveBodyThreshold: boolean;
    preserveTypeDeclarations: boolean;
    preserveModuleSurface: boolean;
  };
  onChange: (
    key: string,
    value: string | boolean | number | Context7Doc[],
  ) => void;
}

const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = memo(
  ({ options, onChange }) => {
    const [context7Url, setContext7Url] = useState('');
    const [isLoadingDoc, setIsLoadingDoc] = useState(false);
    const [docError, setDocError] = useState('');

    const handleTemplateApply = (templateData: {
      systemContextText: string;
      taskInstructionsText: string;
      includeSystemContext: boolean;
      includeTaskInstructions: boolean;
      enableSmartOptimization?: boolean;
      removeComments?: boolean;
      minifyOutput?: boolean;
      maxTotalTokens?: number;
      prioritizeDocumentation?: boolean;
      includeStructureMap?: boolean;
      adaptiveCompression?: boolean;
    }) => {
      onChange('systemContextText', templateData.systemContextText);
      onChange('taskInstructionsText', templateData.taskInstructionsText);
      onChange('includeSystemContext', templateData.includeSystemContext);
      onChange('includeTaskInstructions', templateData.includeTaskInstructions);
      if (templateData.enableSmartOptimization !== undefined)
        onChange('enableSmartOptimization', templateData.enableSmartOptimization);
      if (templateData.removeComments !== undefined)
        onChange('removeComments', templateData.removeComments);
      if (templateData.minifyOutput !== undefined)
        onChange('minifyOutput', templateData.minifyOutput);
      if (templateData.maxTotalTokens !== undefined)
        onChange('maxTotalTokens', templateData.maxTotalTokens);
      if (templateData.prioritizeDocumentation !== undefined)
        onChange('prioritizeDocumentation', templateData.prioritizeDocumentation);
      if (templateData.includeStructureMap !== undefined)
        onChange('includeStructureMap', templateData.includeStructureMap);
      if (templateData.adaptiveCompression !== undefined)
        onChange('adaptiveCompression', templateData.adaptiveCompression);
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
        onChange('context7Docs', [...options.context7Docs, doc]);
        onChange('includeContext7Docs', true);
        setContext7Url('');
      } catch (error) {
        setDocError(
          error instanceof Error ? error.message : 'Failed to load documentation',
        );
      } finally {
        setIsLoadingDoc(false);
      }
    };

    const handleRemoveDoc = (index: number) => {
      const updatedDocs = options.context7Docs.filter((_, i) => i !== index);
      onChange('context7Docs', updatedDocs);
      if (updatedDocs.length === 0) onChange('includeContext7Docs', false);
    };

    const inputBase =
      'w-full py-2 px-3.5 border-0 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-150 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 disabled:opacity-60';
    const checkboxBase =
      'h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-neutral-700 dark:checked:bg-emerald-600 dark:checked:border-emerald-600 cursor-pointer';
    const labelBase =
      'text-sm font-medium text-neutral-700 dark:text-neutral-200 select-none cursor-pointer';

    return (
      <div className="animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              Context Engineering
            </h2>
          </div>
          <Sparkles className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="space-y-4">
          {/* ── Context Templates & Instructions ── */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 ring-1 ring-emerald-200/60 dark:ring-emerald-800/40 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              <Settings2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Context Templates</span>
            </div>

            <TemplateSelector onTemplateApply={handleTemplateApply} />

            <div className="border-t border-emerald-200/60 dark:border-emerald-800/40 pt-3 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSystemContext}
                  onChange={(e) => onChange('includeSystemContext', e.target.checked)}
                  className={checkboxBase}
                />
                <span className={labelBase}>System Context</span>
                <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">AI persona & background</span>
              </label>
              {options.includeSystemContext && (
                <textarea
                  placeholder="e.g., You are an expert TypeScript developer. This is a React/Next.js project using Tailwind CSS..."
                  value={options.systemContextText}
                  onChange={(e) => onChange('systemContextText', e.target.value)}
                  className={`${inputBase} min-h-[70px] resize-y`}
                  rows={3}
                />
              )}
            </div>

            <div className="border-t border-emerald-200/60 dark:border-emerald-800/40 pt-3 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeTaskInstructions}
                  onChange={(e) => onChange('includeTaskInstructions', e.target.checked)}
                  className={checkboxBase}
                />
                <span className={labelBase}>Task Instructions</span>
                <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">What you want the AI to do</span>
              </label>
              {options.includeTaskInstructions && (
                <textarea
                  placeholder='e.g., Review for security issues. Return results as a Markdown table with columns: Issue, Severity, Fix'
                  value={options.taskInstructionsText}
                  onChange={(e) => onChange('taskInstructionsText', e.target.value)}
                  className={`${inputBase} min-h-[70px] resize-y`}
                  rows={3}
                />
              )}
            </div>
          </div>

          {/* ── Smart Context Optimizer ── */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 ring-1 ring-emerald-200/60 dark:ring-emerald-800/40 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.enableSmartOptimization}
                onChange={(e) => onChange('enableSmartOptimization', e.target.checked)}
                className={checkboxBase}
              />
              <span className={`${labelBase} flex items-center gap-1.5`}>
                <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Smart Context Optimizer
              </span>
              <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                {options.enableSmartOptimization ? 'Enabled' : 'Disabled'}
              </span>
            </label>

            {options.enableSmartOptimization && (
              <div className="space-y-3 pl-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600 dark:text-neutral-400">Max Token Budget</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {options.maxTotalTokens.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="2000000"
                    step="10000"
                    value={options.maxTotalTokens}
                    onChange={(e) => onChange('maxTotalTokens', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
                    <span>10k</span>
                    <span>2M</span>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.prioritizeDocumentation}
                    onChange={(e) => onChange('prioritizeDocumentation', e.target.checked)}
                    className={checkboxBase}
                  />
                  <span className={`${labelBase} text-xs`}>Prioritize documentation files</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeStructureMap}
                    onChange={(e) => onChange('includeStructureMap', e.target.checked)}
                    className={checkboxBase}
                  />
                  <span className={`${labelBase} text-xs`}>Generate project structure map</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.adaptiveCompression}
                    onChange={(e) => onChange('adaptiveCompression', e.target.checked)}
                    className={checkboxBase}
                  />
                  <span className={`${labelBase} text-xs`}>Adaptive compression & summarization</span>
                </label>

                <div className="border-t border-emerald-200/60 dark:border-emerald-800/40 pt-3">
                  <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Transformations
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.removeComments}
                        onChange={(e) => onChange('removeComments', e.target.checked)}
                        className={checkboxBase}
                      />
                      <span className={`${labelBase} text-xs`}>Strip code comments</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.minifyOutput}
                        onChange={(e) => onChange('minifyOutput', e.target.checked)}
                        className={checkboxBase}
                      />
                      <span className={`${labelBase} text-xs`}>Minify code</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Reference Documentation ── */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/80 to-purple-50/80 dark:from-violet-950/20 dark:to-purple-950/20 ring-1 ring-violet-200/60 dark:ring-violet-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                <BookOpen className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>Reference Documentation</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                Context7
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://context7.ai/docs/..."
                  value={context7Url}
                  onChange={(e) => { setContext7Url(e.target.value); setDocError(''); }}
                  className={`${inputBase} pl-10`}
                  disabled={isLoadingDoc}
                />
              </div>
              <Button
                onClick={handleAddContext7Doc}
                disabled={!context7Url.trim() || isLoadingDoc}
                variant="primary"
                className="px-4 py-2 text-sm whitespace-nowrap"
              >
                {isLoadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </Button>
            </div>

            {docError && (
              <p className="text-xs text-red-600 dark:text-red-400">{docError}</p>
            )}

            {options.context7Docs.length > 0 && (
              <div className="space-y-1.5">
                {options.context7Docs.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-white/80 dark:bg-neutral-800/60 rounded-lg ring-1 ring-neutral-200/60 dark:ring-neutral-700/40"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                          {doc.title}
                        </p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-violet-600 dark:hover:text-violet-400 truncate block ml-5"
                      >
                        {doc.url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleRemoveDoc(index)}
                      className="p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default AdvancedOptionsPanel;
