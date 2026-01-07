import { Layers } from 'lucide-react';

interface HeaderProps {
  totalFeatures: number;
  filteredCount: number;
  isLoading: boolean;
}

export function Header({ totalFeatures, filteredCount, isLoading }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Tilt Features</h1>
                <p className="text-xs text-gray-500">feature store, tags</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200" />

            {/* Stats */}
            <div className="text-sm text-gray-600">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <>
                  <span className="font-mono font-medium text-gray-900">{filteredCount.toLocaleString()}</span>
                  {filteredCount !== totalFeatures && (
                    <span className="text-gray-400"> / {totalFeatures.toLocaleString()}</span>
                  )}
                  <span className="text-gray-500 ml-1">features</span>
                </>
              )}
            </div>
          </div>

          {/* Right side - placeholder for future actions */}
          <div className="text-xs text-gray-400">
            Feature Store
          </div>
        </div>
      </div>
    </header>
  );
}
