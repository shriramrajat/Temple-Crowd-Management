'use client';

/**
 * Role Indicator Badge Component
 * 
 * Displays the current user's role in the admin dashboard header.
 * Task 15.1: Add role indicator badge in admin dashboard header
 */

import { AdminRole } from '@/lib/crowd-risk/types';
import { getAuthService } from '@/lib/crowd-risk/auth-service';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleIndicatorBadgeProps {
  userId: string | null;
  className?: string;
  showIcon?: boolean;
}

/**
 * Get role display information
 */
function getRoleInfo(role: AdminRole | null) {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return {
        label: 'Super Admin',
        icon: ShieldCheck,
        variant: 'default' as const,
        className: 'bg-purple-600 hover:bg-purple-700 text-white',
      };
    case AdminRole.SAFETY_ADMIN:
      return {
        label: 'Safety Admin',
        icon: Shield,
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
      };
    case AdminRole.MONITOR_ONLY:
      return {
        label: 'Monitor Only',
        icon: Eye,
        variant: 'secondary' as const,
        className: 'bg-gray-600 hover:bg-gray-700 text-white',
      };
    default:
      return {
        label: 'Unknown',
        icon: Shield,
        variant: 'outline' as const,
        className: '',
      };
  }
}

/**
 * RoleIndicatorBadge Component
 * 
 * Shows the user's role with appropriate styling and icon.
 */
export function RoleIndicatorBadge({
  userId,
  className,
  showIcon = true,
}: RoleIndicatorBadgeProps) {
  const authService = getAuthService();
  const user = userId ? authService.getUser(userId) : null;
  const role = user?.role || null;
  const roleInfo = getRoleInfo(role);
  const Icon = roleInfo.icon;

  if (!user) {
    return null;
  }

  return (
    <Badge
      variant={roleInfo.variant}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1',
        roleInfo.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span className="text-xs font-medium">{roleInfo.label}</span>
    </Badge>
  );
}

/**
 * Detailed Role Card Component
 * 
 * Shows role with permissions list.
 */
interface RoleCardProps {
  userId: string | null;
  className?: string;
}

export function RoleCard({ userId, className }: RoleCardProps) {
  const authService = getAuthService();
  const user = userId ? authService.getUser(userId) : null;
  const permissions = userId ? authService.getUserPermissions(userId) : [];
  const roleInfo = getRoleInfo(user?.role || null);
  const Icon = roleInfo.icon;

  if (!user) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          user.role === AdminRole.SUPER_ADMIN && 'bg-purple-100 text-purple-700',
          user.role === AdminRole.SAFETY_ADMIN && 'bg-blue-100 text-blue-700',
          user.role === AdminRole.MONITOR_ONLY && 'bg-gray-100 text-gray-700'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{roleInfo.label}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Permissions:</p>
        <div className="flex flex-wrap gap-1">
          {permissions.map((permission) => (
            <Badge
              key={permission}
              variant="outline"
              className="text-xs"
            >
              {permission.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
