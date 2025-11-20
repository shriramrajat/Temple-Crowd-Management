/**
 * Notification Queue Processor
 * 
 * Optimized batch processing for notification queue
 */

import type { NotificationQueueItem } from '@/lib/types/notifications';

/**
 * Batch processor configuration
 */
interface BatchConfig {
  batchSize: number;
  processingInterval: number; // milliseconds
  maxRetries: number;
}

const DEFAULT_CONFIG: BatchConfig = {
  batchSize: 10,
  processingInterval: 5000, // 5 seconds
  maxRetries: 3,
};

/**
 * Notification queue processor with batching
 */
class NotificationQueueProcessor {
  private queue: NotificationQueueItem[] = [];
  private processing: boolean = false;
  private config: BatchConfig;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add notification to queue
   */
  enqueue(item: NotificationQueueItem): void {
    this.queue.push(item);
    
    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }
  }

  /**
   * Add multiple notifications to queue
   */
  enqueueBatch(items: NotificationQueueItem[]): void {
    this.queue.push(...items);
    
    if (!this.processing) {
      this.startProcessing();
    }
  }

  /**
   * Start batch processing
   */
  private startProcessing(): void {
    if (this.processing) return;

    this.processing = true;
    this.intervalId = setInterval(() => {
      this.processBatch();
    }, this.config.processingInterval);

    // Process immediately
    this.processBatch();
  }

  /**
   * Stop processing
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.processing = false;
  }

  /**
   * Process a batch of notifications
   */
  private async processBatch(): Promise<void> {
    if (this.queue.length === 0) {
      this.stop();
      return;
    }

    // Get batch
    const batch = this.queue.splice(0, this.config.batchSize);

    // Group by priority for efficient processing
    const priorityGroups = this.groupByPriority(batch);

    // Process urgent first, then high, medium, low
    for (const priority of ['urgent', 'high', 'medium', 'low']) {
      const items = priorityGroups[priority] || [];
      await this.processGroup(items);
    }
  }

  /**
   * Group notifications by priority
   */
  private groupByPriority(
    items: NotificationQueueItem[]
  ): Record<string, NotificationQueueItem[]> {
    return items.reduce((groups, item) => {
      const priority = item.notification.priority;
      if (!groups[priority]) {
        groups[priority] = [];
      }
      groups[priority].push(item);
      return groups;
    }, {} as Record<string, NotificationQueueItem[]>);
  }

  /**
   * Process a group of notifications
   */
  private async processGroup(items: NotificationQueueItem[]): Promise<void> {
    // Process in parallel for better performance
    await Promise.allSettled(
      items.map(item => this.processItem(item))
    );
  }

  /**
   * Process single notification
   */
  private async processItem(item: NotificationQueueItem): Promise<void> {
    try {
      // Simulate notification delivery
      // In production, this would call actual notification service
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Notification delivered: ${item.notification.type} to ${item.notification.pilgrimId}`);
    } catch (error) {
      console.error('Error processing notification:', error);
      
      // Retry if under max retries
      if (item.retries < this.config.maxRetries) {
        item.retries++;
        this.queue.push(item);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueLength: number;
    processing: boolean;
    batchSize: number;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      batchSize: this.config.batchSize,
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
    this.stop();
  }
}

// Global processor instance
const notificationProcessor = new NotificationQueueProcessor();

export default notificationProcessor;
export { NotificationQueueProcessor };
