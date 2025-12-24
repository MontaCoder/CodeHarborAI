import { Moon, Sun } from 'lucide-react';
import type React from 'react';

interface LandingHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="relative z-10 px-4 sm:px-6 py-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <img
          src="/codeharborai_logo.svg"
          alt="CodeHarborAI Logo"
          className="h-8 w-8 animate-[spin_20s_linear_infinite]"
          style={{ animationDirection: 'reverse' }}
        />
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          CodeHarborAI
        </h1>
      </div>
      <button
        onClick={onToggleTheme}
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
  );
};

export default LandingHeader;
