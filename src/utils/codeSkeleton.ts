/**
 * Code Skeleton Extraction Utility
 * Extracts structural elements from code while eliding implementation bodies.
 * Browser-safe (no AST parser) - uses regex and brace balancing.
 */

export interface SkeletonOptions {
  bodyElisionThreshold: number;
  preserveJSDoc: boolean;
  describeElidedBodies: boolean;
}

export interface FileSkeleton {
  path: string;
  imports: string[];
  exports: string[];
  types: string[];
  declarations: string[];
  constants: string[];
  originalLines: number;
  skeletonLines: number;
}

function extractBalancedBlock(content: string, startIndex: number): string {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (!inString) {
      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
      }
    } else if (inString && char === stringChar) {
      inString = false;
    }
    if (!inString) {
      if (char === '{' || char === '(' || char === '[') depth++;
      if (char === '}' || char === ')' || char === ']') depth--;
      if (depth === 0 && (char === '}' || char === ')' || char === ']')) {
        return content.slice(startIndex, i + 1);
      }
    }
  }
  return content.slice(startIndex);
}

export function extractImports(content: string): string[] {
  const lines = content.split('\n');
  const imports: string[] = [];
  let currentImport = '';
  let inMultiline = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
    if (!inMultiline) {
      if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
        if (trimmed.includes('{') && !trimmed.includes('}')) {
          currentImport = trimmed;
          inMultiline = true;
        } else if (trimmed.endsWith(';')) {
          imports.push(trimmed);
        } else if (trimmed.includes('from ') || trimmed.includes('=>')) {
          imports.push(trimmed);
        }
      }
    } else {
      currentImport += ' ' + trimmed;
      if (trimmed.includes('}')) {
        inMultiline = false;
        imports.push(currentImport.trim());
        currentImport = '';
      }
    }
  }
  return imports;
}

export function extractTypeDeclarations(content: string): string[] {
  const types: string[] = [];
  const patterns = [
    /(?:export\s+)?interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g,
    /(?:export\s+)?type\s+\w+[\s\S]*?=[\s\S]*?;/g,
    /(?:export\s+)?enum\s+\w+[\s\S]*?\{[\s\S]*?\}/g,
  ];
  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) types.push(match[0]);
    }
  }
  return types;
}

function extractJSDocAbove(content: string, pos: number): string {
  const before = content.slice(0, pos);
  const lines = before.split('\n');
  let jsdoc = '';
  let foundStart = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed === '*/') foundStart = true;
    if (foundStart) {
      jsdoc = lines[i] + '\n' + jsdoc;
      if (trimmed.startsWith('/**')) return jsdoc.trim();
    } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
      break;
    }
  }
  return '';
}

export function extractFunctionSkeletons(
  content: string,
  threshold: number,
  preserveJSDoc = true
): string[] {
  const functions: string[] = [];
  const lines = content.split('\n');
  const patterns = [
    /(?:export\s+)?(?:async\s+)?function\s+[*\s]*\w+\s*\([^)]*\)\s*\{/,
    /(?:export\s+)?const\s+\w+\s*[:=].*?=>\s*\{/,
    /(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?function\s*\(/,
  ];
  let i = 0;
  while (i < lines.length) {
    const fullText = lines.slice(i).join('\n');
    let matched = false;
    for (const pattern of patterns) {
      const match = fullText.match(pattern);
      if (match && match.index === 0) {
        matched = true;
        const signature = match[0];
        const jsdoc = preserveJSDoc ? extractJSDocAbove(content, content.indexOf(fullText)) : '';
        const openBraceIdx = signature.lastIndexOf('{');
        if (openBraceIdx === -1) {
          functions.push((jsdoc ? jsdoc + '\n' : '') + signature);
          i += signature.split('\n').length;
          break;
        }
        const blockStart = content.indexOf(fullText) + openBraceIdx;
        const block = extractBalancedBlock(content, blockStart);
        const blockLines = block.split('\n').length;
        if (blockLines <= threshold) {
          functions.push((jsdoc ? jsdoc + '\n' : '') + signature + block.slice(1));
        } else {
          const elided = signature + '\n  // ... ' + (blockLines - 2) + ' lines elided\n}';
          functions.push((jsdoc ? jsdoc + '\n' : '') + elided);
        }
        i += countLines(content, content.indexOf(fullText), blockStart + block.length);
        break;
      }
    }
    if (!matched) i++;
  }
  return functions;
}

function countLines(content: string, start: number, end: number): number {
  return content.slice(start, end).split('\n').length;
}

export function extractClassSkeletons(
  content: string,
  threshold: number,
  preserveJSDoc = true
): string[] {
  const classes: string[] = [];
  const classPattern = /(?:export\s+)?class\s+\w+(?:\s+extends\s+\w+)?(?:\s+implements\s+[^{]+)?\s*\{/g;
  let match;
  while ((match = classPattern.exec(content)) !== null) {
    const classStart = match.index;
    const classHeader = match[0];
    const openBraceIdx = classHeader.lastIndexOf('{');
    const blockStart = classStart + openBraceIdx;
    const block = extractBalancedBlock(content, blockStart);
    const jsdoc = preserveJSDoc ? extractJSDocAbove(content, classStart) : '';
    const body = block.slice(1, -1);
    const bodyLines = body.split('\n');
    const processedBody: string[] = [];
    let j = 0;
    while (j < bodyLines.length) {
      const line = bodyLines[j];
      const trimmed = line.trim();
      const methodMatch = trimmed.match(/(?:async\s+)?(?:get|set|\w+)\s*\(/);
      const isMethod = methodMatch && trimmed.includes('(');
      if (isMethod && trimmed.includes('{')) {
        const methodStart = bodyLines.slice(j).join('\n');
        const braceIdx = methodStart.indexOf('{');
        if (braceIdx !== -1) {
          const methodBlock = extractBalancedBlock(methodStart, braceIdx);
          const methodLines = methodBlock.split('\n').length;
          if (methodLines <= threshold) {
            processedBody.push(line);
            for (let k = 1; k < methodLines; k++) {
              if (j + k < bodyLines.length) processedBody.push(bodyLines[j + k]);
            }
            j += methodLines;
          } else {
            processedBody.push(line);
            processedBody.push('  // ... ' + (methodLines - 2) + ' lines elided');
            processedBody.push('  }');
            j += methodLines;
          }
        } else {
          processedBody.push(line);
          j++;
        }
      } else {
        processedBody.push(line);
        j++;
      }
    }
    const skeleton = (jsdoc ? jsdoc + '\n' : '') + classHeader + '\n' + processedBody.join('\n') + '\n}';
    classes.push(skeleton);
  }
  return classes;
}

export function extractTopLevelConstants(content: string): string[] {
  const constants: string[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:export\s+)?const\s+\w+\s*[:=]\s*(.+);?$/);
    if (match && match[1] && match[1].length < 100) {
      constants.push(trimmed);
    }
  }
  return constants;
}

export function assembleSkeleton(_path: string, skeleton: FileSkeleton): string {
  const parts: string[] = [];
  if (skeleton.imports.length > 0) parts.push(skeleton.imports.join('\n'));
  if (skeleton.types.length > 0) parts.push(skeleton.types.join('\n\n'));
  if (skeleton.constants.length > 0) parts.push(skeleton.constants.join('\n'));
  if (skeleton.declarations.length > 0) parts.push(skeleton.declarations.join('\n\n'));
  const output = parts.join('\n\n');
  skeleton.skeletonLines = output.split('\n').length;
  return output;
}
