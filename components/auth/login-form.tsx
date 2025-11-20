/**
 * Login Form Component
 * 
 * Unified login form supporting both admin and pilgrim user authentication.
 * Includes rate limiting feedback and user type selection.
 */

'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { showErrorToast } from '@/lib/utils/toast-helpers';

type UserType = 'pilgrim' | 'admin';

interface LoginFormProps {
  defaultUserType?: UserType;
  showUserTypeToggle?: boolean;
  redirectPath?: string;
}

export function LoginForm({ 
  defaultUserType = 'pilgrim', 
  showUserTypeToggle = true,
  redirectPath 
}: LoginFormProps) {

  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<UserType>(defaultUserType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate redirect URL at submit time (not render time) to get current userType
      const callbackUrl = redirectPath || searchParams.get('callbackUrl') || searchParams.get('redirect');
      const defaultRedirect = callbackUrl || (userType === 'admin' ? '/admin' : '/');

      const providerId = userType === 'admin' ? 'admin-credentials' : 'user-credentials';
      
      console.log('[LoginForm] Attempting sign in:', { providerId, callbackUrl: defaultRedirect });
      
      // Import signIn from next-auth/react
      const { signIn } = await import('next-auth/react');
      
      // Call signIn - it will redirect on success
      const result = await signIn(providerId, {
        email,
        password,
        callbackUrl: defaultRedirect,
      });

      // If we reach here, there was an error (signIn redirects on success)
      console.log('[LoginForm] Sign in completed without redirect:', result);
      setIsLoading(false);
    } catch (err: any) {
      // Handle errors
      console.error('[LoginForm] Login error:', err);
      showErrorToast('An error occurred during login', 'Login Failed');
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={userType === 'admin' ? 'admin@example.com' : 'your.email@example.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="email"
          className="h-11 sm:h-10 text-base"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
          {userType === 'pilgrim' && (
            <Link 
              href="/forgot-password" 
              className="text-xs sm:text-sm text-primary hover:underline"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="current-password"
          className="h-11 sm:h-10 text-base"
        />
      </div>

      <Button type="submit" className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      {userType === 'pilgrim' && (
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register here
          </Link>
        </div>
      )}
    </form>
  );

  if (!showUserTypeToggle) {
    return renderForm();
  }

  return (
    <Tabs value={userType} onValueChange={(value) => setUserType(value as UserType)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pilgrim">Pilgrim Login</TabsTrigger>
        <TabsTrigger value="admin">Admin Login</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pilgrim" className="mt-6">
        {renderForm()}
      </TabsContent>
      
      <TabsContent value="admin" className="mt-6">
        {renderForm()}
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
            <p className="font-semibold mb-1">Development Credentials:</p>
            <p className="text-muted-foreground">
              Email: admin@example.com<br />
              Password: admin123
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
