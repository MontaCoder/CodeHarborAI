import { AlertTriangle, BarChart2, CheckSquare } from 'lucide-react';
import type React from 'react';
import { memo, useEffect, useState } from 'react';

interface StatsPanelProps {
  totalSize: number;
  totalLines: number;
}

const StatsPanel: React.FC<StatsPanelProps> = memo(
  ({ totalSize, totalLines }) => {
    const [warning, setWarning] = useState<string>('');

    useEffect(() => {
      const sizeKB = totalSize / 1024;
      if (sizeKB > 500) {
        setWarning(
          'Context Alert: Exceeds typical capacity for Claude Sonnet 3.5 (est. >500KB).',
        );
      } else if (sizeKB > 150) {
        // Adjusted threshold for GPT-4o/Opus (est. ~128k-200k tokens)
        setWarning(
          'Context Alert: May approach capacity for models like GPT-4o/Opus (est. >150KB).',
        );
      } else {
        setWarning('');
      }
    }, [totalSize]);

    const formatNumber = (num: number) => {
      return num.toLocaleString();
    };

    const sizeKB = totalSize / 1024;
    const progressPercentage = Math.min(100, (sizeKB / 500) * 100); // Max out at 500KB for progress bar visual
    let progressBarColor = 'bg-emerald-500';
    if (sizeKB > 500) {
      progressBarColor = 'bg-red-500';
    } else if (sizeKB > 150) {
      progressBarColor = 'bg-yellow-500';
    }

    return (
      <div className="animate-fade-in space-y-5">
        <div className="flex items-center">
          <BarChart2 className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Performance Stats
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Size:
            </span>
            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {sizeKB.toFixed(2)} KB
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Lines:
            </span>
            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {formatNumber(totalLines)}
            </span>
          </div>

          <div className="pt-1">
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${progressBarColor}`}
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={sizeKB}
                aria-valuemin={0}
                aria-valuemax={500} // Corresponds to 100% on the bar
              ></div>
            </div>
          </div>

          {warning && (
            <div className="mt-2 flex items-start space-x-2.5 text-sm text-red-600 dark:text-red-400 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
              <span className="leading-snug">{warning}</span>
            </div>
          )}
          {!warning && totalSize > 0 && (
            <div className="mt-2 flex items-start space-x-2.5 text-sm text-emerald-700 dark:text-emerald-300 p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30">
              <CheckSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span className="leading-snug">
                Context size looks good for most models.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default StatsPanel;
