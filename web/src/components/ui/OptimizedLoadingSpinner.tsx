import React from 'react';

interface OptimizedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Optimized loading spinner with minimal CSS and efficient animations
 */
export const OptimizedLoadingSpinner: React.FC<OptimizedLoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`inline-block ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className="w-full h-full border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Memoized version for better performance
export const MemoizedLoadingSpinner = React.memo(OptimizedLoadingSpinner);