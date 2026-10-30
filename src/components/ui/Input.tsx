import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  required, 
  className = '', 
  id,
  'aria-describedby': describedBy,
  ...props 
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const inputClasses = `
    w-full rounded-xl border bg-white px-4 py-3 text-ink placeholder-ink-3
    focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
    transition-all duration-200
    ${error ? 'border-error bg-red-50' : 'border-brand-soft hover:border-brand'}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-2">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={inputClasses}
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

export default Input;
