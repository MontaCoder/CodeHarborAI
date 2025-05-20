import React, { useState } from 'react';
import { Copy, Download, CheckCircle } from 'lucide-react';
import Button from './ui/Button';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'combined_files.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Combined Output
        </h2>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <textarea
            value={output}
            readOnly
            className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <button 
              onClick={handleCopy}
              className={`p-1.5 rounded-md ${copied 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'}`}
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-3">
          <Button
            onClick={handleDownload}
            icon={<Download className="h-4 w-4" />}
            primary
          >
            Download as Text
          </Button>
          
          <Button
            onClick={handleCopy}
            icon={copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            secondary
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;