import type React from 'react';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'default';

interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-700 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-800 active:bg-emerald-900 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400 dark:active:bg-emerald-300',
  secondary:
    'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 active:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/80',
  accent:
    'bg-sky-600 text-white shadow-sm hover:bg-sky-700 active:bg-sky-800 dark:bg-sky-500 dark:text-sky-950 dark:hover:bg-sky-400',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:text-red-950 dark:hover:bg-red-400',
  default:
    'border border-neutral-300/90 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-neutral-800',
};

const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  disabled = false,
  variant = 'default',
  className = '',
  type = 'button',
  ...props
}) => {
  const buttonClass = [
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150',
    disabled
      ? 'cursor-not-allowed bg-neutral-200 text-neutral-500 shadow-none dark:bg-neutral-800 dark:text-neutral-500'
      : VARIANT_CLASSES[variant],
    className,
  ].join(' ');

  return (
    <button type={type} className={buttonClass} disabled={disabled} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
