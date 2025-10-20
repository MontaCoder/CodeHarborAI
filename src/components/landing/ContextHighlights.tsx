import type React from 'react';

const highlights = [
  {
    title: 'Smart Token Tracking',
    description: 'Real-time token count for GPT-5, Claude, and more',
    iconClass: 'bg-emerald-100 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Comment Removal',
    description: 'Strip comments to reduce context size',
    iconClass: 'bg-sky-100 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    title: 'File Filtering',
    description: 'Exclude node_modules, .git, and custom patterns',
    iconClass: 'bg-purple-100 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Preset Management',
    description: 'Save and load your favorite configurations',
    iconClass: 'bg-amber-100 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'GitHub Integration',
    description: 'Import directly from GitHub repositories',
    iconClass: 'bg-rose-100 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    title: 'One-Click Copy',
    description: 'Copy formatted output directly to clipboard',
    iconClass: 'bg-indigo-100 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

const ContextHighlights: React.FC = () => {
  return (
    <div className="mt-12 pt-12 border-t border-neutral-200 dark:border-neutral-800">
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Advanced Context Management
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlights.map(({ title, description, iconClass, iconColor }) => (
          <div key={title} className="flex items-start space-x-3">
            <div className={`mt-1 ${iconClass} p-2 rounded-lg flex-shrink-0`}>
              <svg
                className={`h-4 w-4 ${iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white text-sm mb-1">
                {title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextHighlights;
