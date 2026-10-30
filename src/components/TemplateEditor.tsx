import { BookTemplate, Check, ChevronDown, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DocumentationTemplate } from '../types/documentationTemplates';
import Button from './ui/Button';

interface TemplateEditorProps {
  mode: 'create' | 'edit';
  initialData?: DocumentationTemplate;
  onSave: (
    templateData: Omit<
      DocumentationTemplate,
      'id' | 'isCustom' | 'createdAt' | 'updatedAt'
    >,
  ) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const COMMON_EMOJIS = [
  '📝',
  '🔍',
  '📚',
  '🏗️',
  '🐛',
  '♻️',
  '🧪',
  '🔒',
  '👋',
  '⚡',
  '🚀',
  '💡',
  '🎯',
  '🛠️',
  '📊',
  '🔧',
];

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  mode,
  initialData,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [icon, setIcon] = useState(initialData?.icon ?? '📝');
  const [systemContext, setSystemContext] = useState(
    initialData?.systemContext ?? '',
  );
  const [taskInstructions, setTaskInstructions] = useState(
    initialData?.taskInstructions ?? '',
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [enableSmartOptimization, setEnableSmartOptimization] = useState(
    initialData?.configuredOptions?.enableSmartOptimization ?? false,
  );
  const [removeComments, setRemoveComments] = useState(
    initialData?.configuredOptions?.removeComments ?? false,
  );
  const [minifyOutput, setMinifyOutput] = useState(
    initialData?.configuredOptions?.minifyOutput ?? false,
  );
  const [maxTotalTokens, setMaxTotalTokens] = useState(
    initialData?.configuredOptions?.maxTotalTokens ?? 256000,
  );
  const [prioritizeDocumentation, setPrioritizeDocumentation] = useState(
    initialData?.configuredOptions?.prioritizeDocumentation ?? false,
  );
  const [includeStructureMap, setIncludeStructureMap] = useState(
    initialData?.configuredOptions?.includeStructureMap ?? false,
  );
  const [adaptiveCompression, setAdaptiveCompression] = useState(
    initialData?.configuredOptions?.adaptiveCompression ?? false,
  );

  const [showAdvanced, setShowAdvanced] = useState(
    enableSmartOptimization || removeComments || minifyOutput,
  );
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Template name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const configuredOptions: DocumentationTemplate['configuredOptions'] = {};
    if (enableSmartOptimization)
      configuredOptions.enableSmartOptimization = true;
    if (removeComments) configuredOptions.removeComments = true;
    if (minifyOutput) configuredOptions.minifyOutput = true;
    if (enableSmartOptimization && maxTotalTokens !== 256000)
      configuredOptions.maxTotalTokens = maxTotalTokens;
    if (prioritizeDocumentation)
      configuredOptions.prioritizeDocumentation = true;
    if (includeStructureMap) configuredOptions.includeStructureMap = true;
    if (adaptiveCompression) configuredOptions.adaptiveCompression = true;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      systemContext: systemContext.trim(),
      taskInstructions: taskInstructions.trim(),
      configuredOptions:
        Object.keys(configuredOptions).length > 0
          ? configuredOptions
          : undefined,
    });
  };

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !dialogRef.current.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !dialogRef.current.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-emoji-picker]')) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showEmojiPicker]);

  const inputClasses =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-400';
  const textareaClasses = `${inputClasses} resize-y font-mono leading-relaxed`;
  const labelClasses =
    'block text-xs font-medium text-neutral-700 dark:text-neutral-300';

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is a pointer-only enhancement; Escape and the close button cover keyboard users.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-editor-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
              <BookTemplate aria-hidden="true" className="h-4 w-4" />
            </span>
            <div>
              <h2
                id="template-editor-title"
                className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
              >
                {mode === 'create' ? 'Create template' : 'Edit template'}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Reusable context for a specific kind of task.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className={`${labelClasses} mb-1.5 block`}>Icon</span>
              <div className="relative" data-emoji-picker>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  className="flex h-10 w-12 items-center justify-center rounded-lg border border-neutral-300 bg-white text-xl shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/60 dark:hover:bg-neutral-800"
                  aria-label="Choose template icon"
                  aria-expanded={showEmojiPicker}
                >
                  {icon}
                </button>
                {showEmojiPicker && (
                  <div className="absolute left-0 top-full z-20 mt-1 grid w-40 grid-cols-4 gap-1 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        aria-label={`Use ${emoji} as icon`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label
                className={`${labelClasses} mb-1.5 block`}
                htmlFor="template-name"
              >
                Template name <span className="text-red-500">*</span>
              </label>
              <input
                id="template-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="e.g., React component review"
                className={`${inputClasses} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? 'template-name-error' : undefined
                }
              />
              {errors.name && (
                <p
                  id="template-name-error"
                  role="alert"
                  className="mt-1 text-xs text-red-500"
                >
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              className={`${labelClasses} mb-1.5 block`}
              htmlFor="template-description"
            >
              Description
            </label>
            <input
              id="template-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this template does"
              className={inputClasses}
            />
          </div>

          <div>
            <label
              className={`${labelClasses} mb-1.5 block`}
              htmlFor="template-system-context"
            >
              System context
            </label>
            <textarea
              id="template-system-context"
              value={systemContext}
              onChange={(e) => setSystemContext(e.target.value)}
              placeholder="Background context, persona, or project info for the AI…"
              className={`${textareaClasses} min-h-[80px]`}
            />
          </div>

          <div>
            <label
              className={`${labelClasses} mb-1.5 block`}
              htmlFor="template-task-instructions"
            >
              Task instructions
            </label>
            <textarea
              id="template-task-instructions"
              value={taskInstructions}
              onChange={(e) => setTaskInstructions(e.target.value)}
              placeholder="Specific instructions, output format, or tasks for the AI…"
              className={`${textareaClasses} min-h-[100px]`}
            />
          </div>

          <div className="border-t border-neutral-200/80 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <ChevronDown
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
              Advanced options
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Applied automatically whenever this template is selected.
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={enableSmartOptimization}
                      onChange={(e) =>
                        setEnableSmartOptimization(e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Smart optimization
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={removeComments}
                      onChange={(e) => setRemoveComments(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Remove comments
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={minifyOutput}
                      onChange={(e) => setMinifyOutput(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Minify output
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={prioritizeDocumentation}
                      onChange={(e) =>
                        setPrioritizeDocumentation(e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Prioritize docs
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={includeStructureMap}
                      onChange={(e) => setIncludeStructureMap(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Structure map
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={adaptiveCompression}
                      onChange={(e) => setAdaptiveCompression(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Adaptive compression
                  </label>
                </div>

                {enableSmartOptimization && (
                  <div>
                    <label
                      className={`${labelClasses} mb-1.5 flex items-center justify-between`}
                      htmlFor="template-max-tokens"
                    >
                      <span>Max token budget</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400">
                        {maxTotalTokens.toLocaleString()}
                      </span>
                    </label>
                    <input
                      id="template-max-tokens"
                      type="range"
                      min="10000"
                      max="2000000"
                      step="1000"
                      value={maxTotalTokens}
                      onChange={(e) =>
                        setMaxTotalTokens(parseInt(e.target.value, 10))
                      }
                      className="range-input"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span>10k</span>
                      <span>2M</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 px-6 py-4 dark:border-neutral-800">
          <div>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel} variant="default">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              icon={<Check aria-hidden="true" className="h-4 w-4" />}
            >
              {mode === 'create' ? 'Create template' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TemplateEditor;
