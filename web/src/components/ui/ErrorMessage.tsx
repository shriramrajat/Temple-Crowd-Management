import React from 'react';
import { cn } from '@/lib/utils';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'inline' | 'banner' | 'toast';
  severity?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  showIcon?: boolean;
}

const errorVariants = {
  inline: 'p-3 rounded-md text-sm',
  banner: 'p-4 rounded-lg border-l-4',
  toast: 'p-4 rounded-lg shadow-lg border',
};

const errorSeverities = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    icon: 'text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    icon: 'text-blue-400',
  },
};

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
      clipRule="evenodd"
    />
  </svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      clipRule="evenodd"
    />
  </svg>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  variant = 'inline',
  severity = 'error',
  title,
  message,
  onDismiss,
  showIcon = true,
  className,
  ...props
}) => {
  const variantClasses = errorVariants[variant];
  const severityClasses = errorSeverities[severity];

  const IconComponent = severity === 'error' ? ErrorIcon : severity === 'warning' ? WarningIcon : InfoIcon;

  return (
    <div
      className={cn(
        variantClasses,
        severityClasses.bg,
        severityClasses.border,
        severityClasses.text,
        className
      )}
      {...props}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <IconComponent className={cn('h-5 w-5', severityClasses.icon)} />
          </div>
        )}
        <div className={cn('ml-3 flex-1', !showIcon && 'ml-0')}>
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  severityClasses.text,
                  'hover:bg-opacity-20 hover:bg-current'
                )}
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};