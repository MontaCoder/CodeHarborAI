import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface MessageDisplayProps {
  message: string;
  type: 'success' | 'error';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [message]);
  
  const bgColor = type === 'success' 
    ? 'bg-green-50 dark:bg-green-900/30' 
    : 'bg-red-50 dark:bg-red-900/30';
    
  const textColor = type === 'success' 
    ? 'text-green-800 dark:text-green-200' 
    : 'text-red-800 dark:text-red-200';
    
  const iconColor = type === 'success' 
    ? 'text-green-500 dark:text-green-400' 
    : 'text-red-500 dark:text-red-400';
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-down">
      <div className={`${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md`}>
        {type === 'success' ? (
          <CheckCircle className={`${iconColor} h-5 w-5 mr-3 flex-shrink-0`} />
        ) : (
          <AlertCircle className={`${iconColor} h-5 w-5 mr-3 flex-shrink-0`} />
        )}
        <div className="flex-1">{message}</div>
        <button
          onClick={() => setVisible(false)}
          className="ml-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageDisplay;