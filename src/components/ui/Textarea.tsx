import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, showCharCount, maxLength, value, ...props }, ref) => {
    const length = typeof value === 'string' ? value.length : 0;
    const nearLimit = typeof maxLength === 'number' && length >= maxLength * 0.9;

    return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        value={value}
        maxLength={maxLength}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      <div className="flex items-center justify-between gap-3">
        {error ? <p className="text-xs text-red-600">{error}</p> : <span />}
        {showCharCount && typeof maxLength === 'number' && (
          <p className={cn('text-xs', nearLimit ? 'text-amber-600' : 'text-slate-400')}>
            {length}/{maxLength}
          </p>
        )}
      </div>
    </div>
    );
  }
);
Textarea.displayName = 'Textarea';
