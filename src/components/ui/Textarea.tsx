import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  required, 
  className = '', 
  id,
  'aria-describedby': describedBy,
  ...props 
}) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const textareaClasses = `
    w-full min-h-[120px] resize-y rounded-xl border bg-white px-4 py-3 text-ink placeholder-ink-3
    focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
    transition-all duration-200
    ${error ? 'border-error bg-red-50' : 'border-brand-soft hover:border-brand'}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-ink-2">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      <textarea
        {...props}
        id={textareaId}
        className={textareaClasses}
        required={required}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
      />
      {error && (
        <p id={errorId} className="flex items-center text-sm text-error">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
