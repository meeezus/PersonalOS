import { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const TextArea = ({ label, hint, className = '', ...props }: TextAreaProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-warrior-white">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-warrior-elevated border border-warrior-subtle rounded-lg
          px-4 py-3 text-warrior-white placeholder-warrior-muted
          focus:outline-none focus:border-warrior-gold/50 focus:ring-1 focus:ring-warrior-gold/30
          transition-colors resize-none
          ${className}
        `}
        {...props}
      />
      {hint && (
        <p className="text-xs text-warrior-muted">{hint}</p>
      )}
    </div>
  );
};
