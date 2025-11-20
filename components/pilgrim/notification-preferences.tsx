/**
 * Pilgrim Notification Preferences Component
 * 
 * Allows pilgrims to configure notification preferences.
 * Requirements: 3.3
 */

'use client';

import { useState } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThresholdLevel } from '@/lib/crowd-risk/types';
import { toast } from 'sonner';

interface NotificationPreferences {
  enabled: boolean;
  severityLevels: {
    emergency: boolean;
    critical: boolean;
    warning: boolean;
    normal: boolean;
  };
}

interface NotificationPreferencesProps {
  initialPreferences?: NotificationPreferences;
  onSave?: (preferences: NotificationPreferences) => void;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  severityLevels: {
    emergency: true,
    critical: true,
    warning: true,
    normal: false,
  },
};

/**
 * Notification Preferences Component
 * 
 * Requirement 3.3: Implement opt-in/opt-out preferences
 */
export function NotificationPreferences({
  initialPreferences = defaultPreferences,
  onSave,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleToggleEnabled = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, enabled }));
  };
  
  const handleToggleSeverity = (severity: keyof NotificationPreferences['severityLevels'], enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      severityLevels: {
        ...prev.severityLevels,
        [severity]: enabled,
      },
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save preferences (in production, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSave) {
        onSave(preferences);
      }
      
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
  
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
      </div>
      
      {/* Master Toggle */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {preferences.enabled ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="notifications-enabled" className="text-base font-medium">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive crowd safety alerts and updates
              </p>
            </div>
          </div>
          <Switch
            id="notifications-enabled"
            checked={preferences.enabled}
            onCheckedChange={handleToggleEnabled}
          />
        </div>
      </div>
      
      {/* Severity Level Toggles */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-muted-foreground">Alert Levels</h4>
        
        {/* Emergency */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-100 text-red-800">Emergency</Badge>
            <div>
              <Label htmlFor="severity-emergency" className="text-sm font-medium">
                Emergency Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Critical situations requiring immediate action
              </p>
            </div>
          </div>
          <Switch
            id="severity-emergency"
            checked={preferences.severityLevels.emergency}
            onCheckedChange={(checked) => handleToggleSeverity('emergency', checked)}
            disabled={!preferences.enabled}
          />
        </div>
        
        {/* Critical */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge className="bg-orange-100 text-orange-800">Critical</Badge>
            <div>
              <Label htmlFor="severity-critical" className="text-sm font-medium">
                Critical Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Severe crowd conditions to avoid
              </p>
            </div>
          </div>
          <Switch
            id="severity-critical"
            checked={preferences.severityLevels.critical}
            onCheckedChange={(checked) => handleToggleSeverity('critical', checked)}
            disabled={!preferences.enabled}
          />
        </div>
        
        {/* Warning */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            <div>
              <Label htmlFor="severity-warning" className="text-sm font-medium">
                Warning Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                High crowd density advisories
              </p>
            </div>
          </div>
          <Switch
            id="severity-warning"
            checked={preferences.severityLevels.warning}
            onCheckedChange={(checked) => handleToggleSeverity('warning', checked)}
            disabled={!preferences.enabled}
          />
        </div>
        
        {/* Normal */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800">Normal</Badge>
            <div>
              <Label htmlFor="severity-normal" className="text-sm font-medium">
                All-Clear Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                When areas return to safe levels
              </p>
            </div>
          </div>
          <Switch
            id="severity-normal"
            checked={preferences.severityLevels.normal}
            onCheckedChange={(checked) => handleToggleSeverity('normal', checked)}
            disabled={!preferences.enabled}
          />
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setPreferences(initialPreferences)}
          disabled={!hasChanges || isSaving}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
      
      {/* Info */}
      {!preferences.enabled && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Notifications are disabled. You will not receive crowd safety alerts.
          </p>
        </div>
      )}
    </Card>
  );
}
