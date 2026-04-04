import type React from 'react';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'default';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow',
  secondary:
    'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200',
  accent: 'bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow',
  default:
    'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700',
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  icon,
  disabled = false,
  variant = 'default',
  className = '',
}) => {
  const buttonClass = [
    'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
    disabled ? 'opacity-50 cursor-not-allowed' : VARIANT_CLASSES[variant],
    className,
  ].join(' ');

  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
