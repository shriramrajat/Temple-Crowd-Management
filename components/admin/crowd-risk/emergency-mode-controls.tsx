'use client';

/**
 * Emergency Mode Controls Component
 * 
 * Provides UI controls for emergency mode management including:
 * - Emergency activation button
 * - Emergency mode status indicator
 * - Deactivation confirmation dialog
 * - Display of affected areas during emergency
 * 
 * Requirements: 5.4, 5.5
 */

import { useState, useEffect } from 'react';
import {
  EmergencyMode,
  EmergencyTrigger,
  MonitoredArea,
  Permission,
} from '@/lib/crowd-risk/types';
import { getAuthService } from '@/lib/crowd-risk/auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Power, 
  PowerOff, 
  MapPin, 
  Clock,
  User,
  Zap
} from 'lucide-react';

interface EmergencyModeControlsProps {
  areas: MonitoredArea[];
  currentAreaId?: string;
  adminId: string;
  onEmergencyActivate?: (areaId: string, adminId: string) => void;
  onEmergencyDeactivate?: (adminId: string) => void;
}

export function EmergencyModeControls({
  areas,
  currentAreaId,
  adminId,
  onEmergencyActivate,
  onEmergencyDeactivate,
}: EmergencyModeControlsProps) {
  const [emergencyState, setEmergencyState] = useState<EmergencyMode | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedAreaForActivation, setSelectedAreaForActivation] = useState<string | null>(null);
  
  // Task 15.1: Check if user has permission to activate emergency mode
  const authService = getAuthService();
  const canActivateEmergency = authService.checkPermission(adminId, Permission.ACTIVATE_EMERGENCY);

  // Mock emergency state - will be replaced with actual EmergencyModeManager in task 9.1
  useEffect(() => {
    // TODO: Replace with actual EmergencyModeManager subscription
    // const manager = getEmergencyModeManager();
    // const unsubscribe = manager.onEmergencyStateChange((state) => {
    //   setEmergencyState(state);
    // });
    // return unsubscribe;
  }, []);

  const handleActivateClick = (areaId: string) => {
    setSelectedAreaForActivation(areaId);
    setShowActivateDialog(true);
  };

  const handleConfirmActivate = () => {
    if (!selectedAreaForActivation) return;

    try {
      // TODO: Replace with actual EmergencyModeManager call
      // const manager = getEmergencyModeManager();
      // manager.activateEmergency(selectedAreaForActivation, EmergencyTrigger.MANUAL, adminId);
      
      // Mock emergency state for UI demonstration
      const triggerArea = areas.find(a => a.id === selectedAreaForActivation);
      const affectedAreaIds = triggerArea 
        ? [triggerArea.id, ...triggerArea.adjacentAreas]
        : [selectedAreaForActivation];

      const mockState: EmergencyMode = {
        active: true,
        activatedAt: Date.now(),
        activatedBy: EmergencyTrigger.MANUAL,
        adminId,
        triggerAreaId: selectedAreaForActivation,
        affectedAreas: affectedAreaIds,
      };
      
      setEmergencyState(mockState);
      
      if (onEmergencyActivate) {
        onEmergencyActivate(selectedAreaForActivation, adminId);
      }

      toast.error('Emergency Mode Activated', {
        description: `Emergency protocols initiated for ${triggerArea?.name || 'selected area'}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to activate emergency mode:', error);
      toast.error('Failed to activate emergency mode', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setShowActivateDialog(false);
      setSelectedAreaForActivation(null);
    }
  };

  const handleDeactivateClick = () => {
    setShowDeactivateDialog(true);
  };

  const handleConfirmDeactivate = () => {
    try {
      // TODO: Replace with actual EmergencyModeManager call
      // const manager = getEmergencyModeManager();
      // manager.deactivateEmergency(adminId);
      
      if (onEmergencyDeactivate) {
        onEmergencyDeactivate(adminId);
      }

      toast.success('Emergency Mode Deactivated', {
        description: 'Normal operations resumed',
      });

      setEmergencyState(null);
    } catch (error) {
      console.error('Failed to deactivate emergency mode:', error);
      toast.error('Failed to deactivate emergency mode', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setShowDeactivateDialog(false);
    }
  };

  const getAreaName = (areaId: string): string => {
    return areas.find(a => a.id === areaId)?.name || areaId;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getElapsedTime = (timestamp: number): string => {
    const elapsed = Date.now() - timestamp;
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-4">
      {/* Emergency Status Indicator */}
      {emergencyState?.active && (
        <Alert variant="destructive" className="border-2 animate-pulse">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            EMERGENCY MODE ACTIVE
          </AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  <strong>Trigger Area:</strong> {getAreaName(emergencyState.triggerAreaId)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  <strong>Activated:</strong> {emergencyState.activatedAt && getElapsedTime(emergencyState.activatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>
                  <strong>Trigger:</strong> {emergencyState.activatedBy === EmergencyTrigger.AUTOMATIC ? 'Automatic' : 'Manual'}
                </span>
              </div>
              {emergencyState.adminId && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    <strong>By:</strong> {emergencyState.adminId}
                  </span>
                </div>
              )}
            </div>

            {/* Affected Areas */}
            <div className="mt-4">
              <p className="font-semibold mb-2">Affected Areas ({emergencyState.affectedAreas.length}):</p>
              <div className="flex flex-wrap gap-2">
                {emergencyState.affectedAreas.map((areaId) => (
                  <Badge 
                    key={areaId} 
                    variant="destructive"
                    className="px-3 py-1"
                  >
                    {getAreaName(areaId)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Deactivate Button - Task 15.1: Hide for users without permission */}
            {canActivateEmergency && (
              <div className="mt-4 pt-3 border-t border-destructive/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivateClick}
                  className="bg-background hover:bg-background/80"
                >
                  <PowerOff className="h-4 w-4 mr-2" />
                  Deactivate Emergency Mode
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency Activation Controls - Task 15.1: Hide for users without permission */}
      {!emergencyState?.active && canActivateEmergency && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Mode Controls
            </CardTitle>
            <CardDescription>
              Manually activate emergency mode for critical situations requiring immediate intervention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Area Selection for Activation */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Select area to activate emergency mode:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {areas.map((area) => (
                  <Button
                    key={area.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleActivateClick(area.id)}
                    className="justify-start hover:border-destructive hover:text-destructive"
                    disabled={emergencyState?.active || !canActivateEmergency}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {area.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Activate for Current Area */}
            {currentAreaId && (
              <div className="pt-3 border-t">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => handleActivateClick(currentAreaId)}
                  className="w-full"
                  disabled={emergencyState?.active || !canActivateEmergency}
                >
                  <Power className="h-5 w-5 mr-2" />
                  Activate Emergency Mode for {getAreaName(currentAreaId)}
                </Button>
              </div>
            )}

            {/* Warning Message */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Emergency mode will:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Send high-priority alerts to all administrators</li>
                  <li>Expand notifications to adjacent areas</li>
                  <li>Override notification preferences</li>
                  <li>Log activation event for audit purposes</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Activation Confirmation Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Activate Emergency Mode?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to activate emergency mode for{' '}
                <strong>{selectedAreaForActivation && getAreaName(selectedAreaForActivation)}</strong>.
              </p>
              <p className="text-sm">
                This will trigger:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>High-priority alerts to all administrators</li>
                <li>Expanded notifications to adjacent areas</li>
                <li>Override of notification preferences</li>
                <li>Audit log entry with your admin ID</li>
              </ul>
              <p className="font-semibold text-destructive">
                Only activate emergency mode for critical situations requiring immediate intervention.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmActivate}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Power className="h-4 w-4 mr-2" />
              Activate Emergency Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivation Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PowerOff className="h-5 w-5" />
              Deactivate Emergency Mode?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to deactivate emergency mode for{' '}
                <strong>{emergencyState?.triggerAreaId && getAreaName(emergencyState.triggerAreaId)}</strong>.
              </p>
              <p className="text-sm">
                This will:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Return to normal notification protocols</li>
                <li>Stop expanded area notifications</li>
                <li>Resume standard notification preferences</li>
                <li>Log deactivation event with your admin ID</li>
              </ul>
              {emergencyState?.activatedAt && (
                <p className="text-sm text-muted-foreground">
                  Emergency mode was active for {getElapsedTime(emergencyState.activatedAt)}.
                </p>
              )}
              <p className="font-semibold">
                Ensure the situation has been resolved before deactivating.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivate}>
              <PowerOff className="h-4 w-4 mr-2" />
              Deactivate Emergency Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
