import {
  ArrowRight,
  FolderTree,
  HardDrive,
  LayoutTemplate,
  ShieldCheck,
} from 'lucide-react';
import type React from 'react';
import { GitHubIcon } from '../icons/BrandIcons';
import Button from '../ui/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const trustPoints = [
  {
    icon: <FolderTree aria-hidden="true" className="h-3.5 w-3.5" />,
    label: 'Local folders & GitHub',
  },
  {
    icon: <LayoutTemplate aria-hidden="true" className="h-3.5 w-3.5" />,
    label: '10+ ready-made templates',
  },
  {
    icon: <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />,
    label: 'Zero uploads, ever',
  },
];

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="animate-fade-in">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 motion-safe:animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Runs entirely in your browser
      </div>

      <h1 className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.035em] text-neutral-950 sm:text-[3.4rem] lg:text-[3.75rem] dark:text-white">
        Transform your code into{' '}
        <span className="font-serif font-normal italic text-emerald-600 dark:text-emerald-400">
          perfect
        </span>{' '}
        AI prompts.
      </h1>

      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
        Pick the files that matter, add the context an assistant needs, and
        export one structured prompt. Everything is processed on your machine
        and works with any AI model.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          onClick={onGetStarted}
          variant="primary"
          className="group w-full px-5 py-3 text-sm font-semibold shadow-md shadow-emerald-900/10 sm:w-auto"
        >
          Start building
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Button>
        <a
          href="https://github.com/MontaCoder/CodeHarborAI"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300/90 bg-white px-5 py-3 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 sm:w-auto dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <GitHubIcon aria-hidden="true" className="h-4 w-4" />
          Star on GitHub
        </a>
      </div>

      <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-neutral-200/80 pt-6 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        {trustPoints.map(({ icon, label }) => (
          <li key={label} className="inline-flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:text-emerald-400 dark:ring-neutral-800">
              {icon}
            </span>
            {label}
          </li>
        ))}
      </ul>

      <p className="mt-6 inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <HardDrive aria-hidden="true" className="h-3.5 w-3.5" />0 bytes
        uploaded. Your code never leaves this device.
      </p>
    </div>
  );
};

export default HeroSection;
