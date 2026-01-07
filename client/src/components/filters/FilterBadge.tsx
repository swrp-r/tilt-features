import { X } from 'lucide-react';

interface FilterBadgeProps {
  label: string;
  filterKey: string;
  onRemove: () => void;
}

export function FilterBadge({ label, onRemove }: FilterBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">
      <span>{label}</span>
      <button onClick={onRemove} className="p-0.5 hover:bg-blue-100 rounded-full">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
