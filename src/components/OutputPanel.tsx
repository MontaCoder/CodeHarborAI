import { Check, ClipboardCopy, Download, FileTerminal } from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import Button from './ui/Button';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = memo(({ output }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);

  const lineCount = output ? output.split('\n').length : 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [output]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          'input:not([readonly]), textarea:not([readonly]), select, [contenteditable="true"]',
        )
      ) {
        return;
      }
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, isMac]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CodeHarborAI_Output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }, [output]);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            <FileTerminal
              aria-hidden="true"
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
            />
            Generated prompt
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Review the context, then copy it into any AI assistant.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleDownload}
            icon={
              downloaded ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Download aria-hidden="true" className="h-4 w-4" />
              )
            }
            variant="default"
            className="px-3 py-2 text-xs"
            title="Download the generated prompt as a .txt file"
          >
            {downloaded ? 'Downloaded' : 'Download .txt'}
          </Button>

          <Button
            onClick={handleCopy}
            icon={
              copied ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              )
            }
            variant="primary"
            className="px-3 py-2 text-xs"
            aria-live="polite"
          >
            {copied ? 'Copied to clipboard' : 'Copy prompt'}
            <kbd className="ml-1 hidden font-mono text-[10px] font-normal text-current sm:inline">
              {isMac ? '⌘' : 'Ctrl'}+⇧+C
            </kbd>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-inner">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div aria-hidden="true" className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              <span className="h-2 w-2 rounded-full bg-neutral-700" />
              <span className="h-2 w-2 rounded-full bg-neutral-800" />
            </div>
            <span className="truncate font-mono text-[11px] text-neutral-400">
              codeharbor-context.txt
            </span>
          </div>
          <span className="whitespace-nowrap font-mono text-[10px] tabular-nums text-neutral-400">
            {lineCount.toLocaleString()} lines ·{' '}
            {output.length.toLocaleString()} chars
          </span>
        </div>
        <textarea
          value={output}
          readOnly
          spellCheck={false}
          className="h-[clamp(16rem,45vh,32rem)] w-full resize-y bg-transparent p-4 font-mono text-[12.5px] leading-relaxed text-neutral-200 outline-none selection:bg-emerald-500/30 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-emerald-500/60 focus-visible:ring-inset"
          aria-label="Generated prompt text"
        />
      </div>
    </div>
  );
});

export default OutputPanel;
