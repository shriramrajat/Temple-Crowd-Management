import React from 'react';
import { cn } from '@/lib/utils';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  links?: Array<{
    label: string;
    href: string;
  }>;
  copyright?: string;
  showYear?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  links = [],
  copyright,
  showYear = true,
  className,
  ...props
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-white border-t border-gray-200 py-8',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Links */}
          {links.length > 0 && (
            <nav className="flex flex-wrap gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            {copyright || (
              <>
                {showYear && `© ${currentYear} `}
                All rights reserved.
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};