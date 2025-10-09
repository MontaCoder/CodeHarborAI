import React from 'react';
import { FileText, Code, Save, Zap, Sun, Moon, Sparkles, Shield, Clock, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <header className="relative z-10 px-4 sm:px-6 py-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <img src="/codeharborai_logo.svg" alt="CodeHarborAI Logo" className="h-8 w-8 animate-[spin_20s_linear_infinite]" style={{ animationDirection: 'reverse' }} />
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">CodeHarborAI</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 transition-colors duration-150"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-4 sm:px-6 py-12 md:py-20">
        <div className="max-w-xl text-center md:text-left animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full mb-6 border border-emerald-200 dark:border-emerald-500/20">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">100% Local & Secure</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            Transform Your Code Into{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 text-transparent bg-clip-text animate-gradient">
                Perfect AI Prompts
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5.5C50 2.5 100 1 150 3C200 5 250 3.5 299 5.5" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="50%" stopColor="#0ea5e9"/>
                    <stop offset="100%" stopColor="#a855f7"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            Securely select and combine your project files on your own machine to create optimized prompts for AI coding assistants.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-10">
            <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
              <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-lg">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium">100% Private</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
              <div className="bg-sky-100 dark:bg-sky-500/20 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-sm font-medium">Save Hours</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
              <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg">
                <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium">Any AI Model</span>
            </div>
          </div>
          {/* Feature Cards */}
          <div className="space-y-4 text-left mb-10">
            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-default">
              <div className="mt-0.5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-base mb-1">Select Any Files</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">Choose files or entire folders from your local machine, with smart filtering.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            
            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 cursor-default">
              <div className="mt-0.5 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-500/10 dark:to-sky-500/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Code className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-base mb-1">Optimize Output</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">Remove comments, minify code, and track token usage for different AI models.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            
            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-default">
              <div className="mt-0.5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Save className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-base mb-1">Save Your Presets</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">Store and reuse your file selections and settings for future prompt creation.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button 
              onClick={onGetStarted} 
              icon={<Zap className="h-5 w-5" />} 
              primary
              className="group relative px-8 py-4 text-base shadow-lg hover:shadow-2xl hover:shadow-emerald-500/30 w-full sm:w-auto transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started Free
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <button className="px-8 py-4 text-base font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 w-full sm:w-auto">
              View Demo
            </button>
          </div>
        </div>

        {/* Enhanced Demo Preview */}
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
              <div className="ml-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">CodeHarborAI</div>
            </div>
              
              {/* File List with Animation */}
            <div className="space-y-3.5">
                <div className="flex items-center space-x-2.5 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                  <div className="w-4 h-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                  <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                  <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-md w-full"></div>
              </div>
                
                <div className="flex items-center space-x-2.5 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-4 h-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm flex items-center justify-center flex-shrink-0 animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-md w-10/12"></div>
                </div>
                
                <div className="flex items-center space-x-2.5 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <div className="w-4 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-sm flex-shrink-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                  <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-md w-8/12"></div>
              </div>
                
                {/* Code Preview */}
                <div className="mt-8 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-lg w-full p-4 border border-neutral-200 dark:border-neutral-700 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                  <div className="space-y-2">
                    <div className="h-2 bg-emerald-500/30 rounded w-3/4 animate-pulse-slow"></div>
                    <div className="h-2 bg-sky-500/30 rounded w-1/2 animate-pulse-slow" style={{ animationDelay: '0.3s' }}></div>
                    <div className="h-2 bg-purple-500/30 rounded w-2/3 animate-pulse-slow" style={{ animationDelay: '0.6s' }}></div>
              </div>
              </div>
                
                {/* Generate Button */}
                <div className="relative h-12 bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 rounded-lg w-40 mx-auto mt-6 flex items-center justify-center text-white text-sm font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden animate-slide-in" style={{ animationDelay: '0.5s' }}>
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
      </main>
    </div>
  );
};

export default LandingPage;