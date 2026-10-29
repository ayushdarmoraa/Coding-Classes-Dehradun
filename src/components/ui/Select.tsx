import React from 'react';

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
  ...props 
}) => {
  const selectClasses = `
    w-full px-4 py-3 border rounded-xl text-gray-900 bg-white
    focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
    transition-all duration-200 cursor-pointer
    ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={selectClasses}
        {...props}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [props["aria-describedby"], error && props.id ? `${props.id}-error` : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={props.id ? `${props.id}-error` : undefined} className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
