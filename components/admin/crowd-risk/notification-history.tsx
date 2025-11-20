'use client';

/**
 * Notification Delivery History Component
 * 
 * Displays detailed history of notification deliveries with filtering.
 * Requirements: 2.4
 */

import { useState, useEffect } from 'react';
import { NotificationResult, NotificationChannel } from '@/lib/crowd-risk/types';
import { getAdminNotifier } from '@/lib/crowd-risk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Bell, Mail, MessageSquare, RefreshCw } from 'lucide-react';

interface NotificationHistoryProps {
  maxEntries?: number;
}

export function NotificationHistory({ maxEntries = 50 }: NotificationHistoryProps) {
  const [history, setHistory] = useState<NotificationResult[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<NotificationResult[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const notifier = getAdminNotifier();
      const historyData = notifier.getDeliveryHistory(100); // Get last 100 entries
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (error) {
      console.error('Failed to load notification history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    let filtered = [...history];

    if (channelFilter !== 'all') {
      filtered = filtered.filter(entry => entry.channel === channelFilter);
    }

    if (statusFilter === 'success') {
      filtered = filtered.filter(entry => entry.delivered);
    } else if (statusFilter === 'failed') {
      filtered = filtered.filter(entry => !entry.delivered);
    }

    setFilteredHistory(filtered.slice(0, maxEntries));
  }, [history, channelFilter, statusFilter, maxEntries]);

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

  const formatDeliveryTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification Delivery History</CardTitle>
            <CardDescription>
              Recent notification delivery attempts and results
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistory}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Channel:</span>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={NotificationChannel.PUSH}>Push</SelectItem>
                <SelectItem value={NotificationChannel.SMS}>SMS</SelectItem>
                <SelectItem value={NotificationChannel.EMAIL}>Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* History Table */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {history.length === 0
              ? 'No notification history available'
              : 'No notifications match the selected filters'}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Admin ID</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {entry.delivered ? (
                        <Badge variant="default" className="flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Success</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center space-x-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          <span>Failed</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(entry.channel)}
                        <span className="capitalize">{entry.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.adminId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.deliveryTime < 3000 ? 'secondary' : 'outline'}
                      >
                        {formatDeliveryTime(entry.deliveryTime)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.error ? (
                        <span className="text-sm text-destructive">{entry.error}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {filteredHistory.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredHistory.length} of {history.length} notifications
          </div>
        )}
      </CardContent>
    </Card>
  );
}
