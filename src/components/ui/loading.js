import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className = "", size = "w-4 h-4" }) => (
  <Loader2 className={`animate-spin ${size} ${className}`} />
);

export const LoadingOverlay = ({ children, loading }) => {
  if (!loading) return children;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
        <LoadingSpinner size="w-8 h-8" className="text-blue-600" />
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
};