import React, { useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  required, 
  options,
  placeholder = 'Select an option',
  className = '', 
  id,
  'aria-describedby': describedBy,
  ...props 
}) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const selectClasses = `
    w-full cursor-pointer rounded-xl border bg-white px-4 py-3 text-ink
    focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
    transition-all duration-200
    ${error ? 'border-error bg-red-50' : 'border-brand-soft hover:border-brand'}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-2">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      <select
        {...props}
        id={selectId}
        className={selectClasses}
        required={required}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="flex items-center text-sm text-error">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
