import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  error,
  className = '',
  size = 'md',
  variant = 'default',
}: Readonly<DropdownProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sizeClass = (() => {
    if (size === 'sm') return 'p-1.5 text-xs';
    if (size === 'lg') return 'p-3 text-base';
    return 'p-2 text-sm';
  })();
  const variantClass = variant === 'default' 
    ? 'bg-white border-gray-300 focus:ring-interswitch-primary focus:border-interswitch-primary hover:border-gray-400 cursor-pointer'
    : 'bg-transparent border-gray-300 focus:ring-interswitch-primary focus:border-interswitch-primary hover:border-gray-400 cursor-pointer';
  
  const buttonClasses = `
    w-full flex items-center justify-between rounded-md border transition-colors
    ${sizeClass}
    ${variantClass}
    ${disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50' : ''}
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={buttonClasses}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${label}-dropdown` : undefined}
      >
        <span className={`mr-2 truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li 
                key={option.value} 
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors
                    ${
                      option.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
                    }
                    ${option.value === value ? 'bg-interswitch-primary text-white hover:bg-interswitch-dark' : ''}
                  `}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
