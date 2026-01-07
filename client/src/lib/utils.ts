import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Bureau': '#f59e0b',
    'Cash Flow': '#10b981',
    'Device Data': '#8b5cf6',
    'Loan Activity': '#ec4899',
    'Platform Data': '#06b6d4',
    'User-Reported Data': '#f97316',
  };
  return colors[category] || '#6b7280';
}

export function getCategoryClass(category: string): string {
  const classes: Record<string, string> = {
    'Bureau': 'category-bureau',
    'Cash Flow': 'category-cashflow',
    'Device Data': 'category-device',
    'Loan Activity': 'category-loan',
    'Platform Data': 'category-platform',
    'User-Reported Data': 'category-user',
  };
  return classes[category] || '';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
