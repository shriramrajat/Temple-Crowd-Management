/**
 * Server-Sent Events (SSE) API Route for Density Updates
 * 
 * Streams real-time density readings to connected clients.
 * Requirements: 1.1, 4.4
 * Task: 12.1 - Set up SSE for real-time density updates
 */

import { NextRequest } from 'next/server';
import { getDensityMonitor } from '@/lib/crowd-risk/density-monitor';
import { getErrorHandler } from '@/lib/crowd-risk/error-handler';
import { verifyApiKey, verifyJWT } from '@/lib/crowd-risk/api-auth-middleware';
import { sseConnectionLimiter } from '@/lib/crowd-risk/rate-limiter';
import { Permission } from '@/lib/crowd-risk/types';
import { getAuthService } from '@/lib/crowd-risk/auth-service';

/**
 * GET handler for SSE density stream
 * 
 * Returns a ReadableStream that sends density updates in SSE format
 * Task 15.2: Add API key validation for SSE endpoints
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting for SSE connections
  const rateLimitResponse = sseConnectionLimiter.middleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Verify authentication (API key or JWT)
  const apiKey = verifyApiKey(request);
  const userId = verifyJWT(request);

  if (!apiKey && !userId) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Valid API key or authentication token required',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Check VIEW_ONLY permission
  if (apiKey && !apiKey.permissions.includes(Permission.VIEW_ONLY)) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'API key does not have VIEW_ONLY permission',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (userId) {
    const authService = getAuthService();
    const hasPermission = authService.checkPermission(userId, Permission.VIEW_ONLY);
    
    if (!hasPermission) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'User does not have VIEW_ONLY permission',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  const errorHandler = getErrorHandler();
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const densityMonitor = getDensityMonitor();
      
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));
      
      // Subscribe to density updates
      const unsubscribe = densityMonitor.onDensityUpdate((reading) => {
        try {
          const message = `data: ${JSON.stringify({ type: 'density', data: reading })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          errorHandler.handleDataStreamError(
            error instanceof Error ? error : new Error('Failed to send density update'),
            reading.areaId,
            { reading }
          );
        }
      });
      
      // Set up heartbeat to keep connection alive (every 30 seconds)
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `: heartbeat ${Date.now()}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch (error) {
          // Connection likely closed, clean up
          clearInterval(heartbeatInterval);
          unsubscribe();
        }
      }, 30000);
      
      // Handle client disconnection
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        controller.close();
      });
    },
  });
  
  // Return response with SSE headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
