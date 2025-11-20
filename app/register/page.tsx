'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegistrationForm } from '@/components/auth/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

/**
 * Registration Page
 * Allows new pilgrims to create an account
 * Requirements: 1.1, 1.2
 */
export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleSuccess = (data: { email: string; name?: string; redirectUrl?: string }) => {
    setRegisteredEmail(data.email);
    setShowSuccess(true);
    
    // Redirect to profile page after a short delay
    const redirectUrl = data.redirectUrl || '/profile';
    setTimeout(() => {
      // Use window.location for a full page reload to ensure session is properly loaded
      window.location.href = redirectUrl;
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Registration Successful!</CardTitle>
            </div>
            <CardDescription>
              Please check your email to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Your account has been created successfully! You are now logged in.
                We've also sent a verification email to <strong>{registeredEmail}</strong> to verify your account.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Redirecting to booking dashboard...
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
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Register to book darshan slots and manage your visits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm onSuccess={handleSuccess} />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              href="/login"
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
