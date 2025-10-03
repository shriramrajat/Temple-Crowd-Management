import React from 'react';
import { Header, type HeaderProps } from './Header';
import { cn } from '@/lib/utils';

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: Partial<HeaderProps> | false;
  footer?: React.ReactNode | false;
  sidebar?: React.ReactNode | false;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  header = {},
  footer = false,
  sidebar = false,
  maxWidth = '7xl',
  padding = 'md',
  className,
  ...props
}) => {
  const maxWidthClass = maxWidthClasses[maxWidth];
  const paddingClass = paddingClasses[padding];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" {...props}>
      {/* Header */}
      {header !== false && <Header {...header} />}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white border-r border-gray-200">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className={cn(maxWidthClass, 'mx-auto', paddingClass, className)}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200">
          <div className={cn(maxWidthClass, 'mx-auto', paddingClass)}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Page Header */}
      {(title || subtitle || actions || breadcrumbs) && (
        <div className="space-y-4">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
};