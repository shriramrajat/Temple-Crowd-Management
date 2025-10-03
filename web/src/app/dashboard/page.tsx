'use client';

import React from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../components/auth/UserProfile';
import { SignOutButton } from '../../components/auth/SignOutButton';
import { Card } from '../../components/ui/Card';

/**
 * Protected Dashboard Page
 * This page demonstrates the use of AuthGuard for route protection
 */
export default function DashboardPage() {
  return (
    <AuthGuard redirectTo="/login">
      <DashboardContent />
    </AuthGuard>
  );
}

/**
 * Dashboard content that only renders for authenticated users
 */
function DashboardContent() {
  const { getUserDisplayName } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="mt-2 text-gray-600">
            This is your protected dashboard. Only authenticated users can see this page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <UserProfile />
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Account Settings</span>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Manage
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Privacy Settings</span>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Configure
                </button>
              </div>
              <div className="pt-4 border-t">
                <SignOutButton />
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">24</div>
            <div className="text-sm text-gray-600">Days Active</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Projects</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">48</div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </Card>
        </div>
      </div>
    </div>
  );
}