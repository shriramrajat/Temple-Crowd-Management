# Role-Based Access Control (RBAC) Implementation

## Overview

Task 15.1 has been completed, implementing comprehensive role-based access control for the Crowd Risk Engine. This implementation adds authentication and authorization capabilities to protect sensitive operations and ensure only authorized users can perform critical actions.

## Implementation Summary

### 1. Types and Permissions (lib/crowd-risk/types.ts)

**Admin Roles:**
- `SUPER_ADMIN` - Full system access with all permissions
- `SAFETY_ADMIN` - Safety operations access (configure thresholds, activate emergency)
- `MONITOR_ONLY` - Read-only access to monitoring features

**Permissions:**
- `CONFIGURE_THRESHOLDS` - Modify threshold configurations
- `ACTIVATE_EMERGENCY` - Activate/deactivate emergency mode
- `VIEW_ONLY` - View monitoring data
- `MANAGE_USERS` - Manage user accounts and roles
- `ACKNOWLEDGE_ALERTS` - Acknowledge and manage alerts
- `VIEW_ANALYTICS` - Access analytics and reports

**Role-Permission Mapping:**
```typescript
RolePermissions = {
  SUPER_ADMIN: [all permissions],
  SAFETY_ADMIN: [CONFIGURE_THRESHOLDS, ACTIVATE_EMERGENCY, ACKNOWLEDGE_ALERTS, VIEW_ANALYTICS, VIEW_ONLY],
  MONITOR_ONLY: [VIEW_ONLY, VIEW_ANALYTICS]
}
```

### 2. Authorization Service (lib/crowd-risk/auth-service.ts)

**Features:**
- User management with in-memory storage
- Permission checking by user ID
- Role verification
- Default test users (super_admin, safety_admin, monitor_only)

**Key Methods:**
- `checkPermission(userId, permission)` - Check if user has specific permission
- `getUserRole(userId)` - Get user's role
- `hasRole(userId, role)` - Check if user has specific role
- `getUserPermissions(userId)` - Get all permissions for a user
- `hasAnyPermission(userId, permissions[])` - Check if user has any of the permissions
- `hasAllPermissions(userId, permissions[])` - Check if user has all permissions

**Default Test Users:**
```typescript
{
  id: 'super_admin',
  name: 'Super Administrator',
  email: 'super@admin.com',
  role: AdminRole.SUPER_ADMIN
}
{
  id: 'safety_admin',
  name: 'Safety Administrator',
  email: 'safety@admin.com',
  role: AdminRole.SAFETY_ADMIN
}
{
  id: 'monitor_only',
  name: 'Monitor User',
  email: 'monitor@admin.com',
  role: AdminRole.MONITOR_ONLY
}
```

### 3. Authorization Middleware (lib/crowd-risk/auth-middleware.ts)

**Features:**
- Middleware functions for API route protection
- Unauthorized access logging
- 401/403 error responses

**Key Methods:**
- `requirePermission(permission)` - Middleware to require specific permission
- `requireRole(role)` - Middleware to require specific role
- `requireAnyPermission(permissions[])` - Middleware to require any of the permissions
- `requireAllPermissions(permissions[])` - Middleware to require all permissions
- `getUserIdFromRequest(request)` - Extract user ID from request headers

**Usage Example:**
```typescript
const middleware = getAuthMiddleware();
const checkPermission = middleware.requirePermission(Permission.CONFIGURE_THRESHOLDS);
const response = checkPermission(userId, request);
if (response) return response; // 403 Forbidden
```

### 4. Service Updates

#### EmergencyModeManager (lib/crowd-risk/emergency-mode-manager.ts)

**Changes:**
- Added permission check in `activateEmergency()` method
- Requires `ACTIVATE_EMERGENCY` permission for manual activation
- Logs all activation attempts with success/failure status
- Throws error if user lacks permission

**New Features:**
- `logActivationAttempt()` - Logs all activation attempts
- `getActivationAttempts()` - Retrieves activation attempt history

#### ThresholdConfigManager (lib/crowd-risk/threshold-config-manager.ts)

**Changes:**
- Added permission check in `saveConfig()` method
- Requires `CONFIGURE_THRESHOLDS` permission
- Logs all configuration changes with admin ID
- Throws error if user lacks permission

**Enhanced Audit Logging:**
- All configuration changes now logged with admin ID
- Audit log created even for initial configurations

### 5. UI Component Updates

#### EmergencyModeControls (components/admin/crowd-risk/emergency-mode-controls.tsx)

**Changes:**
- Checks `ACTIVATE_EMERGENCY` permission on component mount
- Hides activation controls for users without permission
- Hides deactivation button for users without permission
- Disables all emergency buttons for MONITOR_ONLY users

**User Experience:**
- SUPER_ADMIN & SAFETY_ADMIN: Full access to emergency controls
- MONITOR_ONLY: Can view emergency status but cannot activate/deactivate

#### ThresholdConfigForm (components/admin/crowd-risk/threshold-config-form.tsx)

**Changes:**
- Added `adminId` prop for permission checking
- Checks `CONFIGURE_THRESHOLDS` permission
- Makes form read-only for users without permission
- Shows informative message for read-only users
- Disables all inputs and save button for MONITOR_ONLY users

**User Experience:**
- SUPER_ADMIN & SAFETY_ADMIN: Full edit access
- MONITOR_ONLY: Read-only view with clear messaging

### 6. New Components

#### ProtectedRoute (components/admin/crowd-risk/protected-route.tsx)

**Features:**
- Wraps pages requiring specific permissions
- Shows loading state while checking permissions
- Displays access denied page with helpful information
- Optional redirect to fallback path
- Includes user's current role in error message

**Usage Example:**
```tsx
<ProtectedRoute
  userId={currentUserId}
  requiredPermission={Permission.CONFIGURE_THRESHOLDS}
  fallbackPath="/admin"
>
  <ThresholdConfigPage />
</ProtectedRoute>
```

**Custom Hooks:**
- `useHasPermission(userId, permission)` - Check permission in components
- `useHasRole(userId, role)` - Check role in components

#### RoleIndicatorBadge (components/admin/crowd-risk/role-indicator-badge.tsx)

**Features:**
- Displays user's role with color-coded badge
- Shows role icon (ShieldCheck, Shield, Eye)
- Customizable styling
- Optional icon display

**RoleCard Component:**
- Detailed role display with permissions list
- Shows user name and email
- Lists all permissions for the role

**Color Scheme:**
- SUPER_ADMIN: Purple badge
- SAFETY_ADMIN: Blue badge
- MONITOR_ONLY: Gray badge

## Usage Examples

### 1. Protecting an API Route

```typescript
import { getAuthMiddleware, getUserIdFromRequest } from '@/lib/crowd-risk/auth-middleware';
import { Permission } from '@/lib/crowd-risk/types';

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  const middleware = getAuthMiddleware();
  
  // Check permission
  const authCheck = middleware.requirePermission(Permission.CONFIGURE_THRESHOLDS);
  const authResponse = authCheck(userId, request);
  
  if (authResponse) {
    return authResponse; // Returns 403 Forbidden
  }
  
  // User has permission, proceed with operation
  // ...
}
```

### 2. Using ProtectedRoute in a Page

```tsx
import { ProtectedRoute } from '@/components/admin/crowd-risk';
import { Permission } from '@/lib/crowd-risk/types';

export default function ThresholdConfigPage() {
  const currentUserId = 'super_admin'; // Get from session/auth
  
  return (
    <ProtectedRoute
      userId={currentUserId}
      requiredPermission={Permission.CONFIGURE_THRESHOLDS}
    >
      <div>
        <h1>Threshold Configuration</h1>
        <ThresholdConfigForm adminId={currentUserId} />
      </div>
    </ProtectedRoute>
  );
}
```

### 3. Conditional Rendering with Hooks

```tsx
import { useHasPermission } from '@/components/admin/crowd-risk';
import { Permission } from '@/lib/crowd-risk/types';

function DashboardHeader({ userId }: { userId: string }) {
  const canConfigureThresholds = useHasPermission(userId, Permission.CONFIGURE_THRESHOLDS);
  
  return (
    <div>
      <h1>Dashboard</h1>
      {canConfigureThresholds && (
        <Button onClick={openConfigDialog}>Configure Thresholds</Button>
      )}
    </div>
  );
}
```

### 4. Displaying Role Badge

```tsx
import { RoleIndicatorBadge } from '@/components/admin/crowd-risk';

function AdminHeader({ userId }: { userId: string }) {
  return (
    <header>
      <h1>Crowd Risk Dashboard</h1>
      <RoleIndicatorBadge userId={userId} showIcon={true} />
    </header>
  );
}
```

## Testing

### Test Users

Use these user IDs for testing different permission levels:

1. **super_admin** - Full access to all features
2. **safety_admin** - Can configure thresholds and activate emergency
3. **monitor_only** - Read-only access

### Test Scenarios

1. **Emergency Activation:**
   - Login as `super_admin` or `safety_admin` → Can activate emergency
   - Login as `monitor_only` → Cannot see activation controls

2. **Threshold Configuration:**
   - Login as `super_admin` or `safety_admin` → Can edit thresholds
   - Login as `monitor_only` → Form is read-only

3. **Protected Routes:**
   - Access threshold config page as `monitor_only` → See access denied
   - Access threshold config page as `safety_admin` → Full access

## Security Considerations

### Current Implementation

- In-memory user storage (suitable for development/testing)
- Header-based user identification (X-User-Id)
- Permission checks at service and UI levels
- Comprehensive audit logging

### Production Recommendations

1. **Replace In-Memory Storage:**
   - Use database for user management
   - Implement proper user authentication

2. **Implement JWT Authentication:**
   - Replace header-based auth with JWT tokens
   - Add token validation and refresh logic

3. **Add Session Management:**
   - Implement secure session handling
   - Add session timeout and renewal

4. **Enhance Audit Logging:**
   - Store audit logs in database
   - Add log retention policies
   - Implement log analysis and alerting

5. **Add Rate Limiting:**
   - Protect against brute force attacks
   - Limit failed authentication attempts

## Future Enhancements

1. **User Management UI:**
   - Admin interface to manage users
   - Role assignment and modification
   - User invitation system

2. **Permission Granularity:**
   - Area-specific permissions
   - Time-based access control
   - Temporary permission grants

3. **Multi-Factor Authentication:**
   - SMS/Email verification
   - Authenticator app support

4. **API Key Management:**
   - Generate API keys for external integrations
   - Key rotation and expiration

5. **Audit Log Viewer:**
   - UI to view all access attempts
   - Filter by user, action, date
   - Export audit logs

## Files Modified/Created

### Created Files:
- `lib/crowd-risk/auth-service.ts` - Authorization service
- `lib/crowd-risk/auth-middleware.ts` - Authorization middleware
- `components/admin/crowd-risk/protected-route.tsx` - Protected route component
- `components/admin/crowd-risk/role-indicator-badge.tsx` - Role badge component
- `lib/crowd-risk/RBAC_IMPLEMENTATION.md` - This documentation

### Modified Files:
- `lib/crowd-risk/types.ts` - Added AdminRole, Permission enums and RolePermissions mapping
- `lib/crowd-risk/emergency-mode-manager.ts` - Added permission checks and logging
- `lib/crowd-risk/threshold-config-manager.ts` - Added permission checks and enhanced logging
- `components/admin/crowd-risk/emergency-mode-controls.tsx` - Added role-based UI controls
- `components/admin/crowd-risk/threshold-config-form.tsx` - Added read-only mode for restricted users
- `components/admin/crowd-risk/index.ts` - Added exports for new components
- `lib/crowd-risk/index.ts` - Added exports for auth services

## Compliance

This implementation satisfies the following requirements:

- **Requirement 5.4:** Manual emergency activation by authorized admins
- **Requirement 6.5:** Configuration audit logging with admin ID

All sub-tasks from Task 15.1 have been completed:
✅ Define admin roles and permissions in types.ts
✅ Create authorization service
✅ Create authorization middleware
✅ Update EmergencyModeManager with permission checks
✅ Update ThresholdConfigManager with permission checks
✅ Update UI components to hide controls based on role
✅ Create ProtectedRoute component
