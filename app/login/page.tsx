/**
 * Login Page
 * 
 * Unified login page supporting both admin and pilgrim user authentication.
 * Redirects authenticated users to the home page.
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export default async function LoginPage() {
  // Check if user is already authenticated
  const session = await auth();
  
  // Redirect authenticated users to home page
  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          }>
            <LoginForm showUserTypeToggle={true} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
