'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema, type PasswordChangeData, getPasswordValidationErrors } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-helpers';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

/**
 * Password Change Form Component
 * Form with current and new password fields
 * Requirements: 4.2
 */
export function PasswordChangeForm({ onSuccess }: PasswordChangeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const newPassword = form.watch('newPassword');

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };

    const errors = getPasswordValidationErrors(pwd);
    const score = Math.max(0, 100 - (errors.length * 20));

    if (score === 100) return { score, label: 'Strong', color: 'bg-green-500' };
    if (score >= 60) return { score, label: 'Good', color: 'bg-yellow-500' };
    if (score >= 40) return { score, label: 'Fair', color: 'bg-orange-500' };
    return { score, label: 'Weak', color: 'bg-red-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const onSubmit = async (data: PasswordChangeData) => {
    setIsLoading(true);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result.error || { message: 'Failed to change password' };
        showErrorToast(error, 'Password Change Failed');
        return;
      }

      // Success - show toast and confirmation
      showSuccessToast(
        'Your password has been updated. Please use your new password for future logins.',
        'Password Changed Successfully'
      );
      setShowSuccess(true);
      form.reset();
      onSuccess?.();
    } catch (error) {
      showErrorToast(error, 'Password Change Failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Password changed successfully!</strong>
            <p className="mt-1 text-sm">
              Your password has been updated. Please use your new password for future logins.
            </p>
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => setShowSuccess(false)}
          className="w-full"
        >
          Change Password Again
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    disabled={isLoading}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength.score} className="h-2" />
                    <span className="text-xs font-medium">{passwordStrength.label}</span>
                  </div>
                  <FormDescription className="text-xs">
                    Password must contain: 8+ characters, uppercase, lowercase, number, and special character
                  </FormDescription>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            After changing your password, you'll need to use the new password for future logins.
            All active sessions will remain valid.
          </AlertDescription>
        </Alert>

        <Button type="submit" disabled={isLoading} className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          {isLoading ? 'Changing password...' : 'Change Password'}
        </Button>
      </form>
    </Form>
  );
}
