'use client'

import AdminLayout from '@/components/admin/admin-layout'
import { PerformanceDashboard } from '@/components/admin/performance-dashboard'

export default function PerformancePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system performance metrics and diagnostics
          </p>
        </div>
        <PerformanceDashboard />
      </div>
    </AdminLayout>
  )
}
