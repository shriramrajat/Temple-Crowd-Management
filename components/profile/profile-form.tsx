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
import { Save, X } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-helpers';

/**
 * Profile update validation schema
 * Requirements: 4.2
 */
const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number starting with 6-9')
    .optional()
    .or(z.literal('')),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface ProfileFormProps {
  defaultValues: {
    name: string | null;
    phone: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Profile Form Component
 * Inline edit form for name and phone
 * Requirements: 4.1, 4.2
 */
export function ProfileForm({ defaultValues, onSuccess, onCancel }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: defaultValues.name || '',
      phone: defaultValues.phone || '',
    },
  });

  const onSubmit = async (data: ProfileUpdateData) => {
    setIsLoading(true);

    try {
      // Only send fields that have values
      const updateData: Record<string, string> = {};
      if (data.name && data.name.trim()) {
        updateData.name = data.name.trim();
      }
      if (data.phone && data.phone.trim()) {
        updateData.phone = data.phone.trim();
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result.error || { message: 'Failed to update profile' };
        showErrorToast(error, 'Profile Update Failed');
        return;
      }

      // Success - show toast and call onSuccess
      showSuccessToast('Your profile has been updated successfully.', 'Profile Updated');
      onSuccess();
    } catch (error) {
      showErrorToast(error, 'Profile Update Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Your full name"
                  disabled={isLoading}
                  className="h-11 sm:h-10 text-base"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Your name will be displayed on your bookings
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Phone Number</FormLabel>
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

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button type="submit" disabled={isLoading} className="flex-1 h-11 sm:h-10 text-base sm:text-sm touch-manipulation">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
