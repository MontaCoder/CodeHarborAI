import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  primary?: boolean;
  secondary?: boolean;
  accent?: boolean;
  danger?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  icon,
  disabled = false,
  primary = false,
  secondary = false,
  accent = false,
  danger = false,
  className = '',
}) => {
  let buttonClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ";
  
  if (disabled) {
    buttonClass += "opacity-50 cursor-not-allowed ";
  }
  
  if (primary) {
    buttonClass += "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow ";
  } else if (secondary) {
    buttonClass += "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 ";
  } else if (accent) {
    buttonClass += "bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow ";
  } else if (danger) {
    buttonClass += "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow ";
  } else {
    buttonClass += "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ";
  }
  
  buttonClass += className;
  
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;