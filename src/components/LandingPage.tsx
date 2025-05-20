import React from 'react';
import { FileText, Code, Save, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <img src="/codeharborai_logo.svg" alt="CodeHarborAI Logo" className="h-8 w-8" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">CodeHarborAI</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900 transition-colors duration-150"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-4 sm:px-6 py-12 md:py-20">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Transform Your Code Into <span className="bg-gradient-to-r from-emerald-500 to-sky-500 text-transparent bg-clip-text">Perfect AI Prompts</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Securely select and combine your project files on your own machine to create optimized prompts for AI coding assistants.
          </p>
          <div className="space-y-6 text-left">
            <div className="flex items-start space-x-4 p-3 -m-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-150 cursor-default">
              <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-full flex-shrink-0">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white text-md">Select Any Files</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Choose files or entire folders from your local machine, with smart filtering.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 -m-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-150 cursor-default">
              <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-full flex-shrink-0">
                <Code className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white text-md">Optimize Output</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Remove comments, minify code, and track token usage for different AI models.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 -m-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-150 cursor-default">
              <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-full flex-shrink-0">
                <Save className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white text-md">Save Your Presets</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Store and reuse your file selections and settings for future prompt creation.</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center md:justify-start">
            <Button 
              onClick={onGetStarted} 
              icon={<Zap className="h-5 w-5" />} 
              primary
              className="px-8 py-3 text-base shadow-lg hover:shadow-emerald-400/40 dark:hover:shadow-emerald-600/40 w-full sm:w-auto transform hover:scale-105 transition-transform duration-150"
            >
              Get Started Now
            </Button>
          </div>
        </div>
        <div className="max-w-md w-full bg-white dark:bg-slate-800/70 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 backdrop-blur-md">
          <div className="p-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500">
            <div className="h-2 w-full"></div>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
              <div className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">CodeHarborAI</div>
            </div>
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-10/12"></div>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-4 h-4 bg-slate-100 dark:bg-slate-700/50 rounded-sm flex-shrink-0"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-8/12"></div>
              </div>
              <div className="mt-8 h-28 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full p-3">
                 <div className="h-full w-full bg-slate-200 dark:bg-slate-600/50 rounded animate-pulse"></div>
              </div>
              <div className="h-10 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-lg w-36 mx-auto mt-6 flex items-center justify-center text-white text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-150 cursor-pointer">
                Generate
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;