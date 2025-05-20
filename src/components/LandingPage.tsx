import React from 'react';
import { FileText, Code, Save, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">SourcePrompt</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-6 py-12">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Transform Your <span className="text-emerald-600 dark:text-emerald-400">Code</span> Into Perfect AI Prompts
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Securely select and combine your project files on your own machine to create optimized prompts for AI coding assistants.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Select Any Files</h3>
                <p className="text-gray-600 dark:text-gray-400">Choose files or entire folders from your local machine, with smart filtering.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                <Code className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Optimize Output</h3>
                <p className="text-gray-600 dark:text-gray-400">Remove comments, minify code, and track token usage for different AI models.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                <Save className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Save Your Presets</h3>
                <p className="text-gray-600 dark:text-gray-400">Store and reuse your file selections and settings for future prompt creation.</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Button onClick={onGetStarted} icon={<Zap className="h-5 w-5" />} primary>
              Get Started
            </Button>
          </div>
        </div>
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-1 bg-gradient-to-r from-emerald-500 to-blue-500">
            <div className="h-2 w-full"></div>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">SourcePrompt</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
              </div>
              <div className="mt-6 h-24 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-8 bg-emerald-500 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;