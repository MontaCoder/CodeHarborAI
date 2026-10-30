import { ClipboardCheck, FolderOpen, SlidersHorizontal } from 'lucide-react';
import type React from 'react';

const steps = [
  {
    number: '01',
    icon: FolderOpen,
    title: 'Choose your source',
    description:
      'Open a local folder or point to a public GitHub repository. Excludes and .gitignore rules are applied automatically.',
  },
  {
    number: '02',
    icon: SlidersHorizontal,
    title: 'Shape the context',
    description:
      'Apply a template, add task instructions, and let the token-aware optimizer prioritize what the model needs.',
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Copy and build',
    description:
      'Review the generated prompt, copy it, and paste it into Claude, ChatGPT, Copilot, or any other assistant.',
  },
];

const WorkflowSteps: React.FC = () => {
  return (
    <section
      id="workflow"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-20 sm:px-8 lg:pb-28"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          How it works
        </p>
        <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
          From repository to prompt in three steps.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          No setup, no accounts, and no context guesswork. Just a focused
          workflow that keeps your code on your machine.
        </p>
      </div>

      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map(({ number, icon: Icon, title, description }) => (
          <li
            key={number}
            className="group relative rounded-2xl border border-neutral-200/80 bg-white/70 p-5 shadow-sm transition-colors hover:border-emerald-300/80 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-emerald-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {number}
              </span>
            </div>
            <h3 className="mt-5 text-base font-semibold text-neutral-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default WorkflowSteps;
