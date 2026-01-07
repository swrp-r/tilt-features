import { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

export function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSelection = selected.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-md border transition-all',
          hasSelection
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        )}
      >
        <span>{label}</span>
        {hasSelection && (
          <span className="px-1 py-0.5 text-xs font-mono bg-blue-100 rounded">{selected.length}</span>
        )}
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] max-h-[280px] overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            {hasSelection && (
              <div className="p-1.5 border-b border-gray-100">
                <button
                  onClick={() => { onClear(); setIsOpen(false); }}
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                >
                  <X className="w-3 h-3" />
                  Clear selection
                </button>
              </div>
            )}
            <div className="p-1.5">
              {options.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-gray-400">No options</div>
              ) : (
                options.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => onToggle(option)}
                      className={cn(
                        'flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded text-left',
                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'w-3.5 h-3.5 rounded border flex items-center justify-center',
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      )}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="truncate">{option || '(empty)'}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
