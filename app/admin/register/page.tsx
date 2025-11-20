'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';
import { AdminRegistrationForm } from '@/components/auth/admin-registration-form';

/**
 * Admin Registration Page
 * Allows new admins to create an account
 */
export default function AdminRegisterPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleSuccess = (data: { email: string; name?: string }) => {
    setRegisteredEmail(data.email);
    setShowSuccess(true);
    
    // Redirect to admin login after a short delay
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Admin Registration Successful!</CardTitle>
            </div>
            <CardDescription>
              Your admin account has been created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Admin account created for <strong>{registeredEmail}</strong>.
                You can now sign in with your credentials.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Redirecting to admin login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Admin Account</CardTitle>
          <CardDescription>
            Register as an administrator to manage the temple system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminRegistrationForm onSuccess={handleSuccess} />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an admin account? </span>
            <Link
              href="/admin/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
