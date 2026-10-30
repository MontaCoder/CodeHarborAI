import { BookPlus, ChevronDown, Info, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  addCustomTemplate,
  deleteCustomTemplate,
  loadCustomTemplates,
  updateCustomTemplate,
} from '../services/templateStorageService';
import {
  applyTemplate,
  type DocumentationTemplate,
  documentationTemplates,
} from '../types/documentationTemplates';
import TemplateEditor from './TemplateEditor';
import Button from './ui/Button';

interface TemplateSelectorProps {
  onTemplateApply: (templateData: {
    systemContextText: string;
    taskInstructionsText: string;
    includeSystemContext: boolean;
    includeTaskInstructions: boolean;
    [key: string]: unknown;
  }) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateApply,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<
    DocumentationTemplate[]
  >(() => loadCustomTemplates());
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<
    DocumentationTemplate | undefined
  >(undefined);

  const allTemplates = [...documentationTemplates, ...customTemplates];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = allTemplates.find((t) => t.id === templateId);
    if (template) {
      const templateData = applyTemplate(template);
      onTemplateApply(templateData);
    }
  };

  const activeTemplate = allTemplates.find((t) => t.id === selectedTemplate);

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setEditorMode('create');
  };

  const handleEdit = (template: DocumentationTemplate) => {
    setEditingTemplate(template);
    setEditorMode('edit');
  };

  const handleSaveTemplate = useCallback(
    (
      templateData: Omit<
        DocumentationTemplate,
        'id' | 'isCustom' | 'createdAt' | 'updatedAt'
      >,
    ) => {
      if (editorMode === 'create') {
        addCustomTemplate(templateData);
      } else if (editorMode === 'edit' && editingTemplate) {
        updateCustomTemplate(editingTemplate.id, templateData);
      }
      setCustomTemplates(loadCustomTemplates());
      setEditorMode(null);
      setEditingTemplate(undefined);
    },
    [editorMode, editingTemplate],
  );

  const handleDeleteTemplate = useCallback(
    (template: DocumentationTemplate) => {
      if (
        window.confirm(
          `Delete template "${template.name}"? This cannot be undone.`,
        )
      ) {
        deleteCustomTemplate(template.id);
        setCustomTemplates(loadCustomTemplates());
        if (selectedTemplate === template.id) {
          setSelectedTemplate('');
        }
      }
    },
    [selectedTemplate],
  );

  const handleCloseEditor = useCallback(() => {
    setEditorMode(null);
    setEditingTemplate(undefined);
  }, []);

  const inputBaseClasses =
    'w-full appearance-none rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-neutral-900 shadow-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100';

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="template-select" className="sr-only">
            Choose a context template
          </label>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className={inputBaseClasses}
          >
            <option value="">Choose a template…</option>

            <optgroup label="Built-in templates">
              {documentationTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </option>
              ))}
            </optgroup>

            {customTemplates.length > 0 && (
              <optgroup label="My custom templates">
                {customTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.icon} {template.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
          />
        </div>
        <Button
          icon={<BookPlus aria-hidden="true" className="h-3.5 w-3.5" />}
          onClick={handleCreateNew}
          variant="default"
          className="flex-shrink-0 px-2.5 py-2 text-xs"
          title="Create a custom template"
        >
          New
        </Button>
      </div>

      {selectedTemplate && activeTemplate && (
        <div className="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base ring-1 ring-emerald-200/60 dark:bg-emerald-500/10 dark:ring-emerald-500/20"
            >
              {activeTemplate.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  {activeTemplate.name}
                </p>
                {activeTemplate.isCustom && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                    Custom
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {activeTemplate.description}
              </p>
            </div>
            {activeTemplate.isCustom && (
              <div className="flex flex-shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleEdit(activeTemplate)}
                  className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  title="Edit template"
                  aria-label="Edit template"
                >
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(activeTemplate)}
                  className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  title="Delete template"
                  aria-label="Delete template"
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowDetails(
                showDetails === selectedTemplate ? null : selectedTemplate,
              )
            }
            aria-expanded={showDetails === selectedTemplate}
            className="mt-2 inline-flex items-center gap-1 rounded-md text-[11px] font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <ChevronDown
              aria-hidden="true"
              className={`h-3 w-3 transition-transform ${
                showDetails === selectedTemplate ? 'rotate-180' : ''
              }`}
            />
            {showDetails === selectedTemplate ? 'Hide details' : 'View details'}
          </button>

          {showDetails === selectedTemplate && (
            <div className="mt-2 space-y-2 border-t border-neutral-200/80 pt-2 text-[11px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
              <div>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Focus areas:
                </span>
                <p className="mt-1 whitespace-pre-line leading-relaxed">
                  {activeTemplate.taskInstructions}
                </p>
              </div>
              {activeTemplate.configuredOptions && (
                <div>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Configured options:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeTemplate.configuredOptions
                      .enableSmartOptimization && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                        Smart optimizer
                      </span>
                    )}
                    {activeTemplate.configuredOptions.removeComments && (
                      <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-700 ring-1 ring-violet-200/70 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20">
                        No comments
                      </span>
                    )}
                    {activeTemplate.configuredOptions.minifyOutput && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
                        Minified
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        <Info aria-hidden="true" className="mt-0.5 h-3 w-3 flex-shrink-0" />
        Templates prefill system context and task instructions, then you can
        refine them below.
      </p>

      {editorMode && (
        <TemplateEditor
          mode={editorMode}
          initialData={editingTemplate}
          onSave={handleSaveTemplate}
          onDelete={
            editorMode === 'edit' && editingTemplate
              ? () => {
                  handleDeleteTemplate(editingTemplate);
                  handleCloseEditor();
                }
              : undefined
          }
          onCancel={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default TemplateSelector;
