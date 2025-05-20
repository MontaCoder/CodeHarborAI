import React, { useEffect, useState } from 'react';
import { BarChart2, AlertTriangle } from 'lucide-react';

interface StatsPanelProps {
  totalSize: number;
  totalLines: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ totalSize, totalLines }) => {
  const [warning, setWarning] = useState<string>('');
  
  useEffect(() => {
    if ((totalSize / 1024) > 500) {
      setWarning("Warning: probably too large to fit in Claude 3.5 Sonnet context window!");
    } else if ((totalSize / 1024) > 200) {
      setWarning("Warning: probably too large to fit in GPT-4o or o1 context window!");
    } else {
      setWarning("");
    }
  }, [totalSize]);
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" />
          Stats
        </h2>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total size:</span>
          <span className="text-md font-medium text-gray-800 dark:text-gray-200">
            {(totalSize / 1024).toFixed(2)} KB
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total lines:</span>
          <span className="text-md font-medium text-gray-800 dark:text-gray-200">
            {formatNumber(totalLines)}
          </span>
        </div>
        
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mt-2">
          <div 
            className={`h-2.5 rounded-full ${
              (totalSize / 1024) > 500 ? 'bg-red-500' :
              (totalSize / 1024) > 200 ? 'bg-yellow-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, ((totalSize / 1024) / 5))}%` }}
          ></div>
        </div>
        
        {warning && (
          <div className="mt-3 flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;