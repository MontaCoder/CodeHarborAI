import {
  ArrowDown,
  Check,
  Copy,
  FileCode2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type React from 'react';

const PreviewCard: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[34rem] animate-fade-in-delay lg:mx-0"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-200/40 via-sky-200/30 to-transparent blur-2xl dark:from-emerald-500/10 dark:via-sky-500/10"
      />

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-lift dark:border-neutral-800 dark:bg-neutral-900">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

        <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>
            <span className="ml-1 flex min-w-0 items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
              <FileCode2 className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
              <span className="truncate font-mono">
                src/hooks/usePromptBuilder.ts
              </span>
            </span>
          </div>
          <span className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Local
          </span>
        </div>

        <div className="bg-neutral-950 px-4 py-4">
          <pre className="overflow-hidden font-mono text-[11px] leading-6 text-neutral-300">
            <code>
              <span className="select-none pr-4 text-neutral-400">1</span>
              <span className="text-violet-300">import</span>
              <span> {'{ buildPrompt }'} </span>
              <span className="text-violet-300">from</span>
              <span className="text-emerald-300"> './prompt'</span>
              {';'}
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">2</span>
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">3</span>
              <span className="text-violet-300">const</span>
              <span> files = </span>
              <span className="text-violet-300">await</span>
              <span> selectFiles({'{'}</span>
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">4</span>
              <span>{'  '}source: </span>
              <span className="text-emerald-300">'local'</span>,{'\n'}
              <span className="select-none pr-4 text-neutral-400">5</span>
              <span>{'  '}ignore: [</span>
              <span className="text-emerald-300">'.git'</span>,
              <span className="text-emerald-300"> 'dist'</span>],
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">6</span>
              {'});'}
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">7</span>
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">8</span>
              <span className="text-violet-300">return</span>
              <span> buildPrompt(files, {'{'}</span>
              {'\n'}
              <span className="select-none pr-4 text-neutral-400">9</span>
              <span>{'  '}template: </span>
              <span className="text-emerald-300">'code-review'</span>,{'\n'}
              <span className="select-none pr-4 text-neutral-400">10</span>
              <span>{'  '}budget: </span>
              <span className="text-sky-300">200_000</span>,{'\n'}
              <span className="select-none pr-4 text-neutral-400">11</span>
              {'});'}
            </code>
          </pre>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            <ArrowDown className="h-3 w-3 text-emerald-500" />
            generated prompt
          </span>
          <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <div className="px-4 pb-4">
          <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 px-3.5 py-2 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                Code review context
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                <span className="rounded-full bg-white px-2 py-0.5 font-medium ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800">
                  ~3.8k tokens
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                  ready
                </span>
              </div>
            </div>
            <div className="space-y-1 px-3.5 py-3 font-mono text-[10.5px] leading-5 text-neutral-500 dark:text-neutral-400">
              <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                ## Project context
              </p>
              <p>React 19 · TypeScript · Tailwind CSS</p>
              <p className="pt-1 font-semibold text-neutral-700 dark:text-neutral-200">
                ## src/hooks/usePromptBuilder.ts
              </p>
              <p className="truncate">
                export function usePromptBuilder(options) {'{'}
              </p>
              <p className="truncate"> return assemblePrompt(options);</p>
              <p className="truncate">{'}'}</p>
              <p className="pt-1 font-semibold text-neutral-700 dark:text-neutral-200">
                ## Review task
              </p>
              <p className="truncate">
                Check correctness, security, and edge cases.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200/80 bg-white/70 px-3.5 py-2 text-[10px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
              <span>12 files · 1,204 lines</span>
              <span className="inline-flex items-center gap-1 font-medium text-neutral-500 dark:text-neutral-400">
                <Copy className="h-3 w-3" />
                copy to any AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
