import { AlertCircle, CheckCircle, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface MessageDisplayProps {
  message: string;
  type: 'success' | 'error';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!message) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    // Defer state updates to avoid sync setState-in-effect lint rule.
    const showTimer = setTimeout(() => {
      setVisible(true);
      setExiting(false);
    }, 0);

    const exitTimer = setTimeout(() => {
      setExiting(true);
      hideTimer = setTimeout(() => setVisible(false), 300); // animation duration
    }, 4700); // start fade out before 5s

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [message]); // Re-trigger on new message

  const baseClasses =
    'fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] w-auto max-w-md px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 ease-out';

  const typeClasses =
    type === 'success'
      ? 'bg-emerald-700 border border-emerald-800/50 text-white dark:bg-emerald-800 dark:border-emerald-900/50'
      : 'bg-red-600 border border-red-700/50 text-white dark:bg-red-700 dark:border-red-800/50';
  const IconComponent = type === 'success' ? CheckCircle : AlertCircle;

  const animationClass = exiting
    ? 'opacity-0 -translate-y-full'
    : 'opacity-100 translate-y-0';

  if (!visible && !exiting) return null; // Don't render if not visible and not in process of exiting
  if (!message) return null; // Don't render if no message

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`${baseClasses} ${typeClasses} ${animationClass}`}
    >
      <IconComponent className="h-6 w-6 flex-shrink-0 opacity-90" />
      <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
      <button
        type="button"
        onClick={() => {
          setExiting(true);
          setTimeout(() => setVisible(false), 300);
        }}
        className="ml-auto -mr-1 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-current opacity-70 hover:opacity-100"
        aria-label="Dismiss message"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MessageDisplay;
