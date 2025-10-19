import {
  CheckCircle,
  Copy,
  Download,
  FileText as FileTextIcon,
} from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useState } from 'react';
import Button from './ui/Button';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = memo(({ output }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [output]);

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
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center">
        <FileTextIcon className="w-5 h-5 mr-2.5 text-emerald-500 dark:text-emerald-400" />
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
          Generated Prompt Output
        </h2>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <textarea
            value={output}
            readOnly
            className="w-full h-[24rem] min-h-[16rem] p-4 border-0 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-100 font-mono text-sm focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-150 resize-y shadow-sm"
            aria-label="Combined output text"
          />

          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-md flex items-center justify-center transition-all duration-150 ease-in-out active:scale-95
                ${
                  copied
                    ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                    : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              aria-live="polite"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            onClick={handleDownload}
            icon={
              downloaded ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
            primary
            className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
          >
            {downloaded ? 'Downloaded!' : 'Download as .txt'}
          </Button>

          <Button
            onClick={handleCopy}
            icon={
              copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )
            }
            secondary
            className="w-full sm:w-auto text-sm px-5 py-2.5 shadow-md hover:shadow-lg"
            aria-live="polite"
          >
            {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default OutputPanel;
