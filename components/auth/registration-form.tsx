'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUserSchema, type RegisterUserData, getPasswordValidationErrors } from '@/lib/validations/auth';
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
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-helpers';

interface RegistrationFormProps {
  onSuccess: (data: { email: string; name?: string; redirectUrl?: string }) => void;
  onError?: (error: string) => void;
}

/**
 * Registration Form Component
 * Handles user registration with email, password, name, and phone fields
 * Requirements: 1.1, 1.3
 */
export function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterUserData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
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

  const onSubmit = async (data: RegisterUserData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the detailed message, not the error code
        const errorMessage = result.message || result.error || 'Registration failed';
        showErrorToast(errorMessage, 'Registration Failed');
        onError?.(errorMessage);
        return;
      }

      // Success - show toast and call onSuccess callback
      showSuccessToast(
        result.message || 'Account created successfully! You are now logged in.',
        'Registration Successful'
      );
      
      onSuccess({
        email: data.email,
        name: data.name,
        redirectUrl: result.redirectUrl,
      });
    } catch (error) {
      showErrorToast(error, 'Registration Failed');
      onError?.('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  className="h-11 sm:h-10 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    className="h-11 sm:h-10 text-base pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength.score} className="h-2" />
                    <span className="text-xs font-medium whitespace-nowrap">{passwordStrength.label}</span>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">
                Name <span className="text-muted-foreground text-xs">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Your full name"
                  disabled={isLoading}
                  className="h-11 sm:h-10 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">
                Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  disabled={isLoading}
                  className="h-11 sm:h-10 text-base"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Enter a valid Indian mobile number (starting with 6-9)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
