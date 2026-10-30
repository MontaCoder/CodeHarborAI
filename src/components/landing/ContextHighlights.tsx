import { ClipboardCopy, Filter, Gauge, Scissors, Sparkles } from 'lucide-react';
import type React from 'react';
import { GitHubIcon } from '../icons/BrandIcons';

const highlights = [
  {
    title: 'Smart token tracking',
    description:
      'See an estimated prompt size before you export, with a live budget meter and per-file breakdown.',
    icon: Gauge,
    iconClass:
      'bg-emerald-50 text-emerald-600 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  },
  {
    title: 'Comment removal',
    description:
      'Strip comments and minify when you need to squeeze the most signal into the smallest context window.',
    icon: Scissors,
    iconClass:
      'bg-sky-50 text-sky-600 ring-sky-200/70 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
  },
  {
    title: 'File filtering',
    description:
      'Skip build folders, dependencies, and anything covered by the root .gitignore without manual cleanup.',
    icon: Filter,
    iconClass:
      'bg-violet-50 text-violet-600 ring-violet-200/70 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20',
  },
  {
    title: 'Smart optimization',
    description:
      'Heuristic, file-aware compression prioritizes important files and fits the rest into a configurable token budget.',
    icon: Sparkles,
    iconClass:
      'bg-amber-50 text-amber-600 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  },
  {
    title: 'GitHub integration',
    description:
      'Import a public repository in seconds, cache the metadata, and start with a selection that is already filtered.',
    icon: GitHubIcon,
    iconClass:
      'bg-neutral-100 text-neutral-700 ring-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700',
  },
  {
    title: 'One-click copy',
    description:
      'Export a clean, structured prompt to the clipboard or download it as a text file for later.',
    icon: ClipboardCopy,
    iconClass:
      'bg-rose-50 text-rose-600 ring-rose-200/70 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
  },
];

const ContextHighlights: React.FC = () => {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-20 sm:px-8 lg:pb-28"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Built for real codebases
        </p>
        <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
          Context engineering, not copy-paste.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          Every feature exists to help a model understand your project faster,
          with fewer tokens and less noise.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(({ title, description, icon: Icon, iconClass }) => (
          <div
            key={title}
            className="group rounded-2xl border border-neutral-200/80 bg-white/70 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${iconClass}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContextHighlights;
