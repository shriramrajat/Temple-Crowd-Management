'use client';

/**
 * Admin Notification Configuration Component
 * 
 * Allows admins to configure their notification preferences including:
 * - Channel selection (push, SMS, email)
 * - Severity filtering
 * - Area filtering
 * 
 * Requirements: 2.5, 5.3
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AdminNotificationConfig,
  NotificationChannel,
  ThresholdLevel,
  MonitoredArea,
} from '@/lib/crowd-risk/types';
import { getAdminNotifier } from '@/lib/crowd-risk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react';

// Validation schema
const notificationConfigSchema = z.object({
  channels: z.array(z.nativeEnum(NotificationChannel)).min(1, 'Select at least one channel'),
  severityFilter: z.array(z.nativeEnum(ThresholdLevel)),
  areaFilter: z.array(z.string()),
});

type NotificationConfigFormData = z.infer<typeof notificationConfigSchema>;

interface NotificationConfigProps {
  adminId: string;
  areas: MonitoredArea[];
}

export function NotificationConfig({ adminId, areas }: NotificationConfigProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<AdminNotificationConfig | null>(null);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationConfigFormData>({
    resolver: zodResolver(notificationConfigSchema),
    defaultValues: {
      channels: [NotificationChannel.PUSH],
      severityFilter: [],
      areaFilter: [],
    },
  });

  const channels = watch('channels');
  const severityFilter = watch('severityFilter');
  const areaFilter = watch('areaFilter');

  // Load existing configuration
  useEffect(() => {
    const loadConfig = () => {
      const notifier = getAdminNotifier();
      const config = notifier.getConfig(adminId);
      
      if (config) {
        setCurrentConfig(config);
        setValue('channels', config.channels);
        setValue('severityFilter', config.severityFilter);
        setValue('areaFilter', config.areaFilter || []);
      }
    };

    loadConfig();
  }, [adminId, setValue]);

  const onSubmit = async (data: NotificationConfigFormData) => {
    setIsLoading(true);

    try {
      const config: AdminNotificationConfig = {
        adminId,
        channels: data.channels,
        severityFilter: data.severityFilter,
        areaFilter: data.areaFilter.length > 0 ? data.areaFilter : undefined,
      };

      const notifier = getAdminNotifier();
      notifier.configureNotifications(config);
      
      setCurrentConfig(config);
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Failed to save notification config:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    const newChannels = channels.includes(channel)
      ? channels.filter(c => c !== channel)
      : [...channels, channel];
    setValue('channels', newChannels);
  };

  const toggleSeverity = (severity: ThresholdLevel) => {
    const newSeverities = severityFilter.includes(severity)
      ? severityFilter.filter(s => s !== severity)
      : [...severityFilter, severity];
    setValue('severityFilter', newSeverities);
  };

  const toggleArea = (areaId: string) => {
    const newAreas = areaFilter.includes(areaId)
      ? areaFilter.filter(a => a !== areaId)
      : [...areaFilter, areaId];
    setValue('areaFilter', newAreas);
  };

  const selectAllAreas = () => {
    setValue('areaFilter', areas.map(a => a.id));
  };

  const clearAllAreas = () => {
    setValue('areaFilter', []);
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.PUSH:
        return <Bell className="h-4 w-4" />;
      case NotificationChannel.SMS:
        return <MessageSquare className="h-4 w-4" />;
      case NotificationChannel.EMAIL:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: ThresholdLevel) => {
    switch (severity) {
      case ThresholdLevel.EMERGENCY:
        return 'destructive';
      case ThresholdLevel.CRITICAL:
        return 'destructive';
      case ThresholdLevel.WARNING:
        return 'default';
      case ThresholdLevel.NORMAL:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you receive crowd risk alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Channel Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Notification Channels</Label>
            <p className="text-sm text-muted-foreground">
              Select which channels you want to receive notifications through
            </p>
            {errors.channels && (
              <p className="text-sm text-destructive">{errors.channels.message}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(NotificationChannel).map((channel) => (
                <div
                  key={channel}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    channels.includes(channel)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleChannel(channel)}
                >
                  <Checkbox
                    checked={channels.includes(channel)}
                    onCheckedChange={() => toggleChannel(channel)}
                  />
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(channel)}
                    <span className="font-medium capitalize">{channel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Severity Filter</Label>
            <p className="text-sm text-muted-foreground">
              Leave empty to receive all alerts, or select specific severity levels
            </p>
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Emergency alerts bypass all filters and are always delivered
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(ThresholdLevel).map((severity) => (
                <Badge
                  key={severity}
                  variant={severityFilter.includes(severity) ? getSeverityColor(severity) : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => toggleSeverity(severity)}
                >
                  {severity.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Area Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Area Filter</Label>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllAreas}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllAreas}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Leave empty to receive alerts from all areas, or select specific areas
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => toggleArea(area.id)}
                >
                  <Checkbox
                    checked={areaFilter.includes(area.id)}
                    onCheckedChange={() => toggleArea(area.id)}
                  />
                  <Label className="cursor-pointer flex-1">
                    {area.name}
                  </Label>
                </div>
              ))}
            </div>
            {areaFilter.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {areaFilter.length} area{areaFilter.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
