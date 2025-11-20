/**
 * Data Synchronization Utility
 * 
 * Handles synchronization between local storage and server-side API
 * for accessibility features.
 */

import type { AccessibilityProfile } from '@/lib/types/accessibility';
import type { SlotAllocation } from '@/lib/types/priority-slots';
import type { AccessibilityMetrics } from '@/lib/types/accessibility-analytics';

/**
 * Sync status
 */
export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  FAILED = 'failed',
  OFFLINE = 'offline',
}

/**
 * Sync queue item
 */
interface SyncQueueItem {
  id: string;
  type: 'profile' | 'allocation' | 'metrics';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retries: number;
  status: SyncStatus;
}

const SYNC_QUEUE_KEY = 'accessibility_sync_queue';
const MAX_RETRIES = 3;

/**
 * Get sync queue from local storage
 */
function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error reading sync queue:', error);
    return [];
  }
}

/**
 * Save sync queue to local storage
 */
function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
  }
}

/**
 * Add item to sync queue
 */
export function addToSyncQueue(
  type: SyncQueueItem['type'],
  action: SyncQueueItem['action'],
  data: any
): void {
  const queue = getSyncQueue();
  
  const item: SyncQueueItem = {
    id: `${type}-${action}-${Date.now()}`,
    type,
    action,
    data,
    timestamp: new Date(),
    retries: 0,
    status: SyncStatus.PENDING,
  };
  
  queue.push(item);
  saveSyncQueue(queue);
}

/**
 * Sync accessibility profile to server
 */
export async function syncProfile(profile: AccessibilityProfile): Promise<boolean> {
  try {
    const response = await fetch('/api/accessibility/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to sync profile');
    }

    return true;
  } catch (error) {
    console.error('Error syncing profile:', error);
    addToSyncQueue('profile', 'update', profile);
    return false;
  }
}

/**
 * Sync slot allocation to server
 */
export async function syncAllocation(allocation: SlotAllocation): Promise<boolean> {
  try {
    const response = await fetch('/api/accessibility/slots/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allocation),
    });

    if (!response.ok) {
      throw new Error('Failed to sync allocation');
    }

    return true;
  } catch (error) {
    console.error('Error syncing allocation:', error);
    addToSyncQueue('allocation', 'create', allocation);
    return false;
  }
}

/**
 * Sync metrics to server
 */
export async function syncMetrics(metrics: AccessibilityMetrics): Promise<boolean> {
  try {
    const response = await fetch('/api/accessibility/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });

    if (!response.ok) {
      throw new Error('Failed to sync metrics');
    }

    return true;
  } catch (error) {
    console.error('Error syncing metrics:', error);
    addToSyncQueue('metrics', 'create', metrics);
    return false;
  }
}

/**
 * Process sync queue
 * Attempts to sync all pending items
 */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue();
  const updatedQueue: SyncQueueItem[] = [];

  for (const item of queue) {
    if (item.status === SyncStatus.SYNCED) {
      continue; // Skip already synced items
    }

    if (item.retries >= MAX_RETRIES) {
      item.status = SyncStatus.FAILED;
      updatedQueue.push(item);
      continue;
    }

    try {
      let success = false;

      switch (item.type) {
        case 'profile':
          success = await syncProfile(item.data);
          break;
        case 'allocation':
          success = await syncAllocation(item.data);
          break;
        case 'metrics':
          success = await syncMetrics(item.data);
          break;
      }

      if (success) {
        item.status = SyncStatus.SYNCED;
      } else {
        item.retries++;
        item.status = SyncStatus.PENDING;
        updatedQueue.push(item);
      }
    } catch (error) {
      console.error('Error processing sync item:', error);
      item.retries++;
      item.status = SyncStatus.PENDING;
      updatedQueue.push(item);
    }
  }

  saveSyncQueue(updatedQueue);
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
  pending: number;
  failed: number;
  total: number;
} {
  const queue = getSyncQueue();
  
  return {
    pending: queue.filter(item => item.status === SyncStatus.PENDING).length,
    failed: queue.filter(item => item.status === SyncStatus.FAILED).length,
    total: queue.length,
  };
}

/**
 * Clear synced items from queue
 */
export function clearSyncedItems(): void {
  const queue = getSyncQueue();
  const activeQueue = queue.filter(item => item.status !== SyncStatus.SYNCED);
  saveSyncQueue(activeQueue);
}

/**
 * Check if online and process queue
 */
export function initAutoSync(): void {
  if (typeof window === 'undefined') return;

  // Process queue on page load
  processSyncQueue();

  // Process queue when coming back online
  window.addEventListener('online', () => {
    console.log('Back online, processing sync queue...');
    processSyncQueue();
  });

  // Periodic sync every 5 minutes
  setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  }, 5 * 60 * 1000);
}
