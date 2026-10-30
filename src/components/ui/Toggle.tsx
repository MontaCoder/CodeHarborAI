import type React from 'react';
import type { ReactNode } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-start justify-between gap-4 rounded-lg py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="flex min-w-0 items-start gap-2.5">
        {icon && (
          <span className="mt-0.5 flex-shrink-0 text-neutral-400 transition-colors group-hover:text-emerald-600 dark:text-neutral-500 dark:group-hover:text-emerald-400">
            {icon}
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-100">
            {label}
          </span>
          {description && (
            <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {description}
            </span>
          )}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`relative mt-1 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked
            ? 'bg-emerald-600 dark:bg-emerald-500'
            : 'bg-neutral-300 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[1.15rem]' : 'translate-x-[0.19rem]'
          }`}
        />
      </span>
    </button>
  );
};

export default Toggle;
