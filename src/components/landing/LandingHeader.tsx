import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import type React from 'react';
import { themeToggleClasses } from '../../styles/classes';
import { GitHubIcon } from '../icons/BrandIcons';

interface LandingHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGetStarted: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  theme,
  onToggleTheme,
  onGetStarted,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-stone-50/80 backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-950/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label="CodeHarborAI home"
        >
          <img
            src="/codeharborai_logo.svg"
            alt=""
            className="h-8 w-8 transition-transform duration-300 group-hover:-rotate-6"
          />
          <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            CodeHarbor
            <span className="text-emerald-700 dark:text-emerald-400">AI</span>
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 text-sm font-medium text-neutral-600 md:flex dark:text-neutral-400"
        >
          <a
            href="#workflow"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-white hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-white"
          >
            How it works
          </a>
          <a
            href="#features"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-white hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-white"
          >
            Features
          </a>
          <a
            href="https://github.com/MontaCoder/CodeHarborAI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-white hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-white"
          >
            <GitHubIcon aria-hidden="true" className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className={themeToggleClasses}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Moon aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 sm:px-3.5 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            aria-label="Open workspace"
          >
            <span className="hidden sm:inline">Open workspace</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
