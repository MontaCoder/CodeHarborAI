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
      hideTimer = setTimeout(() => setVisible(false), 300);
    }, 4700);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [message]);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExiting(true);
        setTimeout(() => setVisible(false), 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const typeClasses =
    type === 'success'
      ? 'bg-emerald-700 text-white dark:bg-emerald-500 dark:text-emerald-950'
      : 'bg-red-700 text-white dark:bg-red-500 dark:text-red-950';
  const IconComponent = type === 'success' ? CheckCircle : AlertCircle;

  const animationClass = exiting
    ? 'pointer-events-none -translate-y-3 opacity-0'
    : 'translate-y-0 opacity-100';

  if (!visible) return null;
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`fixed left-1/2 top-5 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-xl px-4 py-3 shadow-lift transition-all duration-300 ease-out ${typeClasses} ${animationClass}`}
    >
      <IconComponent
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 flex-shrink-0 opacity-90"
      />
      <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
      <button
        type="button"
        onClick={() => {
          setExiting(true);
          setTimeout(() => setVisible(false), 300);
        }}
        className="-mr-1 rounded-md p-1 text-current opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss message"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MessageDisplay;
