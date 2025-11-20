'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/profile-form';
import { EmailChangeForm } from '@/components/profile/email-change-form';
import { PasswordChangeForm } from '@/components/profile/password-change-form';
import { LocationForm } from '@/components/profile/location-form';
import { LogoutButton } from '@/components/auth/logout-button';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Edit2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Profile Management Page
 * Display and edit user profile information
 * Requirements: 4.1, 4.2, 4.3
 */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to load profile');
      }

      setProfile(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdateSuccess = () => {
    setIsEditingProfile(false);
    fetchProfile();
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handleEmailChangeSuccess = () => {
    toast({
      title: 'Verification email sent',
      description: 'Please check your email to complete the email change.',
    });
  };

  const handlePasswordChangeSuccess = () => {
    toast({
      title: 'Password changed',
      description: 'Your password has been changed successfully.',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchProfile} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Profile Settings</h1>
          <LogoutButton 
            variant="outline" 
            size="default"
            showIcon={true}
            showConfirmation={true}
            className="border-red-200 text-red-600 hover:bg-red-50 self-start sm:self-auto"
          />
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Manage your account information and security settings
        </p>



        <div className="grid gap-4 sm:gap-6">
          {/* Profile Overview Card */}
          <Card className="border-2 border-orange-200">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl truncate">{profile.name || 'Pilgrim'}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Member since {formatDate(profile.createdAt)}</CardDescription>
                  </div>
                </div>
                {!isEditingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                    className="border-primary text-primary hover:bg-orange-50 self-start sm:self-auto h-9 sm:h-8 text-sm touch-manipulation"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingProfile ? (
                <ProfileForm
                  defaultValues={{
                    name: profile.name,
                    phone: profile.phone,
                  }}
                  onSuccess={handleProfileUpdateSuccess}
                  onCancel={() => setIsEditingProfile(false)}
                />
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium truncate">{profile.name || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="text-sm font-medium">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Last Login</p>
                      <p className="text-sm font-medium">{formatDate(profile.lastLoginAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings Card */}
          <Card className="border-2 border-orange-200">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your email address and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="email" className="text-xs sm:text-sm py-2">Change Email</TabsTrigger>
                  <TabsTrigger value="password" className="text-xs sm:text-sm py-2">Change Password</TabsTrigger>
                  <TabsTrigger value="location" className="text-xs sm:text-sm py-2">Location</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="mt-4 sm:mt-6">
                  <EmailChangeForm
                    currentEmail={profile.email}
                    onSuccess={handleEmailChangeSuccess}
                  />
                </TabsContent>
                
                <TabsContent value="password" className="mt-4 sm:mt-6">
                  <PasswordChangeForm onSuccess={handlePasswordChangeSuccess} />
                </TabsContent>
                
                <TabsContent value="location" className="mt-4 sm:mt-6">
                  <LocationForm onSuccess={fetchProfile} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
