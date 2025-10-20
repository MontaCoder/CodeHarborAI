import { Sparkles, Zap } from 'lucide-react';
import type React from 'react';

const PreviewCard: React.FC = () => {
  return (
    <div className="max-w-md w-full animate-fade-in-delay relative">
      {/* Floating Elements */}
      <div className="absolute -top-6 -right-6 bg-gradient-to-br from-emerald-500 to-sky-500 p-3 rounded-xl shadow-xl animate-bounce-slow">
        <Sparkles className="h-6 w-6 text-white" />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm relative">
        {/* Gradient Bar */}
        <div className="relative h-3 bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>

        <div className="p-6">
          {/* Window Controls */}
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
            <div className="h-3 w-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer"></div>
            <div className="ml-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
              CodeHarborAI
            </div>
          </div>

          {/* File List with Animation */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2.5 animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-4 h-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                <svg
                  className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-md w-full"></div>
            </div>

            <div className="flex items-center space-x-2.5 animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div
                className="w-4 h-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm flex items-center justify-center flex-shrink-0 animate-pulse-slow"
                style={{ animationDelay: '0.5s' }}
              >
                <svg
                  className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-md w-10/12"></div>
            </div>

            <div className="flex items-center space-x-2.5 animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <div
                className="w-4 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-sm flex-shrink-0 animate-pulse-slow"
                style={{ animationDelay: '1s' }}
              ></div>
              <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-md w-8/12"></div>
            </div>

            {/* Code Preview */}
            <div
              className="mt-8 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-lg w-full p-4 border border-neutral-200 dark:border-neutral-700 animate-slide-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="space-y-2">
                <div className="h-2 bg-emerald-500/30 rounded w-3/4 animate-pulse-slow"></div>
                <div className="h-2 bg-sky-500/30 rounded w-1/2 animate-pulse-slow" style={{ animationDelay: '0.3s' }}></div>
                <div className="h-2 bg-purple-500/30 rounded w-2/3 animate-pulse-slow" style={{ animationDelay: '0.6s' }}></div>
              </div>
            </div>

            {/* Generate Button */}
            <div
              className="relative h-12 bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 rounded-lg w-40 mx-auto mt-6 flex items-center justify-center text-white text-sm font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden animate-slide-in"
              style={{ animationDelay: '0.5s' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Generate
                <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-sky-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
