'use client';

/**
 * Emergency Mode Controls Demo Page
 * 
 * Demonstrates the emergency mode UI controls including:
 * - Emergency activation button
 * - Emergency mode status indicator
 * - Deactivation confirmation dialog
 * - Display of affected areas during emergency
 * 
 * Requirements: 5.4, 5.5
 */

import { useState } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { EmergencyModeControls, EmergencyStatusBadge } from '@/components/admin/crowd-risk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { MonitoredArea } from '@/lib/crowd-risk/types';
import { AreaType } from '@/lib/crowd-risk/types';

// Mock areas for demonstration
const mockAreas: MonitoredArea[] = [
  {
    id: 'area-1',
    name: 'Main Entrance',
    location: { latitude: 21.1702, longitude: 72.8311 },
    capacity: 500,
    adjacentAreas: ['area-2', 'area-3'],
    metadata: {
      type: AreaType.ENTRANCE,
      description: 'Primary entrance to the temple complex',
    },
  },
  {
    id: 'area-2',
    name: 'Garbha Griha',
    location: { latitude: 21.1705, longitude: 72.8315 },
    capacity: 200,
    adjacentAreas: ['area-1', 'area-3', 'area-4'],
    metadata: {
      type: AreaType.GATHERING_SPACE,
      description: 'Main sanctum area',
    },
  },
  {
    id: 'area-3',
    name: 'Corridor A',
    location: { latitude: 21.1708, longitude: 72.8318 },
    capacity: 300,
    adjacentAreas: ['area-1', 'area-2', 'area-5'],
    metadata: {
      type: AreaType.CORRIDOR,
      description: 'Main corridor connecting areas',
    },
  },
  {
    id: 'area-4',
    name: 'Prayer Hall',
    location: { latitude: 21.1710, longitude: 72.8320 },
    capacity: 400,
    adjacentAreas: ['area-2', 'area-5'],
    metadata: {
      type: AreaType.GATHERING_SPACE,
      description: 'Large prayer and gathering hall',
    },
  },
  {
    id: 'area-5',
    name: 'Exit Gate',
    location: { latitude: 21.1712, longitude: 72.8322 },
    capacity: 350,
    adjacentAreas: ['area-3', 'area-4'],
    metadata: {
      type: AreaType.EXIT,
      description: 'Main exit point',
    },
  },
];

export default function EmergencyModeDemoPage() {
  const [activationLog, setActivationLog] = useState<string[]>([]);
  const adminId = 'admin-demo-001';

  const handleEmergencyActivate = (areaId: string, adminId: string) => {
    const area = mockAreas.find(a => a.id === areaId);
    const timestamp = new Date().toLocaleTimeString();
    setActivationLog(prev => [
      `[${timestamp}] Emergency activated for ${area?.name || areaId} by ${adminId}`,
      ...prev
    ]);
  };

  const handleEmergencyDeactivate = (adminId: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivationLog(prev => [
      `[${timestamp}] Emergency deactivated by ${adminId}`,
      ...prev
    ]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              Emergency Mode Controls Demo
            </h1>
            <p className="text-muted-foreground mt-1">
              Test and demonstrate emergency mode activation and deactivation
            </p>
          </div>
          <EmergencyStatusBadge showWhenInactive />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            This page demonstrates the emergency mode UI controls. In production, these controls
            will be integrated with the EmergencyModeManager service (Task 9.1) for real-time
            state management and notification delivery.
          </AlertDescription>
        </Alert>

        {/* Emergency Mode Controls */}
        <EmergencyModeControls
          areas={mockAreas}
          currentAreaId="area-2"
          adminId={adminId}
          onEmergencyActivate={handleEmergencyActivate}
          onEmergencyDeactivate={handleEmergencyDeactivate}
        />

        <Separator />

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activation Features</CardTitle>
              <CardDescription>
                Emergency mode activation capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Manual activation by authorized administrators</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Area selection for targeted emergency response</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Confirmation dialog to prevent accidental activation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Automatic expansion to adjacent areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Audit logging with admin ID and timestamp</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Indicator Features</CardTitle>
              <CardDescription>
                Real-time emergency mode status display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Prominent visual alert with animation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Display of trigger area and activation details</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>List of all affected areas with badges</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Elapsed time since activation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>Quick deactivation button with confirmation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Monitored Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Monitored Areas</CardTitle>
            <CardDescription>
              Areas available for emergency mode activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAreas.map((area) => (
                <Card key={area.id} className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{area.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {area.metadata.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{area.capacity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="secondary" className="text-xs">
                        {area.metadata.type}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Adjacent Areas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {area.adjacentAreas.map((adjId) => {
                          const adjArea = mockAreas.find(a => a.id === adjId);
                          return (
                            <Badge key={adjId} variant="outline" className="text-xs">
                              {adjArea?.name || adjId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        {activationLog.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent emergency mode activation and deactivation events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 font-mono text-xs">
                {activationLog.map((log, index) => (
                  <div 
                    key={index} 
                    className="p-2 bg-muted rounded text-muted-foreground"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements Reference */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Requirements Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline">5.4</Badge>
                <span>Manual activation of emergency mode by authorized administrators</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline">5.5</Badge>
                <span>Deactivation confirmation and logging of emergency mode events</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
