'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetRequestSchema, type PasswordResetRequestData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-helpers';

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
  onError?: (error: string) => void;
}

/**
 * Forgot Password Form Component
 * Handles password reset request with email input
 * Requirements: 5.1
 */
export function ForgotPasswordForm({ onSuccess, onError }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordResetRequestData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: PasswordResetRequestData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result.error || { message: 'Failed to send reset email' };
        showErrorToast(error, 'Password Reset Failed');
        onError?.(error.message);
        return;
      }

      // Success - show toast and call onSuccess callback
      showSuccessToast(
        'If an account exists with this email, you will receive a password reset link shortly.',
        'Reset Link Sent'
      );
      onSuccess(data.email);
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </Form>
  );
}
