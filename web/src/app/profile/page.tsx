'use client';

import React from 'react';
import { withAuth } from '../../components/auth/withAuth';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../components/auth/UserProfile';
import { SignOutButton } from '../../components/auth/SignOutButton';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

/**
 * Profile Page Component
 * This demonstrates using the withAuth HOC for route protection
 */
function ProfilePageComponent() {
  const { user, getUserDisplayName, getUserEmail } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <UserProfile />
          </Card>

          {/* Account Details Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {getUserDisplayName()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {getUserEmail()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1 text-sm text-gray-500 font-mono">
                  {user?.uid}
                </div>
              </div>
            </div>
          </Card>

          {/* Account Actions Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Privacy Settings
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage your privacy and data preferences
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Download Data
                  </h3>
                  <p className="text-sm text-gray-500">
                    Export your account data
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Sign Out
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sign out of your account
                    </p>
                  </div>
                  <SignOutButton />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Protected Profile Page
 * Uses withAuth HOC to protect the route
 */
const ProfilePage = withAuth(ProfilePageComponent, {
  redirectTo: '/login',
});

export default ProfilePage;