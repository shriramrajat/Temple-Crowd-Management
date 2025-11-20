'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema } from '@/lib/validations/auth';
import { z } from 'zod';
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
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';
import { getPasswordValidationErrors } from '@/lib/validations/auth';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-helpers';

const passwordResetFormSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordResetFormData = z.infer<typeof passwordResetFormSchema>;

interface PasswordResetFormProps {
  token: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

/**
 * Password Reset Form Component
 * Handles password reset with token validation
 * Requirements: 5.2, 5.3, 5.5
 */
export function PasswordResetForm({ token, onSuccess, onError }: PasswordResetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

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

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result.error || { message: 'Failed to reset password' };
        showErrorToast(error, 'Password Reset Failed');
        onError?.(error.message);
        return;
      }

      // Success - show toast and call onSuccess callback
      showSuccessToast(
        'Your password has been successfully reset. You can now log in with your new password.',
        'Password Reset Successful'
      );
      onSuccess();
    } catch (error) {
      showErrorToast(error, 'Password Reset Failed');
      onError?.('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              {password && (
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting password...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}
