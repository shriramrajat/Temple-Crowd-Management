'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, X, User, Phone, Calendar, CreditCard, AlertCircle, Languages, Accessibility } from 'lucide-react';
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
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  gender: z
    .string()
    .optional()
    .or(z.literal('')),
  idProofType: z
    .string()
    .optional()
    .or(z.literal('')),
  idProofNumber: z
    .string()
    .max(50, 'ID proof number must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  emergencyContactName: z
    .string()
    .max(100, 'Emergency contact name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number')
    .optional()
    .or(z.literal('')),
  accessibilityNeeds: z
    .string()
    .max(500, 'Accessibility needs must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  preferredLanguage: z
    .string()
    .optional()
    .or(z.literal('')),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface ProfileFormProps {
  defaultValues: {
    name: string | null;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    idProofType: string | null;
    idProofNumber: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    accessibilityNeeds: string | null;
    preferredLanguage: string | null;
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
      dateOfBirth: defaultValues.dateOfBirth || '',
      gender: defaultValues.gender || '',
      idProofType: defaultValues.idProofType || '',
      idProofNumber: defaultValues.idProofNumber || '',
      emergencyContactName: defaultValues.emergencyContactName || '',
      emergencyContactPhone: defaultValues.emergencyContactPhone || '',
      accessibilityNeeds: defaultValues.accessibilityNeeds || '',
      preferredLanguage: defaultValues.preferredLanguage || 'English',
    },
  });

  const onSubmit = async (data: ProfileUpdateData) => {
    setIsLoading(true);

    try {
      // Only send fields that have values
      const updateData: Record<string, any> = {};
      if (data.name && data.name.trim()) updateData.name = data.name.trim();
      if (data.phone && data.phone.trim()) updateData.phone = data.phone.trim();
      if (data.dateOfBirth && data.dateOfBirth.trim()) updateData.dateOfBirth = data.dateOfBirth.trim();
      if (data.gender && data.gender.trim()) updateData.gender = data.gender.trim();
      if (data.idProofType && data.idProofType.trim()) updateData.idProofType = data.idProofType.trim();
      if (data.idProofNumber && data.idProofNumber.trim()) updateData.idProofNumber = data.idProofNumber.trim();
      if (data.emergencyContactName && data.emergencyContactName.trim()) updateData.emergencyContactName = data.emergencyContactName.trim();
      if (data.emergencyContactPhone && data.emergencyContactPhone.trim()) updateData.emergencyContactPhone = data.emergencyContactPhone.trim();
      if (data.accessibilityNeeds && data.accessibilityNeeds.trim()) updateData.accessibilityNeeds = data.accessibilityNeeds.trim();
      if (data.preferredLanguage && data.preferredLanguage.trim()) updateData.preferredLanguage = data.preferredLanguage.trim();

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Your personal details for temple visits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        disabled={isLoading}
                        className="h-10 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        disabled={isLoading}
                        className="h-10 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isLoading}
                        className="h-10 text-base"
                        max={new Date().toISOString().split('T')[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      For age-based services and offerings
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      For separate queue management
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ID Verification Section */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              ID Verification
            </CardTitle>
            <CardDescription>For secure temple entry and verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idProofType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">ID Proof Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                        <SelectItem value="PAN">PAN Card</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Driving License">Driving License</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idProofNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">ID Proof Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter ID number"
                        disabled={isLoading}
                        className="h-10 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your ID information is kept secure and private
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Section */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
              Emergency Contact
            </CardTitle>
            <CardDescription>For your safety during temple visits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Contact Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Emergency contact name"
                        disabled={isLoading}
                        className="h-10 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Contact Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        disabled={isLoading}
                        className="h-10 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility & Preferences Section */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Accessibility className="w-5 h-5 text-primary" />
              Accessibility & Preferences
            </CardTitle>
            <CardDescription>Help us serve you better</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="accessibilityNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Accessibility Needs</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe any accessibility requirements (wheelchair access, visual/hearing assistance, etc.)"
                      disabled={isLoading}
                      className="min-h-[100px] text-base resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    We'll ensure appropriate assistance is available during your visit
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" />
                    Preferred Language
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Kannada">Kannada</SelectItem>
                      <SelectItem value="Malayalam">Malayalam</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Marathi">Marathi</SelectItem>
                      <SelectItem value="Gujarati">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    For better communication and notifications
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 h-11 text-base font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 text-base font-medium border-2"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
