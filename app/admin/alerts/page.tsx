'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import AlertsPanel from '@/components/admin/alerts-panel'
import VolunteerManagement from '@/components/admin/volunteer-management'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Users } from 'lucide-react'

export default function AlertsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Response Center</h1>
          <p className="text-muted-foreground">Manage real-time alerts and coordinate volunteer response</p>
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Volunteers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="volunteers" className="space-y-4">
            <VolunteerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
