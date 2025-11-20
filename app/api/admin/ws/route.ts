/**
 * WebSocket endpoint for real-time command center updates
 * 
 * Note: This is a mock implementation using Server-Sent Events (SSE) for development.
 * In production, you would use a proper WebSocket server with ws or socket.io
 * 
 * Requirements: 1.2, 2.1, 3.2, 4.3, 6.3
 */

import { 
  generateRandomZoneUpdate, 
  generateRandomAlert,
  generateMockWarnings 
} from '@/lib/mock-data/command-center-mock';
import { verifyAuthToken } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Extract token from Authorization header or URL parameter
  // EventSource doesn't support custom headers, so we accept token via URL
  const url = new URL(request.url);
  const urlToken = url.searchParams.get('token');
  const authHeader = request.headers.get('authorization');
  
  let token: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else if (urlToken) {
    token = urlToken;
  }

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Missing authentication token' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Verify token
  const session = await verifyAuthToken(token);

  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Verify admin role
  if (session.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const connectionMessage = {
        type: 'connection_status',
        payload: { status: 'connected' }
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(connectionMessage)}\n\n`)
      );

      // Set up intervals for different types of updates
      const zoneUpdateInterval = setInterval(() => {
        try {
          const update = generateRandomZoneUpdate();
          const message = {
            type: 'zone_update',
            payload: update
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        } catch (error) {
          console.error('Error generating zone update:', error);
        }
      }, 5000); // Every 5 seconds

      const alertInterval = setInterval(() => {
        try {
          // 30% chance to generate an alert
          if (Math.random() < 0.3) {
            const alert = generateRandomAlert();
            const message = {
              type: 'alert',
              payload: alert
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
            );
          }
        } catch (error) {
          console.error('Error generating alert:', error);
        }
      }, 10000); // Every 10 seconds

      const warningInterval = setInterval(() => {
        try {
          // 20% chance to generate warnings
          if (Math.random() < 0.2) {
            const warnings = generateMockWarnings();
            if (warnings.length > 0) {
              const warning = warnings[Math.floor(Math.random() * warnings.length)];
              const message = {
                type: 'warning',
                payload: warning
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
              );
            }
          }
        } catch (error) {
          console.error('Error generating warning:', error);
        }
      }, 15000); // Every 15 seconds

      // Keep-alive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (error) {
          console.error('Error sending keep-alive:', error);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(zoneUpdateInterval);
        clearInterval(alertInterval);
        clearInterval(warningInterval);
        clearInterval(keepAliveInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
