import {
  ChevronRight,
  Clock,
  Code,
  FileText,
  Save,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import type React from 'react';
import Button from '../ui/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const stats = [
  {
    iconWrapperClass: 'bg-emerald-100 dark:bg-emerald-500/20',
    icon: <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    label: '100% Private',
  },
  {
    iconWrapperClass: 'bg-sky-100 dark:bg-sky-500/20',
    icon: <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    label: 'Save Hours',
  },
  {
    iconWrapperClass: 'bg-purple-100 dark:bg-purple-500/20',
    icon: <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    label: 'Any AI Model',
  },
];

const featureCards = [
  {
    iconWrapperClass:
      'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/20',
    icon: (
      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    ),
    borderClass:
      'border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10',
    title: 'Select Any Files',
    description:
      'Choose files or entire folders from your local machine, with smart filtering.',
    chevronClass: 'group-hover:text-emerald-500',
  },
  {
    iconWrapperClass:
      'bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-500/10 dark:to-sky-500/20',
    icon: <Code className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
    borderClass:
      'border-neutral-200 dark:border-neutral-800 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-lg hover:shadow-sky-500/10',
    title: 'Optimize Output',
    description:
      'Remove comments, minify code, and track token usage for different AI models.',
    chevronClass: 'group-hover:text-sky-500',
  },
  {
    iconWrapperClass:
      'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/20',
    icon: <Save className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    borderClass:
      'border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/10',
    title: 'Save Your Presets',
    description:
      'Store and reuse your file selections and settings for future prompt creation.',
    chevronClass: 'group-hover:text-purple-500',
  },
];

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="max-w-xl text-center md:text-left animate-fade-in">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full mb-6 border border-emerald-200 dark:border-emerald-500/20">
        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          100% Local & Secure
        </span>
      </div>

      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
        Transform Your Code Into{' '}
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 text-transparent bg-clip-text animate-gradient">
            Perfect AI Prompts
          </span>
          <svg
            className="absolute -bottom-2 left-0 w-full"
            height="8"
            viewBox="0 0 300 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 5.5C50 2.5 100 1 150 3C200 5 250 3.5 299 5.5"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </h2>

      <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
        Securely select and combine your project files on your own machine to
        create optimized prompts for AI coding assistants.
      </p>

      {/* Stats */}
      <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-10">
        {stats.map(({ iconWrapperClass, icon, label }) => (
          <div
            key={label}
            className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400"
          >
            <div className={`${iconWrapperClass} p-2 rounded-lg`}>{icon}</div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="space-y-4 text-left mb-10">
        {featureCards.map(
          ({
            iconWrapperClass,
            icon,
            borderClass,
            title,
            description,
            chevronClass,
          }) => (
            <div
              key={title}
              className={`group flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border ${borderClass} transition-all duration-300 cursor-default`}
            >
              <div
                className={`${iconWrapperClass} mt-0.5 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
              >
                {icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-base mb-1">
                  {title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-neutral-400 group-hover:translate-x-1 transition-all duration-300 ${chevronClass}`}
              />
            </div>
          ),
        )}
      </div>

      {/* CTA Button */}
      <div className="flex justify-center md:justify-start">
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
      </div>
    </div>
  );
};

export default HeroSection;
