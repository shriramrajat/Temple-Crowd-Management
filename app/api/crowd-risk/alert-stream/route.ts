/**
 * Server-Sent Events (SSE) API Route for Alert Updates
 * 
 * Streams real-time alert events and emergency mode changes to connected clients.
 * Requirements: 2.1, 4.4
 * Task: 12.1 - Set up SSE for real-time alert updates
 */

import { NextRequest } from 'next/server';
import { getAlertEngine } from '@/lib/crowd-risk/alert-engine';
import { getEmergencyModeManager } from '@/lib/crowd-risk/emergency-mode-manager';
import { getErrorHandler } from '@/lib/crowd-risk/error-handler';
import { verifyApiKey, verifyJWT } from '@/lib/crowd-risk/api-auth-middleware';
import { sseConnectionLimiter } from '@/lib/crowd-risk/rate-limiter';
import { Permission } from '@/lib/crowd-risk/types';
import { getAuthService } from '@/lib/crowd-risk/auth-service';

/**
 * GET handler for SSE alert stream
 * 
 * Returns a ReadableStream that sends alert events and emergency mode changes in SSE format
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
      const alertEngine = getAlertEngine();
      const emergencyManager = getEmergencyModeManager();
      
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));
      
      // Send current emergency mode state
      const emergencyState = emergencyManager.getEmergencyState();
      if (emergencyState) {
        const emergencyMessage = `data: ${JSON.stringify({ type: 'emergency', data: emergencyState })}\n\n`;
        controller.enqueue(encoder.encode(emergencyMessage));
      }
      
      // Subscribe to alert events
      const unsubscribeAlerts = alertEngine.subscribeToAlerts((alert) => {
        try {
          const message = `data: ${JSON.stringify({ type: 'alert', data: alert })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          errorHandler.handleSystemError(
            error instanceof Error ? error : new Error('Failed to send alert update'),
            'alert-stream-send',
            { alertId: alert.id }
          );
        }
      });
      
      // Subscribe to emergency mode changes
      const unsubscribeEmergency = emergencyManager.onEmergencyStateChange((state) => {
        try {
          const message = `data: ${JSON.stringify({ type: 'emergency', data: state })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          errorHandler.handleSystemError(
            error instanceof Error ? error : new Error('Failed to send emergency mode update'),
            'emergency-stream-send',
            { state }
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
          unsubscribeAlerts();
          unsubscribeEmergency();
        }
      }, 30000);
      
      // Handle client disconnection
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribeAlerts();
        unsubscribeEmergency();
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
