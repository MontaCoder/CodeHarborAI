export interface DocumentationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemContext: string;
  taskInstructions: string;
  isCustom?: boolean;
  configuredOptions?: {
    enableSmartOptimization?: boolean;
    removeComments?: boolean;
    minifyOutput?: boolean;
    maxTotalTokens?: number;
    prioritizeDocumentation?: boolean;
    includeStructureMap?: boolean;
    adaptiveCompression?: boolean;
    bodyElisionThreshold?: number;
    adaptiveBodyThreshold?: boolean;
    preserveTypeDeclarations?: boolean;
    preserveModuleSurface?: boolean;
  };
  createdAt?: number;
  updatedAt?: number;
}

export const documentationTemplates: DocumentationTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Comprehensive code review and suggestions',
    icon: '🔍',
    systemContext:
      'Below is the complete codebase for a thorough code review. Please analyze for code quality, best practices, potential bugs, and security vulnerabilities.',
    taskInstructions: 'Perform a comprehensive code review focusing on:\n- Code quality and maintainability\n- Performance optimizations\n- Security vulnerabilities\n- Best practices and design patterns\n- Potential bugs or edge cases',
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Generate comprehensive API documentation',
    icon: '📚',
    systemContext:
      'The following codebase contains API endpoints, routes, and services that need documentation. Please analyze the code structure and API patterns.',
    taskInstructions: 'Generate comprehensive API documentation including:\n- All available endpoints and routes\n- Request/response formats\n- Authentication requirements\n- Error handling\n- Usage examples',
  },
  {
    id: 'architecture-analysis',
    name: 'Architecture Analysis',
    description: 'Analyze project architecture and structure',
    icon: '🏗️',
    systemContext:
      'Below is the complete project structure and codebase for architecture analysis. Focus on understanding the overall design, patterns, and organization.',
    taskInstructions: 'Analyze the project architecture and provide:\n- High-level architecture overview\n- Key design patterns used\n- Data flow and component relationships\n- Recommendations for improvements\n- Scalability considerations',
  },
  {
    id: 'debugging-help',
    name: 'Debugging Assistant',
    description: 'Help identify and fix bugs',
    icon: '🐛',
    systemContext:
      'The following codebase has issues that need debugging. Please analyze the code to identify potential bugs and provide fixes.',
    taskInstructions: 'Debug the codebase by:\n- Identifying potential bugs and errors\n- Analyzing error-prone patterns\n- Suggesting fixes and improvements\n- Explaining root causes\n- Providing preventive measures',
  },
  {
    id: 'refactoring',
    name: 'Refactoring Guide',
    description: 'Suggest refactoring improvements',
    icon: '♻️',
    systemContext:
      'This codebase needs refactoring to improve code quality, maintainability, and performance. Please analyze and suggest improvements.',
    taskInstructions: 'Provide refactoring recommendations:\n- Identify code smells and anti-patterns\n- Suggest better design patterns\n- Improve code organization\n- Enhance readability and maintainability\n- Optimize performance where applicable',
  },
  {
    id: 'testing-strategy',
    name: 'Testing Strategy',
    description: 'Develop comprehensive testing approach',
    icon: '🧪',
    systemContext:
      'Below is the codebase that requires a comprehensive testing strategy. Analyze the code to suggest appropriate test coverage.',
    taskInstructions: 'Create a testing strategy that includes:\n- Unit test recommendations\n- Integration test scenarios\n- Test coverage priorities\n- Edge cases to consider\n- Testing framework suggestions',
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Comprehensive security analysis',
    icon: '🔒',
    systemContext:
      'The following codebase requires a thorough security audit. Please analyze for security vulnerabilities and best practices.',
    taskInstructions: 'Perform a security audit focusing on:\n- Authentication and authorization flaws\n- Input validation and sanitization\n- SQL injection and XSS vulnerabilities\n- Secure data storage and transmission\n- Dependency vulnerabilities\n- Security best practices',
  },
  {
    id: 'onboarding-guide',
    name: 'Onboarding Guide',
    description: 'Create developer onboarding documentation',
    icon: '👋',
    systemContext:
      'This codebase needs comprehensive onboarding documentation for new developers. Analyze the structure and create a guide.',
    taskInstructions: 'Create an onboarding guide that includes:\n- Project overview and purpose\n- Technology stack explanation\n- Setup and installation steps\n- Codebase structure walkthrough\n- Development workflow\n- Common tasks and how to perform them',
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Identify and fix performance bottlenecks',
    icon: '⚡',
    systemContext:
      'The following codebase needs performance optimization. Please analyze for bottlenecks and suggest improvements.',
    taskInstructions: 'Optimize performance by:\n- Identifying performance bottlenecks\n- Analyzing algorithmic complexity\n- Suggesting caching strategies\n- Optimizing database queries\n- Reducing bundle size\n- Improving render performance',
  },
  {
    id: 'migration-guide',
    name: 'Migration Assistant',
    description: 'Help migrate to new technologies or versions',
    icon: '🚀',
    systemContext:
      'This codebase needs to be migrated to a newer version or different technology. Analyze the current implementation and provide migration guidance.',
    taskInstructions: 'Provide migration assistance:\n- Identify breaking changes\n- Suggest migration steps\n- Highlight deprecated patterns\n- Provide code transformation examples\n- Estimate migration complexity\n- Suggest testing strategies',
  },
];

export function getTemplateById(id: string): DocumentationTemplate | undefined {
  return documentationTemplates.find((template) => template.id === id);
}

export function applyTemplate(template: DocumentationTemplate) {
  return {
    systemContextText: template.systemContext,
    taskInstructionsText: template.taskInstructions,
    includeSystemContext: true,
    includeTaskInstructions: true,
    ...template.configuredOptions,
  };
}
