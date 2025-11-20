/**
 * Connection Pool Manager
 * 
 * Provides connection pooling for SMS and email services to optimize delivery.
 * Task 17.2: Add connection pooling for SMS and email services
 */

import { NotificationChannel } from './types';

/**
 * Connection interface
 */
interface Connection {
  id: string;
  channel: NotificationChannel;
  inUse: boolean;
  createdAt: number;
  lastUsed: number;
}

/**
 * Connection pool configuration
 */
interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeoutMs: number;
  acquireTimeoutMs: number;
}

/**
 * Connection pool statistics
 */
interface PoolStats {
  total: number;
  available: number;
  inUse: number;
  created: number;
  destroyed: number;
  acquired: number;
  released: number;
  timeouts: number;
}

/**
 * ConnectionPool class
 * 
 * Manages a pool of connections for notification channels
 */
export class ConnectionPool {
  private pools: Map<NotificationChannel, Connection[]> = new Map();
  private config: PoolConfig;
  private stats: Map<NotificationChannel, PoolStats> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<PoolConfig>) {
    this.config = {
      minConnections: 2,
      maxConnections: 10,
      idleTimeoutMs: 5 * 60 * 1000, // 5 minutes
      acquireTimeoutMs: 5000, // 5 seconds
      ...config,
    };
    
    // Initialize pools for SMS, EMAIL, and PUSH channels
    this.initializePool(NotificationChannel.SMS);
    this.initializePool(NotificationChannel.EMAIL);
    this.initializePool(NotificationChannel.PUSH);
    
    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Initialize connection pool for a channel
   */
  private initializePool(channel: NotificationChannel): void {
    this.pools.set(channel, []);
    this.stats.set(channel, {
      total: 0,
      available: 0,
      inUse: 0,
      created: 0,
      destroyed: 0,
      acquired: 0,
      released: 0,
      timeouts: 0,
    });
    
    // Create minimum connections
    for (let i = 0; i < this.config.minConnections; i++) {
      this.createConnection(channel);
    }
  }

  /**
   * Create a new connection
   */
  private createConnection(channel: NotificationChannel): Connection {
    const connection: Connection = {
      id: `${channel}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channel,
      inUse: false,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };
    
    const pool = this.pools.get(channel)!;
    pool.push(connection);
    
    const stats = this.stats.get(channel)!;
    stats.created++;
    stats.total++;
    stats.available++;
    
    return connection;
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(channel: NotificationChannel): Promise<Connection> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.config.acquireTimeoutMs) {
      const pool = this.pools.get(channel);
      if (!pool) {
        throw new Error(`No pool found for channel: ${channel}`);
      }
      
      // Find available connection
      const available = pool.find(conn => !conn.inUse);
      
      if (available) {
        available.inUse = true;
        available.lastUsed = Date.now();
        
        const stats = this.stats.get(channel)!;
        stats.acquired++;
        stats.available--;
        stats.inUse++;
        
        return available;
      }
      
      // Try to create new connection if under max limit
      if (pool.length < this.config.maxConnections) {
        const newConn = this.createConnection(channel);
        newConn.inUse = true;
        
        const stats = this.stats.get(channel)!;
        stats.acquired++;
        stats.available--;
        stats.inUse++;
        
        return newConn;
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Timeout
    const stats = this.stats.get(channel)!;
    stats.timeouts++;
    
    throw new Error(`Timeout acquiring connection for channel: ${channel}`);
  }

  /**
   * Release a connection back to the pool
   */
  release(connection: Connection): void {
    connection.inUse = false;
    connection.lastUsed = Date.now();
    
    const stats = this.stats.get(connection.channel)!;
    stats.released++;
    stats.inUse--;
    stats.available++;
  }

  /**
   * Destroy a connection
   */
  private destroyConnection(connection: Connection): void {
    const pool = this.pools.get(connection.channel);
    if (!pool) return;
    
    const index = pool.indexOf(connection);
    if (index !== -1) {
      pool.splice(index, 1);
      
      const stats = this.stats.get(connection.channel)!;
      stats.destroyed++;
      stats.total--;
      
      if (connection.inUse) {
        stats.inUse--;
      } else {
        stats.available--;
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats(channel?: NotificationChannel): PoolStats | Map<NotificationChannel, PoolStats> {
    if (channel) {
      return this.stats.get(channel) || {
        total: 0,
        available: 0,
        inUse: 0,
        created: 0,
        destroyed: 0,
        acquired: 0,
        released: 0,
        timeouts: 0,
      };
    }
    return new Map(this.stats);
  }

  /**
   * Start cleanup timer to remove idle connections
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Run every minute
  }

  /**
   * Clean up idle connections
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [channel, pool] of this.pools.entries()) {
      // Find idle connections
      const idleConnections = pool.filter(
        conn => !conn.inUse && now - conn.lastUsed > this.config.idleTimeoutMs
      );
      
      // Keep minimum connections
      const canRemove = pool.length - idleConnections.length >= this.config.minConnections;
      
      if (canRemove) {
        idleConnections.forEach(conn => {
          this.destroyConnection(conn);
        });
      }
    }
  }

  /**
   * Drain the pool (close all connections)
   */
  async drain(): Promise<void> {
    // Wait for all connections to be released
    const maxWaitTime = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      let allReleased = true;
      
      for (const pool of this.pools.values()) {
        if (pool.some(conn => conn.inUse)) {
          allReleased = false;
          break;
        }
      }
      
      if (allReleased) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Destroy all connections
    for (const [channel, pool] of this.pools.entries()) {
      const connections = [...pool];
      connections.forEach(conn => {
        this.destroyConnection(conn);
      });
    }
  }

  /**
   * Destroy the pool and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear all pools
    this.pools.clear();
    this.stats.clear();
  }
}

/**
 * Singleton instance
 */
let connectionPoolInstance: ConnectionPool | null = null;

/**
 * Get the singleton ConnectionPool instance
 */
export function getConnectionPool(): ConnectionPool {
  if (!connectionPoolInstance) {
    connectionPoolInstance = new ConnectionPool();
  }
  return connectionPoolInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetConnectionPool(): void {
  if (connectionPoolInstance) {
    connectionPoolInstance.destroy();
  }
  connectionPoolInstance = null;
}
