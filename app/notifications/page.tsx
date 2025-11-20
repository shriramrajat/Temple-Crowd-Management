'use client';

/**
 * Notifications Page
 * 
 * Displays the notification center for pilgrims to view and manage
 * their accessibility notifications.
 */

import { NotificationCenter } from '@/components/notifications/notification-center';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  // Mock pilgrim ID - in production, this would come from authentication
  const pilgrimId = 'pilgrim-123';

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <NotificationCenter pilgrimId={pilgrimId} />
      </div>
    </main>
  );
}
