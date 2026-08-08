'use client';

import { ReactNode, useRef, useState } from 'react';
import { CaretDown, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  label,
  icon,
  className,
  clearable = false,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)} ref={ref}>
      {label && (
        <label className="text-xs font-semibold text-neutral-600 block mb-2">
          {label}
        </label>
      )}

      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border',
          'bg-white text-sm font-medium text-neutral-900',
          'transition-all duration-200',
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-100 shadow-md'
            : 'border-neutral-200 hover:border-neutral-300',
          disabled && 'opacity-50 cursor-not-allowed bg-neutral-50'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-neutral-600">{icon}</span>}
          <span className={cn(
            'truncate',
            !selectedOption && 'text-neutral-500'
          )}>
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {clearable && value && (
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Effacer la sélection"
            >
              <X size={16} className="text-neutral-400" />
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <CaretDown
              size={16}
              className="text-neutral-400"
              weight="bold"
            />
          </motion.div>
        </div>
      </button>

      {/* Dropdown Menu - Animé */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-3 py-3 text-sm text-neutral-500 text-center">
                  Aucune option disponible
                </div>
              ) : (
                options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full px-3 py-2.5 text-sm text-left font-medium',
                      'flex items-center gap-2 transition-colors duration-150',
                      value === option.value
                        ? 'bg-primary-50 text-primary-600 border-l-2 border-primary-500'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span className="flex-1">{option.label}</span>
                    {value === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary-600 shrink-0"
                      />
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Select;
