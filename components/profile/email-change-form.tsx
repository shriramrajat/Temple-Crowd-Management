'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-helpers';

/**
 * Email change validation schema
 * Requirements: 4.3
 */
const emailChangeSchema = z.object({
  newEmail: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),
});

type EmailChangeData = z.infer<typeof emailChangeSchema>;

interface EmailChangeFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

/**
 * Email Change Form Component
 * Form to request email change with verification
 * Requirements: 4.3
 */
export function EmailChangeForm({ currentEmail, onSuccess }: EmailChangeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const form = useForm<EmailChangeData>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: '',
    },
  });

  const onSubmit = async (data: EmailChangeData) => {
    setIsLoading(true);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/profile/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result.error || { message: 'Failed to initiate email change' };
        showErrorToast(error, 'Email Change Failed');
        return;
      }

      // Success - show toast and verification pending state
      showSuccessToast(
        `We've sent a verification link to ${data.newEmail}. Please check your inbox to complete the email change.`,
        'Verification Email Sent'
      );
      setPendingEmail(data.newEmail);
      setShowSuccess(true);
      form.reset();
      onSuccess?.();
    } catch (error) {
      showErrorToast(error, 'Email Change Failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess && pendingEmail) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Verification email sent!</strong>
            <p className="mt-1 text-sm">
              We've sent a verification link to <strong>{pendingEmail}</strong>.
              Please check your inbox and click the link to complete the email change.
            </p>
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => {
            setShowSuccess(false);
            setPendingEmail(null);
          }}
          className="w-full"
        >
          Change to a Different Email
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Current Email</p>
          <p className="text-sm font-medium">{currentEmail}</p>
        </div>

        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.new.email@example.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                You'll need to verify your new email address before the change takes effect
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            After submitting, you'll receive a verification email at your new address.
            Your email will only be changed after you click the verification link.
          </AlertDescription>
        </Alert>

        <Button type="submit" disabled={isLoading} className="w-full">
          <Mail className="w-4 h-4 mr-2" />
          {isLoading ? 'Sending verification email...' : 'Change Email'}
        </Button>
      </form>
    </Form>
  );
}
