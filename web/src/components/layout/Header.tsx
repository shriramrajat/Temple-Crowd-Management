import React from 'react';
import { UserProfile } from '../auth/UserProfile';
import { LoginButton } from '../auth/LoginButton';
import { SignOutButton } from '../auth/SignOutButton';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/lib/utils';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  showLogo?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'My App',
  showLogo = true,
  logoSrc,
  logoAlt = 'Logo',
  navigation = [],
  className,
  ...props
}) => {
  const { user, loading } = useAuth();

  return (
    <header
      className={cn(
        'bg-white shadow-sm border-b border-gray-200',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {showLogo && (
              <div className="flex-shrink-0">
                {logoSrc ? (
                  <img
                    className="h-8 w-auto"
                    src={logoSrc}
                    alt={logoAlt}
                  />
                ) : (
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              {title}
            </h1>
          </div>

          {/* Navigation */}
          {navigation.length > 0 && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Desktop: Show full profile */}
                <div className="hidden sm:block">
                  <UserProfile
                    variant="inline"
                    avatarSize="sm"
                    showEmail={false}
                  />
                </div>
                {/* Mobile: Show only avatar */}
                <div className="sm:hidden">
                  <UserProfile
                    variant="compact"
                    avatarSize="sm"
                    showEmail={false}
                  />
                </div>
                <SignOutButton size="sm" />
              </div>
            ) : (
              <LoginButton size="sm" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {navigation.length > 0 && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                  item.active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};