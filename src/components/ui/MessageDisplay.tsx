import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface MessageDisplayProps {
  message: string;
  type: 'success' | 'error';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setExiting(false);
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 300); // Corresponds to animation duration
      }, 4700); // Start fade out before 5s to complete by 5s
      return () => clearTimeout(timer);
    }
  }, [message, type]); // Re-trigger on new message or type change

  const baseClasses = "fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] w-auto max-w-md px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 ease-out";
  
  let typeClasses = '';
  let IconComponent = AlertCircle;

  if (type === 'success') {
    typeClasses = 'bg-emerald-500 border border-emerald-600/50 text-white dark:bg-emerald-600 dark:border-emerald-700/50';
    IconComponent = CheckCircle;
  } else { // error
    typeClasses = 'bg-red-500 border border-red-600/50 text-white dark:bg-red-600 dark:border-red-700/50';
    IconComponent = AlertCircle;
  }

  const animationClass = exiting ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0';

  if (!visible && !exiting) return null; // Don't render if not visible and not in process of exiting
  if (!message) return null; // Don't render if no message

  return (
    <div 
      role="alert"
      aria-live={type === 'error' ? "assertive" : "polite"}
      className={`${baseClasses} ${typeClasses} ${animationClass}`}
    >
      <IconComponent className="h-6 w-6 flex-shrink-0 opacity-90" />
      <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
      <button
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