# Authentication Guard Components

This directory contains components and utilities for implementing authentication guards and protected routes in the Next.js application.

## Components

### AuthGuard

A React component that protects routes by checking authentication status and redirecting unauthenticated users.

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

function ProtectedPage() {
  return (
    <AuthGuard redirectTo="/login">
      <div>This content is only visible to authenticated users</div>
    </AuthGuard>
  );
}
```

**Props:**
- `children`: ReactNode - The content to protect
- `redirectTo`: string (optional) - Where to redirect unauthenticated users (default: '/login')
- `fallback`: ReactNode (optional) - Custom loading component

### withAuth HOC

A higher-order component that wraps components with authentication protection.

```tsx
import { withAuth } from '@/components/auth/withAuth';

const ProtectedComponent = withAuth(MyComponent, {
  redirectTo: '/login',
  fallback: <CustomLoader />
});
```

**Options:**
- `redirectTo`: string (optional) - Where to redirect unauthenticated users
- `fallback`: ReactNode (optional) - Custom loading component

## Hooks

### useAuthGuard

A hook for protecting routes with authentication in functional components.

```tsx
import { useAuthGuard } from '@/hooks/useAuthGuard';

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuthGuard({
    redirectTo: '/login',
    enabled: true
  });

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Will redirect

  return <div>Protected content</div>;
}
```

### useRequireAuth

A hook that requires authentication and provides guaranteed user data.

```tsx
import { useRequireAuth } from '@/hooks/useAuthGuard';

function MyComponent() {
  const { user, isLoading } = useRequireAuth('/login');

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null; // Will redirect

  return <div>Hello {user.displayName}</div>;
}
```

## Usage Patterns

### 1. Component-Level Protection

```tsx
// Wrap individual components
<AuthGuard>
  <ProtectedContent />
</AuthGuard>
```

### 2. Page-Level Protection

```tsx
// In a Next.js page
export default function DashboardPage() {
  return (
    <AuthGuard redirectTo="/login">
      <DashboardContent />
    </AuthGuard>
  );
}
```

### 3. HOC Pattern

```tsx
// Wrap entire page components
const ProtectedDashboard = withAuth(Dashboard);
export default ProtectedDashboard;
```

### 4. Hook-Based Protection

```tsx
function MyComponent() {
  const { isAuthenticated, isLoading } = useAuthGuard();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  
  return <div>Protected content</div>;
}
```

## Features

- **Automatic Redirects**: Unauthenticated users are automatically redirected to login
- **Loading States**: Shows loading indicators while checking authentication
- **Return URLs**: Supports redirecting back to intended page after login
- **Flexible API**: Multiple ways to implement protection (components, HOCs, hooks)
- **TypeScript Support**: Full TypeScript support with proper typing
- **Server-Side Ready**: Middleware placeholder for server-side protection

## Error Handling

The AuthGuard components handle various authentication states:

- **Loading**: Shows loading spinner while checking auth status
- **Unauthenticated**: Redirects to login page
- **Authenticated**: Renders protected content
- **Errors**: Displays error messages from auth context

## Integration with Next.js

### App Router

Works seamlessly with Next.js 13+ App Router:

```tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
```

### Middleware (Future Enhancement)

The included middleware.ts provides a foundation for server-side route protection:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Server-side authentication checking
  // Currently a placeholder for future implementation
}
```

## Best Practices

1. **Use AuthGuard for pages**: Wrap entire page content with AuthGuard
2. **Use withAuth for reusable components**: Apply HOC to components used across multiple pages
3. **Use hooks for conditional rendering**: Use hooks when you need fine-grained control
4. **Handle loading states**: Always provide loading indicators for better UX
5. **Implement return URLs**: Allow users to return to their intended destination after login

## Requirements Satisfied

This implementation satisfies the following requirements:

- **2.5**: Redirect unauthenticated users to login page ✅
- **4.2**: Proper authentication state management and loading states ✅

The AuthGuard system provides comprehensive route protection with multiple implementation patterns to suit different use cases.