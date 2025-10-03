import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/lib/utils';

export interface UserProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  showEmail?: boolean;
  showAvatar?: boolean;
  variant?: 'card' | 'inline' | 'compact';
  avatarSize?: 'sm' | 'md' | 'lg';
}

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export const UserProfile: React.FC<UserProfileProps> = ({
  showEmail = true,
  showAvatar = true,
  variant = 'card',
  avatarSize = 'md',
  className,
  ...props
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)} {...props}>
        {variant === 'card' ? (
          <Card>
            <CardContent>
              <div className="flex items-center space-x-3">
                {showAvatar && (
                  <div className={cn('bg-gray-300 rounded-full', avatarSizes[avatarSize])} />
                )}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24" />
                  {showEmail && <div className="h-3 bg-gray-300 rounded w-32" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center space-x-3">
            {showAvatar && (
              <div className={cn('bg-gray-300 rounded-full', avatarSizes[avatarSize])} />
            )}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24" />
              {showEmail && <div className="h-3 bg-gray-300 rounded w-32" />}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn('text-gray-500 text-sm', className)} {...props}>
        Not signed in
      </div>
    );
  }

  const profileContent = (
    <div className={cn(
      'flex items-center',
      variant === 'compact' ? 'space-x-2' : 'space-x-3'
    )}>
      {showAvatar && (
        <div className="flex-shrink-0">
          {user.photoURL ? (
            <img
              className={cn('rounded-full object-cover', avatarSizes[avatarSize])}
              src={user.photoURL}
              alt={user.displayName || 'User avatar'}
            />
          ) : (
            <div className={cn(
              'bg-blue-500 rounded-full flex items-center justify-center text-white font-medium',
              avatarSizes[avatarSize],
              avatarSize === 'sm' ? 'text-xs' : avatarSize === 'md' ? 'text-sm' : 'text-base'
            )}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-gray-900 truncate',
          variant === 'compact' ? 'text-sm' : 'text-base'
        )}>
          {user.displayName || 'User'}
        </p>
        {showEmail && (
          <p className={cn(
            'text-gray-500 truncate',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}>
            {user.email}
          </p>
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={className} {...props}>
        <CardContent>
          {profileContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className} {...props}>
      {profileContent}
    </div>
  );
};