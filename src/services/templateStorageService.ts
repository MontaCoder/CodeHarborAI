/**
 * Template Storage Service
 * Handles persistence of custom templates using localStorage
 */

import type { DocumentationTemplate } from '../types/documentationTemplates';

const STORAGE_KEY = 'codeharborai-custom-templates';
const CUSTOM_ID_PREFIX = 'custom-';

/**
 * Generate a unique ID for custom templates
 */
function generateCustomId(): string {
  return `${CUSTOM_ID_PREFIX}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load custom templates from localStorage
 */
export function loadCustomTemplates(): DocumentationTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((template) => ({
      ...template,
      isCustom: true,
    }));
  } catch (error) {
    console.error('Failed to load custom templates from localStorage:', error);
    return [];
  }
}

/**
 * Save custom templates to localStorage
 */
function saveCustomTemplates(templates: DocumentationTemplate[]): void {
  try {
    const customOnly = templates.filter((t) => t.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
  } catch (error) {
    console.error('Failed to save custom templates to localStorage:', error);
  }
}

/**
 * Add a new custom template
 */
export function addCustomTemplate(
  template: Omit<DocumentationTemplate, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>
): DocumentationTemplate {
  const newTemplate: DocumentationTemplate = {
    ...template,
    id: generateCustomId(),
    isCustom: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const existing = loadCustomTemplates();
  existing.push(newTemplate);
  saveCustomTemplates(existing);

  return newTemplate;
}

/**
 * Update an existing custom template
 */
export function updateCustomTemplate(
  id: string,
  updates: Partial<Omit<DocumentationTemplate, 'id' | 'isCustom' | 'createdAt'>>
): DocumentationTemplate | null {
  const existing = loadCustomTemplates();
  const index = existing.findIndex((t) => t.id === id);

  if (index === -1) return null;

  existing[index] = {
    ...existing[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveCustomTemplates(existing);
  return existing[index];
}

/**
 * Delete a custom template by ID
 */
export function deleteCustomTemplate(id: string): boolean {
  const existing = loadCustomTemplates();
  const filtered = existing.filter((t) => t.id !== id);

  if (filtered.length === existing.length) return false;

  saveCustomTemplates(filtered);
  return true;
}

/**
 * Get all custom template IDs (for checking if an ID is custom)
 */
export function getCustomTemplateIds(): string[] {
  return loadCustomTemplates().map((t) => t.id);
}

/**
 * Check if a template ID is a custom template
 */
export function isCustomTemplate(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}
