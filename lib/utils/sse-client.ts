/**
 * Server-Sent Events (SSE) Client Utility
 * 
 * Provides a WebSocket-like interface for SSE connections
 * Used for real-time updates in development environment
 */

export type SSEMessageHandler = (data: any) => void;
export type SSEErrorHandler = (error: Event) => void;
export type SSEOpenHandler = () => void;
export type SSECloseHandler = () => void;

export interface SSEClientOptions {
  url: string;
  token?: string;
  onMessage?: SSEMessageHandler;
  onError?: SSEErrorHandler;
  onOpen?: SSEOpenHandler;
  onClose?: SSECloseHandler;
}

/**
 * SSE Client that mimics WebSocket interface
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private url: string;
  private token?: string;
  private onMessageHandler?: SSEMessageHandler;
  private onErrorHandler?: SSEErrorHandler;
  private onOpenHandler?: SSEOpenHandler;
  private onCloseHandler?: SSECloseHandler;
  private isClosed = false;

  constructor(options: SSEClientOptions) {
    this.url = options.url;
    this.token = options.token;
    this.onMessageHandler = options.onMessage;
    this.onErrorHandler = options.onError;
    this.onOpenHandler = options.onOpen;
    this.onCloseHandler = options.onClose;
  }

  /**
   * Connect to SSE endpoint
   */
  connect(): void {
    if (this.eventSource) {
      return;
    }

    try {
      // Add token to URL if provided
      const url = this.token 
        ? `${this.url}?token=${this.token}`
        : this.url;

      // Create EventSource with authorization header
      const headers: Record<string, string> = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      // Note: EventSource doesn't support custom headers in browser
      // Token must be passed via URL or cookies
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[SSE] Connected');
        this.onOpenHandler?.();
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Error:', error);
        this.onErrorHandler?.(error);
        
        // EventSource automatically reconnects, but we track errors
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.handleClose();
        }
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageHandler?.(data);
        } catch (err) {
          console.error('[SSE] Failed to parse message:', err);
        }
      };

    } catch (err) {
      console.error('[SSE] Failed to create connection:', err);
      this.onErrorHandler?.(err as Event);
    }
  }

  /**
   * Close SSE connection
   */
  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isClosed = true;
      this.handleClose();
    }
  }

  /**
   * Handle connection close
   */
  private handleClose(): void {
    if (!this.isClosed) {
      this.isClosed = true;
      this.onCloseHandler?.();
    }
  }

  /**
   * Check if connection is open
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Get connection state
   */
  getReadyState(): number {
    if (!this.eventSource) {
      return EventSource.CLOSED;
    }
    return this.eventSource.readyState;
  }
}

/**
 * Create SSE client with WebSocket-like interface
 */
export function createSSEClient(url: string, token?: string): {
  connect: () => void;
  close: () => void;
  onMessage: (handler: SSEMessageHandler) => void;
  onError: (handler: SSEErrorHandler) => void;
  onOpen: (handler: SSEOpenHandler) => void;
  onClose: (handler: SSECloseHandler) => void;
  isConnected: () => boolean;
} {
  let messageHandler: SSEMessageHandler | undefined;
  let errorHandler: SSEErrorHandler | undefined;
  let openHandler: SSEOpenHandler | undefined;
  let closeHandler: SSECloseHandler | undefined;
  let client: SSEClient | null = null;

  return {
    connect: () => {
      client = new SSEClient({
        url,
        token,
        onMessage: (data) => messageHandler?.(data),
        onError: (error) => errorHandler?.(error),
        onOpen: () => openHandler?.(),
        onClose: () => closeHandler?.(),
      });
      client.connect();
    },
    close: () => {
      client?.close();
      client = null;
    },
    onMessage: (handler) => {
      messageHandler = handler;
    },
    onError: (handler) => {
      errorHandler = handler;
    },
    onOpen: (handler) => {
      openHandler = handler;
    },
    onClose: (handler) => {
      closeHandler = handler;
    },
    isConnected: () => {
      return client?.isConnected() ?? false;
    },
  };
}
