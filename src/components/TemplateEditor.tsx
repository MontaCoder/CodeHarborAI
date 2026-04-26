import {
  Check,
  ChevronDown,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { DocumentationTemplate } from '../types/documentationTemplates';

interface TemplateEditorProps {
  mode: 'create' | 'edit';
  initialData?: DocumentationTemplate;
  onSave: (templateData: Omit<DocumentationTemplate, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const COMMON_EMOJIS = [
  '📝', '🔍', '📚', '🏗️', '🐛', '♻️', '🧪', '🔒',
  '👋', '⚡', '🚀', '💡', '🎯', '🛠️', '📊', '🔧',
];

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  mode,
  initialData,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [icon, setIcon] = useState(initialData?.icon ?? '📝');
  const [systemContext, setSystemContext] = useState(initialData?.systemContext ?? '');
  const [taskInstructions, setTaskInstructions] = useState(initialData?.taskInstructions ?? '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Configured options
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
    initialData?.configuredOptions?.maxTotalTokens ?? 200000,
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
    if (enableSmartOptimization) configuredOptions.enableSmartOptimization = true;
    if (removeComments) configuredOptions.removeComments = true;
    if (minifyOutput) configuredOptions.minifyOutput = true;
    if (enableSmartOptimization && maxTotalTokens !== 200000) configuredOptions.maxTotalTokens = maxTotalTokens;
    if (prioritizeDocumentation) configuredOptions.prioritizeDocumentation = true;
    if (includeStructureMap) configuredOptions.includeStructureMap = true;
    if (adaptiveCompression) configuredOptions.adaptiveCompression = true;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      systemContext: systemContext.trim(),
      taskInstructions: taskInstructions.trim(),
      configuredOptions: Object.keys(configuredOptions).length > 0 ? configuredOptions : undefined,
    });
  };

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = () => setShowEmojiPicker(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showEmojiPicker]);

  const inputClasses = 'w-full py-2 px-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-150 text-sm';
  const textareaClasses = 'w-full py-2 px-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-150 text-sm font-mono resize-y';
  const labelClasses = 'block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1';
  const checkboxClasses = 'rounded border-neutral-300 dark:border-neutral-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 bg-white dark:bg-neutral-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {mode === 'create' ? 'Create New Template' : 'Edit Template'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name & Icon */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <label className={labelClasses}>Icon</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-2xl border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  {icon}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 grid grid-cols-4 gap-1 w-40">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className={labelClasses}>
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="e.g., React Component Review"
                className={`${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClasses}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this template does"
              className={inputClasses}
            />
          </div>

          {/* System Context */}
          <div>
            <label className={labelClasses}>System Context</label>
            <textarea
              value={systemContext}
              onChange={(e) => setSystemContext(e.target.value)}
              placeholder="Background context, persona, or project info for the AI..."
              className={`${textareaClasses} min-h-[80px]`}
            />
          </div>

          {/* Task Instructions */}
          <div>
            <label className={labelClasses}>Task Instructions</label>
            <textarea
              value={taskInstructions}
              onChange={(e) => setTaskInstructions(e.target.value)}
              placeholder="Define specific instructions, output format, or tasks for the AI..."
              className={`${textareaClasses} min-h-[100px]`}
            />
          </div>

          {/* Advanced Options */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 mr-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pl-1">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Configure additional options that will be applied when this template is selected:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={enableSmartOptimization}
                      onChange={(e) => setEnableSmartOptimization(e.target.checked)}
                      className={checkboxClasses}
                    />
                    ⚡ Smart Optimization
                  </label>

                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={removeComments}
                      onChange={(e) => setRemoveComments(e.target.checked)}
                      className={checkboxClasses}
                    />
                    💬 Remove Comments
                  </label>

                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={minifyOutput}
                      onChange={(e) => setMinifyOutput(e.target.checked)}
                      className={checkboxClasses}
                    />
                    📦 Minify Output
                  </label>

                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={prioritizeDocumentation}
                      onChange={(e) => setPrioritizeDocumentation(e.target.checked)}
                      className={checkboxClasses}
                    />
                    📚 Prioritize Docs
                  </label>

                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={includeStructureMap}
                      onChange={(e) => setIncludeStructureMap(e.target.checked)}
                      className={checkboxClasses}
                    />
                    🗺️ Structure Map
                  </label>

                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={adaptiveCompression}
                      onChange={(e) => setAdaptiveCompression(e.target.checked)}
                      className={checkboxClasses}
                    />
                    🗜️ Adaptive Compression
                  </label>
                </div>

                {enableSmartOptimization && (
                  <div>
                    <label className={labelClasses}>
                      Max Token Budget: {maxTotalTokens.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="10000"
                      max="2000000"
                      step="10000"
                      value={maxTotalTokens}
                      onChange={(e) => setMaxTotalTokens(parseInt(e.target.value))}
                      className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>10k</span>
                      <span>2M</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              {mode === 'create' ? 'Create Template' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
