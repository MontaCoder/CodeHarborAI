import {
  BookPlus,
  BookTemplate,
  ChevronDown,
  Info,
  Pencil,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  applyTemplate,
  documentationTemplates,
  type DocumentationTemplate,
} from '../types/documentationTemplates';
import { addCustomTemplate, deleteCustomTemplate, loadCustomTemplates, updateCustomTemplate } from '../services/templateStorageService';
import TemplateEditor from './TemplateEditor';

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
  const [customTemplates, setCustomTemplates] = useState<DocumentationTemplate[]>(
    () => loadCustomTemplates(),
  );
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<DocumentationTemplate | undefined>(undefined);

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

  const handleSaveTemplate = useCallback((templateData: Omit<DocumentationTemplate, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => {
    if (editorMode === 'create') {
      addCustomTemplate(templateData);
    } else if (editorMode === 'edit' && editingTemplate) {
      updateCustomTemplate(editingTemplate.id, templateData);
    }
    setCustomTemplates(loadCustomTemplates());
    setEditorMode(null);
    setEditingTemplate(undefined);
  }, [editorMode, editingTemplate]);

  const handleDeleteTemplate = useCallback((template: DocumentationTemplate) => {
    if (window.confirm(`Delete template "${template.name}"? This cannot be undone.`)) {
      deleteCustomTemplate(template.id);
      setCustomTemplates(loadCustomTemplates());
      if (selectedTemplate === template.id) {
        setSelectedTemplate('');
      }
    }
  }, [selectedTemplate]);

  const handleCloseEditor = useCallback(() => {
    setEditorMode(null);
    setEditingTemplate(undefined);
  }, []);

  const inputBaseClasses =
    'w-full py-2 px-3.5 border-0 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-150 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 shadow-sm';

  return (
    <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20 ring-1 ring-emerald-200 dark:ring-emerald-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BookTemplate className="w-5 h-5 mr-2.5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Context Templates
          </h3>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <BookPlus className="w-3.5 h-3.5" />
          Create New
        </button>
      </div>

      <div className="space-y-2.5">
        <div className="relative">
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className={`${inputBaseClasses} appearance-none pr-10 font-medium`}
          >
            <option value="">Choose a template...</option>

            {/* Built-in Templates */}
            <optgroup label="Built-in Templates">
              {documentationTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </option>
              ))}
            </optgroup>

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <optgroup label="My Custom Templates">
                {customTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.icon} {template.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {selectedTemplate && activeTemplate && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700">
            <div className="flex items-start justify-between">
              <button
                onClick={() =>
                  setShowDetails(
                    showDetails === selectedTemplate ? null : selectedTemplate,
                  )
                }
                className="flex items-start flex-1 text-left group"
              >
                <Info className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {activeTemplate.description}
                    </p>
                    {activeTemplate.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Edit/Delete buttons for custom templates */}
              {activeTemplate.isCustom && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(activeTemplate)}
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    title="Edit template"
                  >
                    <Pencil className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(activeTemplate)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {showDetails === selectedTemplate && (
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Focus Areas:
                    </span>
                    <p className="mt-1 whitespace-pre-line pl-2">
                      {activeTemplate.taskInstructions}
                    </p>
                  </div>
                  {activeTemplate.configuredOptions && (
                    <div>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Additional Options:
                      </span>
                      <div className="mt-1 pl-2 flex flex-wrap gap-1">
                        {activeTemplate.configuredOptions.enableSmartOptimization && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                            Smart Opt
                          </span>
                        )}
                        {activeTemplate.configuredOptions.removeComments && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400">
                            No Comments
                          </span>
                        )}
                        {activeTemplate.configuredOptions.minifyOutput && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400">
                            Minified
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 pt-1">
          <p>💡 Templates automatically configure system context and task instructions</p>
          <p>✨ Customize the applied template in sections below</p>
          {customTemplates.length === 0 && (
            <p>🎨 Click &quot;Create New&quot; to make your own custom template</p>
          )}
        </div>
      </div>

      {/* Template Editor Modal */}
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
