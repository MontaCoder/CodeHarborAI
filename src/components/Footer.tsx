import { Code2, Heart, Mail, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { GitHubIcon } from './icons/BrandIcons';

interface FooterProps {
  compact?: boolean;
}

const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <footer className="border-t border-neutral-200/80 bg-white/60 dark:border-neutral-800/80 dark:bg-neutral-950/60">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-3 px-5 pb-24 pt-5 text-xs text-neutral-500 sm:flex-row sm:px-6 xl:py-5 dark:text-neutral-400">
          <div className="flex items-center gap-2.5">
            <img src="/codeharborai_logo.svg" alt="" className="h-5 w-5" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              CodeHarborAI
            </span>
            <span
              aria-hidden="true"
              className="text-neutral-300 dark:text-neutral-700"
            >
              /
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck
                aria-hidden="true"
                className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
              />
              Local-only processing
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/MontaCoder/CodeHarborAI"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://github.com/MontaCoder/CodeHarborAI/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              License
            </a>
            <span>© {new Date().getFullYear()} Montassar Hajri</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-neutral-200/80 bg-white/70 dark:border-neutral-800/80 dark:bg-neutral-950/70">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/codeharborai_logo.svg" alt="" className="h-9 w-9" />
              <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                CodeHarbor
                <span className="text-emerald-700 dark:text-emerald-400">
                  AI
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Turn your codebase into AI-ready context. Files stay on your
              device, and every prompt is shaped with your budget in mind.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              100% local processing
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Project
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/MontaCoder/CodeHarborAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-400"
                >
                  <Code2 aria-hidden="true" className="h-4 w-4" />
                  GitHub repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/MontaCoder/CodeHarborAI#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-400"
                >
                  <Code2 aria-hidden="true" className="h-4 w-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/MontaCoder/CodeHarborAI/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-400"
                >
                  <Code2 aria-hidden="true" className="h-4 w-4" />
                  MIT license
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Connect
            </h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <a
                href="https://github.com/MontaCoder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-400"
              >
                <GitHubIcon aria-hidden="true" className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="mailto:contact@montassar.dev"
                className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-400"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
                contact@montassar.dev
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200/80 pt-6 text-xs text-neutral-500 sm:flex-row dark:border-neutral-800 dark:text-neutral-400">
          <p>
            © {new Date().getFullYear()} Montassar Hajri. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Built with
            <span className="sr-only">love</span>
            <Heart
              aria-hidden="true"
              className="h-3.5 w-3.5 fill-current text-red-500"
            />
            for developers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
