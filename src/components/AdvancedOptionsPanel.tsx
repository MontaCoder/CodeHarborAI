import {
  BookOpen,
  BookTemplate,
  FileText,
  Link as LinkIcon,
  Loader2,
  MessageSquareText,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type React from 'react';
import { memo, useState } from 'react';
import { type Context7Doc, Context7Service } from '../services/context7Service';
import TemplateSelector from './TemplateSelector';
import Button from './ui/Button';
import Toggle from './ui/Toggle';

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

const TOKEN_PRESETS = [
  { label: '128k', value: 128000 },
  { label: '256k', value: 256000 },
  { label: '512k', value: 512000 },
  { label: '1M', value: 1000000 },
];

const SectionLabel: React.FC<{
  icon: typeof BookOpen;
  title: string;
  badge?: string;
}> = ({ icon: Icon, title, badge }) => (
  <div className="flex items-center justify-between gap-2">
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {title}
    </h3>
    {badge && (
      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600 ring-1 ring-violet-200/70 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20">
        {badge}
      </span>
    )}
  </div>
);

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
        onChange(
          'enableSmartOptimization',
          templateData.enableSmartOptimization,
        );
      if (templateData.removeComments !== undefined)
        onChange('removeComments', templateData.removeComments);
      if (templateData.minifyOutput !== undefined)
        onChange('minifyOutput', templateData.minifyOutput);
      if (templateData.maxTotalTokens !== undefined)
        onChange('maxTotalTokens', templateData.maxTotalTokens);
      if (templateData.prioritizeDocumentation !== undefined)
        onChange(
          'prioritizeDocumentation',
          templateData.prioritizeDocumentation,
        );
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
        const nextDocs = options.context7Docs.filter(
          (existing) => existing.url !== doc.url,
        );
        onChange('context7Docs', [...nextDocs, doc]);
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
      if (updatedDocs.length === 0) onChange('includeContext7Docs', false);
    };

    const inputBase =
      'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-400 disabled:opacity-60';
    const textareaBase = `${inputBase} min-h-[80px] resize-y leading-relaxed`;

    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            <SlidersHorizontal
              aria-hidden="true"
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
            />
            Prompt setup
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Control the context and instructions the model receives.
          </p>
        </div>

        <section className="space-y-3">
          <SectionLabel icon={BookTemplate} title="Template" />
          <TemplateSelector onTemplateApply={handleTemplateApply} />
        </section>

        <section className="space-y-3 border-t border-neutral-200/80 pt-5 dark:border-neutral-800">
          <SectionLabel icon={MessageSquareText} title="Instructions" />
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
            <Toggle
              checked={options.includeSystemContext}
              onChange={(checked) => onChange('includeSystemContext', checked)}
              label="System context"
              description="AI persona and background"
            />
            {options.includeSystemContext && (
              <textarea
                placeholder="e.g., You are an expert TypeScript developer. This is a React 19 project using Tailwind CSS…"
                value={options.systemContextText}
                onChange={(e) => onChange('systemContextText', e.target.value)}
                className={`${textareaBase} mt-2 min-h-[96px]`}
                rows={4}
                aria-label="System context text"
              />
            )}
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
            <Toggle
              checked={options.includeTaskInstructions}
              onChange={(checked) =>
                onChange('includeTaskInstructions', checked)
              }
              label="Task instructions"
              description="What you want the AI to do"
            />
            {options.includeTaskInstructions && (
              <textarea
                placeholder="e.g., Review for security issues. Return a Markdown table with columns: Issue, Severity, Fix."
                value={options.taskInstructionsText}
                onChange={(e) =>
                  onChange('taskInstructionsText', e.target.value)
                }
                className={`${textareaBase} mt-2 min-h-[110px]`}
                rows={4}
                aria-label="Task instructions text"
              />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <Toggle
            icon={<Sparkles className="h-4 w-4" />}
            checked={options.enableSmartOptimization}
            onChange={(checked) => onChange('enableSmartOptimization', checked)}
            label="Smart context optimizer"
            description="Prioritize and compress files to fit a token budget"
          />

          {options.enableSmartOptimization && (
            <div className="mt-4 space-y-4 border-t border-neutral-200/80 pt-4 dark:border-neutral-800">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="token-budget"
                    className="font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    Max token budget
                  </label>
                  <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {options.maxTotalTokens.toLocaleString()}
                  </span>
                </div>
                <input
                  id="token-budget"
                  type="range"
                  min="10000"
                  max="2000000"
                  step="1000"
                  value={options.maxTotalTokens}
                  onChange={(e) =>
                    onChange('maxTotalTokens', parseInt(e.target.value, 10))
                  }
                  className="range-input mt-2"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    10k
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    2M
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TOKEN_PRESETS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onChange('maxTotalTokens', value)}
                      aria-pressed={options.maxTotalTokens === value}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                        options.maxTotalTokens === value
                          ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950'
                          : 'bg-white text-neutral-600 ring-1 ring-neutral-200/80 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Toggle
                  checked={options.prioritizeDocumentation}
                  onChange={(checked) =>
                    onChange('prioritizeDocumentation', checked)
                  }
                  label="Prioritize documentation"
                  description="Surface README and docs first"
                />
                <Toggle
                  checked={options.includeStructureMap}
                  onChange={(checked) =>
                    onChange('includeStructureMap', checked)
                  }
                  label="Project structure map"
                  description="Add a tree overview of the project"
                />
                <Toggle
                  checked={options.adaptiveCompression}
                  onChange={(checked) =>
                    onChange('adaptiveCompression', checked)
                  }
                  label="Adaptive compression"
                  description="Summarize low-priority files"
                />
              </div>

              <div className="space-y-1 border-t border-neutral-200/80 pt-3 dark:border-neutral-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  Transformations
                </p>
                <Toggle
                  checked={options.removeComments}
                  onChange={(checked) => onChange('removeComments', checked)}
                  label="Strip comments"
                  description="Remove comments to save tokens"
                />
                <Toggle
                  checked={options.minifyOutput}
                  onChange={(checked) => onChange('minifyOutput', checked)}
                  label="Minify code"
                  description="Collapse whitespace in the output"
                />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3 border-t border-neutral-200/80 pt-5 dark:border-neutral-800">
          <SectionLabel
            icon={BookOpen}
            title="Reference docs"
            badge="Context7"
          />
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <LinkIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
              />
              <input
                type="url"
                placeholder="https://context7.com/…"
                value={context7Url}
                onChange={(e) => {
                  setContext7Url(e.target.value);
                  setDocError('');
                }}
                className={`${inputBase} pl-9`}
                disabled={isLoadingDoc}
                aria-label="Context7 documentation URL"
              />
            </div>
            <Button
              onClick={handleAddContext7Doc}
              disabled={!context7Url.trim() || isLoadingDoc}
              variant="secondary"
              className="px-3 py-2"
            >
              {isLoadingDoc ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
          </div>

          {docError && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400">
              {docError}
            </p>
          )}

          {options.context7Docs.length > 0 && (
            <ul className="space-y-1.5">
              {options.context7Docs.map((doc, index) => (
                <li
                  key={doc.url}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200/80 bg-white px-2.5 py-2 dark:border-neutral-800 dark:bg-neutral-900/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <FileText
                        aria-hidden="true"
                        className="h-3.5 w-3.5 flex-shrink-0 text-violet-500 dark:text-violet-400"
                      />
                      <p className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {doc.title}
                      </p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-5 block truncate text-[10px] text-neutral-500 transition-colors hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400"
                    >
                      {doc.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(index)}
                    className="rounded p-1 text-neutral-500 transition-colors hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                    aria-label={`Remove ${doc.title}`}
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  },
);

export default AdvancedOptionsPanel;
