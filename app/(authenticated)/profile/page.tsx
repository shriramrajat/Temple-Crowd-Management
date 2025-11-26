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
import { X } from 'lucide-react';

/**
 * InfoCard Component - Reusable card for displaying profile information
 */
interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: 'orange' | 'blue' | 'red' | 'green' | 'purple';
}

function InfoCard({ icon: Icon, label, value, color = 'orange' }: InfoCardProps) {
  const colorClasses = {
    orange: 'from-orange-50 to-amber-50 border-orange-100 text-orange-600',
    blue: 'from-blue-50 to-indigo-50 border-blue-100 text-blue-600',
    red: 'from-red-50 to-pink-50 border-red-100 text-red-600',
    green: 'from-green-50 to-emerald-50 border-green-100 text-green-600',
    purple: 'from-purple-50 to-violet-50 border-purple-100 text-purple-600',
  };

  return (
    <div className={`flex items-center gap-3 p-4 bg-gradient-to-r ${colorClasses[color]} rounded-xl border shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[2]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  dateOfBirth: string | null;
  gender: string | null;
  idProofType: string | null;
  idProofNumber: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  accessibilityNeeds: string | null;
  preferredLanguage: string | null;
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
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from /api/profile:', text);
        throw new Error('Server returned an invalid response. Please check the server logs.');
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header Section with Background Pattern */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/30">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {profile.name || 'Welcome, Pilgrim'}
                </h1>
                <p className="text-orange-100 text-sm sm:text-base mt-1">
                  Manage your temple visit profile
                </p>
              </div>
            </div>
            <LogoutButton 
              variant="outline" 
              size="default"
              showIcon={true}
              showConfirmation={true}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 self-start sm:self-auto"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-center">{profile.name || 'Pilgrim'}</h3>
                <p className="text-orange-100 text-sm text-center mt-1">{profile.email}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(profile.createdAt).split(',')[1]}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm font-semibold text-gray-900">{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Never'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-600">Profile Status</span>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!isEditingProfile && (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full border-2"
                  onClick={() => window.location.href = '/darshan/my-bookings'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  My Bookings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {isEditingProfile ? 'Edit Your Profile' : 'Profile Information'}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {isEditingProfile ? 'Update your personal information' : 'View your account details'}
                  </CardDescription>
                </div>
                {isEditingProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingProfile(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
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
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    idProofType: profile.idProofType,
                    idProofNumber: profile.idProofNumber,
                    emergencyContactName: profile.emergencyContactName,
                    emergencyContactPhone: profile.emergencyContactPhone,
                    accessibilityNeeds: profile.accessibilityNeeds,
                    preferredLanguage: profile.preferredLanguage,
                  }}
                  onSuccess={handleProfileUpdateSuccess}
                  onCancel={() => setIsEditingProfile(false)}
                />
              ) : (
                <div className="space-y-8 p-6">
                  {/* Basic Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-orange-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard icon={Mail} label="Email" value={profile.email} color="orange" />
                      <InfoCard icon={User} label="Name" value={profile.name || 'Not set'} color="orange" />
                      <InfoCard icon={Phone} label="Phone Number" value={profile.phone || 'Not set'} color="orange" />
                      <InfoCard icon={Calendar} label="Date of Birth" value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not set'} color="orange" />
                      <InfoCard icon={User} label="Gender" value={profile.gender || 'Not set'} color="orange" />
                      <InfoCard icon={Calendar} label="Preferred Language" value={profile.preferredLanguage || 'English'} color="orange" />
                    </div>
                  </div>

                  {/* ID Verification */}
                  {(profile.idProofType || profile.idProofNumber) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">ID Verification</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={CheckCircle} label="ID Proof Type" value={profile.idProofType || 'Not set'} color="blue" />
                        <InfoCard icon={CheckCircle} label="ID Number" value={profile.idProofNumber ? `****${profile.idProofNumber.slice(-4)}` : 'Not set'} color="blue" />
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {(profile.emergencyContactName || profile.emergencyContactPhone) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-red-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={User} label="Contact Name" value={profile.emergencyContactName || 'Not set'} color="red" />
                        <InfoCard icon={Phone} label="Contact Phone" value={profile.emergencyContactPhone || 'Not set'} color="red" />
                      </div>
                    </div>
                  )}

                  {/* Accessibility Needs */}
                  {profile.accessibilityNeeds && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-purple-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Accessibility Needs</h3>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 shadow-sm">
                        <p className="text-sm text-gray-900 leading-relaxed">{profile.accessibilityNeeds}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Lock className="w-6 h-6 text-orange-600" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Manage your email address, password, and location
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
    </div>
  );
}
